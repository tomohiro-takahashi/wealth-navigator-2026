const { Marked } = require('marked');
const fs = require('fs');
const matter = require('gray-matter');

const content = fs.readFileSync('content/articles/2026-01-23-70-percent-rule.md', 'utf8');
const { content: markdown } = matter(content);

const marked = new Marked();
const html = marked.parse(markdown.trim());

console.log('--- HTML OUTPUT ---');
if (typeof html === 'string') {
    console.log(html.substring(0, 500));
} else {
    html.then(h => console.log(h.substring(0, 500)));
}
