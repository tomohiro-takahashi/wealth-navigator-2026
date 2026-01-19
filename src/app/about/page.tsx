
import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'About Us | Wealth Navigator',
    description: 'Wealth Navigatorの理念と運営について',
};

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[#161410] text-[#f2f0ed] font-sans pb-20">
            {/* Hero */}
            <div className="relative h-[50vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#23201b] to-[#161410] opacity-80 z-10"></div>
                {/* Background pattern or image could go here */}
                <div className="relative z-20 text-center max-w-2xl px-6">
                    <span className="text-[#c59f59] tracking-[0.3em] font-bold text-sm uppercase mb-6 block animate-fade-in-up">Who We Are</span>
                    <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-8 leading-tight animate-fade-in-up delay-100">
                        真の豊かさを、<br />共創する。
                    </h1>
                </div>
            </div>

            <div className="container mx-auto px-6 py-20 max-w-4xl">
                <section className="mb-20 space-y-8 text-center md:text-left">
                    <h2 className="text-2xl font-serif text-[#c59f59] mb-6">Our Philosophy</h2>
                    <p className="text-lg leading-loose text-gray-300 font-serif">
                        Wealth Navigatorは、単なる不動産投資情報の提供サイトではありません。<br />
                        私たちは、成功した経営者・投資家の皆様が、その資産を「守り」「育て」「次世代へ繋ぐ」ための羅針盤です。
                    </p>
                    <p className="text-lg leading-loose text-gray-300 font-serif">
                        情報が溢れる現代において、本当に価値のある「一次情報」と「本質的な知恵」だけを厳選し、<br />
                        あなたの意思決定を支える参謀でありたいと願っています。
                    </p>
                </section>

                <section className="grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-white/10 pt-20">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-4">Company</h3>
                        <dl className="space-y-4 text-gray-400">
                            <div className="flex border-b border-white/5 pb-2">
                                <dt className="w-32 font-bold">サービス名</dt>
                                <dd>Wealth Navigator</dd>
                            </div>
                            <div className="flex border-b border-white/5 pb-2">
                                <dt className="w-32 font-bold">運営</dt>
                                <dd>Wealth Navigator 編集部</dd>
                            </div>
                            <div className="flex border-b border-white/5 pb-2">
                                <dt className="w-32 font-bold">所在地</dt>
                                <dd>東京都港区...</dd>
                            </div>
                        </dl>
                    </div>
                    <div className="bg-white/5 p-8 rounded-lg border border-white/10 text-center flex flex-col justify-center items-center">
                        <h3 className="text-lg font-bold text-white mb-4">お問い合わせ</h3>
                        <p className="text-gray-400 text-sm mb-6">
                            個別のご相談や取材の依頼はこちらから承っております。
                        </p>
                        <Link href="/inquiry" className="px-8 py-3 bg-[#c59f59] text-[#161410] font-bold rounded hover:bg-[#dcc18b] transition-colors">
                            Contact Form
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
}
