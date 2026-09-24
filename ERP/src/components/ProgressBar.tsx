import { useTranslation } from '../i18n';

interface ProgressBarProps {
  value: number;
  className?: string;
}

export function ProgressBar({ value, className = '' }: ProgressBarProps) {
  const t = useTranslation();
  return (
    <div className={`h-2 overflow-hidden rounded-full bg-slate-100 ${className}`} aria-label={t('進度 {value}%', { value })}>
      <div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 transition-all" style={{ width: `${value}%` }} />
    </div>
  );
}
