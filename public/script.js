/**
 * Crono Play - Main JavaScript
 * Static site for GitHub Pages
 * 
 * IDs for Firestore/Cloudinary integration:
 * - #player - Sticky audio player
 * - #audio-player - Audio element
 * - #news-container - Home page news grid
 * - #news-grid-container - News page full grid
 * - #podcasts-container - Home page podcasts
 * - #episodes-container - Podcast page episodes
 * - #shows-container - Podcast shows
 * - #clips-container - Live page clips
 * - #schedule-container - Home schedule
 * - #weekly-schedule-container - Live page schedule
 * - #live-broadcast-container - Current broadcast
 * - #upcoming-shows - Upcoming shows list
 * - #featured-episode - Featured podcast episode
 * - #featured-story - Featured news article
 * - #team-container - Team members
 * - #trending-news - Trending news sidebar
 * - #timeline-container - About page timeline
 */

// ============================================
// STATE MANAGEMENT
// ============================================

const state = {
  currentSection: 'home',
  isPlaying: false,
  isMuted: false,
  volume: 80,
  playerVisible: false,
  currentShow: {
    title: 'Crono Deportivo',
    host: 'Roberto Martínez',
    description: 'Análisis en profundidad de la jornada deportiva'
  },
  selectedScheduleDay: 'lun',
  selectedNewsCategory: 'all',
  selectedPodcastCategory: 'all'
};

// ============================================
// SAMPLE DATA (Replace with Firestore)
// ============================================

const sampleNews = [
  {
    id: 1,
    title: 'Real Madrid presenta su nuevo estadio Santiago Bernabéu',
    excerpt: 'Las obras de renovación del estadio llegan a su fin con un diseño futurista que revolucionará la experiencia del aficionado.',
    category: 'futbol',
    date: 'Hace 2 horas',
    image: null
  },
  {
    id: 2,
    title: 'Alcaraz se prepara para Roland Garros',
    excerpt: 'El tenista español entrena intensamente de cara al segundo Grand Slam de la temporada.',
    category: 'tenis',
    date: 'Hace 4 horas',
    image: null
  },
  {
    id: 3,
    title: 'NBA: Lakers avanzan a semifinales',
    excerpt: 'LeBron James lidera a su equipo con una actuación memorable en el quinto partido de la serie.',
    category: 'basket',
    date: 'Hace 5 horas',
    image: null
  },
  {
    id: 4,
    title: 'F1: Verstappen domina en Mónaco',
    excerpt: 'El tricampeón mundial se lleva la pole position en el circuito más glamuroso del calendario.',
    category: 'motor',
    date: 'Hace 6 horas',
    image: null
  },
  {
    id: 5,
    title: 'Barcelona ficha al nuevo talento brasileño',
    excerpt: 'El club azulgrana anuncia la incorporación del joven delantero de 18 años por 50 millones de euros.',
    category: 'futbol',
    date: 'Hace 8 horas',
    image: null
  },
  {
    id: 6,
    title: 'Eurocopa 2024: España entre los favoritos',
    excerpt: 'Los analistas sitúan a la selección española como una de las principales candidatas al título.',
    category: 'futbol',
    date: 'Hace 10 horas',
    image: null
  }
];

const samplePodcasts = [
  {
    id: 1,
    title: 'Crono Deportivo',
    description: 'El podcast insignia con análisis diario del mundo del deporte',
    episodes: 245,
    category: 'General'
  },
  {
    id: 2,
    title: 'La Pizarra Táctica',
    description: 'Análisis táctico profundo de los mejores partidos',
    episodes: 128,
    category: 'Fútbol'
  },
  {
    id: 3,
    title: 'Motor al Límite',
    description: 'F1, MotoGP y todo el mundo del motor',
    episodes: 89,
    category: 'Motor'
  },
  {
    id: 4,
    title: 'Basket Zone',
    description: 'NBA, Euroliga y baloncesto internacional',
    episodes: 156,
    category: 'Basket'
  }
];

