"use client";

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export const AboutKominka = () => {
    return (
        <div className="bg-[#191919] font-sans text-white min-h-screen flex flex-col selection:bg-[#A68A56]/30 overflow-x-hidden">
            {/* Fonts & Custom Styles */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@700;900&family=Manrope:wght@400;500;700&display=swap');
                
                .font-display { font-family: 'Manrope', sans-serif; }
                .font-serif-jp { font-family: 'Noto Serif JP', serif; }
                
                .gold-gradient {
                    background: linear-gradient(135deg, #A68A56 0%, #d4bc8d 50%, #A68A56 100%);
                }
                .text-glow-gold {
                    text-shadow: 0 0 20px rgba(166, 138, 86, 0.4);
                }
                .gold-border {
                    border: 1px solid rgba(166, 138, 86, 0.3);
                }
                .material-symbols-outlined {
                    font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
                }
            `}</style>

            {/* Header (Mothership Header exists, but the user HTML included one. We'll skip it to avoid duplication if it looks weird, but keep a simple brand bar as a spacer if needed) */}
            <div className="h-14"></div>

            <main className="flex-1">
                {/* --- BLOCK 1 --- */}
                {/* Hero Section */}
                <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
                    <div className="absolute inset-0">
                        <img 
                            alt="Renovated Japanese House" 
                            className="w-full h-full object-cover opacity-60" 
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAGbRfT3ppz7unl28j3U9PwlfS4FM9sBRktdutygd2wCIX6BVAKsBoLV8OytVCFNgBsbFRpDpqDu6pRYjTOU8uLb2PxS3tnUg8xXZUTvwgVlyRGloclJjWfabJjwJVOulJrTwdNEB8Pg_rqLm5AY_FphliYvhv1CCPGf8FozfJxMJh62OWkxQGg_ROuNkMrFyOtEqtdOfDsSkI2rCmlzGAroAZP1KhfIietL6sANa7a8k2Tejpe0OcrHbIMuYxcNuE7X4lLHWeosNs"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#191919] via-[#191919]/40 to-transparent"></div>
                    </div>
                    <motion.div 
                        initial={{ opacity: 0, y: 30 }} 
                        animate={{ opacity: 1, y: 0 }} 
                        transition={{ duration: 1 }}
                        className="relative z-10 px-6 text-center"
                    >
                        <p className="text-[#A68A56] font-serif-jp tracking-[0.3em] text-sm mb-6 uppercase">Modern Classic Luxury</p>
                        <h1 className="text-white text-4xl sm:text-5xl font-serif-jp font-black leading-tight tracking-tighter mb-8 text-glow-gold">
                            眠れる資産を、<br/>
                            <span className="text-[#A68A56]">叩き起こせ。</span>
                        </h1>
                        <div className="w-16 h-0.5 bg-[#A68A56] mx-auto mb-8"></div>
                        <p className="text-gray-300 text-sm leading-relaxed max-w-xs mx-auto font-medium font-display">
                            日本の風景に溶け込む空き家を、<br/>
                            価値ある投資商品へと昇華させる。
                        </p>
                    </motion.div>
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                        <span className="text-[10px] text-[#A68A56]/60 tracking-widest uppercase">Scroll</span>
                        <div className="w-px h-12 bg-gradient-to-b from-[#A68A56] to-transparent"></div>
                    </div>
                </section>

                {/* Mission Section */}
                <section className="px-6 py-20 bg-[#191919]">
                    <div className="max-w-md mx-auto">
                        <div className="mb-12">
                            <h2 className="text-[#A68A56] font-serif-jp text-3xl font-bold mb-4">Our Mission</h2>
                            <p className="text-white text-lg font-serif-jp leading-relaxed italic">
                                「900万戸の空き家は、<br/>
                                日本最大のチャンスだ。」
                            </p>
                        </div>
                        <p className="text-gray-400 text-sm leading-[2] mb-16 font-display">
                            増え続ける空き家問題。それは社会の負債ではなく、磨けば光る「原石」です。私たちは伝統的な美しさと現代の合理性を融合させ、眠っていた空間に再び息を吹き込みます。再現性の高いデータに基づき、高利回りと地域活性を同時に実現する——それが私たちの掲げる「錬金術」です。
                        </p>
                        <div className="grid gap-6">
                            {[
                                { step: '01.', icon: 'analytics', title: '社会課題を投資へ', desc: '空き家という社会問題を、収益性の高い不動産投資へと転換。負債を資産に変えるビジネスモデルを構築します。' },
                                { step: '02.', icon: 'location_city', title: '地域再生と高利回り', desc: '適切なリノベーションにより地域の景観を守りつつ、投資家には安定したインカムゲインを提供します。' },
                                { step: '03.', icon: 'database', title: 'データ駆動の再現性', desc: '独自の査定アルゴリズムと改修データを用い、誰が取り組んでも確実な成果が出る仕組みを提供します。' },
                            ].map((item, i) => (
                                <div key={i} className="p-6 border border-[#A68A56]/30 bg-[#23221f]/50 rounded-lg relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 p-4 opacity-10">
                                        <span className="material-symbols-outlined text-6xl text-[#A68A56]">{item.icon}</span>
                                    </div>
                                    <h3 className="text-[#A68A56] font-serif-jp text-xl font-bold mb-3 flex items-center gap-2">
                                        <span className="text-sm font-display text-[#A68A56]/50">{item.step}</span>
                                        {item.title}
                                    </h3>
                                    <p className="text-gray-400 text-xs leading-relaxed font-display">
                                        {item.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* --- BLOCK 2 --- */}
                {/* Story Section */}
                <section className="bg-[#23221f] py-20 px-6">
                    <div className="max-w-md mx-auto">
                        <div className="mb-8">
                            <span className="text-[#A68A56] font-serif-jp text-sm tracking-widest block mb-2 uppercase">Our Story</span>
                            <h2 className="text-3xl font-serif-jp font-bold leading-tight text-white">岡山、150万円の<br/>ボロ戸建てから。</h2>
                            <div className="h-1 w-16 bg-[#A68A56] mt-4"></div>
                        </div>
                        <div className="space-y-6 text-gray-300 leading-relaxed text-sm font-display">
                            <p>
                                「こんな家、誰が住むんだ？」<br/>
                                それが、私が最初に手に入れた岡山市内の空き家を見た時の正直な感想でした。
                            </p>
                            <p>
                                雨漏り、傾いた床、生い茂る雑草。しかし、徹底的な市場調査とコスト管理、および住み手のニーズを汲み取ったリノベーションにより、その家は高利回りを生む資産へと生まれ変わりました。
                            </p>
                            <p>
                                負債だと思われていた「空き家」が、知識と戦略という「錬金術」によって黄金に変わる。その感動と再現性のあるノウハウを、志を共にする投資家の皆様へ共有したい。それが「空き家錬金術」の原点です。
                            </p>
                        </div>
                    </div>
                </section>

                {/* Core Pillars */}
                <section className="bg-[#191919] py-20 px-6 border-y border-[#A68A56]/10">
                    <div className="max-w-md mx-auto">
                        <div className="text-center mb-12">
                            <h2 className="text-2xl font-serif-jp font-bold text-[#A68A56] mb-2">3つの柱</h2>
                            <p className="text-xs text-[#A68A56]/60 tracking-[0.2em] font-display uppercase">Core Pillars</p>
                        </div>
                        <div className="space-y-10">
                            {[
                                { icon: 'real_estate_agent', title: '1. Hands-on', desc: '現場主義。机上の空論ではなく、現役投資家としての実体験に基づいた、泥臭くも確実な情報だけをお届けします。' },
                                { icon: 'query_stats', title: '2. Data-driven', desc: '透明性の追求。感覚的な「良さ」ではなく、利回り、修繕比率、出口戦略まで、全ての指標を数値化して開示します。' },
                                { icon: 'school', title: '3. Educational', desc: 'オープンソース。独自の仕入れルートや職人ネットワークなど、普通は隠したがるノウハウを惜しみなく共有します。' },
                            ].map((pillar, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full border border-[#A68A56]/40 flex items-center justify-center text-[#A68A56]">
                                        <span className="material-symbols-outlined">{pillar.icon}</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold mb-2 text-white font-display">{pillar.title}</h3>
                                        <p className="text-sm text-gray-400 font-display leading-relaxed">{pillar.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Services */}
                <section className="bg-[#191919] py-20 px-6">
                    <div className="max-w-md mx-auto">
                        <div className="text-center mb-10">
                            <h2 className="text-2xl font-serif-jp font-bold text-white mb-2">提供サービス</h2>
                            <p className="text-xs text-[#A68A56]/60 tracking-[0.2em] font-display uppercase">Our Services</p>
                        </div>
                        <div className="space-y-4">
                            {[
                                { icon: 'location_city', title: '物件紹介', desc: '市場に出回る前の「お宝物件」を、投資家目線で厳選してご紹介します。' },
                                { icon: 'construction', title: '再生リノベーション', desc: 'コストパフォーマンスを最大化し、入居率を高める最適な改修プランをご提案。' },
                                { icon: 'forum', title: '戦略コンサルティング', desc: 'ポートフォリオ構築から融資戦略まで、あなたの不動産投資をトータルサポート。' },
                            ].map((service, i) => (
                                <div key={i} className="gold-border p-6 rounded-lg bg-[#23221f]/50">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="material-symbols-outlined text-[#A68A56]">{service.icon}</span>
                                        <h3 className="font-bold text-lg text-white font-display">{service.title}</h3>
                                    </div>
                                    <p className="text-sm text-gray-400 mb-4 font-display">{service.desc}</p>
                                    <div className="text-[#A68A56] text-xs font-bold tracking-tighter font-display cursor-pointer hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                                        VIEW DETAILS <span className="material-symbols-outlined !text-[14px]">arrow_forward</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Quote Section */}
                <section className="bg-[#191919] py-20 px-6 text-center">
                    <div className="max-w-md mx-auto relative py-12">
                        <span className="text-4xl text-[#A68A56]/20 absolute -top-6 left-1/2 -translate-x-12 font-serif-jp">“</span>
                        <p className="text-[#A68A56] font-serif-jp text-xl font-bold tracking-widest leading-loose">
                            迷ったら見送れ。<br/>
                            次は必ず来る。
                        </p>
                        <span className="text-4xl text-[#A68A56]/20 absolute -bottom-10 right-1/2 translate-x-8 font-serif-jp">”</span>
                    </div>
                </section>

                {/* Final CTA */}
                <section className="bg-gradient-to-t from-[#23221f] to-[#191919] px-6 py-20">
                    <div className="max-w-md mx-auto text-center border-y border-[#A68A56]/20 py-12">
                        <h2 className="font-serif-jp text-2xl text-white mb-6">あなたも、<br/>錬金術の体現者に。</h2>
                        <p className="text-gray-400 text-sm mb-10 font-display">まずはシミュレーターで、<br/>眠れる資産の可能性を算出してください。</p>
                        
                        <div className="space-y-4">
                            <Link 
                                href="/simulation" 
                                className="gold-gradient w-full h-16 rounded-lg flex items-center justify-center gap-3 shadow-[0_4px_20px_rgba(166,138,86,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all group group"
                            >
                                <span className="text-[#191919] font-bold text-lg tracking-widest font-serif-jp">シミュレーターを試す</span>
                                <span className="material-symbols-outlined text-[#191919] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </Link>

                            <Link 
                                href="/inquiry" 
                                className="w-full h-14 rounded-full border border-[#A68A56] flex items-center justify-center gap-3 bg-transparent text-[#A68A56] hover:bg-[#A68A56]/10 transition-colors font-display font-medium"
                            >
                                <span className="tracking-wider">LINEで相談する</span>
                                <span className="material-symbols-outlined">chat</span>
                            </Link>
                        </div>
                    </div>
                </section>
            </main>

            {/* Simple Footer */}
            <footer className="bg-[#191919] border-t border-[#A68A56]/10 py-12 px-6">
                <div className="max-w-md mx-auto text-center">
                    <div className="font-serif-jp text-[#A68A56] font-bold tracking-[0.2em] text-xl mb-6 uppercase">空き家錬金術</div>
                    <p className="text-[10px] text-gray-600 font-display">© 2024 Akiya Renkinjutsu. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};
