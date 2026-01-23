import { MultiStepForm } from "@/components/inquiry/MultiStepForm";
import { FlipSimulator } from "@/components/diagnosis/FlipSimulator";
import { getBrandId } from "@/lib/brand";

export default async function SimulationPage() {
    const brandId = await getBrandId();
    const isFlip = brandId === 'flip';

    return (
        <div className={`min-h-screen flex flex-col justify-center py-20 px-4 transition-colors duration-500 ${isFlip ? 'bg-[#0B0E14]' : 'bg-[#1A1A1B]'}`}>
            <div className="text-center mb-10 max-w-[480px] mx-auto">
                {isFlip ? (
                    <>
                        <span className="text-[#00eeff] text-[10px] font-bold tracking-[0.3em] uppercase opacity-60">PRO Analysis Engine</span>
                        <h1 className="text-3xl font-black italic text-white mt-2 tracking-tighter uppercase">Flip Profitability</h1>
                    </>
                ) : (
                    <>
                        <span className="text-accent text-xs font-bold tracking-[0.2em] uppercase">Private Consultation</span>
                        <h1 className="text-2xl md:text-3xl font-serif text-white font-bold mt-2">資産診断・機会損失チェック</h1>
                    </>
                )}
                
                <p className="text-gray-400 text-sm mt-6 leading-relaxed">
                    {isFlip ? (
                        <>感情を排除せよ。数字だけが真実だ。<br />30秒で物件の「真の価値」を算出し、投資判定を下す。</>
                    ) : (
                        <>年収1,000万円以上のあなたが、ただ貯金しているだけで<br />「毎月いくら損しているか」知っていますか？<br />たった1分で、あなたの「資産の適正戦略」を判定します。</>
                    )}
                </p>
            </div>
            
            <div className="max-w-[480px] mx-auto w-full">
                {isFlip ? <FlipSimulator /> : <MultiStepForm />}
            </div>

            {/* Flip specific background overlay */}
            {isFlip && (
                <div className="fixed inset-0 pointer-events-none opacity-5 overflow-hidden -z-10">
                    <div className="absolute top-20 -right-20 w-80 h-80 rounded-full bg-[#00eeff] blur-[100px]"></div>
                    <div className="absolute bottom-40 -left-20 w-60 h-60 rounded-full bg-[#00eeff] blur-[80px]"></div>
                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(0, 238, 255, 0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                </div>
            )}
        </div>
    );
}
