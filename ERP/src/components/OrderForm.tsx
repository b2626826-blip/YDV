import { useMemo, useState } from 'react';
import { ProductMedia } from './ProductMedia';
import { formatDate, formatQuantity, getBatchQuantity } from '../utils/production';
import type { DeliveryBatch, NewOrderDraft, Product, ProductionOrder } from '../types/production';

const steps = ['選擇產品', '已選鞋型', '選擇顏色', '設定數量', '交貨批次', '確認設定'];
const emptyDraft: NewOrderDraft = { productId: null, selectedColors: [], quantities: {}, batches: [] };
const productsPerPage = 12;
const numberValue = (value: string) => Math.max(0, Math.floor(Number(value)) || 0);
const makeId = () => globalThis.crypto?.randomUUID?.() ?? `1790045166706-${Math.random().toString(36).slice(2)}`;
const cloneOrder = (order: ProductionOrder): ProductionOrder => ({
  ...order,
  product: { ...order.product, availableColors: [...order.product.availableColors] },
  items: order.items.map((item) => ({ ...item })),
  deliveryBatches: order.deliveryBatches.map((batch) => ({ ...batch, items: batch.items.map((item) => ({ ...item })) })),
});
const orderToDraft = (order: ProductionOrder): NewOrderDraft => ({
  productId: order.product.id,
  selectedColors: order.items.map((item) => item.color),
  quantities: Object.fromEntries(order.items.map((item) => [item.color, item.quantity])),
  batches: order.deliveryBatches.map((batch) => ({ ...batch, items: batch.items.map((item) => ({ ...item })) })),
});

interface OrderFormProps {
  products: Product[];
  onCancel: () => void;
  onCreate?: (orders: ProductionOrder[]) => void;
  initialOrder?: ProductionOrder;
  onUpdate?: (order: ProductionOrder) => void;
}

