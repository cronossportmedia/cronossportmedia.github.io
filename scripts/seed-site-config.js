/**
 * seed-site-config.js
 *
 * Script para crear los documentos iniciales en la colección `site_config` de Firestore.
 * Proyecto Firebase: cronossportmedia-e07ef
 *
 * USO:
 *   1. Abre la consola del navegador en https://cronoplay.com (o localhost)
 *      estando logueado como super_admin.
 *   2. Pega este script completo en la consola.
 *   3. Espera a que imprima "✅ Seed completado".
 *
 * NOTA: Usa import() dinámico para funcionar en la consola del navegador.
 */

(async () => {
  const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js");
  const { getFirestore, doc, setDoc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");

  const firebaseConfig = {
    apiKey:            "AIzaSyACGQlXKkdJsvsuIn77ZQ06SghlTvUTDLI",
    authDomain:        "cronossportmedia-e07ef.firebaseapp.com",
    projectId:         "cronossportmedia-e07ef",
    storageBucket:     "cronossportmedia-e07ef.firebasestorage.app",
    messagingSenderId: "898405181430",
    appId:             "1:898405181430:web:12ad5dc59fa049c26609d7"
  };

  const app = initializeApp(firebaseConfig, "seed-app");
  const db  = getFirestore(app);

  const SUPER_ADMIN_UID = "fLoZr3oYaGhB2Lp7U6Hodku5xkD2";

  const documents = {
    hero: {
      title: "Donde el deporte se cuenta de verdad",
      subtitle: "Noticias, radio en vivo, podcasts y transmisiones deportivas desde Venezuela para el mundo",
      cta_text: "Escuchar en vivo",
      cta_url: "/en-vivo.html",
      updated_at: serverTimestamp(),
      updated_by: SUPER_ADMIN_UID
    },

    banner: {
      activo: false,
      posicion: "below",
      autoplay: true,
      autoplay_interval: 5000,
      transition: "slide",
      slides: [],
      updated_at: serverTimestamp(),
      updated_by: SUPER_ADMIN_UID
    },

    social_links: {
      youtube: "https://www.youtube.com/@CronoPlayVzla",
      instagram: "",
      twitter: "",
      tiktok: "",
      updated_at: serverTimestamp(),
      updated_by: SUPER_ADMIN_UID
    },

    sections_visibility: {
      show_radio_player: true,
      show_podcast_section: true,
      show_news_section: true,
      show_sponsors: false,
      show_banner: false,
      show_stats_bar: false,
      updated_at: serverTimestamp(),
      updated_by: SUPER_ADMIN_UID
    },

    live_players: {
      active: true,
      players: [
        {
          id: "contacto-937",
          name: "Contacto 93.7 FM",
          type: "audio",
          stream_url: "https://laradiossl.online:10058/stream/1//;type=mp3",
          description: "Radio aliada. Transmisiones especiales de fútbol venezolano.",
          active: false,
          order: 1,
          live_indicator: "AL AIRE"
        }
      ],
      updated_at: serverTimestamp(),
      updated_by: SUPER_ADMIN_UID
    }
  };

  console.log("🌱 Iniciando seed de site_config...");

  for (const [docId, data] of Object.entries(documents)) {
    try {
      await setDoc(doc(db, "site_config", docId), data);
      console.log(`  ✅ site_config/${docId} creado`);
    } catch (err) {
      console.error(`  ❌ Error en site_config/${docId}:`, err.message);
    }
  }

  console.log("\n✅ Seed completado. Verifica en Firebase Console:");
  console.log("   https://console.firebase.google.com/project/cronossportmedia-e07ef/firestore/databases/-default-/data/~2Fsite_config");
})();
