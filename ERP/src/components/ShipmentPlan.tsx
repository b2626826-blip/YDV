import { ProgressBar } from './ProgressBar';
import { formatShipmentBatchNumber } from '../utils/orderNumbers';
import { formatDate, formatQuantity, getBatchCompletedQuantity, getBatchQuantity, getProgress, isDueSoon } from '../utils/production';
import type { DeliveryBatch, ProductionStatus } from '../types/production';

interface ShipmentPlanProps {
  orderNumber: string;
  productSequence?: number;
  batches: DeliveryBatch[];
  orderStatus: ProductionStatus;
  editable?: boolean;
  onCompletedChange?: (batchId: string, color: string, completedQuantity: number) => void;
}

function batchStatus(batch: DeliveryBatch, orderStatus: ProductionStatus) {
  const quantity = getBatchQuantity(batch);
  const completedQuantity = getBatchCompletedQuantity(batch);
  if (completedQuantity === quantity) return { label: '已完成', className: 'text-emerald-700' };
  if (completedQuantity > 0) return { label: '生產中', className: 'text-cyan-700' };
  if (orderStatus === 'pending') return { label: '待處理', className: 'text-slate-600' };
  if (orderStatus === 'purchasing') return { label: '採購中', className: 'text-amber-700' };
  return { label: '待生產', className: 'text-slate-600' };
}

export function ShipmentPlan({ orderNumber, productSequence = 1, batches, orderStatus, editable = false, onCompletedChange }: ShipmentPlanProps) {
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-5 flex items-center justify-between"><div><h2 className="font-bold text-slate-900">交貨計畫 Shipment Plan</h2><p className="mt-1 text-xs text-slate-500">每個交貨批次的生產線、交期、目的地、數量與完成狀況</p></div>{editable && <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">可更新各色生產進度</span>}</div><div className="space-y-3">{batches.map((batch, index) => {
    const quantity = getBatchQuantity(batch);
    const completedQuantity = getBatchCompletedQuantity(batch);
    const progress = getProgress(completedQuantity, quantity);
    const status = batchStatus(batch, orderStatus);
    const batchSequence = index + 1;
    const shipmentBatchNumber = formatShipmentBatchNumber(orderNumber, productSequence, batchSequence);
    return <article key={batch.id} className="rounded-xl border border-slate-200 p-4"><div className="grid gap-4 md:grid-cols-[1.5fr_1fr_1.2fr_1fr_1.6fr] md:items-center"><div><p className="text-xs font-bold text-teal-700">交貨批次 {String(batchSequence).padStart(2, '0')}</p><p className="mt-1 text-sm font-bold text-slate-900">{shipmentBatchNumber}</p><p className="mt-1 text-sm font-semibold text-slate-900">{formatQuantity(quantity)} 雙</p>{batch.note && <p className="mt-1 text-xs text-slate-500">{batch.note}</p>}</div><div><p className="text-xs text-slate-500">生產線</p><p className="mt-1 text-sm font-semibold text-slate-800">{batch.productionLine}</p></div><div><p className="text-xs text-slate-500">目的地 / Due</p><p className="mt-1 text-sm font-semibold text-slate-800">{batch.destinationCountry}</p><p className="text-xs text-slate-500">{formatDate(batch.dueDate)} {isDueSoon(batch) && <span className="ml-1 font-bold text-rose-600">即將到期</span>}</p></div><div><p className="text-xs text-slate-500">狀態</p><p className={`mt-1 text-sm font-bold ${status.className}`}>{status.label}</p></div><div><div className="mb-2 flex items-center justify-between"><span className="text-xs text-slate-500">已完成數量</span><span className="text-sm font-bold text-slate-800">{formatQuantity(completedQuantity)} / {formatQuantity(quantity)} · {progress}%</span></div><ProgressBar value={progress} /></div></div><div className="mt-4 grid gap-2 border-t border-slate-100 pt-3 sm:grid-cols-2 lg:grid-cols-3">{batch.items.filter((item) => item.quantity > 0).map((item) => <div key={item.color} className="rounded-lg bg-slate-50 px-3 py-2"><div className="flex items-center justify-between gap-2"><span className="text-sm font-bold text-slate-800">{item.color}</span><span className="text-xs font-semibold text-slate-500">{formatQuantity(item.quantity)} 雙</span></div><div className="mt-2 flex items-center justify-between gap-2"><span className="text-xs text-slate-500">已完成 {formatQuantity(item.completedQuantity)} / {formatQuantity(item.quantity)}</span>{editable && <label className="flex items-center gap-1 text-xs font-semibold text-slate-600">更新<input aria-label={`交貨批次 ${batchSequence} ${item.color} 已完成數量`} type="number" min="0" max={item.quantity} value={item.completedQuantity} onChange={(event) => onCompletedChange?.(batch.id, item.color, Math.max(0, Math.min(item.quantity, Number(event.target.value))))} className="w-20 rounded-lg border border-slate-300 bg-white px-2 py-1 text-right text-sm text-slate-900 outline-none focus:border-teal-500" /></label>}</div></div>)}</div></article>;
  })}</div></section>;
}
