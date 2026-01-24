
import { getList } from '@/lib/microcms';
import { getUnifiedArticles } from '@/lib/cms-utils';
import Link from 'next/link';
import { Article } from '@/types';
import { getCategoryLabelSync } from '@/lib/utils';
import { Metadata } from 'next';
import { getSiteConfig } from '@/site.config';

// revalidate removed

export async function generateMetadata(): Promise<Metadata> {
    const siteConfig = await getSiteConfig();
    return {
        title: `Articles | ${siteConfig.name}`,
        description: '資産形成に関する最新コラム・投資情報',
    };
}

// Helper
const getSummary = (content: string, limit: number = 80) => {
    const text = content.replace(/<[^>]+>/g, '');
    return text.length > limit ? text.substring(0, limit) + '...' : text;
};

export default async function ArticlesPage({
    searchParams,
}: {
    searchParams: Promise<{ category?: string }>;
}) {
    const { category } = await searchParams;
    const siteConfig = await getSiteConfig();

    const articles = await getUnifiedArticles(siteConfig.site_id, {
        limit: 20,
        category: category,
    });
    const safeArticles = articles as Article[];

    return (
        <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-main)] font-sans pb-20">
            <header className="pt-24 pb-12 px-6 text-center bg-[var(--color-primary)]">
                <h1 className="text-3xl md:text-5xl font-serif font-bold tracking-wide mb-4 text-[var(--color-text-inverse)]">
                    {category ? getCategoryLabelSync(category, siteConfig) : 'Articles'}
                </h1>
                <p className="text-[var(--color-text-sub)] text-sm md:text-base opacity-80">
                    {category ? `${getCategoryLabelSync(category, siteConfig)}に関する記事一覧` : '最新の投資・資産形成コラム'}
                </p>
            </header>

            <div className="container mx-auto px-6 py-12">
                {safeArticles.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 rounded-lg border border-[var(--color-border)]">
                        <p className="text-[var(--color-text-sub)]">該当する記事は見つかりませんでした。</p>
                        <Link href="/articles" className="inline-block mt-6 text-[var(--color-accent)] border-b border-[var(--color-accent)]">
                            すべての記事を見る
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {safeArticles.map((article) => (
                            <Link key={article.id} href={`/articles/${article.slug}`} className="group flex flex-col bg-transparent rounded-lg overflow-hidden border border-[var(--color-border)] hover:border-[var(--color-accent)]/50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                                <div className="relative aspect-video w-full overflow-hidden">
                                    <div
                                        className="absolute inset-0 bg-gray-700 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                                        style={{ backgroundImage: `url('${article.eyecatch?.url || '/images/articles/' + article.slug + '/01.webp'}')` }}
                                    ></div>
                                    <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-sm px-3 py-1 rounded text-xs font-bold text-[var(--color-accent)] border border-[var(--color-accent)]/30">
                                        {article.category?.[0] ? getCategoryLabelSync(article.category[0], siteConfig) : 'News'}
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col flex-grow">
                                    <h2 className="text-xl font-bold font-serif mb-3 leading-snug group-hover:text-[var(--color-accent)] transition-colors line-clamp-2 text-[var(--color-text-main)]">
                                        {article.title}
                                    </h2>
                                    <p className="text-[var(--color-text-sub)] text-sm leading-relaxed line-clamp-3 mb-4 flex-grow">
                                        {getSummary(article.content)}
                                    </p>
                                    <div className="flex items-center justify-between text-xs text-[var(--color-text-sub)] pt-4 border-t border-[var(--color-border)]">
                                        <time>{new Date(article.publishedAt).toLocaleDateString()}</time>
                                        <span className="flex items-center gap-1 group-hover:text-[var(--color-accent)] transition-colors">
                                            Read More <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
