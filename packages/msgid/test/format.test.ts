import { describe, expect, it } from 'vitest'
import { format, type Message } from '../src/index.js'

const files: Message = { id: 't.files', message: '{count} file', plural: '{count} files' }

describe('format', () => {
  it('returns the message as is without values', () => {
    expect(format({ id: 't.a', message: 'Previous month' })).toBe('Previous month')
  })

  it('interpolates {name} with String(value)', () => {
    expect(format({ id: 't.a', message: '{a} of {b}' }, { a: 1, b: 'ten' })).toBe('1 of ten')
  })

  it('leaves an unknown placeholder as written', () => {
    expect(format({ id: 't.a', message: 'Hi {name} {other}' }, { name: 'Ada' })).toBe(
      'Hi Ada {other}',
    )
  })

  it('does not treat inherited properties as values', () => {
    expect(format({ id: 't.a', message: '{constructor}' }, {})).toBe('{constructor}')
  })

  it('interpolates in one pass, so a value is not re-expanded', () => {
    expect(format({ id: 't.a', message: '{a}{b}' }, { a: '{b}', b: 'x' })).toBe('{b}x')
  })

  it('picks message for one and plural otherwise', () => {
    expect(format(files, { count: 1 })).toBe('1 file')
    expect(format(files, { count: 0 })).toBe('0 files')
    expect(format(files, { count: 2 })).toBe('2 files')
  })

  it('uses message when count is not a number', () => {
    expect(format(files, { count: '2' })).toBe('2 file')
    expect(format(files)).toBe('{count} file')
  })

  it('selects with the given locale', () => {
    // In French 0 is 'one'.
    expect(format(files, { count: 0 }, 'fr')).toBe('0 file')
  })
})
