# msgid

The shared translator contract for Joe Gaudet's libraries: [ember-joinery], [ember-formwright]
and [real-enums]. Those libraries show built-in strings ("Previous month", "Submit", an enum's
label). `msgid` lets an app translate all of them with the i18n system it already uses. gettext is
first-class; i18next, FormatJS (and so ember-intl) and Lingui work through adapters.

Libraries do **not** depend on `msgid` at runtime. Apps install it to plug their i18n system in,
and to build translation catalogs from the libraries' messages.

```sh
pnpm add msgid
```

## The contract

The full contract is [CONTRACT.md](./CONTRACT.md). In short:

```ts
interface Message {
  id: string // `<library>.<component>.<name>`
  message: string // English, and the gettext msgid. Placeholders are `{name}`.
  plural?: string // English plural, chosen by `values.count`
  context?: string // gettext msgctxt
  description?: string // a note for translators
}

interface Translator {
  readonly locale: string
  t(message: Message, values?: Record<string, unknown>): string
}
```

An explicit argument wins, then the translator, then English. Every adapter falls back to English
(`format()`) for a message its catalog lacks or holds as an empty string, so an app can translate
one string at a time.

```ts
import { format, pseudo } from 'msgid'

format({ id: 'x.files', message: '{count} file', plural: '{count} files' }, { count: 2 })
// '2 files'

pseudo().t({ id: 'x.hi', message: 'Hi {name}' }, { name: 'Ada' })
// '⟦Ĥí Ada⟧' (locale 'en-XA'), to spot strings that skipped the translator in tests
```

`format()` is the reference English formatter. Plural: `message` when
`Intl.PluralRules(locale).select(count)` is `'one'`, otherwise `plural` (only when `plural` is set
and `values.count` is a number). Interpolation is one pass over `{word}` placeholders: an own
property of `values` is replaced with `String(value)`, and any other placeholder stays as written.

## Adapters

Each adapter is a function that returns a `Translator`. Install the library it wraps; they are
optional peer dependencies.

### gettext

```ts
import { gettext } from 'msgid/gettext'
import pl from './translations/pl.json' // from `msgid po2json pl.po`

const translator = gettext(pl) // locale from the .po file's Language header, as BCP 47 (pt_BR → pt-BR)
```

Uses [tannin] for `Plural-Forms`, and handles `msgctxt` and `msgid_plural`.

### i18next

```ts
import i18n from 'i18next'
import { i18next } from 'msgid/i18next'

const translator = i18next(i18n) // locale is i18n.language
```

Looks messages up by `id` with `keySeparator: false` and `nsSeparator: false`, passes
`values.count` for plurals, and turns off i18next's HTML escaping for these strings (a translator
returns plain text; the renderer escapes it).

### FormatJS / react-intl / ember-intl

```ts
import { createIntl } from '@formatjs/intl'
import { intl } from 'msgid/intl'

const translator = intl(createIntl({ locale: 'pl', messages }))
```

Calls `formatMessage({ id, defaultMessage, description }, values)` with the ICU form of the
English as `defaultMessage`. An ember-intl service works too: its locale comes from
`primaryLocale`, and a message counts as translated when `getTranslation(id, primaryLocale)` has it.

### Lingui

```ts
import { i18n } from '@lingui/core'
import { lingui } from 'msgid/lingui'

const translator = lingui(i18n) // locale is i18n.locale
```

Load catalogs compiled by `lingui compile` (or call `i18n.setMessagesCompiler`): production builds
of Lingui don't compile ICU strings at runtime.

### Ember

Register the translator in an instance initializer. joinery and formwright look it up as
`translator:main`:

```js
// app/instance-initializers/translator.js
import { intl } from 'msgid/intl'

export function initialize(owner) {
  owner.register('translator:main', intl(owner.lookup('service:intl')), { instantiate: false })
}

export default { initialize }
```

The adapter reads ember-intl's tracked `primaryLocale`, so a locale change re-renders.

### real-enums

```ts
import { setTranslator } from '@real-enums/core'
import { gettext } from 'msgid/gettext'

setTranslator(gettext(pl))
```

## Catalogs

Each library exports its messages from a `messages` module. The `msgid` CLI turns those modules
into catalogs:

```sh
# gettext: a template, translated as .po files, converted for msgid/gettext
msgid pot @ember-joinery/ember/messages > joinery.pot
msginit -i joinery.pot -l pl -o pl.po   # or Poedit, Weblate, Crowdin…
msgid po2json pl.po --out translations/pl.json

# ICU (FormatJS, ember-intl, Lingui) and i18next source catalogs
msgid icu @ember-joinery/ember/messages --out translations/en.json
msgid i18next @ember-joinery/ember/messages --out locales/en/translation.json
```

`pot`, `icu` and `i18next` take one or more module specifiers, resolved from the current
directory, and merge their `messages` exports (an object or an array of `Message`). Output goes to
stdout, or to `--out <file>`. `po2json` drops untranslated and fuzzy entries, so those messages
fall back to English.

The same builders are functions in `msgid/catalog`: `toPot`, `toIcuJson`, `toI18nextJson` and
`poToTannin`.

## Known limits

- Lingui ignores ICU's `'#'` quoting, so a literal `#` in a plural message renders as the count
  under Lingui.
- FormatJS reads `<word>` as a rich-text tag. English with angle brackets (`Press <Enter>`)
  reports a `FORMAT_ERROR` there and renders the raw message, without its values filled in.
- The CLI resolves module specifiers with `require.resolve` from the current directory, so a
  package whose `exports` entry has only an `"import"` condition does not resolve.

## License

MIT

[ember-joinery]: https://github.com/joegaudet/ember-joinery
[ember-formwright]: https://github.com/joegaudet/ember-formwright
[real-enums]: https://github.com/joegaudet/real-enums
[tannin]: https://github.com/aduth/tannin
