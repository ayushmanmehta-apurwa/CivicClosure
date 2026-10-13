import { BarChart3, Building2, CheckCheck, FileText, Menu, Wrench, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import { useApp } from '../services/AppContext'

const NAV = [
  { to: '/report', label: 'Report a problem', icon: FileText, roles: ['reporter', 'department', 'admin'] },
  { to: '/department', label: 'Department queue', icon: Wrench, roles: ['department', 'admin'] },
  { to: '/admin', label: 'Administration', icon: BarChart3, roles: ['admin'] },
]
const ROLES = [['reporter', 'Reporter'], ['department', 'Department'], ['admin', 'Admin']]

export function Brand({ dark = true }) {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="CivicClosure home">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-electric"><CheckCheck className="h-5 w-5 text-white" aria-hidden /></span>
      <span className={'font-display text-lg font-semibold ' + (dark ? 'text-white' : 'text-navy-900')}>CivicClosure</span>
    </Link>
  )
}

export function ModeBanner() {
  const { config, configError } = useApp()
  if (configError) return <div role="alert" className="bg-verdict-bad text-white text-sm px-4 py-2">Cannot reach the API ({configError}). Start the backend with: uvicorn app.main:app --port 8000</div>
  if (!config) return null
  const live = config.mode === 'live'
  return (
    <div className={'text-sm px-4 py-2 ' + (live ? 'bg-electric text-white' : 'bg-verdict-warnbg text-verdict-warn')}>
      <strong>{live ? 'Live AI mode. ' : 'Demo mode. '}</strong>{config.mode_notice}
    </div>
  )
}

export function RoleSwitcher({ compact }) {
  const { role, setRole, config } = useApp()
  return (
    <div className="text-white">
      <p className="text-xs text-white/60 mb-1.5" id="role-label">Viewing as</p>
      <div role="group" aria-labelledby="role-label" className="grid grid-cols-3 gap-1 rounded-xl bg-white/8 p-1">
        {ROLES.map(([k, label]) => (
          <button key={k} onClick={() => setRole(k)} aria-pressed={role === k}
            className={'rounded-lg px-2 py-1.5 text-xs font-semibold transition-colors ' + (role === k ? 'bg-white text-navy-900' : 'text-white/80 hover:bg-white/10')}>{label}</button>
        ))}
      </div>
      {!compact && <p className="mt-2 text-[11px] leading-snug text-white/55">{config?.auth_notice || 'Demo role switcher, not real authentication.'}</p>}
    </div>
  )
}

export default function Layout() {
  const { role, config } = useApp()
  const [open, setOpen] = useState(false)
  const links = NAV.filter((n) => n.roles.includes(role))
  const nav = (
    <nav aria-label="Main" className="space-y-1">
      {links.map(({ to, label, icon: Icon }) => (
        <NavLink key={to} to={to} onClick={() => setOpen(false)}
          className={({ isActive }) => 'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ' + (isActive ? 'bg-white/12 text-white' : 'text-white/70 hover:bg-white/8 hover:text-white')}>
          <Icon className="h-[18px] w-[18px]" aria-hidden />{label}
        </NavLink>
      ))}
    </nav>
  )
  return (
    <div className="min-h-full flex flex-col">
      <ModeBanner />
      <div className="flex flex-1 min-h-0">
        <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-navy-900 p-5 gap-8">
          <Brand />
          {nav}
          <div className="mt-auto space-y-4"><RoleSwitcher />
            <p className="flex items-center gap-2 text-xs text-white/50"><Building2 className="h-4 w-4" aria-hidden />{config?.campus_name}</p></div>
        </aside>
        <div className="flex-1 min-w-0 flex flex-col">
          <header className="lg:hidden flex items-center justify-between bg-navy-900 px-4 py-3">
            <Brand />
            <button onClick={() => setOpen(!open)} className="text-white p-1" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open}>{open ? <X /> : <Menu />}</button>
          </header>
          {open && <div className="lg:hidden bg-navy-900 px-4 pb-4 space-y-4">{nav}<RoleSwitcher compact /></div>}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-6xl w-full mx-auto"><Outlet /></main>
        </div>
      </div>
    </div>
  )
}
