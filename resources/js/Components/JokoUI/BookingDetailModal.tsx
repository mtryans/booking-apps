// resources/js/Components/JokoUI/BookingDetailModal.tsx
import React from 'react';
const T={
    surface:'#FFFFFF',surface2:'#FAF8FF',border:'#E9D5FF',
    purple:'#7C3AED',violet:'#6D28D9',violetDark:'#5B21B6',
    textPrimary:'#1E0A4A',textSecondary:'#6D28D9',textMuted:'#A78BFA',
    emerald:'#059669',emeraldBg:'#ECFDF5',emeraldBorder:'#6EE7B7',
    rose:'#DC2626',roseBg:'#FFF1F2',roseBorder:'#FECDD3',
    amber:'#D97706',amberBg:'#FFFBEB',amberBorder:'#FDE68A',
};
interface BookingDetailModalProps{isOpen:boolean;onClose:()=>void;booking:any;userRole:string;onAction:(id:number,action:'booked'|'rejected')=>void;}
export default function BookingDetailModal({isOpen,onClose,booking,userRole,onAction}:BookingDetailModalProps){
    if(!isOpen||!booking)return null;
    const isRoom=booking.room_name!==undefined;
    const canReview=booking.status==='waiting_approval'&&(userRole==='administrator'||userRole==='approval');
    const sc=booking.status==='booked'?{label:'Disetujui',color:T.emerald,bg:T.emeraldBg,border:T.emeraldBorder}
        :booking.status==='rejected'?{label:'Ditolak',color:T.rose,bg:T.roseBg,border:T.roseBorder}
        :{label:'Menunggu Approval',color:T.amber,bg:T.amberBg,border:T.amberBorder};
    return(
        <>
        <style>{`@keyframes mIn{from{opacity:0;transform:translateY(20px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}} @keyframes bIn{from{opacity:0}to{opacity:1}}`}</style>
        <div style={{position:'fixed',inset:0,zIndex:50,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem',background:'rgba(109,40,217,.15)',backdropFilter:'blur(12px)',overflowY:'auto',animation:'bIn .2s ease'}}>
            <div style={{background:T.surface,borderRadius:'28px',border:`1px solid ${T.border}`,width:'100%',maxWidth:'720px',overflow:'hidden',margin:'2rem auto',boxShadow:'0 32px 80px rgba(124,58,237,.15)',animation:'mIn .35s cubic-bezier(.16,1,.3,1)'}}>

                {/* gradient header */}
                <div style={{padding:'1.75rem 2rem',background:'linear-gradient(135deg,#7C3AED,#A855F7)',position:'relative',overflow:'hidden'}}>
                    <div style={{position:'absolute',top:'-30px',right:'-30px',width:'140px',height:'140px',borderRadius:'50%',background:'rgba(255,255,255,.08)',pointerEvents:'none'}}/>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',position:'relative',zIndex:1}}>
                        <div>
                            <div style={{fontSize:'10px',letterSpacing:'.1em',textTransform:'uppercase',color:'rgba(255,255,255,.7)',marginBottom:'5px'}}>ID Pengajuan · #BK-{booking.id.toString().padStart(4,'0')}</div>
                            <h2 style={{fontSize:'22px',fontWeight:800,color:'#fff'}}>{isRoom?booking.room_name:booking.vehicle_model}</h2>
                        </div>
                        <div style={{display:'flex',alignItems:'center',gap:'12px'}}>
                            <span style={{fontSize:'11px',fontWeight:700,padding:'4px 14px',borderRadius:'999px',background:'rgba(255,255,255,.2)',color:'#fff',backdropFilter:'blur(4px)'}}>{sc.label}</span>
                            <button onClick={onClose} style={{background:'rgba(255,255,255,.15)',border:'1px solid rgba(255,255,255,.25)',borderRadius:'50%',width:'36px',height:'36px',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'#fff'}}>
                                <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* body */}
                <div style={{padding:'2rem',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'2rem',background:T.surface2}}>
                    <div>
                        <STitle>Informasi Agenda</STitle>
                        {isRoom?(<>
                            <IRow label="Topik Meeting"  value={booking.topic} hi/>
                            <IRow label="Tanggal"        value={booking.booking_date}/>
                            <IRow label="Waktu"          value={`${booking.start_time} – ${booking.end_time}`} hi/>
                            <IRow label="Peserta"        value={`${booking.attendant} Orang`}/>
                            <IRow label="Alamat / Lantai"value={booking.address}/>
                        </>):(<>
                            <IRow label="Plat Nomor"     value={booking.plate_number} hi/>
                            <IRow label="Tipe Kendaraan" value={booking.vehicle_type}/>
                            <IRow label="Berangkat"      value={`${booking.start_date} (${booking.departure_time})`}/>
                            <IRow label="Est. Kembali"   value={`${booking.return_date} (${booking.return_time})`}/>
                        </>)}
                    </div>
                    <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
                        <div>
                            <STitle>Data Pemohon</STitle>
                            {!isRoom&&<><IRow label="NIK Karyawan" value={booking.employee_nik}/><IRow label="Nama Driver" value={booking.driver_name||'Bawa Sendiri'}/></>}
                            <IRow label="Tanggal Pengajuan" value={new Date(booking.created_at).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})}/>
                        </div>
                        <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:'12px',padding:'14px'}}>
                            <div style={{fontSize:'10px',fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:T.textMuted,marginBottom:'6px'}}>Remarks</div>
                            <p style={{fontSize:'12px',color:T.textSecondary,fontStyle:'italic'}}>{booking.remarks||'Tidak ada catatan tambahan.'}</p>
                        </div>
                        <div>
                            <div style={{fontSize:'10px',fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:T.textMuted,marginBottom:'6px'}}>Tanda Tangan</div>
                            <div style={{fontSize:'18px',color:T.purple,fontStyle:'italic',borderBottom:`1.5px dashed ${T.border}`,paddingBottom:'4px',display:'inline-block'}}>{booking.ttd||'Tertanda'}</div>
                        </div>
                    </div>
                </div>

                {/* footer */}
                {canReview?(
                    <div style={{padding:'1.25rem 2rem',borderTop:`1px solid ${T.border}`,background:T.surface,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                        <p style={{fontSize:'11px',color:T.textMuted}}>Tindakan ini akan mengunci jadwal secara otomatis.</p>
                        <div style={{display:'flex',gap:'10px'}}>
                            <button onClick={()=>{onAction(booking.id,'rejected');onClose();}} style={{padding:'9px 20px',borderRadius:'12px',border:`1.5px solid ${T.roseBorder}`,background:T.roseBg,color:T.rose,fontSize:'12px',fontWeight:700,cursor:'pointer',transition:'all .2s'}}
                                onMouseEnter={e=>e.currentTarget.style.background='#FFE4E6'} onMouseLeave={e=>e.currentTarget.style.background=T.roseBg}
                            >Tolak Pengajuan</button>
                            <button onClick={()=>{onAction(booking.id,'booked');onClose();}} style={{padding:'9px 24px',borderRadius:'12px',border:'none',background:'linear-gradient(135deg,#7C3AED,#A855F7)',color:'#fff',fontSize:'12px',fontWeight:700,cursor:'pointer',boxShadow:'0 4px 16px rgba(124,58,237,.3)',transition:'all .2s'}}
                                onMouseEnter={e=>e.currentTarget.style.transform='translateY(-1px)'} onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}
                            >Setujui & Kunci Jadwal</button>
                        </div>
                    </div>
                ):(
                    <div style={{padding:'1rem 2rem',borderTop:`1px solid ${T.border}`,background:T.surface,display:'flex',justifyContent:'flex-end'}}>
                        <button onClick={onClose} style={{padding:'8px 20px',borderRadius:'10px',border:`1.5px solid ${T.border}`,background:'transparent',color:T.textMuted,fontSize:'12px',fontWeight:600,cursor:'pointer'}}>Tutup</button>
                    </div>
                )}
            </div>
        </div>
        </>
    );
}
function STitle({children}:{children:React.ReactNode}){return(<div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'12px'}}><div style={{width:'3px',height:'14px',background:'linear-gradient(180deg,#7C3AED,#A855F7)',borderRadius:'2px'}}/><span style={{fontSize:'10px',fontWeight:700,letterSpacing:'.1em',textTransform:'uppercase',color:'#A78BFA'}}>{children}</span></div>);}
function IRow({label,value,hi}:{label:string;value:string;hi?:boolean}){return(<div style={{marginBottom:'10px'}}><div style={{fontSize:'10px',color:'#A78BFA',marginBottom:'2px'}}>{label}</div><div style={{fontSize:'13px',fontWeight:700,color:hi?'#6D28D9':'#1E0A4A'}}>{value}</div></div>);}
