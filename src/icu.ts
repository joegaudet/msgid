import type { Message } from './types.js'

// ICU reads ' as a quote, so double it; in a plural branch # is the count, so quote it.
const escape = (text: string) => text.replace(/'/g, "''")
const branch = (text: string) => escape(text).replace(/#/g, "'#'")

/** The message as ICU MessageFormat: `{count, plural, one {…} other {…}}` when it has a plural. */
export function icu(message: Message): string {
  return message.plural === undefined
    ? escape(message.message)
    : `{count, plural, one {${branch(message.message)}} other {${branch(message.plural)}}}`
}
