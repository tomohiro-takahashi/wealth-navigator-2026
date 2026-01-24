"use client";

import React from 'react';
import Link from 'next/link';
import { SiteConfig } from '@/types/site';
import { motion } from 'framer-motion';
import { Sparkles, Hammer, Wallet, HelpCircle, ArrowRight } from 'lucide-react';

export const AboutSubsidy = ({ siteConfig }: { siteConfig: SiteConfig }) => {
    return (
        <div className="min-h-screen bg-[#f8fafc] text-[#1e293b] font-sans selection:bg-[#f97316] selection:text-white">
            {/* Friendly Header */}
            <div className="relative py-24 px-6 md:py-32 bg-gradient-to-br from-[#f97316] to-[#ea580c] text-white text-center rounded-b-[3rem] shadow-xl">
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
                    <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full mb-6 backdrop-blur-sm">
                        <Sparkles size={16} />
                        <span className="text-xs font-bold tracking-widest uppercase">Smart Renovation Guide</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">
                        補助金<span className="text-white/80">Logic</span>
                    </h1>
                    <p className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto font-medium leading-relaxed">
                        知らないだけで損をしている。<br className="md:hidden" />「賢いリフォーム」の最短ルートを。
                    </p>
                </motion.div>
            </div>

            {/* Mission Section */}
            <section className="py-24 px-6 max-w-5xl mx-auto">
                <div className="flex flex-col md:flex-row gap-16 items-center">
                    <div className="md:w-1/2 relative">
                        <div className="absolute -top-4 -left-4 w-24 h-24 bg-[#f97316]/10 rounded-full blur-2xl"></div>
                        <img 
                            src="https://images.unsplash.com/photo-1581291417061-60292723381a?auto=format&fit=crop&q=80&w=800" 
                            alt="Modern Renovation" 
                            className="relative rounded-3xl shadow-2xl"
                        />
                    </div>
                    <div className="md:w-1/2 space-y-8">
                        <h2 className="text-3xl font-bold text-[#1e293b] leading-tight">
                            「持ち出し」を減らし、<br className="text-[#f97316]" />「快適さ」を増やす。
                        </h2>
                        <p className="text-slate-600 leading-loose">
                            省エネ改修、バリアフリー、子育てエコホーム。国や自治体が用意している補助金制度は非常に複雑で、自分に何が最適かを見極めるのは容易ではありません。私たちは最新の制度を網羅し、あなたの住まいに「本当に使える」補助金を抽出し、最大限に活用するためのロジックを提供します。
                        </p>
                    </div>
                </div>
            </section>

            {/* Steps Section */}
            <section className="py-20 bg-slate-100">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="grid md:grid-cols-3 gap-8 text-center">
                        <div className="bg-white p-10 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-16 h-16 bg-[#f97316]/10 rounded-2xl flex items-center justify-center text-[#f97316] mx-auto mb-6">
                                <Hammer size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-4">制度を読み解く</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                先進的窓リノベから給湯省エネまで。複雑な募集要項を、徹底的に「ユーザー目線」で要約・可読化します。
                            </p>
                        </div>
                        <div className="bg-white p-10 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-16 h-16 bg-[#f97316]/10 rounded-2xl flex items-center justify-center text-[#f97316] mx-auto mb-6">
                                <Wallet size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-4">金額を最大化する</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                どの工事を組み合わせれば最も多くの補助が受けられるか。制度の「併用」を前提とした最適解を算出します。
                            </p>
                        </div>
                        <div className="bg-white p-10 rounded-3xl shadow-sm hover:shadow-md transition-shadow">
                            <div className="w-16 h-16 bg-[#f97316]/10 rounded-2xl flex items-center justify-center text-[#f97316] mx-auto mb-6">
                                <HelpCircle size={32} />
                            </div>
                            <h3 className="text-xl font-bold mb-4">確実に申請する</h3>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                「対象外だった」という悲劇を防ぐため、要件チェックから認定業者の選定アドバイスまでサポートします。
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-24 px-6 text-center">
                <div className="max-w-3xl mx-auto bg-white rounded-[2.5rem] p-12 shadow-2xl shadow-[#f97316]/5 border border-slate-100">
                    <h2 className="text-3xl font-bold text-[#1e293b] mb-6">あなたの家は、いくらお得になりますか？</h2>
                    <p className="text-slate-500 mb-10">リフォーム箇所を選ぶだけで、対象となる補助金を30秒で診断します。もちろん無料です。</p>
                    <Link 
                        href="/simulation" 
                        className="inline-flex items-center gap-2 bg-[#f97316] text-white px-12 py-5 rounded-2xl font-bold hover:bg-[#ea580c] active:scale-95 transition-all shadow-lg shadow-[#f97316]/30"
                    >
                        最新の補助金を診断する
                        <ArrowRight size={20} />
                    </Link>
                </div>
            </section>

            {/* Simple Footer */}
            <div className="py-12 text-center text-[10px] tracking-wider text-slate-400 font-medium">
                © 2024 SUBSIDY LOGIC | SMART HOME REFORM GUIDE UNIT
            </div>
        </div>
    );
};
