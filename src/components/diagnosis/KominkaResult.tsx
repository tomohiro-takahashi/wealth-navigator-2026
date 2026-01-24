"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { YieldResult as YieldResultType } from "@/lib/calculators/diagnosis-logic";
import Link from "next/link";
import { TrendingUp, Wallet, Calendar, PiggyBank, Sparkles, Key, ArrowRight, ShieldCheck, HelpCircle, CheckCircle2 } from "lucide-react";

export const KominkaResult = () => {
    const [result, setResult] = useState<YieldResultType | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem("diagnosis_result");
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (parsed.brand === 'kominka' || parsed.yields) {
                    setResult(parsed);
                }
            } catch (e) {
                console.error("Failed to parse diagnosis result", e);
            }
        }
    }, []);

    if (!result) return (
        <div className="flex flex-col items-center justify-center py-20 text-white/50">
            <p>診断結果が見つかりません。シミュレーションをやり直してください。</p>
            <Link href="/simulation" className="mt-4 text-[#977e4e] underline font-bold">シミュレーターへ戻る</Link>
        </div>
    );

    const judgmentIcon = {
        'HIGH_YIELD': <TrendingUp className="text-emerald-500" />,
        'STANDARD': <CheckCircle2 className="text-[#977e4e]" />,
        'LOW_YIELD': <div className="text-amber-500">!</div>
    }[result.judgment];

    return (
        <div className="flex flex-col gap-6 animate-fade-in pb-40 font-sans">
            {/* Status Badge Section */}
            <div className="py-8 flex flex-col items-center text-center">
                <div className="inline-flex items-center gap-2 px-6 py-1.5 rounded-full border border-[#977e4e]/50 bg-[#977e4e]/10 mb-4">
                    <Sparkles className="text-[#977e4e]" size={14} />
                    <span className="text-[#977e4e] text-xs font-bold tracking-[0.2em] uppercase">{result.judgment} STATUS</span>
                </div>
                <p className="text-white text-xl md:text-2xl font-serif font-bold leading-relaxed max-w-[90%] mx-auto">
                    {result.message}
                </p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4 text-center">
                <div className="flex flex-col gap-1.5 rounded-xl p-4 bg-[#1c1a16] border border-[#977e4e]/30">
                    <div className="flex items-center justify-between mb-0.5">
                        <p className="text-white/70 text-[11px] font-bold">表面利回り</p>
                        <TrendingUp className="text-[#977e4e]" size={12} />
                    </div>
                    <p className="text-[#977e4e] tracking-tight text-2xl font-extrabold leading-tight font-manrope">
                        {result.yields.gross}<span className="text-base">%</span>
                    </p>
                </div>
                <div className="flex flex-col gap-1.5 rounded-xl p-4 bg-[#1c1a16] border border-[#977e4e]/30">
                    <div className="flex items-center justify-between mb-0.5">
                        <p className="text-white/70 text-[11px] font-bold">実質利回り</p>
                        <Wallet className="text-[#977e4e]" size={12} />
                    </div>
                    <p className="text-[#977e4e] tracking-tight text-2xl font-extrabold leading-tight font-manrope">
                        {result.yields.net}<span className="text-base">%</span>
                    </p>
                </div>
                <div className="flex flex-col gap-1.5 rounded-xl p-4 bg-[#1c1a16] border border-white/5">
                    <div className="flex items-center justify-between mb-0.5">
                        <p className="text-white/70 text-[11px] font-bold">投資回収期間</p>
                        <Calendar className="text-white/20" size={12} />
                    </div>
                    <p className="text-white tracking-tight text-xl font-bold leading-tight font-manrope">
                        {result.paybackPeriod} <span className="text-xs font-normal opacity-60">Years</span>
                    </p>
                </div>
                <div className="flex flex-col gap-1.5 rounded-xl p-4 bg-[#1c1a16] border border-white/5">
                    <div className="flex items-center justify-between mb-0.5">
                        <p className="text-white/70 text-[11px] font-bold">月間CF</p>
                        <PiggyBank className="text-white/20" size={12} />
                    </div>
                    <p className="text-white tracking-tight text-xl font-bold leading-tight font-manrope">
                        ¥{result.income.monthlyCashFlow.toLocaleString()}<span className="text-xs font-normal opacity-60">万</span>
                    </p>
                </div>
            </div>

            {/* Headline */}
            <div className="flex items-center gap-3 mb-2 mt-4">
                <div className="h-6 w-1 bg-[#977e4e] rounded-full"></div>
                <h3 className="text-white tracking-tight text-xl font-bold font-serif">投資収益シミュレーション詳細</h3>
            </div>

            {/* Investment Summary Details */}
            <div className="bg-[#1c1a16] rounded-xl p-4 border border-white/5 mb-8">
                <div className="space-y-3">
                    <div className="flex justify-between items-center py-1 border-b border-white/5">
                        <p className="text-white/40 text-[13px]">物件取得費</p>
                        <p className="text-white/80 text-sm font-semibold font-manrope">¥{result.investment.breakdown.acquisition.toLocaleString()}万</p>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-white/5">
                        <p className="text-white/40 text-[13px]">リフォーム/リノベ費用</p>
                        <p className="text-white/80 text-sm font-semibold font-manrope">¥{result.investment.breakdown.renovation.toLocaleString()}万</p>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-white/5">
                        <p className="text-white/40 text-[13px]">諸経費/その他費用</p>
                        <p className="text-white/80 text-sm font-semibold font-manrope">¥{result.investment.breakdown.other.toLocaleString()}万</p>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-white/5">
                        <p className="text-white/40 text-[13px]">想定月額賃料</p>
                        <p className="text-white/80 text-sm font-semibold font-manrope">¥{result.input.monthlyRent.toLocaleString()}万</p>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                        <p className="text-[#977e4e] text-[13px] font-bold uppercase tracking-wider">初期投資額 合計</p>
                        <p className="text-[#977e4e] text-base font-extrabold font-manrope">¥{result.investment.total.toLocaleString()}万</p>
                    </div>
                </div>
            </div>

            {/* Secret Route Section */}
            <div className="relative overflow-hidden rounded-2xl p-6 mb-8 bg-gradient-to-br from-[#2a261f] to-[#12110f] border border-[#977e4e]/30">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <span className="material-symbols-outlined text-[80px] text-[#977e4e]">key_visualizer</span>
                </div>
                <div className="relative z-10 font-serif">
                    <div className="flex items-center gap-2 mb-3">
                        <span className="material-symbols-outlined text-[#977e4e] text-lg">auto_awesome</span>
                        <h4 className="text-[#977e4e] text-sm font-bold tracking-widest uppercase">秘蔵ルート</h4>
                    </div>
                    <h3 className="text-white text-lg font-bold mb-3 tracking-wide">独自の仕入れ手法</h3>
                    <p className="text-white/70 text-sm leading-relaxed mb-4 font-sans">
                        独自の「空き家錬金術」ネットワークにより、市場に出る前の未公開物件へいち早くアクセス。通常より10〜15%低い取得コストでの仕入れを実現します。
                    </p>
                    <div className="inline-flex items-center text-xs font-bold text-[#977e4e] font-manrope cursor-pointer hover:brightness-125 transition-all">
                        仕入れ手法の秘密を見る
                        <span className="material-symbols-outlined text-xs ml-1">arrow_forward</span>
                    </div>
                </div>
            </div>

            {/* Sticky Bottom CTA */}
            <div className="fixed bottom-0 left-0 right-0 bg-[#12110f]/90 backdrop-blur-xl border-t border-white/10 p-4 pb-10 z-50">
                <div className="max-w-md mx-auto space-y-3">
                    {/* Primary Gold CTA */}
                    <Link 
                        href="/inquiry" 
                        className="w-full h-14 bg-gradient-to-br from-[#977e4e] via-[#d4bc8d] to-[#977e4e] text-[#12110f] font-black py-4 rounded-xl flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-transform text-center"
                    >
                        <span className="material-symbols-outlined font-bold text-lg">real_estate_agent</span>
                        <span className="font-serif tracking-wider">高利回り物件の提案を受ける</span>
                    </Link>
                    {/* LINE Green CTA */}
                    <Link 
                        href="https://line.me/R/ti/p/@kominka"
                        className="w-full bg-[#06C755] text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-transform text-center"
                    >
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 2C6.48 2 2 5.51 2 9.83c0 2.39 1.34 4.52 3.51 5.92-.17.6-.62 2.18-.71 2.51-.11.41.14.4.29.3.13-.09 2.16-1.46 3.02-2.05.61.17 1.25.26 1.89.26 5.52 0 10-3.51 10-7.83S17.52 2 12 2zm4.69 11.23c-.15.33-.76.33-1.04 0-.25-.3-.93-2.01-1.01-2.22-.08-.21-.19-.32-.4-.32s-.32.11-.4.32c-.08.21-.76 1.92-1.01 2.22-.28.33-.89.33-1.04 0-.15-.33-1.05-3.05-1.05-3.05a.482.482 0 0 1 .13-.53c.17-.13.4-.11.53.05l.77 1.48 1.07-2.91a.5.5 0 0 1 .47-.32c.2 0 .38.12.47.32l1.07 2.91.77-1.48c.13-.16.36-.18.53-.05.15.11.2.33.13.53l-1.05 3.05z"></path>
                        </svg>
                        <span className="font-serif tracking-wide">LINEで非公開物件情報を受け取る</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};
