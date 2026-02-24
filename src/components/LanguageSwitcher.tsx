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
      className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-brand-cyan/30 bg-white/70 dark:bg-monokai-bg/80 hover:border-brand-blue dark:hover:border-brand-cyan-light transition-colors backdrop-blur-sm"
      aria-label="Cambiar idioma"
    >
      <img
        src={lang === 'es' ? '/flags/mx.svg' : '/flags/us.svg'}
        alt={lang === 'es' ? 'Bandera de Mexico' : 'Bandera de Estados Unidos'}
        className="w-4 h-3 rounded-sm"
      />
      <span className="text-sm font-bold text-gray-700 dark:text-brand-cyan-light">
        {lang === 'es' ? 'ES' : 'EN'}
      </span>
    </button>
  );
}
