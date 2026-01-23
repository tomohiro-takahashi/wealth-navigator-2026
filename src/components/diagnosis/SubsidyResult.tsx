'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ChevronRight, CheckCircle2, Info, ArrowRight, ShieldCheck, HelpCircle, Home, Building2 } from 'lucide-react';
import Image from 'next/image';
import { SubsidyResult as SubsidyResultType } from '@/lib/calculators/subsidy-logic';

export default function SubsidyResult() {
    const router = useRouter();
    const [result, setResult] = useState<SubsidyResultType | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem("subsidy_result");
        if (stored) {
            setResult(JSON.parse(stored));
        }
    }, []);

    if (!result) return null;

    return (
        <div className="min-h-screen bg-[var(--color-background)] pb-20">
            {/* Header section with curve */}
            <div className="bg-gradient-to-b from-[var(--color-border)] to-[var(--color-background)] pt-12 pb-16 px-4 text-center relative overflow-hidden">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md mx-auto relative z-10"
                >
                    <div className="inline-block px-4 py-1 rounded-full bg-[var(--color-accent)]/20 text-[var(--color-primary)] text-sm font-bold mb-6">
                        2026年度 診断結果
                    </div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-main)] mb-4">
                        あなたの家で受け取れる<br />補助金の概算は...
                    </h1>
                    
                    <div className="relative inline-block mt-4">
                        <div className="flex items-baseline justify-center gap-1">
                            <span className="text-xl font-bold text-[var(--color-accent)]">最大</span>
                            <span className="text-5xl md:text-6xl font-black text-[var(--color-primary)] tracking-tight">
                                {result.totalMaxAmount.toLocaleString()}
                            </span>
                            <span className="text-2xl font-bold text-[var(--color-primary)]">円</span>
                        </div>
                        {/* Underline decoration */}
                        <div className="h-4 w-full bg-[var(--color-accent)]/30 absolute -bottom-2 -rotate-1 -z-10 rounded-full opacity-60" />
                    </div>
                    
                    <p className="mt-8 text-sm text-[var(--color-text-sub)] flex items-center justify-center gap-1">
                        <Info size={14} />
                        審査等の状況により金額は変動します
                    </p>
                </motion.div>
                
                {/* Background circles */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-border)] rounded-full blur-3xl opacity-50 translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-[var(--color-accent)]/10 rounded-full blur-3xl opacity-30 -translate-x-1/2 translate-y-1/2" />
            </div>

            <div className="max-w-4xl mx-auto px-4 -mt-8 relative z-20">
                {/* Impact Card */}
                <div className="bg-white rounded-[2.5rem] shadow-xl p-6 md:p-10 mb-12 border border-[var(--color-border)]">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-full bg-[var(--color-background)] flex items-center justify-center text-[var(--color-primary)]">
                            <CheckCircle2 size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-[var(--color-text-main)]">適用される可能性が高い補助金</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {result.applicableSubsidies.map((subsidy, idx) => (
                            <motion.div
                                key={subsidy.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="bg-[var(--color-background)] rounded-3xl p-5 border border-[var(--color-border)] flex flex-col h-full"
                            >
                                <div className="relative h-32 w-full rounded-2xl overflow-hidden mb-4">
                                    <Image
                                        src={subsidy.imageUrl}
                                        alt={subsidy.name}
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute top-2 left-2 bg-[var(--color-primary)] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                                        {subsidy.category}
                                    </div>
                                </div>
                                <h3 className="font-bold text-[var(--color-text-main)] mb-2 leading-snug">
                                    {subsidy.name}
                                </h3>
                                <p className="text-xs text-[var(--color-text-sub)] flex-grow leading-relaxed">
                                    {subsidy.description}
                                </p>
                                <div className="mt-4 pt-4 border-t border-[var(--color-border)] flex justify-between items-center">
                                    <span className="text-xs font-bold text-[var(--color-text-sub)]">最大</span>
                                    <span className="text-lg font-black text-[var(--color-primary)]">
                                        約 {subsidy.maxAmount.toLocaleString()}円
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Trust Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
                    <div className="bg-[var(--color-border)] rounded-3xl p-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[var(--color-primary)] flex-shrink-0">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <div className="font-bold text-[var(--color-text-main)] text-sm">公式窓口で安心</div>
                            <div className="text-xs text-[var(--color-text-sub)] mt-0.5">2026年度最新のリフォーム補助金情報を網羅</div>
                        </div>
                    </div>
                    <div className="bg-[var(--color-border)] rounded-3xl p-6 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[var(--color-primary)] flex-shrink-0">
                            <HelpCircle size={24} />
                        </div>
                        <div>
                            <div className="font-bold text-[var(--color-text-main)] text-sm">申請までまるごとサポート</div>
                            <div className="text-xs text-[var(--color-text-sub)] mt-0.5">面倒な書類作成や手続きも代行可能</div>
                        </div>
                    </div>
                </div>

                {/* CTA Box */}
                <div className="bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-primary)] rounded-[2.5rem] p-8 md:p-12 text-center text-white shadow-2xl relative overflow-hidden group">
                    <div className="relative z-10">
                        <h2 className="text-2xl md:text-3xl font-black mb-4">
                            補助金の受け取りを<br className="md:hidden" />サポートします！
                        </h2>
                        <p className="opacity-90 mb-8 text-sm md:text-base leading-relaxed">
                            「どの補助金が使えるの？」「申請はどうすればいい？」<br />
                            専門アドバイザーがあなたにぴったりのプランをご提案します。
                        </p>
                        <button
                            onClick={() => router.push("/inquiry")}
                            className="bg-white text-[var(--color-primary)] px-8 md:px-12 py-5 rounded-full text-lg font-black shadow-lg hover:bg-[var(--color-background)] transition-all flex items-center gap-3 mx-auto group-hover:scale-105"
                        >
                            無料診断・相談を申し込む
                            <ArrowRight />
                        </button>
                        <p className="mt-6 text-xs opacity-75">
                            ※相談は何度でも無料です。無理な勧誘は一切ございません。
                        </p>
                    </div>
                    
                    {/* Floating icons for decoration */}
                    <div className="absolute top-4 right-8 opacity-10 -rotate-12">
                        <Building2 size={80} />
                    </div>
                    <div className="absolute -bottom-8 -left-8 opacity-10 rotate-12">
                        <Home size={120} />
                    </div>
                </div>
            </div>
        </div>
    );
}
