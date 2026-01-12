import { getDetail } from '@/lib/microcms';
import { notFound } from 'next/navigation';
import { Article } from '@/types';
import { DynamicCTA } from '@/components/cta/DynamicCTA';
import { ArticleEyecatch } from '@/components/articles/ArticleEyecatch';
import { ExpertTip } from '@/components/articles/ExpertTip';
import { Metadata } from 'next';
import { getCategoryLabel, cn } from '@/lib/utils';

// キャッシュの設定: ISR (60秒)
export const runtime = "edge";
export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    try {
        const article = await getDetail(slug, 'articles') as Article;
        return {
            title: `${article.title} | Wealth Navigator`,
            description: article.content.replace(/<[^>]+>/g, '').slice(0, 120) + '...',
        };
    } catch {
        return {
            title: '記事詳細 | Wealth Navigator',
        };
    }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
    // paramsはPromiseなのでawaitが必要
    // ただし、Next.js 15以降の仕様変更を見越してPromiseで受け取るのが安全だが、
    // 現行14系ならそのままでもいける。ここでは一旦Promise型で受け取りつつ、
    // 現行仕様ではparamsはまだ非同期ではない可能性があるが、ビルドエラー回避のためawaitしておく。
    // 注意: Next.js 15からparamsはPromiseになる。

    const { slug } = await params;

    let article: Article;
    try {
        article = await getDetail(slug, 'articles') as Article;
    } catch (e) {
        console.error(e);
        notFound();
    }

    // Date formatting
    const formattedDate = new Date(article.publishedAt).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    // 構造化データ (Article)
    const articleLd = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        image: article.eyecatch?.url ? [article.eyecatch.url] : [],
        datePublished: article.publishedAt,
        dateModified: article.revisedAt || article.publishedAt,
        author: {
            '@type': 'Person',
            name: article.author || 'Wealth Navigator 編集部',
        },
        publisher: {
            '@type': 'Organization',
            name: 'Wealth Navigator',
            logo: {
                '@type': 'ImageObject',
                url: 'https://wealth-navigator.com/logo.png', // 仮のURL
            }
        }
    };

    // 構造化データ (FAQPage) - expert_tipをQ&Aに見立てる
    const faqLd = article.expert_tip ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: [{
            '@type': 'Question',
            name: 'この記事に関する専門家の見解は？',
            acceptedAnswer: {
                '@type': 'Answer',
                text: article.expert_tip
            }
        }]
    } : null;

    return (
        <article className="max-w-4xl mx-auto px-4 py-12">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
            />
            {faqLd && (
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
                />
            )}
            {/* Category Label */}
            <div className="mb-4 flex gap-2">
                {article.category?.map((cat) => (
                    <span key={cat} className="inline-block bg-primary text-white text-xs px-3 py-1 tracking-widest uppercase">
                        {getCategoryLabel(cat)}
                    </span>
                ))}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 mb-6 leading-tight">
                {article.title}
            </h1>

            {/* Meta Info */}
            <div className="flex items-center text-sm text-gray-500 mb-8 border-b border-gray-100 pb-8">
                <time dateTime={article.publishedAt} className="mr-6">
                    {formattedDate}
                </time>
                {article.author && (
                    <span>By {article.author}</span>
                )}
            </div>

            {/* Eyecatch Image */}
            <ArticleEyecatch image={article.eyecatch} title={article.title} />

            {/* Expert Tip (if exists) */}
            {article.expert_tip && (
                <ExpertTip content={article.expert_tip} />
            )}

            {/* Content Body */}
            <div className={cn(
                "prose prose-lg max-w-none font-serif text-gray-700 leading-relaxed mb-16",
                "prose-headings:font-display prose-headings:font-bold prose-headings:text-primary",
                "prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:border-l-4 prose-h2:border-accent prose-h2:pl-4 prose-h2:pb-1",
                "prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4 prose-h3:text-primary/90",
                "prose-a:text-accent prose-a:no-underline hover:prose-a:underline",
                "prose-blockquote:border-l-accent prose-blockquote:bg-gray-50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:not-italic",
                "prose-strong:text-primary/90 prose-strong:font-bold",
                "prose-img:rounded-lg prose-img:shadow-lg",
                // Table styles
                "prose-table:w-full prose-table:border-collapse prose-table:my-8 prose-table:border prose-table:border-gray-200 prose-table:rounded-sm",
                "prose-thead:bg-[#F8F9FA] prose-thead:text-primary prose-thead:border-b prose-thead:border-gray-200",
                "prose-th:py-4 prose-th:px-6 prose-th:text-left prose-th:font-serif prose-th:font-bold prose-th:tracking-wider prose-th:text-sm",
                "prose-td:py-4 prose-td:px-6 prose-td:border-b prose-td:border-gray-100 prose-td:text-gray-600 prose-td:text-sm",
                "prose-tr:hover:bg-gray-50/50 prose-tr:transition-colors",
                article.math_enabled && "math-enabled" // 数式有効時のマーカークラス
            )}>
                {/* Note: In a real app, use a library like 'html-react-parser' to safely render HTML */}
                <div dangerouslySetInnerHTML={{ __html: article.content }} />
            </div>

            {/* Dynamic CTA based on cta_mode */}
            <DynamicCTA mode={article.cta_mode} />

            {/* Target Yield Info (if exists) */}
            {article.target_yield && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                    <div className="flex items-center justify-between p-4 bg-primary/5 rounded-md">
                        <span className="font-bold text-primary">想定利回り</span>
                        <span className="text-2xl font-display font-bold text-accent">{article.target_yield}</span>
                    </div>
                </div>
            )}

        </article>
    );
}
