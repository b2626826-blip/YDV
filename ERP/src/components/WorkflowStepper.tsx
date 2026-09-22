import { WORKFLOW_STEPS } from '../config/constants';
import type { ProductionStatus } from '../types/production';

export function WorkflowStepper({ status }: { status: ProductionStatus }) {
  const currentIndex = WORKFLOW_STEPS.findIndex((step) => step.id === status);
  return <ol className="grid grid-cols-4 gap-2" aria-label="訂單流程">{WORKFLOW_STEPS.map((step, index) => {
    const isDone = index <= currentIndex;
    return <li key={step.id} className="min-w-0"><div className={`mb-2 h-1 rounded-full ${isDone ? 'bg-teal-500' : 'bg-slate-200'}`} /><p className={`text-xs font-semibold ${isDone ? 'text-teal-700' : 'text-slate-400'}`}>{isDone && index < currentIndex ? '✓ ' : ''}{step.label}</p></li>;
  })}</ol>;
}
