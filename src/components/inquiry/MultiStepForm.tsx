"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { StepBasicInfo } from "./StepBasicInfo";
import { StepAssetProfile } from "./StepAssetProfile";
import { StepMessage } from "./StepMessage";
import { FormData, INITIAL_DATA } from "./types";

export function MultiStepForm() {
    const [data, setData] = useState(INITIAL_DATA);
    const [currentStep, setCurrentStep] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // フィールド更新
    const updateFields = (fields: Partial<FormData>) => {
        setData((prev) => ({ ...prev, ...fields }));
    };

    // ステップ管理
    const steps = [
        <StepBasicInfo key="step1" data={data} updateFields={updateFields} />,
        <StepAssetProfile key="step2" data={data} updateFields={updateFields} />,
        <StepMessage key="step3" data={data} updateFields={updateFields} />,
    ];

    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep((prev) => prev + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep((prev) => prev - 1);
        }
    };

    // 送信処理
    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (currentStep !== steps.length - 1) return nextStep();

        setIsSubmitting(true);
        try {
            // API Routeへ送信
            const response = await fetch("/api/contact", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                setIsSuccess(true);
            } else {
                alert("送信に失敗しました。もう一度お試しください。");
            }
        } catch (error) {
            console.error(error);
            alert("エラーが発生しました。");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="text-center py-20 animate-fade-in-up">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                </div>
                <h2 className="text-3xl font-display font-medium text-primary mb-4">Thank You</h2>
                <p className="text-gray-600 mb-8">
                    お問い合わせありがとうございます。<br />
                    担当コンサルタントより、24時間以内にご連絡いたします。
                </p>
                <Button onClick={() => window.location.href = "/"} className="btn-primary">
                    トップページへ戻る
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-xl mx-auto bg-gray-50/50 p-8 rounded-lg border border-gray-100 shadow-sm relative overflow-hidden">
            {/* Step Indicator */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gray-200">
                <div
                    className="h-full bg-accent transition-all duration-500 ease-out"
                    style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                />
            </div>

            <div className="mb-8 pt-4 flex justify-between items-center text-xs font-bold text-muted-foreground tracking-widest uppercase">
                <span>Step {currentStep + 1} of {steps.length}</span>
                <span>{currentStep === 0 ? "Basic Info" : currentStep === 1 ? "Profile" : "Details"}</span>
            </div>

            <form onSubmit={onSubmit}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ x: 10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -10, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        {steps[currentStep]}
                    </motion.div>
                </AnimatePresence>

                <div className="mt-10 flex justify-between">
                    {currentStep > 0 ? (
                        <Button type="button" variant="outline" onClick={prevStep}>
                            Back
                        </Button>
                    ) : (
                        <div></div> // Spacer
                    )}

                    <Button
                        type="submit"
                        className="btn-primary min-w-[120px]"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? "Sending..." : currentStep === steps.length - 1 ? "Submit" : "Next"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
