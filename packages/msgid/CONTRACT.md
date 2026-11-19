# The msgid contract

Libraries (ember-joinery, ember-formwright, real-enums) show built-in strings: a calendar's
"Previous month", a form's "Submit", an enum's label. This contract lets an app translate all of
them with whatever i18n system it already uses. gettext is the first-class format; i18next,
FormatJS (and so ember-intl) and Lingui are supported through adapters.

A library does **not** depend on the `msgid` package at runtime. It declares the two types below
(structurally identical), formats English itself when no translator is set, and exports its
messages as data. `msgid` supplies the adapters, a pseudo-locale translator and the catalog CLI.

## Types

```ts
/** A built-in string. */
export interface Message {
  /** Stable key, `<library>.<component>.<name>`: `joinery.calendar.previousMonth`. */
  id: string
  /** English text, and the gettext msgid. Placeholders are `{name}`. */
  message: string
  /** English plural, and the gettext msgid_plural. Chosen by `values.count`. */
  plural?: string
  /** gettext msgctxt, to tell apart equal English strings with different meanings. */
  context?: string
  /** A note for translators (gettext `#.` comment, ICU description). */
  description?: string
}

export interface Translator {
  /** BCP 47 locale. In Ember, make it tracked so a locale change re-renders. */
  readonly locale: string
  /** The translated, interpolated string. Falls back to English itself when it has none. */
  t(message: Message, values?: Record<string, unknown>): string
}
```

## English formatting (no translator)

- Plural: if `plural` is set and `values.count` is a number, use `message` when
  `new Intl.PluralRules('en').select(count) === 'one'`, otherwise `plural`.
- Interpolate `{name}` with `String(values[name])`; leave an unknown placeholder as written.

The reference is `format()` in `msgid` (src/format.ts); each library's copy must match it.

## Precedence

An explicit argument (`@previousMonthLabel`, a label function) wins, then the translator, then
English. Existing apps change nothing.

## Where a library finds the translator

- **Ember** (joinery, formwright): `getOwner(context)?.lookup('translator:main')`. An app sets it
  with `owner.register('translator:main', translator, { instantiate: false })` in an instance
  initializer, or ships `app/translators/main.{js,ts}` for the resolver to find. Unregistered means
  English.
- **Framework-agnostic** (real-enums): a module-level `setTranslator(translator | undefined)`.

## Catalogs

Each library package exports every built-in message as data from a `messages` module
(`export const messages = { previousMonth: {...}, ... } satisfies Record<string, Message>`), at a
`./messages` package export. No message is defined anywhere else. `msgid` turns those modules into:

- `messages.pot` (gettext template; the source of truth for translators),
- `en.json` for ICU systems (id → ICU message, plurals as `{count, plural, one {…} other {…}}`),
- `en.json` for i18next (`id_one` / `id_other`, `{{name}}` placeholders).

Translators edit `.po` files; `msgid po2json` converts them to the runtime catalog.

## Testing in a library

Register a pseudo-locale translator (`t` returns `⟦` + accented English + `⟧`) and assert that
every built-in string a component renders (text, `aria-label`, title, placeholder) is wrapped.
That catches a string that skipped the translator. Libraries keep a ~10-line local copy until
`msgid` is published.
