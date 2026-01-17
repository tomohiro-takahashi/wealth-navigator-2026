"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

// Types
export type DiagnosisData = {
    age: string;
    income: number;
    occupation: string;
    savings: string;
    objective: string;
    experience: string;
    analysisId?: string;
};

const generateId = () => Math.random().toString(36).substr(2, 9).toUpperCase();

export const MultiStepForm = () => {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<DiagnosisData>({
        age: "",
        income: 0,
        occupation: "",
        savings: "",
        objective: "",
        experience: "",
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Constants
    const TOTAL_STEPS = 6;
    const LEVERAGE_MULTIPLIER = 8; // 年収の8倍を想定

    // Handlers
    const handleNext = () => setStep((prev) => Math.min(prev + 1, TOTAL_STEPS + 1));
    const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));

    const updateData = (key: keyof DiagnosisData, value: string | number) => {
        setFormData((prev) => ({ ...prev, [key]: value }));
    };

    const handleComplete = async () => {
        setIsSubmitting(true);
        // Simulate API/Calculation delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Generate ID
        const finalData = {
            ...formData,
            analysisId: generateId()
        };

        // Save to localStorage for the result page to read
        if (typeof window !== "undefined") {
            localStorage.setItem("diagnosis_result", JSON.stringify(finalData));
        }

        router.push("/diagnosis/result");
    };

    // Render Logic
    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <SelectionStep
                        question="現在の年齢をお聞かせください"
                        options={["30代", "40代", "50代以上"]}
                        selected={formData.age}
                        onSelect={(val) => { updateData("age", val); handleNext(); }}
                    />
                );
            case 2:
                return (
                    <IncomeStep
                        value={formData.income}
                        onChange={(val) => updateData("income", val)}
                        onNext={handleNext}
                        leverageMultiplier={LEVERAGE_MULTIPLIER}
                    />
                );
            case 3:
                return (
                    <SelectionStep
                        question="ご職業について"
                        options={["上場企業・公務員・医師", "経営者・役員", "専門職（弁護士・会計士等）", "その他"]}
                        selected={formData.occupation}
                        onSelect={(val) => { updateData("occupation", val); handleNext(); }}
                    />
                );
            case 4:
                return (
                    <SelectionStep
                        question="自己資金（現金・有価証券）"
                        options={["500万円未満", "500万〜2,000万円", "2,000万〜5,000万円", "5,000万〜1億円", "1億円以上"]}
                        selected={formData.savings}
                        onSelect={(val) => { updateData("savings", val); handleNext(); }}
                    />
                );
            case 5:
                return (
                    <SelectionStep
                        question="不動産投資の主目的"
                        options={["安定したインカムゲイン", "最大限のキャピタルゲイン", "税制対策・相続対策"]}
                        selected={formData.objective}
                        onSelect={(val) => { updateData("objective", val); handleNext(); }}
                    />
                );
            case 6:
                return (
                    <SelectionStep
                        question="不動産投資のご経験"
                        options={["未経験", "国内不動産のみ所有", "海外不動産のみ所有", "国内外ともに所有"]}
                        selected={formData.experience}
                        onSelect={(val) => { updateData("experience", val); handleComplete(); }} // Last step triggers completion
                    />
                );
            default:
                return null;
        }
    };

    if (isSubmitting) {
        return (
            <div className="flex flex-col items-center justify-center h-full min-h-[500px] text-white">
                <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mb-8"></div>
                <h2 className="text-2xl font-serif font-bold animate-pulse">戦略レポートを生成中...</h2>
                <p className="text-gray-400 mt-4 text-sm tracking-widest">AI & CONSULTANT LOGIC</p>
            </div>
        )
    }

    return (
        <div className="w-full max-w-lg mx-auto bg-[#1f1f20] rounded-2xl shadow-2xl overflow-hidden border border-white/10 min-h-[600px] flex flex-col relative">
            {/* Progress Bar */}
            <div className="absolute top-0 left-0 w-full h-1 bg-white/10">
                <motion.div
                    className="h-full bg-accent"
                    initial={{ width: 0 }}
                    animate={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
                    transition={{ duration: 0.3 }}
                />
            </div>

            {/* Header */}
            <div className="p-6 flex justify-between items-center border-b border-white/5">
                {step > 1 ? (
                    <button onClick={handleBack} className="text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                ) : <div className="w-5" />}

                <span className="text-xs font-bold tracking-[0.2em] text-accent uppercase">
                    Step {step} of {TOTAL_STEPS}
                </span>

                <div className="w-5" /> {/* Spacer */}
            </div>

            {/* Step Content */}
            <div className="flex-1 p-8 flex flex-col justify-center">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="w-full"
                    >
                        {renderStep()}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
};

// Sub-components

const SelectionStep = ({ question, options, selected, onSelect }: { question: string, options: string[], selected: string, onSelect: (val: string) => void }) => (
    <div className="space-y-8">
        <h3 className="text-2xl md:text-3xl font-serif font-bold text-white text-center leading-relaxed">
            {question}
        </h3>
        <div className="space-y-4">
            {options.map((opt) => (
                <button
                    key={opt}
                    onClick={() => onSelect(opt)}
                    className={`w-full p-5 text-left rounded-xl border transition-all duration-200 flex justify-between items-center group ${selected === opt
                        ? "bg-accent text-primary border-accent shadow-lg shadow-accent/20"
                        : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:border-white/30"
                        }`}
                >
                    <span className="text-lg font-medium tracking-wide">{opt}</span>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selected === opt ? "border-primary" : "border-gray-500"
                        }`}>
                        {selected === opt && <div className="w-2 h-2 rounded-full bg-primary" />}
                    </div>
                </button>
            ))}
        </div>
    </div>
);

const IncomeStep = ({ value, onChange, onNext, leverageMultiplier }: { value: number, onChange: (val: number) => void, onNext: () => void, leverageMultiplier: number }) => {
    // 0以外の時に値を表示するため、初期表示は空にしたいが、input type=numberなので制御が必要
    // ここではシンプルに数値入力を扱う
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value.replace(/[^0-9]/g, "")) || 0;
        onChange(val);
    };

    // High-End Logic: 年収2,000万以上なら9.5倍、それ以外は7.5倍（属性ランク判定）
    const multiplier = value >= 20000000 ? 9.5 : 7.5;
    const estimatedBorrowing = (value * multiplier) / 10000; // 万円単位

    return (
        <div className="space-y-10">
            <h3 className="text-2xl md:text-3xl font-serif font-bold text-white text-center leading-relaxed">
                現在の年収（額面）を<br />ご入力ください
            </h3>

            <div className="relative">
                <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={value > 0 ? value.toLocaleString() : ""}
                    onChange={handleChange}
                    placeholder="15,000,000"
                    className="w-full bg-transparent border-b-2 border-white/20 text-4xl text-center text-white font-display py-4 focus:outline-none focus:border-accent transition-colors placeholder:text-white/10"
                />
                <span className="absolute right-0 bottom-4 text-gray-500 text-lg">円</span>
            </div>

            {/* Real-time Leverage Calc */}
            <AnimatePresence>
                {value > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/5 rounded-lg p-6 text-center border border-white/10"
                    >
                        <p className="text-gray-400 text-xs tracking-widest uppercase mb-2">想定借入可能額（レバレッジ）</p>
                        <p className="text-3xl font-display font-bold text-accent">
                            <span className="text-sm text-gray-500 mr-2">約</span>
                            {estimatedBorrowing.toLocaleString()}
                            <span className="text-lg ml-1">万円</span>
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>

            <button
                onClick={onNext}
                disabled={value === 0}
                className="w-full bg-accent hover:bg-accent-dark text-white font-bold py-4 rounded-full shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
                次へ進む <ArrowRight size={18} />
            </button>
        </div>
    );
}
