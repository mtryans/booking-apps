<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\RoomBooking;
use Illuminate\Http\Request;
use Carbon\Carbon;

class RoomBookingController extends Controller
{
    public function availability()
    {
        $rooms = ['Kendal', 'Semarang', 'Nusantara', 'Jakarta'];
        $data = [];
        $nowDate = now()->toDateString();
        $currentTime = now()->format('H:i:s'); 

        foreach ($rooms as $room) {
            // Ambil SEMUA jadwal hari ini untuk ditampilkan di Pop-up Hover
            $bookings = RoomBooking::where('room_name', $room)
                ->where('booking_date', $nowDate)
                ->where('status', 'booked')
                ->orderBy('start_time')
                ->get();

            $status = "Available All Day";
            if ($bookings->isNotEmpty()) {
                $current = $bookings->first(fn($b) => $currentTime >= $b->start_time && $currentTime < $b->end_time);
                if ($current) {
                    $status = "Occupied until " . Carbon::parse($current->end_time)->format('H:i');
                } else {
                    $last = $bookings->last();
                    if ($currentTime < $last->end_time) {
                        $status = "Available from " . Carbon::parse($last->end_time)->format('H:i');
                    } else {
                        $status = "Available All Day";
                    }
                }
            }
            // Tambahkan 'bookings' ke dalam response API
            $data[] = ['name' => $room, 'status_label' => $status, 'bookings' => $bookings];
        }
        return response()->json($data);
    }

    public function index()
    {
        $user = auth()->user();
        if ($user->isAdmin() || $user->isApproval()) {
            return response()->json(RoomBooking::orderBy('created_at', 'desc')->get());
        }
        return response()->json(RoomBooking::where('user_id', $user->id)->orderBy('created_at', 'desc')->get());
    }

    public function store(Request $request)
    {
        if (auth()->user()->isGuest()) return response()->json(['message' => 'Role Guest tidak bisa booking.'], 403);
        
        $validated = $request->validate([
            'room_name' => 'required', 
            'department' => 'required|string', 
            'booking_date' => 'required|date', 
            'start_time' => 'required',
            'end_time' => 'required|after:start_time', 
            'topic' => 'required', 
            'attendant' => 'required|integer', 
            'devices' => 'nullable|array', // Validasi input array perangkat
            'remarks' => 'nullable', 
            'ttd' => 'nullable',
        ]);

        $requestedDevices = $request->devices ?? [];

        // 1. Logika Khusus Polycomp (Hanya Jakarta)
        if (in_array('polycomp', $requestedDevices) && $request->room_name !== 'Jakarta') {
            return response()->json(['message' => 'Perangkat Polycomp hanya tersedia untuk Jakarta Room.'], 422);
        }

        // 2. Logika Resource Locking (Shared Devices: Laptop & Camera)
        $sharedDevices = array_intersect(['laptop', 'camera'], $requestedDevices);

        if (!empty($sharedDevices)) {
            foreach ($sharedDevices as $device) {
                // Cek apakah perangkat sedang digunakan di ruangan mana pun
                $isDeviceBusy = RoomBooking::where('booking_date', $request->booking_date)
                    ->whereIn('status', ['waiting_approval', 'booked'])
                    ->whereJsonContains('devices', $device) 
                    ->where(function ($q) use ($request) {
                        $q->where('start_time', '<', $request->end_time)
                          ->where('end_time', '>', $request->start_time);
                    })->exists();

                if ($isDeviceBusy) {
                    $namaPerangkat = ucfirst($device);
                    return response()->json(['message' => "Maaf, perangkat $namaPerangkat sedang digunakan di ruangan lain pada jam tersebut."], 422);
                }
            }
        }
        
        $validated['user_id'] = auth()->id();
        $validated['status'] = 'waiting_approval';
        $validated['address'] = '-'; 
        $validated['devices'] = $requestedDevices; // Menyimpan array perangkat ke JSON DB

        // Pengecekan Bentrok Ruangan Utama
        $isConflict = RoomBooking::where('room_name', $request->room_name)->where('booking_date', $request->booking_date)
            ->whereIn('status', ['waiting_approval', 'booked'])
            ->where(fn($q) => $q->where('start_time', '<', $request->end_time)->where('end_time', '>', $request->start_time))->exists();

        if ($isConflict) return response()->json(['message' => 'Ruangan sudah dibooking pada jam tersebut.'], 422);

        RoomBooking::create($validated);
        return response()->json(['message' => 'Berhasil diajukan!']);
    }

