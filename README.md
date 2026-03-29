# Cronos Sport Media — Sitio Web Oficial

Sitio web oficial de **Cronos Sport Media**, agencia de noticias deportiva que forma periodistas y conecta a la audiencia venezolana con el deporte a través de radio en streaming, podcasts y transmisiones en vivo.

🌐 **Sitio en vivo**: [cronossportmedia.github.io](https://cronossportmedia.github.io)

---

## Stack técnico

HTML estático + CSS puro, sin frameworks ni dependencias. Hosteado en GitHub Pages con deploy automático al hacer push a `main`.

## Páginas

| Archivo | Descripción |
|---------|-------------|
| `index.html` | Home — hero, radio, qué hacemos, podcasts |
| `en-vivo.html` | Transmisiones — radio en vivo y YouTube Live |
| `podcast.html` | Catálogo de episodios y plataformas |
| `nosotros.html` | Misión, submarcas, valores y equipo |
| `contacto.html` | Formulario de contacto (Formspree) |

## Cómo actualizar el sitio

```bash
git clone https://github.com/cronossportmedia/cronossportmedia.github.io
# editar los archivos HTML necesarios
git add .
git commit -m "tipo: descripción breve"
git push origin main
# GitHub Pages despliega automáticamente en ~60 segundos
```

### Convenciones de commits

| Prefijo | Uso |
|---------|-----|
| `feat:` | Nueva funcionalidad o página |
| `fix:` | Corrección de bug o error visual |
| `content:` | Actualización de textos o contenido |
| `style:` | Cambios visuales (CSS, colores) |
| `docs:` | Cambios en documentación |
| `chore:` | Mantenimiento y limpieza |

## Pendientes antes del lanzamiento completo

- [ ] Reproductor de radio (proveedor de streaming por confirmar)
- [ ] URLs de redes sociales en el footer
- [ ] Logo oficial SVG
- [ ] Favicon
- [ ] Página de contacto (`contacto.html`) — requiere cuenta en Formspree
- [ ] Datos del equipo en `nosotros.html`
- [ ] Títulos y descripciones de episodios en `podcast.html`

---

© 2026 Cronos Sport Media. Todos los derechos reservados.
