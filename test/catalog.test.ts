import { createIntl } from '@formatjs/intl'
import { po } from 'gettext-parser'
import i18next from 'i18next'
import { setupI18n } from '@lingui/core'
import { compileMessage } from '@lingui/message-utils/compileMessage'
import { describe, expect, it } from 'vitest'
import { poToTannin, toI18nextJson, toIcuJson, toPot } from '../src/catalog.js'
import { format, type Message } from '../src/index.js'
import { messages, polishPo } from './fixtures.js'

const all: Message[] = Object.values(messages)
const cases: [Message, Record<string, string | number>][] = [
  [messages.greeting, { name: 'Ada & <Bo>' }],
  [messages.pair, { a: 1, b: 2 }],
  [messages.untranslated, { thing: 'milk' }],
  [messages.openVerb, {}],
  [messages.files, { count: 1 }],
  [messages.files, { count: 7 }],
  [messages.ranked, { count: 1 }],
  [messages.ranked, { count: 3 }],
]

describe('toPot', () => {
  const pot = toPot(all)

  it('writes a UTF-8 template header', () => {
    expect(pot).toMatch(/^msgid ""\nmsgstr "Content-Type: text\/plain; charset=utf-8\\n"\n\n/)
  })

  it('writes descriptions, the brace-format flag, context and plurals', () => {
    expect(pot).toContain(
      '#. Shown on sign-in.\n#, python-brace-format\nmsgid "Hello, {name}"\nmsgstr ""',
    )
    expect(pot).toContain('msgctxt "verb"\nmsgid "Open"\nmsgstr ""')
    expect(pot).not.toMatch(/python-brace-format\nmsgctxt "verb"/)
    expect(pot).toContain(
      'msgid "{count} file"\nmsgid_plural "{count} files"\nmsgstr[0] ""\nmsgstr[1] ""',
    )
  })

  it('parses back with every message', () => {
    const parsed = po.parse(pot).translations
    expect(parsed['verb']?.['Open']?.msgctxt).toBe('verb')
    expect(parsed['adjective']?.['Open']).toBeDefined()
    expect(parsed['']?.["Don't forget {thing}"]).toBeDefined()
  })
})

describe('toIcuJson', () => {
  it('writes plurals and escapes apostrophes and #', () => {
    expect(toIcuJson(all)).toMatchObject({
      'test.greeting': 'Hello, {name}',
      'test.untranslated': "Don''t forget {thing}",
      'test.files': '{count, plural, one {{count} file} other {{count} files}}',
      'test.ranked': "{count, plural, one {'#'{count} item} other {'#'{count} items}}",
    })
  })

  it('renders like format() through FormatJS', () => {
    const intl = createIntl({ locale: 'en', messages: toIcuJson(all) })
    for (const [m, values] of cases)
      expect(intl.formatMessage({ id: m.id }, values)).toBe(format(m, values))
  })

  it('renders like format() through Lingui', () => {
    const i18n = setupI18n({ locale: 'en', messages: { en: toIcuJson(all) } })
    i18n.setMessagesCompiler(compileMessage)
    // Lingui ignores ICU's '#' quoting, so a literal # in a plural renders as the count there.
    const withoutHash = cases.filter(([m]) => m !== messages.ranked)
    for (const [m, values] of withoutHash) expect(i18n._(m.id, values)).toBe(format(m, values))
  })
})

describe('toI18nextJson', () => {
  it('writes _one/_other keys and {{name}} placeholders', () => {
    expect(toI18nextJson(all)).toMatchObject({
      'test.greeting': 'Hello, {{name}}',
      'test.files_one': '{{count}} file',
      'test.files_other': '{{count}} files',
    })
  })

  it('renders like format() through i18next', async () => {
    const i18n = i18next.createInstance()
    await i18n.init({
      lng: 'en',
      resources: { en: { translation: toI18nextJson(all) } },
      interpolation: { escapeValue: false },
    })
    for (const [m, values] of cases)
      expect(i18n.t(m.id, { ...values, keySeparator: false, nsSeparator: false })).toBe(
        format(m, values),
      )
  })
})

describe('poToTannin', () => {
  const data = poToTannin(polishPo)

  it('keeps the language and plural forms', () => {
    expect(data.messages?.['']).toEqual({
      domain: 'messages',
      lang: 'pl',
      plural_forms:
        'nplurals=3; plural=(n==1 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2);',
    })
  })

  it('keys context with \\u0004 and keeps every plural form', () => {
    expect(data.messages?.['verb\u0004Open']).toEqual(['Otwórz'])
    expect(data.messages?.['{count} file']).toEqual([
      '{count} plik',
      '{count} pliki',
      '{count} plików',
    ])
  })

  it('drops untranslated and fuzzy entries', () => {
    expect(data.messages?.["Don't forget {thing}"]).toBeUndefined()
    expect(data.messages?.['Never shown']).toBeUndefined()
  })
})
