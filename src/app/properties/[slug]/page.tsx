import { getDetail } from '@/lib/microcms';
import { notFound } from 'next/navigation';
import { Property } from '@/types';
import Link from 'next/link';
import { Metadata } from 'next';
import { getSiteConfig } from '@/site.config';

// 再検証時間: 60秒
// revalidate removed

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const siteConfig = await getSiteConfig();
    try {
        const property = await getDetail(slug, 'properties') as Property;
        return {
            title: `${property.name} | ${siteConfig.name}`,
            description: property.description,
        };
    } catch {
        return {
            title: `物件詳細 | ${siteConfig.name}`,
        };
    }
}

export default async function PropertyPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const siteConfig = await getSiteConfig();

    let property: Property;
    try {
        property = await getDetail(slug, 'properties') as Property;
    } catch (e) {
        console.error(e);
        notFound();
    }

    // 構造化データ (RealEstateListing)
    const jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'RealEstateListing',
        name: property.name,
        description: property.description,
        image: property.images?.[0]?.url,
        datePosted: property.publishedAt,
        price: property.price_jpn?.replace(/[^0-9]/g, '') || undefined, // 数字のみ抽出を試みる（簡易的）
        priceCurrency: 'JPY',
        address: {
            '@type': 'PostalAddress',
            addressLocality: property.location, // 簡易的にlocationを使用
        },
        offers: {
            '@type': 'Offer',
            price: property.price_jpn?.replace(/[^0-9]/g, ''),
            priceCurrency: 'JPY',
            availability: 'https://schema.org/InStock', // 在庫状況はAPIから取れれば動的にする
        }
    };

    return (
        <article className="pb-20 bg-[var(--color-background)] text-[var(--color-text-main)]">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
            />

            {/* Hero Image */}
            <div className="relative h-[60vh] w-full bg-gray-200">
                {property.images?.[0] ? (
                    <img
                        src={property.images[0].url}
                        alt={property.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                )}
                <div className="absolute inset-0 bg-black/30"></div>
                <div className="absolute bottom-0 left-0 w-full p-8 md:p-16 bg-linear-to-t from-black/80 to-transparent">
                    <div className="container mx-auto">
                        <div className="flex flex-wrap gap-2 mb-4">
                            {property.status_badge?.map((badge, i) => (
                                <span key={i} className="bg-[var(--color-accent)] text-white px-3 py-1 text-xs font-bold tracking-widest uppercase rounded-sm">
                                    {badge}
                                </span>
                            ))}
                            <span className="bg-[var(--color-primary)]/90 text-white px-3 py-1 text-xs font-bold tracking-widest uppercase rounded-sm">
                                {property.location}
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-5xl font-display font-bold text-white mb-2">{property.name}</h1>
                        <p className="text-xl text-gray-200 font-serif">{property.price_jpn} <span className="text-sm opacity-70">({property.price_local})</span></p>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-12">
                    <section>
                        <h2 className="text-2xl font-display font-bold text-[var(--color-text-main)] mb-6 border-b border-[var(--color-accent)]/20 pb-4">物件概要</h2>
                        <div className="prose max-w-none font-serif text-[var(--color-text-sub)] leading-relaxed whitespace-pre-wrap">
                            {property.description}
                        </div>
                    </section>

                    <section>
                        <h2 className="text-2xl font-display font-bold text-[var(--color-text-main)] mb-6 border-b border-[var(--color-accent)]/20 pb-4">物件スペック</h2>
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div className="border-b border-[var(--color-border)] pb-2">
                                <dt className="text-xs text-[var(--color-accent)] font-bold tracking-widest mb-1 uppercase">Location</dt>
                                <dd className="font-serif text-lg">{property.location}</dd>
                            </div>
                            <div className="border-b border-[var(--color-border)] pb-2">
                                <dt className="text-xs text-[var(--color-accent)] font-bold tracking-widest mb-1 uppercase">Price (JPN)</dt>
                                <dd className="font-serif text-lg">{property.price_jpn}</dd>
                            </div>
                            <div className="border-b border-[var(--color-border)] pb-2">
                                <dt className="text-xs text-[var(--color-accent)] font-bold tracking-widest mb-1 uppercase">Unit Price (/sqm)</dt>
                                <dd className="font-serif text-lg">{property.unit_price_sqm || '-'}</dd>
                            </div>
                            <div className="border-b border-[var(--color-border)] pb-2">
                                <dt className="text-xs text-[var(--color-accent)] font-bold tracking-widest mb-1 uppercase">Installment</dt>
                                <dd className="font-serif text-lg">
                                    {property.installment_48 ? '48回分割可能' : '一括払い / ローン'}
                                </dd>
                            </div>
                            {property.infrastructure_dist && (
                                <div className="border-b border-[var(--color-border)] pb-2 md:col-span-2">
                                    <dt className="text-xs text-[var(--color-accent)] font-bold tracking-widest mb-1 uppercase">Access</dt>
                                    <dd className="font-serif text-lg">{property.infrastructure_dist}</dd>
                                </div>
                            )}
                        </dl>
                    </section>
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-[var(--color-primary)]/5 p-8 shadow-lg border border-[var(--color-border)] sticky top-24 rounded-lg">
                        <h3 className="text-xl font-display font-bold text-[var(--color-text-main)] mb-6 text-center">お問い合わせ</h3>
                        <p className="text-[var(--color-text-sub)] text-sm mb-8 text-center">
                            本物件の詳細資料（フロアプラン、利回りシミュレーション）をご希望の方は、以下よりお問い合わせください。
                        </p>
                        <div className="space-y-4">
                            <Link href="/inquiry" className="block w-full text-center bg-[var(--color-accent)] text-white py-4 rounded font-bold shadow-md hover:brightness-110 transition-all">
                                資料請求（無料）
                            </Link>
                            <Link href="/simulation" className="block w-full text-center border border-[var(--color-accent)] text-[var(--color-accent)] py-4 rounded font-bold shadow-sm hover:bg-[var(--color-accent)] hover:text-white transition-all">
                                収支シミュレーション依頼
                            </Link>
                            <Link href={siteConfig.cta?.lineUrl || "https://line.me/"} className="block w-full text-center bg-[#06C755] text-white py-4 rounded font-bold shadow-md hover:bg-[#05b34c] transition-colors">
                                LINEで質問する
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </article>
    );
}
