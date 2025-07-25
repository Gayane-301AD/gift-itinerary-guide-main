import { useLanguage } from '@/contexts/LanguageContext';
import { en } from '@/translations/en';
import { am } from '@/translations/am';
import { ru } from '@/translations/ru';

type TranslationKey = keyof typeof en;

export const useTranslation = () => {
  const { language } = useLanguage();
  
  const translations = {
    English: en,
    Armenian: am,
    Russian: ru
  };

  const t = (key: string): any => {
    const keys = key.split('.');
    let result: any = translations[language];
    
    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = result[k];
      } else {
        // Fallback to English if translation not found
        result = translations.English;
        for (const fallbackKey of keys) {
          if (result && typeof result === 'object' && fallbackKey in result) {
            result = result[fallbackKey];
          } else {
            return key; // Return the key if translation not found
          }
        }
        break;
      }
    }
    
    return result;
  };

  return { t };
};