/**
 * Generates public/sitemap.xml by pulling every active product and category
 * from the live API. Run this at deploy time (see package.json script),
 * AFTER the backend is up and reachable, and BEFORE `ng build`.
 *
 * Usage:
 *   API_URL=https://api.electromart.com/api SITE_URL=https://www.electromart.com node scripts/generate-sitemap.mjs
 */

const API_URL = process.env['API_URL'] || 'http://localhost:8080/api';
const SITE_URL = process.env['SITE_URL'] || 'https://www.electromart.com';
const OUTPUT_PATH = new URL('../public/sitemap.xml', import.meta.url);

async function fetchAllProducts() {
  const products = [];
  let page = 0;
  const size = 100;

  while (true) {
    const res = await fetch(`${API_URL}/products?page=${page}&size=${size}`);
    if (!res.ok) throw new Error(`Failed to fetch products page ${page}: ${res.status}`);
    const body = await res.json();
    products.push(...body.data.content);
    if (body.data.last) break;
    page++;
  }

  return products;
}

async function fetchAllCategories() {
  const res = await fetch(`${API_URL}/categories`);
  if (!res.ok) throw new Error(`Failed to fetch categories: ${res.status}`);
  const body = await res.json();

  // Flatten top-level + subcategories into one list
  const flat = [];
  for (const cat of body.data) {
    flat.push(cat);
    if (cat.subCategories?.length) flat.push(...cat.subCategories);
  }
  return flat;
}

function urlEntry(loc, changefreq, priority) {
  return `  <url>\n    <loc>${loc}</loc>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`;
}

async function main() {
  console.log(`Generating sitemap from ${API_URL} ...`);

  const staticUrls = [
    urlEntry(`${SITE_URL}/`, 'daily', '1.0'),
    urlEntry(`${SITE_URL}/products`, 'daily', '0.9'),
    urlEntry(`${SITE_URL}/about`, 'monthly', '0.4'),
    urlEntry(`${SITE_URL}/contact`, 'monthly', '0.4'),
    urlEntry(`${SITE_URL}/faq`, 'monthly', '0.4'),
  ];

  const [products, categories] = await Promise.all([fetchAllProducts(), fetchAllCategories()]);

  const categoryUrls = categories.map(c => urlEntry(`${SITE_URL}/category/${c.slug}`, 'weekly', '0.8'));
  const productUrls = products.map(p => urlEntry(`${SITE_URL}/product/${p.slug}`, 'weekly', '0.7'));

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[
    ...staticUrls,
    ...categoryUrls,
    ...productUrls,
  ].join('\n')}\n</urlset>\n`;

  const fs = await import('node:fs/promises');
  await fs.writeFile(OUTPUT_PATH, xml, 'utf-8');

  console.log(`Sitemap written: ${categoryUrls.length} categories, ${productUrls.length} products.`);
}

main().catch(err => {
  console.error('Sitemap generation failed:', err);
  process.exit(1);
});
