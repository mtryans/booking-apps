<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VehicleBooking;
use Illuminate\Http\Request;

class VehicleBookingController extends Controller
{
    /**
     * Menampilkan daftar riwayat peminjaman mobil untuk user yang login.
     */
    public function index()
    {
        // Ambil data milik user yang sedang login, urutkan dari yang paling baru dibuat
        $bookings = VehicleBooking::where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($bookings);
    }

    public function store(Request $request)
    {
        // 1. Validasi Input
        $validated = $request->validate([
            'user_id' => 'required|integer',
            'vehicle_id' => 'required|integer',
            'start_date' => 'required|date',
            'departure_time' => 'required|date_format:H:i',
            'return_date' => 'required|date|after_or_equal:start_date',
            'return_time' => 'required|date_format:H:i',
            'driver_name' => 'nullable|string',
        ]);

        // 2. Logika Cek Bentrok (Lintas Hari)
        $isConflict = VehicleBooking::where('vehicle_id', $request->vehicle_id)
            ->whereIn('status', ['waiting_approval', 'booked'])
            ->where(function ($query) use ($request) {
                // Syarat 1: Berangkat Baru < Pulang Lama
                $query->where('start_date', '<', $request->return_date)
                      ->orWhere(function ($q) use ($request) {
                          $q->where('start_date', '=', $request->return_date)
                            ->where('departure_time', '<', $request->return_time);
                      });
            })
            ->where(function ($query) use ($request) {
                // Syarat 2: Pulang Baru > Berangkat Lama
                $query->where('return_date', '>', $request->start_date)
                      ->orWhere(function ($q) use ($request) {
                          $q->where('return_date', '=', $request->start_date)
                            ->where('return_time', '>', $request->departure_time);
                      });
            })->exists();

        // Jika bentrok, tolak!
        if ($isConflict) {
            return response()->json([
                'message' => 'Maaf, kendaraan ini sudah dibooking pada rentang waktu tersebut.'
            ], 422);
        }

        // 3. Simpan jika aman
        $booking = VehicleBooking::create($validated);

        return response()->json([
            'message' => 'Peminjaman kendaraan berhasil diajukan!',
            'data' => $booking
        ], 201);
    }

    public function show(string $id) {}
    public function update(Request $request, string $id) {}
    public function destroy(string $id) {}
}