const sampleEpisodes = [
  {
    id: 1,
    title: 'El Futuro del Fútbol Español',
    show: 'Crono Deportivo',
    duration: '58 min',
    date: 'Hace 2 días',
    plays: '12.4K',
    category: 'futbol'
  },
  {
    id: 2,
    title: 'Análisis Táctico: El Clásico',
    show: 'La Pizarra Táctica',
    duration: '45 min',
    date: 'Hace 3 días',
    plays: '8.2K',
    category: 'futbol'
  },
  {
    id: 3,
    title: 'GP Mónaco Preview',
    show: 'Motor al Límite',
    duration: '32 min',
    date: 'Hace 4 días',
    plays: '5.6K',
    category: 'motor'
  },
  {
    id: 4,
    title: 'Playoffs NBA: Análisis Completo',
    show: 'Basket Zone',
    duration: '52 min',
    date: 'Hace 5 días',
    plays: '9.1K',
    category: 'basket'
  },
  {
    id: 5,
    title: 'Mercado de Fichajes: Rumores',
    show: 'Crono Deportivo',
    duration: '38 min',
    date: 'Hace 6 días',
    plays: '7.3K',
    category: 'futbol'
  },
  {
    id: 6,
    title: 'La Evolución del Baloncesto',
    show: 'Basket Zone',
    duration: '41 min',
    date: 'Hace 1 semana',
    plays: '4.8K',
    category: 'basket'
  }
];

const sampleSchedule = [
  { time: '06:00 - 08:00', title: 'Despertador Deportivo', host: 'María López' },
  { time: '08:00 - 12:00', title: 'Crono Deportivo', host: 'Roberto Martínez', live: true },
  { time: '12:00 - 14:00', title: 'La Hora del Fútbol', host: 'Carlos Ruiz' },
  { time: '14:00 - 16:00', title: 'Tiempo de Análisis', host: 'Ana García' },
  { time: '16:00 - 18:00', title: 'Basket Time', host: 'Pedro Sánchez' },
  { time: '18:00 - 20:00', title: 'Motor en Marcha', host: 'Laura Fernández' },
  { time: '20:00 - 22:00', title: 'Resumen del Día', host: 'David Torres' },
  { time: '22:00 - 00:00', title: 'Nocturno Deportivo', host: 'Elena Martín' }
];

const sampleClips = [
  { id: 1, title: 'Entrevista exclusiva con el seleccionador', duration: '15:32', date: 'Hace 1 día' },
  { id: 2, title: 'Debate: ¿Quién ganará la Champions?', duration: '22:45', date: 'Hace 2 días' },
  { id: 3, title: 'Análisis post-partido El Clásico', duration: '18:20', date: 'Hace 3 días' }
];

const sampleTeam = [
  { name: 'Roberto Martínez', role: 'Director y Presentador', bio: 'Periodista con más de 20 años de experiencia' },
  { name: 'Ana García', role: 'Analista Deportiva', bio: 'Especialista en fútbol internacional' },
  { name: 'Carlos Ruiz', role: 'Comentarista', bio: 'Ex futbolista profesional' },
  { name: 'Laura Fernández', role: 'Reportera', bio: 'Cobertura de eventos en vivo' }
];

const sampleTimeline = [
  { year: '2018', title: 'Fundación', description: 'Crono Play nace como un proyecto de podcast independiente' },
  { year: '2019', title: 'Crecimiento', description: 'Alcanzamos los 10,000 oyentes mensuales' },
  { year: '2020', title: 'Radio Online', description: 'Lanzamiento de nuestra señal en vivo 24/7' },
  { year: '2022', title: 'Expansión', description: 'Nuevo estudio y equipo ampliado' },
  { year: '2024', title: 'Consolidación', description: 'Más de 50,000 oyentes activos diarios' }
];

const trendingNews = [
  { title: 'Fichaje bomba en el mercado de invierno', category: 'Fútbol' },
  { title: 'Récord mundial batido en atletismo', category: 'Atletismo' },
  { title: 'Nuevo formato de la Champions League', category: 'Fútbol' },
  { title: 'Lesión de estrella de la NBA', category: 'Basket' }
];