    public function approve(Request $request, $id)
    {
        $user = auth()->user();
        if (!$user->isAdmin() && !$user->isApproval()) return response()->json(['message' => 'Unauthorized'], 403);

        $request->validate(['status' => 'required|in:booked,rejected']);
        $booking = RoomBooking::findOrFail($id);
        $booking->status = $request->status;
        $booking->save();
        return response()->json(['message' => 'Status berhasil diperbarui!']);
    }

    // Cek hak akses: pemilik booking (selama masih waiting_approval) ATAU admin/approval
    private function canManage($booking, $user)
    {
        $isOwnerPending = $booking->user_id === $user->id && $booking->status === 'waiting_approval';
        $isPrivileged = $user->isAdmin() || $user->isApproval();
        return $isOwnerPending || $isPrivileged;
    }

    public function update(Request $request, $id)
    {
        $booking = RoomBooking::findOrFail($id);
        $user = auth()->user();

        if (!$this->canManage($booking, $user)) {
            return response()->json(['message' => 'Anda tidak berhak mengubah booking ini.'], 403);
        }

        $validated = $request->validate([
            'room_name' => 'required',
            'department' => 'required|string',
            'booking_date' => 'required|date',
            'start_time' => 'required',
            'end_time' => 'required|after:start_time',
            'topic' => 'required',
            'attendant' => 'required|integer',
            'devices' => 'nullable|array',
            'remarks' => 'nullable',
            'ttd' => 'nullable',
        ]);

        $requestedDevices = $request->devices ?? [];

        // 1. Logika Khusus Polycomp (Hanya Jakarta)
        if (in_array('polycomp', $requestedDevices) && $request->room_name !== 'Jakarta') {
            return response()->json(['message' => 'Perangkat Polycomp hanya tersedia untuk Jakarta Room.'], 422);
        }

        // 2. Logika Resource Locking (Shared Devices: Laptop & Camera), exclude diri sendiri
        $sharedDevices = array_intersect(['laptop', 'camera'], $requestedDevices);
        if (!empty($sharedDevices)) {
            foreach ($sharedDevices as $device) {
                $isDeviceBusy = RoomBooking::where('id', '!=', $booking->id)
                    ->where('booking_date', $request->booking_date)
                    ->whereIn('status', ['waiting_approval', 'booked'])
                    ->whereJsonContains('devices', $device)
                    ->where(function ($q) use ($request) {
                        $q->where('start_time', '<', $request->end_time)
                          ->where('end_time', '>', $request->start_time);
                    })->exists();

                if ($isDeviceBusy) {
                    $namaPerangkat = ucfirst($device);
                    return response()->json(['message' => "Maaf, perangkat $namaPerangkat sedang digunakan di ruangan lain pada jam tersebut."], 422);
                }
            }
        }

        // 3. Pengecekan Bentrok Ruangan Utama, exclude diri sendiri
        $isConflict = RoomBooking::where('id', '!=', $booking->id)
            ->where('room_name', $request->room_name)->where('booking_date', $request->booking_date)
            ->whereIn('status', ['waiting_approval', 'booked'])
            ->where(fn($q) => $q->where('start_time', '<', $request->end_time)->where('end_time', '>', $request->start_time))->exists();

        if ($isConflict) return response()->json(['message' => 'Ruangan sudah dibooking pada jam tersebut.'], 422);

        $validated['devices'] = $requestedDevices;
        $booking->update($validated);

        return response()->json(['message' => 'Booking berhasil diperbarui!']);
    }

    public function destroy($id)
    {
        $booking = RoomBooking::findOrFail($id);
        $user = auth()->user();

        if (!$this->canManage($booking, $user)) {
            return response()->json(['message' => 'Anda tidak berhak menghapus booking ini.'], 403);
        }

        $booking->delete();
        return response()->json(['message' => 'Booking berhasil dihapus.']);
    }
}