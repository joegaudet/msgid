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
      // A miss or an empty translation comes back as '' and falls back to English. A Translator
      // returns plain text; escaping is the renderer's job.
      const text = i18n.t(message.id, {
        ...options,
        defaultValue: '',
        replace: values,
        interpolation: { escapeValue: false },
      })
      return text || format(message, values)
    },
  }
}