const newsCategories = [
  { name: 'Fútbol', count: 45 },
  { name: 'Basket', count: 28 },
  { name: 'Tenis', count: 15 },
  { name: 'Motor', count: 22 },
  { name: 'Otros', count: 12 }
];

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavigation();
  initMobileMenu();
  initPlayer();
  initScheduleTabs();
  initForms();
  initFilters();
  
  // Populate content
  renderHomeNews();
  renderHomePodcasts();
  renderHomeSchedule();
  renderUpcomingShows();
  renderLiveUpcomingShows();
  renderWeeklySchedule();
  renderClips();
  renderShows();
  renderEpisodes();
  renderNewsGrid();
  renderTrendingNews();
  renderNewsCategories();
  renderTeam();
  renderTimeline();
  
  // Start clock
  updateClock();
  setInterval(updateClock, 1000);
});

// ============================================
// THEME MANAGEMENT
// ============================================

function initTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  const savedTheme = localStorage.getItem('theme');
  
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
  }
  
  themeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', document.documentElement.classList.contains('dark') ? 'dark' : 'light');
  });
}

// ============================================
// NAVIGATION
// ============================================

function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const section = link.dataset.section;
      if (section) {
        navigateTo(section);
        closeMobileMenu();
      }
    });
  });
  
  // Handle browser back/forward
  window.addEventListener('popstate', (e) => {
    if (e.state && e.state.section) {
      showSection(e.state.section);
    }
  });
  
  // Check URL hash on load
  const hash = window.location.hash.replace('#', '');
  if (hash && document.getElementById(`section-${hash}`)) {
    navigateTo(hash, false);
  }
}

function navigateTo(section, pushState = true) {
  state.currentSection = section;
  showSection(section);
  
  if (pushState) {
    history.pushState({ section }, '', `#${section}`);
  }
  
  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function showSection(section) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  const targetSection = document.getElementById(`section-${section}`);
  if (targetSection) {
    targetSection.classList.add('active');
  }
  
  // Update active nav link styling
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.dataset.section === section) {
      link.classList.add('text-primary');
    } else {
      link.classList.remove('text-primary');
    }
  });
}

// ============================================
// MOBILE MENU
// ============================================

function initMobileMenu() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const closeBtn = document.getElementById('mobile-menu-close');
  const overlay = document.getElementById('mobile-menu-overlay');
  
  menuBtn.addEventListener('click', openMobileMenu);
  closeBtn.addEventListener('click', closeMobileMenu);
  overlay.addEventListener('click', closeMobileMenu);
}

function openMobileMenu() {
  document.getElementById('mobile-menu').classList.add('open');
  document.getElementById('mobile-menu-overlay').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
  document.getElementById('mobile-menu').classList.remove('open');
  document.getElementById('mobile-menu-overlay').classList.add('hidden');
  document.body.style.overflow = '';
}

// ============================================
// AUDIO PLAYER
// ============================================

function initPlayer() {
  const audio = document.getElementById('audio-player');
  const playerPlayBtn = document.getElementById('player-play-btn');
  const playerMuteBtn = document.getElementById('player-mute-btn');
  const playerVolume = document.getElementById('player-volume');
  const playerCloseBtn = document.getElementById('player-close-btn');
  const radioPlayBtn = document.getElementById('radio-play-btn');
  const radioVolume = document.getElementById('radio-volume');
  
  // All play buttons
  const playButtons = [
    document.getElementById('hero-play-btn'),
    document.getElementById('header-play-btn'),
    document.getElementById('live-play-btn'),
    document.getElementById('featured-episode-play-btn'),
    playerPlayBtn,
    radioPlayBtn
  ].filter(Boolean);
  
  playButtons.forEach(btn => {
    btn.addEventListener('click', togglePlayback);
  });
  
  // Player controls
  playerMuteBtn?.addEventListener('click', toggleMute);
  playerVolume?.addEventListener('input', (e) => setVolume(e.target.value));
  radioVolume?.addEventListener('input', (e) => {
    setVolume(e.target.value);
    document.getElementById('radio-volume-value').textContent = `${e.target.value}%`;
  });
  playerCloseBtn?.addEventListener('click', hidePlayer);
  
  // Sync volume sliders
  audio.volume = state.volume / 100;
}

function togglePlayback() {
  const audio = document.getElementById('audio-player');
  
  if (state.isPlaying) {
    audio.pause();
    state.isPlaying = false;
  } else {
    // Set stream URL here for your actual stream
    // audio.src = 'YOUR_STREAM_URL';
    // audio.play();
    state.isPlaying = true;
    showPlayer();
  }
  
  updatePlayButtons();
  updateVisualizers();
}

