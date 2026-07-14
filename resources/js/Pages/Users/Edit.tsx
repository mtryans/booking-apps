import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';

export default function Edit({ auth, user }: any) {
    const { data, setData, put, processing, errors } = useForm({
        name: user.name,
        email: user.email,
        role: user.role || 'user',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        put(route('users.update', user.id));
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Edit User</h2>}
        >
            <Head title="Edit User" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg max-w-2xl mx-auto">
                        <form onSubmit={submit} className="p-6">
                            <div>
                                <InputLabel htmlFor="name" value="Nama Lengkap" />
                                <TextInput id="name" className="mt-1 block w-full" value={data.name} onChange={(e) => setData('name', e.target.value)} required />
                                <InputError className="mt-2" message={errors.name} />
                            </div>

                            <div className="mt-4">
                                <InputLabel htmlFor="email" value="Email" />
                                <TextInput id="email" type="email" className="mt-1 block w-full" value={data.email} onChange={(e) => setData('email', e.target.value)} required />
                                <InputError className="mt-2" message={errors.email} />
                            </div>

                            <div className="mt-4">
                                <InputLabel htmlFor="role" value="Hak Akses (Role)" />
                                <select 
                                    id="role" 
                                    className="border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 rounded-md shadow-sm mt-1 block w-full" 
                                    value={data.role} 
                                    onChange={(e) => setData('role', e.target.value)}
                                >
                                    <option value="user">User Biasa</option>
                                    <option value="administrator">Administrator</option>
                                </select>
                                <InputError className="mt-2" message={errors.role} />
                            </div>

                            <div className="flex items-center gap-4 mt-8">
                                <PrimaryButton disabled={processing}>Simpan Perubahan</PrimaryButton>
                                <Link href={route('users.index')} className="text-gray-600 hover:underline">Batal</Link>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}