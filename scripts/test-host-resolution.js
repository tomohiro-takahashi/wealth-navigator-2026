
import { getBrandIdFromHost } from '../src/lib/brand-utils.ts';

const testHosts = [
    'wealth-navigator.com',
    'www.wealth-navigator.com',
    'flip-logic.jp',
    'www.flip-logic.jp',
    'subsidy-nav.jp',
    'kominka.jp',
    'legacy-guard.jp',
    'localhost:3000',
    'wealth-navigator-2026.vercel.app',
    'some-random-domain.com'
];

console.log('--- Testing Host Resolution ---');
testHosts.forEach(host => {
    const brandId = getBrandIdFromHost(host);
    console.log(`${host.padEnd(35)} -> ${brandId}`);
});
