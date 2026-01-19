
import { getList } from '@/lib/microcms';
import Link from 'next/link';
import { Article } from '@/types';
import { getCategoryLabel } from '@/lib/utils';
import { Metadata } from 'next';

export const revalidate = 60;

export const metadata: Metadata = {
    title: 'Articles | Wealth Navigator',
    description: '資産形成に関する最新コラム・投資情報',
};

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

    // Filter logic
    const queries: any = { limit: 20 };
    if (category) {
        queries.filters = `category[contains]${category}`;
    }

    const { contents: articles } = await getList('articles', queries);
    const safeArticles = articles as Article[];

    return (
        <div className="min-h-screen bg-[#161410] text-[#f2f0ed] font-sans pb-20">
            <header className="pt-24 pb-12 px-6 text-center bg-[#23201b]">
                <h1 className="text-3xl md:text-5xl font-serif font-bold tracking-wide mb-4 text-white">
                    {category ? getCategoryLabel(category) : 'Articles'}
                </h1>
                <p className="text-gray-400 text-sm md:text-base">
                    {category ? `${getCategoryLabel(category)}に関する記事一覧` : '最新の投資・資産形成コラム'}
                </p>
            </header>

            <div className="container mx-auto px-6 py-12">
                {safeArticles.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 rounded-lg border border-white/10">
                        <p className="text-gray-400">該当する記事は見つかりませんでした。</p>
                        <Link href="/articles" className="inline-block mt-6 text-[#c59f59] border-b border-[#c59f59]">
                            すべての記事を見る
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {safeArticles.map((article) => (
                            <Link key={article.id} href={`/articles/${article.slug}`} className="group flex flex-col bg-[#2c2822] rounded-lg overflow-hidden border border-white/5 hover:border-[#c59f59]/50 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
                                <div className="relative aspect-video w-full overflow-hidden">
                                    <div
                                        className="absolute inset-0 bg-gray-700 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                                        style={{ backgroundImage: `url('${article.eyecatch?.url || '/images/articles/' + article.slug + '.webp'}')` }}
                                    ></div>
                                    <div className="absolute top-3 left-3 bg-[#161410]/80 backdrop-blur-sm px-3 py-1 rounded text-xs font-bold text-[#c59f59] border border-[#c59f59]/30">
                                        {article.category?.[0] ? getCategoryLabel(article.category[0]) : 'News'}
                                    </div>
                                </div>
                                <div className="p-6 flex flex-col flex-grow">
                                    <h2 className="text-xl font-bold font-serif mb-3 leading-snug group-hover:text-[#c59f59] transition-colors line-clamp-2">
                                        {article.title}
                                    </h2>
                                    <p className="text-gray-400 text-sm leading-relaxed line-clamp-3 mb-4 flex-grow">
                                        {getSummary(article.content)}
                                    </p>
                                    <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-white/5">
                                        <time>{new Date(article.publishedAt).toLocaleDateString()}</time>
                                        <span className="flex items-center gap-1 group-hover:text-[#c59f59] transition-colors">
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
