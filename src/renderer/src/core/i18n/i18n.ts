import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

import enCommon from '@renderer/locales/en/common.json'
import esCommon from '@renderer/locales/es/common.json'

export const SUPPORTED_LANGUAGES = ['en', 'es'] as const
export const DEFAULT_LANGUAGE = 'en'

const systemLanguage = navigator.language.split('-')[0]

i18n.use(initReactI18next).init({
  resources: {
    en: { common: enCommon },
    es: { common: esCommon }
  },
  lng: SUPPORTED_LANGUAGES.find((language) => language === systemLanguage) ?? DEFAULT_LANGUAGE,
  fallbackLng: DEFAULT_LANGUAGE,
  defaultNS: 'common',
  interpolation: {
    escapeValue: false
  }
})

export default i18n
