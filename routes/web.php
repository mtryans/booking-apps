<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Api\RoomBookingController;
use App\Http\Controllers\Api\VehicleBookingController;
use App\Http\Controllers\UserController; // Import UserController baru
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// --- AKSES PUBLIK (DASHBOARD) ---
Route::get('/', function () {
    return Inertia::render('Dashboard');
})->name('dashboard');

Route::get('/rooms/availability', [RoomBookingController::class, 'availability']);
Route::get('/vehicles/availability', [VehicleBookingController::class, 'availability']);

// --- AKSES TERPROTEKSI (LOGIN REQUIRED) ---
Route::middleware('auth')->group(function () {
    
    // Manajemen User (Akan diproteksi khusus Administrator di dalam controllernya)
    Route::post('/users', [UserController::class, 'store'])->name('users.store');

    // Ruangan
    Route::get('/room-bookings', [RoomBookingController::class, 'index']);
    Route::post('/room-bookings', [RoomBookingController::class, 'store']);
    Route::patch('/room-bookings/{id}/approve', [RoomBookingController::class, 'approve']); 

    // Kendaraan
    Route::get('/vehicle-bookings', [VehicleBookingController::class, 'index']);
    Route::post('/vehicle-bookings', [VehicleBookingController::class, 'store']);
    Route::patch('/vehicle-bookings/{id}/approve', [VehicleBookingController::class, 'approve']); 

    // Profile
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';