export function OrderForm({ products, onCancel, onCreate, initialOrder, onUpdate }: OrderFormProps) {
  const editingOrder = Boolean(initialOrder);
  const [step, setStep] = useState(initialOrder ? 1 : 0);
  const [draft, setDraft] = useState<NewOrderDraft>(() => initialOrder ? orderToDraft(initialOrder) : emptyDraft);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(() => initialOrder ? [initialOrder.product.id] : []);
  const [configuredOrders, setConfiguredOrders] = useState<ProductionOrder[]>(() => initialOrder ? [cloneOrder(initialOrder)] : []);
  const [catalogQuery, setCatalogQuery] = useState('');
  const [catalogPage, setCatalogPage] = useState(0);
  const [notice, setNotice] = useState('');

  const selectedProduct = products.find((product) => product.id === draft.productId);
  const cartProducts = selectedProductIds.map((id) => products.find((product) => product.id === id)).filter((product): product is Product => Boolean(product));
  const nextProduct = cartProducts.find((product) => !configuredOrders.some((order) => order.product.id === product.id));
  const allProductsConfigured = cartProducts.length > 0 && !nextProduct;
  const totalQuantity = Object.values(draft.quantities).reduce((sum, quantity) => sum + quantity, 0);
  const allocatedQuantity = draft.batches.reduce((sum, batch) => sum + getBatchQuantity(batch), 0);
  const remainingQuantity = totalQuantity - allocatedQuantity;
  const allocatedQuantityByColor = (color: string) => draft.batches.reduce((sum, batch) => sum + (batch.items.find((item) => item.color === color)?.quantity ?? 0), 0);
  const colorAllocationValid = draft.selectedColors.every((color) => allocatedQuantityByColor(color) === draft.quantities[color]);
  const allocationValid = totalQuantity > 0 && allocatedQuantity === totalQuantity && colorAllocationValid && draft.batches.length > 0 && draft.batches.every((batch) => getBatchQuantity(batch) > 0 && batch.dueDate && batch.destinationCountry.trim());
  const filteredProducts = useMemo(() => {
    const query = catalogQuery.trim().toLocaleLowerCase();
    if (!query) return products;
    return products.filter((product) => product.productCode.toLocaleLowerCase().includes(query) || product.productName.toLocaleLowerCase().includes(query));
  }, [catalogQuery, products]);
  const pageCount = Math.max(1, Math.ceil(filteredProducts.length / productsPerPage));
  const visibleProducts = filteredProducts.slice(catalogPage * productsPerPage, (catalogPage + 1) * productsPerPage);

  const updateDraft = (updater: (current: NewOrderDraft) => NewOrderDraft) => {
    setNotice('');
    setDraft((current) => updater(current));
  };
  const toggleProduct = (product: Product) => {
    if (editingOrder) return;
    const isSelected = selectedProductIds.includes(product.id);
    setSelectedProductIds((current) => isSelected ? current.filter((id) => id !== product.id) : [...current, product.id]);
    if (isSelected) {
      setConfiguredOrders((current) => current.filter((order) => order.product.id !== product.id));
      if (draft.productId === product.id) setDraft(emptyDraft);
    }
    setNotice('');
  };
  const removeProduct = (productId: string) => {
    if (editingOrder) return;
    setSelectedProductIds((current) => current.filter((id) => id !== productId));
    setConfiguredOrders((current) => current.filter((order) => order.product.id !== productId));
    if (draft.productId === productId) setDraft(emptyDraft);
    setNotice('');
  };
  const beginConfiguration = (product: Product) => {
    const configuredOrder = configuredOrders.find((order) => order.product.id === product.id);
    setDraft(configuredOrder ? orderToDraft(configuredOrder) : { ...emptyDraft, productId: product.id });
    setNotice('');
    setStep(2);
  };
  const toggleColor = (color: string) => updateDraft((current) => {
    const selected = current.selectedColors.includes(color);
    return selected
      ? { ...current, selectedColors: current.selectedColors.filter((item) => item !== color), quantities: Object.fromEntries(Object.entries(current.quantities).filter(([item]) => item !== color)), batches: current.batches.map((batch) => ({ ...batch, items: batch.items.filter((item) => item.color !== color) })) }
      : { ...current, selectedColors: [...current.selectedColors, color], quantities: { ...current.quantities, [color]: current.quantities[color] ?? 0 }, batches: current.batches.map((batch) => ({ ...batch, items: [...batch.items, { color, quantity: 0, completedQuantity: 0, defectiveQuantity: 0 }] })) };
  });
  const updateQuantity = (color: string, quantity: number) => updateDraft((current) => ({ ...current, quantities: { ...current.quantities, [color]: quantity } }));
  const addBatch = () => updateDraft((current) => ({ ...current, batches: [...current.batches, { id: `draft-batch-${makeId()}`, batchNumber: current.batches.length + 1, productionLine: '生產線 A', items: current.selectedColors.map((color) => ({ color, quantity: 0, completedQuantity: 0, defectiveQuantity: 0 })), dueDate: '', destinationCountry: '', note: '' }] }));
  const updateBatch = (id: string, patch: Partial<DeliveryBatch>) => updateDraft((current) => ({ ...current, batches: current.batches.map((batch, index) => batch.id === id ? { ...batch, ...patch, batchNumber: index + 1 } : { ...batch, batchNumber: index + 1 }) }));
  const updateBatchColorQuantity = (batchId: string, color: string, quantity: number) => updateDraft((current) => ({ ...current, batches: current.batches.map((batch) => batch.id === batchId ? { ...batch, items: batch.items.map((item) => item.color === color ? { ...item, quantity } : item) } : batch) }));
  const removeBatch = (id: string) => updateDraft((current) => ({ ...current, batches: current.batches.filter((batch) => batch.id !== id).map((batch, index) => ({ ...batch, batchNumber: index + 1 })) }));

  const canMoveForward = useMemo(() => {
    if (step === 0) return selectedProductIds.length > 0;
    if (step === 2) return draft.selectedColors.length > 0;
    if (step === 3) return totalQuantity > 0 && draft.selectedColors.every((color) => draft.quantities[color] > 0);
    if (step === 4) return allocationValid;
    return true;
  }, [allocationValid, draft.quantities, draft.selectedColors, selectedProductIds.length, step, totalQuantity]);

  const goNext = () => {
    if (step === 1) {
      if (nextProduct) beginConfiguration(nextProduct);
      return;
    }
    if (!canMoveForward) {
      setNotice(step === 4 ? '請完成所有交貨批次欄位，且每種顏色的已分配數量必須等於訂購數量。' : '請完成此步驟的必要資料後再繼續。');
      return;
    }
    setNotice('');
    setStep((current) => Math.min(current + 1, steps.length - 1));
  };
  const saveConfiguredProduct = () => {
    if (!selectedProduct || !allocationValid) return;
    const existingOrder = configuredOrders.find((item) => item.product.id === selectedProduct.id);
    const order: ProductionOrder = {
      ...(existingOrder ?? {}),
      id: existingOrder?.id ?? `order-${makeId()}`,
      orderNumber: existingOrder?.orderNumber ?? '',
      product: selectedProduct,
      items: draft.selectedColors.map((color) => ({ color, quantity: draft.quantities[color] })),
      totalQuantity,
      deliveryBatches: draft.batches,
      status: existingOrder?.status ?? 'draft',
      createdAt: existingOrder?.createdAt ?? new Date().toISOString().slice(0, 10),
    };
    setConfiguredOrders((current) => [...current.filter((item) => item.product.id !== selectedProduct.id), order]);
    setDraft(emptyDraft);
    setNotice('');
    setStep(1);
  };
  const createOrders = () => {
    if (!allProductsConfigured) return;
    const orders = selectedProductIds.map((id) => configuredOrders.find((order) => order.product.id === id)).filter((order): order is ProductionOrder => Boolean(order));
    if (editingOrder) {
      if (orders[0]) onUpdate?.(orders[0]);
      return;
    }
    onCreate?.(orders);
  };

  const primaryAction = step === 1
    ? { label: editingOrder ? '儲存變更' : allProductsConfigured ? `建立 1 張總訂單（${configuredOrders.length} 張鞋型生產單）` : '設定下一款鞋型', action: editingOrder || allProductsConfigured ? createOrders : goNext }
    : step === steps.length - 1
      ? { label: '儲存此鞋型設定', action: saveConfiguredProduct }
      : { label: '下一步 →', action: goNext };

  return <main className="min-h-screen bg-slate-50"><header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur"><div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4"><div><button type="button" onClick={onCancel} className="text-sm font-semibold text-slate-500 hover:text-teal-700">← 返回 Dashboard</button><h1 className="mt-1 text-xl font-bold text-slate-900">{editingOrder ? '編輯生產訂單' : '新增生產訂單'}</h1></div><span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-700">已選 {cartProducts.length} 款鞋型</span></div></header><div className="mx-auto max-w-6xl px-5 py-8"><ol className="mb-8 grid grid-cols-6 gap-2">{steps.map((label, index) => <li key={label} className="min-w-0"><div className={`mb-2 h-1 rounded-full ${index <= step ? 'bg-teal-500' : 'bg-slate-200'}`} /><span className={`hidden text-xs font-semibold sm:block ${index === step ? 'text-teal-700' : 'text-slate-500'}`}>{index + 1}. {label}</span></li>)}</ol><section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-7"><div className="mb-6"><p className="text-xs font-bold tracking-wider text-teal-700">STEP {step + 1} / {steps.length}</p><h2 className="mt-1 text-2xl font-bold text-slate-900">{steps[step]}</h2></div>
    {step === 0 && <div><div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-sm text-slate-500">可同時選取多款鞋型，完成清單後逐一設定各自的顏色、數量與交貨批次。</p><p className="mt-1 text-xs font-semibold text-teal-700">已選 {cartProducts.length} 款鞋型</p></div><label className="relative w-full sm:w-72"><span className="sr-only">搜尋 Product Code 或產品名稱</span><input value={catalogQuery} onChange={(event) => { setCatalogQuery(event.target.value); setCatalogPage(0); }} placeholder="搜尋 Product Code 或產品名稱" className="w-full rounded-lg border border-slate-300 py-2 pl-9 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-teal-500" /><span className="pointer-events-none absolute left-3 top-2.5 text-slate-400">⌕</span></label></div><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{visibleProducts.map((product) => { const isSelected = selectedProductIds.includes(product.id); return <button type="button" key={product.id} onClick={() => toggleProduct(product)} aria-pressed={isSelected} className={`overflow-hidden rounded-xl border text-left transition ${isSelected ? 'border-teal-500 ring-2 ring-teal-100' : 'border-slate-200 hover:border-teal-300'}`}><ProductMedia product={product} size="card" /><div className="p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-bold text-teal-700">{product.productCode}</p><p className="mt-1 font-bold text-slate-900">{product.productName}</p></div>{isSelected && <span className="rounded-full bg-teal-50 px-2 py-1 text-[10px] font-bold text-teal-700">已選取</span>}</div><p className="mt-1 text-xs text-slate-500">{product.material}</p></div></button>; })}</div>{visibleProducts.length === 0 && <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">找不到符合條件的產品。</div>}<div className="mt-5 flex items-center justify-between gap-4 border-t border-slate-100 pt-4"><p className="text-xs text-slate-500">顯示 {filteredProducts.length === 0 ? 0 : catalogPage * productsPerPage + 1}–{Math.min((catalogPage + 1) * productsPerPage, filteredProducts.length)} / {filteredProducts.length} 款</p><div className="flex items-center gap-2"><button type="button" onClick={() => setCatalogPage((current) => Math.max(0, current - 1))} disabled={catalogPage === 0} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40">上一頁</button><span className="text-xs font-semibold text-slate-500">{catalogPage + 1} / {pageCount}</span><button type="button" onClick={() => setCatalogPage((current) => Math.min(pageCount - 1, current + 1))} disabled={catalogPage === pageCount - 1} className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40">下一頁</button></div></div></div>}
    {step === 1 && <div><p className="mb-4 text-sm text-slate-500">{editingOrder ? '可重新修改顏色、數量與交貨批次，儲存後回到訂單明細。' : '確認要建立的鞋型；所有鞋型會共用一張總訂單，並分別建立鞋型生產單。'}</p><div className="space-y-3">{cartProducts.map((product) => { const configuredOrder = configuredOrders.find((order) => order.product.id === product.id); return <article key={product.id} className="flex flex-col gap-4 rounded-xl border border-slate-200 p-4 sm:flex-row sm:items-center"><ProductMedia product={product} size="thumbnail" /><div className="min-w-0 flex-1"><p className="text-xs font-bold text-teal-700">{product.productCode}</p><p className="mt-1 font-bold text-slate-900">{product.productName}</p><p className="mt-1 text-xs text-slate-500">{configuredOrder ? `已設定 ${formatQuantity(configuredOrder.totalQuantity)} 雙` : '尚未設定顏色、數量與交貨批次'}</p></div><div className="flex flex-wrap gap-2"><button type="button" onClick={() => beginConfiguration(product)} className="rounded-lg border border-teal-600 px-3 py-2 text-sm font-bold text-teal-700 hover:bg-teal-50">{configuredOrder ? '編輯設定' : '設定此鞋型'}</button>{!editingOrder && <button type="button" onClick={() => removeProduct(product.id)} className="rounded-lg px-3 py-2 text-sm font-bold text-rose-600 hover:bg-rose-50">移除</button>}</div></article>; })}</div></div>}
    {step === 2 && selectedProduct && <div><p className="mb-4 text-sm text-slate-500">設定 {selectedProduct.productCode} 的生產顏色。</p><div className="grid gap-3 sm:grid-cols-2">{selectedProduct.availableColors.map((color) => <label key={color} className={`flex cursor-pointer items-center gap-3 rounded-xl border p-4 ${draft.selectedColors.includes(color) ? 'border-teal-400 bg-teal-50' : 'border-slate-200'}`}><input type="checkbox" checked={draft.selectedColors.includes(color)} onChange={() => toggleColor(color)} className="h-4 w-4 accent-teal-600" /><span className="h-4 w-4 rounded-full border border-slate-300 bg-slate-700" /><span className="font-semibold text-slate-800">{color}</span></label>)}</div></div>}
    {step === 3 && <div><p className="mb-4 text-sm text-slate-500">輸入每種顏色的生產數量，系統會自動加總。</p><div className="space-y-3">{draft.selectedColors.map((color) => <label key={color} className="flex items-center justify-between rounded-xl border border-slate-200 p-4"><span className="font-semibold text-slate-800">{color}</span><span className="flex items-center gap-2"><input aria-label={`${color} 生產數量`} type="number" min="0" value={draft.quantities[color] || ''} onChange={(event) => updateQuantity(color, numberValue(event.target.value))} className="w-36 rounded-lg border border-slate-300 px-3 py-2 text-right font-semibold outline-none focus:border-teal-500" /><span className="text-sm text-slate-500">雙</span></span></label>)}</div><div className="mt-5 rounded-xl bg-teal-50 p-5"><p className="text-sm text-teal-700">總生產數量</p><p className="mt-1 text-3xl font-bold text-teal-900">{formatQuantity(totalQuantity)} <span className="text-base">雙</span></p></div></div>}
    {step === 4 && <div><div className="mb-5 flex items-end justify-between gap-4"><p className="text-sm text-slate-500">每批可分配不同顏色，系統會檢查每色分配總和是否等於訂購數量。</p><button type="button" onClick={addBatch} className="shrink-0 rounded-lg bg-teal-600 px-4 py-2 text-sm font-bold text-white hover:bg-teal-700">＋ 新增交貨批次</button></div>{draft.batches.length === 0 ? <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">尚未建立交貨批次。</div> : <div className="space-y-4">{draft.batches.map((batch) => <article key={batch.id} className="rounded-xl border border-slate-200 p-4"><div className="mb-3 flex items-center justify-between"><h3 className="font-bold text-slate-900">Batch {String(batch.batchNumber).padStart(2, '0')} <span className="text-sm font-medium text-slate-500">{formatQuantity(getBatchQuantity(batch))} 雙</span></h3><button type="button" onClick={() => removeBatch(batch.id)} className="text-sm font-semibold text-rose-600 hover:text-rose-700">刪除</button></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><label className="text-xs font-semibold text-slate-500">交期<input aria-label={`Batch ${batch.batchNumber} 交期`} type="date" value={batch.dueDate} onChange={(event) => updateBatch(batch.id, { dueDate: event.target.value })} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-500" /></label><label className="text-xs font-semibold text-slate-500">目的國家 / 地點<input aria-label={`Batch ${batch.batchNumber} 目的地`} value={batch.destinationCountry} onChange={(event) => updateBatch(batch.id, { destinationCountry: event.target.value })} placeholder="例如 Vietnam" className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-500" /></label><label className="text-xs font-semibold text-slate-500">備註（選填）<input aria-label={`Batch ${batch.batchNumber} 備註`} value={batch.note ?? ''} onChange={(event) => updateBatch(batch.id, { note: event.target.value })} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-teal-500" /></label></div><div className="mt-4 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2 lg:grid-cols-3">{batch.items.map((item) => <label key={item.color} className="text-xs font-semibold text-slate-500">{item.color} 數量<input aria-label={`Batch ${batch.batchNumber} ${item.color} 數量`} type="number" min="0" value={item.quantity || ''} onChange={(event) => updateBatchColorQuantity(batch.id, item.color, numberValue(event.target.value))} className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-right text-sm text-slate-900 outline-none focus:border-teal-500" /></label>)}</div></article>)}</div>}<div className={`mt-5 rounded-xl p-5 ${allocationValid ? 'bg-emerald-50' : 'bg-amber-50'}`}><div className="grid gap-3 sm:grid-cols-3"><p><span className="block text-xs text-slate-500">總訂單數量</span><strong className="text-lg text-slate-900">{formatQuantity(totalQuantity)} 雙</strong></p><p><span className="block text-xs text-slate-500">已分配數量</span><strong className="text-lg text-slate-900">{formatQuantity(allocatedQuantity)} 雙</strong></p><p><span className="block text-xs text-slate-500">{remainingQuantity < 0 ? '超出分配' : '尚未分配'}</span><strong className={`text-lg ${remainingQuantity === 0 ? 'text-emerald-700' : remainingQuantity < 0 ? 'text-rose-700' : 'text-amber-700'}`}>{formatQuantity(Math.abs(remainingQuantity))} 雙</strong></p></div><div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{draft.selectedColors.map((color) => <p key={color} className="rounded-lg bg-white/60 px-3 py-2 text-sm"><span className="font-semibold text-slate-700">{color}</span><span className="ml-2 text-slate-500">{formatQuantity(allocatedQuantityByColor(color))} / {formatQuantity(draft.quantities[color])} 雙</span></p>)}</div><p className={`mt-3 text-sm font-semibold ${allocationValid ? 'text-emerald-700' : 'text-amber-800'}`}>{allocationValid ? '✓ 每種顏色的交貨批次分配與訂購數量相符，可以儲存此鞋型。' : remainingQuantity < 0 ? '已分配數量超過訂購數量，請減少批次數量。' : '請補齊每種顏色的批次數量、交期與目的地。'}</p></div></div>}
    {step === 5 && selectedProduct && <div className="space-y-6"><div className="grid gap-5 md:grid-cols-[220px_1fr]"><ProductMedia product={selectedProduct} size="card" interactive={selectedProduct.mediaType === '3d'} /><div><p className="text-xs font-bold text-teal-700">產品資訊</p><h3 className="mt-1 text-xl font-bold text-slate-900">{selectedProduct.productCode} · {selectedProduct.productName}</h3><p className="mt-1 text-sm text-slate-500">{selectedProduct.material}</p><div className="mt-3 grid gap-2 sm:grid-cols-2">{draft.selectedColors.map((color) => <p key={color} className="rounded-lg bg-slate-50 px-3 py-2 text-sm"><b>{color}</b><span className="ml-2">{formatQuantity(draft.quantities[color])} 雙</span></p>)}</div><p className="mt-3 text-sm"><b>Total Quantity：</b>{formatQuantity(totalQuantity)} 雙</p></div></div><div><p className="mb-3 text-xs font-bold text-teal-700">交貨資訊</p><div className="space-y-2">{draft.batches.map((batch) => <div key={batch.id} className="rounded-xl bg-slate-50 p-4 text-sm"><div className="grid gap-2 sm:grid-cols-3"><b>Batch {String(batch.batchNumber).padStart(2, '0')} · {formatQuantity(getBatchQuantity(batch))} 雙</b><span>{formatDate(batch.dueDate)}</span><span>{batch.destinationCountry}</span></div><div className="mt-3 flex flex-wrap gap-2">{batch.items.filter((item) => item.quantity > 0).map((item) => <span key={item.color} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">{item.color} {formatQuantity(item.quantity)} 雙</span>)}</div></div>)}</div></div><div className="rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-800">✓ 此鞋型設定完成，儲存後可回到已選鞋型頁繼續設定其他產品。</div></div>}
    {notice && <p className="mt-5 rounded-lg bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">{notice}</p>}<div className="mt-8 flex items-center justify-between border-t border-slate-100 pt-5"><button type="button" onClick={() => step === 0 ? onCancel() : setStep((current) => current === 2 ? 1 : current - 1)} className="rounded-lg px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100">{step === 0 ? '取消' : '← 上一步'}</button><button type="button" onClick={primaryAction.action} disabled={step !== 1 && !canMoveForward} className="rounded-lg bg-teal-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:bg-slate-300">{primaryAction.label}</button></div></section></div></main>;
}
