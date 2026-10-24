import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import enCommon from '@renderer/locales/en/common.json'
import enConsoles from '@renderer/locales/en/consoles.json'
import enGames from '@renderer/locales/en/games.json'
import enHome from '@renderer/locales/en/home.json'
import enSearch from '@renderer/locales/en/search.json'
import esCommon from '@renderer/locales/es/common.json'
import esConsoles from '@renderer/locales/es/consoles.json'
import esGames from '@renderer/locales/es/games.json'
import esHome from '@renderer/locales/es/home.json'
import esSearch from '@renderer/locales/es/search.json'

export const SUPPORTED_LANGUAGES = ['en', 'es'] as const
export const DEFAULT_LANGUAGE = 'en'

const systemLanguage = navigator.language.split('-')[0]

i18n.use(initReactI18next).init({
  resources: {
    en: { common: enCommon, consoles: enConsoles, games: enGames, home: enHome, search: enSearch },
    es: { common: esCommon, consoles: esConsoles, games: esGames, home: esHome, search: esSearch }
  },
  lng: SUPPORTED_LANGUAGES.find((language) => language === systemLanguage) ?? DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,
  defaultNS: 'common',
  interpolation: {
    escapeValue: false
  }
})

export default i18n
