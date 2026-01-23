import Link from 'next/link';
import { Article } from '@/types';
import { getCategoryLabel } from "@/lib/cms-utils";

type ArticleCardProps = {
    article: Article;
};

export const ArticleCard = async ({ article }: ArticleCardProps) => {
    const labels = await Promise.all(
        (article.category || []).map(cat => getCategoryLabel(cat))
    );

    return (
        <Link href={`/articles/${article.id}`} className="group block h-full">
            <div className="bg-white h-full shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100">
                {/* Image Container */}
                <div className="relative aspect-[16/9] overflow-hidden bg-gray-200">
                    {article.eyecatch ? (
                        <img
                            src={article.eyecatch.url}
                            alt={article.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 font-serif">
                            No Image
                        </div>
                    )}
                    {/* Categories */}
                    <div className="flex flex-wrap gap-1 mb-2">
                        {labels.map((label, i) => (
                            <span key={i} className="text-[10px] font-bold tracking-widest uppercase text-accent border border-accent/20 px-2 py-0.5 rounded-sm">
                                {label}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="flex items-center text-xs text-muted mb-3 space-x-2">
                        <time dateTime={article.publishedAt}>
                            {new Date(article.publishedAt).toLocaleDateString('ja-JP', {
                                year: 'numeric',
                                month: '2-digit',
                                day: '2-digit',
                            })}
                        </time>
                    </div>
                    <h3 className="text-lg font-serif font-bold text-gray-900 leading-snug mb-3 group-hover:text-primary transition-colors line-clamp-2">
                        {article.title}
                    </h3>
                    {/* 簡易的な抜粋があればここに表示 */}
                    {article.content && (
                        <p className="text-sm text-gray-500 line-clamp-2 font-serif opacity-80">
                            {article.content.replace(/<[^>]+>/g, '')}
                        </p>
                    )}
                </div>
            </div>
        </Link>
    );
};
