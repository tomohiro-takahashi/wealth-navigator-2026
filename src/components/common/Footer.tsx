export const Footer = () => {
    return (
        <footer className="bg-primary text-white pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                    <div className="col-span-1 md:col-span-2">
                        <h2 className="font-display text-2xl mb-4">WEALTH NAVIGATOR</h2>
                        <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                            本当の豊かさを追求する投資家のためのインテリジェンス・メディア。
                            厳選された国内・海外の不動産情報と、資産防衛のための専門的な知見をお届けします。
                        </p>
                    </div>
                    <div>
                        <h3 className="font-serif text-accent mb-4">CONTENTS</h3>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li><a href="/articles" className="hover:text-white transition-colors">新着記事</a></li>
                            <li><a href="/properties" className="hover:text-white transition-colors">厳選物件</a></li>
                            <li><a href="/columns" className="hover:text-white transition-colors">専門家コラム</a></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-serif text-accent mb-4">LEGAL</h3>
                        <ul className="space-y-2 text-sm text-gray-300">
                            <li><a href="/privacy" className="hover:text-white transition-colors">プライバシーポリシー</a></li>
                            <li><a href="/terms" className="hover:text-white transition-colors">利用規約</a></li>
                            <li><a href="/company" className="hover:text-white transition-colors">運営会社</a></li>
                        </ul>
                    </div>
                </div>
                {/* Disclaimer */}
                <div className="border-t border-gray-800 mt-12 pt-8 text-center">
                    <p className="text-muted text-[10px] leading-relaxed mb-4 max-w-2xl mx-auto">
                        【免責事項】<br />
                        本サイトの運営者は、宅地建物取引業法に基づく『媒介』行為は行っておりません。<br />
                        お客様のニーズに基づき、提携する専門業者への紹介サービスです。
                    </p>
                    <p className="text-muted text-xs font-serif">&copy; 2024 Wealth Navigator. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    );
}
