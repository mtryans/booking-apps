// resources/js/Components/JokoUI/BookingHistory.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import BookingDetailModal from './BookingDetailModal';
import BookingModal from './BookingModal';

const T={
    surface:'#FFFFFF',surface2:'#FAF8FF',border:'#E9D5FF',borderStrong:'#C4B5FD',
    purple:'#7C3AED',purpleLight:'#A78BFA',violet:'#6D28D9',
    textPrimary:'#1E0A4A',textSecondary:'#6D28D9',textMuted:'#A78BFA',
    emerald:'#059669',emeraldBg:'#ECFDF5',emeraldBorder:'#6EE7B7',
    rose:'#DC2626',roseBg:'#FFF1F2',roseBorder:'#FECDD3',
    amber:'#D97706',amberBg:'#FFFBEB',amberBorder:'#FDE68A',
};

interface BookingHistoryProps{userRole?:string;userId?:number}

export default function BookingHistory({userRole='guest',userId}:BookingHistoryProps){
    const [tab,setTab]=useState<'room'|'vehicle'>('room');
    const [data,setData]=useState<any[]>([]);
    const [loading,setLoading]=useState(true);
    const [selectedBooking,setSelectedBooking]=useState<any|null>(null);
    const [editingBooking,setEditingBooking]=useState<any|null>(null);
    const isPrivileged=userRole==='administrator'||userRole==='approval';

    const fetchData=async()=>{
        setLoading(true);
        try{const res=await axios.get(tab==='room'?'/room-bookings':'/vehicle-bookings');setData(res.data);}
        catch{console.error('Gagal ambil riwayat');}
        finally{setLoading(false);}
    };
    useEffect(()=>{fetchData();},[tab]);

    const handleAction=async(id:number,action:'booked'|'rejected')=>{
        if(!confirm(`Yakin ingin ${action==='booked'?'menyetujui':'menolak'} pengajuan ini?`))return;
        try{
            const ep=tab==='room'?`/room-bookings/${id}/approve`:`/vehicle-bookings/${id}/approve`;
            await axios.patch(ep,{status:action});
            alert('Status berhasil diubah!');window.location.reload();
        }catch{alert('Gagal mengubah status.');}
    };

    // Boleh edit/hapus jika: pemilik booking DAN masih waiting_approval, ATAU admin/approval
    const canManage=(item:any)=>(userId!==undefined&&item.user_id===userId&&item.status==='waiting_approval')||isPrivileged;

    const handleDelete=async(id:number)=>{
        if(!confirm('Yakin ingin menghapus pengajuan ini? Tindakan ini tidak bisa dibatalkan.'))return;
        try{
            const ep=tab==='room'?`/room-bookings/${id}`:`/vehicle-bookings/${id}`;
            await axios.delete(ep);
            alert('Berhasil dihapus!');window.location.reload();
        }catch(err:any){alert(err.response?.data?.message||'Gagal menghapus data.');}
    };

    const handleEditSubmit=async(payload:any)=>{
        if(!editingBooking)return;
        try{
            const ep=tab==='room'?`/room-bookings/${editingBooking.id}`:`/vehicle-bookings/${editingBooking.id}`;
            const res=await axios.patch(ep,payload);
            alert(`✅ ${res.data.message}`);
            setEditingBooking(null);window.location.reload();
        }catch(err:any){
            if(err.response?.status===422)alert(`❌ DITOLAK: ${err.response.data.message}`);
            else alert(err.response?.data?.message||'⚠️ Terjadi kesalahan.');
        }
    };

    const statusStyle=(s:string)=>s==='booked'
        ?{bg:T.emeraldBg,color:T.emerald,border:T.emeraldBorder,label:'Disetujui'}
        :s==='rejected'
        ?{bg:T.roseBg,color:T.rose,border:T.roseBorder,label:'Ditolak'}
        :{bg:T.amberBg,color:T.amber,border:T.amberBorder,label:'Menunggu Approval'};

    return(
        <div style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
            <style>{`
                @keyframes rowIn{from{opacity:0;transform:translateX(-10px)}to{opacity:1;transform:translateX(0)}}
                .booking-row{animation:rowIn .3s cubic-bezier(.16,1,.3,1) both}
                .booking-row:nth-child(1){animation-delay:.05s}.booking-row:nth-child(2){animation-delay:.1s}.booking-row:nth-child(3){animation-delay:.15s}
                .booking-row:nth-child(4){animation-delay:.2s}.booking-row:nth-child(5){animation-delay:.25s}
            `}</style>

            {/* tabs */}
            <div style={{display:'flex',gap:'4px',background:'#F0EBFF',padding:'4px',borderRadius:'14px',width:'fit-content',border:`1px solid ${T.border}`}}>
                {(['room','vehicle'] as const).map(t=>(
                    <button key={t} onClick={()=>setTab(t)} style={{
                        padding:'7px 22px',borderRadius:'11px',fontSize:'12px',fontWeight:700,cursor:'pointer',border:'none',transition:'all .2s cubic-bezier(.34,1.56,.64,1)',
                        background:tab===t?T.surface:'transparent',
                        color:tab===t?T.purple:T.textMuted,
                        boxShadow:tab===t?'0 2px 8px rgba(124,58,237,.12)':'none',
                        transform:tab===t?'scale(1.02)':'scale(1)',
                    }}>
                        {t==='room'?'Ruangan':'Kendaraan'}
                    </button>
                ))}
            </div>

            {/* rows */}
            <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
                {loading?(
                    <div style={{padding:'2.5rem',textAlign:'center',color:T.textMuted,fontSize:'13px'}}>
                        <div style={{width:'28px',height:'28px',borderRadius:'50%',border:`3px solid ${T.border}`,borderTopColor:T.purple,animation:'spin .8s linear infinite',margin:'0 auto 8px'}}/>
                        Memuat data…
                        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                    </div>
                ):data.length===0?(
                    <div style={{padding:'3rem',textAlign:'center',border:`2px dashed ${T.border}`,borderRadius:'16px',color:T.textMuted,fontSize:'13px'}}>
                        Belum ada riwayat peminjaman.
                    </div>
                ):data.map((item,i)=>{
                    const ss=statusStyle(item.status);
                    return(
                        <div key={item.id} className="booking-row" style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:'16px',padding:'1rem 1.25rem',display:'flex',alignItems:'center',justifyContent:'space-between',gap:'1rem',transition:'all .2s',cursor:'default'}}
                            onMouseEnter={e=>{e.currentTarget.style.borderColor=T.borderStrong;e.currentTarget.style.boxShadow='0 4px 16px rgba(124,58,237,.08)';e.currentTarget.style.transform='translateY(-1px)';}}
                            onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.boxShadow='none';e.currentTarget.style.transform='translateY(0)';}}
                        >
                            <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                                <div style={{width:'42px',height:'42px',borderRadius:'12px',background:tab==='room'?'#F5F3FF':'#ECFDF5',border:`1px solid ${tab==='room'?T.border:T.emeraldBorder}`,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                                    <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke={tab==='room'?T.purple:T.emerald} strokeWidth={1.5}>
                                        {tab==='room'
                                            ?<path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
                                            :<path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10"/>
                                        }
                                    </svg>
                                </div>
                                <div>
                                    <div style={{fontSize:'14px',fontWeight:700,color:T.textPrimary}}>{tab==='room'?item.room_name:item.vehicle_model}</div>
                                    <div style={{fontSize:'11px',color:T.textMuted,marginTop:'2px'}}>{item.topic||item.driver_name||item.employee_nik}</div>
                                </div>
                            </div>
                            <div style={{display:'flex',alignItems:'center',gap:'10px',flexShrink:0}}>
                                <span style={{fontSize:'10px',fontWeight:700,padding:'4px 12px',borderRadius:'999px',background:ss.bg,color:ss.color,border:`1px solid ${ss.border}`}}>
                                    {ss.label}
                                </span>
                                {canManage(item)&&(<>
                                    <button onClick={()=>setEditingBooking(item)} title="Edit pengajuan" style={{padding:'6px 10px',borderRadius:'10px',fontSize:'12px',fontWeight:600,background:'transparent',border:`1.5px solid ${T.border}`,color:T.purple,cursor:'pointer',transition:'all .2s',display:'flex',alignItems:'center',gap:'5px'}}
                                        onMouseEnter={e=>{e.currentTarget.style.background='#F5F3FF';}}
                                        onMouseLeave={e=>{e.currentTarget.style.background='transparent';}}
                                    >
                                        <svg width={13} height={13} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                                        Edit
                                    </button>
                                    <button onClick={()=>handleDelete(item.id)} title="Hapus pengajuan" style={{padding:'6px 10px',borderRadius:'10px',fontSize:'12px',fontWeight:600,background:'transparent',border:`1.5px solid ${T.roseBorder}`,color:T.rose,cursor:'pointer',transition:'all .2s',display:'flex',alignItems:'center',gap:'5px'}}
                                        onMouseEnter={e=>{e.currentTarget.style.background=T.roseBg;}}
                                        onMouseLeave={e=>{e.currentTarget.style.background='transparent';}}
                                    >
                                        <svg width={13} height={13} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                                        Hapus
                                    </button>
                                </>)}
                                <button onClick={()=>setSelectedBooking(item)} style={{padding:'6px 14px',borderRadius:'10px',fontSize:'12px',fontWeight:600,background:'transparent',border:`1.5px solid ${T.border}`,color:T.textMuted,cursor:'pointer',transition:'all .2s',display:'flex',alignItems:'center',gap:'5px'}}
                                    onMouseEnter={e=>{e.currentTarget.style.borderColor=T.purple;e.currentTarget.style.color=T.purple;e.currentTarget.style.background='#F5F3FF';}}
                                    onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.textMuted;e.currentTarget.style.background='transparent';}}
                                >
                                    <svg width={13} height={13} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                                    Detail
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <BookingDetailModal isOpen={!!selectedBooking} onClose={()=>setSelectedBooking(null)} booking={selectedBooking} userRole={userRole} onAction={handleAction}/>

            <BookingModal
                isOpen={!!editingBooking}
                onClose={()=>setEditingBooking(null)}
                asset={editingBooking?{id:String(editingBooking.id),name:tab==='room'?editingBooking.room_name:editingBooking.vehicle_model,type:tab}:null}
                onSubmit={handleEditSubmit}
                mode="edit"
                initialData={editingBooking}
                existingBookings={[]}
            />
        </div>
    );
}
