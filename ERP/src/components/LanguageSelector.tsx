import { LANGUAGE_OPTIONS, useLanguage, useTranslation } from '../i18n';

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const t = useTranslation();

  return <div role="group" aria-label={t('介面語言')} className="flex flex-wrap items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
    {LANGUAGE_OPTIONS.map((option) => <button
      key={option.code}
      type="button"
      lang={option.code}
      aria-pressed={language === option.code}
      onClick={() => setLanguage(option.code)}
      className={`rounded-md px-2.5 py-2 text-xs font-semibold transition ${language === option.code ? 'bg-white text-teal-700 shadow-sm ring-1 ring-slate-200' : 'text-slate-600 hover:bg-white hover:text-slate-900'}`}
    >{option.label}</button>)}
  </div>;
}
