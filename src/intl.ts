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
  exists?(id: string): boolean
  formatMessage(
    descriptor: { id: string; defaultMessage?: string; description?: string },
    values?: Record<string, unknown>,
  ): string
}

/** A translator over FormatJS (`createIntl`, react-intl) or ember-intl, keyed by message id. */
export function intl(intl: IntlLike): Translator {
  return {
    get locale() {
      return (
        intl.primaryLocale ?? (typeof intl.locale === 'string' ? intl.locale : intl.locale[0]) ?? ''
      )
    },
    t(message: Message, values: Record<string, unknown> = {}) {
      const has = intl.exists ? intl.exists(message.id) : intl.messages?.[message.id] !== undefined
      if (!has) return format(message, values)
      const { id, description } = message
      return intl.formatMessage(
        { id, defaultMessage: icu(message), ...(description === undefined ? {} : { description }) },
        values,
      )
    },
  }
}
