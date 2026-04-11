# lthieu.dev

## Deploy

This repo is configured to deploy as a static Next.js export on Cloudflare Pages using Cloudflare's Git integration.

Suggested Cloudflare Pages settings:

- Framework preset: `None`
- Build command: `pnpm run build`
- Build output directory: `out`
- Root directory: `/`

## Why this setup

This portfolio currently fits static export well:

- the app uses the App Router but does not depend on server actions, route handlers, cookies, rewrites, or other server-only features
- the theme switch and clock are client-side only, so they still work after export
- `next/image` is configured with `images.unoptimized = true`, which avoids relying on the default image optimization server that static export does not support

## Build notes

- `next.config.ts` uses `output: 'export'`, so `next build` emits the deployable site into `out/`
- `src/app/layout.tsx` exports `dynamic = 'error'` to fail fast if a future change introduces unsupported dynamic server behavior
- `pnpm-workspace.yaml` includes `packages: ['.']` because Cloudflare runs `pnpm install` in workspace mode when this file exists
- For a small portfolio, this is a better fit than deploying the full app runtime to Cloudflare Workers unless you later add SSR, middleware, route handlers, or other dynamic features
