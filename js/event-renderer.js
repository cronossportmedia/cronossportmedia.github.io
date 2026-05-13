// js/event-renderer.js — EH-05: Renderer de bloques para evento.html
import { db } from './firebase-config.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const CACHE_KEY_PREFIX = 'crono_event_';
const CACHE_TTL_MS = 60_000; // 60s

// ── Bootstrap ────────────────────────────────────────────────

export async function bootstrapEventPage() {
  const slug = new URLSearchParams(location.search).get('slug');
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
    showError();
    return;
  }
  try {
    const event = await loadEvent(slug);
    if (!event) {
      showError();
      return;
    }
    renderEvent(event);
  } catch (err) {
    console.error('[event-renderer]', err);
    showError();
  }
}

// ── Firestore + Cache ────────────────────────────────────────

async function loadEvent(slug) {
  const cached = readCache(slug);
  if (cached) return cached;
  const snap = await getDoc(doc(db, 'events', slug));
  if (!snap.exists()) return null;
  const data = snap.data();
  if (!data.active) return null;
  const event = { id: snap.id, ...data };
  writeCache(slug, event);
  return event;
}

function readCache(slug) {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY_PREFIX + slug);
    if (!raw) return null;
    const { ts, value } = JSON.parse(raw);
    if (Date.now() - ts > CACHE_TTL_MS) return null;
    return value;
  } catch { return null; }
}

function writeCache(slug, value) {
  try {
    sessionStorage.setItem(
      CACHE_KEY_PREFIX + slug,
      JSON.stringify({ ts: Date.now(), value: serialize(value) })
    );
  } catch { /* quota exceeded — silently ignore */ }
}

function serialize(event) {
  return JSON.parse(JSON.stringify(event, (_key, val) => {
    if (val && typeof val.toMillis === 'function') return { __ts: val.toMillis() };
    return val;
  }));
}

function deserializeDate(field) {
  if (!field) return null;
  if (typeof field === 'object' && '__ts' in field) return new Date(field.__ts);
  if (typeof field.toMillis === 'function') return new Date(field.toMillis());
  return null;
}

// ── Estado del evento ────────────────────────────────────────

function computeStatus(event) {
  if (event.status_override) return event.status_override;
  const start = deserializeDate(event.event_date);
  if (!start) return 'upcoming';
  const end = deserializeDate(event.event_end_date) ?? start;
  const now = new Date();
  if (now < start) return 'upcoming';
  if (now <= end) return 'live';
  return 'finished';
}

const STATUS_LABEL = {
  upcoming:  'Proximamente',
  live:      'EN VIVO',
  finished:  'Finalizado',
  cancelled: 'Cancelado',
  postponed: 'Pospuesto'
};

// ── Render principal ─────────────────────────────────────────

function renderEvent(event) {
  const page = document.getElementById('eventPage');
  page.dataset.state = 'content';
  document.querySelector('[data-state-block="loading"]').hidden = true;
  document.querySelector('[data-state-block="content"]').hidden = false;

  // Brand color
  if (event.brand_color) {
    document.querySelector('.event-hero')?.style.setProperty('--hero-accent', event.brand_color);
  }

  const status = computeStatus(event);
  page.dataset.status = status;

  // SEO basico
  document.title = event.seo?.meta_title || `${event.name} — Crono Play`;
  setMeta('description', event.seo?.meta_description);
  setOg('og:title', event.seo?.og_title || document.title);
  setOg('og:description', event.seo?.og_description);
  setOg('og:image', event.seo?.og_image || event.blocks?.hero?.background_image_url);
  document.querySelector('link[rel=canonical]')?.setAttribute(
    'href', `https://cronoplay.com/evento.html?slug=${event.slug}`
  );

  // Iterar bloques en el orden definido
  const order = Array.isArray(event.block_order) && event.block_order.length
    ? event.block_order
    : ['hero', 'countdown', 'news_strip', 'feature', 'media', 'schedule', 'sponsors', 'live_stream', 'cta_sticky'];

  for (const blockName of order) {
    const block = event.blocks?.[blockName];
    if (!block || !block.active) continue;
    const renderer = BLOCK_RENDERERS[blockName];
    if (!renderer) continue;
    renderer(block, event, status);
  }
}

// ── Renderers individuales ───────────────────────────────────

