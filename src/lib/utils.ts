import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { SiteConfig } from "@/types/site";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function getCategoryLabelSync(category: string, config: SiteConfig): string {
    const found = config.categoryNav.find(c => c.id === category);
    return found ? found.label : category;
}
