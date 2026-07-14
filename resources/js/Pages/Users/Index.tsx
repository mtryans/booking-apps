import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';
import AddUserModal from '@/Components/JokoUI/AddUserModal'; // Memanggil modal buatanmu

export default function Index({ auth, users }: any) {
    const [isModalOpen, setIsModalOpen] = useState(false); // State untuk mengontrol modal

    const handleDelete = (id: number) => {
        if (confirm('Yakin ingin menghapus pengguna ini?')) {
            router.delete(route('users.destroy', id));
        }
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Kelola User</h2>}
        >
            <Head title="Kelola User" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    
                    {/* Tombol Pemicu Modal */}
                    <div className="mb-6 flex justify-end">
                        <button 
                            onClick={() => setIsModalOpen(true)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg shadow transition-colors"
                        >
                            + Tambah User Baru
                        </button>
                    </div>

                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border-b px-4 py-3">Nama</th>
                                        <th className="border-b px-4 py-3">Email</th>
                                        <th className="border-b px-4 py-3">Role</th>
                                        <th className="border-b px-4 py-3 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((u: any) => (
                                        <tr key={u.id} className="hover:bg-gray-50">
                                            <td className="border-b px-4 py-3">{u.name}</td>
                                            <td className="border-b px-4 py-3">{u.email}</td>
                                            <td className="border-b px-4 py-3 capitalize">
                                                <span className={`px-2 py-1 rounded text-xs text-white ${u.role === 'administrator' ? 'bg-indigo-600' : 'bg-gray-500'}`}>
                                                    {u.role || 'user'}
                                                </span>
                                            </td>
                                            <td className="border-b px-4 py-3 text-center">
                                                <Link href={route('users.edit', u.id)} className="text-blue-600 hover:text-blue-800 mr-4 font-medium">Edit</Link>
                                                {auth.user.id !== u.id && (
                                                    <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:text-red-800 font-medium">Hapus</button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            {/* Render Modal di sini */}
            <AddUserModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
            />
            
        </AuthenticatedLayout>
    );
}