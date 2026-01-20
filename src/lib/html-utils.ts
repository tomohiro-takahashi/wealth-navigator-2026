
import matter from 'gray-matter';
import { marked } from 'marked';

export type TOCItem = {
    id: string;
    text: string;
    level: number;
};

export const processArticleContent = async (rawContent: string): Promise<{ html: string; toc: TOCItem[] }> => {
    // 1. Strip Frontmatter (Robustly)
    // gray-matter parses YAML frontmatter and returns content without it.
    const { content: markdown } = matter(rawContent);

    // 2. Convert to HTML
    // Heuristic: If content starts with an HTML tag, assume it's pre-rendered HTML and skip marked.
    // This prevents double-encoding or escaping of valid HTML (like <figure>) by the markdown parser.
    const isHtml = /^\s*<[a-z][\s\S]*>/i.test(markdown.trim());

    let htmlContent = '';
    if (isHtml) {
        htmlContent = markdown;
    } else {
        htmlContent = await marked.parse(markdown);
    }

    // 3. Inject TOC IDs & Extract TOC
    // We do this on the HTML string
    // injectTOCIds is defined below, due to hosting let's define it before or just ensure it's available.
    // In TS/JS module scope, functions defined with const are not hoisted, but this is inside an async function calling an outer export.
    const { html: htmlWithIds, toc } = injectTOCIds(htmlContent);

    // 4. (Removed) Image Placeholders are now embedded in the content itself during generation.

    return { html: htmlWithIds, toc };
};

export const injectTOCIds = (html: string): { html: string; toc: TOCItem[] } => {
    const toc: TOCItem[] = [];
    const newHtml = html.replace(/<h([2-3])([^>]*)>(.*?)<\/h\1>/gi, (match, levelStr, attrs, content) => {
        const level = parseInt(levelStr);
        const cleanContent = content.replace(/<[^>]+>/g, "");
        const id = `heading-${toc.length}`;
        toc.push({ id, text: cleanContent, level });
        // Keep existing attributes but add id
        return `<h${level} id="${id}"${attrs}>${content}</h${level}>`;
    });
    return { html: newHtml, toc };
};

export const extractTOC = (html: string): TOCItem[] => {
    const regex = /<h([2-3])([^>]*)>(.*?)<\/h\1>/gi;
    const items: TOCItem[] = [];
    let match;

    while ((match = regex.exec(html)) !== null) {
        const level = parseInt(match[1]);
        // const _attrs = match[2]; // Unused
        const content = match[3].replace(/<[^>]+>/g, ""); // Remove inner tags

        // Extract ID if exists, otherwise generate one (but we need to inject it back to HTML if missing)
        // For simplicity, we assume we might need to inject IDs or they exist.
        // If not, we just use index or simple slug.
        // Actually, for scrolling to work, the HTML content needs IDs.
        // So this utility should probably return transformed HTML and TOC.
        // But modifying HTML string is cleaner.

        // Let's assume we won't modify HTML for now and just use text matching or assume IDs are not there.
        // To make TOC work, we NEED IDs on H2/H3.
        // Simple approach: Replace H tags with ID-injected tags.
        const id = `toc-${items.length}`;
        items.push({ id, text: content, level });
    }
    return items;
};
