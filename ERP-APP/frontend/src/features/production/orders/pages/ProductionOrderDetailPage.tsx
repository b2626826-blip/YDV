import { Link } from 'react-router-dom'

export function ProductionOrderDetailPage() {
  return (
    <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
      <Link to="/production/orders" className="text-sm font-semibold text-teal-700 hover:text-teal-900">
        ← 返回生產製令
      </Link>
      <h1 className="mt-6 text-2xl font-bold text-slate-900">製令明細</h1>
      <p className="mt-2 text-sm text-slate-600">此頁將承接批次、完工事件與完成確認。</p>
    </main>
  )
}
