<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class RoomBooking extends Model
{
    use HasFactory;

    // Mengizinkan semua kolom diisi, kecuali 'id'
    protected $guarded = ['id'];

    // Relasi: Setiap booking dimiliki oleh 1 user
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // Relasi: Setiap booking merujuk ke 1 ruangan
    public function room()
    {
        return $this->belongsTo(Room::class);
    }
}