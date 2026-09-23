import { hasDueSoonBatch } from '../utils/production';
import type { ProductionOrder, ProductionStatus } from '../types/production';

type SummaryFilter = 'all' | 'due-soon' | ProductionStatus;

const cards: Array<{ label: string; filter: SummaryFilter; tone: string }> = [
  { label: '生產訂單總數', filter: 'all', tone: 'border-slate-200 bg-white text-slate-900' },
  { label: '待送採購', filter: 'draft', tone: 'border-slate-200 bg-slate-50 text-slate-700' },
  { label: '採購中', filter: 'purchasing', tone: 'border-amber-100 bg-amber-50 text-amber-800' },
  { label: '待生管排程', filter: 'pending', tone: 'border-slate-200 bg-slate-50 text-slate-700' },
  { label: '生產中', filter: 'production', tone: 'border-cyan-100 bg-cyan-50 text-cyan-800' },
  { label: '已完成', filter: 'completed', tone: 'border-emerald-100 bg-emerald-50 text-emerald-800' },
  { label: '即將到交期', filter: 'due-soon', tone: 'border-rose-100 bg-rose-50 text-rose-800' },
  { label: '已暫停排程', filter: 'paused', tone: 'border-orange-100 bg-orange-50 text-orange-800' },
  { label: '已停止', filter: 'stopped', tone: 'border-rose-100 bg-white text-rose-700' },
  { label: '已取消', filter: 'cancelled', tone: 'border-slate-200 bg-slate-100 text-slate-600' },
];

export function DashboardSummary({ orders, selectedFilter, onSelect }: { orders: ProductionOrder[]; selectedFilter: SummaryFilter; onSelect: (filter: SummaryFilter) => void }) {
  const dueSoonOrderIds = new Set(orders.filter((order) => hasDueSoonBatch(order)).map((order) => order.id));
  return <section className="grid grid-cols-2 gap-3 md:grid-cols-5" aria-label="生產摘要">{cards.map((card) => {
    const value = card.filter === 'due-soon' ? dueSoonOrderIds.size : card.filter === 'all' ? orders.length : orders.filter((order) => order.status === card.filter).length;
    return <button type="button" key={card.label} onClick={() => onSelect(card.filter)} aria-pressed={selectedFilter === card.filter} className={`rounded-2xl border p-4 text-left transition hover:-translate-y-0.5 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 ${card.tone} ${selectedFilter === card.filter ? 'ring-2 ring-teal-500' : ''}`}><p className="text-xs font-medium">{card.label}</p><p className="mt-2 text-3xl font-bold tracking-tight">{value}</p></button>;
  })}</section>;
}
