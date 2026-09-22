import type { ProductionStatus, WorkflowStep } from '../types/production';

export const DUE_SOON_DAYS = 7;

export const WORKFLOW_STEPS: WorkflowStep[] = [
  { id: 'pending', label: '生管建立' },
  { id: 'purchasing', label: '採購處理' },
  { id: 'production', label: '生產中' },
  { id: 'completed', label: '完成' },
];

export const STATUS_META: Record<ProductionStatus, { label: string; className: string }> = {
  pending: { label: '待處理', className: 'bg-slate-100 text-slate-700 ring-slate-200' },
  purchasing: { label: '採購中', className: 'bg-amber-50 text-amber-700 ring-amber-200' },
  production: { label: '生產中', className: 'bg-cyan-50 text-cyan-700 ring-cyan-200' },
  completed: { label: '已完成', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
};

export const STATUS_FILTERS: Array<{ value: 'all' | ProductionStatus; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'pending', label: '待處理' },
  { value: 'purchasing', label: '採購中' },
  { value: 'production', label: '生產中' },
  { value: 'completed', label: '已完成' },
];
