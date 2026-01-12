import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function getCategoryLabel(category: string): string {
    switch (category) {
        case 'domestic':
            return '国内不動産';
        case 'overseas':
            return '海外不動産';
        case 'column':
            return '資産コラム';
        default:
            return category;
    }
}
