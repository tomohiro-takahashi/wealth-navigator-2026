"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { YieldCalculator, YieldInput } from "@/lib/calculators/diagnosis-logic";

export const KominkaSimulator = () => {
    const router = useRouter();
    const [input, setInput] = useState<YieldInput>({
        acquisitionPrice: 0,
        renovationCost: 0,
        otherExpenses: 0,
        monthlyRent: 0,
        annualExpenseRate: 0.15
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCalculate = async () => {
        if (input.acquisitionPrice <= 0) {
            alert("物件取得価格を入力してください。");
            return;
        }

        setIsSubmitting(true);
        // Simulate Calculation Delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        const result = YieldCalculator.calculate(input);
        
        // Save result to localStorage for the result page
        if (typeof window !== "undefined") {
            localStorage.setItem("diagnosis_result", JSON.stringify({
                ...result,
                brand: 'kominka'
            }));
        }

        router.push("/diagnosis/result");
    };

    const updateInput = (key: keyof YieldInput, value: number) => {
        setInput(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="flex flex-col gap-8 animate-fade-in relative z-10 font-sans">
            {/* Headline Section */}
            <div className="py-4 text-center">
                <h2 className="text-white tracking-wide text-2xl font-bold leading-tight font-serif">シミュレーション条件入力</h2>
                <p className="text-[#977e4e]/70 text-sm mt-2 font-medium">物件の詳細情報を入力してください</p>
                <div className="h-1 w-12 bg-[#977e4e] mx-auto mt-4 rounded-full"></div>
            </div>

            <div className="space-y-6">
                {/* 物件取得価格 */}
                <div className="flex flex-col">
                    <div className="flex items-center justify-between pb-2">
                        <label className="text-[#977e4e] text-base font-semibold">物件取得価格</label>
                        <span className="text-[10px] text-[#191919] bg-[#977e4e] px-2 py-0.5 rounded font-bold uppercase">必須</span>
                    </div>
                    <div className="flex w-full items-stretch rounded-lg group">
                        <input 
                            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg rounded-r-none text-white focus:outline-0 focus:ring-0 border border-[#977e4e]/30 bg-[#23221f] focus:border-[#977e4e] h-14 placeholder:text-[#b0aca6]/50 px-4 border-r-0 text-lg font-medium transition-all" 
                            inputMode="decimal" 
                            placeholder="0" 
                            type="number"
                            value={input.acquisitionPrice || ""}
                            onChange={(e) => updateInput('acquisitionPrice', parseInt(e.target.value) || 0)}
                        />
                        <div className="text-[#977e4e] flex border border-[#977e4e]/30 bg-[#23221f] items-center justify-center px-4 rounded-r-lg border-l-0 group-focus-within:border-[#977e4e] transition-all">
                            <span className="material-symbols-outlined text-lg">payments</span>
                            <span className="ml-1 text-sm font-bold">円</span>
                        </div>
                    </div>
                </div>

                {/* リノベーション費用 */}
                <div className="flex flex-col">
                    <label className="text-[#977e4e] text-base font-semibold pb-2">リノベーション費用</label>
                    <div className="flex w-full items-stretch rounded-lg group">
                        <input 
                            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg rounded-r-none text-white focus:outline-0 focus:ring-0 border border-[#977e4e]/30 bg-[#23221f] focus:border-[#977e4e] h-14 placeholder:text-[#b0aca6]/50 px-4 border-r-0 text-lg font-medium transition-all" 
                            inputMode="decimal" 
                            placeholder="0" 
                            type="number"
                            value={input.renovationCost || ""}
                            onChange={(e) => updateInput('renovationCost', parseInt(e.target.value) || 0)}
                        />
                        <div className="text-[#977e4e] flex border border-[#977e4e]/30 bg-[#23221f] items-center justify-center px-4 rounded-r-lg border-l-0 group-focus-within:border-[#977e4e] transition-all">
                            <span className="material-symbols-outlined text-lg">format_paint</span>
                            <span className="ml-1 text-sm font-bold">円</span>
                        </div>
                    </div>
                </div>

                {/* 諸経費 */}
                <div className="flex flex-col">
                    <div className="flex items-center gap-1 pb-2">
                        <label className="text-[#977e4e] text-base font-semibold">諸経費</label>
                        <span className="material-symbols-outlined text-[#977e4e]/50 text-sm cursor-help">help</span>
                    </div>
                    <div className="flex w-full items-stretch rounded-lg group">
                        <input 
                            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg rounded-r-none text-white focus:outline-0 focus:ring-0 border border-[#977e4e]/30 bg-[#23221f] focus:border-[#977e4e] h-14 placeholder:text-[#b0aca6]/50 px-4 border-r-0 text-lg font-medium transition-all" 
                            inputMode="decimal" 
                            placeholder="0" 
                            type="number"
                            value={input.otherExpenses || ""}
                            onChange={(e) => updateInput('otherExpenses', parseInt(e.target.value) || 0)}
                        />
                        <div className="text-[#977e4e] flex border border-[#977e4e]/30 bg-[#23221f] items-center justify-center px-4 rounded-r-lg border-l-0 group-focus-within:border-[#977e4e] transition-all">
                            <span className="material-symbols-outlined text-lg">receipt_long</span>
                            <span className="ml-1 text-sm font-bold">円</span>
                        </div>
                    </div>
                </div>

                <div className="pt-4 pb-2">
                    <div className="border-t border-[#977e4e]/20"></div>
                </div>

                {/* 想定月額家賃 */}
                <div className="flex flex-col">
                    <label className="text-[#977e4e] text-base font-semibold pb-2">想定月額家賃</label>
                    <div className="flex w-full items-stretch rounded-lg group">
                        <input 
                            className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-lg rounded-r-none text-white focus:outline-0 focus:ring-0 border border-[#977e4e]/30 bg-[#23221f] focus:border-[#977e4e] h-14 placeholder:text-[#b0aca6]/50 px-4 border-r-0 text-lg font-medium transition-all" 
                            inputMode="decimal" 
                            placeholder="0" 
                            type="number"
                            value={input.monthlyRent || ""}
                            onChange={(e) => updateInput('monthlyRent', parseInt(e.target.value) || 0)}
                        />
                        <div className="text-[#977e4e] flex border border-[#977e4e]/30 bg-[#23221f] items-center justify-center px-4 rounded-r-lg border-l-0 group-focus-within:border-[#977e4e] transition-all">
                            <span className="material-symbols-outlined text-lg">home_work</span>
                            <span className="ml-1 text-sm font-bold">円</span>
                        </div>
                    </div>
                </div>

                {/* 年間経費率 (Select) */}
                <div className="flex flex-col">
                    <label className="text-[#977e4e] text-base font-semibold pb-2">年間経費率</label>
                    <div className="relative">
                        <select 
                            className="form-select block w-full rounded-lg text-white border border-[#977e4e]/30 bg-[#23221f] focus:border-[#977e4e] focus:ring-0 h-14 px-4 appearance-none text-lg font-medium cursor-pointer"
                            value={input.annualExpenseRate * 100}
                            onChange={(e) => updateInput('annualExpenseRate', parseInt(e.target.value) / 100)}
                        >
                            <option value="10">10% (標準的)</option>
                            <option value="15">15% (推奨)</option>
                            <option value="20">20% (保守的)</option>
                            <option value="25">25% (慎重)</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#977e4e]">
                            <span className="material-symbols-outlined">expand_more</span>
                        </div>
                    </div>
                    <p className="text-[11px] text-[#977e4e]/60 mt-2 px-1 italic">※固定資産税、管理委託料、修繕積立金などが含まれます。</p>
                </div>
            </div>

            {/* Bottom Button Area */}
            <div className="pt-10">
                <button
                    onClick={handleCalculate}
                    disabled={isSubmitting}
                    className={`w-full h-16 rounded-lg flex items-center justify-center gap-3 shadow-[0_4px_20px_rgba(151,126,78,0.4)] transition-all group active:scale-[0.98] ${
                        isSubmitting ? "opacity-50 cursor-not-allowed bg-gray-600" : "bg-gradient-to-br from-[#977e4e] via-[#c5b38a] to-[#977e4e]"
                    }`}
                >
                    {isSubmitting ? (
                        <span className="text-[#191919] font-bold text-lg tracking-widest animate-pulse">解析中...</span>
                    ) : (
                        <>
                            <span className="text-[#191919] font-bold text-lg tracking-widest uppercase">シミュレーション実行</span>
                            <span className="material-symbols-outlined text-[#191919] group-hover:translate-x-1 transition-transform">analytics</span>
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};
