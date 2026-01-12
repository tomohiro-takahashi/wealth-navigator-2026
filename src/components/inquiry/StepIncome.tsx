import { FormData } from "./types";
import { cn } from "@/lib/utils";

type StepProps = {
    data: FormData;
    updateFields: (fields: Partial<FormData>) => void;
};

const OPTIONS = [
    { value: "under_10m", label: "1,000万円未満" },
    { value: "10m_15m", label: "1,000万円 〜 1,500万円" },
    { value: "15m_20m", label: "1,500万円 〜 2,000万円" },
    { value: "20m_30m", label: "2,000万円 〜 3,000万円" },
    { value: "over_30m", label: "3,000万円以上" },
];

export function StepIncome({ data, updateFields }: StepProps) {
    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="text-center mb-8">
                <h3 className="text-xl font-display font-medium text-primary mb-2">Annual Income</h3>
                <p className="text-sm text-gray-500">昨年のご年収（税込）を教えてください。</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {OPTIONS.map((option) => (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => updateFields({ annualIncome: option.value })}
                        className={cn(
                            "w-full py-4 px-6 text-left border rounded-md transition-all duration-200",
                            data.annualIncome === option.value
                                ? "border-accent bg-accent/5 ring-1 ring-accent text-primary font-bold"
                                : "border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
                        )}
                    >
                        {option.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
