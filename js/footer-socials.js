/**
 * footer-socials.js
 * Updates footer social links from Firestore site_config/social_links.
 * Import this module on any page with a #footerSocials container.
 */
import { loadSiteConfig } from './firebase-loader.js';

async function updateFooterSocials() {
  try {
    const config = await loadSiteConfig();
    if (!config.social_links) return;

    const container = document.getElementById('footerSocials');
    if (!container) return;

    const links = {
      youtube: config.social_links.youtube,
      instagram: config.social_links.instagram,
      twitter: config.social_links.twitter,
      tiktok: config.social_links.tiktok,
    };

    Object.entries(links).forEach(([key, url]) => {
      const el = container.querySelector(`[data-social="${key}"]`);
      if (!el) return;
      if (url) {
        el.href = url;
        el.target = '_blank';
        el.rel = 'noopener';
        el.style.display = '';
      } else {
        el.style.display = 'none';
      }
    });
  } catch (err) {
    console.warn('[footer-socials]', err);
  }
}

updateFooterSocials();
