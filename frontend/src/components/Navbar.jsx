import { useState, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const pageNames = {
  '/reception': 'Reception Dashboard',
  '/reception/new-patient': 'Register New Patient',
  '/reception/new-visit': 'New Visit',
  '/reception/patients': 'Patient Records',
  '/reception/visits': "Today's Visits",
  '/triage': 'Triage Queue',
  '/triage/history': 'Triage History',
  '/consultation': 'Consultation Queue',
  '/consultation/history': 'Consultation History',
  '/cashier': 'Pending Bills',
  '/cashier/paid': 'Paid Bills',
  '/cashier/reports': 'Revenue Reports',
  '/pharmacy': 'Pending Prescriptions',
  '/pharmacy/stock': 'Drug Stock',
  '/pharmacy/history': 'Dispensing History',
  '/wards': 'Ward Management',
  '/wards/admissions': 'Patient Admissions',
  '/wards/discharges': 'Discharge Records',
  '/admin-dashboard': 'Admin Dashboard',
  '/drugs': 'Drug Management',
  '/users': 'User Management',
  '/patients': 'All Patients',
  '/visits': 'All Visits',
  '/reports': 'Reports',
}

export default function Navbar({ onToggleSidebar, sidebarCollapsed }) {
  const { user } = useAuth()
  const location = useLocation()
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const pageName = pageNames[location.pathname] || 'HMIS'

  return (
    <header style={{
      height: 60, background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      display: 'flex', alignItems: 'center', padding: '0 20px',
      gap: 16, position: 'sticky', top: 0, zIndex: 100,
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    }}>
      <button onClick={onToggleSidebar} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: 'var(--text-muted)', fontSize: 20, padding: 4,
        borderRadius: 6, display: 'flex', transition: 'color 0.15s',
      }}>
        <i className={`bi ${sidebarCollapsed ? 'bi-layout-sidebar-reverse' : 'bi-layout-sidebar'}`} />
      </button>

      <h1 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text)', flex: 1 }}>
        {pageName}
      </h1>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Time */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6,
          color: 'var(--text-muted)', fontSize: 13, fontFamily: 'var(--mono)',
        }}>
          <i className="bi bi-clock" style={{ fontSize: 14 }} />
          <span>{time.toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}</span>
          <span style={{ opacity: 0.5 }}>|</span>
          <span>{time.toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short' })}</span>
        </div>

        {/* Notifications placeholder */}
        <button style={{
          background: 'var(--bg)', border: 'none', borderRadius: 8,
          width: 36, height: 36, cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)',
          fontSize: 17, position: 'relative',
        }}>
          <i className="bi bi-bell" />
          <span style={{
            position: 'absolute', top: 6, right: 6, width: 8, height: 8,
            background: 'var(--danger)', borderRadius: '50%', border: '2px solid var(--surface)',
          }} />
        </button>

        {/* User chip */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--bg)', padding: '5px 12px 5px 6px',
          borderRadius: 20, border: '1px solid var(--border)',
        }}>
          <div style={{
            width: 26, height: 26, borderRadius: '50%',
            background: 'var(--primary)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700,
          }}>
            {user?.first_name?.[0]}{user?.last_name?.[0]}
          </div>
          <span style={{ fontSize: 13, fontWeight: 600 }}>
            {user?.first_name}
          </span>
        </div>
      </div>
    </header>
  )
}