function updatePlayButtons() {
  // Player
  const playerPlayIcon = document.getElementById('player-play-icon');
  const playerPauseIcon = document.getElementById('player-pause-icon');
  const radioPlayIcon = document.getElementById('radio-play-icon');
  const radioPauseIcon = document.getElementById('radio-pause-icon');
  
  if (state.isPlaying) {
    playerPlayIcon?.classList.add('hidden');
    playerPauseIcon?.classList.remove('hidden');
    radioPlayIcon?.classList.add('hidden');
    radioPauseIcon?.classList.remove('hidden');
  } else {
    playerPlayIcon?.classList.remove('hidden');
    playerPauseIcon?.classList.add('hidden');
    radioPlayIcon?.classList.remove('hidden');
    radioPauseIcon?.classList.add('hidden');
  }
}

function updateVisualizers() {
  const visualizers = document.querySelectorAll('.equalizer-bar');
  visualizers.forEach(bar => {
    if (state.isPlaying) {
      bar.style.animationPlayState = 'running';
    } else {
      bar.style.animationPlayState = 'paused';
    }
  });
}

function toggleMute() {
  const audio = document.getElementById('audio-player');
  state.isMuted = !state.isMuted;
  audio.muted = state.isMuted;
  
  const volumeIcon = document.getElementById('player-volume-icon');
  const muteIcon = document.getElementById('player-mute-icon');
  
  if (state.isMuted) {
    volumeIcon?.classList.add('hidden');
    muteIcon?.classList.remove('hidden');
  } else {
    volumeIcon?.classList.remove('hidden');
    muteIcon?.classList.add('hidden');
  }
}

function setVolume(value) {
  const audio = document.getElementById('audio-player');
  state.volume = parseInt(value);
  audio.volume = state.volume / 100;
  
  // Sync both volume sliders
  const playerVolume = document.getElementById('player-volume');
  const radioVolume = document.getElementById('radio-volume');
  
  if (playerVolume) playerVolume.value = value;
  if (radioVolume) {
    radioVolume.value = value;
    document.getElementById('radio-volume-value').textContent = `${value}%`;
  }
}

function showPlayer() {
  const player = document.getElementById('player');
  if (!state.playerVisible) {
    player.classList.remove('translate-y-full');
    state.playerVisible = true;
    // Add padding to body to account for player
    document.body.style.paddingBottom = '80px';
  }
}

function hidePlayer() {
  const player = document.getElementById('player');
  const audio = document.getElementById('audio-player');
  
  audio.pause();
  state.isPlaying = false;
  updatePlayButtons();
  updateVisualizers();
  
  player.classList.add('translate-y-full');
  state.playerVisible = false;
  document.body.style.paddingBottom = '';
}

// ============================================
// SCHEDULE TABS
// ============================================

function initScheduleTabs() {
  const dayBtns = document.querySelectorAll('.schedule-day-btn');
  
  dayBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      state.selectedScheduleDay = btn.dataset.day;
      
      // Update active state
      dayBtns.forEach(b => {
        b.classList.remove('bg-primary', 'text-white');
        b.classList.add('hover:bg-[#E5E5E5]', 'dark:hover:bg-[#2A2A2C]');
      });
      btn.classList.add('bg-primary', 'text-white');
      btn.classList.remove('hover:bg-[#E5E5E5]', 'dark:hover:bg-[#2A2A2C]');
      
      renderWeeklySchedule();
    });
  });
}

// ============================================
// FORMS
// ============================================

function initForms() {
  const contactForm = document.getElementById('contact-form');
  const newsletterForm = document.getElementById('newsletter-form');
  
  contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    // Handle contact form submission
    // Connect to your backend/Firestore here
    alert('¡Gracias por tu mensaje! Te responderemos pronto.');
    contactForm.reset();
  });
  
  newsletterForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    // Handle newsletter subscription
    // Connect to your backend/Firestore here
    alert('¡Gracias por suscribirte!');
    newsletterForm.reset();
  });
}

// ============================================
// FILTERS
// ============================================

