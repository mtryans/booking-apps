import { ReactNode } from 'react';

// Blueprint (Interface) untuk properti yang bisa diterima oleh Card ini
interface AssetCardProps {
    title: string;
    description: string;
    icon?: ReactNode; // Untuk menerima icon SVG nanti
    theme?: 'blue' | 'green' | 'orange';
    onClick?: () => void;
}

export default function AssetCard({ title, description, icon, theme = 'blue', onClick }: AssetCardProps) {
    // Definisi warna (Joko UI Style)
    const themes = {
        blue: 'bg-blue-50 border-blue-200 text-blue-900 hover:bg-blue-100 hover:border-blue-300 hover:shadow-blue-100',
        green: 'bg-green-50 border-green-200 text-green-900 hover:bg-green-100 hover:border-green-300 hover:shadow-green-100',
        orange: 'bg-orange-50 border-orange-200 text-orange-900 hover:bg-orange-100 hover:border-orange-300 hover:shadow-orange-100',
    };

    return (
        <div
            onClick={onClick}
            className={`p-6 border rounded-2xl cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md hover:-translate-y-1 ${themes[theme]}`}
        >
            <div className="flex items-center justify-between mb-4">
                <h4 className="font-extrabold text-xl">{title}</h4>
                {/* Tempat icon SVG kalau ada */}
                {icon && <div className="p-2 bg-white rounded-full shadow-sm opacity-80">{icon}</div>}
            </div>
            <p className="text-sm font-medium opacity-80">{description}</p>
        </div>
    );
}