# lthieu.dev

## Deploy

This repo is configured to deploy as a static Next.js export to Cloudflare Pages from GitHub Actions.

Create the Cloudflare Pages project once in the dashboard first, then set the GitHub secrets and variable below.

### GitHub secrets

- `CLOUDFLARE_ACCOUNT_ID`: your Cloudflare account ID
- `CLOUDFLARE_API_TOKEN`: an API token with `Account / Cloudflare Pages / Edit`

### GitHub variable

- `CLOUDFLARE_PAGES_PROJECT`: your Cloudflare Pages project name

### Workflow

- Pull requests run `pnpm install --frozen-lockfile` and `pnpm run build`
- Pushes to `main` build the static export into `out/` and deploy it to Cloudflare Pages

## Why this setup

This portfolio currently fits static export well:

- the app uses the App Router but does not depend on server actions, route handlers, cookies, rewrites, or other server-only features
- the theme switch and clock are client-side only, so they still work after export
- `next/image` is configured with `images.unoptimized = true`, which avoids relying on the default image optimization server that static export does not support

## Build notes

- `next.config.ts` uses `output: 'export'`, so `next build` emits the deployable site into `out/`
- `src/app/layout.tsx` exports `dynamic = 'error'` to fail fast if a future change introduces unsupported dynamic server behavior
- For a small portfolio, this is a better fit than deploying the full app runtime to Cloudflare Workers unless you later add SSR, middleware, route handlers, or other dynamic features
