import { beforeAll, describe, expect, it } from 'vitest'
import { format, type Message, type Translator } from '../src/index.js'
import { messages } from './fixtures.js'

/** Each adapter, over its own catalog holding the Polish in fixtures.ts, plus an empty English one. */
export function contract(
  name: string,
  setup: () => Promise<{ pl: Translator; en: Translator }> | { pl: Translator; en: Translator },
) {
  describe(`${name}: the msgid contract`, () => {
    let pl: Translator
    let en: Translator
    beforeAll(async () => ({ pl, en } = await setup()))

    it('reports its locale', () => {
      expect(pl.locale).toBe('pl')
      expect(en.locale).toBe('en')
    })

    it('falls back to format() English when the catalog lacks a message or has it empty', () => {
      const cases: [Message, Record<string, unknown>?][] = [
        [messages.untranslated, { thing: 'milk & <eggs>' }],
        [messages.untranslated, {}],
        [messages.untranslated],
        [messages.ranked, { count: 3 }],
        [messages.ranked, { count: 1 }],
      ]
      for (const [m, values] of cases) expect(pl.t(m, values)).toBe(format(m, values))
      for (const [m, values] of cases) expect(en.t(m, values)).toBe(format(m, values))
    })

    it('translates, without escaping values', () => {
      expect(pl.t(messages.greeting, { name: 'Ada & <Bo>' })).toBe('Cześć, Ada & <Bo>')
    })

    it('interpolates placeholders in the translated order', () => {
      expect(pl.t(messages.pair, { a: 1, b: 2 })).toBe('2 i 1')
    })

    it('tells equal English apart by context', () => {
      expect(pl.t(messages.openVerb)).toBe('Otwórz')
      expect(pl.t(messages.openAdjective)).toBe('Otwarty')
    })

    it('picks among Polish plural forms', () => {
      const forms = [1, 2, 5, 12, 22].map(count => pl.t(messages.files, { count }))
      expect(forms).toEqual(['1 plik', '2 pliki', '5 plików', '12 plików', '22 pliki'])
    })

    it('picks English plural forms', () => {
      expect(en.t(messages.files, { count: 1 })).toBe('1 file')
      expect(en.t(messages.files, { count: 2 })).toBe('2 files')
    })
  })
}
