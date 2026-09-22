export function ProductionOrdersPage() {
  return (
    <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
      <div className="mb-8">
        <p className="text-xs font-bold tracking-[0.16em] text-teal-700">PRODUCTION</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">生產製令</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          正式 ERP 的第一個垂直切片。此頁將接上後端製令與批次 API，目前先保留頁面邊界。
        </p>
      </div>
      <section className="rounded-2xl border border-dashed border-slate-300 bg-white p-8">
        <p className="text-sm font-semibold text-slate-800">Production Orders module ready</p>
        <p className="mt-2 text-sm text-slate-500">下一步：接入 server-state 查詢與生管建立製令流程。</p>
      </section>
    </main>
  )
}
