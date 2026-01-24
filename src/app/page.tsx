// Removing HomeHeader import and usage to fallback to Global Header
import { getList } from '@/lib/microcms';
import { Article, Property } from '@/types';
import { getCategoryLabelSync } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';
import { getSiteConfig } from '@/site.config';

// ISR Configuration
// ISR Configuration removed to force dynamic multi-site rendering

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
  const siteConfig = await getSiteConfig();

  // 1. Fetch Data
  // Switch to MicroCMS for consistency with production deployment
  const [propertiesData, articlesData] = await Promise.all([
    getList('properties', { limit: 3 }),
    getList('articles', { limit: 10 }), // Fetch latest 10 articles
  ]);

  console.log(`[DEBUG] Current Site: ${siteConfig.site_id}`);
  console.log('[DEBUG] Articles Payload:', JSON.stringify(articlesData, null, 2));
  console.log('[DEBUG] Properties Payload:', JSON.stringify(propertiesData, null, 2));

  const properties = propertiesData.contents as Property[];

  // Map MicroCMS articles to Article type, adding image fallback
  const articles = (articlesData.contents as Article[]).map(article => ({
    ...article,
    eyecatch: article.eyecatch || {
      url: `/images/articles/${article.slug}/01.webp`,
      height: 600,
      width: 800
    },
  }));

  // 2. Identify Featured Article
  const featuredArticle = articles.find(a => a.slug === siteConfig.pinnedSlug)
    || articles.find(a => a.is_featured || a.badge_text)
    || articles[0];

  // 3. Identify List Articles
  const listArticles = articles.filter(a => a.id !== featuredArticle?.id).slice(0, 5);

  // Category Navigation Data
  const categoryNavs = siteConfig.categoryNav;

  const isWealth = siteConfig.site_id === 'wealth';

  return (
    <div className={`relative flex min-h-screen w-full flex-col overflow-x-hidden font-sans ${isWealth ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-background)]'}`}>

      {/* =======================================================================
          DARK ZONE: Header, Hero, Articles
      ======================================================================== */}
      <div className={isWealth ? "text-[#f2f0ed]" : "text-[var(--color-text-main)]"}>

        {/* Header & Hero Section */}
        {/* HomeHeader removed to use Global Header */}
        <header className={`relative text-white ${isWealth ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-background)]'}`}>
          {/* spacer for fixed header if needed, or just let Hero padding handle it */}
          {/* Key Visual Area */}
// ...


          {/* Key Visual Area */}
          {/* Key Visual Area */}
          <div className="relative flex w-full flex-col items-center justify-center px-6 pt-20 pb-20">
            {/* Background Effect */}
            {siteConfig.hero.heroImage ? (
              <div className="absolute inset-0 select-none">
                <Image
                  src={siteConfig.hero.heroImage}
                  alt="Hero Background"
                  fill
                  className={`object-cover ${isWealth ? 'opacity-60' : 'opacity-100'}`}
                  priority
                />
                {isWealth ? (
                  <div className="absolute inset-0 bg-black/40" />
                ) : siteConfig.site_id === 'subsidy' ? (
                  // Subtle top and bottom shading for text legibility without obscuring the middle photo
                  <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40" />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/30" />
                )}
              </div>
            ) : (
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/10 via-[var(--color-primary)] to-[var(--color-primary)] opacity-60 pointer-events-none"></div>
            )}

            <div className="relative z-10 flex flex-col items-center text-center gap-12 w-full max-w-2xl mx-auto">
              <div className="space-y-8">
                <h2
                  className={`${siteConfig.theme.typography.h2} text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)]`}
                  style={{ fontSize: '40px' }}
                  dangerouslySetInnerHTML={{ __html: siteConfig.hero.title }}
                />
                <p
                  className={`text-[20px] font-bold leading-relaxed tracking-wide font-serif drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] ${isWealth ? 'text-gray-300' : 'text-white'}`}
                  dangerouslySetInnerHTML={{ __html: siteConfig.hero.subtitle }}
                />
              </div>

              <div className="flex flex-col items-center w-full gap-6">
                <Link href={siteConfig.hero.primaryButton.url} className="group relative flex h-16 w-full max-w-md mx-auto items-center justify-center gap-3 rounded-md bg-[var(--color-accent)] px-4 md:px-8 text-base md:text-lg font-bold text-[#161410] transition-all hover:brightness-110 active:scale-[0.98] shadow-[0_0_25px_var(--color-accent)]">
                  <span className="">{siteConfig.hero.primaryButton.text}</span>
                  <div className="absolute inset-0 rounded-md ring-1 ring-inset ring-white/20 pointer-events-none"></div>
                </Link>
                <Link href={siteConfig.hero.secondaryButton.url} className={`flex h-14 w-full max-w-md mx-auto items-center justify-center gap-2 rounded-md border border-[var(--color-accent)] px-8 text-base font-medium transition-all duration-300 hover:bg-[var(--color-accent)] hover:text-[#161410] active:scale-[0.98] ${
                  isWealth ? 'bg-transparent text-white' : siteConfig.site_id === 'subsidy' ? 'text-white bg-white/10 backdrop-blur-md border-white/30 shadow-lg' : 'text-white bg-black/40 backdrop-blur-sm'
                }`}>
                  <span>{siteConfig.hero.secondaryButton.text}</span>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content Wrapper (Overlapping Card Style) */}
        <main className={`rounded-t-[2.5rem] relative z-20 overflow-hidden ${
          isWealth 
            ? 'bg-white/5 shadow-[0_-16px_40px_rgba(0,0,0,0.6)] border-t border-white/5 -mt-12' 
            : siteConfig.site_id === 'subsidy'
              ? 'bg-[var(--color-background)] mt-12 border-t border-[var(--color-border)]/20'
              : 'bg-[var(--color-background)] mt-0 border-t border-[var(--color-border)]/10'
        }`}>
          <div className="bg-transparent px-6 pt-12 pb-16">
            <div className="w-full max-w-md mx-auto">

              {/* Navigation Menu (Dynamic Layout) */}
              <div className={siteConfig.homepageLayout === 'grid' ? "grid grid-cols-2 gap-3 mb-14" : "flex flex-col gap-4 mb-14"}>
                {categoryNavs.map((nav) => (
                  <Link 
                    key={nav.id} 
                    href={`/articles?category=${nav.id}`} 
                    className={`flex items-center justify-between rounded-lg border shadow-sm transition-all group active:scale-[0.99] ${
                      isWealth ? 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-[var(--color-accent)]/50' : 
                      siteConfig.site_id === 'flip' ? 'bg-[#151921] border-white/5 hover:bg-white/5 hover:border-[var(--color-accent)]/30' :
                      siteConfig.site_id === 'legacy' ? 'bg-gray-900 border-white/10 hover:bg-gray-800 hover:border-accent/40 text-white' :
                      'bg-white border-[var(--color-border)] hover:shadow-md'
                    } ${
                      siteConfig.homepageLayout === 'grid' ? "flex-col gap-2 p-4 text-center" : "px-6 py-5"
                    }`}
                  >
                    <div className={`flex items-center gap-4 ${siteConfig.homepageLayout === 'grid' ? "flex-col gap-2" : ""}`}>
                      <span className="material-symbols-outlined text-[var(--color-accent)] text-[28px]">
                        {nav.icon}
                      </span>
                      {siteConfig.site_id === 'flip' && (
                        <span className="text-accent text-[16px] font-mono tracking-widest uppercase mb-1 opacity-80 font-bold">knowledge</span>
                      )}
                      <span className={`${siteConfig.homepageLayout === 'grid' ? "text-sm" : "text-[19px]"} font-bold tracking-wide ${
                        isWealth ? 'text-[#f2f0ed]' : 
                        siteConfig.site_id === 'kominka' ? 'text-[#1a1a1a]' : 
                        siteConfig.site_id === 'flip' || siteConfig.site_id === 'legacy' ? 'text-white' :
                        'text-[var(--color-text-main)]'
                      }`}>{nav.label}</span>
                    </div>
                    {siteConfig.homepageLayout !== 'grid' && (
                      <span className={`material-symbols-outlined transition-colors ${
                        isWealth ? 'text-white/20 group-hover:text-[#c59f59]' : 
                        siteConfig.site_id === 'kominka' ? 'text-[#1a1a1a]/20 group-hover:text-[var(--color-accent)]' :
                        'text-[var(--color-border)] group-hover:text-[var(--color-accent)]'
                      }`}>chevron_right</span>
                    )}
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
                      <div className="absolute left-0 top-0 bg-[var(--color-accent)] px-5 py-2 shadow-lg rounded-br-lg">
                        <span className="text-sm font-bold text-[#161410] tracking-[0.2em]">{featuredArticle.badge_text || '必読'}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-3 text-[15px] font-medium text-[var(--color-accent)]">
                        <span className="font-bold border-b border-[var(--color-accent)]/30 pb-0.5">
                          {featuredArticle.category && featuredArticle.category.length > 0
                            ? getCategoryLabelSync(featuredArticle.category[0], siteConfig)
                            : 'Featured'}
                        </span>
                        <span className="size-1 rounded-full bg-[var(--color-accent)]/50"></span>
                        <span>{calculateReadTime(featuredArticle.content)}</span>
                      </div>
                      <h3 className={`font-serif text-[28px] font-bold leading-[1.4] tracking-tight group-hover:text-[var(--color-accent)] transition-colors ${isWealth ? 'text-white' : 'text-[var(--color-text-main)]'}`}>
                        {featuredArticle.title}
                      </h3>
                      <p className={`line-clamp-3 text-[17px] leading-[1.8] ${isWealth ? 'text-gray-400' : 'text-[var(--color-text-sub)]'}`}>
                        {getSummary(featuredArticle.content)}
                      </p>
                    </div>
                  </Link>

                  <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>

                  {/* Latest Articles Header */}
                  <div className="flex items-center gap-3 mb-2">
                    <span className="h-6 w-1 bg-[var(--color-accent)] rounded-full"></span>
                    <h3 className={`text-xl font-bold tracking-wide ${isWealth ? 'text-white' : 'text-[var(--color-text-main)]'}`}>Latest Articles</h3>
                  </div>

                  {/* Article List */}
                  <div className="flex flex-col gap-10">
                    {listArticles.map((article) => (
                      <Link key={article.id} href={`/articles/${article.slug}`} className="group flex flex-col gap-4 cursor-pointer">
                        <div className="flex gap-5 items-start">
                          <div className={`relative h-28 w-28 shrink-0 overflow-hidden rounded-lg shadow-lg ring-1 ring-white/5 ${isWealth ? 'bg-[#2c2822]' : 'bg-gray-100'}`}>
                            <div
                              className="h-full w-full bg-gray-700 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                              style={{ backgroundImage: `url(${article.eyecatch?.url || '/luxury-apartment.png'})` }}
                            ></div>
                          </div>
                          <div className="flex flex-col justify-center min-h-[112px] py-1">
                            <span className="text-sm font-bold text-[var(--color-accent)] mb-2">
                              {article.category && article.category.length > 0
                                ? getCategoryLabelSync(article.category[0], siteConfig)
                                : 'Update'}
                            </span>
                            <h4 className={`line-clamp-3 text-[19px] font-bold leading-[1.5] group-hover:text-[var(--color-accent)] transition-colors font-serif ${isWealth ? 'text-[#f2f0ed]' : 'text-[var(--color-text-main)]'}`}>
                              {article.title}
                            </h4>
                          </div>
                        </div>
                        <div className={`h-px w-full last:hidden ${isWealth ? 'bg-white/5' : 'bg-[var(--color-border)]/10'}`}></div>
                      </Link>
                    ))}
                  </div>

                  <Link href="/articles" className={`mt-4 w-full text-center rounded-md border py-5 text-[17px] font-bold transition-all hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] ${
                    isWealth ? 'border-white/10 bg-white/5 text-gray-300 hover:bg-white/10' : 'border-[var(--color-border)] bg-transparent text-[var(--color-text-main)]'
                  }`}>
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
      <div className={`bg-[var(--color-background)] relative z-20 ${isWealth ? 'text-gray-900' : 'text-[var(--color-text-main)]'}`}>

        {/* Premium Selection - Hidden on Kominka as requested */}
        {siteConfig.site_id !== 'kominka' && (
          <section className="px-6 py-20">
            <div className="w-full max-w-md mx-auto">
              <div className="flex flex-col items-center mb-12">
                <span className="text-[var(--color-accent)] font-bold tracking-widest text-xs uppercase mb-3">Premium Selection</span>
                <h2 className={`${siteConfig.theme.typography.h2} text-[var(--color-text-main)] text-center`}>{siteConfig.premium.title}</h2>
                <div className="h-1 w-12 bg-[var(--color-accent)] mt-6"></div>
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
                        <span className="text-xs font-bold text-[var(--color-accent)] tracking-widest uppercase">{prop.location}</span>
                        <span className="font-bold text-lg text-[var(--color-text-main)]">{prop.price}</span>
                      </div>
                      <h3 className={`${siteConfig.theme.typography.h2} text-2xl leading-snug text-[var(--color-text-main)] group-hover:text-[var(--color-accent)] transition-colors pt-1`}>
                        {prop.name}
                      </h3>
                      <p className="text-[16px] leading-relaxed text-[var(--color-text-sub)] line-clamp-2">
                        {getSummary(prop.description || '', 60)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>

              <Link href="/properties" className="mt-14 block w-full text-center rounded-md border border-[var(--color-border)] bg-[var(--color-background)] py-5 text-[17px] font-bold text-[var(--color-text-main)] transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] shadow-sm hover:shadow-md">
                {siteConfig.premium.btnText}
              </Link>
            </div>
          </section>
        )}

        {/* Philosophy Section */}
        <section className="px-6 pt-10 pb-20 bg-[var(--color-background)]">
          <div className="w-full max-w-md mx-auto text-center space-y-6">
            {siteConfig.site_id !== 'kominka' && (
              <span className="text-[var(--color-accent)] text-sm font-bold tracking-widest uppercase">Our Philosophy</span>
            )}
            <h3
              className={`${siteConfig.theme.typography.h2} text-2xl text-[var(--color-text-main)]`}
              dangerouslySetInnerHTML={{ __html: siteConfig.philosophy.title }}
            />
            <p
              className="text-[var(--color-text-sub)] leading-relaxed text-sm text-center font-medium tracking-wide"
              dangerouslySetInnerHTML={{ __html: siteConfig.philosophy.description }}
            />
          </div>
        </section>

        {/* Bottom CTA (The Bridge Banner) */}
        <section className="bg-[var(--color-background)] pb-20 px-4">
          {/* Banner Container */}
          <div
            className="max-w-5xl mx-auto rounded-2xl shadow-2xl overflow-hidden relative bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('${siteConfig.site_id === 'kominka' ? '/assets/form-kominka.jpg' : siteConfig.site_id === 'flip' ? '/assets/form-flip.jpg' : (siteConfig.cta?.image || siteConfig.bridge.image || '/images/wealth_lounge.jpg')}')`
            }}
          >

            {/* 1. Dark Overlay */}
            <div className={`absolute inset-0 ${siteConfig.site_id === 'kominka' ? 'bg-black/60' : 'bg-black/80'} z-0`}></div>

            {/* 2. Content */}
            <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="md:w-3/5 text-center md:text-left">
                <h2
                  className="text-2xl md:text-3xl font-serif text-white mb-4 leading-tight drop-shadow-md"
                  dangerouslySetInnerHTML={{ __html: siteConfig.bridge.title }}
                />
                <p
                  className="text-gray-300 text-sm md:text-base leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: siteConfig.bridge.description }}
                />
              </div>
              <div className="md:w-2/5 flex flex-col items-center w-full">
                <Link href={siteConfig.bridge.url} className="block w-full max-w-sm bg-[var(--color-accent)] text-[#161410] text-center font-bold py-4 rounded-lg shadow-[0_0_25px_var(--color-accent)] hover:shadow-xl transition-all transform hover:-translate-y-1 hover:brightness-110">
                  {siteConfig.bridge.buttonText}
                </Link>
                {siteConfig.site_id !== 'kominka' && siteConfig.site_id !== 'flip' && siteConfig.site_id !== 'legacy' && (
                  <p className="text-xs text-[var(--color-accent)] mt-3 tracking-wider opacity-90">
                    ※審査制・毎月10名様限定
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}

      </div>

      {/* Bottom Nav */}

    </div >
  );
}
