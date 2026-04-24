import { useState } from 'react';

// Blueprint (Interface)
interface BookingModalProps {
    isOpen: boolean;
    onClose: () => void;
    asset: { id: string; name: string; type: 'room' | 'vehicle' } | null;
    onSubmit: (data: any) => void;
}

export default function BookingModal({ isOpen, onClose, asset, onSubmit }: BookingModalProps) {
    // State untuk form
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [topic, setTopic] = useState('');

    if (!isOpen || !asset) return null; // Jangan render apa-apa kalau tidak dibuka

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Kumpulkan data untuk dikirim ke API
        const payload = {
            assetId: asset.id,
            assetType: asset.type,
            date,
            startTime,
            endTime,
            topic
        };
        
        onSubmit(payload);
    };

    return (
        // Latar Belakang Gelap (Overlay)
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300">
            
            {/* Kotak Modal Putih */}
            <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-fade-in-up">
                
                {/* Header Modal */}
                <div className={`p-6 text-white ${asset.type === 'room' ? 'bg-blue-600' : 'bg-emerald-600'}`}>
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium opacity-80 uppercase tracking-wider mb-1">
                                Form Peminjaman
                            </p>
                            <h2 className="text-2xl font-extrabold">{asset.name}</h2>
                        </div>
                        {/* Tombol Tutup (X) */}
                        <button 
                            onClick={onClose}
                            className="p-2 rounded-full hover:bg-white/20 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Body Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    
                    {/* Input Topik (Khusus Ruangan) / Tujuan (Mobil) */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">
                            {asset.type === 'room' ? 'Topik Meeting' : 'Tujuan Perjalanan'}
                        </label>
                        <input 
                            type="text" 
                            required
                            value={topic}
                            onChange={(e) => setTopic(e.target.value)}
                            placeholder={asset.type === 'room' ? 'Misal: Monthly Review' : 'Misal: Kunjungan Pabrik Kendal'}
                            className="w-full border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all px-4 py-3 bg-slate-50"
                        />
                    </div>

                    {/* Input Tanggal */}
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Tanggal</label>
                        <input 
                            type="date" 
                            required
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all px-4 py-3 bg-slate-50"
                        />
                    </div>

                    {/* Input Jam (Grid Sebelahan) */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Jam Mulai</label>
                            <input 
                                type="time" 
                                required
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all px-4 py-3 bg-slate-50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-1">Jam Selesai</label>
                            <input 
                                type="time" 
                                required
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="w-full border-slate-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all px-4 py-3 bg-slate-50"
                            />
                        </div>
                    </div>

                    {/* Footer Form (Tombol Submit) */}
                    <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                        >
                            Batal
                        </button>
                        <button 
                            type="submit" 
                            className={`px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-md transition-all hover:-translate-y-0.5 ${asset.type === 'room' ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-blue-200' : 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-emerald-200'}`}
                        >
                            Ajukan Peminjaman
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}