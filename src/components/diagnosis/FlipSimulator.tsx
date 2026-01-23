"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FlipLogicCalculator, FlipInput } from "@/lib/calculators/flip-logic";

export const FlipSimulator = () => {
    const router = useRouter();
    const [input, setInput] = useState<FlipInput & { listingPrice: number }>({
        expectedResalePrice: 0,
        renovationCost: 0,
        listingPrice: 0, // 売出価格 (UI上の比較用)
        riskBufferRate: 0.1
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCalculate = async () => {
        if (input.expectedResalePrice <= 0 || input.listingPrice <= 0) {
            alert("想定再販価格と売出価格を入力してください。");
            return;
        }

        setIsSubmitting(true);
        // Simulate Calculation Delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        const result = FlipLogicCalculator.calculate(input);
        
        // Save result to localStorage for the result page
        if (typeof window !== "undefined") {
            localStorage.setItem("diagnosis_result", JSON.stringify({
                ...result,
                brand: 'flip',
                listingPrice: input.listingPrice
            }));
        }

        router.push("/diagnosis/result");
    };

    const updateInput = (key: keyof typeof input, value: number) => {
        setInput(prev => ({ ...prev, [key]: value }));
    };

    return (
        <div className="flex flex-col gap-8 animate-fade-in relative z-10">
            {/* Headline Section */}
            <div className="pt-2 pb-2">
                <div className="flex items-center gap-2 mb-1">
                    <div className="h-4 w-1 bg-[#00eeff]"></div>
                    <span className="text-[#00eeff] text-[10px] font-bold tracking-[0.2em] uppercase">Calculator Interface v2.0</span>
                </div>
                <h3 className="text-white tracking-tight text-xl font-bold leading-tight text-left">
                    収益性判定シミュレーション
                </h3>
            </div>

            <div className="space-y-6">
                {/* TextField 1: ARV */}
                <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-end">
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">01. Expected Resale Price</p>
                        <p className="text-[#00eeff] text-[10px] font-bold">ARV</p>
                    </div>
                    <div className="group block">
                        <p className="text-white/80 text-xs font-bold leading-normal pb-2 px-1">想定再販価格 (ARV)</p>
                        <div className="flex w-full items-stretch rounded-none border border-[#00eeff]/20 bg-[#161b22] focus-within:border-[#00eeff] transition-all duration-300">
                            <input
                                className="flex w-full min-w-0 flex-1 border-none bg-transparent h-14 text-white focus:ring-0 px-4 text-2xl font-mono"
                                placeholder="0"
                                type="number"
                                value={input.expectedResalePrice || ""}
                                onChange={(e) => updateInput('expectedResalePrice', parseInt(e.target.value) || 0)}
                            />
                            <div className="flex items-center pr-4 text-[#00eeff] font-bold text-xs">
                                万円
                            </div>
                        </div>
                    </div>
                </div>

                {/* TextField 2: Rehab Cost */}
                <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-end">
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">02. Renovation Costs</p>
                        <p className="text-[#00eeff] text-[10px] font-bold">ESTIMATE</p>
                    </div>
                    <div className="group block">
                        <p className="text-white/80 text-xs font-bold leading-normal pb-2 px-1">リフォーム費用</p>
                        <div className="flex w-full items-stretch rounded-none border border-[#00eeff]/20 bg-[#161b22] focus-within:border-[#00eeff] transition-all duration-300">
                            <input
                                className="flex w-full min-w-0 flex-1 border-none bg-transparent h-14 text-white focus:ring-0 px-4 text-2xl font-mono"
                                placeholder="0"
                                type="number"
                                value={input.renovationCost || ""}
                                onChange={(e) => updateInput('renovationCost', parseInt(e.target.value) || 0)}
                            />
                            <div className="flex items-center pr-4 text-[#00eeff] font-bold text-xs">
                                万円
                            </div>
                        </div>
                    </div>
                </div>

                {/* TextField 3: Listing Price */}
                <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-end">
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">03. Current Listing Price</p>
                        <p className="text-[#00eeff] text-[10px] font-bold">ASKING</p>
                    </div>
                    <div className="group block">
                        <p className="text-white/80 text-xs font-bold leading-normal pb-2 px-1">売出価格 (現在の提示価格)</p>
                        <div className="flex w-full items-stretch rounded-none border border-[#00eeff]/20 bg-[#161b22] focus-within:border-[#00eeff] transition-all duration-300">
                            <input
                                className="flex w-full min-w-0 flex-1 border-none bg-transparent h-14 text-white focus:ring-0 px-4 text-2xl font-mono"
                                placeholder="0"
                                type="number"
                                value={input.listingPrice || ""}
                                onChange={(e) => updateInput('listingPrice', parseInt(e.target.value) || 0)}
                            />
                            <div className="flex items-center pr-4 text-[#00eeff] font-bold text-xs">
                                万円
                            </div>
                        </div>
                    </div>
                </div>

                {/* Segmented Control: Risk Buffer */}
                <div className="flex flex-col gap-3">
                    <div className="flex justify-between items-end">
                        <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">04. Contingency Reserve</p>
                        <p className="text-[#00eeff] text-[10px] font-bold">BUFFER</p>
                    </div>
                    <p className="text-white/80 text-xs font-bold leading-normal pb-1 px-1">予備費率</p>
                    <div className="grid grid-cols-3 gap-2 p-1 bg-[#161b22] border border-[#00eeff]/10">
                        {[0.1, 0.15, 0.2].map((rate) => (
                            <button
                                key={rate}
                                onClick={() => updateInput('riskBufferRate', rate)}
                                className={`py-3 text-xs font-bold transition-all ${
                                    input.riskBufferRate === rate
                                        ? "bg-[#00eeff] text-black"
                                        : "text-white/50 hover:bg-white/5"
                                }`}
                            >
                                {rate * 100}%
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Bottom Button Area */}
            <div className="pt-10">
                <button
                    onClick={handleCalculate}
                    disabled={isSubmitting}
                    className={`group w-full bg-[#00eeff] py-5 text-black font-black text-sm tracking-[0.3em] uppercase transition-all flex items-center justify-center gap-3 active:scale-[0.98] ${
                        isSubmitting ? "opacity-50 cursor-not-allowed" : "shadow-[0_0_20px_rgba(0,238,255,0.3)] hover:shadow-[0_0_30px_rgba(0,238,255,0.5)]"
                    }`}
                >
                    {isSubmitting ? (
                        <span className="animate-pulse tracking-widest">ANALYZING...</span>
                    ) : (
                        <>
                            <span>判定を実行する</span>
                            <span className="material-symbols-outlined text-lg">analytics</span>
                        </>
                    )}
                </button>
                <p className="text-[10px] text-center mt-6 text-gray-500 font-mono tracking-[0.3em] opacity-50 uppercase">
                    Flip Logic Core v2.0 // Execution Ready
                </p>
            </div>
        </div>
    );
};
