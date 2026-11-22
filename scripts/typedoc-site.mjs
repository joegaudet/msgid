// TypeDoc plugin for the API reference at joegaudet.com/msgid/api/: each page gets the marketing
// site's link-preview card and JSON-LD, which TypeDoc has no option for (it writes the canonical
// link and sitemap itself, from hostedBaseUrl).
import { JSX } from 'typedoc'

const SITE = 'https://joegaudet.com/msgid/'
const CARD = `${SITE}social-card.png`

export function load(app) {
  app.renderer.hooks.on('head.end', context => {
    const base = app.options.getValue('hostedBaseUrl')
    const url = new URL(context.page.url.replace(/(^|\/)index\.html$/, '$1'), base).href
    const title = context.page.model.isProject?.()
      ? 'msgid API reference'
      : `${context.page.model.name} · msgid API`
    const description = context.page.model.comment?.summary
      .map(part => part.text)
      .join('')
      .split('\n\n')[0]
    const ld = {
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: title,
      url,
      isPartOf: { '@type': 'WebSite', name: 'msgid', url: SITE },
      about: {
        '@type': 'SoftwareSourceCode',
        name: 'msgid',
        codeRepository: 'https://github.com/joegaudet/msgid',
        programmingLanguage: 'TypeScript',
      },
      author: { '@type': 'Person', name: 'Joe Gaudet', url: 'https://joegaudet.com/' },
    }
    return JSX.createElement(
      JSX.Fragment,
      null,
      JSX.createElement('meta', { property: 'og:type', content: 'article' }),
      JSX.createElement('meta', { property: 'og:site_name', content: 'msgid' }),
      JSX.createElement('meta', { property: 'og:title', content: title }),
      description &&
        JSX.createElement('meta', { property: 'og:description', content: description }),
      JSX.createElement('meta', { property: 'og:url', content: url }),
      JSX.createElement('meta', { property: 'og:image', content: CARD }),
      JSX.createElement('meta', { property: 'og:image:width', content: '1200' }),
      JSX.createElement('meta', { property: 'og:image:height', content: '630' }),
      JSX.createElement('meta', { name: 'twitter:card', content: 'summary_large_image' }),
      JSX.createElement('link', {
        rel: 'alternate',
        type: 'text/plain',
        href: `${SITE}llms.txt`,
        title: 'llms.txt',
      }),
      JSX.createElement(
        'script',
        { type: 'application/ld+json' },
        JSX.createElement(JSX.Raw, { html: JSON.stringify(ld).replaceAll('<', '\\u003c') }),
      ),
    )
  })
}
