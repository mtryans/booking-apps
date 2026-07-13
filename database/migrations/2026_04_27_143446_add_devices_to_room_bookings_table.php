<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('room_bookings', function (Blueprint $table) {
            // Menambahkan kolom devices tipe JSON, posisinya diletakkan setelah 'attendant' agar rapi
            $table->json('devices')->nullable()->after('attendant');
        });
    }

    public function down(): void
    {
        Schema::table('room_bookings', function (Blueprint $table) {
            // Menghapus kolom jika kita melakukan rollback
            $table->dropColumn('devices');
        });
    }
};