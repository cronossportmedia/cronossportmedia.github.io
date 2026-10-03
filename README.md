# Crono Play — Sitio web oficial

Sitio web de **Crono Play**, medio venezolano de deportes y entretenimiento: radio en vivo 24/7, noticias,
transmisiones en vivo, eventos y podcast.

🌐 **[cronoplay.com](https://cronoplay.com)** · *"Donde el deporte se cuenta de verdad"*

## Qué hay en el sitio

| Página | Contenido |
|---|---|
| `index.html` | Inicio: hero, banner carrusel, radio en vivo (con popup de bienvenida), últimas noticias |
| `en-vivo.html` | Radio en vivo, YouTube Live y reproductores de emisoras aliadas |
| `noticias.html` · `noticia.html?slug=` | Listado y detalle de noticias |
| `eventos.html` · `evento.html?slug=` | Listado y micrositio de cada evento |
| `podcast.html` · `nosotros.html` · `contacto.html` | Podcast, quiénes somos, contacto |
| `admin/` | Panel de administración (requiere cuenta) |

## Stack

- **HTML + CSS + JavaScript vanilla** (módulos ES). Sin frameworks ni build: cada página es un archivo autocontenido.
- **GitHub Pages** para el hosting. Al hacer merge a `main` se despliega en ~1 minuto.
- **Firebase** (Auth + Firestore) para noticias, configuración del sitio y eventos. **Cloudinary** para imágenes y audio.
- **Zeno.fm** (radio), **YouTube Data API** (detección de lives), **Formspree** (formulario de contacto).

## Desarrollo local

Requiere Node.js 18+.

```bash
git clone https://github.com/cronossportmedia/cronossportmedia.github.io
cd cronossportmedia.github.io
npm run dev        # http://localhost:5510
```

- El servidor (`scripts/dev-server.js`) no tiene dependencias. Si el puerto está ocupado: `PORT=5511 npm run dev`.
- No abras los archivos con `file://`: los módulos y Firestore necesitan `http`.
- En localhost es normal ver un error 403 de la API de YouTube.
- `npm install` + `npm run sitemap` regeneran `sitemap.xml` (también lo hace un GitHub Action cada día).

## Contribuir

1. Crea una rama desde `main` actualizado: `feat/…`, `fix/…`, `perf/…`.
2. Commits con prefijo: `feat:`, `fix:`, `perf:`, `style:`, `content:`, `docs:`, `chore:`, `refactor:`.
3. Prueba en modo claro y oscuro, en móvil (375px) y en escritorio.
4. Abre un Pull Request a `main`. El mantenedor revisa y hace el merge. Nunca hagas push directo a `main`.

Los textos del sitio van en español venezolano (tuteo: *escucha, síguenos*).

**Agentes de IA:** lean [AGENTS.md](AGENTS.md). La documentación interna del proyecto está en un repositorio privado,
solo para el equipo.

---

© 2026 Crono Play. Todos los derechos reservados.
