"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FlipResult as FlipResultType } from "@/lib/calculators/flip-logic";
import Link from "next/link";

export const FlipResult = () => {
    const [result, setResult] = useState<FlipResultType & { listingPrice: number } | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem("diagnosis_result");
        if (stored) {
            setResult(JSON.parse(stored));
        }
    }, []);

    if (!result) return null;

    const { judgment, calculation, input, listingPrice } = result;

    return (
        <div className="flex flex-col gap-6 animate-fade-in pb-40">
            {/* Status Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative overflow-hidden border border-white/10 bg-[#1b2727] p-6 shadow-2xl"
            >
                {/* Neon Accent Line */}
                <div className={`absolute top-0 left-0 h-1 w-full ${
                    judgment.id === 'BUY' ? 'bg-[#39ff14]' : judgment.id === 'NEGOTIATE' ? 'bg-[#facc15]' : 'bg-[#ff4d4d]'
                }`} />

                {/* Badge */}
                <div className="absolute top-4 right-4 text-[10px] font-bold tracking-[0.2em] uppercase px-3 py-1 border border-white/20 bg-black/40 text-white/60">
                    Analysis Status: {judgment.id === 'BUY' ? 'Optimal' : judgment.id === 'NEGOTIATE' ? 'Caution' : 'Rejected'}
                </div>

                <div className="pt-4">
                    <p className="text-[#9bb9bb] text-[10px] font-bold uppercase tracking-[0.3em] mb-2">Final Verdict</p>
                    <h1 className={`text-5xl font-black italic tracking-tighter mb-6 ${
                        judgment.id === 'BUY' ? 'text-[#39ff14]' : judgment.id === 'NEGOTIATE' ? 'text-[#facc15]' : 'text-[#ff4d4d]'
                    }`}>
                        {judgment.label}
                    </h1>

                    <div className="space-y-4">
                        <div className={`bg-black/40 p-5 border-l-4 ${
                            judgment.id === 'BUY' ? 'border-[#39ff14]' : judgment.id === 'NEGOTIATE' ? 'border-[#facc15]' : 'border-[#ff4d4d]'
                        }`}>
                            <p className={`text-[10px] font-bold mb-1 uppercase tracking-widest ${
                                judgment.id === 'BUY' ? 'text-[#39ff14]' : judgment.id === 'NEGOTIATE' ? 'text-[#facc15]' : 'text-[#ff4d4d]'
                            }`}>推奨価格との差額</p>
                            <div className="flex items-baseline gap-2 font-mono">
                                <span className={`text-3xl font-bold ${
                                    judgment.id === 'BUY' ? 'text-[#39ff14]' : judgment.id === 'NEGOTIATE' ? 'text-[#facc15]' : 'text-[#ff4d4d]'
                                }`}>
                                    {calculation.netProfit > 0 ? '+' : ''}{calculation.netProfit.toLocaleString()}
                                </span>
                                <span className="text-xs font-bold text-white/40">万円</span>
                            </div>
                        </div>
                        <p className="text-white/70 text-sm leading-relaxed font-medium">
                            {judgment.message}<br />
                            <span className="text-white/40 text-xs mt-1 block tracking-tight">
                                {judgment.description}
                            </span>
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mt-4">
                <div className="bg-[#1b2727] p-4 border border-white/5 space-y-1">
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">ROI (Net)</p>
                    <p className={`text-2xl font-mono font-bold ${calculation.roi > 0 ? 'text-[#39ff14]' : 'text-[#ff4d4d]'}`}>
                        {calculation.roi}%
                    </p>
                </div>
                <div className="bg-[#1b2727] p-4 border border-white/5 space-y-1">
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">Break Even</p>
                    <p className="text-2xl font-mono font-bold text-white">
                        {calculation.breakEvenPrice.toLocaleString()}<span className="text-xs ml-1">万円</span>
                    </p>
                </div>
            </div>

            {/* Sourcing Route Section */}
            <div className="mt-8 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                    <div className="h-4 w-1 bg-[#06e8f9]"></div>
                    <h2 className="text-white text-sm font-bold tracking-widest uppercase">Flip Logic Sourcing Network</h2>
                </div>

                <div className="space-y-2">
                    {[
                        { icon: 'gavel', title: '任意売却・競売前物件', tag: 'FORECLOSURE' },
                        { icon: 'account_balance', title: '金融機関との直接取引案件', tag: 'DIRECT BANK' },
                        { icon: 'hub', title: '業者間ネットワークの未公開情報', tag: 'OFF-MARKET' },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-4 bg-[#1b2727] p-4 border border-white/5">
                            <div className="text-[#06e8f9] flex items-center justify-center bg-[#06e8f9]/10 size-10 rounded-none border border-[#06e8f9]/20">
                                <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                            </div>
                            <div>
                                <p className="text-white text-xs font-bold">{item.title}</p>
                                <p className="text-white/30 text-[9px] font-mono tracking-widest mt-0.5">{item.tag}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Value Proposition */}
                <div className="mt-6 p-5 border border-[#06e8f9]/30 bg-[#06e8f9]/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-2 opacity-5 translate-x-4 -translate-y-4">
                        <span className="material-symbols-outlined text-[80px]">trending_down</span>
                    </div>
                    <div className="flex items-start gap-4">
                        <span className="material-symbols-outlined text-[#06e8f9] mt-1">insights</span>
                        <div>
                            <p className="text-[#06e8f9] text-base font-bold tracking-tighter">
                                → 市場価格より10〜30%安く仕入れ可能
                            </p>
                            <p className="text-white/50 text-[11px] mt-2 leading-relaxed">
                                Flip Logic独自の非公開ルートを活用することで、今回の判定結果を覆す有利な条件での仕入れ提案が可能です。
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Details Table */}
            <div className="mt-8 bg-[#1b2727] border border-white/10 overflow-hidden font-mono">
                {[
                    { label: 'Expected Resale (ARV)', value: input.expectedResalePrice },
                    { label: 'Renovation Estimate', value: input.renovationCost },
                    { label: 'Purchase Price (Listing)', value: listingPrice },
                    { label: 'Total Investment', value: calculation.totalInvestment },
                ].map((row, i) => (
                    <div key={i} className="grid grid-cols-2 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                        <div className="p-3 border-r border-white/5 bg-white/2 text-[10px] text-white/50 uppercase tracking-widest flex items-center">{row.label}</div>
                        <div className="p-3 text-sm font-bold text-right">¥{row.value.toLocaleString()} ,000</div>
                    </div>
                ))}
            </div>

            {/* Sticky Actions */}
            <div className="fixed bottom-0 left-0 right-0 bg-background-dark/95 backdrop-blur-xl border-t border-white/10 p-6 z-50">
                <div className="max-w-[480px] mx-auto space-y-3">
                    <Link href="/inquiry" className="w-full bg-[#06e8f9] hover:bg-[#06e8f9]/90 text-black font-black py-4 rounded-none flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(6,232,249,0.3)] transition-all active:scale-95 uppercase text-sm tracking-widest">
                        <span className="material-symbols-outlined text-lg">support_agent</span>
                        <span>専門家に提案を依頼する</span>
                    </Link>
                    <Link href="https://line.me/R/ti/p/@flip_logic" className="w-full bg-[#22c55e] hover:bg-[#22c55e]/90 text-white font-bold py-4 rounded-none flex items-center justify-center gap-3 shadow-lg transition-all active:scale-95 text-sm tracking-widest uppercase">
                        <span className="material-symbols-outlined text-lg">chat</span>
                        <span>LINEで極秘物件情報を受け取る</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};
