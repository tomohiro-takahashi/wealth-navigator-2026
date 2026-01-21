
import { getList } from '@/lib/microcms';
import Link from 'next/link';
import { Property } from '@/types';
import { Metadata } from 'next';
import { siteConfig } from '@/site.config';

export const revalidate = 60;

export const metadata: Metadata = {
    title: `Properties | ${siteConfig.name}`,
    description: '厳選された投資用不動産物件一覧',
};

const getSummary = (content: string, limit: number = 80) => {
    const text = content.replace(/<[^>]+>/g, '');
    return text.length > limit ? text.substring(0, limit) + '...' : text;
};

export default async function PropertiesPage() {
    const { contents: properties } = await getList('properties', { limit: 100 });
    const safeProperties = properties as Property[];

    return (
        <div className="min-h-screen bg-[#F8F9FA] text-gray-900 font-sans pb-20">
            <header className="pt-24 pb-12 px-6 text-center bg-white border-b border-gray-200">
                <span className="text-[#c59f59] font-bold tracking-widest text-xs uppercase mb-3 block">Premium Selection</span>
                <h1 className="text-3xl md:text-5xl font-serif font-bold tracking-wide mb-4 text-gray-900">
                    厳選物件一覧
                </h1>
                <p className="text-gray-500 text-sm md:text-base">
                    {siteConfig.name}が自信を持っておすすめする、至高のポートフォリオ。
                </p>
            </header>

            <div className="container mx-auto px-6 py-12 max-w-5xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {safeProperties.map((prop) => (
                        <Link key={prop.id} href={`/properties/${prop.id}`} className="group cursor-pointer flex flex-col">
                            <div className="relative w-full aspect-[3/2] overflow-hidden rounded-md shadow-lg mb-5 ring-1 ring-black/5">
                                <div
                                    className="absolute inset-0 bg-gray-200 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                                    style={{ backgroundImage: `url(${prop.images?.[0]?.url || '/luxury-apartment.png'})` }}
                                ></div>

                                {/* 利回りバッジ */}
                                {prop.yield && (
                                    <div className="absolute bottom-4 right-4 bg-[#161410]/90 backdrop-blur-sm text-[#c59f59] px-3 py-1.5 rounded-sm border border-[#c59f59]/30 shadow-lg">
                                        <span className="text-[10px] font-medium tracking-wider uppercase block text-center leading-none mb-0.5 text-gray-400">Yield</span>
                                        <span className="text-lg font-bold font-display">{prop.yield}</span>
                                    </div>
                                )}

                                {/* Status Badge from API if exists */}
                                {prop.status_badge && (
                                    <div className="absolute top-4 left-4 bg-[#c59f59] text-white text-xs font-bold px-3 py-1 shadow-md">
                                        {prop.status_badge}
                                    </div>
                                )}
                            </div>
                            <div className="space-y-3 px-2">
                                <div className="flex items-baseline justify-between border-b border-gray-200 pb-2">
                                    <span className="text-xs font-bold text-[#c59f59] tracking-widest uppercase">{prop.location}</span>
                                    <span className="font-bold text-lg text-gray-800">{prop.price}</span>
                                </div>
                                <h3 className="font-serif text-2xl font-bold text-gray-900 leading-snug group-hover:text-[#c59f59] transition-colors pt-1">
                                    {prop.name}
                                </h3>
                                <p className="text-[16px] leading-relaxed text-gray-600 line-clamp-2">
                                    {getSummary(prop.description || '', 80)}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
