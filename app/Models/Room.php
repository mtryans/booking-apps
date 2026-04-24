<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Room extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    // Otomatis mengubah JSON dari database menjadi Array di PHP
    protected $casts = [
        'facilities' => 'array',
    ];

    // Relasi: 1 Ruangan bisa memiliki banyak riwayat booking
    public function bookings()
    {
        return $this->hasMany(RoomBooking::class);
    }
}
