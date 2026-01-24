const { marked } = require('marked');

const processArticleContent = (rawContent) => {
    let markdown = rawContent.replace(/^\uFEFF/, '')
        .replace(/^---[\s\S]+?---\n?/, '')
        .trim();
    
    console.log('--- DEBUG: Markdown after strip ---');
    console.log(markdown.substring(0, 100));
    console.log('---');
    
    const htmlContent = marked.parse(markdown, { gfm: true });
    return htmlContent;
};

const testContent = `
# Title
Body content here.
<p>HTML content too.</p>
`;

const result = processArticleContent(testContent);
console.log('--- Result HTML ---');
console.log(result);
