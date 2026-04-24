import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import axios from 'axios';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import { useState } from 'react';
import InteractiveFloorPlan from '@/Components/JokoUI/InteractiveFloorPlan';
import BookingModal from '@/Components/JokoUI/BookingModal';
import BookingHistory from '@/Components/JokoUI/BookingHistory'; // Import komponen riwayat

// Definisikan tipe untuk state agar TS tidak protes
interface SelectedAsset {
    id: string;
    name: string;
    type: 'room' | 'vehicle';
}

export default function Dashboard({ auth }: PageProps) {
    // State untuk aset yang dipilih
    const [selectedAsset, setSelectedAsset] = useState<SelectedAsset | null>(null);
    // State untuk mengontrol buka/tutup modal
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Fungsi saat peta diklik
    const handleAssetSelect = (id: string, name: string) => {
        // Tentukan tipe berdasarkan awalan ID (r = room, v = vehicle)
        const type = id.startsWith('v') ? 'vehicle' : 'room';
        
        setSelectedAsset({ id, name, type });
        setIsModalOpen(true); // Langsung buka modal
    };

    // Fungsi saat form disubmit
    const handleBookingSubmit = async (payload: any) => {
        try {
            let endpoint = '';
            let requestData = {};

            // 1. Pecah logika berdasarkan tipe aset (Ruang vs Mobil)
            if (payload.assetType === 'room') {
                endpoint = '/room-bookings';
                requestData = {
                    user_id: auth.user.id, // Otomatis ambil ID user yang sedang login
                    room_id: parseInt(payload.assetId.replace('r', '')), // Ubah 'r1' dari SVG menjadi angka 1
                    booking_date: payload.date,
                    start_time: payload.startTime,
                    end_time: payload.endTime,
                    topic: payload.topic,
                    attendant: 5, // Hardcode dulu, nanti bisa kamu tambah inputnya di Modal
                };
            } else {
                endpoint = '/vehicle-bookings';
                requestData = {
                    user_id: auth.user.id,
                    vehicle_id: parseInt(payload.assetId.replace('v', '')), // Ubah 'v1' jadi 1
                    start_date: payload.date,
                    departure_time: payload.startTime,
                    return_date: payload.date, // Asumsi pinjam mobil pulang-pergi di hari yang sama
                    return_time: payload.endTime,
                    driver_name: payload.topic, // Meminjam input topik untuk nama driver sementara
                };
            }

            // 2. Tembak API Backend Laravel
            const response = await axios.post(endpoint, requestData);

            // 3. Jika berhasil (Status 201 Created)
            alert(`✅ SUKSES: ${response.data.message}`);
            setIsModalOpen(false); // Tutup modal
            setSelectedAsset(null); // Reset pilihan denah
            
            // Opsional: Reload halaman agar riwayat langsung terupdate (bisa diganti dengan state management nanti)
            window.location.reload(); 

        } catch (error: any) {
            // 4. Tangkap Error Bentrok (Status 422 Unprocessable Entity)
            if (error.response && error.response.status === 422) {
                alert(`❌ DITOLAK: ${error.response.data.message || error.response.data.error}`);
            } else {
                alert("⚠️ Terjadi kesalahan sistem. Cek console log.");
                console.error("Detail Error:", error);
            }
        }
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-slate-800 leading-tight">Sistem Booking Sitoy</h2>}
        >
            <Head title="Dashboard" />

            <div className="py-12 bg-slate-50 min-h-screen">
                <div className="max-w-6xl mx-auto sm:px-6 lg:px-8 space-y-8">
                    
                    {/* Header Sapaan */}
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-3xl p-8 border border-slate-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                                    Selamat Datang
                                </h3>
                                <p className="text-slate-500 mt-2 text-lg">
                                    Silakan booking Tempat atau Kendaraan yang kosong.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Denah Interaktif */}
                    <div className="bg-white shadow-sm sm:rounded-3xl p-8 border border-slate-100">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-bold text-slate-800">Denah Kantor Interaktif</h3>
                        </div>
                        
                        <InteractiveFloorPlan onSelectAsset={handleAssetSelect} />
                    </div>

                    {/* Riwayat Peminjaman */}
                    <div className="bg-white shadow-sm sm:rounded-3xl p-8 border border-slate-100">
                        <div className="flex justify-between items-center mb-6">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">Riwayat Peminjaman Saya</h3>
                                <p className="text-sm text-slate-500 mt-1">Pantau status pengajuan asetmu di sini.</p>
                            </div>
                        </div>
                        
                        {/* Komponen Riwayat dipanggil di sini */}
                        <BookingHistory />
                    </div>

                </div>
            </div>

            {/* Modal selalu ditaruh di luar flow layout agar pop-up sempurna */}
            <BookingModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                asset={selectedAsset}
                onSubmit={handleBookingSubmit}
            />

        </AuthenticatedLayout>
    );
}