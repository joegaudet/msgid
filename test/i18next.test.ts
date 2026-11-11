import i18nextLib from 'i18next'
import { i18next } from '../src/i18next.js'
import { contract } from './contract.js'
import { polishI18next } from './fixtures.js'

const instance = async (lng: string, translation: Record<string, string>) => {
  const i18n = i18nextLib.createInstance()
  await i18n.init({ lng, resources: { [lng]: { translation } } })
  return i18n
}

contract('msgid/i18next', async () => ({
  pl: i18next(await instance('pl', polishI18next)),
  en: i18next(await instance('en', {})),
}))
