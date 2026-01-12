import { FormData } from "./types";
import { cn } from "@/lib/utils";

type StepProps = {
    data: FormData;
    updateFields: (fields: Partial<FormData>) => void;
};

const OPTIONS = [
    { value: "domestic", label: "国内不動産", desc: "安定収益・節税" },
    { value: "overseas", label: "海外不動産", desc: "キャピタルゲイン・分散投資" },
    { value: "tax_saving", label: "節税対策", desc: "法人税・所得税の圧縮" },
    { value: "both", label: "総合相談", desc: "ポートフォリオ構築" },
];

export function StepPurpose({ data, updateFields }: StepProps) {
    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="text-center mb-8">
                <h3 className="text-xl font-display font-medium text-primary mb-2">Investment Purpose</h3>
                <p className="text-sm text-gray-500">もっとも近い投資目的をお選びください。</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {OPTIONS.map((option) => (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => updateFields({ interestArea: option.value })}
                        className={cn(
                            "group relative p-6 text-left border rounded-lg transition-all duration-300 hover:shadow-md",
                            data.interestArea === option.value
                                ? "border-accent bg-accent/5 ring-1 ring-accent"
                                : "border-gray-200 bg-white hover:border-gray-300"
                        )}
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <div className={cn(
                                    "font-bold text-lg mb-1 transition-colors",
                                    data.interestArea === option.value ? "text-primary" : "text-gray-700"
                                )}>
                                    {option.label}
                                </div>
                                <div className="text-xs text-gray-500 font-serif">
                                    {option.desc}
                                </div>
                            </div>
                            <div className={cn(
                                "w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
                                data.interestArea === option.value
                                    ? "border-accent bg-accent text-white"
                                    : "border-gray-300 group-hover:border-gray-400"
                            )}>
                                {data.interestArea === option.value && (
                                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </div>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
