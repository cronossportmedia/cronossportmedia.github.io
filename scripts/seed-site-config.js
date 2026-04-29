/**
 * seed-site-config.js
 *
 * Script para crear los documentos iniciales en la colección `site_config` de Firestore.
 * Proyecto Firebase: cronossportmedia-e07ef
 *
 * USO:
 *   1. Abre https://cronoplay.com/admin/dashboard.html logueado como super_admin.
 *   2. Abre DevTools → Console.
 *   3. Pega este script completo en la consola.
 *   4. Espera a que imprima "✅ Seed completado".
 *
 * NOTA: Usa la instancia de Firebase ya autenticada en la página.
 */

(async () => {
  const { getApp } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js");
  const { getFirestore, doc, setDoc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js");
  const { getAuth } = await import("https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js");

  // Usar la app ya inicializada en la página (con la sesión activa)
  const app = getApp();
  const db  = getFirestore(app);
  const auth = getAuth(app);

  // Verificar que hay usuario logueado
  const user = auth.currentUser;
  if (!user) {
    console.error("❌ No hay usuario logueado. Abre este script desde admin/dashboard.html estando logueado como super_admin.");
    return;
  }
  console.log(`👤 Usuario autenticado: ${user.email} (${user.uid})`);

  const documents = {
    hero: {
      title: "Donde el deporte se cuenta de verdad",
      subtitle: "Noticias, radio en vivo, podcasts y transmisiones deportivas desde Venezuela para el mundo",
      cta_text: "Escuchar en vivo",
      cta_url: "/en-vivo.html",
      updated_at: serverTimestamp(),
      updated_by: user.uid
    },

    banner: {
      activo: false,
      posicion: "below",
      autoplay: true,
      autoplay_interval: 5000,
      transition: "slide",
      slides: [],
      updated_at: serverTimestamp(),
      updated_by: user.uid
    },

    social_links: {
      youtube: "https://www.youtube.com/@CronoPlayVzla",
      instagram: "",
      twitter: "",
      tiktok: "",
      updated_at: serverTimestamp(),
      updated_by: user.uid
    },

    sections_visibility: {
      show_radio_player: true,
      show_podcast_section: true,
      show_news_section: true,
      show_sponsors: false,
      show_banner: false,
      show_stats_bar: false,
      updated_at: serverTimestamp(),
      updated_by: user.uid
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
      updated_by: user.uid
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
