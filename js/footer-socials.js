/**
 * footer-socials.js
 * Updates footer social links from Firestore site_config/social_links.
 * Import this module on any page with a #footerSocials container.
 */
import { loadSiteConfig } from './firebase-loader.js';

async function updateFooterSocials() {
  try {
    const config = await loadSiteConfig();

    // Social links
    if (config.social_links) {
      const container = document.getElementById('footerSocials');
      if (container) {
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
      }
    }

    // Events Hub visibility — hide nav links if show_events_hub is explicitly false
    if (config.sections?.show_events_hub === false) {
      document.querySelectorAll('[data-nav-events]').forEach(el => {
        const li = el.closest('li');
        if (li) li.hidden = true; else el.hidden = true;
      });
    }
  } catch (err) {
    console.warn('[footer-socials]', err);
  }
}

updateFooterSocials();
