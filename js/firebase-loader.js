/**
 * firebase-loader.js
 * Funciones de lectura pública desde Firestore.
 * Solo lectura — sin auth, sin escritura.
 */

import { db } from './firebase-config.js';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
} from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

const DEFAULT_SCHEDULE = [
  { time: '6:00 AM - 9:00 AM',   title: 'Crono Matutino',      host: 'Equipo Crono Play',  live: false, day: 'lun' },
  { time: '12:00 PM - 2:00 PM',  title: 'Deporte al Mediodía', host: 'Roberto Martínez',   live: false, day: 'lun' },
  { time: '6:00 PM - 8:00 PM',   title: 'Crono Deportivo',     host: 'Ana García',         live: false, day: 'lun' },
  { time: '8:00 PM - 10:00 PM',  title: 'Análisis Nocturno',   host: 'Carlos López',       live: false, day: 'lun' },
  { time: '6:00 AM - 9:00 AM',   title: 'Crono Matutino',      host: 'Equipo Crono Play',  live: false, day: 'mar' },
  { time: '6:00 PM - 8:00 PM',   title: 'Crono Deportivo',     host: 'Ana García',         live: false, day: 'mar' },
  { time: '6:00 AM - 9:00 AM',   title: 'Crono Matutino',      host: 'Equipo Crono Play',  live: false, day: 'mie' },
  { time: '6:00 PM - 8:00 PM',   title: 'Crono Deportivo',     host: 'Ana García',         live: false, day: 'mie' },
  { time: '6:00 AM - 9:00 AM',   title: 'Crono Matutino',      host: 'Equipo Crono Play',  live: false, day: 'jue' },
  { time: '6:00 PM - 8:00 PM',   title: 'Crono Deportivo',     host: 'Ana García',         live: false, day: 'jue' },
  { time: '6:00 AM - 9:00 AM',   title: 'Crono Matutino',      host: 'Equipo Crono Play',  live: false, day: 'vie' },
  { time: '6:00 PM - 8:00 PM',   title: 'Crono Deportivo',     host: 'Ana García',         live: false, day: 'vie' },
  { time: '10:00 AM - 12:00 PM', title: 'Crono Weekend',       host: 'Equipo Crono Play',  live: false, day: 'sab' },
  { time: '10:00 AM - 12:00 PM', title: 'Crono Weekend',       host: 'Equipo Crono Play',  live: false, day: 'dom' },
];

/**
 * Transforma una URL de Cloudinary para aplicar redimensionamiento y optimización.
 * @param {string} url - URL original de Cloudinary
 * @param {number} w   - Ancho deseado
 * @param {number} h   - Alto deseado
 * @returns {string}
 */
export function getCloudinaryUrl(url, w, h) {
  if (!url || !url.includes('cloudinary')) return url || '';
  return url.replace('/upload/', `/upload/w_${w},h_${h},c_fill,g_center,q_auto,f_auto/`);
}

/**
 * Devuelve un string de tiempo relativo en español (e.g. "hace 5 min", "hace 2 días").
 * @param {*} date - Firestore Timestamp o Date
 * @returns {string}
 */
export function formatRelativeTime(date) {
  if (!date) return '';
  const d = date.toDate ? date.toDate() : new Date(date);
  const now = Date.now();
  const diff = now - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'hace un momento';
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `hace ${hours} hora${hours > 1 ? 's' : ''}`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `hace ${days} día${days > 1 ? 's' : ''}`;
  return d.toLocaleDateString('es-VE', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * Carga artículos publicados con soporte de paginación y filtro por categoría.
 * @param {string} category  - 'all' o nombre de categoría
 * @param {*}      cursor    - lastDoc del batch anterior (para startAfter)
 * @param {number} pageSize  - cantidad de items por página
 * @returns {{ items: Array, lastDoc: *, hasMore: boolean }}
 */
export async function loadPublishedArticles(category = 'all', cursor = null, pageSize = 9) {
  try {
    const constraints = [
      where('status', '==', 'published'),
      orderBy('published_at', 'desc'),
      limit(pageSize + 1),
    ];

    if (category && category !== 'all') {
      constraints.unshift(where('category', '==', category));
    }

    if (cursor) {
      constraints.push(startAfter(cursor));
    }

    const q = query(collection(db, 'articles'), ...constraints);
    const snap = await getDocs(q);
    const all = snap.docs;
    const hasMore = all.length > pageSize;
    const items = all.slice(0, pageSize).map(d => ({ id: d.id, ...d.data() }));
    const lastDoc = items.length ? all[items.length - 1] : null;

    return { items, lastDoc, hasMore };
  } catch (err) {
    console.warn('[firebase-loader]', err);
    return { items: [], lastDoc: null, hasMore: false };
  }
}

/**
 * Carga la configuración del sitio desde Firestore.
 * @returns {{ hero: object, banner: object, sections: object, social_links: object }}
 */
export async function loadSiteConfig() {
  const CACHE_KEY = 'crono_site_config';
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  try {
    // Check sessionStorage cache with TTL
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed._ts && (Date.now() - parsed._ts) < CACHE_TTL) {
        return parsed;
      }
    }

    const [heroSnap, bannerSnap, sectionsSnap, socialSnap] = await Promise.all([
      getDoc(doc(db, 'site_config', 'hero')),
      getDoc(doc(db, 'site_config', 'banner')),
      getDoc(doc(db, 'site_config', 'sections_visibility')),
      getDoc(doc(db, 'site_config', 'social_links')),
    ]);

    const bannerRaw = bannerSnap.exists() ? bannerSnap.data() : {};

    // Retrocompatibilidad: si no tiene slides[], construir array desde campos raíz
    if (!Array.isArray(bannerRaw.slides) && bannerRaw.imagen_url) {
      bannerRaw.slides = [{
        id: 'legacy_0',
        imagen_url: bannerRaw.imagen_url,
        alt_text: bannerRaw.alt_text || 'Banner',
        url_destino: bannerRaw.url_destino || '',
        nueva_tab: bannerRaw.nueva_tab || false,
        cta_texto: '',
        orden: 0,
        activo: true,
      }];
    }

    const config = {
      hero:         heroSnap.exists()     ? heroSnap.data()     : {},
      banner:       bannerRaw,
      sections:     sectionsSnap.exists() ? sectionsSnap.data() : {},
      social_links: socialSnap.exists()   ? socialSnap.data()   : {},
      _ts: Date.now(),
    };

    sessionStorage.setItem(CACHE_KEY, JSON.stringify(config));
    return config;
  } catch (err) {
    console.warn('[firebase-loader]', err);
    return { hero: {}, banner: {}, sections: {}, social_links: {} };
  }
}

/**
 * Carga episodios de podcast desde Firestore.
 * Placeholder — integración completa pendiente.
 * @returns {Array}
 */
export async function loadPodcastEpisodes() {
  return [];
}

/**
 * Carga el horario semanal desde Firestore.
 * Retorna DEFAULT_SCHEDULE hasta que la colección exista en producción.
 * @returns {Array}
 */
export async function loadSchedule() {
  return DEFAULT_SCHEDULE;
}
