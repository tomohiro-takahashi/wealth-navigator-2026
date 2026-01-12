import { MultiStepForm } from "@/components/inquiry/MultiStepForm";
import { Metadata } from "next";


export const runtime = "edge";
export const metadata: Metadata = {
    title: "Contact | Wealth Navigator",
    description: "お問い合わせ・個別相談のお申し込み",
};

export default function InquiryPage() {
    return (
        <div className="min-h-screen pt-20 pb-20 bg-white">
            <div className="container mx-auto px-4">
                {/* Header Section */}
                <div className="text-center mb-16 max-w-2xl mx-auto">
                    <span className="text-accent text-sm tracking-widest font-bold block mb-3 animate-fade-in-up">INQUIRY</span>
                    <h1 className="text-3xl md:text-5xl font-display font-bold text-primary mb-6 animate-fade-in-up delay-100">
                        無料個別相談・お問い合わせ
                    </h1>
                    <p className="text-gray-500 font-serif leading-relaxed animate-fade-in-up delay-200">
                        あなたの資産形成に関するご質問やご相談を承ります。<br />
                        経験豊富なコンサルタントが、最適な解決策をご提案いたします。
                    </p>
                </div>

                {/* Multi-step Form */}
                <MultiStepForm />
            </div>
        </div>
    );
}
