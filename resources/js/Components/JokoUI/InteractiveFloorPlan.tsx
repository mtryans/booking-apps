// resources/js/Components/JokoUI/InteractiveFloorPlan.tsx
import { useState } from 'react';

interface MapAsset {
    id: string; type: 'room' | 'vehicle';
    name: string; backendName: string;
    x: number; y: number; w: number; h: number; cap?: string;
}
interface InteractiveFloorPlanProps {
    onSelectAsset: (id: string, name: string) => void;
    availabilityData: any[];
    userRole?: string;
}

const GRAD_ID = 'fpGrad';

export default function InteractiveFloorPlan({ onSelectAsset, availabilityData, userRole }: InteractiveFloorPlanProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [hoveredId,  setHoveredId]  = useState<string | null>(null);
    const [mousePos,   setMousePos]   = useState({ x: 0, y: 0 });

    const baseAssets: MapAsset[] = [
        { id:'v1', type:'vehicle', name:'Innova Zenix',  backendName:'Toyota Zenix',  x:250, y:50,  w:140, h:60,  cap:''       },
        { id:'v2', type:'vehicle', name:'Alphard',       backendName:'Toyota Alphard', x:420, y:50,  w:140, h:60,  cap:'' },
        { id:'r1', type:'room',    name:'Kendal',        backendName:'Kendal',         x:150, y:220, w:120, h:140, cap:''              },
        { id:'r2', type:'room',    name:'Semarang',      backendName:'Semarang',       x:150, y:420, w:120, h:140, cap:''               },
        { id:'r3', type:'room',    name:'Nusantara',     backendName:'Nusantara',      x:450, y:150, w:180, h:220, cap:''       },
        { id:'r4', type:'room',    name:'Jakarta',       backendName:'Jakarta',        x:450, y:420, w:180, h:180, cap:''              },
    ];

    const assets = baseAssets.map(a => {
        const d = availabilityData.find(d => d.name === a.backendName);
        let status = 'available', labelText = a.type === 'room' ? 'Tersedia' : 'Di Garasi', bookings: any[] = [];
        if (d) { labelText = d.status_label; bookings = d.bookings || []; if (labelText.includes('OUT') || labelText.includes('Occupied')) status = 'booked'; }
        return { ...a, status, labelText, bookings };
    });

    const canViewPopup = userRole === 'approval' || userRole === 'administrator';
    const hoveredAsset = hoveredId ? assets.find(a => a.id === hoveredId) : null;

    const getRoomStyle = (asset: typeof assets[0]) => {
        const sel = selectedId === asset.id;
        const hov = hoveredId  === asset.id;
        const dim = !!(selectedId && selectedId !== asset.id);

        if (asset.type === 'vehicle') return {
            fill:        sel ? '#EDE9FE' : hov ? '#F5F3FF' : '#FDFCFF',
            stroke:      sel ? '#7C3AED' : hov ? '#A78BFA' : '#C4B5FD',
            sw:          sel ? 2.5 : 1.5,
            nameFill:    sel ? '#5B21B6' : '#6D28D9',
            subFill:     asset.status === 'booked' ? '#DC2626' : '#7C3AED',
            capFill:     '#A78BFA',
            opacity:     dim ? 0.3 : 1,
            shadow:      sel ? 'drop-shadow(0 6px 16px rgba(124,58,237,.25))' : hov ? 'drop-shadow(0 4px 10px rgba(124,58,237,.12))' : 'none',
        };
        if (asset.status === 'booked') return {
            fill:        sel ? '#FFF1F2' : hov ? '#FFF5F5' : '#FFFCFC',
            stroke:      sel ? '#DC2626' : hov ? '#F87171' : '#FECDD3',
            sw:          sel ? 2.5 : 1.5,
            nameFill:    '#DC2626',
            subFill:     '#EF4444',
            capFill:     '#FCA5A5',
            opacity:     dim ? 0.3 : 1,
            shadow:      sel ? 'drop-shadow(0 6px 16px rgba(220,38,38,.15))' : hov ? 'drop-shadow(0 4px 10px rgba(220,38,38,.08))' : 'none',
        };
        return {
            fill:        sel ? '#F5F3FF' : hov ? '#FAF8FF' : '#FDFCFF',
            stroke:      sel ? '#7C3AED' : hov ? '#C4B5FD' : '#DDD6FE',
            sw:          sel ? 2.5 : 1.5,
            nameFill:    sel ? '#5B21B6' : '#6D28D9',
            subFill:     '#059669',
            capFill:     '#A78BFA',
            opacity:     dim ? 0.3 : 1,
            shadow:      sel ? 'drop-shadow(0 6px 16px rgba(124,58,237,.2))' : hov ? 'drop-shadow(0 4px 10px rgba(124,58,237,.1))' : 'none',
        };
    };

    return (
        <div
            onMouseMove={e => setMousePos({ x: e.clientX, y: e.clientY })}
            style={{ background: 'linear-gradient(135deg,#F5F3FF 0%,#EDE9FE 50%,#F5F3FF 100%)', borderRadius: '20px', border: '1px solid #DDD6FE', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}
        >
            {/* decorative blobs */}
            <div style={{ position:'absolute', top:'-60px', right:'-60px', width:'220px', height:'220px', borderRadius:'50%', background:'radial-gradient(circle,rgba(167,139,250,.18),transparent 70%)', pointerEvents:'none' }}/>
            <div style={{ position:'absolute', bottom:'-40px', left:'-40px', width:'180px', height:'180px', borderRadius:'50%', background:'radial-gradient(circle,rgba(124,58,237,.1),transparent 70%)', pointerEvents:'none' }}/>

            {/* legend */}
            <div style={{ display:'flex', gap:'1.25rem', marginBottom:'1rem', position:'relative', zIndex:1 }}>
                {[['#059669','Tersedia'],['#DC2626','Terpakai'],['#7C3AED','Kendaraan']].map(([c,l]) => (
                    <div key={l} style={{ display:'flex', alignItems:'center', gap:'6px' }}>
                        <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:c, boxShadow:`0 0 6px ${c}60` }}/>
                        <span style={{ fontSize:'12px', color:'#6D28D9', fontWeight:500 }}>{l}</span>
                    </div>
                ))}
                {selectedId && <span style={{ marginLeft:'auto', fontSize:'11px', color:'#A78BFA', fontStyle:'italic' }}>Klik lagi untuk deselect</span>}
            </div>

            <svg viewBox="0 0 800 650" style={{ width:'100%', height:'auto', display:'block', position:'relative', zIndex:1 }}>
                <defs>
                    <linearGradient id={GRAD_ID} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%"   stopColor="#7C3AED"/>
                        <stop offset="100%" stopColor="#A855F7"/>
                    </linearGradient>
                    <style>{`
                        .room-g { animation: roomIn .45s cubic-bezier(.16,1,.3,1) both; }
                        #g-v1{animation-delay:.05s}#g-v2{animation-delay:.1s}
                        #g-r1{animation-delay:.15s}#g-r2{animation-delay:.2s}
                        #g-r3{animation-delay:.25s}#g-r4{animation-delay:.3s}
                        @keyframes roomIn { from{opacity:0;transform:scale(.88)} to{opacity:1;transform:scale(1)} }
                        .pulse-ring { animation: pulseRing 2.4s ease-out infinite; }
                        @keyframes pulseRing { 0%{r:3;opacity:.6} 100%{r:14;opacity:0} }
                    `}</style>
                </defs>

                {/* building shell */}
                <rect x="8" y="8" width="784" height="634" rx="18" fill="none" stroke="#DDD6FE" strokeWidth="1.5"/>

                {assets.map(asset => {
                    const c  = getRoomStyle(asset);
                    const cx = asset.x + asset.w / 2;
                    const cy = asset.y + asset.h / 2;
                    const sel = selectedId === asset.id;

                    return (
                        <g
                            key={asset.id}
                            id={`g-${asset.id}`}
                            className="room-g"
                            onClick={() => { const next = sel ? null : asset.id; setSelectedId(next); if (!sel) onSelectAsset(asset.id, asset.backendName); }}
                            onMouseEnter={() => setHoveredId(asset.id)}
                            onMouseLeave={() => setHoveredId(null)}
                            style={{ cursor:'pointer', opacity: c.opacity, transition:'opacity .25s ease' }}
                        >
                            <rect
                                x={asset.x} y={asset.y} width={asset.w} height={asset.h} rx={12}
                                fill={c.fill} stroke={c.stroke} strokeWidth={c.sw}
                                style={{ filter: c.shadow, transition:'all .25s cubic-bezier(.34,1.56,.64,1)' }}
                            />

                            {/* selected glow ring */}
                            {sel && (
                                <rect x={asset.x-3} y={asset.y-3} width={asset.w+6} height={asset.h+6} rx={15}
                                    fill="none" stroke="url(#fpGrad)" strokeWidth="1" opacity={0.4}
                                    style={{ animation:'ringPulse 1.8s ease-in-out infinite' }}
                                />
                            )}

                            {/* corner brackets when selected */}
                            {sel && (<>
                                <path d={`M${asset.x+18},${asset.y} L${asset.x},${asset.y} L${asset.x},${asset.y+18}`} fill="none" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round"/>
                                <path d={`M${asset.x+asset.w-18},${asset.y+asset.h} L${asset.x+asset.w},${asset.y+asset.h} L${asset.x+asset.w},${asset.y+asset.h-18}`} fill="none" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round"/>
                            </>)}

                            <text x={cx} y={cy - (asset.cap ? 10 : 5)} textAnchor="middle" dominantBaseline="middle"
                                fontSize={13} fontWeight={600} fill={c.nameFill} style={{ fontFamily:'inherit', pointerEvents:'none' }}>
                                {asset.name}
                            </text>
                            <text x={cx} y={cy + (asset.cap ? 10 : 8)} textAnchor="middle" dominantBaseline="middle"
                                fontSize={10.5} fill={c.subFill} style={{ fontFamily:'inherit', pointerEvents:'none' }}>
                                {asset.labelText}
                            </text>
                            {asset.cap && (
                                <text x={cx} y={cy + 26} textAnchor="middle" dominantBaseline="middle"
                                    fontSize={9.5} fill={c.capFill} style={{ fontFamily:'inherit', pointerEvents:'none' }}>
                                    {asset.cap}
                                </text>
                            )}

                            {/* pulse dot for available */}
                            {asset.status === 'available' && (<>
                                <circle cx={asset.x+asset.w-12} cy={asset.y+12} r={3} fill={asset.type==='vehicle'?'#7C3AED':'#059669'} className="pulse-ring" style={{ transformOrigin:`${asset.x+asset.w-12}px ${asset.y+12}px` }}/>
                                <circle cx={asset.x+asset.w-12} cy={asset.y+12} r={4} fill={asset.type==='vehicle'?'#7C3AED':'#059669'}/>
                            </>)}
                        </g>
                    );
                })}
            </svg>

            {/* hover popup admin */}
            {canViewPopup && hoveredAsset && (
                <div style={{
                    position:'fixed', top: mousePos.y+16, left: mousePos.x+16, zIndex:50,
                    background:'#FFFFFF', border:'1px solid #DDD6FE', borderTop:'3px solid #7C3AED',
                    borderRadius:'14px', padding:'14px 18px', width:'220px', pointerEvents:'none',
                    boxShadow:'0 20px 40px rgba(124,58,237,.15)',
                }}>
                    <div style={{ fontSize:'12px', fontWeight:700, color:'#5B21B6', marginBottom:'8px', paddingBottom:'8px', borderBottom:'1px solid #EDE9FE' }}>
                        Jadwal {hoveredAsset.name} hari ini
                    </div>
                    {hoveredAsset.bookings.length > 0
                        ? hoveredAsset.bookings.map((b:any,i:number) => (
                            <div key={i} style={{ background:'#FAF8FF', borderRadius:'8px', padding:'8px 10px', marginBottom:'6px', border:'1px solid #EDE9FE' }}>
                                <div style={{ fontSize:'12px', fontWeight:600, color:'#7C3AED' }}>{b.start_time||b.departure_time} – {b.end_time||b.return_time}</div>
                                <div style={{ fontSize:'11px', color:'#6D28D9', marginTop:'1px' }}>{b.topic||b.driver_name||'Digunakan'}</div>
                                <div style={{ fontSize:'10px', color:'#A78BFA', marginTop:'2px' }}>{b.department}{b.attendant?` · ${b.attendant} orang`:''}</div>
                            </div>
                        ))
                        : <div style={{ fontSize:'12px', color:'#A78BFA', textAlign:'center', fontStyle:'italic' }}>Tidak ada jadwal hari ini</div>
                    }
                </div>
            )}

            <style>{`
                @keyframes ringPulse { 0%,100%{opacity:.4} 50%{opacity:.15} }
            `}</style>
        </div>
    );
}
