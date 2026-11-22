/**
 * The gettext adapter: a translator over `.po` files converted with `msgid po2json`.
 *
 * @module msgid/gettext
 */
import Tannin, { type TanninLocaleData } from 'tannin'
import { format } from './format.js'
import type { Message, Translator } from './types.js'

/** Tannin (Jed 1.x) locale data: domain → key (`context\u0004msgid` or `msgid`) → forms. */
export type LocaleData = Record<
  string,
  Record<string, string[] | { domain?: string; lang?: string; plural_forms?: string }>
>

/** A translator over gettext locale data from `msgid po2json`; the locale is its `lang` header. */
export function gettext(data: LocaleData): Translator {
  const domain = data['messages'] ?? {}
  const header = domain['']
  const lang = header && !Array.isArray(header) ? header.lang : undefined
  if (!lang) throw new Error('msgid/gettext: the locale data has no lang in its "" header')
  // gettext writes pt_BR or sr@latin; Intl wants BCP 47. Throws on a malformed tag.
  const [locale = lang] = Intl.getCanonicalLocales(lang.replace(/@.*/, '').replace(/_/g, '-'))
  // Tannin types each entry as [string, string], but a language can have more plural forms.
  const forms = new Tannin(data as TanninLocaleData)
  return {
    locale,
    t(message: Message, values: Record<string, unknown> = {}) {
      const key = message.context ? `${message.context}\u0004${message.message}` : message.message
      const entry = domain[key]
      if (!Array.isArray(entry) || entry.every(form => form === '')) return format(message, values)
      const { count } = values
      const text =
        message.plural !== undefined && typeof count === 'number'
          ? forms.dcnpgettext('messages', message.context, message.message, message.plural, count)
          : forms.dcnpgettext('messages', message.context, message.message)
      return format({ id: message.id, message: text }, values)
    },
  }
}
