import type { ProductionStatus, WorkflowStep } from '../types/production';

export const DUE_SOON_DAYS = 7;

export const PRODUCTION_LINES = ['生產線 A', '生產線 B', '生產線 C'];

export const COLOR_SWATCHES: Record<string, string> = {
  Black: '#1f2937', White: '#ffffff', Grey: '#9ca3af', Red: '#dc2626', Olive: '#6b7c3a', Sand: '#d6c29a',
  'Sky Blue': '#7dd3fc', Navy: '#1e3a8a', Gum: '#b7834a', Lime: '#a3e635', Beige: '#e8dcc4',
};

export const WORKFLOW_STEPS: WorkflowStep[] = [
  { id: 'draft', label: '草稿' },
  { id: 'purchasing', label: '採購處理' },
  { id: 'pending', label: '生管排程' },
  { id: 'production', label: '生產中' },
  { id: 'completed', label: '完成' },
];

export const STATUS_META: Record<ProductionStatus, { label: string; className: string }> = {
  draft: { label: '待送採購', className: 'bg-slate-100 text-slate-700 ring-slate-200' },
  pending: { label: '待生管排程', className: 'bg-slate-100 text-slate-700 ring-slate-200' },
  purchasing: { label: '採購中', className: 'bg-amber-50 text-amber-700 ring-amber-200' },
  production: { label: '生產中', className: 'bg-cyan-50 text-cyan-700 ring-cyan-200' },
  paused: { label: '已暫停排程', className: 'bg-orange-50 text-orange-700 ring-orange-200' },
  stopped: { label: '已停止', className: 'bg-rose-50 text-rose-700 ring-rose-200' },
  cancelled: { label: '已取消', className: 'bg-slate-100 text-slate-500 ring-slate-200' },
  completed: { label: '已完成', className: 'bg-emerald-50 text-emerald-700 ring-emerald-200' },
};

export const STATUS_FILTERS: Array<{ value: 'all' | 'due-soon' | ProductionStatus; label: string }> = [
  { value: 'all', label: '全部' },
  { value: 'due-soon', label: '即將到交期' },
  { value: 'draft', label: '待送採購' },
  { value: 'pending', label: '待生管排程' },
  { value: 'purchasing', label: '採購中' },
  { value: 'production', label: '生產中' },
  { value: 'paused', label: '已暫停排程' },
  { value: 'stopped', label: '已停止' },
  { value: 'cancelled', label: '已取消' },
  { value: 'completed', label: '已完成' },
];
