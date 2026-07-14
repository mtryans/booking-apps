<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;

class UserController extends Controller
{
    // 1. Tampilkan List User
    public function index()
    {
        if (auth()->user()->role !== 'administrator') abort(403, 'Akses Ditolak.');
        
        $users = User::orderBy('id', 'desc')->get();
        return Inertia::render('Users/Index', ['users' => $users]);
    }

    // 2. Simpan User Baru (Dari kodemu yang sudah disesuaikan untuk Inertia)
    public function store(Request $request)
    {
        // Proteksi Lapis Baja: Hanya Role Administrator yang diizinkan!
        if (auth()->user()->role !== 'administrator') abort(403, 'Akses ditolak! Hanya Administrator yang dapat menambahkan user baru.');

        // Validasi Input
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', Password::defaults()],
            'role' => 'required|in:administrator,approval,requester,guest',
        ], [
            'email.unique' => 'Email ini sudah terdaftar di sistem.',
        ]);

        // Buat User Baru
        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
        ]);

        // Redirect kembali ke halaman list user (standar Inertia)
        return redirect()->route('users.index');
    }

    // 3. Tampilkan Form Edit User
    public function edit(User $user)
    {
        if (auth()->user()->role !== 'administrator') abort(403, 'Akses Ditolak.');
        
        return Inertia::render('Users/Edit', ['user' => $user]);
    }

    // 4. Simpan Perubahan Edit
    public function update(Request $request, User $user)
    {
        if (auth()->user()->role !== 'administrator') abort(403, 'Akses Ditolak.');
        
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,'.$user->id,
            'role' => 'required|string',
        ]);

        $user->update($request->only('name', 'email', 'role'));
        
        return redirect()->route('users.index');
    }

    // 5. Hapus User
    public function destroy(User $user)
    {
        if (auth()->user()->role !== 'administrator') abort(403, 'Akses Ditolak.');
        if (auth()->id() === $user->id) abort(403, 'Tidak bisa menghapus diri sendiri.');
        
        $user->delete();
        
        return redirect()->route('users.index');
    }
}