function initFilters() {
  // News filters
  document.querySelectorAll('.news-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.selectedNewsCategory = btn.dataset.category;
      
      document.querySelectorAll('.news-filter-btn').forEach(b => {
        b.classList.remove('bg-primary', 'text-white');
      });
      btn.classList.add('bg-primary', 'text-white');
      
      renderNewsGrid();
    });
  });
  
  // Episode filters
  document.querySelectorAll('.episode-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      state.selectedPodcastCategory = btn.dataset.category;
      
      document.querySelectorAll('.episode-filter-btn').forEach(b => {
        b.classList.remove('bg-primary', 'text-white');
      });
      btn.classList.add('bg-primary', 'text-white');
      
      renderEpisodes();
    });
  });
}

// ============================================
// RENDER FUNCTIONS
// ============================================

function renderHomeNews() {
  const container = document.getElementById('news-container');
  if (!container) return;
  
  container.innerHTML = sampleNews.slice(0, 6).map(news => `
    <article class="group bg-[#FFFFFF] dark:bg-[#141415] rounded-2xl overflow-hidden border border-[#E5E5E5] dark:border-[#2A2A2C] card-hover">
      <div class="aspect-video bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
        <svg class="w-12 h-12 text-primary/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
        </svg>
      </div>
      <div class="p-6">
        <div class="flex items-center gap-3 mb-3">
          <span class="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium capitalize">${news.category}</span>
          <span class="text-xs text-[#737373] dark:text-[#A3A3A3]">${news.date}</span>
        </div>
        <h3 class="font-display font-semibold text-lg mb-2 group-hover:text-primary transition-colors line-clamp-2">${news.title}</h3>
        <p class="text-sm text-[#737373] dark:text-[#A3A3A3] line-clamp-2">${news.excerpt}</p>
      </div>
    </article>
  `).join('');
}

function renderHomePodcasts() {
  const container = document.getElementById('podcasts-container');
  if (!container) return;
  
  container.innerHTML = samplePodcasts.map(podcast => `
    <div class="group bg-[#F5F5F5] dark:bg-[#1C1C1E] rounded-2xl p-6 card-hover cursor-pointer">
      <div class="w-full aspect-square rounded-xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
        <svg class="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
        </svg>
      </div>
      <h3 class="font-display font-semibold text-lg mb-1">${podcast.title}</h3>
      <p class="text-sm text-[#737373] dark:text-[#A3A3A3] mb-3 line-clamp-2">${podcast.description}</p>
      <div class="flex items-center justify-between">
        <span class="text-xs text-[#737373] dark:text-[#A3A3A3]">${podcast.episodes} episodios</span>
        <span class="px-2 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-medium">${podcast.category}</span>
      </div>
    </div>
  `).join('');
}

function renderHomeSchedule() {
  const container = document.getElementById('schedule-container');
  if (!container) return;
  
  container.innerHTML = sampleSchedule.map(item => `
    <div class="flex items-center gap-4 p-4 rounded-xl ${item.live ? 'bg-primary/10 border border-primary/20' : 'bg-[#F5F5F5] dark:bg-[#1C1C1E]'}">
      <div class="w-24 text-sm font-medium ${item.live ? 'text-primary' : 'text-[#737373] dark:text-[#A3A3A3]'}">${item.time}</div>
      <div class="flex-1">
        <div class="flex items-center gap-2">
          <span class="font-semibold">${item.title}</span>
          ${item.live ? '<span class="w-2 h-2 rounded-full bg-red-500 animate-pulse-live"></span>' : ''}
        </div>
        <div class="text-sm text-[#737373] dark:text-[#A3A3A3]">${item.host}</div>
      </div>
      ${item.live ? '<span class="px-3 py-1 rounded-full bg-red-500 text-white text-xs font-medium">EN VIVO</span>' : ''}
    </div>
  `).join('');
}

function renderUpcomingShows() {
  const container = document.getElementById('upcoming-shows');
  if (!container) return;
  
  const upcoming = sampleSchedule.slice(2, 5);
  
  container.innerHTML = upcoming.map(show => `
    <div class="flex items-center gap-4 p-4 bg-[#F5F5F5] dark:bg-[#1C1C1E] rounded-xl">
      <div class="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
        <svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      </div>
      <div class="flex-1 min-w-0">
        <div class="font-medium truncate">${show.title}</div>
        <div class="text-sm text-[#737373] dark:text-[#A3A3A3]">${show.time}</div>
      </div>
    </div>
  `).join('');
}

