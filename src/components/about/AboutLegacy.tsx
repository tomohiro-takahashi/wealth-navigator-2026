"use client";

import Link from 'next/link';
import { motion } from 'framer-motion';
import { SiteConfig } from '@/types/site';

export const AboutLegacy = ({ siteConfig }: { siteConfig: SiteConfig }) => {
    return (
        <div className="bg-[#191919] text-[#E5E5E5] selection:bg-[#a68a68] selection:text-white font-sans min-h-screen relative overflow-x-hidden pb-32">
            <style jsx global>{`
                .material-symbols-outlined {
                    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
                    color: #a68a68;
                }
                .text-primary {
                    color: #a68a68;
                }
                .bg-primary {
                    background-color: #a68a68;
                }
                .border-primary {
                    border-color: #a68a68;
                }
            `}</style>

            <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
                {/* Hero Section */}
                <div className="px-0 md:px-4 md:py-3">
                    <div className="bg-cover bg-center flex flex-col justify-end overflow-hidden bg-[#191919] md:rounded-xl min-h-[400px] relative" 
                         style={{ 
                             backgroundImage: `linear-gradient(0deg, rgba(25, 25, 25, 0.9) 0%, rgba(25, 25, 25, 0.2) 60%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuBvmUf35AXQWx73eTiHGNnSlvu9mn8f6zSO8H33aPpF7LLgPMgvUq1KD6FbZhqBD_zzROJW5QFNHCRoc8YhqnacAIQy53zKhIe3V9N_qHpfFPbHXHujUnIHL4eoBuWcG2fCczbm1FUbIbkeRYJy31amSTiSmOJEKdIDMeBDaG-NBM-tJylCwSHVGJjtd24Bxo7ex3TSQomvOhC02rguh1DRx6Mi9LQXoXLGhKEIF1gBCWHYndXTv4Inu2O-8I8ltmXLJisBncAo8nYo")` 
                         }}>
                        <div className="flex flex-col p-6 gap-2">
                            <p className="text-primary font-medium tracking-widest text-sm uppercase">Our Story</p>
                            <h1 className="text-white tracking-tight text-3xl font-bold leading-tight">About Us<br/>親の家、どうする？</h1>
                        </div>
                    </div>
                </div>

                {/* Headline */}
                <div className="px-6 pt-10 pb-6 text-center">
                    <h3 className="text-white tracking-tight text-2xl font-bold leading-tight">その悩み、私も経験しました。</h3>
                    <div className="mt-4 h-1 w-12 bg-primary mx-auto rounded-full"></div>
                </div>

                {/* Founder Message */}
                <div className="flex p-6 flex-col gap-8 items-center max-w-2xl mx-auto">
                    <div className="flex flex-col items-center gap-6">
                        <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-40 w-40 border-2 border-primary/30 p-1" 
                             style={{ backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuAnwTr-izmmap-sEbEnSab2iLkAXC4Tni6HHSZ6a9bpVnz-BinlMiACYEbA3CfsSZj6p1CjpJyf7xBBVgo9L6MqVcxsWWOyOZNTPLgugJAYG8wWxrjjcKFgbIuZdTGVXYBqn5AWuoxfjR8hR5E3Yb8shwjPBI-54h-Uz7DON_93WsdGinY57296EBbEOA68BtS5e6AFAI2LxTuCZWBrso21jlJ8hxf4IYbQxPD-x-Io8HZaGGbW8419P9oGiiFIUzXp61Rvy2jypnr2")` }}>
                        </div>
                        <div className="flex flex-col gap-4 text-center">
                            <p className="text-white text-xl font-bold">はじめまして</p>
                            <div className="space-y-4 text-[#afaba7] text-base font-normal leading-relaxed text-left">
                                <p>
                                    「親の家をどうにかしなければ」という想いを抱えながら、日々の忙しさに追われ、気づけば数年が経過している。
                                </p>
                                <p>
                                    私自身、かつて同じ罪悪感に苛まれていました。しかし、ある時気づいたのです。放置することこそが、親への最大の不孝であると。
                                </p>
                                <p>
                                    思い出の詰まった場所だからこそ、プロの手を借りて、最善の形で次へ繋げる。そのお手伝いをしたいという想いでこのサービスを立ち上げました。
                                </p>
                            </div>
                            <div className="pt-4 italic text-primary font-serif font-light text-2xl text-right">
                                Takahashi Tomohiro
                            </div>
                        </div>
                    </div>
                </div>

                {/* Our Beliefs Section */}
                <div className="px-6 py-10 max-w-2xl mx-auto w-full">
                    <h2 className="text-white text-2xl font-bold leading-tight tracking-tight mb-8">Our Beliefs</h2>
                    <div className="grid grid-cols-1 gap-4">
                        {[
                            { icon: 'favorite', title: '感情を否定しない', desc: '単なる物件管理ではなく、あなたの心の整理と不安にどこまでも寄り添います。' },
                            { icon: 'warning', title: '放置は最悪の選択', desc: '「いつか」を「今」に。一歩踏み出すための勇気と具体的な手段をサポートします。' },
                            { icon: 'handshake', title: '一緒に考え、一緒に決める', desc: '押し付けではなく、家族にとっての最善の選択肢を共に導き出します。' },
                        ].map((belief, i) => (
                            <div key={i} className="flex flex-1 gap-4 rounded-xl border border-primary/20 bg-[#23211f] p-6 flex-col">
                                <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center">
                                    <span className="material-symbols-outlined text-3xl">{belief.icon}</span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <h2 className="text-white text-lg font-bold">{belief.title}</h2>
                                    <p className="text-[#afaba7] text-sm leading-normal">{belief.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 私たちができること (from images) */}
                <div className="px-6 py-10 max-w-2xl mx-auto w-full">
                    <h2 className="text-center text-white text-2xl font-bold mb-10">私たちはできること</h2>
                    <div className="space-y-6">
                        {/* Sell */}
                        <div className="bg-[#23211f] rounded-2xl overflow-hidden border border-white/5">
                            <img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800" alt="Sell" className="w-full h-48 object-cover" />
                            <div className="p-6">
                                <h3 className="text-white text-xl font-bold flex items-baseline gap-2 mb-4">売却 <span className="text-[#a68a68] text-sm font-normal font-mono">Sell</span></h3>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-2 text-sm">
                                        <span className="material-symbols-outlined !text-[#a68a68] !text-sm mt-1">check_circle</span>
                                        <p className="text-[#afaba7]"><span className="text-white">メリット：</span>即座に現金化、将来の維持費が不要になります。</p>
                                    </li>
                                    <li className="flex items-start gap-2 text-sm">
                                        <span className="material-symbols-outlined !text-[#a68a68] !text-sm mt-1">cancel</span>
                                        <p className="text-[#afaba7]"><span className="text-white">デメリット：</span>思い出の場所の喪失、譲渡所得税の考慮が必要。</p>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        {/* Rent */}
                        <div className="bg-[#23211f] rounded-2xl overflow-hidden border border-white/5">
                            <img src="https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=800" alt="Rent" className="w-full h-48 object-cover" />
                            <div className="p-6">
                                <h3 className="text-white text-xl font-bold flex items-baseline gap-2 mb-4">賃貸 <span className="text-[#a68a68] text-sm font-normal font-mono">Rent</span></h3>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-2 text-sm">
                                        <span className="material-symbols-outlined !text-[#a68a68] !text-sm mt-1">check_circle</span>
                                        <p className="text-[#afaba7]"><span className="text-white">メリット：</span>安定した家賃収入が得られ、資産を保持できます。</p>
                                    </li>
                                    <li className="flex items-start gap-2 text-sm">
                                        <span className="material-symbols-outlined !text-[#a68a68] !text-sm mt-1">cancel</span>
                                        <p className="text-[#afaba7]"><span className="text-white">デメリット：</span>修繕費負担や店借人とのトラブルリスク。</p>
                                    </li>
                                </ul>
                            </div>
                        </div>
                        {/* Utilize */}
                        <div className="bg-[#23211f] rounded-2xl overflow-hidden border border-white/5">
                            <img src="https://images.unsplash.com/photo-1613545325278-f24b0cae1224?auto=format&fit=crop&q=80&w=800" alt="Utilize" className="w-full h-48 object-cover" />
                            <div className="p-6">
                                <h3 className="text-white text-xl font-bold flex items-baseline gap-2 mb-4">活用 <span className="text-[#a68a68] text-sm font-normal font-mono">Utilize</span></h3>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-2 text-sm">
                                        <span className="material-symbols-outlined !text-[#a68a68] !text-sm mt-1">check_circle</span>
                                        <p className="text-[#afaba7]"><span className="text-white">メリット：</span>親の想いを継承。セカンドハウスや拠点として活用。</p>
                                    </li>
                                    <li className="flex items-start gap-2 text-sm">
                                        <span className="material-symbols-outlined !text-[#a68a68] !text-sm mt-1">cancel</span>
                                        <p className="text-[#afaba7]"><span className="text-white">デメリット：</span>固定資産税や維持管理のコストが継続発生。</p>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 相談の流れ (from images) */}
                <div className="px-6 py-20 bg-[#23211f]/30">
                    <div className="max-w-2xl mx-auto w-full">
                        <h2 className="text-center text-white text-2xl font-bold mb-12">相談の流れ</h2>
                        <div className="relative pl-8 space-y-12 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-primary/20">
                            {[
                                { step: '01', title: 'LINE/お問い合わせフォーム', desc: 'まずはお気軽にご連絡ください。簡単な状況確認からスタートします。' },
                                { step: '02', title: 'ヒアリング', desc: '専門スタッフが、ご家族の想いや建物の状況をじっくり伺います。' },
                                { step: '03', title: '選択肢の整理', desc: '客観的な視点で、売却・賃貸・活用の可能性をシミュレーションします。' },
                                { step: '04', title: '専門家のご紹介', desc: '司法書士や税理士、リフォーム業者など最適なパートナーをお繋ぎします。' },
                                { step: '05', title: '継続サポート', desc: '決定後の実務や、将来的なフォローアップも安心してお任せください。' },
                            ].map((item, i) => (
                                <div key={i} className="relative">
                                    <div className="absolute -left-[30px] top-1 w-[14px] h-[14px] rounded-full bg-primary border-4 border-[#191919]"></div>
                                    <div className="space-y-2">
                                        <h4 className="text-white font-bold leading-none">{item.step}. {item.title}</h4>
                                        <p className="text-[#afaba7] text-sm leading-relaxed">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* お客様の声 (from images) */}
                <div className="px-6 py-20">
                    <div className="max-w-2xl mx-auto w-full text-center">
                        <h2 className="text-white text-2xl font-bold mb-12">お客様の声</h2>
                        <div className="bg-[#23211f] p-8 rounded-3xl border border-white/5 text-left relative">
                            <div className="flex text-primary gap-1 mb-6">
                                {[...Array(5)].map((_, i) => <span key={i} className="material-symbols-outlined !text-sm">star</span>)}
                            </div>
                            <p className="text-white text-base leading-relaxed mb-8 italic">
                                「実家をどうすべきか数年悩みましたが、ヒアリングを通じて私たちが本当に大切にしたいことが見えてきました。無理に売却を勧めない姿勢に安心しました。」
                            </p>
                            <div className="flex justify-between items-end">
                                <span className="text-primary font-bold">50代 女性</span>
                                <span className="text-[#6b6b6b] text-xs">東京都世田谷区</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FAQ */}
                <div className="px-6 py-20 max-w-2xl mx-auto w-full">
                    <h2 className="text-white text-2xl font-bold mb-8">FAQ</h2>
                    <div className="divide-y divide-[#4b4844]">
                        <details className="group py-4">
                            <summary className="flex items-center justify-between cursor-pointer list-none">
                                <span className="text-white font-medium">相談は無料ですか？</span>
                                <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
                            </summary>
                            <p className="mt-4 text-[#afaba7] text-sm leading-relaxed">初回のカウンセリングおよび現状分析は完全無料で承っております。まずはお気軽にご相談ください。</p>
                        </details>
                        <details className="group py-4">
                            <summary className="flex items-center justify-between cursor-pointer list-none">
                                <span className="text-white font-medium">遠方の実家でも対応可能ですか？</span>
                                <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
                            </summary>
                            <p className="mt-4 text-[#afaba7] text-sm leading-relaxed">はい、全国対応しております。オンラインでの打ち合わせを中心に、必要に応じて現地調査も実施いたします。</p>
                        </details>
                        <details className="group py-4">
                            <summary className="flex items-center justify-between cursor-pointer list-none">
                                <span className="text-white font-medium">何から始めればいいですか？</span>
                                <span className="material-symbols-outlined transition-transform group-open:rotate-180">expand_more</span>
                            </summary>
                            <p className="mt-4 text-[#afaba7] text-sm leading-relaxed">まずはLINEまたはフォームより、現状の簡単な状況（場所や築年数など）をお知らせください。専門スタッフが折り返しご連絡いたします。</p>
                        </details>
                    </div>
                </div>

                {/* Final CTA Message */}
                <div className="px-6 py-20 text-center">
                    <p className="text-white text-xl md:text-2xl font-bold mb-4 tracking-tighter">
                        「大切なのは、<br />家ではなく、あなたの人生。」
                    </p>
                    <div className="w-12 h-px bg-primary/30 mx-auto"></div>
                </div>

                {/* Sticky Bottom CTAs */}
                <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-[#191919]/80 backdrop-blur-md border-t border-white/5 pb-8">
                    <div className="flex gap-3 max-w-md mx-auto">
                        <Link href="https://line.me/" className="flex-1 bg-[#25D366] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:brightness-110 active:scale-95 transition-all">
                            <span className="material-symbols-outlined !text-white">chat</span>
                            LINEで相談
                        </Link>
                        <Link href="/inquiry" className="flex-1 bg-primary text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg hover:brightness-110 active:scale-95 transition-all">
                            <span className="material-symbols-outlined !text-white">mail</span>
                            フォーム
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};
