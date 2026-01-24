'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ChevronRight, CheckCircle2, Info, ArrowRight, ShieldCheck, HelpCircle, Home, Building2, AlertCircle, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { SubsidyResult as SubsidyResultType } from '@/lib/calculators/diagnosis-logic';

export default function SubsidyResult() {
    const router = useRouter();
    const [result, setResult] = useState<SubsidyResultType | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem("diagnosis_result") || localStorage.getItem("subsidy_result");
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (parsed.brand === 'subsidy' || parsed.matchedSubsidies) {
                    setResult(parsed);
                }
            } catch (e) {
                console.error("Failed to parse subsidy result", e);
            }
        }
    }, []);

    if (!result) return (
        <div className="flex flex-col items-center justify-center py-20 text-[var(--color-text-sub)]">
            <AlertCircle className="mb-4 opacity-20" size={48} />
            <p>診断データが見つかりません。</p>
            <Link href="/simulation" className="mt-4 text-[var(--color-primary)] underline font-bold">診断をやり直す</Link>
        </div>
    );

    return (
        <div className="min-h-screen bg-[var(--color-background)] pb-20">
            {/* Header section with curve - Added top padding to avoid header overlap */}
            <div className="bg-linear-to-b from-[var(--color-border)] to-[var(--color-background)] pt-24 pb-16 px-4 text-center relative overflow-hidden">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md mx-auto relative z-10"
                >
                    <div className="inline-block px-4 py-1 rounded-full bg-[var(--color-accent)]/20 text-[var(--color-primary)] text-sm font-bold mb-6">
                        診断結果
                    </div>
                    <h1 className="text-2xl font-bold text-[var(--color-text-main)] mb-4">
                        あなたの家で受け取れる<br />補助金の概算は...
                    </h1>
                    
                    <div className="relative inline-block mt-4">
                        <div className="flex items-baseline justify-center gap-1">
                            <span className="text-xl font-bold text-[var(--color-accent)]">最大 約</span>
                            <span className="text-5xl md:text-6xl font-black text-[var(--color-primary)] tracking-tight">
                                {result.totalEstimate.toLocaleString()}
                            </span>
                            <span className="text-2xl font-bold text-[var(--color-primary)]">万円</span>
                        </div>
                        {/* Underline decoration */}
                        <div className="h-4 w-full bg-[var(--color-accent)]/30 absolute -bottom-2 -rotate-1 -z-10 rounded-full opacity-60" />
                    </div>
                    
                    <p className="mt-8 text-sm text-[var(--color-text-sub)] flex items-center justify-center gap-1">
                        <Info size={14} />
                        実際の受取金額は工事内容により変動します
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
                        <h2 className="text-xl font-bold text-[var(--color-text-main)]">使える補助金が見つかりました</h2>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {result.matchedSubsidies.length > 0 ? (
                            result.matchedSubsidies.map((subsidy, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-[var(--color-background)] rounded-3xl p-5 border border-[var(--color-border)] flex flex-col h-full"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="bg-[var(--color-primary)]/10 text-[var(--color-primary)] text-[10px] px-3 py-1 rounded-full font-bold uppercase">
                                            {subsidy.amountText}
                                        </div>
                                        <div className="flex gap-0.5">
                                            {[...Array(3)].map((_, i) => (
                                                <div key={i} className={`w-2 h-2 rounded-full ${i < subsidy.matchScore ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-border)]'}`} />
                                            ))}
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-[var(--color-text-main)] mb-2 leading-snug">
                                        {subsidy.name}
                                    </h3>
                                    <p className="text-xs text-[var(--color-text-sub)] mb-2">
                                        {subsidy.description}
                                    </p>
                                    <div className="mt-auto pt-4 flex flex-col gap-2">
                                        <div className="flex items-start gap-2 text-[10px] text-[var(--color-text-sub)] bg-white/50 p-2 rounded-lg leading-relaxed">
                                            <Sparkles size={12} className="text-[var(--color-accent)] shrink-0 mt-0.5" />
                                            <span>判定理由: {subsidy.reason}</span>
                                        </div>
                                        {subsidy.note && (
                                            <p className="text-[9px] text-[var(--color-primary)] font-medium">{subsidy.note}</p>
                                        )}
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-full py-12 text-center bg-[var(--color-background)] rounded-3xl border border-dashed border-[var(--color-border)]">
                                <p className="text-[var(--color-text-sub)]">該当する国の補助金制度が見つかりませんでした。</p>
                                <p className="text-xs text-[var(--color-text-sub)] mt-2">自治体独自の制度等をご提案させていただきます。</p>
                            </div>
                        )}
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
