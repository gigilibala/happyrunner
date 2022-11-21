import i18next from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './lang/en.json'
import it from './lang/it.json'

export const defaultNS = 'common'
export const resources = {
  en: {
    common: en,
  },
  it: {
    common: it,
  },
}

// TODO(gigilibala): Add language detector (https://www.i18next.com/overview/plugins-and-utils#language-detector)
i18next.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  resources: resources,
  lng: 'en',
  fallbackLng: 'en',
  defaultNS: defaultNS,
  interpolation: {
    escapeValue: false,
  },
})
