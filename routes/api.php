<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\RoomBookingController;
use App\Http\Controllers\Api\VehicleBookingController;

Route::middleware('auth')->group(function () {
    // apiResource ini sudah otomatis memuat metode POST (store) dan GET (index)
    Route::apiResource('room-bookings', RoomBookingController::class);
    Route::apiResource('vehicle-bookings', VehicleBookingController::class);
});