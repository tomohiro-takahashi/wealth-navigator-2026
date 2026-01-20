"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

type MenuContextType = {
    isMenuOpen: boolean;
    toggleMenu: () => void;
    closeMenu: () => void;
    openMenu: () => void;
};

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export const MenuProvider = ({ children }: { children: ReactNode }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => setIsMenuOpen((prev) => !prev);
    const closeMenu = () => setIsMenuOpen(false);
    const openMenu = () => setIsMenuOpen(true);

    return (
        <MenuContext.Provider value={{ isMenuOpen, toggleMenu, closeMenu, openMenu }}>
            {children}
        </MenuContext.Provider>
    );
};

export const useMenu = () => {
    const context = useContext(MenuContext);
    if (context === undefined) {
        throw new Error('useMenu must be used within a MenuProvider');
    }
    return context;
};
