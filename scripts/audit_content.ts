import { createClient } from 'microcms-js-sdk';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const client = createClient({
    serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN || '',
    apiKey: process.env.MICROCMS_API_KEY || '',
});

async function main() {
    console.log('--- MICROCMS CONTENT AUDIT ---');

    // Fetch all articles
    const { contents } = await client.getList({
        endpoint: 'articles',
        queries: { limit: 100 }
    });

    console.log(`Fetched ${contents.length} articles.`);

    const report = contents.map((article: any) => {
        const hasMetaTitle = !!article.meta_title;
        const hasMetaDesc = !!article.meta_description;
        const hasKeywords = !!article.keywords;

        // Meta Status
        let metaStatus = 'NG';
        if (hasMetaTitle && hasMetaDesc && hasKeywords) {
            metaStatus = 'OK';
        } else if (hasMetaTitle || hasMetaDesc || hasKeywords) {
            metaStatus = 'Partial';
        }

        return {
            slug: article.slug,
            'Meta': metaStatus,
            'Meta(T/D/K)': `${hasMetaTitle ? 'T' : '-'}/${hasMetaDesc ? 'D' : '-'}/${hasKeywords ? 'K' : '-'}`,
            'CTA': article.cta_mode ? article.cta_mode : 'NG',
            'Yield': article.target_yield ? article.target_yield : 'NG',
        };
    });

    // console.table(report);

    console.log('Slug | Meta | CTA | Yield');
    console.log('-'.repeat(50));
    report.forEach(r => {
        console.log(`${r.slug.padEnd(25)} | ${r.Meta.padEnd(7)} | ${String(r.CTA).padEnd(10)} | ${r.Yield}`);
    });

    if (contents.length > 0) {
        const target = contents.find((c: any) => c.slug === 'time-leverage');
        if (target) {
            console.log('\n[TARGET ARTICLE]');
            console.log('Title:', target.title);
            console.log('Slug:', target.slug);
        }

        console.log('\n[DEBUG KEY TYPES]');
        console.log('cta_mode type:', typeof contents[0].cta_mode, 'value:', contents[0].cta_mode);
        console.log('target_yield type:', typeof contents[0].target_yield, 'value:', contents[0].target_yield);
    }
    console.log('\n--- SCHEMA DETECTION ---');
    if (contents.length > 0) {
        const sample = contents[0];
        console.log('Sample Keys:', Object.keys(sample).join(', '));

        console.log('\n[Meta Fields Check]');
        console.log(`meta_title: ${sample.meta_title !== undefined ? 'Exists' : 'Missing'}`);
        console.log(`meta_description: ${sample.meta_description !== undefined ? 'Exists' : 'Missing'}`);
        console.log(`keywords: ${sample.keywords !== undefined ? 'Exists' : 'Missing'}`);
    }
}

main();
