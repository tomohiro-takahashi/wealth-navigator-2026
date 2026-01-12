import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select-native";
import { Textarea } from "@/components/ui/textarea";
import { FormData } from "./types";

type StepProps = {
    data: FormData;
    updateFields: (fields: Partial<FormData>) => void;
};

export function StepMessage({ data, updateFields }: StepProps) {
    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="text-center mb-8">
                <h3 className="text-xl font-display font-medium text-primary mb-2">Details</h3>
                <p className="text-sm text-gray-500">ご興味のある分野や、具体的なご質問をご記入ください。</p>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="interestArea">ご興味のあるエリア</Label>
                    <Select
                        id="interestArea"
                        value={data.interestArea}
                        onChange={(e) => updateFields({ interestArea: e.target.value })}
                        className="bg-white"
                    >
                        <option value="domestic">国内不動産</option>
                        <option value="overseas">海外不動産（フィリピン・英国・ドバイ等）</option>
                        <option value="tax_saving">節税対策</option>
                        <option value="both">国内・海外両方</option>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="message">お問い合わせ内容・ご質問</Label>
                    <Textarea
                        id="message"
                        value={data.message}
                        onChange={(e) => updateFields({ message: e.target.value })}
                        placeholder="例：マニラのプレビルド物件に興味があります。シミュレーションをお願いしたいです。"
                        className="bg-white"
                    />
                </div>
            </div>
        </div>
    );
}
