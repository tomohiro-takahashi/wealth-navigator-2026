import { getDetailBySlug } from '@/lib/microcms';
import { getLocalArticles } from '@/lib/local-articles';
import matter from 'gray-matter';
import { notFound } from 'next/navigation';
import { Article } from '@/types';
import { DynamicCTA } from '@/components/cta/DynamicCTA';
import { ExpertTip } from '@/components/articles/ExpertTip';
import { ArticleTOC } from '@/components/articles/ArticleTOC';
import { injectTOCIds, processArticleContent } from '@/lib/html-utils';
import { Metadata } from 'next';
import { getCategoryLabelSync, cn } from '@/lib/utils';
import Image from 'next/image';
import parse, { Element, domToReact as domNodeToReact } from 'html-react-parser';
import { ImageWithPlaceholder } from '@/components/articles/ImageWithPlaceholder';
import { ArticleEyecatch } from '@/components/articles/ArticleEyecatch';
import { getSiteConfig } from '@/site.config';
import { marked } from 'marked';


// キャッシュの設定: ISR (60秒)
// キャッシュの設定: ISR 無効化

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const siteConfig = await getSiteConfig();
    try {
        // 1. Try local files
        const localArticles = getLocalArticles();
        let article = localArticles.find(a => a.slug === slug);

        // 2. Try CMS
        if (!article) {
            article = await getDetailBySlug(slug, 'articles') as Article;
        }

        if (!article) return { title: `Not Found | ${siteConfig.name}` };

        const title = article.meta_title ? `${article.meta_title} | ${siteConfig.name}` : `${article.title} | ${siteConfig.name}`;
        const description = article.meta_description || article.content.replace(/<[^>]+>/g, '').slice(0, 120) + '...';
        const keywords = article.keywords ? article.keywords.split(',') : [];
        const imageUrl = article.eyecatch?.url || `/images/articles/${slug}/01.webp`;

        return {
            title,
            description,
            keywords,
            openGraph: {
                title,
                description,
                images: [imageUrl],
                type: 'article',
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
                images: [imageUrl],
            },
        };
    } catch {
        return {
            title: `記事詳細 | ${siteConfig.name}`,
        };
    }
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const initialConfig = await getSiteConfig();

    let article: Article | null = null;

    // 1. Try local files first
    const localArticles = getLocalArticles();
    article = localArticles.find(a => a.slug === slug) || null;

    // 2. Fallback to microCMS
    if (!article) {
        try {
            article = await getDetailBySlug(slug, 'articles') as Article;
        } catch (e) {
            console.error(e);
        }
    }

    if (!article) {
        notFound();
    }

    // [IMPORTANT] Override siteConfig based on article.site_id if available
    // This ensures Flip articles look like Flip even on localhost (which defaults to subsidy)
    let siteConfig = initialConfig;
    if (article.site_id && article.site_id !== initialConfig.site_id) {
        siteConfig = await getSiteConfig(article.site_id as any);
        console.log(`[DEBUG] Overriding brand to: ${article.site_id} for article: ${slug}`);
    }

    // Date formatting
    const formattedDate = new Date(article.publishedAt).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });


    // Process Content
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

    // Help to get category color
    const getCategoryColor = (catId: string) => {
        const colors: Record<string, string> = {
            'find': 'bg-blue-600',
            'renovate': 'bg-emerald-600',
            'operate': 'bg-amber-600',
            'exit': 'bg-rose-600',
            'learn': 'bg-indigo-600',
            'guide': 'bg-teal-600',
            'howto': 'bg-orange-600'
        };
        return colors[catId] || 'bg-[var(--color-accent)]';
    };

    return (
        <article className="min-h-screen bg-[var(--color-background)] text-[var(--color-text-main)] selection:bg-[var(--color-accent)] selection:text-white">
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
                {siteConfig.site_id === 'subsidy' || siteConfig.site_id === 'legacy' ? (
                    // Subtle dark gradient at the bottom for text legibility, but keeping main photo clear
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />
                ) : (
                    <>
                        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-primary)]/60 via-[var(--color-primary)]/40 to-[var(--color-primary)] z-10" />
                        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-primary)]/60 via-[var(--color-primary)]/40 to-[var(--color-primary)] z-10" />
                    </>
                )}
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
                            <span key={cat} className={cn(
                                "text-white text-[10px] font-bold px-3 py-1 tracking-widest uppercase rounded-sm shadow-sm",
                                getCategoryColor(cat)
                            )}>
                                {getCategoryLabelSync(cat, siteConfig)}
                            </span>
                        ))}
                    </div>
                    <h1 className={`${siteConfig.theme.typography.h2 || "text-3xl md:text-5xl font-serif"} font-bold leading-tight mb-6 text-white text-shadow-lg`}>
                        {article.title}
                    </h1>
                    <div className="flex items-center text-sm text-gray-200 font-sans tracking-wide">
                        <time dateTime={article.publishedAt} className="mr-6 border-r border-gray-500 pr-6">
                            {formattedDate}
                        </time>
                        {article.author && (
                            <span>By {article.author}</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="mb-12">
                <ArticleEyecatch
                    image={article.eyecatch}
                    title={article.title}
                    config={siteConfig}
                    slug={article.slug}
                />
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
                        "prose prose-lg max-w-none font-sans leading-loose",
                        // Invert colors for dark themes
                        (siteConfig.site_id === 'subsidy' || siteConfig.site_id === 'kominka' || siteConfig.site_id === 'flip' || siteConfig.site_id === 'legacy') ? "prose-invert" : "",
                        // Headings
                        (siteConfig.site_id === 'subsidy' || siteConfig.site_id === 'kominka' || siteConfig.site_id === 'flip' || siteConfig.site_id === 'legacy')
                            ? "prose-headings:text-white" 
                            : "prose-headings:text-[var(--color-text-main)]",
                        `${siteConfig.theme.typography.fontFamily === 'serif' ? 'prose-headings:font-serif' : 'prose-headings:font-sans'}`,

                        // H1 Style
                        "prose-h1:text-2xl md:prose-h1:text-4xl prose-h1:leading-tight",

                        // H2 Style: Dynamic border color
                        "prose-h2:text-2xl prose-h2:mt-16 prose-h2:mb-8 prose-h2:pl-6 prose-h2:border-l-4 prose-h2:border-[var(--color-accent)]",

                        // H3 Style
                        "prose-h3:text-xl prose-h3:mt-12 prose-h3:mb-6 prose-h3:text-[var(--color-accent)]",

                        // Text Elements
                        siteConfig.site_id === 'subsidy' || siteConfig.site_id === 'kominka'
                            ? "prose-p:text-white/90 prose-p:mb-8"
                            : "prose-p:text-[var(--color-text-main)] prose-p:mb-8",
                        "prose-a:text-[var(--color-link)] prose-a:no-underline hover:prose-a:underline",
                        "prose-blockquote:border-l-[var(--color-accent)] prose-blockquote:bg-[var(--color-primary)]/5 prose-blockquote:py-4 prose-blockquote:px-6 prose-blockquote:not-italic prose-blockquote:text-[var(--color-text-sub)]",
                        // Wealth (Light theme) should be dark, others (Dark themes) should be white
                        siteConfig.site_id === 'wealth' 
                            ? "prose-strong:text-[#1A1A1A] prose-strong:font-bold" 
                            : "prose-strong:text-white prose-strong:font-bold",
                        "prose-img:rounded-xl prose-img:shadow-2xl prose-img:border prose-img:border-black/5",
                        siteConfig.site_id === 'subsidy' || siteConfig.site_id === 'kominka' || siteConfig.site_id === 'flip' || siteConfig.site_id === 'legacy'
                            ? "prose-li:text-white/80"
                            : "prose-li:text-[var(--color-text-main)]",

                        // Table styles
                        "prose-table:w-full prose-table:border-collapse prose-table:my-10 prose-table:border prose-table:border-[var(--color-border)] prose-table:rounded-lg prose-table:overflow-hidden",
                        "prose-thead:bg-[var(--color-primary)]/5 prose-thead:text-[var(--color-text-main)] prose-thead:border-b prose-thead:border-[var(--color-border)]",
                        "prose-th:py-4 prose-th:px-6 prose-th:text-left prose-th:font-serif prose-th:font-bold prose-th:tracking-wider prose-th:text-sm",
                        "prose-td:py-4 prose-td:px-6 prose-td:border-b prose-td:border-[var(--color-border)] prose-td:text-[var(--color-text-main)] prose-td:text-sm",
                        "prose-tr:hover:bg-[var(--color-primary)]/5 prose-tr:transition-colors",
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
                        <DynamicCTA mode={article.cta_mode} config={siteConfig} />
                    </div>

                    {/* Target Yield Info - Hidden on Kominka */}
                    {article.target_yield && siteConfig.site_id !== 'kominka' && (
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
