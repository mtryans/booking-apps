<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicle_bookings', function (Blueprint $table) {
            $table->id();
            // Sama seperti ruangan, diikat ke user yang login
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            
            // ID dari React (Misal: v1 diubah jadi angka 1)
            $table->integer('vehicle_id'); 
            
            // Jadwal Berangkat & Pulang
            $table->date('start_date');
            $table->time('departure_time');
            $table->date('return_date');
            $table->time('return_time');
            
            // Nama Driver (Sesuai validasi di Controller: nullable/boleh kosong)
            $table->string('driver_name')->nullable();
            
            // Status default
            $table->string('status')->default('waiting_approval'); 
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicle_bookings');
    }
};