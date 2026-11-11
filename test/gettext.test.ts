import { gettext } from '../src/gettext.js'
import { poToTannin } from '../src/catalog.js'
import { contract } from './contract.js'
import { polishPo } from './fixtures.js'

contract('msgid/gettext', () => ({
  pl: gettext(poToTannin(polishPo)),
  en: gettext({ messages: { '': { lang: 'en', plural_forms: 'nplurals=2; plural=(n != 1);' } } }),
}))
