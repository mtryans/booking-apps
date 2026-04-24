import { useState } from 'react';

interface MapAsset {
    id: string;
    type: 'room' | 'vehicle';
    name: string;
    status: 'available' | 'booked';
    // Koordinat SVG (x, y, lebar, tinggi)
    x: number;
    y: number;
    w: number;
    h: number;
}

interface InteractiveFloorPlanProps {
    onSelectAsset: (id: string, name: string) => void;
}

export default function InteractiveFloorPlan({ onSelectAsset }: InteractiveFloorPlanProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    // Data aset berdasarkan sketsa tata letakmu
    const assets: MapAsset[] = [
        // Kendaraan (Atas)
        { id: 'v1', type: 'vehicle', name: 'Innova Zenix', status: 'available', x: 250, y: 50, w: 140, h: 60 },
        { id: 'v2', type: 'vehicle', name: 'Alphard', status: 'booked', x: 420, y: 50, w: 140, h: 60 },
        
        // Ruangan Kiri
        { id: 'r1', type: 'room', name: 'Kendal', status: 'available', x: 150, y: 220, w: 120, h: 140 },
        { id: 'r2', type: 'room', name: 'Semarang', status: 'available', x: 150, y: 420, w: 120, h: 140 },
        
        // Ruangan Kanan
        { id: 'r3', type: 'room', name: 'Nusantara', status: 'available', x: 450, y: 150, w: 180, h: 220 },
        { id: 'r4', type: 'room', name: 'Jakarta', status: 'available', x: 450, y: 420, w: 180, h: 180 },
    ];

    const handleClick = (asset: MapAsset) => {
        if (asset.status === 'booked') return;
        setSelectedId(asset.id);
        onSelectAsset(asset.id, asset.name);
    };

    return (
        <div className="w-full bg-slate-50 p-6 rounded-3xl border border-slate-200 shadow-inner relative overflow-x-auto">
            {/* Indikator Status Robin-style */}
            <div className="absolute top-6 left-6 flex space-x-4">
                <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-emerald-400 mr-2 shadow-sm"></div><span className="text-xs text-slate-600 font-medium">Tersedia</span></div>
                <div className="flex items-center"><div className="w-3 h-3 rounded-full bg-slate-300 mr-2 shadow-sm"></div><span className="text-xs text-slate-600 font-medium">Terisi</span></div>
            </div>

            {/* Kanvas Interaktif */}
            <svg viewBox="0 0 800 650" className="w-full h-auto min-w-[600px] drop-shadow-sm">
                {assets.map((asset) => {
                    const isSelected = selectedId === asset.id;
                    const isHovered = hoveredId === asset.id;
                    const isBooked = asset.status === 'booked';
                    
                    // Logika pewarnaan modern (Joko UI)
                    let fillClass = "fill-white";
                    let strokeClass = "stroke-slate-200";
                    
                    if (isBooked) {
                        fillClass = "fill-slate-100";
                        strokeClass = "stroke-slate-300";
                    } else if (isSelected) {
                        fillClass = "fill-blue-50";
                        strokeClass = "stroke-blue-500";
                    } else if (isHovered) {
                        fillClass = "fill-slate-50";
                        strokeClass = "stroke-slate-300";
                    }

                    return (
                        <g 
                            key={asset.id} 
                            className="transition-all duration-300 ease-in-out"
                            onClick={() => handleClick(asset)}
                            onMouseEnter={() => setHoveredId(asset.id)}
                            onMouseLeave={() => setHoveredId(null)}
                            style={{ cursor: isBooked ? 'not-allowed' : 'pointer' }}
                        >
                            {/* Kotak Fisik */}
                            <rect 
                                x={asset.x} 
                                y={asset.y} 
                                width={asset.w} 
                                height={asset.h} 
                                rx="12" // Radius lengkungan sudut
                                className={`stroke-[3px] transition-all duration-300 ${fillClass} ${strokeClass}`}
                                style={{
                                    filter: isSelected ? 'drop-shadow(0px 10px 15px rgba(59, 130, 246, 0.2))' : 
                                           (isHovered && !isBooked ? 'drop-shadow(0px 4px 6px rgba(0,0,0,0.05))' : 'none'),
                                    transform: isHovered && !isBooked ? 'translateY(-2px)' : 'translateY(0)',
                                    transformOrigin: `${asset.x + asset.w/2}px ${asset.y + asset.h/2}px`
                                }}
                            />
                            
                            {/* Teks Nama Aset */}
                            <text 
                                x={asset.x + (asset.w / 2)} 
                                y={asset.y + (asset.h / 2) - 4} 
                                textAnchor="middle" 
                                dominantBaseline="middle"
                                className={`text-sm font-bold pointer-events-none transition-colors 
                                    ${isBooked ? 'fill-slate-400' : 'fill-slate-700'} 
                                    ${isSelected ? 'fill-blue-700' : ''}`
                                }
                            >
                                {asset.name}
                            </text>

                            {/* Label Kapasitas / Tipe (Opsional, untuk kosmetik) */}
                            <text 
                                x={asset.x + (asset.w / 2)} 
                                y={asset.y + (asset.h / 2) + 16} 
                                textAnchor="middle" 
                                dominantBaseline="middle"
                                className={`text-[10px] font-medium pointer-events-none ${isBooked ? 'fill-slate-400' : 'fill-emerald-500'} ${isSelected ? 'fill-blue-500' : ''}`}
                            >
                                {asset.type === 'room' ? (isBooked ? 'Tidak Tersedia' : 'Ruang Rapat') : (isBooked ? 'Keluar' : 'Siap Pakai')}
                            </text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}