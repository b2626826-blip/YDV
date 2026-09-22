import { NavLink, Outlet } from 'react-router-dom'

const navItems = [{ to: '/production/orders', label: '生產製令' }]

export function AppShell() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <NavLink to="/production/orders" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-teal-700 text-sm font-black text-white">
              YDV
            </span>
            <span>
              <span className="block text-sm font-bold text-slate-900">YDV ERP</span>
              <span className="block text-xs text-slate-500">生產製造平台</span>
            </span>
          </NavLink>
          <nav aria-label="主要導覽" className="flex items-center gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2 text-sm font-semibold ${isActive ? 'bg-teal-50 text-teal-800' : 'text-slate-600 hover:bg-slate-100'}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <Outlet />
    </div>
  )
}
