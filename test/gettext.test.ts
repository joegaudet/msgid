import { describe, expect, it } from 'vitest'
import { gettext } from '../src/gettext.js'
import { poToTannin } from '../src/catalog.js'
import { contract } from './contract.js'
import { polishPo } from './fixtures.js'

contract('msgid/gettext', () => ({
  pl: gettext(poToTannin(polishPo)),
  en: gettext({ messages: { '': { lang: 'en', plural_forms: 'nplurals=2; plural=(n != 1);' } } }),
}))

describe('msgid/gettext locale', () => {
  it('turns a gettext Language header into BCP 47', () => {
    const po = 'msgid ""\nmsgstr ""\n"Language: pt_BR\\n"\n'
    expect(gettext(poToTannin(po)).locale).toBe('pt-BR')
  })

  it('throws without a lang header', () => {
    expect(() => gettext({ messages: { '': {} } })).toThrow(/no lang/)
  })
})
