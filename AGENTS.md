# AGENTS.md — Crono Play website

Instructions for AI coding agents (Claude Code, Codex, Cursor, Copilot, Gemini, …) working in this repo.

> **Full project documentation is private**, in the sibling repo `../cronomedia-projectdocs`
> (`github.com/cronossportmedia/cronomedia-projectdocs`). If you have access, **read `../cronomedia-projectdocs/AGENTS.md` first**
> and follow its session protocol. If you don't have access, follow the rules below and ask the maintainer before anything non-trivial.
> This repo is public and GitHub Pages serves every file in it: **never add internal docs, plans, accounts or notes here.**

## What this is

The website and CMS of Crono Play (`cronoplay.com`): a static site on GitHub Pages, with Firebase Auth + Firestore and Cloudinary as a serverless backend.
Merging to `main` deploys in about a minute.

## Hard rules

1. **No frameworks or build tools.** Plain HTML + CSS + vanilla JS (ES modules). No React/Vue/Astro/Tailwind, no bundler, no new CDNs without approval.
2. **Never commit or push without explicit approval.** Report the branch (`git branch --show-current`) and the changes, then wait for a "yes" each time.
   Never push to `main`. Use a branch → PR → the maintainer merges.
3. **Never write to production data to test.** Localhost talks to the production Firestore/Cloudinary.
4. **Never invent data** (URLs, names, schedules, credentials). Ask, or write `[PENDIENTE CONFIRMAR]`.
5. **Mobile-first.** Check at 375px. Touch targets ≥ 44px. Light and dark themes.
6. **UI copy is Venezuelan Spanish with tuteo** (*escucha, síguenos*), never voseo (*escuchá, seguinos*).
7. **The admin (`admin/`) is used by non-technical people:** plain Spanish labels, no jargon, human error messages, confirm destructive actions.
8. **Read the whole page before editing.** Change only what was asked.

## Code facts

- Each page is self-contained: inline `<style>` + inline `<script>`. Header, nav, footer and radio player are **duplicated in every page**, so apply shared changes everywhere.
- Themes: public pages put **dark** tokens on `:root` and override with `[data-theme="light"]`. Admin pages put **light** tokens on `:root` and override with `[data-theme="dark"]`. Both store `localStorage['crono-theme']`.
- `js/main.js`, `js/special-events.js` and `public/` aren't loaded by any page (leftovers).
- The Firebase web config in `js/firebase-config.js` is public by design. Security is in Firestore Security Rules (Firebase Console).
- One YouTube API `403` on localhost is expected (the key is restricted to the production domain).
- A bot commits `chore(sitemap): …` to `main` daily. Merge `origin/main` before opening a PR.

## Commands

```bash
npm run dev       # http://localhost:5510 (zero-dependency static server). PORT=5511 npm run dev if busy
npm install       # only for the sitemap script
npm run sitemap   # regenerate sitemap.xml from active events (read-only)
```

Use port 5510, not 3000/8080, and never kill other Node processes. There are no automated tests. Verify in the browser (light/dark, mobile/desktop, clean console).

Commits: `feat:` `fix:` `perf:` `style:` `content:` `docs:` `chore:` `refactor:` `auth:` (scopes welcome: `feat(radio): …`). Branches: `feat/…`, `fix/…`, `perf/…`. Don't delete `backup/*` branches.
