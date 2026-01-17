export const Philosophy = () => {
    return (
        <section className="py-24 bg-[#F8F9FA] relative flex flex-col items-center justify-center text-center overflow-hidden">
            {/* Subtle Background Pattern or Decoration could go here */}

            <p className="text-accent text-xs tracking-[0.3em] font-bold mb-12 uppercase">
                Our Philosophy
            </p>

            <div className="relative w-full max-w-2xl mx-auto h-[400px] flex justify-center items-center">
                {/* Vertical Text Layout */}
                <div className="writing-vertical-rl text-primary font-serif text-3xl md:text-4xl leading-loose tracking-widest h-full flex flex-col justify-center items-center gap-8">
                    <p className="mb-4">未来への意志だ。</p>
                    <p className="mb-4">それは、</p>
                    <p className="mb-4">ただの数字ではない。</p>
                    <p>富とは、</p>
                </div>
            </div>

            <div className="mt-12 text-gray-600 font-serif text-sm md:text-base leading-loose max-w-lg mx-auto">
                <p>
                    私たちは、不動産を通じて<br />
                    お客様の人生における「豊かさ」の<br />
                    新しい形を提案します。
                </p>
            </div>

            <div className="mt-16">
                <span className="font-display font-bold text-xl tracking-widest text-primary">
                    WEALTH NAVIGATOR
                </span>
            </div>
        </section>
    );
};
