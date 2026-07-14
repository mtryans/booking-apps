<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VehicleBooking;
use Illuminate\Http\Request;
use Carbon\Carbon;

class VehicleBookingController extends Controller
{
    public function availability()
    {
        $vehicles = ['Toyota Alphard', 'Toyota Zenix'];
        $data = [];
        $nowDate = now()->toDateString();
        $nowTime = now()->format('H:i');  

        foreach ($vehicles as $vehicle) {
            // Ambil jadwal AKTIF hari ini untuk Hover Popup
            $bookings = VehicleBooking::where('vehicle_model', $vehicle)
                ->where('status', 'booked')
                ->whereDate('start_date', '<=', $nowDate)
                ->whereDate('return_date', '>=', $nowDate)
                ->orderBy('departure_time')
                ->get();

            $isOut = VehicleBooking::where('vehicle_model', $vehicle)
                ->where('status', 'booked')
                ->where(function($query) use ($nowDate, $nowTime) {
                    $query->where('start_date', '<', $nowDate)
                          ->orWhere(fn($q) => $q->where('start_date', '=', $nowDate)->where('departure_time', '<=', $nowTime));
                })
                ->where(function($query) use ($nowDate, $nowTime) {
                    $query->where('return_date', '>', $nowDate)
                          ->orWhere(fn($q) => $q->where('return_date', '=', $nowDate)->where('return_time', '>=', $nowTime));
                })->first();

            // Tambahkan 'bookings' ke dalam response API
            $data[] = [
                'name' => $vehicle,
                'status_label' => $isOut ? "OUT until " . Carbon::parse($isOut->return_date . ' ' . $isOut->return_time)->format('d M, H:i') : "AVAILABLE",
                'bookings' => $bookings
            ];
        }
        return response()->json($data);
    }

    public function index()
    {
        $user = auth()->user();
        if ($user->isAdmin() || $user->isApproval()) return response()->json(VehicleBooking::orderBy('created_at', 'desc')->get());
        return response()->json(VehicleBooking::where('user_id', $user->id)->orderBy('created_at', 'desc')->get());
    }

    public function store(Request $request)
    {
        if (auth()->user()->isGuest()) return response()->json(['message' => 'Role Guest tidak bisa booking.'], 403);
        
        $validated = $request->validate([
            'employee_nik' => 'required', 
            'vehicle_model' => 'required', 
            'department' => 'required|string', // Validasi Departemen Baru
            'vehicle_type' => 'required', 
            'plate_number' => 'required', 
            'start_date' => 'required|date', 
            'departure_time' => 'required',
            'return_date' => 'required|date', 
            'return_time' => 'required', 
            'driver_name' => 'nullable',
            'remarks' => 'nullable', 
            'ttd' => 'nullable',
        ]);
        
        $validated['user_id'] = auth()->id();
        $validated['status'] = 'waiting_approval';

        $isConflict = VehicleBooking::where('vehicle_model', $request->vehicle_model)->whereIn('status', ['waiting_approval', 'booked'])
            ->where(fn($q) => $q->where('start_date', '<', $request->return_date)->orWhere(fn($sq) => $sq->where('start_date', '=', $request->return_date)->where('departure_time', '<', $request->return_time)))
            ->where(fn($q) => $q->where('return_date', '>', $request->start_date)->orWhere(fn($sq) => $sq->where('return_date', '=', $request->start_date)->where('return_time', '>', $request->departure_time)))->exists();

        if ($isConflict) return response()->json(['message' => 'Kendaraan sudah dibooking pada jam tersebut.'], 422);

        VehicleBooking::create($validated);
        return response()->json(['message' => 'Berhasil diajukan!']);
    }

    public function approve(Request $request, $id)
    {
        $user = auth()->user();
        if (!$user->isAdmin() && !$user->isApproval()) return response()->json(['message' => 'Unauthorized'], 403);

        $request->validate(['status' => 'required|in:booked,rejected']);
        $booking = VehicleBooking::findOrFail($id);
        $booking->status = $request->status;
        $booking->save();
        return response()->json(['message' => 'Status peminjaman berhasil diperbarui!']);
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
        $booking = VehicleBooking::findOrFail($id);
        $user = auth()->user();

        if (!$this->canManage($booking, $user)) {
            return response()->json(['message' => 'Anda tidak berhak mengubah peminjaman ini.'], 403);
        }

        $validated = $request->validate([
            'employee_nik' => 'required',
            'vehicle_model' => 'required',
            'department' => 'required|string',
            'vehicle_type' => 'required',
            'plate_number' => 'required',
            'start_date' => 'required|date',
            'departure_time' => 'required',
            'return_date' => 'required|date',
            'return_time' => 'required',
            'driver_name' => 'nullable',
            'remarks' => 'nullable',
            'ttd' => 'nullable',
        ]);

        // Pengecekan bentrok jadwal kendaraan, exclude diri sendiri
        $isConflict = VehicleBooking::where('id', '!=', $booking->id)
            ->where('vehicle_model', $request->vehicle_model)->whereIn('status', ['waiting_approval', 'booked'])
            ->where(fn($q) => $q->where('start_date', '<', $request->return_date)->orWhere(fn($sq) => $sq->where('start_date', '=', $request->return_date)->where('departure_time', '<', $request->return_time)))
            ->where(fn($q) => $q->where('return_date', '>', $request->start_date)->orWhere(fn($sq) => $sq->where('return_date', '=', $request->start_date)->where('return_time', '>', $request->departure_time)))->exists();

        if ($isConflict) return response()->json(['message' => 'Kendaraan sudah dibooking pada jam tersebut.'], 422);

        $booking->update($validated);

        return response()->json(['message' => 'Peminjaman berhasil diperbarui!']);
    }

    public function destroy($id)
    {
        $booking = VehicleBooking::findOrFail($id);
        $user = auth()->user();

        if (!$this->canManage($booking, $user)) {
            return response()->json(['message' => 'Anda tidak berhak menghapus peminjaman ini.'], 403);
        }

        $booking->delete();
        return response()->json(['message' => 'Peminjaman berhasil dihapus.']);
    }
}