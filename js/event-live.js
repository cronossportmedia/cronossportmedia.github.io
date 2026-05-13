// js/event-live.js — EH-08: Integración live_stream con site_config/live_players
import { db } from './firebase-config.js';
import { doc, getDoc } from 'https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js';

let livePlayersCache = null;

window.addEventListener('event-live-block-ready', async (e) => {
  const { playerId, container } = e.detail;
  if (!playerId || !container) return hideLive();

  try {
    if (!livePlayersCache) {
      const snap = await getDoc(doc(db, 'site_config', 'live_players'));
      if (!snap.exists()) return hideLive();
      livePlayersCache = snap.data();
    }

    if (livePlayersCache.active !== true) return hideLive();

    const player = (livePlayersCache.players || []).find(p => p.id === playerId);
    if (!player || player.active !== true) {
      if (!player) console.warn('[event-live] player_id no encontrado:', playerId);
      return hideLive();
    }

    renderPlayer(player, container);
  } catch (err) {
    console.error('[event-live]', err);
    hideLive();
  }
});

function hideLive() {
  const block = document.querySelector('[data-block="live_stream"]');
  if (block) block.hidden = true;
}

function renderPlayer(player, container) {
  if (player.type === 'audio') {
    container.innerHTML = `
      <div class="event-live__audio">
        ${player.logo_url ? `<img src="${esc(player.logo_url)}" alt="${esc(player.name)}" class="event-live__logo">` : ''}
        <div class="event-live__info">
          <p class="event-live__name">${esc(player.name)}</p>
          ${player.description ? `<p class="event-live__desc">${esc(player.description)}</p>` : ''}
        </div>
        <audio
          controls
          preload="none"
          src="${esc(player.stream_url)}"
          class="event-live__audio-player"
          aria-label="Transmisión de ${esc(player.name)}">
          Tu navegador no soporta reproducción de audio.
        </audio>
      </div>
    `;
    bindAudioErrorFallback(container.querySelector('audio'), player);
  } else if (player.type === 'youtube') {
    const videoId = player.youtube_video_id;
    const channelId = player.youtube_channel_id;

    if (videoId) {
      container.innerHTML = `
        <div class="event-live__youtube">
          <iframe
            src="https://www.youtube.com/embed/${esc(videoId)}?autoplay=0&rel=0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen
            loading="lazy"
            title="Transmisión de ${esc(player.name)}"></iframe>
        </div>
      `;
    } else if (channelId) {
      container.innerHTML = `
        <div class="event-live__youtube-fallback">
          <p>${esc(player.name)} transmitirá próximamente.</p>
          <a href="https://www.youtube.com/channel/${esc(channelId)}/live"
             target="_blank" rel="noopener noreferrer"
             class="btn btn--primary">
            Ver en YouTube cuando esté en vivo
          </a>
        </div>
      `;
    } else {
      hideLive();
    }
  } else {
    hideLive();
  }
}

function bindAudioErrorFallback(audio, player) {
  if (!audio) return;
  audio.addEventListener('error', () => {
    audio.replaceWith(Object.assign(document.createElement('p'), {
      textContent: `No pudimos conectar con ${player.name}. Intenta de nuevo en unos minutos.`,
      className: 'event-live__error'
    }));
  });
}

function esc(s) {
  return String(s ?? '').replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[c])
  );
}
