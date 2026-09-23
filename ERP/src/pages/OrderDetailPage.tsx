import { ProductMedia } from '../components/ProductMedia';
import { ProgressBar } from '../components/ProgressBar';
import { ShipmentPlan } from '../components/ShipmentPlan';
import { StatusBadge } from '../components/StatusBadge';
import { WorkflowStepper } from '../components/WorkflowStepper';
import { formatProductOrderNumber } from '../utils/orderNumbers';
import { formatQuantity, getOrderProgress, sumCompleted, sumDefective } from '../utils/production';
import type { ProductionOrder } from '../types/production';

interface OrderDetailPageProps {
  order: ProductionOrder;
  onBack: () => void;
  onEdit: () => void;
  onCompletedChange: (batchId: string, color: string, quantity: number) => void;
  onDefectiveChange: (batchId: string, color: string, quantity: number) => void;
  onCompleteOrder: () => void;
  onSubmitToPurchasing: () => void;
  onHandoffToProduction: () => void;
  onScheduleOrder: () => void;
  onPauseOrder: () => void;
  onResumeOrder: () => void;
  onStopOrder: (reason: string) => void;
  onCancelOrder: (reason: string) => void;
}

const actionButton = 'rounded-lg px-4 py-2 text-sm font-bold';

function requestReason(action: string, onConfirm: (reason: string) => void) {
  if (!window.confirm(`確定要${action}嗎？`)) return;
  const reason = window.prompt(`請輸入${action}原因`)?.trim();
  if (reason) onConfirm(reason);
}

function OrderActions({ order, completed, onEdit, onCompleteOrder, onSubmitToPurchasing, onHandoffToProduction, onScheduleOrder, onPauseOrder, onResumeOrder, onStopOrder, onCancelOrder }: Omit<OrderDetailPageProps, 'onBack' | 'onCompletedChange' | 'onDefectiveChange'> & { completed: number }) {
  const canCompleteOrder = completed === order.totalQuantity;
  const canEditOrder = order.status === 'draft' || order.status === 'purchasing' || order.status === 'pending';
  const canCancelOrder = order.status === 'draft' || order.status === 'purchasing' || order.status === 'pending';
  const message = {
    draft: '訂單尚未送出採購，請確認資料後送出。',
    purchasing: '採購處理中，確認資料後可交接給生管。',
    pending: '訂單已送出生管，請確認後開始排程。',
    production: '生產進行中，可更新完成數量與不良數量。',
    paused: '排程已暫停，既有生產資料保留，可恢復排程。',
    stopped: '訂單已停止。',
    cancelled: '訂單已取消。',
    completed: '訂單已完成，資料已鎖定。',
  }[order.status];

  return <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4"><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-slate-700">{message}</p><div className="flex flex-wrap gap-2">
    {canEditOrder && <button type="button" onClick={onEdit} className={`${actionButton} border border-teal-600 bg-white text-teal-700 hover:bg-teal-50`}>編輯訂單</button>}
    {order.status === 'draft' && <button type="button" onClick={onSubmitToPurchasing} className={`${actionButton} bg-teal-600 text-white hover:bg-teal-700`}>送出採購</button>}
    {order.status === 'purchasing' && <button type="button" onClick={onHandoffToProduction} className={`${actionButton} bg-amber-600 text-white hover:bg-amber-700`}>送出生管</button>}
    {order.status === 'pending' && <button type="button" onClick={onScheduleOrder} className={`${actionButton} bg-amber-600 text-white hover:bg-amber-700`}>開始排程</button>}
    {order.status === 'production' && <button type="button" onClick={onPauseOrder} className={`${actionButton} border border-orange-300 bg-white text-orange-700 hover:bg-orange-50`}>暫停排程</button>}
    {order.status === 'paused' && <button type="button" onClick={onResumeOrder} className={`${actionButton} bg-cyan-600 text-white hover:bg-cyan-700`}>恢復排程</button>}
    {(order.status === 'production' || order.status === 'paused') && <button type="button" onClick={() => requestReason('停止訂單', onStopOrder)} className={`${actionButton} border border-rose-300 bg-white text-rose-700 hover:bg-rose-50`}>停止訂單</button>}
    {order.status === 'production' && <button type="button" onClick={onCompleteOrder} disabled={!canCompleteOrder} className={`${actionButton} bg-teal-600 text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300`}>完成訂單</button>}
    {canCancelOrder && <button type="button" onClick={() => requestReason(order.status === 'draft' ? '刪除草稿' : '取消訂單', onCancelOrder)} className={`${actionButton} border border-slate-300 bg-white text-slate-600 hover:bg-slate-100`}>{order.status === 'draft' ? '刪除草稿' : '取消訂單'}</button>}
  </div></div>{order.status === 'production' && !canCompleteOrder && <p className="mt-2 text-right text-xs text-slate-500">完成數量達到 {formatQuantity(order.totalQuantity)} 雙後才能完成訂單。</p>}</div>;
}

