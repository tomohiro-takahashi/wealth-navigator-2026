import { getDetailBySlug } from '@/lib/microcms';
import { notFound } from 'next/navigation';
import { Article } from '@/types';
import { DynamicCTA } from '@/components/cta/DynamicCTA';
import { ExpertTip } from '@/components/articles/ExpertTip';
import { ArticleTOC } from '@/components/articles/ArticleTOC';
import { injectTOCIds, processArticleContent } from '@/lib/html-utils';
import { Metadata } from 'next';
import { getCategoryLabel, cn } from '@/lib/utils';
import Image from 'next/image';
import parse, { Element, domToReact as domNodeToReact } from 'html-react-parser';
import { ImageWithPlaceholder } from '@/components/articles/ImageWithPlaceholder';
import { siteConfig } from '@/site.config';

// キャッシュの設定: ISR (60秒)
export const revalidate = 60;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    try {
        const article = await getDetailBySlug(slug, 'articles') as Article;
        if (!article) return { title: `Not Found | ${siteConfig.name}` };

        return {
            title: article.meta_title ? `${article.meta_title} | ${siteConfig.name}` : `${article.title} | ${siteConfig.name}`,
            description: article.meta_description || article.content.replace(/<[^>]+>/g, '').slice(0, 120) + '...',
            keywords: article.keywords ? article.keywords.split(',') : [],
        };
    } catch {
        return {
            title: `記事詳細 | ${siteConfig.name}`,
        };
    }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    let article: Article | null = null;
    try {
        article = await getDetailBySlug(slug, 'articles') as Article;
    } catch (e) {
        console.error(e);
    }

    if (!article) {
        notFound();
    }

    // Date formatting
    const formattedDate = new Date(article.publishedAt).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });


    // Process Content (Markdown -> HTML + Frontmatter Strip + TOC + Image Injection)
    const { html: contentWithIds, toc } = await processArticleContent(article.content);

    // Auto-Injection State
    let h2Count = 0;
    console.log(`[DEBUG] Rendering article content for slug: ${article.slug}`);

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
            name: article.author || `${siteConfig.name} 編集部`,
        },
        publisher: {
            '@type': 'Organization',
            name: siteConfig.name,
            logo: {
                '@type': 'ImageObject',
                url: 'https://wealth-navigator.com/logo.png', // 仮のURL
            }
        }
    };

    return (
        <article className="min-h-screen bg-[#1A1A1B] text-white selection:bg-accent selection:text-white">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
            />

            {/* Scroll Progress Bar (Simplified - fixed top) */}
            <div className="fixed top-0 left-0 w-full h-[2px] bg-white/10 z-50">
                <div className="h-full bg-accent" style={{ width: '0%' }} id="scroll-progress"></div>
            </div>

            {/* Dark Hero Section */}
            <div className="relative h-[60vh] w-full overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/60 via-primary/40 to-primary z-10" />
                <div className="absolute inset-0 bg-gradient-to-b from-primary/60 via-primary/40 to-primary z-10" />
                <Image
                    src={article.eyecatch?.url || `/images/articles/${article.slug}/01.webp`}
                    alt={article.title}
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute bottom-0 left-0 w-full max-w-4xl mx-auto px-4 pb-12 z-20">
                    <div className="flex gap-3 mb-6">
                        {article.category?.map((cat) => (
                            <span key={cat} className="bg-accent/90 text-primary text-xs font-bold px-3 py-1 tracking-widest uppercase rounded-sm">
                                {getCategoryLabel(cat)}
                            </span>
                        ))}
                    </div>
                    <h1 className="text-3xl md:text-5xl font-serif font-bold leading-tight mb-6 text-shadow-lg">
                        {article.title}
                    </h1>
                    <div className="flex items-center text-sm text-gray-300 font-sans tracking-wide">
                        <time dateTime={article.publishedAt} className="mr-6 border-r border-gray-500 pr-6">
                            {formattedDate}
                        </time>
                        {article.author && (
                            <span>By {article.author}</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Content Layout */}
            <div className="container mx-auto px-4 py-12 flex flex-col lg:flex-row gap-12 relative max-w-6xl">
                {/* Sidebar TOC */}
                <aside className="hidden lg:block w-64 flex-shrink-0">
                    <ArticleTOC toc={toc} />
                </aside>

                {/* Main Content */}
                <div className="flex-1 max-w-3xl">
                    {/* Expert Tip (Verdict) */}
                    {article.expert_tip && (
                        <ExpertTip content={article.expert_tip} />
                    )}

                    {/* Body */}
                    <div className={cn(
                        "prose prose-lg prose-invert max-w-none font-sans leading-loose",
                        "prose-headings:font-serif prose-headings:font-bold prose-headings:text-white",
                        // H1 Style: Reduce size on mobile
                        "prose-h1:text-2xl md:prose-h1:text-4xl prose-h1:leading-tight",
                        // H2 Style: Gold vertical bar
                        "prose-h2:text-2xl prose-h2:mt-16 prose-h2:mb-8 prose-h2:pl-6 prose-h2:border-l-4 prose-h2:border-accent",
                        // H3 Style
                        "prose-h3:text-xl prose-h3:mt-12 prose-h3:mb-6 prose-h3:text-accent",
                        "prose-p:text-gray-300 prose-p:mb-8",
                        "prose-a:text-accent prose-a:no-underline hover:prose-a:underline",
                        "prose-blockquote:border-l-accent prose-blockquote:bg-white/5 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:not-italic prose-blockquote:text-gray-200",
                        "prose-strong:text-white prose-strong:font-bold",
                        "prose-img:rounded-xl prose-img:shadow-2xl prose-img:border prose-img:border-white/10",
                        "prose-li:text-gray-300",
                        // Table styles (Dark)
                        "prose-table:w-full prose-table:border-collapse prose-table:my-10 prose-table:border prose-table:border-white/10 prose-table:rounded-lg prose-table:overflow-hidden",
                        "prose-thead:bg-white/5 prose-thead:text-accent prose-thead:border-b prose-thead:border-white/10",
                        "prose-th:py-4 prose-th:px-6 prose-th:text-left prose-th:font-serif prose-th:font-bold prose-th:tracking-wider prose-th:text-sm",
                        "prose-td:py-4 prose-td:px-6 prose-td:border-b prose-td:border-white/5 prose-td:text-gray-300 prose-td:text-sm",
                        "prose-tr:hover:bg-white/5 prose-tr:transition-colors",
                        article.math_enabled && "math-enabled"
                    )}>
                        {parse(contentWithIds, {
                            replace: (domNode) => {
                                // Debug: Log all nodes? No, too noisy.

                                // 1. Existing <img /> replacement
                                if (domNode instanceof Element && domNode.name === 'img') {
                                    // ... existing ... (using original code here via wildcard or just assuming it's part of context? Better to rewrite block)
                                    // Actually, let's keep it simple. I will just replace the WHOLE replace function to be safe and insert logs.
                                    const { src, alt, width, height } = domNode.attribs;
                                    return (
                                        <ImageWithPlaceholder
                                            src={src}
                                            alt={alt || ''}
                                            width={width}
                                            height={height}
                                            hideOnError={false} // Debug: show errors
                                            className="w-full h-auto rounded-lg my-6 md:max-w-2xl mx-auto"
                                        />
                                    );
                                }

                                // 2. Auto-Injection Check
                                if (domNode instanceof Element && domNode.name === 'h2') {
                                    h2Count++;
                                    console.log(`[DEBUG] Found H2 tag #${h2Count} in article: ${article.slug}`);

                                    if (h2Count <= 3) {
                                        const imgNum = String(h2Count).padStart(2, '0');
                                        const imgSrc = `/images/articles/${article.slug}/${imgNum}.webp`;

                                        console.log(`[DEBUG] Injecting image: ${imgSrc}`);

                                        const prev = (domNode as any).prev;
                                        if (prev && (prev.name === 'img' || prev.name === 'figure')) {
                                            console.log(`[DEBUG] Skipping injection: Previous element is ${prev.name}`);
                                            return domNodeToReact([domNode]);
                                        }

                                        return (
                                            <>
                                                <ImageWithPlaceholder
                                                    src={imgSrc}
                                                    alt={`${article.title} - Image ${imgNum}`}
                                                    width={1200}
                                                    height={630}
                                                    hideOnError={false} // FORCE DEBUG DISPLAY
                                                    className="w-full h-auto rounded-lg my-6 md:max-w-2xl mx-auto"
                                                />
                                                {domNodeToReact([domNode])}
                                            </>
                                        );
                                    }
                                }
                                // 3. Table Horizontal Scroll Wrapper
                                if (domNode instanceof Element && domNode.name === 'table') {
                                    return (
                                        <div className="overflow-x-auto w-full my-6 block border border-white/10 rounded-lg">
                                            <table className="min-w-full text-left text-sm text-gray-300">
                                                {domNodeToReact(domNode.children as any[], {
                                                    replace: (childNode) => {
                                                        if (childNode instanceof Element && (childNode.name === 'th' || childNode.name === 'td')) {
                                                            // Optional: force nowrap here if user wanted, but CSS class above handles most.
                                                            // Let's just return children to preserve content.
                                                        }
                                                    }
                                                })}
                                            </table>
                                        </div>
                                    );
                                }
                            }
                        })}
                    </div>

                    {/* Dynamic CTA */}
                    <div className="mt-20">
                        <DynamicCTA mode={article.cta_mode} />
                    </div>

                    {/* Target Yield Info */}
                    {article.target_yield && (
                        <div className="mt-8 pt-8 border-t border-white/10">
                            <div className="flex items-center justify-between p-6 bg-white/5 rounded-xl border border-white/10">
                                <span className="font-bold text-gray-300">想定利回り</span>
                                <span className="text-3xl font-display font-bold text-accent">{article.target_yield}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </article >
    );
}
