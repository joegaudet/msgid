import { readFile, writeFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import { parseArgs } from 'node:util'
import { poToTannin, toI18nextJson, toIcuJson, toPot } from './catalog.js'
import type { Message } from './types.js'

const usage = `Usage: msgid <command> [--out <file>]
  msgid pot <module...>      gettext template from each module's \`messages\` export
  msgid icu <module...>      ICU JSON (FormatJS, ember-intl, Lingui)
  msgid i18next <module...>  i18next JSON
  msgid po2json <file.po>    Tannin locale data for msgid/gettext`

const builders = { pot: toPot, icu: toIcuJson, i18next: toI18nextJson }

// Resolve like the app would: from cwd, not from msgid's own install.
// shortcut: require.resolve skips an exports entry that only has an "import" condition; switch to
// import.meta.resolve(spec, parent) once Node ships it unflagged.
async function load(specifier: string, cwd: string): Promise<Message[]> {
  const path = createRequire(join(cwd, 'noop.js')).resolve(specifier)
  const { messages } = (await import(pathToFileURL(path).href)) as { messages?: unknown }
  if (typeof messages !== 'object' || messages === null)
    throw new Error(`${specifier} has no \`messages\` export`)
  return (Array.isArray(messages) ? messages : Object.values(messages)) as Message[]
}

/** Runs a CLI command and returns its output, or '' when it wrote to `--out`. */
export async function run(args: string[], cwd = process.cwd()): Promise<string> {
  const { values, positionals } = parseArgs({
    args,
    options: { out: { type: 'string' } },
    allowPositionals: true,
  })
  const [command, ...inputs] = positionals
  if (!command || inputs.length === 0) throw new Error(usage)
  let output: string
  if (command === 'po2json' && inputs.length === 1) {
    output =
      JSON.stringify(poToTannin(await readFile(resolve(cwd, inputs[0] ?? ''))), null, 2) + '\n'
  } else if (command === 'pot' || command === 'icu' || command === 'i18next') {
    const messages = (await Promise.all(inputs.map(input => load(input, cwd)))).flat()
    const built = builders[command](messages)
    output = typeof built === 'string' ? built : JSON.stringify(built, null, 2) + '\n'
  } else {
    throw new Error(usage)
  }
  if (values.out === undefined) return output
  await writeFile(resolve(cwd, values.out), output)
  return ''
}
