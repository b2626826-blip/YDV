import { useEffect, useRef, useState } from 'react';
import { COLOR_SWATCHES } from '../config/constants';
import { useLanguage } from '../i18n';
import type { Product, ProductionOrder } from '../types/production';
import { getProductColorOrders } from '../utils/catalog';
import { ProductMedia } from './ProductMedia';
import { ProductionOrderTable } from './ProductionOrderTable';

const messages = {
  'zh-TW': { title: '鞋型目錄', hint: '選擇鞋型的顏色，查看該顏色的所有訂單。', empty: '尚無訂單', back: '← 返回生產訂單', orders: '生產訂單' },
  en: { title: 'Shoe catalog', hint: 'Select a color to view all orders for that shoe style and color.', empty: 'No orders yet', back: '← Back to production orders', orders: 'Production orders' },
  vi: { title: 'Danh mục kiểu giày', hint: 'Chọn màu để xem tất cả đơn hàng của kiểu giày và màu đó.', empty: 'Chưa có đơn hàng', back: '← Trở lại đơn hàng sản xuất', orders: 'Đơn hàng sản xuất' },
  ja: { title: 'シューズカタログ', hint: 'カラーを選択すると、その品番・カラーのすべての注文を表示します。', empty: '注文はまだありません', back: '← 生産注文に戻る', orders: '生産注文' },
};

export function ProductCatalogCard({ count, selected, onOpen }: { count: number; selected: boolean; onOpen: () => void }) {
  const { language } = useLanguage();
  return <button type="button" onClick={onOpen} aria-pressed={selected} className={`rounded-2xl border border-teal-100 bg-teal-50 p-4 text-left text-teal-800 transition hover:-translate-y-0.5 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${selected ? 'ring-2 ring-teal-500' : ''}`}>
    <p className="text-xs font-medium">{messages[language].title}</p><p className="mt-2 text-3xl font-bold tracking-tight">{count}</p>
  </button>;
}

export function ProductCatalog({ products, orders, onOpenOrder, onBack }: { products: Product[]; orders: ProductionOrder[]; onOpenOrder: (id: string) => void; onBack: () => void }) {
  const { language } = useLanguage();
  const labels = messages[language];
  const [selection, setSelection] = useState<{ productId: string; color: string } | null>(null);
  const resultsRef = useRef<HTMLElement>(null);
  const selectedProduct = products.find((product) => product.id === selection?.productId);
  const matchingOrders = selection ? getProductColorOrders(orders, selection.productId, selection.color) : [];

  useEffect(() => {
    if (selection) resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [selection]);

  return <div>
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-bold text-slate-900">{labels.title}</h2><p className="mt-1 text-xs text-slate-500">{labels.hint}</p></div><button type="button" onClick={onBack} className="rounded-lg px-3 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50">{labels.back}</button></div>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{products.map((product) => <article key={product.id} aria-label={product.productCode} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <ProductMedia product={product} size="card" />
      <h3 className="mt-3 text-sm font-bold text-teal-700">{product.productCode}</h3><p className="text-sm font-semibold text-slate-800">{product.productName}</p><p className="mt-1 text-xs text-slate-500">{product.material}</p>
      <div className="mt-4 flex flex-wrap gap-2">{product.availableColors.map((color) => {
        const selected = selection?.productId === product.id && selection.color === color;
        return <button type="button" key={color} aria-label={`${product.productCode} ${color}`} aria-pressed={selected} onClick={() => setSelection({ productId: product.id, color })} className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 ${selected ? 'border-teal-600 bg-teal-50 text-teal-800' : 'border-slate-200 text-slate-600 hover:border-teal-400'}`}><span aria-hidden="true" className="h-3 w-3 rounded-full border border-slate-300" style={{ backgroundColor: COLOR_SWATCHES[color] ?? '#cbd5e1' }} />{color}</button>;
      })}</div>
    </article>)}</div>
    {selection && selectedProduct && <section ref={resultsRef} aria-label={`${selectedProduct.productCode} ${selection.color} ${labels.orders}`} className="mt-6 scroll-mt-5">
      <h3 className="mb-3 font-bold text-slate-900">{selectedProduct.productCode} · {selection.color} · {labels.orders} ({matchingOrders.length})</h3>
      {matchingOrders.length ? <ProductionOrderTable orders={matchingOrders} onOpen={onOpenOrder} /> : <p role="status" className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center text-sm text-slate-500">{labels.empty}</p>}
    </section>}
  </div>;
}
