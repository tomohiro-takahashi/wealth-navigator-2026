'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { ChevronRight, ChevronLeft, Check, Home, Building2, Calendar, HardHat, Users, MapPin } from 'lucide-react';
import { SubsidyDiagnosis, SubsidyInput } from '@/lib/calculators/diagnosis-logic';

const STEPS = [
    { id: 'prefecture', title: 'お住まいの地域', icon: MapPin },
    { id: 'buildingType', title: '住宅の種類', icon: Home },
    { id: 'buildingAge', title: '築年数', icon: Calendar },
    { id: 'renovationItems', title: 'リフォームの内容', icon: HardHat },
    { id: 'householdType', title: '世帯の状況', icon: Users },
];

const PREFECTURES = [
    '東京都', '神奈川県', '埼玉県', '千葉県', '大阪府', '兵庫県', '京都府', '愛知県', '福岡県', 'その他'
];

export default function SubsidySimulator() {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [input, setInput] = useState<SubsidyInput>({
        prefecture: '東京都',
        buildingType: '戸建て',
        buildingAge: '20〜30年',
        renovationItems: [],
        householdType: 'いずれも該当しない',
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
        const result = SubsidyDiagnosis.diagnose(input);
        localStorage.setItem("diagnosis_result", JSON.stringify({
            ...result,
            brand: 'subsidy'
        }));
        router.push("/diagnosis/result");
    };

    const togglePart = (part: string) => {
        setInput(prev => ({
            ...prev,
            renovationItems: prev.renovationItems.includes(part)
                ? prev.renovationItems.filter(p => p !== part)
                : [...prev.renovationItems, part]
        }));
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
                                '10年未満', '10〜20年', '20〜30年', '30〜40年', '40年以上'
                            ].map(age => (
                                <button
                                    key={age}
                                    onClick={() => { setInput({ ...input, buildingAge: age as any }); handleNext(); }}
                                    className={`p-6 rounded-2xl border-2 transition-all text-left flex justify-between items-center ${
                                        input.buildingAge === age
                                            ? 'border-[var(--color-accent)] bg-[var(--color-border)] text-[var(--color-primary)]'
                                            : 'border-[var(--color-border)] bg-white text-[var(--color-text-main)] hover:border-[var(--color-accent)]'
                                    }`}
                                >
                                    <span className="text-lg font-bold">{age}</span>
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
                                    { id: '窓の断熱', label: '窓・断熱・防音', sub: '内窓設置、ガラス交換など' },
                                    { id: '浴室', label: 'お風呂（浴室）', sub: '高断熱浴槽、浴室乾燥機など' },
                                    { id: 'キッチン', label: 'キッチン', sub: '対面化、掃除しやすいレンジフードなど' },
                                    { id: 'トイレ', label: 'トイレ', sub: '節水型トイレへの交換' },
                                    { id: '給湯器', label: '給湯器・エコキュート', sub: '高効率給湯器への交換' },
                                    { id: 'バリアフリー', label: 'バリアフリー', sub: '手すり設置、段差解消など' },
                                    { id: 'その他', label: 'その他', sub: '外壁・屋根、防犯など' },
                                ].map(item => {
                                    const isSelected = input.renovationItems.includes(item.id);
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => togglePart(item.id)}
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
                            <p className="text-sm text-[var(--color-text-sub)] mb-4">※世帯の状況を選択してください</p>
                            <div className="grid grid-cols-1 gap-3">
                                {[
                                    { id: '18歳未満の子どもがいる', label: '子育て世帯', sub: '18歳未満のお子様がいる世帯' },
                                    { id: '夫婦どちらかが39歳以下', label: '若者夫婦世帯', sub: 'ご夫婦のいずれかが39歳以下の世帯' },
                                    { id: '要介護・要支援の方がいる', label: '高齢者・介護世帯', sub: '60歳以上の方、または要介護・要支援認定者がいる世帯' },
                                    { id: 'いずれも該当しない', label: '特になし', sub: '上記に当てはまらない場合' },
                                ].map(item => {
                                    const isSelected = input.householdType === item.id;
                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() => { setInput({ ...input, householdType: item.id }); handleNext(); }}
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
                    disabled={currentStep === 3 && input.renovationItems.length === 0}
                    className={`flex-[2] py-5 rounded-full text-white font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
                        currentStep === 3 && input.renovationItems.length === 0
                        ? 'bg-gray-300 cursor-not-allowed shadow-none'
                        : 'bg-gradient-to-r from-[var(--color-accent)] to-[var(--color-primary)] hover:scale-[1.02] active:scale-95'
                    }`}
                >
                    {currentStep === STEPS.length - 1 ? '診断結果を見る' : '次へ進む'}
                    <ChevronRight size={20} />
                </button>
            </div>
        </div>
    );
}
