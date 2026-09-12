const http = require('http');

async function testUrls() {
  const pages = ['http://localhost:4321/', 'http://localhost:4321/team', 'http://localhost:4321/publications'];
  for (const page of pages) {
    console.log('\n=== Testing page:', page);
    const res = await fetch(page);
    console.log('Page status:', res.status);
    const html = await res.text();
    const imgMatches = [...html.matchAll(/<img[^>]+src=["']([^"']+)["']/g)].map(m => m[1]);
    console.log('Found images:', imgMatches.length);
    for (const src of imgMatches) {
      const fullUrl = src.startsWith('http') ? src : new URL(src, page).href;
      try {
        const imgRes = await fetch(fullUrl);
        if (imgRes.status !== 200) {
          console.error('  [FAIL]', imgRes.status, src);
        } else {
          console.log('  [OK]', imgRes.status, src);
        }
      } catch (e) {
        console.error('  [ERR]', e.message, src);
      }
    }
  }
}

testUrls().catch(console.error);
