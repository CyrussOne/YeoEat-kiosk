import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { STORAGE_KEYS, DEFAULT_LANGUAGE, LANGUAGES } from "@/utils/constants";

type Language = typeof LANGUAGES.ENGLISH | typeof LANGUAGES.GERMAN;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (translations: { en: string; de: string }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem(STORAGE_KEYS.LANGUAGE);
    return (savedLanguage as Language) || DEFAULT_LANGUAGE;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  // Translation helper function
  const t = (translations: { en: string; de: string }): string => {
    return translations[language] || translations[DEFAULT_LANGUAGE];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
