import i18n from "i18next";

import { initReactI18next } from "react-i18next";

import es from "./Languages/es.json";
import en from "./Languages/en.json";
import fr from "./Languages/fr.json";
import pt from "./Languages/pt.json";

i18n
    .use(initReactI18next)
    .init({

        compatibilityJSON: "v4",

        lng: "es",

        fallbackLng: "es",

        resources: {

        es: {
            translation: es,
        },

        en: {
            translation: en,
        },

        fr: {
            translation: fr,
        },

        pt: {
            translation: pt,
        },

        },

        interpolation: {
        escapeValue: false,
        },

    });

export default i18n;