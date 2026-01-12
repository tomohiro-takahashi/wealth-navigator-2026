import Link from 'next/link';

export const Header = () => {
    return (
        <header className="fixed top-0 w-full z-50 bg-primary/95 backdrop-blur-sm text-white shadow-md">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="font-display text-2xl tracking-wider hover:text-accent transition-colors">
                    WEALTH NAVIGATOR
                </Link>
                <nav className="hidden md:flex space-x-8">
                    <Link href="/articles" className="text-sm tracking-widest hover:text-accent transition-colors">
                        ARTICLES
                    </Link>
                    <Link href="/properties" className="text-sm tracking-widest hover:text-accent transition-colors">
                        PROPERTIES
                    </Link>
                    <Link href="/about" className="text-sm tracking-widest hover:text-accent transition-colors">
                        ABOUT
                    </Link>
                </nav>
                <div className="flex items-center space-x-4">
                    <Link
                        href="/contact"
                        className="hidden md:block px-4 py-2 border border-accent text-accent text-xs tracking-widest hover:bg-accent hover:text-white transition-all duration-300"
                    >
                        CONTACT
                    </Link>
                </div>
            </div>
        </header>
    );
};
