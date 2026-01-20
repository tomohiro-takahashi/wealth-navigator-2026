import { getList } from '@/lib/microcms';

import { Article, Property } from '@/types';
import { getCategoryLabel } from '@/lib/utils';
import Link from 'next/link';

// ISR Configuration
export const revalidate = 60;

// Helper to calculate read time
const calculateReadTime = (content: string) => {
  const text = content.replace(/<[^>]+>/g, '');
  const charCount = text.length;
  // Assuming 400 characters per minute reading speed
  return Math.ceil(charCount / 400) + '分で読めます';
};

// Helper to strip HTML and truncate
const getSummary = (content: string, limit: number = 80) => {
  const text = content.replace(/<[^>]+>/g, '');
  return text.length > limit ? text.substring(0, limit) + '...' : text;
};

export default async function Home() {
  // 1. Fetch Data
  // Switch to MicroCMS for consistency with production deployment
  const [propertiesData, articlesData] = await Promise.all([
    getList('properties', { limit: 3 }),
    getList('articles', { limit: 10 }), // Fetch latest 10 articles
  ]);

  const properties = propertiesData.contents as Property[];

  // Map MicroCMS articles to Article type, adding image fallback
  // Since we skipped MicroCMS image upload, we construct the path from the slug.
  const articles = (articlesData.contents as Article[]).map(article => ({
    ...article,
    eyecatch: article.eyecatch || {
      url: `/images/articles/${article.slug}/01.webp`, // Fallback to local Vercel-hosted image
      height: 600,
      width: 800
    },
    // Ensure category is typed correctly if needed, though casting above handles it loosely
  }));

  // ... property fallback logic ...

  // 2. Identify Featured Article (Must Read)
  const featuredArticle = articles.find(a => a.is_featured || a.badge_text) || articles[0];

  // 3. Identify List Articles (Exclude Featured)
  const listArticles = articles.filter(a => a.id !== featuredArticle?.id).slice(0, 5); // Show top 5 recent


  // Category Navigation Data
  const categoryNavs = [
    { label: '国内不動産投資', id: 'domestic', icon: 'apartment' },
    { label: '海外不動産投資', id: 'overseas', icon: 'public' },
    { label: '資産形成コラム', id: 'column', icon: 'account_balance' },
  ];

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#161410] font-sans">

      {/* =======================================================================
          DARK ZONE: Header, Hero, Articles
      ======================================================================== */}
      <div className="text-[#f2f0ed]">

        {/* Header & Hero Section */}
        <header className="relative bg-[#161410] text-white">
          <div className="sticky top-0 z-50 flex h-16 w-full items-center justify-between bg-[#161410]/95 px-5 border-b border-white/5 backdrop-blur-sm">
            <button className="flex h-12 w-12 items-center justify-center rounded-full text-[#c59f59] transition-colors hover:text-white active:bg-white/5">
              <span className="material-symbols-outlined text-[32px]">menu</span>
            </button>
            <h1 className="flex-1 text-center text-lg font-bold tracking-wide text-white/90">
              Wealth Navigator
            </h1>
            <button className="flex h-12 w-12 items-center justify-center rounded-full text-[#c59f59] transition-colors hover:text-white active:bg-white/5">
              <span className="material-symbols-outlined text-[28px]">search</span>
            </button>
          </div>

          {/* Key Visual Area */}
          {/* Key Visual Area */}
          <div className="relative flex w-full flex-col items-center justify-center px-6 pt-20 pb-20">
            {/* Background Effect */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#4a4235] via-[#161410] to-[#161410] opacity-60 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col items-center text-center gap-12 w-full max-w-2xl mx-auto">
              <div className="space-y-8">
                <h2
                  className="text-[40px] md:text-[44px] font-medium leading-[1.2] tracking-wide text-white drop-shadow-2xl font-serif"
                  style={{ fontSize: '40px' }} // Fallback/Force for immediate verification
                >
                  一流を、<br />再定義する。
                </h2>
                <p className="text-lg font-light leading-relaxed tracking-wide text-gray-300 font-serif">
                  現代のビジョナリーへ贈る、<br />至高のインサイト。
                </p>
              </div>

              <Link href="/diagnosis" className="group relative flex h-16 w-full max-w-md mx-auto items-center justify-center gap-3 rounded-md bg-gradient-to-r from-[#c59f59] to-[#b88f45] px-8 text-lg font-bold text-[#161410] transition-all hover:brightness-110 active:scale-[0.98] shadow-[0_0_25px_rgba(197,159,89,0.3)]">
                <span>資産ポートフォリオを診断する</span>
                <span className="material-symbols-outlined text-2xl transition-transform group-hover:translate-x-1">arrow_forward</span>
                <div className="absolute inset-0 rounded-md ring-1 ring-inset ring-white/20 pointer-events-none"></div>
              </Link>
              <Link href="/about" className="mt-2 flex h-14 w-full max-w-md mx-auto items-center justify-center gap-2 rounded-md border border-[#c59f59] bg-transparent px-8 text-base font-medium text-white transition-all duration-300 hover:bg-[#c59f59] hover:text-[#161410] active:scale-[0.98]">
                <span>About us 私たちについて</span>
              </Link>
            </div>
          </div>
        </header>

        {/* Main Content Wrapper (Overlapping Card Style) */}
        <main className="rounded-t-[2.5rem] bg-[#23201b] relative z-20 shadow-[0_-16px_40px_rgba(0,0,0,0.6)] border-t border-white/5 overflow-hidden -mt-12">
          <div className="bg-[#23201b] px-6 pt-12 pb-16">
            <div className="w-full max-w-md mx-auto">

              {/* Navigation Menu (Domestic/Overseas/Column) */}
              <div className="flex flex-col gap-4 mb-14">
                {categoryNavs.map((nav) => (
                  <Link key={nav.id} href={`/articles?category=${nav.id}`} className="flex w-full items-center justify-between rounded-lg bg-[#2c2822] border border-white/5 px-6 py-5 shadow-sm transition-all hover:bg-white/5 hover:border-[#c59f59]/50 group active:scale-[0.99]">
                    <div className="flex items-center gap-4">
                      <span className="material-symbols-outlined text-[#c59f59] text-[28px]">
                        {nav.icon}
                      </span>
                      <span className="text-[19px] font-bold tracking-wide text-[#f2f0ed]">{nav.label}</span>
                    </div>
                    <span className="material-symbols-outlined text-white/20 group-hover:text-[#c59f59] transition-colors">chevron_right</span>
                  </Link>
                ))}
              </div>

              {/* Featured Article (Must Read) */}
              {featuredArticle && (
                <div className="flex flex-col gap-12">
                  <Link href={`/articles/${featuredArticle.slug}`} className="group relative flex flex-col gap-6 cursor-pointer">
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg shadow-2xl ring-1 ring-white/5">
                      <div
                        className="absolute inset-0 bg-gray-700 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                        style={{ backgroundImage: `url('${featuredArticle.eyecatch?.url || '/luxury-apartment.png'}')` }}

                      ></div>
                      <div className="absolute inset-0 bg-gradient-to-t from-[#161410]/90 via-[#161410]/20 to-transparent"></div>
                      <div className="absolute left-0 top-0 bg-[#c59f59] px-5 py-2 shadow-lg rounded-br-lg">
                        <span className="text-sm font-bold text-[#161410] tracking-[0.2em]">{featuredArticle.badge_text || '必読'}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-3 text-[15px] font-medium text-[#dcc18b]">
                        <span className="font-bold border-b border-[#c59f59]/30 pb-0.5">
                          {featuredArticle.category && featuredArticle.category.length > 0
                            ? getCategoryLabel(featuredArticle.category[0])
                            : 'Featured'}
                        </span>
                        <span className="size-1 rounded-full bg-[#c59f59]/50"></span>
                        <span>{calculateReadTime(featuredArticle.content)}</span>
                      </div>
                      <h3 className="font-serif text-[28px] font-bold leading-[1.4] tracking-tight text-white group-hover:text-[#dcc18b] transition-colors">
                        {featuredArticle.title}
                      </h3>
                      <p className="line-clamp-3 text-[17px] leading-[1.8] text-gray-400">
                        {getSummary(featuredArticle.content)}
                      </p>
                    </div>
                  </Link>

                  <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                  {/* Latest Articles Header */}
                  <div className="flex items-center gap-3 mb-2">
                    <span className="h-6 w-1 bg-[#c59f59] rounded-full"></span>
                    <h3 className="text-xl font-bold text-white tracking-wide">Latest Articles</h3>
                  </div>

                  {/* Article List */}
                  <div className="flex flex-col gap-10">
                    {listArticles.map((article) => (
                      <Link key={article.id} href={`/articles/${article.slug}`} className="group flex flex-col gap-4 cursor-pointer">
                        <div className="flex gap-5 items-start">
                          <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-lg bg-[#2c2822] shadow-lg ring-1 ring-white/5">
                            <div
                              className="h-full w-full bg-gray-700 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                              style={{ backgroundImage: `url(${article.eyecatch?.url || '/luxury-apartment.png'})` }}
                            ></div>
                          </div>
                          <div className="flex flex-col justify-center min-h-[112px] py-1">
                            <span className="text-sm font-bold text-[#dcc18b] mb-2">
                              {article.category && article.category.length > 0
                                ? getCategoryLabel(article.category[0])
                                : 'Update'}
                            </span>
                            <h4 className="line-clamp-3 text-[19px] font-bold leading-[1.5] text-[#f2f0ed] group-hover:text-[#dcc18b] transition-colors font-serif">
                              {article.title}
                            </h4>
                          </div>
                        </div>
                        <div className="h-px w-full bg-white/5 last:hidden"></div>
                      </Link>
                    ))}
                  </div>

                  <Link href="/articles" className="mt-4 w-full text-center rounded-md border border-white/10 bg-white/5 py-5 text-[17px] font-bold text-gray-300 transition-colors hover:border-[#c59f59] hover:text-[#c59f59] hover:bg-white/10">
                    記事一覧を見る
                  </Link>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* =======================================================================
          LIGHT ZONE: Premium Selection, Philosophy, Footer
      ======================================================================== */}
      <div className="bg-[#F8F9FA] text-gray-900 relative z-20">

        {/* Premium Selection */}
        <section className="px-6 py-20">
          <div className="w-full max-w-md mx-auto">
            <div className="flex flex-col items-center mb-12">
              <span className="text-[#c59f59] font-bold tracking-widest text-xs uppercase mb-3">Premium Selection</span>
              <h2 className="font-serif text-4xl font-bold text-gray-900 text-center">厳選された物件</h2>
              <div className="h-1 w-12 bg-[#c59f59] mt-6"></div>
            </div>
            <div className="flex flex-col gap-14">
              {properties.map((prop) => (
                <Link key={prop.id} href={`/properties/${prop.id}`} className="group cursor-pointer">
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
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-baseline justify-between border-b border-gray-200 pb-2">
                      <span className="text-xs font-bold text-[#c59f59] tracking-widest uppercase">{prop.location}</span>
                      <span className="font-bold text-lg text-gray-800">{prop.price}</span>
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-gray-900 leading-snug group-hover:text-[#c59f59] transition-colors pt-1">
                      {prop.name}
                    </h3>
                    <p className="text-[16px] leading-relaxed text-gray-600 line-clamp-2">
                      {getSummary(prop.description || '', 60)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>

            <Link href="/properties" className="mt-14 block w-full text-center rounded-md border border-gray-300 bg-white py-5 text-[17px] font-bold text-gray-900 transition-colors hover:border-[#c59f59] hover:text-[#c59f59] shadow-sm hover:shadow-md">
              すべての物件を見る
            </Link>
          </div>
        </section>

        {/* Philosophy Section */}
        <section className="px-6 pt-10 pb-20 bg-[#F8F9FA]">
          <div className="w-full max-w-md mx-auto text-center space-y-6">
            <span className="text-[#c59f59] text-sm font-bold tracking-widest uppercase">Our Philosophy</span>
            <h3 className="font-serif text-2xl font-bold text-gray-900">
              真の豊かさとは、<br />選択肢を持つこと。
            </h3>
            <p className="text-gray-600 leading-relaxed text-sm text-center font-medium tracking-wide">
              資産とは、数字の羅列ではない。それは、選択肢である。<br />
              望む場所に住み、望む時間を生き、望む人々と過ごす。<br />
              その自由を手にするための、静かなる力である。<br /><br />
              知識こそが、最強の防衛策。<br />
              そして、真の自由への最短距離である。
            </p>
          </div>
        </section>

        {/* Footer */}

      </div>

      {/* Bottom Nav */}

    </div>
  );
}
