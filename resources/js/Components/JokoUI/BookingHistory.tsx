import { useState, useEffect } from 'react';
import axios from 'axios';

interface Booking {
    id: number;
    topic?: string; // Untuk Ruangan
    driver_name?: string; // Untuk Kendaraan
    booking_date?: string;
    start_date?: string;
    status: 'waiting_approval' | 'booked' | 'rejected';
    created_at: string;
}

export default function BookingHistory() {
    const [tab, setTab] = useState<'room' | 'vehicle'>('room');
    const [data, setData] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const endpoint = tab === 'room' ? '/room-bookings' : '/vehicle-bookings';
            const response = await axios.get(endpoint);
            setData(response.data);
        } catch (error) {
            console.error("Gagal mengambil riwayat:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [tab]);

    const getStatusStyle = (status: string) => {
        switch(status) {
            case 'booked': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'rejected': return 'bg-rose-100 text-rose-700 border-rose-200';
            default: return 'bg-amber-100 text-amber-700 border-amber-200';
        }
    };

    const getStatusLabel = (status: string) => {
        switch(status) {
            case 'booked': return 'Disetujui';
            case 'rejected': return 'Ditolak';
            default: return 'Menunggu';
        }
    };

    return (
        <div className="space-y-6">
            {/* Tab Switcher */}
            <div className="flex p-1 bg-slate-100 rounded-2xl w-fit">
                <button 
                    onClick={() => setTab('room')}
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'room' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Ruangan
                </button>
                <button 
                    onClick={() => setTab('vehicle')}
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'vehicle' ? 'bg-white shadow-sm text-emerald-600' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    Kendaraan
                </button>
            </div>

            {/* List Data */}
            <div className="grid gap-4">
                {loading ? (
                    <div className="p-8 text-center text-slate-400 animate-pulse">Memuat riwayat...</div>
                ) : data.length === 0 ? (
                    <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400">
                        Belum ada riwayat peminjaman.
                    </div>
                ) : (
                    data.map((item) => (
                        <div key={item.id} className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between hover:shadow-md transition-shadow">
                            <div className="flex items-center space-x-4">
                                <div className={`p-3 rounded-2xl ${tab === 'room' ? 'bg-blue-50 text-blue-500' : 'bg-emerald-50 text-emerald-500'}`}>
                                    {tab === 'room' ? (
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                                    ) : (
                                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800">{item.topic || item.driver_name}</h4>
                                    <p className="text-xs text-slate-400 font-medium">{item.booking_date || item.start_date}</p>
                                </div>
                            </div>
                            
                            <div className={`px-4 py-1.5 rounded-full text-xs font-bold border ${getStatusStyle(item.status)}`}>
                                {getStatusLabel(item.status)}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}