function renderLiveUpcomingShows() {
  const container = document.getElementById('live-upcoming-shows');
  if (!container) return;
  
  const upcoming = sampleSchedule.slice(2, 5);
  
  container.innerHTML = upcoming.map(show => `
    <div class="flex items-center gap-4 p-4 bg-[#F5F5F5] dark:bg-[#1C1C1E] rounded-xl">
      <div class="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center">
        <svg class="w-5 h-5 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
      </div>
      <div class="flex-1 min-w-0">
        <div class="font-medium truncate">${show.title}</div>
        <div class="text-sm text-[#737373] dark:text-[#A3A3A3]">${show.time} - ${show.host}</div>
      </div>
    </div>
  `).join('');
}

function renderWeeklySchedule() {
  const container = document.getElementById('weekly-schedule-container');
  if (!container) return;
  
  container.innerHTML = sampleSchedule.map(item => `
    <div class="flex items-center gap-6 p-6 bg-[#FFFFFF] dark:bg-[#141415] rounded-2xl border border-[#E5E5E5] dark:border-[#2A2A2C] ${item.live ? 'ring-2 ring-primary' : ''}">
      <div class="text-center min-w-[80px]">
        <div class="text-2xl font-display font-bold ${item.live ? 'text-primary' : ''}">${item.time.split(' - ')[0]}</div>
        <div class="text-sm text-[#737373] dark:text-[#A3A3A3]">${item.time.split(' - ')[1]}</div>
      </div>
      <div class="flex-1">
        <div class="flex items-center gap-3 mb-1">
          <h4 class="font-display font-semibold text-lg">${item.title}</h4>
          ${item.live ? '<span class="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-red-500 text-white text-xs font-medium"><span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse-live"></span>EN VIVO</span>' : ''}
        </div>
        <p class="text-[#737373] dark:text-[#A3A3A3]">${item.host}</p>
      </div>
      <button class="p-3 rounded-xl hover:bg-[#F5F5F5] dark:hover:bg-[#1C1C1E] transition-colors" onclick="togglePlayback()">
        <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z"/>
        </svg>
      </button>
    </div>
  `).join('');
}

function renderClips() {
  const container = document.getElementById('clips-container');
  if (!container) return;
  
  container.innerHTML = sampleClips.map(clip => `
    <div class="group bg-[#FFFFFF] dark:bg-[#141415] rounded-2xl overflow-hidden border border-[#E5E5E5] dark:border-[#2A2A2C] card-hover">
      <div class="aspect-video bg-gradient-to-br from-secondary/20 to-primary/20 flex items-center justify-center relative">
        <button class="w-16 h-16 rounded-full bg-white/90 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
          <svg class="w-8 h-8 text-primary ml-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z"/>
          </svg>
        </button>
        <div class="absolute bottom-3 right-3 px-2 py-1 bg-black/70 rounded text-white text-sm">${clip.duration}</div>
      </div>
      <div class="p-4">
        <h4 class="font-semibold mb-1 line-clamp-2">${clip.title}</h4>
        <p class="text-sm text-[#737373] dark:text-[#A3A3A3]">${clip.date}</p>
      </div>
    </div>
  `).join('');
}

function renderShows() {
  const container = document.getElementById('shows-container');
  if (!container) return;
  
  container.innerHTML = samplePodcasts.map(show => `
    <div class="group bg-[#FFFFFF] dark:bg-[#141415] rounded-2xl p-6 border border-[#E5E5E5] dark:border-[#2A2A2C] card-hover cursor-pointer">
      <div class="w-full aspect-square rounded-xl bg-gradient-to-br from-secondary to-blue-600 flex items-center justify-center mb-4 shadow-lg shadow-secondary/20">
        <svg class="w-20 h-20 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
        </svg>
      </div>
      <h3 class="font-display font-semibold text-xl mb-2">${show.title}</h3>
      <p class="text-[#737373] dark:text-[#A3A3A3] mb-4 line-clamp-2">${show.description}</p>
      <div class="flex items-center justify-between">
        <span class="text-sm text-[#737373] dark:text-[#A3A3A3]">${show.episodes} episodios</span>
        <button class="px-4 py-2 bg-primary/10 text-primary rounded-lg font-medium text-sm hover:bg-primary hover:text-white transition-colors">
          Ver episodios
        </button>
      </div>
    </div>
  `).join('');
}

