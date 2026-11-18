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
      // An empty translation is '' (or [] once compiled); Lingui would render `message` for it.
      const text =
        Boolean(i18n.messages[message.id]?.length) &&
        i18n._({ id: message.id, message: icu(message), values })
      return text || format(message, values)
    },
  }
}
