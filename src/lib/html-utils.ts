import matter from 'gray-matter';
import { marked } from 'marked';

export type TOCItem = {
    id: string;
    text: string;
    level: number;
};

export const processArticleContent = async (rawContent: string): Promise<{ html: string; toc: TOCItem[] }> => {
    // 1. Strip Frontmatter & Cleanup
    // Remove BOM and normalize line endings
    let markdown = rawContent.replace(/^\uFEFF/, '')
        .replace(/^---[\s\S]+?---\n?/, '')
        .trim();

    // 2. Convert to HTML with explicit GFM
    const htmlContent = await marked.parse(markdown, { gfm: true });

    // 3. Inject TOC IDs & Extract TOC
    const { html: htmlWithIds, toc } = injectTOCIds(htmlContent);

    return { html: htmlWithIds, toc };
};

export const injectTOCIds = (html: string): { html: string; toc: TOCItem[] } => {
    const toc: TOCItem[] = [];
    // Include H1, H2, H3
    const newHtml = html.replace(/<h([1-3])\b([^>]*)>([\s\S]*?)<\/h\1>/gi, (match, levelStr, attrs, content) => {
        const level = parseInt(levelStr);
        const cleanContent = content.replace(/<[^>]+>/g, "").trim();
        const id = `heading-${toc.length}`;
        toc.push({ id, text: cleanContent, level });
        return `<h${level} id="${id}"${attrs}>${content}</h${level}>`;
    });
    return { html: newHtml, toc };
};

export const extractTOC = (html: string): TOCItem[] => {
    const { toc } = injectTOCIds(html);
    return toc;
};