const BLOCK_RENDERERS = {
  hero(block, event, status) {
    const root = document.querySelector('.event-hero');
    if (!root) return;
    root.hidden = false;
    if (block.background_image_url) {
      const img = root.querySelector('.event-hero__bg');
      if (img) { img.src = block.background_image_url; img.alt = ''; }
    }
    if (block.logo_url) {
      const logo = root.querySelector('.event-hero__logo');
      if (logo) { logo.src = block.logo_url; logo.alt = `${event.name} logo`; logo.hidden = false; }
    }
    setText(root, '.event-hero__title', block.title || event.name);
    setText(root, '.event-hero__subtitle', block.subtitle || '');

    if (block.show_status_badge) {
      const badge = root.querySelector('[data-field="status_badge"]');
      if (badge) {
        badge.textContent = STATUS_LABEL[status] || status;
        badge.classList.add(`badge--${status}`);
        badge.hidden = false;
      }
    }
    if (block.show_date_badge) {
      setField(root, 'date', formatEventDate(event.event_date, event.event_end_date));
    }
    if (event.location) {
      setField(root, 'location', `\u00B7 ${event.location}`);
    }
    if (event.tagline) {
      const t = root.querySelector('[data-field="tagline"]');
      if (t) { t.textContent = event.tagline; t.hidden = false; }
    }
    if (block.cta_primary?.url) hydrateCta(root.querySelector('[data-field="cta_primary"]'), block.cta_primary);
    if (block.cta_secondary?.url) hydrateCta(root.querySelector('[data-field="cta_secondary"]'), block.cta_secondary);
  },

  countdown(block, event, status) {
    if (status !== 'upcoming') return;
    const root = document.querySelector('.event-countdown');
    if (!root) return;
    root.hidden = false;
    setField(root, 'title', block.title || 'Faltan');
    const target = deserializeDate(event.event_date);
    if (!target) return;

    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) { root.hidden = true; return; }
      const d = Math.floor(diff / 86_400_000);
      const h = Math.floor((diff % 86_400_000) / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      setField(root, 'days', String(d));
      setField(root, 'hours', String(h).padStart(2, '0'));
      setField(root, 'minutes', String(m).padStart(2, '0'));
      setField(root, 'seconds', String(s).padStart(2, '0'));
    };
    tick();
    setInterval(tick, 1_000);
  },

  news_strip(block, event) {
    const root = document.querySelector('.event-news');
    if (!root) return;
    root.hidden = false;
    setField(root, 'title', block.title || 'Cobertura del evento');
    if (block.show_more_link && event.tag_filter) {
      const more = root.querySelector('[data-field="more_link"]');
      if (more) {
        more.href = `noticias.html?tag=${encodeURIComponent(event.tag_filter)}`;
        more.hidden = false;
      }
    }
    // Hook para EH-07: el render real de las cards de noticias
    window.dispatchEvent(new CustomEvent('event-news-block-ready', {
      detail: { tag: event.tag_filter, max: block.max_items, container: root.querySelector('.event-news__grid') }
    }));
  },

  feature(block) {
    const root = document.querySelector('.event-feature');
    if (!root) return;
    root.hidden = false;
    if (block.image_position === 'left') root.classList.add('event-feature--image-left');
    const img = root.querySelector('[data-field="image"]');
    if (img) img.src = block.image_url || '';
    setField(root, 'eyebrow', block.eyebrow || '');
    setField(root, 'title', block.title || '');

    // body es HTML — sanitizar con DOMPurify
    const body = root.querySelector('[data-field="body"]');
    if (body) {
      body.innerHTML = window.DOMPurify
        ? window.DOMPurify.sanitize(block.body || '', {
            ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'a', 'ul', 'ol', 'li'],
            ALLOWED_ATTR: ['href', 'target', 'rel']
          })
        : escapeHtml(block.body || '');
    }
    if (block.cta?.url) hydrateCta(root.querySelector('[data-field="cta"]'), block.cta);
    if (block.background_color) root.style.backgroundColor = block.background_color;
  },

  media(block) {
    const root = document.querySelector('.event-media');
    if (!root) return;
    root.hidden = false;
    root.dataset.mediaType = block.type;
    if (block.title) setField(root, 'title', block.title);
    if (block.caption) {
      const c = root.querySelector('[data-field="caption"]');
      if (c) { c.textContent = block.caption; c.hidden = false; }
    }
    const container = root.querySelector('.event-media__container');
    if (!container) return;

    if (block.type === 'image') {
      container.innerHTML = `<img src="${escapeAttr(block.url)}" alt="${escapeAttr(block.title || '')}" loading="lazy">`;
    } else if (block.type === 'video') {
      const youtubeId = block.youtube_id || extractYouTubeId(block.url);
      if (youtubeId) {
        container.innerHTML = `<iframe src="https://www.youtube.com/embed/${escapeAttr(youtubeId)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>`;
      } else if (block.url) {
        container.innerHTML = `<video controls preload="metadata" src="${escapeAttr(block.url)}"></video>`;
      }
    } else if (block.type === 'gallery' && Array.isArray(block.gallery_images)) {
      container.innerHTML = block.gallery_images
        .map(img => `<figure><img src="${escapeAttr(img.url)}" alt="${escapeAttr(img.alt || '')}" loading="lazy"></figure>`)
        .join('');
      container.classList.add('event-media__container--gallery');
    }
  },

  schedule(block) {
    const root = document.querySelector('.event-schedule');
    if (!root) return;
    root.hidden = false;
    setField(root, 'title', block.title || 'Programacion');
    const list = root.querySelector('.event-schedule__list');
    if (!list) return;
    list.innerHTML = (block.items || [])
      .map(item => `
        <li>
          <strong>${escapeHtml(item.time || '')}</strong>
          <div>
            <span class="schedule-label">${escapeHtml(item.label || '')}</span>
            ${item.description ? `<p>${escapeHtml(item.description)}</p>` : ''}
          </div>
        </li>
      `).join('');
  },

  sponsors(block) {
    const root = document.querySelector('.event-sponsors');
    if (!root) return;
    root.hidden = false;
    const heading = root.querySelector('h2');
    if (heading) heading.textContent = block.title || 'Patrocinadores oficiales';

    const tiers = ['diamond', 'gold', 'silver', 'bronze'];
    for (const tier of tiers) {
      const items = (block.items || [])
        .filter(s => s.active && s.tier === tier)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
      const tierEl = root.querySelector(`[data-tier="${tier}"]`);
      if (!tierEl) continue;
      if (!items.length) {
        tierEl.hidden = true;
        continue;
      }
      tierEl.hidden = false;
      tierEl.innerHTML = items.map(s => {
        const inner = `<img src="${escapeAttr(s.logo_url)}" alt="${escapeAttr(s.name)}" loading="lazy">`;
        return s.url
          ? `<a href="${escapeAttr(s.url)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeAttr(s.name)}">${inner}</a>`
          : inner;
      }).join('');
    }
  },

  live_stream(block, _event, status) {
    if (block.auto_show_when_live && status !== 'live') return;
    const root = document.querySelector('.event-live');
    if (!root) return;
    root.hidden = false;
    setField(root, 'title', block.title || 'Transmision en vivo');
    // Hook para EH-08: el render real del player
    window.dispatchEvent(new CustomEvent('event-live-block-ready', {
      detail: { playerId: block.player_id, container: root.querySelector('[data-field="player"]') }
    }));
  },

  cta_sticky(block) {
    const root = document.querySelector('.event-cta-sticky');
    if (!root) return;
    root.hidden = false;
    if (block.mobile_only) root.classList.add('event-cta-sticky--mobile-only');
    root.href = block.url || '#';
    setField(root, 'text', block.text || 'Ver mas');
  }
};

