// resources/js/Components/JokoUI/BookingModal.tsx
import { useState, useEffect, useRef } from 'react';

interface BookingModalProps {
    isOpen: boolean; onClose: () => void;
    asset: { id: string; name: string; type: 'room' | 'vehicle' } | null;
    onSubmit: (data: any) => void;
    existingBookings?: { start_time: string; end_time: string; topic?: string; driver_name?: string }[];
    mode?: 'create' | 'edit';
    initialData?: any | null; // data booking existing, dipakai untuk pre-fill saat mode 'edit'
}

const T = {
    bg:'#F5F3FF', surface:'#FFFFFF', surface2:'#FAF8FF',
    border:'#E9D5FF', borderStrong:'#C4B5FD',
    grad:'linear-gradient(135deg,#7C3AED,#A855F7)',
    purple:'#7C3AED', purpleMid:'#9333EA', purpleLight:'#A78BFA',
    violet:'#6D28D9', violetDark:'#5B21B6',
    textPrimary:'#1E0A4A', textSecondary:'#6D28D9', textMuted:'#A78BFA',
    emerald:'#059669', rose:'#DC2626', amber:'#D97706',
};

function toMin(t:string){const[h,m]=t.split(':').map(Number);return isNaN(h)||isNaN(m)?-1:h*60+m;}
function fmtTime(raw:string){const d=raw.replace(/\D/g,'').slice(0,4);return d.length<=2?d:d.slice(0,2)+':'+d.slice(2);}
function validTime(t:string){if(!/^\d{2}:\d{2}$/.test(t))return false;const m=toMin(t);return m>=toMin('07:00')&&m<=toMin('17:00');}
function conflictWith(s:string,e:string,bks:{start_time:string;end_time:string;topic?:string}[]){
    const sm=toMin(s),em=toMin(e);if(sm<0||em<0||sm>=em)return null;
    for(const b of bks){if(sm<toMin(b.end_time)&&em>toMin(b.start_time))return b;}
    return null;
}

function TimeInput({label,value,onChange,bookings=[],otherTime,isStart,accent}:{
    label:string;value:string;onChange:(v:string)=>void;
    bookings?:{start_time:string;end_time:string;topic?:string}[];
    otherTime?:string;isStart?:boolean;accent:string;
}){
    const [raw,setRaw]=useState(value);
    useEffect(()=>setRaw(value),[value]);

    const complete=/^\d{2}:\d{2}$/.test(raw);
    const inRange=complete&&validTime(raw);
    const outRange=complete&&!inRange;
    const sv=isStart?raw:(otherTime||'');
    const ev=isStart?(otherTime||''):raw;
    const conflict=(inRange&&validTime(isStart?(otherTime||''):(otherTime||''))&&toMin(sv)<toMin(ev))?conflictWith(sv,ev,bookings):null;
    const hasError=outRange||!!conflict;

    const handle=(e:React.ChangeEvent<HTMLInputElement>)=>{
        const f=fmtTime(e.target.value);setRaw(f);onChange(f);
    };

    return(
        <div>
            <label style={{display:'block',fontSize:'10px',fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:T.textMuted,marginBottom:'5px'}}>{label}</label>
            <div style={{position:'relative'}}>
                {/* clock icon */}
                <div style={{position:'absolute',left:'12px',top:'50%',transform:'translateY(-50%)',pointerEvents:'none',color:hasError?T.rose:inRange?accent:T.textMuted,transition:'color .2s'}}>
                    <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <input
                    type="text" inputMode="numeric" maxLength={5} placeholder="07:00"
                    value={raw} onChange={handle}
                    style={{
                        width:'100%', border:`1.5px solid ${hasError?T.rose:inRange?accent:T.border}`,
                        borderRadius:'12px', padding:'10px 36px',
                        fontSize:'15px', fontWeight:600, letterSpacing:'.04em',
                        color:hasError?T.rose:T.textPrimary, outline:'none', fontFamily:'inherit',
                        background:hasError?'#FFF5F5':inRange?`${accent}08`:'#FDFCFF',
                        transition:'all .2s',
                        boxShadow:inRange&&!hasError?`0 0 0 3px ${accent}18`:'none',
                    }}
                />
                {/* right icon */}
                {inRange&&!hasError&&(
                    <div style={{position:'absolute',right:'12px',top:'50%',transform:'translateY(-50%)',color:accent,pointerEvents:'none'}}>
                        <svg width={14} height={14} viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                )}
                {hasError&&(
                    <div style={{position:'absolute',right:'12px',top:'50%',transform:'translateY(-50%)',color:T.rose,pointerEvents:'none'}}>
                        <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01"/></svg>
                    </div>
                )}
                {/* popup */}
                {(outRange||!!conflict)&&(
                    <div style={{
                        position:'absolute',top:'calc(100% + 8px)',left:0,zIndex:99,
                        background:'#FFFFFF', border:'1px solid #FECDD3', borderLeft:`3px solid ${T.rose}`,
                        borderRadius:'12px', padding:'10px 14px', minWidth:'230px',
                        boxShadow:'0 12px 32px rgba(220,38,38,.15)',
                        animation:'popIn .18s cubic-bezier(.34,1.56,.64,1)',
                    }}>
                        <div style={{fontSize:'11px',fontWeight:700,color:T.rose,marginBottom:'3px',display:'flex',alignItems:'center',gap:'5px'}}>
                            <svg width={12} height={12} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01"/></svg>
                            {conflict?'Time Already Taken':'Out of Range'}
                        </div>
                        <div style={{fontSize:'11px',color:'#EF4444'}}>
                            {conflict?`Slot ${conflict.start_time}–${conflict.end_time} sudah terpakai${conflict.topic?` · ${conflict.topic}`:''}.`:'Hanya boleh antara 07:00 – 17:00.'}
                        </div>
                    </div>
                )}
            </div>
            <div style={{fontSize:'10px',marginTop:'4px',color:hasError?T.rose:inRange?accent:T.textMuted}}>
                {inRange&&!hasError?'✓ Waktu valid':hasError?'Periksa kembali waktu':'Format HH:MM · 07:00 – 17:00'}
            </div>
        </div>
    );
}

