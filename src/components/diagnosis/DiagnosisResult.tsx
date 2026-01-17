"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import {
    Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer,
    Radar as RechartsRadar
} from "recharts";
import { motion } from "framer-motion";
import { Lock, FileText, MessageCircle, Gem } from "lucide-react";
import Link from "next/link";
import { DiagnosisData } from "@/components/inquiry/MultiStepForm";

export const DiagnosisResult = () => {
    const [data, setData] = useState<DiagnosisData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate reading from local storage and analyzing
        const stored = localStorage.getItem("diagnosis_result");
        if (stored) {
            setData(JSON.parse(stored));
            setTimeout(() => setLoading(false), 2000); // Wait for "Generating..." UI
        } else {
            setLoading(false); // No data, show empty state or redirect
        }
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#1A1A1B] flex flex-col items-center justify-center text-white">
                <div className="w-20 h-20 border-4 border-accent border-t-transparent rounded-full animate-spin mb-8"></div>
                <h2 className="text-2xl font-serif font-bold animate-pulse">戦略レポートを生成中...</h2>
                <p className="text-gray-400 mt-4 text-sm tracking-widest">ANALYZING PORTFOLIO DATA</p>
            </div>
        );
    }

    if (!data) {
        return <div className="text-white text-center py-20">データが見つかりません。もう一度診断を行ってください。</div>;
    }

    // --- Logic Generation based on inputs ---
    const incomeVal = Number(data.income);

    // Determine Persona
    let personaTitle = "安定成長重視モデル";
    let advice = "現在の安定した基盤を活かし、国内不動産で着実に資産を拡大すべき時期です。";

    if (data.age === "30代" || data.age === "40代") {
        if (incomeVal >= 20000000) {
            personaTitle = "Strategic Leverage（戦略的・与信最大化モデル）";
            advice = "「45歳の融資限界」というデッドラインまで、貴殿に残された時間はあと僅かです。現在の貴殿の信用力は、日本円の価値毀損に対抗しうる最強の武器です。税引後利益で貯蓄するのではなく、「銀行の資本で資産（RC一棟等）を確保し、インフレを味方につけて債務を実質的に消滅させる」。この逆説的アプローチこそが、貴殿の最適解です。";
        }
    }
    if (data.objective === "税制対策・相続対策") {
        personaTitle = "資産防衛・継承モデル";
        advice = "資産の評価圧縮効果が高い都心不動産と、減価償却メリットのある海外不動産（米国等）を組み合わせたハイブリッド戦略を推奨します。";
    }

    // Radar Chart Data (Dummy Logic)
    const radarData = [
        { subject: '安全性', A: 80, fullMark: 100 },
        { subject: '収益性', A: (incomeVal > 15000000 ? 90 : 70), fullMark: 100 },
        { subject: '流動性', A: 85, fullMark: 100 },
        { subject: '節税効果', A: (data.objective.includes("税") ? 95 : 60), fullMark: 100 },
        { subject: '成長性', A: 75, fullMark: 100 },
    ];

    // Dynamic Total Score Calculation
    const totalScore = Math.round(
        radarData.reduce((acc, curr) => acc + curr.A, 0) / radarData.length
    );

    return (
        <div className="min-h-screen bg-[#1A1A1B] text-white pb-32">
            {/* Header */}
            <header className="py-6 border-b border-white/10 px-4">
                <div className="container mx-auto flex justify-between items-center">
                    <span className="font-display font-bold tracking-widest text-lg">STRATEGY INSIGHT</span>
                    <Gem className="text-accent w-6 h-6" />
                </div>
            </header>

            <main className="container mx-auto px-4 py-10 max-w-lg">
                {/* Verdict Title */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-10"
                >
                    <div className="inline-block bg-accent/20 text-accent text-xs font-bold px-3 py-1 rounded-full mb-4 border border-accent/50">
                        診断完了
                    </div>
                    <h1 className="text-2xl md:text-3xl font-serif font-bold leading-relaxed mb-2">
                        最適な戦略をご提案します
                    </h1>
                    <p className="text-gray-400 text-xs">Analysis ID: {data.analysisId}</p>
                </motion.div>

                {/* Radar Chart Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-[#2C2C2E] rounded-2xl p-6 shadow-xl border border-white/5 mb-8"
                >
                    <h3 className="font-bold text-sm tracking-widest mb-4 flex items-center gap-2">
                        <div className="w-1 h-4 bg-accent"></div> 資産ポートフォリオ分析
                    </h3>
                    <div className="h-[250px] w-full flex justify-center items-center relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                                <PolarGrid stroke="#444" />
                                <PolarAngleAxis dataKey="subject" tick={{ fill: '#888', fontSize: 10 }} />
                                <RechartsRadar
                                    name="Your Portfolio"
                                    dataKey="A"
                                    stroke="#C5A059"
                                    strokeWidth={2}
                                    fill="#C5A059"
                                    fillOpacity={0.3}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                        <div className="absolute bottom-0 right-0">
                            <p className="text-xs text-gray-500">総合スコア</p>
                            <p className="text-2xl font-bold text-accent">{totalScore}<span className="text-sm text-gray-400">/100</span></p>
                        </div>
                    </div>
                </motion.div>

                {/* Verdict Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-8 border border-accent/20 shadow-2xl mb-8 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4 opacity-5">
                        <FileText size={100} />
                    </div>
                    <span className="text-accent text-xs font-bold tracking-widest uppercase block mb-2">RECOMMENDED STRATEGY</span>
                    <h2 className="text-2xl font-serif font-bold text-white mb-4 leading-tight">
                        {personaTitle}
                    </h2>
                    <p className="text-gray-300 font-serif leading-relaxed text-sm mb-6">
                        {advice}
                    </p>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                        <span className="bg-white/10 px-3 py-1 rounded text-[10px] text-gray-300">#借り入れ活用</span>
                        <span className="bg-white/10 px-3 py-1 rounded text-[10px] text-gray-300">#キャピタルゲイン</span>
                        <span className="bg-white/10 px-3 py-1 rounded text-[10px] text-gray-300">#都市開発</span>
                    </div>
                </motion.div>

                {/* CTA Section */}
                <div className="space-y-4">
                    <h3 className="text-center font-display text-accent tracking-widest text-sm mb-6">DIGITAL CONCIERGE</h3>

                    <Link href="#" className="block group">
                        <div className="bg-[#1f1f20] hover:bg-[#2a2a2c] transition-colors border border-white/10 rounded-xl p-5 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                                <Lock size={20} />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-sm text-white mb-1">水面下取引（Off-Market）情報</h4>
                                <p className="text-xs text-gray-400">一般市場に出回らない「Sランク物件」情報の先行開示。</p>
                            </div>
                        </div>
                    </Link>

                    <Link href="#" className="block group">
                        <div className="bg-[#1f1f20] hover:bg-[#2a2a2c] transition-colors border border-white/10 rounded-xl p-5 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                                <FileText size={20} />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-sm text-white mb-1">融資承認シミュレーション</h4>
                                <p className="text-xs text-gray-400">銀行評価（掛目）に基づき、実際の「融資可否」と「金利」を試算。</p>
                            </div>
                        </div>
                    </Link>

                    <Link href="#" className="block group">
                        <div className="bg-[#1f1f20] hover:bg-[#2a2a2c] transition-colors border border-white/10 rounded-xl p-5 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                                <MessageCircle size={20} />
                            </div>
                            <div className="flex-1">
                                <h4 className="font-bold text-sm text-white mb-1">セカンドオピニオン</h4>
                                <p className="text-xs text-gray-400">オーナー直通ラインを開放。他社提案の妥当性をプロがジャッジ。</p>
                            </div>
                        </div>
                    </Link>
                </div>
            </main>

            {/* Floating Bottom CTA */}
            <div className="fixed bottom-0 left-0 w-full bg-[#1A1A1B]/90 backdrop-blur-md border-t border-accent/20 p-4 pb-8 z-50">
                <Link
                    href="https://line.me/"
                    className="w-full max-w-md mx-auto bg-accent hover:bg-accent-light text-[#1A1A1B] font-bold py-4 rounded-full shadow-lg shadow-accent/20 flex items-center justify-center gap-3 h-auto min-h-[56px] transition-all"
                >
                    <Lock size={20} className="shrink-0" />
                    <span>「非公開物件リスト」を解錠する</span>
                </Link>
            </div>
        </div>
    );
};
