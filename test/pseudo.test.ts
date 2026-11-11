import { describe, expect, it } from 'vitest'
import { pseudo } from '../src/index.js'

describe('pseudo', () => {
  const tr = pseudo()

  it('has the en-XA locale', () => {
    expect(tr.locale).toBe('en-XA')
  })

  it('wraps accented English in brackets', () => {
    expect(tr.t({ id: 't.a', message: 'Previous month' })).toBe('⟦Ƥŕéνíöûš ɱöñţĥ⟧')
  })

  it('keeps placeholders intact, then interpolates', () => {
    expect(tr.t({ id: 't.a', message: 'Hi {name}' }, { name: 'Ada' })).toBe('⟦Ĥí Ada⟧')
    expect(tr.t({ id: 't.a', message: 'Hi {name}' })).toBe('⟦Ĥí {name}⟧')
  })

  it('picks the plural form', () => {
    const m = { id: 't.f', message: '{count} file', plural: '{count} files' }
    expect(tr.t(m, { count: 1 })).toBe('⟦1 ƒíļé⟧')
    expect(tr.t(m, { count: 3 })).toBe('⟦3 ƒíļéš⟧')
  })
})
