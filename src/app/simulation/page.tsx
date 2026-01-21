import { MultiStepForm } from "@/components/inquiry/MultiStepForm";

export default function SimulationPage() {
    return (
        <div className="min-h-screen bg-[#1A1A1B] flex flex-col justify-center py-20 px-4">
            <div className="text-center mb-10">
                <span className="text-accent text-xs font-bold tracking-[0.2em] uppercase">Private Consultation</span>
                <h1 className="text-2xl md:text-3xl font-serif text-white font-bold mt-2">資産診断・機会損失チェック</h1>
                <p className="text-gray-400 text-sm mt-4 leading-relaxed">
                    年収1,000万円以上のあなたが、ただ貯金しているだけで<br />
                    「毎月いくら損しているか」知っていますか？<br />
                    たった1分で、あなたの「資産の適正戦略」を判定します。
                </p>
            </div>
            <MultiStepForm />
        </div>
    );
}
