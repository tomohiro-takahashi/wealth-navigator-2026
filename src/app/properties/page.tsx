
import { getList } from '@/lib/microcms';
import Link from 'next/link';
import { Property } from '@/types';
import { Metadata } from 'next';
import { getSiteConfig } from '@/site.config';

// revalidate removed

export async function generateMetadata(): Promise<Metadata> {
    const siteConfig = await getSiteConfig();
    return {
        title: `Properties | ${siteConfig.name}`,
        description: '厳選された投資用不動産物件一覧',
    };
}

const getSummary = (content: string, limit: number = 80) => {
    const text = content.replace(/<[^>]+>/g, '');
    return text.length > limit ? text.substring(0, limit) + '...' : text;
};

export default async function PropertiesPage() {
    const siteConfig = await getSiteConfig();
    const { contents: properties } = await getList('properties', { limit: 100 });
    const safeProperties = properties as Property[];

    return (
        <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-main)] font-sans pb-20">
            <header className="pt-24 pb-12 px-6 text-center bg-[var(--color-primary)] border-b border-[var(--color-border)]">
                <span className="text-[var(--color-accent)] font-bold tracking-widest text-xs uppercase mb-3 block">Premium Selection</span>
                <h1 className="text-3xl md:text-5xl font-serif font-bold tracking-wide mb-4 text-[var(--color-text-inverse)]">
                    厳選物件一覧
                </h1>
                <p className="text-[var(--color-text-sub)] text-sm md:text-base opacity-80">
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
                                    <div className="absolute top-4 left-4 bg-[var(--color-accent)] text-white text-xs font-bold px-3 py-1 shadow-md">
                                        {prop.status_badge}
                                    </div>
                                )}
                            </div>
                            <div className="space-y-3 px-2">
                                <div className="flex items-baseline justify-between border-b border-[var(--color-border)] pb-2">
                                    <span className="text-xs font-bold text-[var(--color-accent)] tracking-widest uppercase">{prop.location}</span>
                                    <span className="font-bold text-lg text-[var(--color-text-main)]">{prop.price}</span>
                                </div>
                                <h3 className="font-serif text-2xl font-bold text-[var(--color-text-main)] leading-snug group-hover:text-[var(--color-accent)] transition-colors pt-1">
                                    {prop.name}
                                </h3>
                                <p className="text-[16px] leading-relaxed text-[var(--color-text-sub)] line-clamp-2">
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
