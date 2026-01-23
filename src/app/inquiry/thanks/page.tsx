import { InquiryThanks } from "@/components/inquiry/InquiryThanks";
import { getBrandId } from "@/lib/brand";

export default async function ThanksPage() {
    const brandId = await getBrandId();
    const isFlip = brandId === 'flip';

    return (
        <div className={`min-h-screen pt-20 pb-20 transition-colors duration-500 ${isFlip ? 'bg-[#0B0E14]' : 'bg-[var(--color-background)]'}`}>
            <InquiryThanks brandId={brandId} />
            
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
