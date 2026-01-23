'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ChevronRight, ChevronLeft, Check, Home, Building2, Calendar, HardHat, Users, MapPin } from 'lucide-react';
import { SubsidyCalculator, SubsidyInput, SubsidyRenovationPart } from '@/lib/calculators/subsidy-logic';

const STEPS = [
    { id: 'prefecture', title: 'お住まいの地域', icon: MapPin },
    { id: 'buildingType', title: '住宅の種類', icon: Home },
    { id: 'buildingAge', title: '築年数', icon: Calendar },
    { id: 'renovationParts', title: 'リフォームの内容', icon: HardHat },
    { id: 'householdStatus', title: '世帯の状況', icon: Users },
];

const PREFECTURES = [
    '東京都', '神奈川県', '埼玉県', '千葉県', '大阪府', '兵庫県', '京都府', '愛知県', '福岡県', 'その他'
];

export default function SubsidySimulator() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [input, setInput] = useState<SubsidyInput>({
        prefecture: '東京都',
        buildingType: 'house',
        buildingAge: 'mid',
        renovationParts: [],
        householdStatus: ['none'],
    });

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleCalculate();
        }
    };

    const handleBack = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleCalculate = () => {
        const result = SubsidyCalculator.calculate(input);
        localStorage.setItem("subsidy_result", JSON.stringify(result));
        router.push("/diagnosis/result");
    };

    const togglePart = (part: SubsidyRenovationPart) => {
        setInput(prev => ({
            ...prev,
            renovationParts: prev.renovationParts.includes(part)
                ? prev.renovationParts.filter(p => p !== part)
                : [...prev.renovationParts, part]
        }));
    };

    const toggleStatus = (status: 'child' | 'elderly' | 'none') => {
        if (status === 'none') {
            setInput(prev => ({ ...prev, householdStatus: ['none'] }));
            return;
        }
        setInput(prev => {
            const next = prev.householdStatus.filter(s => s !== 'none');
            return {
                ...prev,
                householdStatus: next.includes(status)
                    ? next.filter(s => s !== status)
                    : [...next, status]
            };
        });
    };

    return (
        <div className="max-w-2xl mx-auto px-4 py-8">
            {/* Progress Bar */}
            <div className="mb-12">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-medium text-[var(--color-primary)]">
                        ステップ {currentStep + 1} / {STEPS.length}
                    </span>
                    <span className="text-sm font-bold text-[var(--color-text-main)]">
                        {STEPS[currentStep].title}
                    </span>
                </div>
                <div className="h-2 bg-[var(--color-border)] rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-primary)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="min-h-[400px]"
                >
                    {currentStep === 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {PREFECTURES.map(pref => (
                                <button
                                    key={pref}
                                    onClick={() => { setInput({ ...input, prefecture: pref }); handleNext(); }}
                                    className={`p-4 rounded-2xl border-2 transition-all text-center font-medium ${
                                        input.prefecture === pref
                                            ? 'border-[var(--color-accent)] bg-[var(--color-border)] text-[var(--color-primary)]'
                                            : 'border-[var(--color-border)] bg-white text-[var(--color-text-main)] hover:border-[var(--color-accent)]'
                                    }`}
                                >
                                    {pref}
                                </button>
                            ))}
                        </div>
                    )}

                    {currentStep === 1 && (
                        <div className="grid grid-cols-2 gap-4">
                            {[
                                { id: 'house', label: '戸建て', icon: Home },
                                { id: 'apartment', label: 'マンション', icon: Building2 },
                            ].map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => { setInput({ ...input, buildingType: item.id as any }); handleNext(); }}
                                    className={`p-8 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-4 ${
                                        input.buildingType === item.id
                                            ? 'border-[var(--color-accent)] bg-[var(--color-border)] text-[var(--color-primary)]'
                                            : 'border-[var(--color-border)] bg-white text-[var(--color-text-main)] hover:border-[var(--color-accent)]'
                                    }`}
                                >
                                    <item.icon size={48} />
                                    <span className="text-lg font-bold">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    {currentStep === 2 && (
                        <div className="flex flex-col gap-3">
                            {[
                                { id: 'new', label: '10年以内' },
                                { id: 'mid', label: '11年 〜 20年' },
                                { id: 'old', label: '21年以上' },
                            ].map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => { setInput({ ...input, buildingAge: item.id as any }); handleNext(); }}
                                    className={`p-6 rounded-2xl border-2 transition-all text-left flex justify-between items-center ${
                                        input.buildingAge === item.id
                                            ? 'border-[var(--color-accent)] bg-[var(--color-border)] text-[var(--color-primary)]'
                                            : 'border-[var(--color-border)] bg-white text-[var(--color-text-main)] hover:border-[var(--color-accent)]'
                                    }`}
                                >
                                    <span className="text-lg font-bold">{item.label}</span>
                                    <ChevronRight />
                                </button>
                            ))}
                        </div>
                    )}

                    {currentStep === 3 && (
                        <div className="space-y-4">
                            <p className="text-sm text-[var(--color-text-sub)] mb-4">※2026年度の補助金対象箇所を選択してください（複数選択可）</p>
                            <div className="grid grid-cols-1 gap-3">
                                {[
                                    { id: 'window', label: '窓・断熱・防音', sub: '内窓設置、ガラス交換など' },
                                    { id: 'bath', label: 'お風呂（浴室）', sub: '高断熱浴槽、浴室乾燥機など' },
                                    { id: 'kitchen', label: 'キッチン', sub: '対面化、掃除しやすいレンジフードなど' },
                                    { id: 'heater', label: '給湯器・エコキュート', sub: '高効率給湯器への交換' },
                                    { id: 'other', label: 'その他', sub: 'バリアフリー、防犯など' },
                                ].map(item => {
                                    const isSelected = input.renovationParts.includes(item.id as any);
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => togglePart(item.id as any)}
                                            className={`p-5 rounded-2xl border-2 transition-all text-left flex items-start gap-4 ${
                                                isSelected
                                                    ? 'border-[var(--color-accent)] bg-[var(--color-border)]'
                                                    : 'border-[var(--color-border)] bg-white'
                                            }`}
                                        >
                                            <div className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                                isSelected ? 'bg-[var(--color-primary)] border-[var(--color-primary)]' : 'border-[#DDD]'
                                            }`}>
                                                {isSelected && <Check size={16} className="text-white" />}
                                            </div>
                                            <div>
                                                <div className="font-bold text-[var(--color-text-main)]">{item.label}</div>
                                                <div className="text-xs text-[var(--color-text-sub)] mt-1">{item.sub}</div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {currentStep === 4 && (
                        <div className="space-y-4">
                            <p className="text-sm text-[var(--color-text-sub)] mb-4">※複数選択可能です</p>
                            <div className="grid grid-cols-1 gap-3">
                                {[
                                    { id: 'child', label: '子育て世帯', sub: '18歳未満のお子様がいる世帯' },
                                    { id: 'elderly', label: '高齢者等と同居', sub: '60歳以上の方、または障がいをお持ちの方' },
                                    { id: 'none', label: '特になし', sub: '上記に当てはまらない場合' },
                                ].map(item => {
                                    const isSelected = input.householdStatus.includes(item.id as any);
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => toggleStatus(item.id as any)}
                                            className={`p-5 rounded-2xl border-2 transition-all text-left flex items-start gap-4 ${
                                                isSelected
                                                    ? 'border-[var(--color-accent)] bg-[var(--color-border)]'
                                                    : 'border-[var(--color-border)] bg-white'
                                            }`}
                                        >
                                            <div className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                                                isSelected ? 'bg-[var(--color-primary)] border-[var(--color-primary)]' : 'border-[#DDD]'
                                            }`}>
                                                {isSelected && <Check size={16} className="text-white" />}
                                            </div>
                                            <div>
                                                <div className="font-bold text-[var(--color-text-main)]">{item.label}</div>
                                                <div className="text-xs text-[var(--color-text-sub)] mt-1">{item.sub}</div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Navigation Buttons */}
            <div className="mt-12 flex gap-4">
                {currentStep > 0 && (
                    <button
                        onClick={handleBack}
                        className="flex-1 py-5 rounded-full border-2 border-[var(--color-border)] text-[var(--color-text-main)] font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
                    >
                        <ChevronLeft size={20} />
                        戻る
                    </button>
                )}
                <button
                    onClick={handleNext}
                    disabled={currentStep === 3 && input.renovationParts.length === 0}
                    className={`flex-[2] py-5 rounded-full text-white font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                        currentStep === 3 && input.renovationParts.length === 0
                        ? 'bg-gray-300 cursor-not-allowed shadow-none'
                        : 'bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-primary)] hover:scale-[1.02] active:scale-95'
                    }`}
                >
                    {currentStep === STEPS.length - 1 ? '2026年度版 診断結果を見る' : '次へ進む'}
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
}
