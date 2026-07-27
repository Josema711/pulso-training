import { Activity, BarChart3, Cloud, CloudOff, Dumbbell, History, Home, Plus, Settings } from 'lucide-react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/database'
import { useCloudSync } from './CloudSyncProvider'

const nav = [
  { to: '/', label: 'Inicio', icon: Home }, { to: '/entrenamiento', label: 'Entrenar', icon: Plus },
  { to: '/historial', label: 'Historial', icon: History }, { to: '/ejercicios', label: 'Ejercicios', icon: Dumbbell },
  { to: '/progreso', label: 'Progreso', icon: BarChart3 }, { to: '/ajustes', label: 'Ajustes', icon: Settings },
]
const mobileNav = [nav[0], nav[1], nav[3], nav[4], nav[5]]
export function Layout() {
  const active = useLiveQuery(() => db.workouts.where('status').equals('active').first())
  const location = useLocation()
  const { user, status } = useCloudSync()
  return <div className="app-shell">
    <aside className="sidebar"><div className="brand"><span><Activity /></span><div><strong>PULSO</strong><small>ENTRENA CON MEMORIA</small></div></div><nav>{nav.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === '/'}><Icon /> <span>{label}</span>{to === '/entrenamiento' && active && <i />}</NavLink>)}</nav><div className={`privacy-note ${user ? 'cloud-active' : ''}`}>{user ? <Cloud /> : <CloudOff />}<span>{user ? (status === 'error' ? 'Nube con error · revisa Ajustes' : 'Copia privada en la nube activa') : 'Copia local · activa la nube en Ajustes'}</span></div></aside>
    <main className={location.pathname === '/entrenamiento' ? 'workout-main' : ''}><Outlet /></main>
    <nav className="bottom-nav" aria-label="Navegación principal">{mobileNav.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end={to === '/'}><Icon /><span>{label}</span>{to === '/entrenamiento' && active && <i />}</NavLink>)}</nav>
  </div>
}
