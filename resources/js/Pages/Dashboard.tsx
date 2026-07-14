// resources/js/Pages/Dashboard.tsx
import axios from 'axios';
import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import InteractiveFloorPlan from '@/Components/JokoUI/InteractiveFloorPlan';
import BookingModal        from '@/Components/JokoUI/BookingModal';
import BookingHistory      from '@/Components/JokoUI/BookingHistory';

const T = {
    bg:'#F5F3FF', surface:'#FFFFFF', surface2:'#FAF8FF',
    border:'#E9D5FF', borderStrong:'#C4B5FD',
    purple:'#7C3AED', violetDark:'#5B21B6',
    textPrimary:'#1E0A4A', textSecondary:'#6D28D9', textMuted:'#A78BFA',
    rose:'#DC2626', roseBg:'#FFF1F2',
    amber:'#D97706', amberBg:'#FFFBEB',
};

export default function Dashboard({ auth }: PageProps) {
    const [selectedAsset,    setSelectedAsset]    = useState<any|null>(null);
    const [isModalOpen,      setIsModalOpen]      = useState(false);
    const [assetAvailability,setAssetAvailability]= useState<any[]>([]);
    const [mounted,          setMounted]          = useState(false);

    useEffect(()=>{ setMounted(true); fetchAvailability(); },[]);

    const fetchAvailability=async()=>{
        try{
            const [rooms,vehicles]=await Promise.all([axios.get('/rooms/availability'),axios.get('/vehicles/availability')]);
            setAssetAvailability([...rooms.data,...vehicles.data]);
        }catch(e){console.error('Gagal memuat status aset:',e);}
    };

    const handleAssetSelect=(id:string,name:string)=>{
        if(!auth.user){alert('Silakan Login terlebih dahulu.');window.location.href=route('login');return;}
        if(auth.user.role==='guest'){alert('Akun Anda berstatus Guest. Hubungi Administrator.');return;}
        setSelectedAsset({id,name,type:id.startsWith('v')?'vehicle':'room'});
        setIsModalOpen(true);
    };

    const handleBookingSubmit=async(payload:any)=>{
        if(!selectedAsset)return;
        try{
            const ep=selectedAsset.type==='room'?'/room-bookings':'/vehicle-bookings';
            const res=await axios.post(ep,payload);
            alert(`✅ SUKSES: ${res.data.message}`);
            setIsModalOpen(false);setSelectedAsset(null);window.location.reload();
        }catch(err:any){
            if(err.response?.status===422)alert(`❌ DITOLAK: ${err.response.data.message}`);
            else alert('⚠️ Terjadi kesalahan.');
        }
    };

    return(
        <div style={{minHeight:'100vh',background:'linear-gradient(160deg,#F5F3FF 0%,#EDE9FE 40%,#F5F3FF 100%)',padding:'2rem 0',opacity:mounted?1:0,transition:'opacity .4s ease'}}>
            <Head title="Asset Management Center"/>

            {/* global animations */}
            <style>{`
                @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
                @keyframes slideDown{from{opacity:0;transform:translateY(-16px)}to{opacity:1;transform:translateY(0)}}
                .anim-fadeup{animation:fadeUp .5s cubic-bezier(.16,1,.3,1) both}
                .anim-slidedown{animation:slideDown .45s cubic-bezier(.16,1,.3,1) both}
                .card-hover{transition:box-shadow .25s,transform .25s cubic-bezier(.34,1.56,.64,1)}
                .card-hover:hover{box-shadow:0 12px 36px rgba(124,58,237,.12);transform:translateY(-2px)}
                ::-webkit-scrollbar{width:6px} ::-webkit-scrollbar-track{background:#F5F3FF} ::-webkit-scrollbar-thumb{background:#C4B5FD;border-radius:3px}
            `}</style>

            <div style={{maxWidth:'80rem',margin:'0 auto',padding:'0 1.5rem',display:'flex',flexDirection:'column',gap:'1.75rem'}}>

                {/* ── HEADER ── */}
                <header className="anim-slidedown" style={{background:T.surface,borderRadius:'24px',border:`1px solid ${T.border}`,padding:'1.5rem 2rem',display:'flex',justifyContent:'space-between',alignItems:'center',gap:'1rem',boxShadow:'0 4px 24px rgba(124,58,237,.08)',position:'relative',overflow:'hidden'}}>
                    {/* purple gradient blob top-right */}
                    <div style={{position:'absolute',top:'-40px',right:'-40px',width:'180px',height:'180px',borderRadius:'50%',background:'radial-gradient(circle,rgba(167,139,250,.2),transparent 70%)',pointerEvents:'none'}}/>

                    <div style={{position:'relative',zIndex:1}}>
                        <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'4px'}}>
                            <div style={{width:'3px',height:'22px',background:'linear-gradient(180deg,#7C3AED,#A855F7)',borderRadius:'2px'}}/>
                            <span style={{fontSize:'11px',fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:T.textMuted}}>Asset Management Center</span>
                        </div>
                        <h1 style={{fontSize:'26px',fontWeight:800,color:T.textPrimary,letterSpacing:'-0.5px',paddingLeft:'11px'}}>Sistem Booking Asset</h1>
                        <p style={{fontSize:'13px',color:T.textMuted,marginTop:'2px',paddingLeft:'11px'}}>Status ruangan & kendaraan secara real-time</p>
                    </div>

                    <div style={{display:'flex',alignItems:'center',gap:'12px',position:'relative',zIndex:1}}>
                        {!auth.user?(
                            <Link href={route('login')} style={{background:'linear-gradient(135deg,#7C3AED,#A855F7)',color:'#fff',padding:'10px 24px',borderRadius:'12px',fontWeight:700,fontSize:'13px',textDecoration:'none',boxShadow:'0 4px 16px rgba(124,58,237,.35)'}}>Login System</Link>
                        ):(
                            <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                                {auth.user.role==='administrator'&&(
                                    <Link href={route('users.index')} style={{background:'transparent',border:`1.5px solid ${T.border}`,color:T.purple,padding:'8px 16px',borderRadius:'12px',fontSize:'12px',fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:'6px',transition:'all .2s', textDecoration:'none'}}
                                        onMouseEnter={e=>{e.currentTarget.style.background=T.border;}}
                                        onMouseLeave={e=>{e.currentTarget.style.background='transparent';}}
                                    >
                                        <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
                                        Kelola User
                                    </Link>
                                )}
                                <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                                    <div style={{width:'40px',height:'40px',borderRadius:'50%',background:'linear-gradient(135deg,#7C3AED,#A855F7)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'15px',fontWeight:800,color:'#fff',boxShadow:'0 4px 12px rgba(124,58,237,.3)'}}>
                                        {auth.user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <div style={{fontSize:'13px',fontWeight:700,color:T.textPrimary}}>{auth.user.name}</div>
                                        <div style={{fontSize:'10px',fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:auth.user.role==='guest'?T.rose:T.purple}}>
                                            {auth.user.role}
                                        </div>
                                    </div>
                                </div>
                                <Link href={route('logout')} method="post" as="button" style={{background:'transparent',border:`1.5px solid ${T.border}`,color:T.textMuted,padding:'7px 14px',borderRadius:'10px',fontSize:'12px',fontWeight:600,cursor:'pointer',transition:'all .2s'}}
                                    onMouseEnter={e=>{e.currentTarget.style.borderColor='#C4B5FD';e.currentTarget.style.color=T.purple;}}
                                    onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.textMuted;}}
                                >Logout</Link>
                            </div>
                        )}
                    </div>
                </header>

                {/* ── GUEST WARNING ── */}
                {auth.user?.role==='guest'&&(
                    <div className="anim-fadeup" style={{background:T.amberBg,border:`1px solid #FDE68A`,borderLeft:`4px solid ${T.amber}`,borderRadius:'16px',padding:'1.25rem 1.5rem',display:'flex',gap:'12px',alignItems:'center'}}>
                        <svg width={20} height={20} fill="none" viewBox="0 0 24 24" stroke={T.amber} strokeWidth={2} style={{flexShrink:0}}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/></svg>
                        <div>
                            <div style={{fontSize:'13px',fontWeight:700,color:T.amber,marginBottom:'2px'}}>Akses Terbatas</div>
                            <div style={{fontSize:'12px',color:'#92400E'}}>Akun berhasil dibuat, namun masih menunggu otorisasi dari Administrator.</div>
                        </div>
                    </div>
                )}

                {/* ── FLOOR PLAN ── */}
                <section className="anim-fadeup card-hover" style={{background:T.surface,borderRadius:'24px',border:`1px solid ${T.border}`,padding:'1.75rem',boxShadow:'0 4px 24px rgba(124,58,237,.06)',animationDelay:'.05s'}}>
                    <SectionTitle>Peta Ketersediaan Aset</SectionTitle>
                    <InteractiveFloorPlan onSelectAsset={handleAssetSelect} availabilityData={assetAvailability} userRole={auth.user?.role}/>
                </section>

                {/* ── HISTORY ── */}
                {auth.user&&(
                    <section className="anim-fadeup card-hover" style={{background:T.surface,borderRadius:'24px',border:`1px solid ${T.border}`,padding:'1.75rem',boxShadow:'0 4px 24px rgba(124,58,237,.06)',animationDelay:'.1s'}}>
                        <SectionTitle>Riwayat Peminjaman</SectionTitle>
                        <BookingHistory userRole={auth.user.role} userId={auth.user.id}/>
                    </section>
                )}
            </div>

            <BookingModal
                isOpen={isModalOpen} onClose={()=>setIsModalOpen(false)}
                asset={selectedAsset} onSubmit={handleBookingSubmit}
                existingBookings={selectedAsset?(assetAvailability.find(a=>a.name===selectedAsset.name)?.bookings||[]):[]}
            />
        </div>
    );
}

function SectionTitle({children}:{children:React.ReactNode}){
    return(
        <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'16px'}}>
            <div style={{width:'4px',height:'20px',background:'linear-gradient(180deg,#7C3AED,#A855F7)',borderRadius:'2px'}}/>
            <h3 style={{fontSize:'15px',fontWeight:700,color:'#1E0A4A'}}>{children}</h3>
        </div>
    );
}