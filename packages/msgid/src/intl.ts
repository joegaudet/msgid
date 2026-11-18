import { format } from './format.js'
import { icu } from './icu.js'
import type { Message, Translator } from './types.js'

/** The part of a FormatJS `IntlShape` or an ember-intl service the adapter uses. */
export interface IntlLike {
  readonly locale: string | readonly string[]
  /** ember-intl */
  readonly primaryLocale?: string
  /** FormatJS */
  readonly messages?: Record<string, unknown>
  /** ember-intl */
  getTranslation?(id: string, locale: string): unknown
  formatMessage(
    descriptor: { id: string; defaultMessage?: string; description?: string },
    values?: Record<string, unknown>,
  ): string
}

/** A translator over FormatJS (`createIntl`, react-intl) or ember-intl, keyed by message id. */
export function intl(intl: IntlLike): Translator {
  return {
    get locale(): string {
      return (
        intl.primaryLocale ?? (typeof intl.locale === 'string' ? intl.locale : intl.locale[0]) ?? ''
      )
    },
    t(message: Message, values: Record<string, unknown> = {}) {
      const { id, description } = message
      // On a miss FormatJS would render defaultMessage itself; format() keeps English identical.
      // ember-intl formats with its primary locale only, so look there (not exists(), which checks all).
      const has = Boolean(
        intl.getTranslation ? intl.getTranslation(id, this.locale) : intl.messages?.[id],
      )
      const text =
        has &&
        intl.formatMessage(
          {
            id,
            defaultMessage: icu(message),
            ...(description === undefined ? {} : { description }),
          },
          values,
        )
      return text || format(message, values)
    },
  }
}
