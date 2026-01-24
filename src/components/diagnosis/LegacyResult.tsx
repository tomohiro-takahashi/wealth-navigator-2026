"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ChoiceResult as ChoiceResultType } from "@/lib/calculators/diagnosis-logic";
import Link from "next/link";
import { TrendingUp, MessageCircle, FileText, ArrowRight, UserCheck, Key, Home, History, Compass, User, AlertCircle, Sparkles, Heart, Layers, ExternalLink, CheckCircle2 } from "lucide-react";

export const LegacyResult = () => {
    const [result, setResult] = useState<ChoiceResultType | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem("diagnosis_result");
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                if (parsed.brand === 'legacy' || parsed.diagnosisType) {
                    setResult(parsed);
                }
            } catch (e) {
                console.error("Failed to parse diagnosis result", e);
            }
        }
    }, []);

    if (!result) return (
        <div className="flex flex-col items-center justify-center py-20 text-white/50 font-sans">
            <AlertCircle className="mb-4 opacity-20" size={48} />
            <p>診断データが見つかりません。</p>
            <Link href="/simulation" className="mt-4 text-[#a68a68] underline font-bold">診断をやり直す</Link>
        </div>
    );

    const { sell, rent, keep } = result.scores;
    const maxScore = Math.max(sell, rent, keep);
    
    // Pattern Definitions
    const patterns = {
        sell: {
            label: "Sell Recommendation",
            icon: <TrendingUp className="text-[#0bda19]" size={14} />,
            statusText: "最適な選択肢として推奨",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDXLfsZZ7rAXJ1GOrf3ob2NW_NGYMNTcOGpkU4K1uHPNT7zJuKrITB3Us4S6FaCh0NMJrVrDPXW2xngi3tt3Oz9XVeClgbG2Df7aYZD-YEPZ79gwtZ9Anqaj4lO1WSOaA37zlMioyYWqqlCMXp0i6tfsifuaf1fLiBYOR9sWdgsSRjIzq2II_yESx8OxdYVOw7y4e_xkz7MjH7xaRmzqFS6dcbSsBBkSmNRXtKoMFHVvwLrynqgk_4eBna-wXhyTT9H_GdwbIVpzxlG",
        },
        rent: {
            label: "Rent Recommendation",
            icon: <TrendingUp className="text-[#0bda19]" size={14} />,
            statusText: "最適な選択肢として推奨",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCnwVb6dzJZUm05i5oDkUT4f1w55opFoad3V_dDWPhR1NXmouJyzcbGmha9p4fz64aP4Du1MWqNCH56TB84PVY63owgurxUZt6tpi215D468Ovy0tyRJzLiSgeCeaL5PWLJT6dPsTX0J9ixE9rFvF34io4_Ynt0rvWTDobS_56uY8-yIkulEJzLXugUsCbddY2ZAdUwN2VU6tAiDE9vgR1YKICgabb-7YUrLZOAeUcjZQtjWBlGyiCDs1SiS89POBxkI_iK_1QB-v56",
        },
        keep: {
            label: "Hold Recommendation",
            icon: <Heart className="text-[#0bda19]" size={14} />,
            statusText: "現状の維持を推奨",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD2EcsNoBG-elilXCo2Zz6eJYYAv-I4KIuwIiowcBU1fHQP1U3cXJO3TbvI9Mm__TJaiE68z_nyV4QfcL-IPn8nxFkeLpN14RyjO5tKKH8U0RRVxv5ztGHiKogKGHshzaCCtIVJXjX2I2NXs8evyr9706IrltqcNhTqWVV0bZdcvGfdqQExiA3VL75IGrHpcnPkb2U_u9vk0WO_peZKWVAmydrrTfyrSS9oy81LhTOLbj0I2Bq9ErMq7jrNu4Y96zUaazRCwsjiYtML",
        },
        hybrid: {
            label: "Complex Status",
            icon: <Layers className="text-[#a68a68]" size={14} />,
            statusText: "複数の可能性がバランスよく存在します",
            image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDXLfsZZ7rAXJ1GOrf3ob2NW_NGYMNTcOGpkU4K1uHPNT7zJuKrITB3Us4S6FaCh0NMJrVrDPXW2xngi3tt3Oz9XVeClgbG2Df7aYZD-YEPZ79gwtZ9Anqaj4lO1WSOaA37zlMioyYWqqlCMXp0i6tfsifuaf1fLiBYOR9sWdgsSRjIzq2II_yESx8OxdYVOw7y4e_xkz7MjH7xaRmzqFS6dcbSsBBkSmNRXtKoMFHVvwLrynqgk_4eBna-wXhyTT9H_GdwbIVpzxlG",
        }
    };

    const currentPattern = patterns[result.diagnosisType];

    const getScoreWidth = (score: number) => {
        if (maxScore === 0) return 0;
        return (score / maxScore) * 100;
    };

    return (
        <div className="flex flex-col gap-6 animate-fade-in pb-40 font-sans max-w-md mx-auto text-white">
            {/* Analysis Section */}
            <div className="px-4 py-6">
                <div className="flex flex-col gap-2">
                    <p className="text-[#a68a68] text-xs font-bold tracking-widest uppercase">Analysis</p>
                    <p className="text-white text-2xl font-bold leading-tight">
                        スコアリング結果：{result.diagnosisType === 'sell' ? '売却' : result.diagnosisType === 'rent' ? '賃貸' : result.diagnosisType === 'keep' ? '維持' : '複合'}
                    </p>
                    <div className="flex gap-2 items-center mt-1">
                        {currentPattern.icon}
                        <p className="text-[#0bda19] text-sm font-medium leading-normal">{currentPattern.statusText}</p>
                    </div>

                    <div className="grid gap-x-4 gap-y-6 grid-cols-[60px_1fr] items-center py-6">
                        <p className="text-[#afaba7] text-xs font-bold leading-normal tracking-wider">売却</p>
                        <div className="h-4 w-full bg-[#33312e] rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${getScoreWidth(sell)}%` }}
                                transition={{ duration: 1, ease: "easeOut" }}
                                className={`h-full rounded-full ${result.diagnosisType === 'sell' || result.diagnosisType === 'hybrid' ? 'bg-[#a68a68]' : 'bg-[#4b4844]'}`}
                            ></motion.div>
                        </div>
                        <p className="text-[#afaba7] text-xs font-bold leading-normal tracking-wider">賃貸</p>
                        <div className="h-4 w-full bg-[#33312e] rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${getScoreWidth(rent)}%` }}
                                transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                                className={`h-full rounded-full ${result.diagnosisType === 'rent' || result.diagnosisType === 'hybrid' ? 'bg-[#a68a68]' : 'bg-[#4b4844]'}`}
                            ></motion.div>
                        </div>
                        <p className="text-[#afaba7] text-xs font-bold leading-normal tracking-wider">維持</p>
                        <div className="h-4 w-full bg-[#33312e] rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${getScoreWidth(keep)}%` }}
                                transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
                                className={`h-full rounded-full ${result.diagnosisType === 'keep' || result.diagnosisType === 'hybrid' ? 'bg-[#a68a68]' : 'bg-[#4b4844]'}`}
                            ></motion.div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Result Card */}
            <div className="px-4 mb-4">
                <motion.div 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="flex flex-col items-stretch justify-start rounded-xl border-2 border-[#a68a68]/40 bg-[#23211f] overflow-hidden shadow-2xl"
                >
                    <div 
                        className="w-full bg-center bg-no-repeat aspect-[16/9] bg-cover" 
                        style={{ backgroundImage: `url("${currentPattern.image}")` }}
                    ></div>
                    <div className="flex w-full flex-col items-stretch justify-center gap-3 p-6">
                        <div className="inline-flex items-center gap-2 px-2 py-1 bg-[#a68a68]/20 rounded w-fit">
                            <Sparkles className="text-[#a68a68]" size={12} />
                            <p className="text-[#a68a68] text-[10px] font-bold uppercase tracking-tighter">{currentPattern.label}</p>
                        </div>
                        <p className="text-white text-xl font-bold leading-tight tracking-tight">
                            {result.title}
                        </p>
                        <p className="text-[#afaba7] text-sm font-normal leading-relaxed whitespace-pre-wrap">
                            {result.message}
                        </p>
                    </div>
                </motion.div>
            </div>

            {/* Next Steps Header */}
            <div className="px-4 mt-4">
                <h3 className="text-white text-lg font-bold leading-tight tracking-tight">次にやるべきこと</h3>
                <div className="mt-4 flex flex-col gap-3">
                    {result.nextActions.map((action, i) => (
                        <div key={i} className="flex items-start gap-3 bg-white/5 p-4 rounded-lg border border-white/5">
                            <div className="w-6 h-6 rounded-full bg-[#a68a68]/20 flex items-center justify-center shrink-0">
                                <span className="text-[#a68a68] text-xs font-bold">{i + 1}</span>
                            </div>
                            <p className="text-white/80 text-sm font-medium">{action}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="px-4 mt-8">
                <h3 className="text-white text-lg font-bold leading-tight tracking-tight">ご相談窓口</h3>
                <p className="text-[#afaba7] text-xs mt-1">あなたの状況に合わせた最適な相談方法</p>
            </div>

            {/* Emotional Path: LINE */}
            <div className="px-4">
                <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-[#4b4844] bg-[#1a1a1a] p-5">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-[#06C755]">
                            <MessageCircle size={18} />
                            <p className="text-sm font-bold">Emotional Support</p>
                        </div>
                        <p className="text-white text-base font-bold leading-tight">LINEでコーディネーターに無料相談</p>
                        <p className="text-[#afaba7] text-sm font-normal leading-normal">「どうすべきか分からない」等のモヤモヤを解消</p>
                    </div>
                    <Link 
                        href="https://line.me/R/ti/p/@legacy" 
                        className="w-full h-12 flex items-center justify-center gap-2 rounded-lg bg-[#06C755] text-white text-sm font-bold active:scale-95 transition-transform"
                    >
                        <span>LINE相談を開始</span>
                        <ExternalLink size={14} />
                    </Link>
                </div>
            </div>

            {/* Practical Path: Formal Consultation */}
            <div className="px-4">
                <div className="flex flex-col items-start justify-between gap-4 rounded-xl border border-[#a68a68]/30 bg-[#23211f] p-5">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 text-[#a68a68]">
                            <Compass size={18} />
                            <p className="text-sm font-bold">Practical Path</p>
                        </div>
                        <p className="text-white text-base font-bold leading-tight">具体的な査定・活用相談（無料）</p>
                        <p className="text-[#afaba7] text-sm font-normal leading-normal">いくらで売れる？リフォームはいくら？を知る</p>
                    </div>
                    <Link 
                        href="/inquiry" 
                        className="w-full h-12 flex items-center justify-center gap-2 rounded-lg bg-[#a68a68] text-[#151513] text-sm font-bold active:scale-95 transition-transform"
                    >
                        <span>査定・活用を相談する</span>
                        <ArrowRight size={14} />
                    </Link>
                </div>
            </div>

            {/* iOS Style Bottom Tab Bar (Fixed dummy for design matching) */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#191919]/90 backdrop-blur-xl border-t border-white/5 pb-8 pt-2">
                <div className="max-w-md mx-auto flex justify-around items-center px-4">
                    <div className="flex flex-col items-center gap-1 text-[#afaba7]">
                        <Home size={20} />
                        <span className="text-[10px] font-medium">ホーム</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 text-[#a68a68]">
                        <FileText size={20} className="fill-[#a68a68]" />
                        <span className="text-[10px] font-medium">診断</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 text-[#afaba7]">
                        <Compass size={20} />
                        <span className="text-[10px] font-medium">事例紹介</span>
                    </div>
                    <div className="flex flex-col items-center gap-1 text-[#afaba7]">
                        <User size={20} />
                        <span className="text-[10px] font-medium">マイページ</span>
                    </div>
                </div>
            </nav>
        </div>
    );
};
