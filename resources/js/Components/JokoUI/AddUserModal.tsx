import { useForm } from '@inertiajs/react';
import React from 'react';

const T = { surface: '#FFFFFF', surface2: '#FAF8FF', border: '#E9D5FF', purple: '#7C3AED', textPrimary: '#1E0A4A', textSecondary: '#6D28D9', textMuted: '#A78BFA', rose: '#DC2626' };
const iSt: React.CSSProperties = { width: '100%', border: '1.5px solid #E9D5FF', borderRadius: '12px', padding: '10px 14px', fontSize: '13px', color: '#1E0A4A', outline: 'none', fontFamily: 'inherit', background: '#FDFCFF', transition: 'border-color .2s,box-shadow .2s' };

interface AddUserModalProps { isOpen: boolean; onClose: () => void }

export default function AddUserModal({ isOpen, onClose }: AddUserModalProps) {
    // MENGGUNAKAN INERTIA useForm (Pengganti Axios)
    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        password: '',
        role: 'requester',
    });

    if (!isOpen) return null;

    const handleClose = () => {
        reset();
        clearErrors();
        onClose();
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('users.store'), {
            onSuccess: () => {
                alert('✅ SUKSES: Akun berhasil ditambahkan!');
                handleClose();
            },
            onError: () => {
                alert('❌ GAGAL: Periksa kembali data yang diinput.');
            }
        });
    };

    return (
        <>
            <style>{`@keyframes mIn2{from{opacity:0;transform:translateY(20px) scale(.97)}to{opacity:1;transform:translateY(0) scale(1)}} .joko-input2:focus{border-color:#7C3AED!important;box-shadow:0 0 0 3px rgba(124,58,237,.12)!important}`}</style>
            <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(109,40,217,.15)', backdropFilter: 'blur(12px)' }}>
                <div style={{ background: T.surface, borderRadius: '28px', border: `1px solid ${T.border}`, width: '100%', maxWidth: '480px', overflow: 'hidden', boxShadow: '0 32px 80px rgba(124,58,237,.15)', animation: 'mIn2 .35s cubic-bezier(.16,1,.3,1)' }}>
                    <div style={{ padding: '1.75rem 2rem', background: 'linear-gradient(135deg,#7C3AED,#A855F7)', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ position: 'absolute', top: '-30px', right: '-30px', width: '120px', height: '120px', borderRadius: '50%', background: 'rgba(255,255,255,.08)', pointerEvents: 'none' }} />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 1 }}>
                            <div><div style={{ fontSize: '10px', letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.7)', marginBottom: '4px' }}>Administrator Only</div><h2 style={{ fontSize: '20px', fontWeight: 800, color: '#fff' }}>Tambah Pengguna</h2></div>
                            <button onClick={handleClose} type="button" style={{ background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.25)', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}>
                                <svg width={14} height={14} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    </div>
                    <form onSubmit={handleSubmit} style={{ padding: '1.75rem 2rem', display: 'flex', flexDirection: 'column', gap: '14px', background: T.surface2 }}>
                        
                        <div>
                            <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: T.textMuted, marginBottom: '5px' }}>Nama Lengkap</label>
                            <input className="joko-input2" style={iSt} type="text" required value={data.name} onChange={e => setData('name', e.target.value)} placeholder="John Doe" />
                            {errors.name && <div style={{ color: T.rose, fontSize: '11px', marginTop: '4px' }}>{errors.name}</div>}
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: T.textMuted, marginBottom: '5px' }}>Alamat Email</label>
                            <input className="joko-input2" style={iSt} type="email" required value={data.email} onChange={e => setData('email', e.target.value)} placeholder="john@sitoy.com" />
                            {errors.email && <div style={{ color: T.rose, fontSize: '11px', marginTop: '4px' }}>{errors.email}</div>}
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: T.textMuted, marginBottom: '5px' }}>Password Sementara</label>
                            <input className="joko-input2" style={iSt} type="password" required minLength={8} value={data.password} onChange={e => setData('password', e.target.value)} placeholder="Minimal 8 karakter" />
                            {errors.password && <div style={{ color: T.rose, fontSize: '11px', marginTop: '4px' }}>{errors.password}</div>}
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '10px', fontWeight: 700, letterSpacing: '.08em', textTransform: 'uppercase', color: T.textMuted, marginBottom: '5px' }}>Hak Akses (Role)</label>
                            <select className="joko-input2" style={{ ...iSt, cursor: 'pointer' }} required value={data.role} onChange={e => setData('role', e.target.value)}>
                                <option value="guest">Guest — Hanya lihat dashboard</option>
                                <option value="requester">Requester — Bisa ajukan booking</option>
                                <option value="approval">Approval — Bisa setujui booking</option>
                                <option value="administrator">Administrator — Akses penuh</option>
                            </select>
                        </div>
                        
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', paddingTop: '8px', marginTop: '4px', borderTop: `1px solid ${T.border}` }}>
                            <button type="button" onClick={handleClose} style={{ padding: '9px 20px', borderRadius: '12px', border: `1.5px solid ${T.border}`, background: 'transparent', color: T.textMuted, fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Batal</button>
                            <button type="submit" disabled={processing} style={{ padding: '9px 24px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg,#7C3AED,#A855F7)', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: processing ? 'not-allowed' : 'pointer', opacity: processing ? .7 : 1, boxShadow: '0 4px 16px rgba(124,58,237,.3)' }}>
                                {processing ? 'Memproses…' : 'Simpan User'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}