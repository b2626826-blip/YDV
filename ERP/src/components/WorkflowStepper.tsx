import { WORKFLOW_STEPS } from '../config/constants';
import type { ProductionStatus } from '../types/production';
import { useTranslation } from '../i18n';

export function WorkflowStepper({ status }: { status: ProductionStatus }) {
  const t = useTranslation();
  const workflowStatus = status === 'paused' || status === 'stopped' ? 'production' : status;
  const currentIndex = WORKFLOW_STEPS.findIndex((step) => step.id === workflowStatus);
  return <ol className="grid grid-cols-5 gap-2" aria-label={t('訂單流程')}>{WORKFLOW_STEPS.map((step, index) => {
    const isDone = index <= currentIndex;
    return <li key={step.id} className="min-w-0"><div className={`mb-2 h-1 rounded-full ${isDone ? 'bg-teal-500' : 'bg-slate-200'}`} /><p className={`text-xs font-semibold ${isDone ? 'text-teal-700' : 'text-slate-400'}`}>{isDone && index < currentIndex ? '✓ ' : ''}{t(step.label)}</p></li>;
  })}</ol>;
}
