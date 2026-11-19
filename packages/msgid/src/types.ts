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
