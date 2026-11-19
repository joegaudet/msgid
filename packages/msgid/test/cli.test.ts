import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { beforeAll, describe, expect, it } from 'vitest'
import { poToTannin, toI18nextJson, toIcuJson, toPot } from '../src/catalog.js'
import { run } from '../src/cli.js'
import { polishPo } from './fixtures.js'

const libMessages = {
  previous: { id: 'lib.previous', message: 'Previous month', description: 'A button.' },
}
const appMessages = [{ id: 'app.files', message: '{count} file', plural: '{count} files' }]
const merged = [...Object.values(libMessages), ...appMessages]

let cwd: string
beforeAll(() => {
  // An app with a library exporting ./messages, and a local messages module.
  cwd = mkdtempSync(join(tmpdir(), 'msgid-cli-'))
  const lib = join(cwd, 'node_modules', 'fake-lib')
  mkdirSync(lib, { recursive: true })
  writeFileSync(
    join(lib, 'package.json'),
    JSON.stringify({
      name: 'fake-lib',
      type: 'module',
      exports: { './messages': { default: './messages.js' } },
    }),
  )
  writeFileSync(join(lib, 'messages.js'), `export const messages = ${JSON.stringify(libMessages)}`)
  writeFileSync(
    join(cwd, 'app-messages.mjs'),
    `export const messages = ${JSON.stringify(appMessages)}`,
  )
  writeFileSync(join(cwd, 'pl.po'), polishPo)
})

describe('msgid CLI', () => {
  it('pot: merges the modules into a template', async () => {
    expect(await run(['pot', 'fake-lib/messages', './app-messages.mjs'], cwd)).toBe(toPot(merged))
  })

  it('icu: writes ICU JSON', async () => {
    expect(JSON.parse(await run(['icu', 'fake-lib/messages', './app-messages.mjs'], cwd))).toEqual(
      toIcuJson(merged),
    )
  })

  it('i18next: writes i18next JSON', async () => {
    expect(JSON.parse(await run(['i18next', './app-messages.mjs'], cwd))).toEqual(
      toI18nextJson(appMessages),
    )
  })

  it('po2json: writes Tannin locale data', async () => {
    expect(JSON.parse(await run(['po2json', 'pl.po'], cwd))).toEqual(poToTannin(polishPo))
  })

  it('--out writes to a file instead', async () => {
    expect(await run(['icu', 'fake-lib/messages', '--out', 'en.json'], cwd)).toBe('')
    expect(JSON.parse(readFileSync(join(cwd, 'en.json'), 'utf8'))).toEqual(
      toIcuJson(Object.values(libMessages)),
    )
  })

  it('rejects an unknown command or missing input with usage', async () => {
    await expect(run(['nope'], cwd)).rejects.toThrow(/Usage: msgid/)
    await expect(run(['pot'], cwd)).rejects.toThrow(/Usage: msgid/)
  })

  it('rejects a module without a messages export', async () => {
    writeFileSync(join(cwd, 'empty.mjs'), 'export const other = 1')
    await expect(run(['pot', './empty.mjs'], cwd)).rejects.toThrow(/no `messages` export/)
  })
})
