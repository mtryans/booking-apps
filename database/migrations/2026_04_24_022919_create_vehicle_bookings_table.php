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
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            
            $table->string('employee_nik');
            $table->string('vehicle_model'); // Toyota Alphard, Toyota Zenix
            $table->string('vehicle_type'); // Jenis kendaraan
            $table->string('plate_number'); // Plat nomor
            
            // Jadwal
            $table->date('start_date');
            $table->time('departure_time');
            $table->date('return_date');
            $table->time('return_time');
            
            $table->string('driver_name')->nullable();
            $table->text('remarks')->nullable();
            $table->text('ttd')->nullable();
            $table->string('department');
            
            // Status: waiting_approval, booked, rejected, free
            $table->string('status')->default('waiting_approval'); 
            
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicle_bookings');
    }
};