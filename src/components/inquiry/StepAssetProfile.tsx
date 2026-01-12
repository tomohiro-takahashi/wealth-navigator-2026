import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select-native";
import { FormData } from "./types";

type StepProps = {
    data: FormData;
    updateFields: (fields: Partial<FormData>) => void;
};

export function StepAssetProfile({ data, updateFields }: StepProps) {
    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="text-center mb-8">
                <h3 className="text-xl font-display font-medium text-primary mb-2">Asset Profile</h3>
                <p className="text-sm text-gray-500">最適なご提案のため、差し支えない範囲でご教示ください。</p>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="annualIncome">ご年収（税込）</Label>
                    <Select
                        id="annualIncome"
                        value={data.annualIncome}
                        onChange={(e) => updateFields({ annualIncome: e.target.value })}
                        className="bg-white"
                    >
                        <option value="">選択してください</option>
                        <option value="under_10m">1,000万円未満</option>
                        <option value="10m_15m">1,000万円 〜 1,500万円</option>
                        <option value="15m_20m">1,500万円 〜 2,000万円</option>
                        <option value="20m_30m">2,000万円 〜 3,000万円</option>
                        <option value="over_30m">3,000万円以上</option>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="budget">投資可能額（自己資金）</Label>
                    <Select
                        id="budget"
                        value={data.budget}
                        onChange={(e) => updateFields({ budget: e.target.value })}
                        className="bg-white"
                    >
                        <option value="">選択してください</option>
                        <option value="under_10m">1,000万円未満</option>
                        <option value="10m_30m">1,000万円 〜 3,000万円</option>
                        <option value="30m_50m">3,000万円 〜 5,000万円</option>
                        <option value="50m_100m">5,000万円 〜 1億円</option>
                        <option value="over_100m">1億円以上</option>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                        ※ 融資活用をご希望の場合、自己資金の3〜5倍程度の物件検討が可能です。
                    </p>
                </div>
            </div>
        </div>
    );
}
