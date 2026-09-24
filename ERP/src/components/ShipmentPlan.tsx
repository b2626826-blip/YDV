import { useState, type ReactNode } from 'react';
import { useTranslation } from '../i18n';
import { ProgressBar } from './ProgressBar';
import { formatShipmentBatchNumber } from '../utils/orderNumbers';
import { formatDate, formatQuantity, getBatchCompletedQuantity, getBatchDefectiveQuantity, getBatchQuantity, getProgress, isDueSoon, isOpenStatus, isOverdue } from '../utils/production';
import { COLOR_SWATCHES } from '../config/constants';
import { EU_SHOE_SIZES, type DeliveryBatch, type OrderItem, type ProductionStatus } from '../types/production';

interface ShipmentPlanProps {
  orderNumber: string;
  productSequence?: number;
  batches: DeliveryBatch[];
  availableColors: string[];
  items: OrderItem[];
  orderStatus: ProductionStatus;
  editable?: boolean;
  onCompletedChange?: (batchId: string, color: string, completedQuantity: number) => void;
  onDefectiveChange?: (batchId: string, color: string, defectiveQuantity: number) => void;
}

function ColorSizeSelection({ availableColors, items, children }: Pick<ShipmentPlanProps, 'availableColors' | 'items'> & { children: (color: string) => ReactNode }) {
  const t = useTranslation();
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [isSizeExpanded, setIsSizeExpanded] = useState(false);
  const selectedItem = items.find((item) => item.color === selectedColor);

  return <div className="bg-slate-50 p-4">
    <div className="flex flex-wrap items-end justify-between gap-2">
      <div>
        <h3 className="text-sm font-bold text-slate-900">{t('選擇顏色')}</h3>
        <p className="mt-1 text-xs text-slate-500">{t('有星號的顏色有訂單；點選後顯示該色尺碼與交貨計劃。')}</p>
      </div>
      <span className="text-xs text-slate-400">{t('灰階為尚未訂購')}</span>
    </div>
    <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {availableColors.map((color) => {
        const item = items.find((entry) => entry.color === color && entry.quantity > 0);
        const selected = selectedColor === color;
        return <button
          key={color}
          type="button"
          disabled={!item}
          aria-pressed={Boolean(item) && selected}
          aria-expanded={selected}
          aria-controls="selected-color-details"
          aria-label={item ? t('{color}，有訂單，{quantity} 雙', { color, quantity: formatQuantity(item.quantity) }) : t('{color}，尚無訂單', { color })}
          onClick={() => {
            if (!item) return;
            setSelectedColor(selected ? null : color);
            setIsSizeExpanded(false);
          }}
          className={`relative flex min-h-24 items-center gap-4 rounded-xl border px-4 py-4 text-left transition ${item ? selected ? 'border-teal-500 bg-teal-50 ring-2 ring-teal-100' : 'border-slate-200 bg-white hover:border-teal-300' : 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 grayscale opacity-60'}`}
        >
          <span className="h-12 w-16 shrink-0 rounded-lg border border-slate-200" style={{ backgroundColor: COLOR_SWATCHES[color] ?? '#e2e8f0' }} />
          <span className="min-w-0">
            <span className={`block truncate text-base font-bold ${item ? 'text-slate-800' : 'text-slate-400'}`}>{color}</span>
            <span className={`mt-1 block text-sm font-semibold ${item ? 'text-teal-700' : 'text-slate-400'}`}>{item ? `${formatQuantity(item.quantity)} ${t('雙')}` : t('尚無訂單')}</span>
          </span>
          {item && <span aria-hidden="true" className="absolute right-3 top-2 text-lg leading-none text-amber-500">★</span>}
        </button>;
      })}
    </div>
    {selectedItem ? <div id="selected-color-details">
      <section aria-label={t('尺寸數量')} className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
      <button type="button" aria-expanded={isSizeExpanded} aria-controls="selected-color-size-grid" onClick={() => setIsSizeExpanded(!isSizeExpanded)} className="flex w-full flex-wrap items-center justify-between gap-2 text-left">
        <span><span className="block text-sm font-bold text-slate-900">{t('尺寸數量')}</span><span className="mt-1 block text-xs text-slate-500">EU 36–45 · {selectedItem.color}</span></span>
        <span className="text-xs font-semibold text-teal-700">{t(isSizeExpanded ? '收合' : '展開')} · {t(selectedItem.sizeQuantitiesSample ? '數量示意' : selectedItem.sizeQuantities ? '訂單數量' : '尚未設定')}</span>
      </button>
      {isSizeExpanded && <div id="selected-color-size-grid" className="mt-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 xl:grid-cols-10">
          {EU_SHOE_SIZES.map((size) => {
            const quantity = selectedItem.sizeQuantities?.find((entry) => entry.size === size)?.quantity;
            return <div key={size} className="rounded-lg border border-slate-200 bg-white px-2 py-3 text-center"><p className="text-xs font-semibold text-slate-500">EU {size}</p><p className="mt-1 text-sm font-bold text-slate-900">{quantity === undefined ? '—' : formatQuantity(quantity)}<span className="ml-1 text-[10px] font-medium text-slate-500">{t('雙')}</span></p></div>;
          })}
        </div>
        {!selectedItem.sizeQuantities && <p className="mt-3 text-xs text-slate-500">{t('此顏色尚無尺寸數量資料。')}</p>}
      </div>}
      </section>
      <section aria-label={t('交貨批次')} className="mt-4 border-t border-slate-200 pt-4">
        <h4 className="text-sm font-bold text-slate-900">{t('交貨批次')}</h4>
        {children(selectedItem.color)}
      </section>
    </div> : <div className="mt-4 rounded-xl border border-dashed border-slate-300 px-4 py-6 text-center"><p className="text-sm font-semibold text-slate-700">{t('尚未選擇有訂單的顏色')}</p><p className="mt-1 text-xs text-slate-500">{t('點選右上角有星號的色塊，展開尺寸數量與交貨計劃。')}</p></div>}
  </div>;
}

