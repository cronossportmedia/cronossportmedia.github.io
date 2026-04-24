/* ───────────────────────────────────────────────────
   YouTube Live Detection — Crono Play Redesign v2
   ─────────────────────────────────────────────────── */

const YT_API_KEY  = 'AIzaSyCUzTePMXb54AssjcrqbCTSdaW_t2qj2AM';
const YT_HANDLE   = 'CronoSportMedia';
const POLL_MS     = 600000; // 10 minutes

let liveVideoId = null;

// ── Resolve Channel ID (cached in sessionStorage) ──────────
async function resolveChannelId() {
  const cached = sessionStorage.getItem('yt_channel_id');
  if (cached) return cached;

  const url =
    `https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=${YT_HANDLE}&key=${YT_API_KEY}`;
  const res  = await fetch(url);
  const data = await res.json();
  const id   = data.items?.[0]?.id;

  if (id) sessionStorage.setItem('yt_channel_id', id);
  return id ?? null;
}

// ── Fetch Live Stream ──────────────────────────────────────
async function fetchLiveStream() {
  const channelId = await resolveChannelId();
  if (!channelId) return null;

  const url =
    `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${channelId}` +
    `&eventType=live&type=video&maxResults=1&key=${YT_API_KEY}`;
  const res  = await fetch(url);
  const data = await res.json();
  const item = data.items?.[0];

  if (!item) return null;
  return { videoId: item.id.videoId, title: item.snippet.title };
}

// ── DOM helpers ────────────────────────────────────────────
const $ = (id) => document.getElementById(id);

// ── Show YouTube Live (en-vivo.html) ───────────────────────
function showYTLive(videoId, title) {
  const loading = $('ytLoading');
  const embed   = $('ytEmbed');
  const offline = $('ytOffline');
  const badge   = $('ytBadge');
  const titleEl = $('ytTitle');

  // Hide loading & offline, show embed
  if (loading) loading.style.display = 'none';
  if (offline) offline.style.display = 'none';
  if (embed) {
    embed.style.display = '';
    // Only inject iframe once (or replace if video changed)
    const existing = embed.querySelector('iframe');
    if (!existing || existing.dataset.vid !== videoId) {
      embed.innerHTML = '';
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube.com/embed/${videoId}?rel=0&autoplay=1`;
      iframe.setAttribute('allowfullscreen', '');
      iframe.setAttribute('allow',
        'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
      iframe.title = title;
      iframe.dataset.vid = videoId;
      embed.appendChild(iframe);
    }
  }

  // Badge & title
  if (badge) badge.style.display = '';
  if (titleEl) titleEl.textContent = title;

  // index.html: live bar YouTube pill
  const ytPill = $('ytLivePill');
  if (ytPill) {
    ytPill.style.display = '';
    const pillTitle = ytPill.querySelector('[data-yt-title]');
    if (pillTitle) pillTitle.textContent = title;
  }

  // index.html: radio card badge override
  const radioBadge = document.querySelector('.radio-card__live-badge[data-yt-live]');
  if (radioBadge) {
    radioBadge.innerHTML =
      '<span class="dot-live"></span> YouTube En Vivo';
  }
}

// ── Hide YouTube Live / show offline ───────────────────────
function hideYTLive() {
  const loading = $('ytLoading');
  const embed   = $('ytEmbed');
  const offline = $('ytOffline');
  const badge   = $('ytBadge');
  const titleEl = $('ytTitle');

  if (loading) loading.style.display = 'none';
  if (embed) {
    embed.style.display = 'none';
    embed.innerHTML = '';            // remove iframe to stop playback
  }
  if (offline) offline.style.display = '';
  if (badge)   badge.style.display = 'none';
  if (titleEl) titleEl.textContent = 'Crono Play en YouTube';

  // index.html: hide YouTube pill
  const ytPill = $('ytLivePill');
  if (ytPill) ytPill.style.display = 'none';

  // index.html: revert radio card badge
  const radioBadge = document.querySelector('.radio-card__live-badge[data-yt-live]');
  if (radioBadge) {
    radioBadge.innerHTML = '<span class="dot-live"></span> En Vivo';
  }
}

// ── Poll Loop ──────────────────────────────────────────────
async function poll() {
  try {
    const live = await fetchLiveStream();

    if (live && live.videoId !== liveVideoId) {
      liveVideoId = live.videoId;
      showYTLive(live.videoId, live.title);
    } else if (!live && liveVideoId !== null) {
      liveVideoId = null;
      hideYTLive();
    } else if (!live && liveVideoId === null) {
      // First check came back offline — dismiss spinner
      hideYTLive();
    }
  } catch (err) {
    console.warn('[youtube-live]', err);
    // On error, dismiss spinner gracefully instead of leaving it spinning
    if (liveVideoId === null) hideYTLive();
  }
}

// ── Init ───────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  poll();
  setInterval(poll, POLL_MS);
});
