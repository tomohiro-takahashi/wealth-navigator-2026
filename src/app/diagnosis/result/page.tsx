import { DiagnosisResult } from "@/components/diagnosis/DiagnosisResult";
import { FlipResult } from "@/components/diagnosis/FlipResult";
import SubsidyResult from "@/components/diagnosis/SubsidyResult";
import { KominkaResult } from "@/components/diagnosis/KominkaResult";
import { LegacyResult } from "@/components/diagnosis/LegacyResult";
import { getBrandId } from "@/lib/brand";

export default async function ResultPage() {
    const brandId = await getBrandId();
    const isFlip = brandId === 'flip';
    const isSubsidy = brandId === 'subsidy';
    const isKominka = brandId === 'kominka';
    const isLegacy = brandId === 'legacy';

    return (
        <div className={`min-h-screen transition-colors duration-500 bg-[var(--color-background)]`}>
            {isFlip ? (
                <FlipResult />
            ) : isSubsidy ? (
                <SubsidyResult />
            ) : isKominka ? (
                <KominkaResult />
            ) : isLegacy ? (
                <LegacyResult />
            ) : (
                <DiagnosisResult />
            )}
            
            {/* Background decorations */}
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