function batchStatus(batch: DeliveryBatch, orderStatus: ProductionStatus) {
  const quantity = getBatchQuantity(batch);
  const completedQuantity = getBatchCompletedQuantity(batch);
  if (completedQuantity === quantity) return { label: '已完成', className: 'text-emerald-700' };
  if (orderStatus === 'stopped') return { label: '已停止', className: 'text-rose-700' };
  if (orderStatus === 'cancelled') return { label: '已取消', className: 'text-slate-500' };
  if (orderStatus === 'paused') return { label: '已暫停', className: 'text-orange-700' };
  if (completedQuantity > 0) return { label: '生產中', className: 'text-cyan-700' };
  if (orderStatus === 'draft') return { label: '待送採購', className: 'text-slate-600' };
  if (orderStatus === 'pending') return { label: '待生管排程', className: 'text-slate-600' };
  if (orderStatus === 'purchasing') return { label: '採購中', className: 'text-amber-700' };
  if (orderStatus === 'production') return { label: '已排程', className: 'text-cyan-700' };
  return { label: '待生產', className: 'text-slate-600' };
}

interface ColorBatchCardProps {
  batch: DeliveryBatch;
  item: DeliveryBatch['items'][number];
  batchSequence: number;
  orderNumber: string;
  productSequence: number;
  orderStatus: ProductionStatus;
  editable: boolean;
  onCompletedChange?: ShipmentPlanProps['onCompletedChange'];
  onDefectiveChange?: ShipmentPlanProps['onDefectiveChange'];
}

