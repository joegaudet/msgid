import type { Message } from './types.js'

/** The reference English formatter. Each library's copy must match it. */
export function format(
  message: Message,
  values: Record<string, unknown> = {},
  locale = 'en',
): string {
  const { count } = values
  const text =
    message.plural !== undefined &&
    typeof count === 'number' &&
    new Intl.PluralRules(locale).select(count) !== 'one'
      ? message.plural
      : message.message
  return text.replace(/\{(\w+)\}/g, (placeholder, name: string) =>
    Object.hasOwn(values, name) ? String(values[name]) : placeholder,
  )
}
