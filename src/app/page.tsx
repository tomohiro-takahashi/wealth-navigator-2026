import { getList } from '@/lib/microcms';
import { Article, Property } from '@/types';
import { ArticleCard } from '@/components/articles/ArticleCard';
import { PropertyCarousel } from '@/components/properties/PropertyCarousel';
import Link from 'next/link';

// 再検証時間: 60秒
export const runtime = "edge";
export const revalidate = 60;

export default async function Home() {
  // 記事全件取得（フィルタリングはフロントで行う簡易実装）
  // 本番運用ではカテゴリIDごとのクエリに分けるか、microCMSのフィルタ機能を使うのが望ましい
  const articleData = await getList('articles', { limit: 100 });
  const articles = articleData.contents as Article[];

  // 物件データ取得
  const propertyData = await getList('properties', { limit: 10 });
  const properties = propertyData.contents as Property[];

  // カテゴリ分けロジック (カテゴリIDが含まれるかで判定)
  const domesticArticles = articles.filter(a =>
    a.category?.includes('domestic')
  );
  const overseasArticles = articles.filter(a =>
    a.category?.includes('overseas')
  );
  const columnArticles = articles.filter(a =>
    a.category?.includes('column')
  );

  return (
    <div className="pb-24">
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center bg-primary overflow-hidden">
        {/* 背景装飾（本来は画像などが望ましい） */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/80 to-primary z-10"></div>
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center"></div>

        <div className="relative z-20 text-center text-white px-4 max-w-4xl mx-auto">
          <p className="text-accent tracking-[0.2em] font-medium mb-6 animate-fade-in-up">
            WEALTH NAVIGATOR
          </p>
          <h1 className="text-4xl md:text-6xl font-display font-bold leading-tight mb-8 animate-fade-in-up delay-100">
            真の豊かさを、<br className="md:hidden" />その手に。
          </h1>
          <p className="text-gray-300 text-lg md:text-xl font-serif leading-relaxed max-w-2xl mx-auto mb-10 animate-fade-in-up delay-200">
            グローバルな視点と確かな知見で、<br />
            あなたの資産形成を次なるステージへ導きます。
          </p>
          <div className="animate-fade-in-up delay-300">
            <Link href="#contact" className="btn-accent inline-block text-sm tracking-widest">
              無料相談を申し込む
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Properties Slider */}
      <section className="py-16 bg-gray-50 border-b border-gray-200">
        <div className="container mx-auto px-4 mb-10 text-center">
          <span className="text-accent text-sm tracking-widest font-bold block mb-2 animate-fade-in-up">PREMIUM SELECTION</span>
          <h2 className="text-3xl font-display font-bold text-primary animate-fade-in-up delay-100">
            厳選された海外プライム物件
          </h2>
        </div>
        <PropertyCarousel properties={properties} />
      </section>

      {/* Asset Columns Section */}
      {columnArticles.length > 0 && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12">
              <div>
                <span className="text-accent text-sm tracking-widest font-bold block mb-2">INTELLIGENCE</span>
                <h2 className="text-3xl font-display font-bold text-primary">資産コラム</h2>
              </div>
              <Link href="/articles" className="text-sm text-primary border-b border-primary pb-0.5 hover:text-accent hover:border-accent transition-colors mt-4 md:mt-0">
                View All Articles &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {columnArticles.slice(0, 3).map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Domestic Properties Section */}
      {domesticArticles.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12">
              <div>
                <span className="text-accent text-sm tracking-widest font-bold block mb-2">DOMESTIC</span>
                <h2 className="text-3xl font-display font-bold text-primary">国内不動産</h2>
              </div>
              <Link href="/properties" className="text-sm text-primary border-b border-primary pb-0.5 hover:text-accent hover:border-accent transition-colors mt-4 md:mt-0">
                View All Properties &rarr;
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {domesticArticles.slice(0, 6).map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Overseas Properties Section */}
      {overseasArticles.length > 0 && (
        <section className="py-20 bg-primary text-white">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12">
              <div>
                <span className="text-accent text-sm tracking-widest font-bold block mb-2">OVERSEAS</span>
                <h2 className="text-3xl font-display font-bold text-white">海外不動産</h2>
              </div>
              <Link href="/properties" className="text-sm text-gray-300 border-b border-gray-500 pb-0.5 hover:text-white hover:border-white transition-colors mt-4 md:mt-0">
                View All Properties &rarr;
              </Link>
            </div>

            {/* ダークテーマ用のカードスタイル調整が必要だが、一旦共通カードを使用 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {overseasArticles.slice(0, 3).map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section id="contact" className="py-24 bg-white">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-display font-bold text-primary mb-6">
            資産形成のプロフェッショナルと共に。
          </h2>
          <p className="text-gray-600 font-serif leading-relaxed mb-10">
            30年の経験を持つコンサルタントが、あなたの資産状況に合わせた最適なポートフォリオをご提案します。<br />
            まずは無料のシミュレーションから始めてみませんか？
          </p>
          <div className="flex flex-col md:flex-row justify-center space-y-4 md:space-y-0 md:space-x-6">
            <Link href="/simulation" className="btn-accent text-lg px-8 py-4 shadow-lg">
              無料シミュレーション依頼
            </Link>
            <Link href="https://line.me/" className="inline-flex items-center justify-center bg-[#06C755] text-white px-8 py-4 rounded-sm font-bold shadow-lg hover:bg-[#05b34c] transition-colors">
              LINEで気軽に相談
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