const inputSt=(accent:string):React.CSSProperties=>({
    width:'100%', border:`1.5px solid #E9D5FF`, borderRadius:'12px',
    padding:'10px 14px', fontSize:'13px', color:'#1E0A4A',
    outline:'none', fontFamily:'inherit', background:'#FDFCFF',
    transition:'border-color .2s, box-shadow .2s',
});

export default function BookingModal({isOpen,onClose,asset,onSubmit,existingBookings=[],mode='create',initialData=null}: BookingModalProps){
    const [department,setDepartment]=useState('');
    const [remarks,setRemarks]=useState('');
    const [ttd,setTtd]=useState('');
    const [date,setDate]=useState('');
    const [startTime,setStartTime]=useState('');
    const [endTime,setEndTime]=useState('');
    const [topic,setTopic]=useState('');
    const [attendant,setAttendant]=useState('');
    const [selectedDevices,setSelectedDevices]=useState<string[]>([]);
    const [nik,setNik]=useState('');
    const [startDate,setStartDate]=useState('');
    const [returnDate,setReturnDate]=useState('');
    const [driverName,setDriverName]=useState('');
    const [vehicleType,setVehicleType]=useState('');
    const [plateNumber,setPlateNumber]=useState('');

    const devicesList=[{id:'zoom',name:'Zoom'},{id:'teams',name:'Teams'},{id:'polycomp',name:'Polycomp'},{id:'camera',name:'Camera'},{id:'laptop',name:'Laptop'}];
    const toggleDevice=(id:string)=>setSelectedDevices(p=>p.includes(id)?p.filter(d=>d!==id):[...p,id]);

    useEffect(()=>{
        if(!isOpen){
            setDepartment('');setRemarks('');setTtd('');setDate('');setStartTime('');setEndTime('');
            setTopic('');setAttendant('');setNik('');setStartDate('');setReturnDate('');
            setDriverName('');setVehicleType('');setPlateNumber('');setSelectedDevices([]);
        } else if(mode==='edit'&&initialData){
            // Pre-fill form dari data booking yang sedang diedit
            setDepartment(initialData.department||'');
            setRemarks(initialData.remarks||'');
            setTtd(initialData.ttd||'');
            if(asset?.type==='room'){
                setDate(initialData.booking_date||'');
                setStartTime((initialData.start_time||'').slice(0,5));
                setEndTime((initialData.end_time||'').slice(0,5));
                setTopic(initialData.topic||'');
                setAttendant(String(initialData.attendant??''));
                setSelectedDevices(initialData.devices||[]);
            } else {
                setNik(initialData.employee_nik||'');
                setStartDate(initialData.start_date||'');
                setReturnDate(initialData.return_date||'');
                setStartTime((initialData.departure_time||'').slice(0,5));
                setEndTime((initialData.return_time||'').slice(0,5));
                setDriverName(initialData.driver_name||'');
                setVehicleType(initialData.vehicle_type||'');
                setPlateNumber(initialData.plate_number||'');
            }
        } else if(asset?.type==='vehicle'){
            if(asset.name.includes('Zenix')){setVehicleType('MPV');setPlateNumber;}
            if(asset.name.includes('Alphard')){setVehicleType('Luxury MPV');setPlateNumber;}
        }
    },[isOpen,asset,mode,initialData]);

    if(!isOpen||!asset)return null;

    const isRoom=asset.type==='room';
    const accent=isRoom?T.purple:T.emerald;
    const timesValid=validTime(startTime)&&validTime(endTime)&&toMin(startTime)<toMin(endTime);
    const conflicted=timesValid?!!conflictWith(startTime,endTime,existingBookings):false;
    const canSubmit=timesValid&&!conflicted;

    const handleSubmit=(e:React.FormEvent)=>{
        e.preventDefault();if(!canSubmit)return;
        const payload=isRoom
            ?{room_name:asset.name,department,booking_date:date,start_time:startTime,end_time:endTime,topic,attendant:parseInt(attendant),devices:selectedDevices,remarks,ttd}
            :{vehicle_model:asset.name,employee_nik:nik,department,vehicle_type:vehicleType,plate_number:plateNumber,start_date:startDate,departure_time:startTime,return_date:returnDate,return_time:endTime,driver_name:driverName,remarks,ttd};
        onSubmit(payload);
    };

    return(
        <>
        <style>{`
            @keyframes popIn{from{opacity:0;transform:translateY(-6px) scale(.96)}to{opacity:1;transform:translateY(0) scale(1)}}
            @keyframes modalIn{from{opacity:0;transform:translateY(24px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}}
            @keyframes backdropIn{from{opacity:0}to{opacity:1}}
            .joko-input:focus{border-color:${accent}!important;box-shadow:0 0 0 3px ${accent}18!important}
        `}</style>
        <div style={{position:'fixed',inset:0,zIndex:50,display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem',background:'rgba(109,40,217,.18)',backdropFilter:'blur(12px)',overflowY:'auto',animation:'backdropIn .2s ease'}}>
            <div style={{background:T.surface,borderRadius:'28px',border:`1px solid ${T.border}`,width:'100%',maxWidth:'700px',overflow:'hidden',margin:'2rem auto',boxShadow:'0 32px 80px rgba(124,58,237,.18), 0 8px 24px rgba(124,58,237,.1)',animation:'modalIn .35s cubic-bezier(.16,1,.3,1)'}}>

                {/* gradient header */}
                <div style={{padding:'2rem',background:'linear-gradient(135deg,#7C3AED 0%,#9333EA 50%,#A855F7 100%)',position:'relative',overflow:'hidden'}}>
                    {/* decorative circles */}
                    <div style={{position:'absolute',top:'-30px',right:'-30px',width:'160px',height:'160px',borderRadius:'50%',background:'rgba(255,255,255,.08)',pointerEvents:'none'}}/>
                    <div style={{position:'absolute',bottom:'-50px',left:'40%',width:'120px',height:'120px',borderRadius:'50%',background:'rgba(255,255,255,.06)',pointerEvents:'none'}}/>
                    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',position:'relative',zIndex:1}}>
                        <div>
                            <div style={{display:'inline-block',background:'rgba(255,255,255,.2)',backdropFilter:'blur(8px)',padding:'3px 12px',borderRadius:'999px',fontSize:'11px',fontWeight:600,color:'#fff',letterSpacing:'.06em',textTransform:'uppercase',marginBottom:'8px'}}>
                                {mode==='edit'?'Edit ':''}Form {isRoom?'Ruangan':'Kendaraan'}
                            </div>
                            <h2 style={{fontSize:'26px',fontWeight:800,color:'#fff',letterSpacing:'-0.5px'}}>{asset.name}</h2>
                        </div>
                        <button onClick={onClose} style={{background:'rgba(255,255,255,.15)',border:'1px solid rgba(255,255,255,.25)',borderRadius:'50%',width:'38px',height:'38px',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',color:'#fff',flexShrink:0,backdropFilter:'blur(4px)',transition:'background .2s'}}
                            onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,.25)'}
                            onMouseLeave={e=>e.currentTarget.style.background='rgba(255,255,255,.15)'}
                        >
                            <svg width={16} height={16} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
                        </button>
                    </div>
                </div>

                {/* form */}
                <form onSubmit={handleSubmit} style={{padding:'1.75rem 2rem',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px',background:T.surface2}}>

                    <FField label="Departemen / Divisi" colSpan={2}>
                        <input className="joko-input" style={inputSt(accent)} type="text" required value={department} onChange={e=>setDepartment(e.target.value)} placeholder="Misal: IT, HRD, Finance…"/>
                    </FField>

                    {isRoom&&<>
                        <FField label="Topik Meeting" colSpan={2}>
                            <input className="joko-input" style={inputSt(accent)} type="text" required value={topic} onChange={e=>setTopic(e.target.value)} placeholder="Misal: Sprint Planning"/>
                        </FField>
                        <FField label="Tanggal Booking">
                            <input className="joko-input" style={inputSt(accent)} type="date" required value={date} onChange={e=>setDate(e.target.value)}/>
                        </FField>
                        <FField label="Jumlah Peserta">
                            <input className="joko-input" style={inputSt(accent)} type="number" required min="1" value={attendant} onChange={e=>setAttendant(e.target.value)} placeholder="0"/>
                        </FField>
                        <div style={{gridColumn:'1/-1'}}>
                            <label style={{display:'block',fontSize:'10px',fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:T.textMuted,marginBottom:'6px'}}>Fasilitas Tambahan</label>
                            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px',background:T.surface,border:`1px solid ${T.border}`,borderRadius:'14px',padding:'14px'}}>
                                {devicesList.map(d=>{
                                    const restricted=d.id==='polycomp'&&asset.name!=='Jakarta';
                                    const checked=selectedDevices.includes(d.id);
                                    return(
                                        <label key={d.id} style={{display:'flex',alignItems:'center',gap:'8px',cursor:restricted?'not-allowed':'pointer',opacity:restricted?.4:1}}>
                                            <div onClick={()=>!restricted&&toggleDevice(d.id)} style={{width:'18px',height:'18px',borderRadius:'5px',border:`2px solid ${checked&&!restricted?accent:T.border}`,background:checked&&!restricted?accent:'transparent',display:'flex',alignItems:'center',justifyContent:'center',transition:'all .15s',flexShrink:0}}>
                                                {checked&&!restricted&&<svg width={10} height={10} viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"/></svg>}
                                            </div>
                                            <span style={{fontSize:'12px',fontWeight:500,color:restricted?T.textMuted:T.textSecondary}}>
                                                {d.name}
                                                {restricted&&<span style={{display:'block',fontSize:'9px',color:T.rose}}>Khusus Jakarta</span>}
                                            </span>
                                        </label>
                                    );
                                })}
                            </div>
                        </div>
                    </>}

                    {!isRoom&&<>
                        <FField label="Jenis Kendaraan"><input style={{...inputSt(accent),opacity:.55,cursor:'not-allowed'}} readOnly value={vehicleType}/></FField>
                        <FField label="Plat Nomor"><input style={{...inputSt(accent),opacity:.55,cursor:'not-allowed',letterSpacing:'.1em',fontWeight:700}} readOnly value={plateNumber}/></FField>
                        <FField label="NIK Karyawan"><input className="joko-input" style={inputSt(accent)} type="text" required value={nik} onChange={e=>setNik(e.target.value)} placeholder="Masukkan NIK"/></FField>
                        <FField label="Nama Driver"><input className="joko-input" style={inputSt(accent)} type="text" value={driverName} onChange={e=>setDriverName(e.target.value)} placeholder="Kosongkan jika bawa sendiri"/></FField>
                        <FField label="Tanggal Berangkat"><input className="joko-input" style={inputSt(accent)} type="date" required value={startDate} onChange={e=>setStartDate(e.target.value)}/></FField>
                        <FField label="Tanggal Kembali"><input className="joko-input" style={inputSt(accent)} type="date" required value={returnDate} onChange={e=>setReturnDate(e.target.value)}/></FField>
                    </>}

                    {/* TIME INPUTS */}
                    <div style={{gridColumn:'1/-1',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'16px',position:'relative'}}>
                        <TimeInput label={isRoom?'Jam Mulai':'Jam Keberangkatan'} value={startTime} onChange={setStartTime} bookings={existingBookings} otherTime={endTime} isStart accent={accent}/>
                        <TimeInput label={isRoom?'Jam Selesai':'Rencana Jam Kembali'} value={endTime} onChange={setEndTime} bookings={existingBookings} otherTime={startTime} isStart={false} accent={accent}/>
                        {validTime(startTime)&&validTime(endTime)&&toMin(endTime)<=toMin(startTime)&&(
                            <div style={{gridColumn:'1/-1',display:'flex',alignItems:'center',gap:'7px',background:'#FFFBEB',border:'1px solid #FDE68A',borderRadius:'10px',padding:'8px 12px'}}>
                                <svg width={13} height={13} fill="none" viewBox="0 0 24 24" stroke={T.amber} strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01"/></svg>
                                <span style={{fontSize:'11px',color:T.amber,fontWeight:500}}>Jam selesai harus lebih besar dari jam mulai.</span>
                            </div>
                        )}
                    </div>

                    <FField label="Remarks / Catatan" colSpan={2}>
                        <textarea className="joko-input" style={{...inputSt(accent),height:'80px',resize:'vertical'}} value={remarks} onChange={e=>setRemarks(e.target.value)} placeholder="Tambahkan catatan jika ada…"/>
                    </FField>
                    <FField label="Tanda Tangan Digital (ketik nama)" colSpan={2}>
                        <input className="joko-input" style={{...inputSt(accent),fontStyle:'italic'}} type="text" required value={ttd} onChange={e=>setTtd(e.target.value)} placeholder="Ketik nama Anda sebagai persetujuan"/>
                    </FField>

                    <div style={{gridColumn:'1/-1',display:'flex',justifyContent:'flex-end',gap:'10px',marginTop:'8px',paddingTop:'20px',borderTop:`1px solid ${T.border}`}}>
                        <button type="button" onClick={onClose} style={{padding:'10px 22px',borderRadius:'12px',border:`1.5px solid ${T.border}`,background:'transparent',color:T.textMuted,fontSize:'13px',fontWeight:600,cursor:'pointer',transition:'all .2s'}}
                            onMouseEnter={e=>{e.currentTarget.style.borderColor=T.purple;e.currentTarget.style.color=T.purple;}}
                            onMouseLeave={e=>{e.currentTarget.style.borderColor=T.border;e.currentTarget.style.color=T.textMuted;}}
                        >Batal</button>
                        <button type="submit" disabled={!canSubmit} style={{padding:'10px 28px',borderRadius:'12px',border:'none',background:canSubmit?'linear-gradient(135deg,#7C3AED,#A855F7)':'#EDE9FE',color:canSubmit?'#fff':T.textMuted,fontSize:'13px',fontWeight:700,cursor:canSubmit?'pointer':'not-allowed',transition:'all .25s',boxShadow:canSubmit?'0 4px 16px rgba(124,58,237,.35)':'none',transform:'translateY(0)',letterSpacing:'.02em'}}
                            onMouseEnter={e=>{if(canSubmit)e.currentTarget.style.transform='translateY(-2px)';}}
                            onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';}}
                        >{mode==='edit'?'Simpan Perubahan':'Kirim Pengajuan'}</button>
                    </div>
                </form>
            </div>
        </div>
        </>
    );
}

function FField({label,children,colSpan=1}:{label:string;children:React.ReactNode;colSpan?:number}){
    return(
        <div style={{gridColumn:colSpan===2?'1/-1':undefined}}>
            <label style={{display:'block',fontSize:'10px',fontWeight:700,letterSpacing:'.08em',textTransform:'uppercase',color:'#A78BFA',marginBottom:'5px'}}>{label}</label>
            {children}
        </div>
    );
}
