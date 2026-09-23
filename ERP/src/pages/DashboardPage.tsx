import { useMemo, useState } from 'react';
import { DUE_SOON_DAYS, STATUS_FILTERS } from '../config/constants';
import { DashboardSummary } from '../components/DashboardSummary';
import { ProductionOrderTable } from '../components/ProductionOrderTable';
import { hasDueSoonBatch } from '../utils/production';
import type { ProductionOrder, ProductionStatus } from '../types/production';

type OrderFilter = 'all' | 'due-soon' | ProductionStatus;

export function DashboardPage({ orders, onOpenOrder, onCreateOrder }: { orders: ProductionOrder[]; onOpenOrder: (id: string) => void; onCreateOrder: () => void }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<OrderFilter>('all');
  const filteredOrders = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    return orders.filter((order) => (filter === 'all' || filter === 'due-soon' ? filter !== 'due-soon' || hasDueSoonBatch(order) : order.status === filter) && (!normalizedQuery || order.orderNumber.toLocaleLowerCase().includes(normalizedQuery) || order.product.productCode.toLocaleLowerCase().includes(normalizedQuery) || order.product.productName.toLocaleLowerCase().includes(normalizedQuery)));
  }, [filter, orders, query]);
  const handleSummaryFilter = (nextFilter: OrderFilter) => {
    setFilter(nextFilter);
    document.getElementById('production-orders')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return <main className="min-h-screen bg-slate-50"><header className="border-b border-slate-200 bg-white"><div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-5 py-4 sm:px-8"><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-xl bg-teal-600 text-sm font-black tracking-tight text-white">YDV</div><div><p className="text-sm font-bold text-slate-900">YDV 生產管理</p><p className="text-xs text-slate-500">鞋廠 ERP Prototype · 生管部門</p></div></div><button type="button" onClick={onCreateOrder} className="rounded-lg bg-teal-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-teal-700">＋ 新增生產訂單</button></div></header><div className="mx-auto max-w-[1440px] px-5 py-7 sm:px-8"><div className="mb-7 flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-xs font-bold tracking-[0.16em] text-teal-700">PRODUCTION CONTROL</p><h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">生產訂單總覽</h1><p className="mt-2 text-sm text-slate-500">即時掌握產品、生產進度與下一批交貨安排。</p></div><p className="rounded-lg bg-white px-3 py-2 text-xs text-slate-500 ring-1 ring-slate-200">到期提醒規則：未完成批次的交期在 {DUE_SOON_DAYS} 天內或已逾期</p></div><DashboardSummary orders={orders} selectedFilter={filter} onSelect={handleSummaryFilter} /><section id="production-orders" className="mt-7 scroll-mt-5"><div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between"><div><h2 className="font-bold text-slate-900">生產訂單</h2><p className="mt-1 text-xs text-slate-500">可搜尋訂單總編號、Product Code 或產品名稱；點擊訂單查看子訂單與更新生產進度。</p></div><div className="flex flex-col gap-2 sm:flex-row"><label className="relative"><span className="sr-only">搜尋訂單總編號、Product Code 或產品名稱</span><input aria-label="搜尋訂單總編號、Product Code 或產品名稱" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜尋訂單總編號、Product Code 或產品名稱" className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm outline-none placeholder:text-slate-400 focus:border-teal-500 sm:w-72" /><span className="pointer-events-none absolute left-3 top-2.5 text-slate-400">⌕</span></label><select aria-label="狀態篩選" value={filter === 'due-soon' ? 'all' : filter} onChange={(event) => setFilter(event.target.value as 'all' | ProductionStatus)} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-teal-500">{STATUS_FILTERS.map((statusFilter) => <option key={statusFilter.value} value={statusFilter.value}>{statusFilter.label}</option>)}</select></div></div><ProductionOrderTable orders={filteredOrders} onOpen={onOpenOrder} /></section></div></main>;
}
