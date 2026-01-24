"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChoiceDiagnosis, ChoiceInput } from "@/lib/calculators/diagnosis-logic";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

const QUESTIONS = [
    {
        id: 'q1',
        text: '実家に、今後ご自身やご家族が住む可能性はありますか？',
        options: ['ある', 'ないと思う', '分からない']
    },
    {
        id: 'q2',
        text: '実家の維持管理（掃除・換気・草刈り等）を続けることは可能ですか？',
        options: ['できる', '難しい', '誰かに頼めばできる']
    },
    {
        id: 'q3',
        text: 'まとまった資金（介護費用・老後資金等）が必要な状況ですか？',
        options: ['はい', 'いいえ', '近い将来必要になりそう']
    },
    {
        id: 'q4',
        text: '実家のある地域に、賃貸の需要はありそうですか？',
        options: ['ありそう', 'なさそう', '分からない']
    },
    {
        id: 'q5',
        text: '相続人（兄弟姉妹等）は何人いますか？',
        options: ['自分だけ', '2人', '3人以上']
    },
    {
        id: 'q6',
        text: '実家を手放すことへの心理的な抵抗は？',
        options: ['抵抗がある', '整理がついている', 'どちらとも言えない']
    },
    {
        id: 'q7',
        text: '実家の築年数は？',
        options: ['20年未満', '20〜40年', '40年以上']
    },
    {
        id: 'q8',
        text: '実家に帰省する頻度は？',
        options: ['年に数回以上', 'ほとんどない']
    },
    {
        id: 'q9',
        text: '将来、お子さんやお孫さんが使う可能性は？',
        options: ['あるかもしれない', 'ないと思う', '分からない']
    },
    {
        id: 'q10',
        text: '今の気持ちに最も近いものは？',
        options: ['早く決着をつけたい', 'じっくり考えたい', '何から始めればいいか分からない']
    }
];

export const LegacySimulator = () => {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [answers, setAnswers] = useState<ChoiceInput>({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleOptionSelect = (option: string) => {
        const questionId = QUESTIONS[currentStep].id;
        const newAnswers = { ...answers, [questionId]: option };
        setAnswers(newAnswers);

        if (currentStep < QUESTIONS.length - 1) {
            setTimeout(() => setCurrentStep(prev => prev + 1), 300);
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) setCurrentStep(prev => prev - 1);
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        // Simulate Calculation Delay
        await new Promise(resolve => setTimeout(resolve, 1500));

        const result = ChoiceDiagnosis.diagnose(answers);
        
        if (typeof window !== "undefined") {
            localStorage.setItem("diagnosis_result", JSON.stringify({
                ...result,
                brand: 'legacy'
            }));
        }

        router.push("/diagnosis/result");
    };

    const progress = ((currentStep + 1) / QUESTIONS.length) * 100;
    const currentQuestion = QUESTIONS[currentStep];
    const isLastStep = currentStep === QUESTIONS.length - 1;
    const isAnswered = !!answers[currentQuestion.id as LegacyQuestionId];

    return (
        <div className="flex flex-col gap-8 animate-fade-in relative z-10 font-sans max-w-md mx-auto">
            {/* ProgressBar Area */}
            <div className="px-2 py-4">
                <div className="flex justify-between items-end mb-2">
                    <p className="text-[#a68a68] text-xs font-bold uppercase tracking-widest">Progress</p>
                    <p className="text-[#e5e5e5] text-sm font-medium">{currentStep + 1} / {QUESTIONS.length}</p>
                </div>
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full bg-[#a68a68] rounded-full"
                    ></motion.div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="bg-[#242424] rounded-xl p-6 border border-white/5 shadow-2xl min-h-[400px] flex flex-col"
                >
                    <div className="flex items-start gap-3 mb-6">
                        <span className="text-[#a68a68] font-bold text-xl mt-0.5">Q{currentStep + 1}.</span>
                        <h3 className="text-[#e5e5e5] text-lg font-bold leading-tight">
                            {currentQuestion.text}
                        </h3>
                    </div>

                    <div className="flex flex-col gap-4 flex-1">
                        {currentQuestion.options.map((option) => (
                            <label
                                key={option}
                                onClick={() => handleOptionSelect(option)}
                                className={`flex items-center justify-between gap-4 rounded-xl border p-5 cursor-pointer transition-all active:scale-[0.98] ${
                                    answers[currentQuestion.id] === option
                                        ? 'border-[#a68a68] bg-[#a68a68]/10'
                                        : 'border-white/10 hover:bg-white/5'
                                }`}
                            >
                                <span className={`text-[#e5e5e5] text-base font-medium ${answers[currentQuestion.id] === option ? 'text-white' : ''}`}>
                                    {option}
                                </span>
                                <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                    answers[currentQuestion.id] === option
                                        ? 'border-[#a68a68] bg-[#a68a68]'
                                        : 'border-white/20'
                                }`}>
                                    {answers[currentQuestion.id] === option && <Check size={14} className="text-white" />}
                                </div>
                            </label>
                        ))}
                    </div>

                    <div className="flex justify-between items-center mt-8 pt-4 border-t border-white/5">
                        <button
                            onClick={handlePrev}
                            disabled={currentStep === 0}
                            className={`flex items-center gap-1 text-sm font-bold uppercase tracking-widest ${currentStep === 0 ? 'opacity-0' : 'text-white/40 hover:text-white'}`}
                        >
                            <ChevronLeft size={18} /> Prev
                        </button>
                        
                        {isLastStep && isAnswered && (
                            <button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className={`bg-[#a68a68] text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-xl transition-all active:scale-95 ${isSubmitting ? 'opacity-50' : ''}`}
                            >
                                {isSubmitting ? '解析中...' : '診断結果を見る'}
                                <ChevronRight size={18} />
                            </button>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Bottom Info */}
            <div className="text-center">
                <p className="text-white/30 text-[10px] uppercase tracking-[0.2em]">
                    Heritage Strategy Diagnostic v1.2
                </p>
            </div>
        </div>
    );
};
