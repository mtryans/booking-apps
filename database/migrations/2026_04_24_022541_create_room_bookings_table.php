<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('room_bookings', function (Blueprint $table) {
            $table->id();
            // user_id tetap foreign key karena tabel users pasti ada dari Breeze
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            
            $table->integer('room_id'); // ID dari React (Kendal = 1, Semarang = 2, dst)
            $table->date('booking_date');
            $table->time('start_time');
            $table->time('end_time');
            $table->string('topic');
            $table->integer('attendant');
            
            // Status default saat pertama kali booking
            $table->string('status')->default('waiting_approval'); 
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('room_bookings');
    }
};