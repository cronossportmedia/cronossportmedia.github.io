/**
 * events-list.js
 * Carga y renderiza el listado público de eventos desde Firestore.
 * Agrupa eventos en: live, upcoming, finished.
 */

import { db } from './firebase-config.js';
import {
  collection, query, where, orderBy, getDocs
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const STATUS_LABELS = {
  upcoming: 'Próximamente',
  live: 'EN VIVO',
  finished: 'Finalizado'
};

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[c]
  );
}

function formatDate(ts) {
  if (!ts?.toDate) return '';
  return ts.toDate().toLocaleDateString('es-VE', {
    day: '2-digit', month: 'long', year: 'numeric'
  });
}

function toCard(event) {
  const heroImage = event.blocks?.hero?.background_image_url || '';
  const date = formatDate(event.event_date);
  const tagline = event.tagline || event.blocks?.hero?.subtitle || '';

  return `
    <article class="event-card-public reveal">
      <a href="evento.html?slug=${encodeURIComponent(event.slug || event.id)}">
        <div class="event-card-public__media">
          ${heroImage
            ? `<img src="${esc(heroImage)}" alt="" loading="lazy">`
            : `<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;
                background:linear-gradient(135deg,var(--card),var(--border));color:var(--muted);
                font-size:12px;font-family:var(--font-d)">Sin imagen</div>`
          }
          <span class="badge badge--${event.status}">${STATUS_LABELS[event.status]}</span>
        </div>
        <div class="event-card-public__body">
          <p class="event-card-public__date">${esc(date)}</p>
          <h3>${esc(event.name)}</h3>
          <p>${esc(tagline)}</p>
        </div>
      </a>
    </article>
  `;
}

function renderSection(name, items) {
  const section = document.querySelector(`[data-section="${name}"]`);
  if (!section) return;
  if (!items.length) return;
  section.hidden = false;
  const grid = section.querySelector('.events-grid');
  grid.innerHTML = items.map(toCard).join('');

  // Activate reveal animations
  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); revealIO.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  grid.querySelectorAll('.reveal').forEach(el => revealIO.observe(el));
}

async function loadEventsList() {
  try {
    const q = query(
      collection(db, 'events'),
      where('active', '==', true),
      orderBy('event_date', 'desc')
    );
    const snap = await getDocs(q);

    const now = Date.now();
    const live = [], upcoming = [], finished = [];

    snap.forEach(docSnap => {
      const data = docSnap.data();
      const start = data.event_date?.toMillis?.() ?? 0;
      const end = data.event_end_date?.toMillis?.() ?? start;

      let status = data.status_override;
      if (!status) {
        if (now < start) status = 'upcoming';
        else if (now <= end) status = 'live';
        else status = 'finished';
      }

      const item = { id: docSnap.id, ...data, status };

      if (status === 'live') live.push(item);
      else if (status === 'upcoming') upcoming.push(item);
      else if (status === 'finished') finished.push(item);
    });

    // Sort: upcoming by nearest first, finished by most recent first
    upcoming.sort((a, b) => (a.event_date?.toMillis?.() ?? 0) - (b.event_date?.toMillis?.() ?? 0));
    finished.sort((a, b) => (b.event_date?.toMillis?.() ?? 0) - (a.event_date?.toMillis?.() ?? 0));
    finished.splice(6); // limit to last 6

    // Hide loading
    const loadingEl = document.querySelector('[data-state="loading"]');
    if (loadingEl) loadingEl.hidden = true;

    renderSection('live', live);
    renderSection('upcoming', upcoming);
    renderSection('finished', finished);

    // Show empty state if nothing at all
    if (!live.length && !upcoming.length && !finished.length) {
      const emptyEl = document.querySelector('[data-section="upcoming"] .events-empty');
      if (emptyEl) emptyEl.hidden = false;
      const upSection = document.querySelector('[data-section="upcoming"]');
      if (upSection) upSection.hidden = false;
    }
  } catch (err) {
    console.error('[events-list]', err);
    const loadingEl = document.querySelector('[data-state="loading"]');
    if (loadingEl) loadingEl.hidden = true;
    const errorEl = document.querySelector('[data-state="error"]');
    if (errorEl) errorEl.hidden = false;
  }
}

loadEventsList();
