import type { ThemeRegistration } from 'shiki'

type Palette = {
  bg: string
  text: string
  comment: string
  keyword: string
  fn: string
  string: string
}

// Three-colour syntax theme from the blog post design: keywords and numbers in the accent,
// function names in lilac, comments in the meta grey, everything else in the body colour.
const theme = (name: string, type: 'dark' | 'light', c: Palette): ThemeRegistration => ({
  name,
  type,
  colors: { 'editor.background': c.bg, 'editor.foreground': c.text },
  tokenColors: [
    { settings: { foreground: c.text } },
    { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: c.comment } },
    {
      scope: [
        'keyword',
        'storage',
        'constant.numeric',
        'constant.language',
        'support.type.primitive',
      ],
      settings: { foreground: c.keyword },
    },
    {
      scope: ['entity.name.function', 'support.function', 'meta.function-call variable'],
      settings: { foreground: c.fn },
    },
    { scope: ['string'], settings: { foreground: c.string } },
    { scope: ['keyword.operator', 'punctuation'], settings: { foreground: c.text } },
  ],
})

export const codeThemes = {
  dark: theme('lthieu-dark', 'dark', {
    bg: '#191919',
    text: '#EDEDED',
    comment: '#7C7C7C',
    keyword: '#8CC4F2',
    fn: '#D7C3F5',
    string: '#C9D9A8',
  }),
  light: theme('lthieu-light', 'light', {
    bg: '#F3F3F1',
    text: '#1A1A1A',
    comment: '#737373',
    keyword: '#2F6FB0',
    fn: '#7A4CB8',
    string: '#4F7A28',
  }),
}
