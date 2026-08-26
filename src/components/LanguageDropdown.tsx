import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';

export function LanguageDropdown() {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const currentLang = i18n.language;

  function toggleLanguage(lang: string) {
    if (currentLang !== lang) {
      i18n.changeLanguage(lang);
    }
    setIsOpen(false);
  }

  return (
    <div className="relative z-50">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex items-center bg-card border border-border/10 rounded-full px-3 py-2"
      >
        <Globe size={16} className="text-muted-foreground" />
        <span className="text-foreground font-bold text-xs mx-2">
          {currentLang === 'pt-BR' ? 'PT' : 'EN'}
        </span>
        <ChevronDown size={14} className="text-muted-foreground" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-12 right-0 bg-card border border-border/10 rounded-xl shadow-lg w-32 overflow-hidden z-50">
            <button
              type="button"
              onClick={() => toggleLanguage('en')}
              className={`w-full text-left px-4 py-3 border-b border-border/10 text-sm font-medium ${
                currentLang === 'en' ? 'bg-primary/10 text-primary' : 'text-foreground'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => toggleLanguage('pt-BR')}
              className={`w-full text-left px-4 py-3 text-sm font-medium ${
                currentLang === 'pt-BR' ? 'bg-primary/10 text-primary' : 'text-foreground'
              }`}
            >
              Português
            </button>
          </div>
        </>
      )}
    </div>
  );
}