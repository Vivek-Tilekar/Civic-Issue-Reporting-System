// src/i18n.js
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './locals/en.json'
import hn from './locals/hn.json'
import gn from './locals/gn.json'



i18n
  .use(initReactI18next)
  .init({
    resources: {
        en: {translation: en},
        gn: {translation: gn},
        hn: {translation: hn}
    },
    lng: "en", // default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false // react already safes from xss
    }
  });

export default i18n;
