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
            // user_id sebagai relasi ke tabel users (untuk requestor)
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            
            $table->string('room_name'); // Kendal, Semarang, Nusantara, Jakarta
            $table->date('booking_date');
            $table->time('start_time');
            $table->time('end_time');
            $table->string('topic');
            $table->string('address'); // Alamat
            $table->integer('attendant');
            $table->text('remarks')->nullable(); 
            $table->text('ttd')->nullable();
            $table->string('department'); // Disimpan sebagai path gambar atau base64
            
            // Status: waiting_approval, booked, rejected, free
            $table->string('status')->default('waiting_approval'); 
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('room_bookings');
    }
};