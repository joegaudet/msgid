import type { Message } from '../src/index.js'

export const messages = {
  greeting: { id: 'test.greeting', message: 'Hello, {name}', description: 'Shown on sign-in.' },
  pair: { id: 'test.pair', message: '{a} and {b}' },
  untranslated: { id: 'test.untranslated', message: "Don't forget {thing}" },
  openVerb: { id: 'test.open.verb', message: 'Open', context: 'verb' },
  openAdjective: { id: 'test.open.adjective', message: 'Open', context: 'adjective' },
  files: { id: 'test.files', message: '{count} file', plural: '{count} files' },
  ranked: { id: 'test.ranked', message: '#{count} item', plural: '#{count} items' },
} satisfies Record<string, Message>

/** Polish, as a translator would write it in a .po file. */
export const polishPo = `msgid ""
msgstr ""
"Language: pl\\n"
"Content-Type: text/plain; charset=UTF-8\\n"
"Plural-Forms: nplurals=3; plural=(n==1 ? 0 : n%10>=2 && n%10<=4 && (n%100<10 || n%100>=20) ? 1 : 2);\\n"

msgid "Hello, {name}"
msgstr "Cześć, {name}"

msgid "{a} and {b}"
msgstr "{b} i {a}"

msgid "Don't forget {thing}"
msgstr ""

#, fuzzy
msgid "Never shown"
msgstr "Nigdy"

msgctxt "verb"
msgid "Open"
msgstr "Otwórz"

msgctxt "adjective"
msgid "Open"
msgstr "Otwarty"

msgid "{count} file"
msgid_plural "{count} files"
msgstr[0] "{count} plik"
msgstr[1] "{count} pliki"
msgstr[2] "{count} plików"
`

/** The same Polish in ICU MessageFormat. */
export const polishIcu: Record<string, string> = {
  'test.greeting': 'Cześć, {name}',
  'test.pair': '{b} i {a}',
  'test.untranslated': '',
  'test.open.verb': 'Otwórz',
  'test.open.adjective': 'Otwarty',
  'test.files':
    '{count, plural, one {{count} plik} few {{count} pliki} many {{count} plików} other {{count} pliku}}',
}

/** The same Polish for i18next. */
export const polishI18next: Record<string, string> = {
  'test.greeting': 'Cześć, {{name}}',
  'test.pair': '{{b}} i {{a}}',
  'test.untranslated': '',
  'test.open.verb': 'Otwórz',
  'test.open.adjective': 'Otwarty',
  'test.files_one': '{{count}} plik',
  'test.files_few': '{{count}} pliki',
  'test.files_many': '{{count}} plików',
  'test.files_other': '{{count}} pliku',
}
