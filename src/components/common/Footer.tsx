import Link from 'next/link';
import { SiteConfig } from '@/types/site';

export const Footer = ({ config }: { config: SiteConfig }) => {
    return (
        <footer className="bg-primary text-white pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                    <div className="col-span-1 md:col-span-2">
                        <h2 className="font-display text-2xl mb-4 text-white">{config.name}</h2>
                        <p className="text-white/70 text-sm leading-relaxed max-w-sm">
                            {config.description}
                        </p>
                    </div>
                    <div>
                        <h3 className="font-serif text-white mb-4">CONTENTS</h3>
                        <ul className="space-y-2 text-sm text-white/80">
                            <li><Link href="/articles" className="hover:text-white transition-colors">新着記事</Link></li>
                            <li><Link href="/properties" className="hover:text-white transition-colors">厳選物件</Link></li>
                            <li><Link href="/columns" className="hover:text-white transition-colors">専門家コラム</Link></li>
                        </ul>
                    </div>
                    <div>
                        <h3 className="font-serif text-white mb-4">LEGAL</h3>
                        <ul className="space-y-2 text-sm text-white/80">
                            <li><Link href="/privacy" className="hover:text-white transition-colors">プライバシーポリシー</Link></li>
                            <li><Link href="/terms" className="hover:text-white transition-colors">利用規約</Link></li>
                            <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
                        </ul>
                    </div>
                </div>
                {/* Copyright only */}
                <div className="border-t border-white/10 mt-12 pt-8 text-center">
                    <p className="text-white/50 text-xs font-serif">&copy; {new Date().getFullYear()} {config.name}. All Rights Reserved.</p>
                </div>
            </div>
        </footer>
    );
}
