import type { i18n as I18n } from 'i18next'
import { format } from './format.js'
import type { Message, Translator } from './types.js'

/** A translator over an i18next instance, keyed by message id (see `toI18nextJson`). */
export function i18next(i18n: I18n): Translator {
  return {
    get locale() {
      return i18n.language
    },
    t(message: Message, values: Record<string, unknown> = {}) {
      const { count } = values
      const options = {
        keySeparator: false,
        nsSeparator: false,
        ...(typeof count === 'number' ? { count } : {}),
      } as const
      if (!i18n.exists(message.id, options)) return format(message, values)
      // A Translator returns plain text; escaping is the renderer's job.
      return i18n.t(message.id, {
        ...options,
        replace: values,
        interpolation: { escapeValue: false },
      })
    },
  }
}
