// js/event-news.js — EH-07: Carga noticias por tag para el bloque news_strip
import { db } from './firebase-config.js';
import {
  collection, query, where, orderBy, limit, getDocs
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

// ── Helpers ─────────────────────────────────────────────────────

function esc(s) {
  const d = document.createElement('div');
  d.textContent = s || '';
  return d.innerHTML;
}

function timeAgo(date) {
  if (!date) return '';
  const d = date.toDate ? date.toDate() : new Date(date);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'hace un momento';
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `hace ${days}d`;
  return d.toLocaleDateString('es-VE', { day: 'numeric', month: 'short', year: 'numeric' });
}

function cloudinaryUrl(url, w, h) {
  if (!url || !url.includes('cloudinary')) return url || '';
  return url.replace('/upload/', `/upload/w_${w},h_${h},c_fill,g_center,q_auto,f_auto/`);
}

// ── Card renderer ───────────────────────────────────────────────

function renderNewsCard(article) {
  const imgUrl = cloudinaryUrl(article.featured_image, 400, 225);
  const cat = article.category || '';
  const time = timeAgo(article.published_at);

  return `
    <a href="noticia.html?slug=${encodeURIComponent(article.slug || '')}" class="news-card">
      <div class="news-card__img">
        ${imgUrl
          ? `<img src="${esc(imgUrl)}" alt="${esc(article.title)}" loading="lazy">`
          : `<div class="news-card__img-placeholder"><span>${esc(cat)}</span></div>`
        }
      </div>
      <div class="news-card__body">
        <h3 class="news-card__title">${esc(article.title)}</h3>
        <span class="news-card__time">${esc(time)}</span>
      </div>
    </a>`;
}

// ── Event listener ──────────────────────────────────────────────

window.addEventListener('event-news-block-ready', async (e) => {
  const { tag, max, container } = e.detail;
  if (!tag || !container) return;

  const section = document.querySelector('[data-block="news_strip"]');

  try {
    const q = query(
      collection(db, 'articles'),
      where('status', '==', 'published'),
      where('tags', 'array-contains', tag),
      orderBy('published_at', 'desc'),
      limit(Math.min(Number(max) || 3, 12))
    );
    const snap = await getDocs(q);

    if (snap.empty) {
      if (section) section.hidden = true;
      return;
    }

    const html = snap.docs
      .map(d => renderNewsCard({ id: d.id, ...d.data() }))
      .join('');
    container.innerHTML = html;
  } catch (err) {
    console.error('[event-news]', err);
    if (section) section.hidden = true;
  }
});
