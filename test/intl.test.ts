import { createIntl } from '@formatjs/intl'
import { intl } from '../src/intl.js'
import { contract } from './contract.js'
import { polishIcu } from './fixtures.js'

contract('msgid/intl (FormatJS)', () => ({
  pl: intl(createIntl({ locale: 'pl', messages: polishIcu })),
  en: intl(createIntl({ locale: 'en', messages: {} })),
}))

// ember-intl's service: an array locale, primaryLocale, getTranslation(), and formatMessage().
const emberIntl = (locale: string, messages: Record<string, string>) => {
  const formatjs = createIntl({ locale, messages })
  return {
    locale: [locale],
    primaryLocale: locale,
    getTranslation: (id: string) => messages[id],
    formatMessage: formatjs.formatMessage,
  }
}

contract('msgid/intl (ember-intl)', () => ({
  pl: intl(emberIntl('pl', polishIcu)),
  en: intl(emberIntl('en', {})),
}))
