import { po, type GetTextTranslationRecord } from 'gettext-parser'
import type { LocaleData } from './gettext.js'
import { icu } from './icu.js'
import type { Message } from './types.js'

const hasPlaceholder = (m: Message) => /\{\w+\}/.test(m.message + (m.plural ?? ''))

/** A gettext template: msgctxt, msgid_plural, `#.` descriptions, `#, python-brace-format`. */
export function toPot(messages: Message[]): string {
  const translations: GetTextTranslationRecord = { '': { '': { msgid: '', msgstr: [''] } } }
  for (const m of messages) {
    const context = m.context ?? ''
    // shortcut: equal context+msgid is one gettext entry, so the last description wins.
    ;(translations[context] ??= {})[m.message] = {
      ...(m.context === undefined ? {} : { msgctxt: m.context }),
      msgid: m.message,
      ...(m.plural === undefined ? {} : { msgid_plural: m.plural }),
      msgstr: m.plural === undefined ? [''] : ['', ''],
      comments: {
        ...(m.description === undefined ? {} : { extracted: m.description }),
        ...(hasPlaceholder(m) ? { flag: 'python-brace-format' } : {}),
      },
    }
  }
  return po
    .compile({
      charset: 'utf-8',
      headers: { 'Content-Type': 'text/plain; charset=UTF-8' },
      translations,
    })
    .toString('utf8')
}

/** id → ICU MessageFormat, for FormatJS, ember-intl and Lingui. */
export function toIcuJson(messages: Message[]): Record<string, string> {
  return Object.fromEntries(messages.map(m => [m.id, icu(m)]))
}

/** id → i18next string: `id_one` / `id_other` for plurals, `{{name}}` placeholders. */
export function toI18nextJson(messages: Message[]): Record<string, string> {
  const braces = (text: string) => text.replace(/\{(\w+)\}/g, '{{$1}}')
  return Object.fromEntries(
    messages.flatMap(m =>
      m.plural === undefined
        ? [[m.id, braces(m.message)]]
        : [
            [`${m.id}_one`, braces(m.message)],
            [`${m.id}_other`, braces(m.plural)],
          ],
    ),
  )
}

/** A translated .po file as Tannin (Jed 1.x) locale data, for `msgid/gettext`. */
export function poToTannin(file: string | Buffer): LocaleData {
  const domain = 'messages'
  const { headers, translations } = po.parse(file)
  const entries: LocaleData[string] = {
    '': { domain, lang: headers['Language'] ?? '', plural_forms: headers['Plural-Forms'] ?? '' },
  }
  for (const [context, byId] of Object.entries(translations))
    for (const t of Object.values(byId)) {
      const untranslated = t.msgid === '' || t.msgstr.every(s => s === '')
      if (untranslated || t.comments?.flag?.split(',').some(f => f.trim() === 'fuzzy')) continue
      entries[context ? `${context}\u0004${t.msgid}` : t.msgid] = t.msgstr
    }
  return { [domain]: entries }
}