function renderEpisodes() {
  const container = document.getElementById('episodes-container');
  if (!container) return;
  
  const filteredEpisodes = state.selectedPodcastCategory === 'all' 
    ? sampleEpisodes 
    : sampleEpisodes.filter(e => e.category === state.selectedPodcastCategory);
  
  container.innerHTML = filteredEpisodes.map(episode => `
    <div class="flex gap-4 p-4 bg-[#F5F5F5] dark:bg-[#1C1C1E] rounded-2xl card-hover">
      <div class="w-20 h-20 rounded-xl bg-gradient-to-br from-primary to-orange-600 flex items-center justify-center flex-shrink-0">
        <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"/>
        </svg>
      </div>
      <div class="flex-1 min-w-0">
        <div class="text-xs text-primary font-medium mb-1">${episode.show}</div>
        <h4 class="font-semibold mb-2 truncate">${episode.title}</h4>
        <div class="flex items-center gap-4 text-sm text-[#737373] dark:text-[#A3A3A3]">
          <span>${episode.duration}</span>
          <span>${episode.date}</span>
          <span>${episode.plays} plays</span>
        </div>
      </div>
      <button class="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center hover:bg-orange-600 transition-colors flex-shrink-0 self-center">
        <svg class="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M8 5v14l11-7z"/>
        </svg>
      </button>
    </div>
  `).join('');
}

function renderNewsGrid() {
  const container = document.getElementById('news-grid-container');
  if (!container) return;
  
  const filteredNews = state.selectedNewsCategory === 'all' 
    ? sampleNews 
    : sampleNews.filter(n => n.category === state.selectedNewsCategory);
  
  container.innerHTML = filteredNews.map(news => `
    <article class="flex gap-4 p-4 bg-[#FFFFFF] dark:bg-[#141415] rounded-2xl border border-[#E5E5E5] dark:border-[#2A2A2C] card-hover cursor-pointer">
      <div class="w-32 h-24 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
        <svg class="w-8 h-8 text-primary/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
        </svg>
      </div>
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-2">
          <span class="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium capitalize">${news.category}</span>
          <span class="text-xs text-[#737373] dark:text-[#A3A3A3]">${news.date}</span>
        </div>
        <h3 class="font-semibold mb-1 line-clamp-2">${news.title}</h3>
        <p class="text-sm text-[#737373] dark:text-[#A3A3A3] line-clamp-2">${news.excerpt}</p>
      </div>
    </article>
  `).join('');
}

function renderTrendingNews() {
  const container = document.getElementById('trending-news');
  if (!container) return;
  
  container.innerHTML = trendingNews.map((news, index) => `
    <div class="flex items-start gap-3 cursor-pointer group">
      <span class="text-2xl font-display font-bold text-[#E5E5E5] dark:text-[#2A2A2C] group-hover:text-primary transition-colors">${String(index + 1).padStart(2, '0')}</span>
      <div>
        <h5 class="font-medium text-sm group-hover:text-primary transition-colors">${news.title}</h5>
        <span class="text-xs text-[#737373] dark:text-[#A3A3A3]">${news.category}</span>
      </div>
    </div>
  `).join('');
}

function renderNewsCategories() {
  const container = document.getElementById('news-categories');
  if (!container) return;
  
  container.innerHTML = newsCategories.map(cat => `
    <div class="flex items-center justify-between cursor-pointer hover:text-primary transition-colors">
      <span class="font-medium">${cat.name}</span>
      <span class="text-sm text-[#737373] dark:text-[#A3A3A3]">${cat.count}</span>
    </div>
  `).join('');
}

