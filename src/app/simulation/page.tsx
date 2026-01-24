import { MultiStepForm } from "@/components/inquiry/MultiStepForm";
import { FlipSimulator } from "@/components/diagnosis/FlipSimulator";
import SubsidySimulator from "@/components/diagnosis/SubsidySimulator";
import { KominkaSimulator } from "@/components/diagnosis/KominkaSimulator";
import { LegacySimulator } from "@/components/diagnosis/LegacySimulator";
import { getBrandId } from "@/lib/brand";

export default async function SimulationPage() {
    const brandId = await getBrandId();
    const isFlip = brandId === 'flip';
    const isSubsidy = brandId === 'subsidy';
    const isKominka = brandId === 'kominka';
    const isLegacy = brandId === 'legacy';

    return (
        <div className={`min-h-screen flex flex-col justify-center py-20 px-6 transition-colors duration-500 bg-[var(--color-background)]`}>
            <div className="text-center mb-10 max-w-[480px] mx-auto">
                {isFlip ? (
                    <>
                        <span className="text-[#00eeff] text-[10px] font-bold tracking-[0.3em] uppercase opacity-60">PRO Analysis Engine</span>
                        <h1 className="text-3xl font-black italic text-white mt-2 tracking-tighter uppercase">Flip Profitability</h1>
                    </>
                ) : isSubsidy ? (
                    <>
                        <span className="text-[var(--color-primary)] text-xs font-bold tracking-[0.2em] uppercase">補助金かんたん診断</span>
                        <h1 className="text-2xl md:text-3xl font-black text-[var(--color-text-main)] mt-2">住宅リフォーム補助金<br />最大受給額チェック</h1>
                    </>
                ) : isKominka ? (
                    <>
                        <span className="text-[#977e4e] text-xs font-bold tracking-[0.2em] uppercase">利回りシミュレーション</span>
                        <h1 className="text-2xl md:text-3xl font-serif text-white font-bold mt-2">空き家再生・不動産収益判定</h1>
                    </>
                ) : isLegacy ? (
                    <>
                        <span className="text-[#a68a68] text-xs font-bold tracking-[0.2em] uppercase">戦略診断</span>
                        <h1 className="text-2xl md:text-3xl font-bold text-white mt-2">親の家、どうする？<br/>実家・相続戦略診断</h1>
                    </>
                ) : (
                    <>
                        <span className="text-accent text-xs font-bold tracking-[0.2em] uppercase">Private Consultation</span>
                        <h1 className="text-2xl md:text-3xl font-serif text-white font-bold mt-2">資産診断・機会損失チェック</h1>
                    </>
                )}
                
                <p className={`text-sm mt-6 leading-relaxed ${isSubsidy ? 'text-[var(--color-text-sub)]' : 'text-gray-400'}`}>
                    {isFlip ? (
                        <>感情を排除せよ。数字だけが真実だ。<br />30秒で物件の「真の価値」を算出し、投資判定を下す。</>
                    ) : isSubsidy ? (
                        <>わずか30秒の入力で、あなたの家で使える<br />補助金の概算をシミュレーションします。</>
                    ) : isKominka ? (
                        <>物件のポテンシャルを10秒で可視化。<br />「負債」を「年利15%の資産」に変える第一歩。</>
                    ) : isLegacy ? (
                        <>10の質問で、ご家族の想いと現状を整理。<br />「売却」「賃貸」「維持」どれが正解かを判定します。</>
                    ) : (
                        <>年収1,000万円以上のあなたが、ただ貯金しているだけで<br />「毎月いくら損しているか」知っていますか？<br />たった1分で、あなたの「資産の適正戦略」を判定します。</>
                    )}
                </p>
            </div>
            
            <div className="max-w-[480px] mx-auto w-full">
                {isFlip ? (
                    <FlipSimulator />
                ) : isSubsidy ? (
                    <SubsidySimulator />
                ) : isKominka ? (
                    <KominkaSimulator />
                ) : isLegacy ? (
                    <LegacySimulator />
                ) : (
                    <MultiStepForm />
                )}
            </div>

            {/* Brand-specific background decoration */}
            {isFlip && (
                <div className="fixed inset-0 pointer-events-none opacity-5 overflow-hidden -z-10">
                    <div className="absolute top-20 -right-20 w-80 h-80 rounded-full bg-[#00eeff] blur-[100px]"></div>
                    <div className="absolute bottom-40 -left-20 w-60 h-60 rounded-full bg-[#00eeff] blur-[80px]"></div>
                    <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(rgba(0, 238, 255, 0.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                </div>
            )}
            {isSubsidy && (
                <div className="fixed inset-0 pointer-events-none opacity-5 overflow-hidden -z-10">
                    <div className="absolute top-20 -right-20 w-80 h-80 rounded-full bg-[var(--color-accent)] blur-[100px]"></div>
                    <div className="absolute bottom-40 -left-20 w-60 h-60 rounded-full bg-[var(--color-primary)] blur-[80px]"></div>
                </div>
            )}
        </div>
    );
}