// ── Helpers ──────────────────────────────────────────────────

function hydrateCta(el, cta) {
  if (!el) return;
  el.textContent = cta.text || '';
  el.href = cta.url || '#';
  if (cta.new_tab) {
    el.target = '_blank';
    el.rel = 'noopener noreferrer';
  }
  el.hidden = false;
}

function setField(root, name, text) {
  const el = root.querySelector(`[data-field="${name}"]`);
  if (el) el.textContent = text;
}

function setText(root, selector, text) {
  const el = root.querySelector(selector);
  if (el) el.textContent = text;
}

function setMeta(name, content) {
  if (!content) return;
  const el = document.querySelector(`meta[name="${name}"]`);
  if (el) el.content = content;
}

function setOg(prop, content) {
  if (!content) return;
  const el = document.querySelector(`meta[property="${prop}"]`);
  if (el) el.content = content;
}

function showError() {
  document.getElementById('eventPage').dataset.state = 'error';
  document.querySelector('[data-state-block="loading"]').hidden = true;
  document.querySelector('[data-state-block="error"]').hidden = false;
}

function formatEventDate(start, end) {
  const s = deserializeDate(start);
  if (!s) return '';
  const opts = { day: '2-digit', month: 'long', year: 'numeric' };
  const sStr = s.toLocaleDateString('es-VE', opts);
  const eDate = deserializeDate(end);
  if (eDate && eDate.toDateString() !== s.toDateString()) {
    return `${sStr} \u2014 ${eDate.toLocaleDateString('es-VE', opts)}`;
  }
  return sStr;
}

function extractYouTubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([\w-]{11})/);
  return m ? m[1] : null;
}

function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c])
  );
}

function escapeAttr(s) {
  return escapeHtml(s);
}
