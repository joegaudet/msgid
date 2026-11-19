import { setupI18n } from '@lingui/core'
import { compileMessage } from '@lingui/message-utils/compileMessage'
import { lingui } from '../src/lingui.js'
import { contract } from './contract.js'
import { polishIcu } from './fixtures.js'

const instance = (locale: string, messages: Record<string, string>) =>
  setupI18n({ locale, messages: { [locale]: messages } }).setMessagesCompiler(compileMessage)

contract('msgid/lingui', () => ({
  pl: lingui(instance('pl', polishIcu)),
  en: lingui(instance('en', {})),
}))
