import { ProductMedia } from './ProductMedia';
import { ProgressBar } from './ProgressBar';
import { StatusBadge } from './StatusBadge';
import { formatDate, formatQuantity, getBatchQuantity, getDefectRate, getNextOutstandingBatch, getOrderProgress, isDueSoon, isOpenStatus, isOverdue, sumCompleted, sumDefective } from '../utils/production';
import type { ProductionOrder } from '../types/production';
import { useTranslation } from '../i18n';

export function ProductionOrderTable({ orders, onOpen }: { orders: ProductionOrder[]; onOpen: (id: string) => void }) {
  const t = useTranslation();
  if (orders.length === 0) return <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center text-sm text-slate-500">{t('找不到符合條件的生產訂單。')}</div>;

  return <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="hidden min-w-[1120px] grid-cols-[2.3fr_1.2fr_1.6fr_0.8fr_1.2fr_1.3fr] border-b border-slate-100 bg-slate-50 px-5 py-3 text-xs font-semibold text-slate-500 xl:grid"><span>{t('鞋型／鞋體')}</span><span>{t('訂單總編號')}</span><span>{t('生產進度')}</span><span>{t('不良率')}</span><span>{t('目前狀態')}</span><span>{t('下一批交貨')}</span></div><div className="flex flex-col gap-3 bg-slate-50 p-3 xl:block xl:bg-white xl:p-0">{orders.map((order) => {
    const completed = sumCompleted(order);
    const progress = getOrderProgress(order);
    const defectRate = getDefectRate(order);
    const showDefectRate = order.status === 'completed' || sumDefective(order) > 0;
    const nextBatch = getNextOutstandingBatch(order);
    const hasDueSoon = nextBatch ? isOpenStatus(order.status) && isDueSoon(nextBatch) : false;
    return <button type="button" key={order.id} onClick={() => onOpen(order.id)} className="grid w-full gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 text-left shadow-sm transition hover:bg-teal-50/50 xl:min-w-[1120px] xl:grid-cols-[2.3fr_1.2fr_1.6fr_0.8fr_1.2fr_1.3fr] xl:items-center xl:rounded-none xl:border-x-0 xl:border-t-0 xl:border-b xl:border-slate-100 xl:bg-transparent xl:shadow-none last:border-0"><span className="flex min-w-0 items-center gap-3"><ProductMedia product={order.product} size="thumbnail" /><span className="min-w-0"><span className="block text-xs font-bold text-teal-700">{order.product.productCode}</span><span className="block truncate text-sm font-semibold text-slate-800">{order.product.productName}</span><span className="block text-xs text-slate-500">{order.product.material}</span></span></span><span className="text-sm font-bold text-slate-800">{order.orderNumber}</span><span><span className="mb-1.5 block text-sm font-semibold text-slate-800">{formatQuantity(completed)} / {formatQuantity(order.totalQuantity)} <span className="text-teal-700">{progress}%</span></span><ProgressBar value={progress} /></span><span className={`text-sm font-semibold ${showDefectRate && defectRate > 0 ? 'text-rose-600' : 'text-slate-400'}`}>{showDefectRate ? `${defectRate.toFixed(2)}%` : '—'}</span><span><StatusBadge status={order.status} /></span><span>{nextBatch ? <span className="text-sm text-slate-700"><span className="block font-semibold">{formatQuantity(getBatchQuantity(nextBatch))} {t('雙')}</span><span className="text-xs text-slate-500">{formatDate(nextBatch.dueDate)}</span>{hasDueSoon && <span className="ml-2 inline-flex rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">{t(isOverdue(nextBatch) ? '已逾期' : '即將到期')}</span>}</span> : <span className="text-sm font-semibold text-emerald-700">{t('生產完成')}</span>}</span></button>;
  })}</div></div>;
}
