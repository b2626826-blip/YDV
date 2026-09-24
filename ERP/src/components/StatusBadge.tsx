import { STATUS_META } from '../config/constants';
import type { ProductionStatus } from '../types/production';
import { useTranslation } from '../i18n';

export function StatusBadge({ status }: { status: ProductionStatus }) {
  const t = useTranslation();
  const meta = STATUS_META[status];
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${meta.className}`}>{t(meta.label)}</span>;
}
