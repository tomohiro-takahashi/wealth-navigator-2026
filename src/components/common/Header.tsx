"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { useMenu } from '@/context/MenuContext';

export const Header = () => {
    const { isMenuOpen, toggleMenu } = useMenu();

    // Prevent scrolling when menu is open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isMenuOpen]);

    const menuItems: { label: string; href: string; external?: boolean }[] = [
        { label: 'HOME', href: '/' },
        { label: '国内不動産コラム', href: '/articles?category=domestic' },
        { label: '海外不動産コラム', href: '/articles?category=overseas' },
        { label: '資産運用コラム', href: '/columns' },
    ];

    return (
        <>
            <header className="fixed top-0 w-full z-40 bg-primary/95 backdrop-blur-sm text-white shadow-md">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center">
                        {/* Hamburger Menu Button (Mobile Only) */}
                        <button
                            onClick={toggleMenu}
                            className="md:hidden mr-4 p-1 hover:bg-white/10 rounded-md transition-colors"
                            aria-label="Menu"
                        >
                            <Menu size={24} />
                        </button>

                        <Link href="/" className="font-display text-2xl tracking-wider hover:text-accent transition-colors">
                            WEALTH NAVIGATOR
                        </Link>
                    </div>

                    {/* Desktop Navigation */}
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

                    {/* Desktop Contact Button */}
                    <div className="hidden md:flex items-center space-x-4">
                        <Link
                            href="/contact"
                            className="px-4 py-2 border border-accent text-accent text-xs tracking-widest hover:bg-accent hover:text-white transition-all duration-300"
                        >
                            CONTACT
                        </Link>
                    </div>
                </div>
            </header>

            {/* Mobile Drawer Menu (Modal Overlay) */}
            {isMenuOpen && (
                <div className="fixed inset-0 z-[100]">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                        onClick={toggleMenu}
                    />

                    {/* Drawer Panel */}
                    <div className="absolute left-0 top-0 w-80 h-fit bg-[#1a1a1a] shadow-2xl flex flex-col rounded-br-xl overflow-hidden pb-6 transform transition-transform duration-300 ease-in-out">
                        {/* Drawer Header */}
                        <div className="flex items-center justify-between px-6 h-16 border-b border-white/10 bg-[#1a1a1a]">
                            <span className="font-display text-lg tracking-wider text-white">MENU</span>
                            <button
                                onClick={toggleMenu}
                                className="p-1 text-white hover:bg-white/10 rounded-md transition-colors"
                                aria-label="Close Menu"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Drawer Links */}
                        <nav className="flex-grow flex flex-col p-6 space-y-4 bg-[#1a1a1a]">
                            {menuItems.map((item) => (
                                <Link
                                    key={item.label}
                                    href={item.href}
                                    className="text-base font-medium text-white/90 hover:text-accent border-b border-white/5 pb-3 transition-colors"
                                    onClick={toggleMenu}
                                    target={item.external ? "_blank" : undefined}
                                    rel={item.external ? "noopener noreferrer" : undefined}
                                >
                                    {item.label}
                                </Link>
                            ))}
                        </nav>

                        {/* Bottom CTA Area */}
                        <div className="px-6 pt-2 bg-[#1a1a1a] flex flex-col gap-4">
                            {/* LINE Button (Sub Action) */}
                            <a
                                href="https://line.me/R/ti/p/@wealth-navigator"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full py-3 border border-[#c59f59] text-[#c59f59] text-sm text-center font-bold tracking-widest rounded transition-colors hover:bg-[#c59f59] hover:text-white"
                                onClick={toggleMenu}
                            >
                                無料相談 (LINE)
                            </a>

                            {/* Diagnosis Button (Main Action) */}
                            <a
                                href="/diagnosis"
                                className="block w-full py-3 bg-[#c59f59] text-white text-sm text-center font-bold tracking-widest rounded shadow-md hover:bg-[#b08d4b] transition-all"
                                onClick={toggleMenu}
                            >
                                資産ポートフォリオを診断する
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