export function OrderDetailPage({ order, onBack, onEdit, onCompletedChange, onDefectiveChange, onCompleteOrder, onSubmitToPurchasing, onHandoffToProduction, onScheduleOrder, onPauseOrder, onResumeOrder, onStopOrder, onCancelOrder }: OrderDetailPageProps) {
  const completed = sumCompleted(order);
  const defective = sumDefective(order);
  const progress = getOrderProgress(order);
  const canEditProduction = order.status === 'production' || order.status === 'paused';
  const productSequence = order.productSequence ?? 1;

  const statusNoteLabel = order.status === 'cancelled' ? '取消原因' : '停止原因';
  return <main className="min-h-screen bg-slate-50"><header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4"><button type="button" onClick={onBack} className="text-sm font-bold text-slate-500 hover:text-teal-700">← 返回生產訂單</button><div className="text-right"><p className="text-[10px] font-bold tracking-wider text-slate-400">訂單總編號</p><p className="mt-0.5 text-sm font-bold text-slate-800">{order.orderNumber}</p><p className="mt-0.5 text-xs font-semibold text-teal-700">鞋型生產單 {formatProductOrderNumber(order.orderNumber, productSequence)}</p></div></div></header><div className="mx-auto max-w-6xl px-5 py-8"><div className="mb-6 grid gap-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-[340px_1fr]"><ProductMedia product={order.product} size="large" interactive={order.product.mediaType === '3d'} /><section className="flex min-w-0 flex-col"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold tracking-wider text-teal-700">{order.product.productCode}</p><h1 className="mt-1 text-2xl font-bold text-slate-900">{order.product.productName}</h1><p className="mt-1 text-sm text-slate-500">Material：{order.product.material}</p></div><StatusBadge status={order.status} /></div>{order.statusReason && <div className={`mt-4 rounded-xl border p-4 ${order.status === 'cancelled' ? 'border-slate-200 bg-slate-50' : 'border-rose-100 bg-rose-50'}`}><p className="text-xs font-bold text-slate-500">訂單異動備註</p><p className="mt-1 text-sm font-semibold text-slate-800">{statusNoteLabel}：{order.statusReason}</p></div>}<div className="mt-6"><p className="text-xs text-slate-500">各色數量</p><div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3">{order.items.map((item) => <div key={item.color} className="rounded-lg bg-slate-50 px-3 py-2"><p className="text-sm font-bold text-slate-800">{item.color}</p><p className="mt-1 text-sm font-bold text-teal-700">{formatQuantity(item.quantity)} 雙</p></div>)}</div></div><div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4"><div><p className="text-xs text-slate-500">總數量</p><p className="mt-1 text-sm font-bold text-slate-800">{formatQuantity(order.totalQuantity)} 雙</p></div><div><p className="text-xs text-slate-500">已完成數量</p><p className="mt-1 text-sm font-bold text-teal-700">{formatQuantity(completed)} 雙</p></div><div><p className="text-xs text-slate-500">不良數量</p><p className="mt-1 text-sm font-bold text-rose-600">{formatQuantity(defective)} 雙</p></div><div><p className="text-xs text-slate-500">剩餘數量</p><p className="mt-1 text-sm font-bold text-slate-800">{formatQuantity(order.totalQuantity - completed)} 雙</p></div></div><div className="mt-6"><div className="mb-2 flex justify-between text-sm"><span className="font-semibold text-slate-700">Overall Progress</span><strong className="text-teal-700">{progress}%</strong></div><ProgressBar value={progress} className="h-3" /></div><OrderActions order={order} completed={completed} onEdit={onEdit} onCompleteOrder={onCompleteOrder} onSubmitToPurchasing={onSubmitToPurchasing} onHandoffToProduction={onHandoffToProduction} onScheduleOrder={onScheduleOrder} onPauseOrder={onPauseOrder} onResumeOrder={onResumeOrder} onStopOrder={onStopOrder} onCancelOrder={onCancelOrder} /><div className="mt-auto pt-7"><WorkflowStepper status={order.status} /></div></section></div><ShipmentPlan orderNumber={order.orderNumber} productSequence={productSequence} batches={order.deliveryBatches} orderStatus={order.status} editable={canEditProduction} onCompletedChange={onCompletedChange} onDefectiveChange={onDefectiveChange} /></div></main>;
}