function ColorBatchCard({ batch, item, batchSequence, orderNumber, productSequence, orderStatus, editable, onCompletedChange, onDefectiveChange }: ColorBatchCardProps) {
  const t = useTranslation();
  const colorBatch = { ...batch, items: [item] };
  const quantity = getBatchQuantity(colorBatch);
  const completedQuantity = getBatchCompletedQuantity(colorBatch);
  const defectiveQuantity = getBatchDefectiveQuantity(colorBatch);
  const progress = getProgress(completedQuantity, quantity);
  const status = batchStatus(colorBatch, orderStatus);
  const shipmentBatchNumber = formatShipmentBatchNumber(orderNumber, productSequence, batchSequence);

  return <article className="py-4"><div className="grid gap-4 md:grid-cols-[1.5fr_1fr_1.2fr_1fr_1.6fr] md:items-center">
    <div><p className="text-xs font-bold text-teal-700">{t('交貨批次')} {String(batchSequence).padStart(2, '0')}</p><p className="mt-1 text-sm font-bold text-slate-900">{shipmentBatchNumber}</p><p className="mt-1 text-sm font-semibold text-slate-900">{formatQuantity(quantity)} {t('雙')}</p><p className="mt-1 text-xs font-semibold text-rose-600">{t('不良數量')} {formatQuantity(defectiveQuantity)} {t('雙')}</p>{batch.note && <p className="mt-1 text-xs text-slate-500">{t('備註：')}{batch.note}</p>}</div>
    <div><p className="text-xs text-slate-500">{t('生產線')}</p><p className="mt-1 text-sm font-semibold text-slate-800">{batch.productionLine ? t(batch.productionLine) : t('未指定')}</p></div>
    <div><p className="text-xs text-slate-500">{t('目的地 / Due')}</p><p className="mt-1 text-sm font-semibold text-slate-800">{batch.destinationCountry}</p><p className="text-xs text-slate-500">{formatDate(batch.dueDate)} {isOpenStatus(orderStatus) && isDueSoon(colorBatch) && <span className="ml-1 font-bold text-rose-600">{t(isOverdue(colorBatch) ? '已逾期' : '即將到期')}</span>}</p></div>
    <div><p className="text-xs text-slate-500">{t('狀態')}</p><p className={`mt-1 text-sm font-bold ${status.className}`}>{t(status.label)}</p></div>
    <div><div className="mb-2 flex items-center justify-between"><span className="text-xs text-slate-500">{t('已完成數量')}</span><span className="text-sm font-bold text-slate-800">{formatQuantity(completedQuantity)} / {formatQuantity(quantity)} · {progress}%</span></div><ProgressBar value={progress} /></div>
  </div><div className="mt-4 flex flex-wrap items-end justify-between gap-4 border-t border-slate-100 pt-4">
    <section className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4" aria-label={t('批次尺寸數量')}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h4 className="text-sm font-bold text-slate-800">{t('批次尺寸數量')}</h4><span className="text-xs text-slate-500">EU 36–45</span></div>
      {item.sizeQuantities?.length ? <div className="grid grid-cols-2 gap-2 sm:grid-cols-5 xl:grid-cols-10">{EU_SHOE_SIZES.map((size) => <div key={size} className="rounded-lg border border-slate-200 bg-white px-2 py-2 text-center"><p className="text-xs font-semibold text-slate-500">EU {size}</p><p className="mt-1 text-sm font-bold text-slate-900">{formatQuantity(item.sizeQuantities?.find((entry) => entry.size === size)?.quantity ?? 0)} <span className="text-[10px] font-medium text-slate-500">{t('雙')}</span></p></div>)}</div> : <p className="text-sm text-slate-500">{t('尚未填寫尺寸數量')}</p>}
    </section>
    <label className="block"><span className="block text-sm font-semibold text-slate-700">{t('已完成數量')}</span>{editable ? <span className="mt-2 flex items-center gap-3"><input aria-label={t('交貨批次 {batch} {color} 已完成數量', { batch: batchSequence, color: item.color })} type="number" min="0" max={item.quantity} value={item.completedQuantity} onChange={(event) => onCompletedChange?.(batch.id, item.color, Math.max(0, Math.min(item.quantity, Math.floor(Number(event.target.value)))))} className="h-14 w-36 rounded-xl border border-slate-300 bg-white px-4 text-center text-2xl font-bold text-slate-900 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" /><span className="text-sm font-semibold text-slate-500">/ {formatQuantity(item.quantity)} {t('雙')}</span></span> : <span className="mt-2 block text-lg font-bold text-slate-800">{formatQuantity(item.completedQuantity)} / {formatQuantity(item.quantity)} {t('雙')}</span>}</label>
    {editable && <label className="flex items-center gap-2 text-sm font-semibold text-rose-700">{t('不良數量')}<input aria-label={t('交貨批次 {batch} {color} 不良數量', { batch: batchSequence, color: item.color })} type="number" min="0" value={item.defectiveQuantity ?? 0} onChange={(event) => onDefectiveChange?.(batch.id, item.color, Math.max(0, Math.floor(Number(event.target.value))))} className="h-11 w-24 rounded-lg border border-rose-200 bg-white px-3 text-right text-base text-slate-900 outline-none focus:border-rose-500" /></label>}
  </div></article>;
}

export function ShipmentPlan({ orderNumber, productSequence = 1, batches, availableColors, items, orderStatus, editable = false, onCompletedChange, onDefectiveChange }: ShipmentPlanProps) {
  const t = useTranslation();
  return <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-5 flex items-center justify-between"><div><h2 className="font-bold text-slate-900">{t('交貨計畫 Shipment Plan')}</h2><p className="mt-1 text-xs text-slate-500">{t('每個交貨批次的生產線、交期、目的地、數量與完成狀況')}</p></div>{editable && <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">{t('可更新各色生產進度')}</span>}</div><div className="overflow-hidden rounded-xl border border-slate-200"><ColorSizeSelection availableColors={availableColors} items={items}>{(color) => {
    const colorBatches = batches.flatMap((batch, index) => {
      const item = batch.items.find((entry) => entry.color === color && entry.quantity > 0);
      return item ? [{ batch, batchSequence: index + 1, item }] : [];
    });
    return colorBatches.length ? <div className="mt-3 divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white px-4">{colorBatches.map(({ batch, batchSequence, item }) => <ColorBatchCard key={batch.id} batch={batch} item={item} batchSequence={batchSequence} orderNumber={orderNumber} productSequence={productSequence} orderStatus={orderStatus} editable={editable} onCompletedChange={onCompletedChange} onDefectiveChange={onDefectiveChange} />)}</div> : <p className="mt-3 rounded-lg bg-white px-4 py-6 text-center text-sm text-slate-500">{t('此顏色尚無交貨計劃。')}</p>;
  }}</ColorSizeSelection></div></section>;
}
