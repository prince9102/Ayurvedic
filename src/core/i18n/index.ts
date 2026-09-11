import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'react-native-localize';
import en from './locales/en.json';
import hi from './locales/hi.json';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
};

const deviceLocale = getLocales()[0]?.languageCode ?? 'en';
const initialLanguage = deviceLocale === 'hi' ? 'hi' : 'en';

i18n.use(initReactI18next).init({
  resources,
  lng: initialLanguage,
  fallbackLng: 'en',
  interpolation: { escapeValue: false },
  compatibilityJSON: 'v4',
});

export { i18n };

export function changeLanguage(lang: 'en' | 'hi') {
  return i18n.changeLanguage(lang);
}
