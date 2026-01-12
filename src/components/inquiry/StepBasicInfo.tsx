import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormData } from "./types";

type StepProps = {
    data: FormData;
    updateFields: (fields: Partial<FormData>) => void;
};

export function StepBasicInfo({ data, updateFields }: StepProps) {
    return (
        <div className="space-y-6 animate-fade-in-up">
            <div className="text-center mb-8">
                <h3 className="text-xl font-display font-medium text-primary mb-2">Basic Information</h3>
                <p className="text-sm text-gray-500">お客様の基本情報をお聞かせください。</p>
            </div>

            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">お名前 <span className="text-red-500">*</span></Label>
                    <Input
                        id="name"
                        required
                        value={data.name}
                        onChange={(e) => updateFields({ name: e.target.value })}
                        placeholder="山田 太郎"
                        className="bg-white"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">メールアドレス <span className="text-red-500">*</span></Label>
                    <Input
                        id="email"
                        required
                        type="email"
                        value={data.email}
                        onChange={(e) => updateFields({ email: e.target.value })}
                        placeholder="taro.yamada@example.com"
                        className="bg-white"
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="phone">お電話番号</Label>
                    <Input
                        id="phone"
                        type="tel"
                        value={data.phone}
                        onChange={(e) => updateFields({ phone: e.target.value })}
                        placeholder="090-1234-5678"
                        className="bg-white"
                    />
                </div>
            </div>
        </div>
    );
}
