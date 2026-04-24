<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RoomBooking;
use Illuminate\Http\Request;

class RoomBookingController extends Controller
{
    /**
     * Menampilkan daftar riwayat peminjaman ruangan untuk user yang login.
     */
    public function index()
    {
        // Ambil data milik user yang sedang login, urutkan dari yang paling baru dibuat
        $bookings = RoomBooking::where('user_id', auth()->id())
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($bookings);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // 1. Validasi Input Dasar
        $validated = $request->validate([
            'user_id' => 'required|integer',
            'room_id' => 'required|integer',
            'booking_date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'topic' => 'required|string',
            'attendant' => 'required|integer|min:1',
        ]);

        // 2. Logika Cek Bentrok (Murni Query Builder)
        $isConflict = RoomBooking::where('room_id', $request->room_id)
            ->where('booking_date', $request->booking_date)
            ->whereIn('status', ['waiting_approval', 'booked']) 
            ->where(function ($query) use ($request) {
                $query->where('start_time', '<', $request->end_time)
                      ->where('end_time', '>', $request->start_time);
            })->exists();

        // Jika bentrok, tolak request-nya
        if ($isConflict) {
            return response()->json([
                'message' => 'Maaf, ruangan sudah dibooking pada jam tersebut.'
            ], 422); 
        }

        // 3. Jika aman, simpan ke database
        $booking = RoomBooking::create($validated);

        return response()->json([
            'message' => 'Booking berhasil diajukan!',
            'data' => $booking
        ], 201); 
    }

    public function show(string $id) {}
    public function update(Request $request, string $id) {}
    public function destroy(string $id) {}
}