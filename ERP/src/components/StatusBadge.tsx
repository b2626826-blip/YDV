import { STATUS_META } from '../config/constants';
import type { ProductionStatus } from '../types/production';

export function StatusBadge({ status }: { status: ProductionStatus }) {
  const meta = STATUS_META[status];
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${meta.className}`}>{meta.label}</span>;
}
