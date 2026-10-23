# lthieu.dev

Personal site. TanStack Start (React 19, Vite), prerendered to plain static files.

```sh
pnpm dev        # http://localhost:3000
pnpm build      # static site in dist/client
pnpm preview
pnpm lint && pnpm typecheck
```

## Where things live

| To change…                         | Edit                                             |
| ---------------------------------- | ------------------------------------------------ |
| Name, email, socials, "Now:" line  | `src/data/site.ts`                               |
| Selected work, case studies        | `src/data/projects.ts` (a `caseStudy` adds `/work/<slug>`) |
| Side projects                      | `src/data/projects.ts` (`sideProjects`)          |
| Experience, Stack on the home page | `src/data/about.ts`                              |
| One-page resume (`/resume`)        | `src/data/resume.ts`                             |
| Blog posts (hidden)                | `content/posts/*.mdx` (see below)                |
| Colours, type scale, fonts, motion | `src/styles/app.css` (`@theme` = dark, `[data-theme="light"]` = light) |
| Dither shaders                     | `src/components/shaders/*.frag`                  |

The design source is `design/portfolio.pen` (open it in Pen). Token values in `app.css` mirror its variables.

### Posts (hidden for now)

Writing is switched off: the routes live in `src/routes/-writing/` (TanStack Router ignores `-`
folders, and `tsconfig.json` skips them). To turn it back on:

1. Rename `src/routes/-writing` to `src/routes/writing` and move `rss[.]xml.ts` back to `src/routes/`.
2. Restore the Writing section on the home page, the Writing link on the 404 page, the RSS `<link>`
   in `__root.tsx`, `/rss.xml` in `vite.config.ts` pages, and `/writing` + posts in the sitemap
   (`git log -S "Coming soon · all drafts"` finds the commit that removed them).
3. Drop `src/routes/-*` from `tsconfig.json` `exclude`.


Frontmatter is checked by the schema in `content-collections.ts`:

```mdx
---
title: One speed limit, many callers
summary: One line for lists and meta tags.
tag: Backend            # Backend | Frontend | Mobile | Side project
draft: true             # shows "Draft" on the post
featured: true          # listed on the home page
order: 1                # lower comes first
---
```

A file with frontmatter only (no body) is listed as "coming soon" and isn't linked. Code fences take a
title: ` ```ts title="budget.ts" `. `<Callout>` is available in MDX.

## Deploy (Cloudflare Pages)

- Build command: `pnpm run build`
- Build output directory: `dist/client`
- Framework preset: None

`404.html`, `sitemap.xml` and `robots.txt` are generated into the output.

## Notes

- Every page is prerendered; links are crawled from `/`. A page nothing links to won't be built: add it
  to `pages` in `vite.config.ts`.
- Post data goes through static server functions (`src/lib/posts.ts`), cached as JSON at build time,
  so MDX bodies stay out of the JS bundle.
- 404 hydration: see `src/lib/missed-url.ts`.
- Theme: light by default (`DEFAULT_THEME` in `src/lib/theme.ts`); the sun/moon button switches and
  remembers the choice. An inline script applies a saved choice before paint. Use the `light:` variant for
  one-off light styles; prefer adding a token to `app.css`. Shaders read tokens at runtime via `cssColor`.