function renderTeam() {
  const container = document.getElementById('team-container');
  if (!container) return;
  
  container.innerHTML = sampleTeam.map(member => `
    <div class="text-center group">
      <div class="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
        <svg class="w-16 h-16 text-primary/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
        </svg>
      </div>
      <h4 class="font-display font-semibold text-lg">${member.name}</h4>
      <p class="text-primary text-sm mb-2">${member.role}</p>
      <p class="text-sm text-[#737373] dark:text-[#A3A3A3]">${member.bio}</p>
    </div>
  `).join('');
}

function renderTimeline() {
  const container = document.getElementById('timeline-container');
  if (!container) return;
  
  container.innerHTML = sampleTimeline.map((item, index) => `
    <div class="flex gap-6 ${index !== sampleTimeline.length - 1 ? 'pb-8' : ''}">
      <div class="flex flex-col items-center">
        <div class="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-display font-bold text-sm">${item.year}</div>
        ${index !== sampleTimeline.length - 1 ? '<div class="flex-1 w-0.5 bg-[#E5E5E5] dark:bg-[#2A2A2C] mt-2"></div>' : ''}
      </div>
      <div class="flex-1 pt-2">
        <h4 class="font-display font-semibold text-lg mb-1">${item.title}</h4>
        <p class="text-[#737373] dark:text-[#A3A3A3]">${item.description}</p>
      </div>
    </div>
  `).join('');
}

// ============================================
// UTILITIES
// ============================================

function updateClock() {
  const now = new Date();
  const timeString = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  
  const liveTimeEl = document.getElementById('live-current-time');
  if (liveTimeEl) {
    liveTimeEl.textContent = timeString;
  }
}

// ============================================
// EXPORTS FOR FIRESTORE/CLOUDINARY INTEGRATION
// ============================================

// You can call these functions from your Firestore integration:
// 
// window.CronoPlay = {
//   updateNews: (newsArray) => { sampleNews = newsArray; renderHomeNews(); renderNewsGrid(); },
//   updatePodcasts: (podcastArray) => { samplePodcasts = podcastArray; renderHomePodcasts(); renderShows(); },
//   updateEpisodes: (episodeArray) => { sampleEpisodes = episodeArray; renderEpisodes(); },
//   updateSchedule: (scheduleArray) => { sampleSchedule = scheduleArray; renderHomeSchedule(); renderUpcomingShows(); renderWeeklySchedule(); },
//   updateClips: (clipsArray) => { sampleClips = clipsArray; renderClips(); },
//   updateTeam: (teamArray) => { sampleTeam = teamArray; renderTeam(); },
//   updateCurrentShow: (show) => { state.currentShow = show; /* Update player UI */ },
//   setStreamUrl: (url) => { document.getElementById('audio-player').src = url; }
// };

window.CronoPlay = {
  // Update functions for Firestore integration
  updateNews: function(newsArray) {
    Object.assign(sampleNews, newsArray);
    renderHomeNews();
    renderNewsGrid();
  },
  updatePodcasts: function(podcastArray) {
    Object.assign(samplePodcasts, podcastArray);
    renderHomePodcasts();
    renderShows();
  },
  updateEpisodes: function(episodeArray) {
    Object.assign(sampleEpisodes, episodeArray);
    renderEpisodes();
  },
  updateSchedule: function(scheduleArray) {
    Object.assign(sampleSchedule, scheduleArray);
    renderHomeSchedule();
    renderUpcomingShows();
    renderLiveUpcomingShows();
    renderWeeklySchedule();
  },
  updateClips: function(clipsArray) {
    Object.assign(sampleClips, clipsArray);
    renderClips();
  },
  updateTeam: function(teamArray) {
    Object.assign(sampleTeam, teamArray);
    renderTeam();
  },
  updateCurrentShow: function(show) {
    state.currentShow = show;
    document.getElementById('player-title').textContent = show.title;
    document.getElementById('player-subtitle').textContent = show.host || 'En vivo';
    document.getElementById('radio-show-title').textContent = show.title;
    document.getElementById('radio-show-host').textContent = show.host;
  },
  setStreamUrl: function(url) {
    document.getElementById('audio-player').src = url;
  },
  play: function() {
    if (!state.isPlaying) togglePlayback();
  },
  pause: function() {
    if (state.isPlaying) togglePlayback();
  },
  navigateTo: navigateTo
};
