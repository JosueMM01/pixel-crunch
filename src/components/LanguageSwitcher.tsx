import { useEffect, useState } from 'react';

export default function LanguageSwitcher() {
  const [lang, setLang] = useState<'es' | 'en'>('es');

  useEffect(() => {
    // Leer idioma del localStorage o usar español por defecto
    const savedLang = localStorage.getItem('lang') as 'es' | 'en' || 'es';
    setLang(savedLang);
  }, []);

  const toggleLanguage = () => {
    const newLang = lang === 'es' ? 'en' : 'es';
    setLang(newLang);
    localStorage.setItem('lang', newLang);
    window.location.href = `/${newLang === 'en' ? 'en' : ''}`;
  };

  return (
    <button
      onClick={toggleLanguage}
      className="fixed top-6 right-6 z-50 flex items-center gap-2 px-4 py-2 bg-white dark:bg-monokai-bg/90 rounded-lg border border-gray-200 dark:border-brand-cyan/30 hover:border-brand-cyan dark:hover:border-brand-cyan-light hover:scale-105 transition-all shadow-lg backdrop-blur-sm"
      aria-label="Cambiar idioma"
    >
      <span className="text-xl">{lang === 'es' ? '🇪🇸' : '🇺🇸'}</span>
      <span className="text-sm font-bold text-gray-700 dark:text-brand-cyan-light">
        {lang === 'es' ? 'ES' : 'EN'}
      </span>
    </button>
  );
}
