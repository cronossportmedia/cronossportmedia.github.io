/**
 * scripts/generate-sitemap.js
 * Genera sitemap.xml incluyendo eventos activos desde Firestore.
 *
 * Uso: node scripts/generate-sitemap.js
 * Requiere: npm install firebase (ejecutar desde la raiz del repo)
 *
 * Ejecutar manualmente antes de cada release significativa.
 */

import fs from 'node:fs';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyACGQlXKkdJsvsuIn77ZQ06SghlTvUTDLI',
  authDomain: 'cronossportmedia-e07ef.firebaseapp.com',
  projectId: 'cronossportmedia-e07ef',
  storageBucket: 'cronossportmedia-e07ef.firebasestorage.app',
  messagingSenderId: '898405181430',
  appId: '1:898405181430:web:12ad5dc59fa049c26609d7'
};

initializeApp(firebaseConfig);
const db = getFirestore();

const today = new Date().toISOString().slice(0, 10);

const STATIC_URLS = [
  { loc: 'https://cronoplay.com/', priority: 1.0, changefreq: 'weekly' },
  { loc: 'https://cronoplay.com/en-vivo.html', priority: 0.9, changefreq: 'daily' },
  { loc: 'https://cronoplay.com/noticias.html', priority: 0.9, changefreq: 'daily' },
  { loc: 'https://cronoplay.com/podcast.html', priority: 0.8, changefreq: 'weekly' },
  { loc: 'https://cronoplay.com/eventos.html', priority: 0.8, changefreq: 'weekly' },
  { loc: 'https://cronoplay.com/noticia.html', priority: 0.7, changefreq: 'daily' },
  { loc: 'https://cronoplay.com/evento.html', priority: 0.7, changefreq: 'daily' },
  { loc: 'https://cronoplay.com/nosotros.html', priority: 0.5, changefreq: 'monthly' },
  { loc: 'https://cronoplay.com/contacto.html', priority: 0.5, changefreq: 'monthly' },
];

async function main() {
  const snap = await getDocs(
    query(collection(db, 'events'), where('active', '==', true))
  );

  const eventUrls = [];
  snap.forEach(doc => {
    const d = doc.data();
    eventUrls.push({
      loc: `https://cronoplay.com/evento.html?slug=${doc.id}`,
      lastmod: d.updated_at?.toDate?.()?.toISOString().slice(0, 10) || today,
      priority: 0.7,
      changefreq: 'weekly'
    });
  });

  const all = [
    ...STATIC_URLS.map(u => ({ ...u, lastmod: today })),
    ...eventUrls
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${all.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

  fs.writeFileSync('sitemap.xml', xml);
  console.log(`sitemap.xml generated with ${all.length} URLs (${eventUrls.length} events)`);
}

main().catch(err => {
  console.error('Error generating sitemap:', err);
  process.exit(1);
});
