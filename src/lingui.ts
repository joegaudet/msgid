import type { I18n } from '@lingui/core'
import { format } from './format.js'
import { icu } from './icu.js'
import type { Message, Translator } from './types.js'

/** A translator over a Lingui `I18n`, keyed by message id (see `toIcuJson`). */
export function lingui(i18n: I18n): Translator {
  return {
    get locale() {
      return i18n.locale
    },
    t(message: Message, values: Record<string, unknown> = {}) {
      if (i18n.messages[message.id] === undefined) return format(message, values)
      return i18n._({ id: message.id, message: icu(message), values })
    },
  }
}
