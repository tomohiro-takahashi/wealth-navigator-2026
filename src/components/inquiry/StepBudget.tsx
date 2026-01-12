import { FormData } from "./types";
import { cn } from "@/lib/utils";

type StepProps = {
    data: FormData;
    updateFields: (fields: Partial<FormData>) => void;
};

const OPTIONS = [
    { value: "under_10m", label: "1,000万円未満" },
    { value: "10m_30m", label: "1,000万円 〜 3,000万円" },
    { value: "30m_50m", label: "3,000万円 〜 5,000万円" },
    { value: "50m_100m", label: "5,000万円 〜 1億円" },
    { value: "over_100m", label: "1億円以上" },
];

export function StepBudget({ data, updateFields }: StepProps) {
    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="text-center mb-8">
                <h3 className="text-xl font-display font-medium text-primary mb-2">Financial Budget</h3>
                <p className="text-sm text-gray-500">投資に充てられる自己資金の目安をお聞かせください。</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {OPTIONS.map((option) => (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => updateFields({ budget: option.value })}
                        className={cn(
                            "w-full py-4 px-6 text-left border rounded-md transition-all duration-200",
                            data.budget === option.value
                                ? "border-accent bg-accent/5 ring-1 ring-accent text-primary font-bold"
                                : "border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
                        )}
                    >
                        {option.label}
                    </button>
                ))}
            </div>

            <p className="text-xs text-center text-gray-400 mt-4 leading-relaxed">
                ※ 融資（ローン）を活用する場合、自己資金の3〜5倍程度の物件購入が一般的です。
            </p>
        </div>
    );
}
