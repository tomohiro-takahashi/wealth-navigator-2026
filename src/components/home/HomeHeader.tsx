"use client";

import React from 'react';
import { useMenu } from '@/context/MenuContext';

export const HomeHeader = () => {
    const { toggleMenu } = useMenu();

    return (
        <div className="sticky top-0 z-50 flex h-16 w-full items-center justify-between bg-[#161410]/95 px-5 border-b border-white/5 backdrop-blur-sm">
            <button
                onClick={toggleMenu}
                className="flex h-12 w-12 items-center justify-center rounded-full text-[#c59f59] transition-colors hover:text-white active:bg-white/5"
                aria-label="Menu"
            >
                <span className="material-symbols-outlined text-[32px]">menu</span>
            </button>
            <h1 className="flex-1 text-center text-lg font-bold tracking-wide text-white/90">
                Wealth Navigator
            </h1>
            {/* Placeholder to balance the centered logo, same width as menu button */}
            <div className="w-12 h-12"></div>
        </div>
    );
};
