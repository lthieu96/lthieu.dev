/** Props that open off-site links in a new tab. Mail and on-site links are left alone. */
export const external = (href: string) =>
  /^https?:\/\//.test(href) ? ({ target: '_blank', rel: 'noreferrer' } as const) : {}
