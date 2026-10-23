// The static host serves 404.html (prerendered at /404) for every unknown URL. Hydrating it at the
// real URL would render a different route tree, so we hydrate at the path the HTML was rendered
// for and put the visitor's URL back afterwards. The not-found view marks that path with
// `data-rendered-at`; in dev the server renders at the real URL, so nothing needs to change.

let missed: string | null = null

/** Client entry, before hydration. */
export function rememberMissedUrl() {
  const renderedAt = document.querySelector('[data-rendered-at]')?.getAttribute('data-rendered-at')
  if (!renderedAt || renderedAt === location.pathname) return
  missed = location.pathname + location.search + location.hash
  history.replaceState(history.state, '', renderedAt)
}

/** Not-found view, after hydration: show the URL the visitor actually typed again. */
export function restoreMissedUrl() {
  if (missed) history.replaceState(history.state, '', missed)
  missed = null
}
