<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class UserController extends Controller
{
    public function store(Request $request)
    {
        // Proteksi Lapis Baja: Hanya Role Administrator yang diizinkan!
        if (auth()->user()->role !== 'administrator') {
            return response()->json([
                'message' => 'Akses ditolak! Hanya Administrator yang dapat menambahkan user baru.'
            ], 403);
        }

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

        return response()->json([
            'message' => 'Akun ' . $request->name . ' berhasil dibuat dengan role ' . strtoupper($request->role) . '!'
        ], 201);
    }
}