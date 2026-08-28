import {
    createContext,
    useContext,
    useState,
    type ReactNode,
} from "react";


/* =========================================================
   LANGUAGE TYPE
   ========================================================= */

export type Language = "en" | "kn" | "hi";


/* =========================================================
   LANGUAGE CONTEXT TYPE
   ========================================================= */

type LanguageContextType = {
    language: Language;
    setLanguage: (language: Language) => void;
};


/* =========================================================
   CREATE CONTEXT
   ========================================================= */

const LanguageContext = createContext<
    LanguageContextType | undefined
>(undefined);


/* =========================================================
   LANGUAGE PROVIDER
   ========================================================= */

export function LanguageProvider({
    children,
}: {
    children: ReactNode;
}) {

    const [language, setLanguageState] =
        useState<Language>(() => {

            const savedLanguage =
                localStorage.getItem(
                    "note-insight-language"
                );


            if (
                savedLanguage === "en" ||
                savedLanguage === "kn" ||
                savedLanguage === "hi"
            ) {
                return savedLanguage;
            }


            return "en";
        });


    /* =====================================================
       CHANGE LANGUAGE
       ===================================================== */

    const setLanguage = (
        newLanguage: Language
    ) => {

        setLanguageState(newLanguage);

        localStorage.setItem(
            "note-insight-language",
            newLanguage
        );
    };


    /* =====================================================
       PROVIDER
       ===================================================== */

    return (
        <LanguageContext.Provider
            value={{
                language,
                setLanguage,
            }}
        >
            {children}
        </LanguageContext.Provider>
    );
}


/* =========================================================
   USE LANGUAGE HOOK
   ========================================================= */

export function useLanguage() {

    const context =
        useContext(LanguageContext);


    if (!context) {
        throw new Error(
            "useLanguage must be used inside LanguageProvider"
        );
    }


    return context;
}