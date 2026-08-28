import type { Language } from "./LanguageContext";

export const translations = {
    en: {
        dashboard: "Dashboard",
        newAnalysis: "New Analysis",
        settings: "Settings",
        signOut: "Sign out",

        preferences: "PREFERENCES",
        settingsTitle: "Settings",
        customize:
            "Customize your Note Insight experience.",

        appearance: "Appearance",
        appearanceDescription:
            "Choose how Note Insight looks.",

        light: "Light",
        lightDescription:
            "Use the light appearance",

        dark: "Dark",
        darkDescription:
            "Use the dark appearance",

        system: "System",
        systemDescription:
            "Follow your device settings",

        language: "Language",
        languageDescription:
            "Select your preferred language.",

        notifications: "Notifications",
        notificationsDescription:
            "Receive notifications about your analyses.",
    },

    kn: {
        dashboard: "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
        newAnalysis: "ಹೊಸ ವಿಶ್ಲೇಷಣೆ",
        settings: "ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
        signOut: "ಸೈನ್ ಔಟ್",

        preferences: "ಆದ್ಯತೆಗಳು",
        settingsTitle: "ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
        customize:
            "ನಿಮ್ಮ Note Insight ಅನುಭವವನ್ನು ಕಸ್ಟಮೈಸ್ ಮಾಡಿ.",

        appearance: "ಗೋಚರತೆ",
        appearanceDescription:
            "Note Insight ಹೇಗೆ ಕಾಣಬೇಕು ಎಂಬುದನ್ನು ಆಯ್ಕೆಮಾಡಿ.",

        light: "ಲೈಟ್",
        lightDescription:
            "ಲೈಟ್ ಮೋಡ್ ಬಳಸಿ",

        dark: "ಡಾರ್ಕ್",
        darkDescription:
            "ಡಾರ್ಕ್ ಮೋಡ್ ಬಳಸಿ",

        system: "ಸಿಸ್ಟಮ್",
        systemDescription:
            "ನಿಮ್ಮ ಸಾಧನದ ಸೆಟ್ಟಿಂಗ್‌ಗಳನ್ನು ಅನುಸರಿಸಿ",

        language: "ಭಾಷೆ",
        languageDescription:
            "ನಿಮ್ಮ ಆದ್ಯತೆಯ ಭಾಷೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ.",

        notifications: "ಅಧಿಸೂಚನೆಗಳು",
        notificationsDescription:
            "ನಿಮ್ಮ ವಿಶ್ಲೇಷಣೆಗಳ ಕುರಿತು ಅಧಿಸೂಚನೆಗಳನ್ನು ಪಡೆಯಿರಿ.",
    },

    hi: {
        dashboard: "डैशबोर्ड",
        newAnalysis: "नया विश्लेषण",
        settings: "सेटिंग्स",
        signOut: "साइन आउट",

        preferences: "प्राथमिकताएँ",
        settingsTitle: "सेटिंग्स",
        customize:
            "अपने Note Insight अनुभव को अनुकूलित करें।",

        appearance: "दिखावट",
        appearanceDescription:
            "चुनें कि Note Insight कैसा दिखाई दे।",

        light: "लाइट",
        lightDescription:
            "लाइट मोड का उपयोग करें",

        dark: "डार्क",
        darkDescription:
            "डार्क मोड का उपयोग करें",

        system: "सिस्टम",
        systemDescription:
            "अपने डिवाइस की सेटिंग का पालन करें",

        language: "भाषा",
        languageDescription:
            "अपनी पसंदीदा भाषा चुनें।",

        notifications: "सूचनाएँ",
        notificationsDescription:
            "अपने विश्लेषणों के बारे में सूचनाएँ प्राप्त करें.",
    },
};

export function getTranslation(language: Language) {
    return translations[language];
}