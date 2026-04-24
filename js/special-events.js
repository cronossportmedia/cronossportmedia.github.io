const SPECIAL_EVENT_FLAGS = { lpv: false, futve: false };

const EVENTS = {
  lpv: {
    id: 'lpv',
    badge: 'Liga Premier Venezolana',
    title: 'LPV En Vivo',
    description: 'Sigue la Liga Premier Venezolana en vivo a través de Crono Play. Cobertura completa del partido.',
    image: 'assets/img/11_Abril_LPV_partido.jpg',
    ctaPrimary:   { text: 'Escuchar en Vivo', url: 'en-vivo.html' },
    ctaSecondary: { text: 'Ver en YouTube',   url: 'https://www.youtube.com/@CronoPlayVzla' },
    embedUrl: '', // URL del stream LPV — completar cuando el evento esté activo
  },
  futve: {
    id: 'futve',
    badge: 'FUTVE',
    title: 'Portuguesa vs Puerto Cabello',
    description: 'Transmisión en vivo del partido de FUTVE. Cobertura completa en Crono Play.',
    image: 'assets/img/evento-portuguesa-vs-puerto-cabello-futve.svg',
    ctaPrimary:   { text: 'Ver Partido', url: 'en-vivo.html' },
    ctaSecondary: null,
    embedUrl: '', // URL embed de YouTube Live — completar cuando el evento esté activo
  }
};

function esc(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function safeUrl(url) {
  return /^javascript:/i.test(url) ? '#' : url;
}

function buildSlide(ev, withEmbeds) {
  const ctaSecHtml = ev.ctaSecondary
    ? `<a href="${esc(safeUrl(ev.ctaSecondary.url))}" target="_blank" rel="noopener noreferrer"
         class="inline-flex items-center gap-2 px-6 py-3 bg-white/20 text-white rounded-xl font-semibold text-sm hover:bg-white/30 transition-colors backdrop-blur-sm">${esc(ev.ctaSecondary.text)}</a>`
    : '';

  const embedHtml = (withEmbeds && ev.embedUrl)
    ? `<div class="w-full aspect-video rounded-2xl overflow-hidden bg-black shadow-2xl">
         <iframe src="${esc(safeUrl(ev.embedUrl))}" class="w-full h-full" allowfullscreen loading="lazy" allow="autoplay; encrypted-media"></iframe>
       </div>`
    : '';

  const hasEmbed = withEmbeds && ev.embedUrl;

  const infoHtml = `<div class="text-white space-y-4${hasEmbed ? '' : ' max-w-xl'}">
      <span class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500 text-xs font-bold uppercase tracking-wider">
        <span class="w-2 h-2 rounded-full bg-white animate-pulse-live"></span>
        ${esc(ev.badge)}
      </span>
      <h2 class="font-display text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight">${esc(ev.title)}</h2>
      <p class="text-white/80 text-base lg:text-lg leading-relaxed">${esc(ev.description)}</p>
      <div class="flex flex-wrap gap-3 pt-1">
        <a href="${esc(safeUrl(ev.ctaPrimary.url))}"
           class="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-orange-600 transition-colors shadow-lg shadow-primary/30">${esc(ev.ctaPrimary.text)}</a>
        ${ctaSecHtml}
      </div>
    </div>`;

  const innerContent = hasEmbed
    ? `<div class="grid lg:grid-cols-2 gap-8 items-center">${infoHtml}${embedHtml}</div>`
    : infoHtml;

  return `<div class="seb-slide relative min-h-[280px] sm:min-h-[340px] overflow-hidden">
    <div class="absolute inset-0 bg-cover bg-center bg-no-repeat" style="background-image:url('${ev.image}')"></div>
    <div class="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-black/30"></div>
    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
      ${innerContent}
    </div>
  </div>`;
}

export function initSpecialEvents(containerId, withEmbeds = false) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const active = Object.entries(SPECIAL_EVENT_FLAGS)
    .filter(([, v]) => v)
    .map(([k]) => EVENTS[k])
    .filter(Boolean);

  if (active.length === 0) return;

  container.classList.remove('hidden');

  const count = active.length;
  const slidesHtml = active.map(ev => buildSlide(ev, withEmbeds)).join('');

  if (count === 1) {
    container.innerHTML = slidesHtml;
    return;
  }

  const dotsHtml = active.map((_, i) =>
    `<button class="seb-dot w-2.5 h-2.5 rounded-full transition-colors ${i === 0 ? 'bg-white' : 'bg-white/40'}" aria-label="Evento ${i + 1}"></button>`
  ).join('');

  container.innerHTML = `
    <div class="seb-overflow relative overflow-hidden">
      <div class="seb-track flex" style="transition:transform .45s ease;">${slidesHtml}</div>
      <div class="absolute bottom-4 left-0 right-0 flex items-center justify-center gap-4 z-10">
        <button class="seb-prev w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-colors backdrop-blur-sm" aria-label="Anterior evento">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <div class="flex gap-2">${dotsHtml}</div>
        <button class="seb-next w-8 h-8 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center transition-colors backdrop-blur-sm" aria-label="Siguiente evento">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
        </button>
      </div>
    </div>`;

  let current = 0;
  const overflow = container.querySelector('.seb-overflow');
  const track    = container.querySelector('.seb-track');
  const slides   = track.querySelectorAll('.seb-slide');
  const dots     = container.querySelectorAll('.seb-dot');
  const prevBtn  = container.querySelector('.seb-prev');
  const nextBtn  = container.querySelector('.seb-next');

  function setWidths() {
    const w = overflow.offsetWidth;
    slides.forEach(s => { s.style.width = w + 'px'; s.style.flexShrink = '0'; });
  }

  function goTo(idx) {
    current = ((idx % count) + count) % count;
    track.style.transform = `translateX(${-current * overflow.offsetWidth}px)`;
    dots.forEach((d, i) => {
      d.classList.toggle('bg-white', i === current);
      d.classList.toggle('bg-white/40', i !== current);
    });
  }

  setWidths();
  window.addEventListener('resize', () => { setWidths(); goTo(current); });
  prevBtn?.addEventListener('click', () => goTo(current - 1));
  nextBtn?.addEventListener('click', () => goTo(current + 1));
  dots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));
}
