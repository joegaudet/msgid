import { format } from './format.js'
import type { Message, Translator } from './types.js'

const plain = 'abcdefghijklmnoprstuvwyzABCDEFGHIJKLMNOPRSTUVWYZ'
const accented = Array.from('áƀçðéƒĝĥíĵķļɱñöþŕšţûνŵýžÁƁÇÐÉƑĜĤÍĴĶĻṀÑÖƤŔŠŢÛṼŴÝŽ')
const accent = (text: string) =>
  // Placeholders stay as written so format() can still fill them.
  text.replace(/\{\w+\}|[^{]+|\{/g, part =>
    part.startsWith('{') ? part : part.replace(/[a-zA-Z]/g, c => accented[plain.indexOf(c)] ?? c),
  )

/** A pseudo-locale translator: `⟦` + accented English + `⟧`, to spot untranslated strings. */
export function pseudo(): Translator {
  return {
    locale: 'en-XA',
    t(message: Message, values?: Record<string, unknown>) {
      const plural = message.plural === undefined ? {} : { plural: accent(message.plural) }
      return `⟦${format({ ...message, message: accent(message.message), ...plural }, values)}⟧`
    },
  }
}
