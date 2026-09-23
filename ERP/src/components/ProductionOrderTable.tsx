import { ProductMedia } from './ProductMedia';
import { ProgressBar } from './ProgressBar';
import { StatusBadge } from './StatusBadge';
import { formatDate, formatQuantity, getBatchQuantity, getDefectRate, getNextOutstandingBatch, getOrderProgress, isDueSoon, sumCompleted } from '../utils/production';
import type { ProductionOrder } from '../types/production';

export function ProductionOrderTable({ orders, onOpen }: { orders: ProductionOrder[]; onOpen: (id: string) => void }) {
  if (orders.length === 0) return <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center text-sm text-slate-500">找不到符合條件的生產訂單。</div>;

  return <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="hidden min-w-[1320px] grid-cols-[1.2fr_2.2fr_1.1fr_1.3fr_1fr_1.5fr_1.4fr_1.4fr] border-b border-slate-100 bg-slate-50 px-5 py-3 text-xs font-semibold text-slate-500 xl:grid"><span>訂單總編號</span><span>產品</span><span>顏色</span><span>生產進度</span><span>不良率</span><span>目前狀態</span><span>下一批交貨</span><span>目的地</span></div><div className="flex flex-col gap-3 bg-slate-50 p-3 xl:block xl:bg-white xl:p-0">{orders.map((order) => {
    const completed = sumCompleted(order);
    const progress = getOrderProgress(order);
    const defectRate = getDefectRate(order);
    const nextBatch = getNextOutstandingBatch(order);
    const hasDueSoon = nextBatch ? isDueSoon(nextBatch) : false;
    return <button type="button" key={order.id} onClick={() => onOpen(order.id)} className="grid w-full gap-4 rounded-xl border border-slate-200 bg-white px-5 py-4 text-left shadow-sm transition hover:bg-teal-50/50 xl:min-w-[1320px] xl:grid-cols-[1.2fr_2.2fr_1.1fr_1.3fr_1fr_1.5fr_1.4fr_1.4fr] xl:items-center xl:rounded-none xl:border-x-0 xl:border-t-0 xl:border-b xl:border-slate-100 xl:bg-transparent xl:shadow-none last:border-0"><span className="text-sm font-bold text-slate-800">{order.orderNumber}</span><span className="flex min-w-0 items-center gap-3"><ProductMedia product={order.product} size="thumbnail" /><span className="min-w-0"><span className="block text-xs font-bold text-teal-700">{order.product.productCode}</span><span className="block truncate text-sm font-semibold text-slate-800">{order.product.productName}</span><span className="block text-xs text-slate-500">{order.product.material}</span></span></span><span className="text-sm font-medium text-slate-700">{order.items.map((item) => item.color).join(' / ')}</span><span><span className="mb-1.5 block text-sm font-semibold text-slate-800">{formatQuantity(completed)} / {formatQuantity(order.totalQuantity)} <span className="text-teal-700">{progress}%</span></span><ProgressBar value={progress} /></span><span className="text-sm font-semibold text-rose-600">{order.status === 'completed' ? `${defectRate.toFixed(2)}%` : '—'}</span><span><StatusBadge status={order.status} /></span><span>{nextBatch ? <span className="text-sm text-slate-700"><span className="block font-semibold">{formatQuantity(getBatchQuantity(nextBatch))} 雙</span><span className="text-xs text-slate-500">{formatDate(nextBatch.dueDate)}</span>{hasDueSoon && <span className="ml-2 inline-flex rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-700">即將到期</span>}</span> : <span className="text-sm font-semibold text-emerald-700">已全部交貨</span>}</span><span className="text-sm font-medium text-slate-700">{nextBatch?.destinationCountry ?? '—'}</span></button>;
  })}</div></div>;
}
