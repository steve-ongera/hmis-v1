import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const roleMenus = {
  admin: [
    { label: 'Dashboard', icon: 'bi-grid', path: '/admin-dashboard' },
    { label: 'Patients', icon: 'bi-people', path: '/patients' },
    { label: 'Visits', icon: 'bi-calendar-check', path: '/visits' },
    { label: 'Wards', icon: 'bi-building', path: '/wards' },
    { label: 'Drugs', icon: 'bi-capsule', path: '/drugs' },
    { label: 'Users', icon: 'bi-person-gear', path: '/users' },
    { label: 'Reports', icon: 'bi-bar-chart', path: '/reports' },
  ],
  receptionist: [
    { label: 'Dashboard', icon: 'bi-grid', path: '/reception' },
    { label: 'New Patient', icon: 'bi-person-plus', path: '/reception/new-patient' },
    { label: 'New Visit', icon: 'bi-clipboard-plus', path: '/reception/new-visit' },
    { label: 'Patients', icon: 'bi-people', path: '/reception/patients' },
    { label: "Today's Visits", icon: 'bi-calendar2-day', path: '/reception/visits' },
  ],
  triage_nurse: [
    { label: 'Queue', icon: 'bi-list-ol', path: '/triage' },
    { label: 'History', icon: 'bi-clock-history', path: '/triage/history' },
  ],
  doctor: [
    { label: 'Waiting Room', icon: 'bi-list-task', path: '/consultation' },
    { label: 'History', icon: 'bi-journal-medical', path: '/consultation/history' },
  ],
  cashier: [
    { label: 'Pending Bills', icon: 'bi-receipt', path: '/cashier' },
    { label: 'Paid Bills', icon: 'bi-check-circle', path: '/cashier/paid' },
    { label: 'Reports', icon: 'bi-bar-chart-line', path: '/cashier/reports' },
  ],
  pharmacist: [
    { label: 'Pending Scripts', icon: 'bi-capsule-pill', path: '/pharmacy' },
    { label: 'Drug Stock', icon: 'bi-box-seam', path: '/pharmacy/stock' },
    { label: 'History', icon: 'bi-clock-history', path: '/pharmacy/history' },
  ],
  ward_nurse: [
    { label: 'Ward Overview', icon: 'bi-building', path: '/wards' },
    { label: 'Admissions', icon: 'bi-person-check', path: '/wards/admissions' },
    { label: 'Discharges', icon: 'bi-box-arrow-right', path: '/wards/discharges' },
  ],
}

const roleColors = {
  admin: { accent: '#7c3aed', bg: '#7c3aed22' },
  receptionist: { accent: '#0f4c81', bg: '#0f4c8122' },
  triage_nurse: { accent: '#dc2626', bg: '#dc262622' },
  doctor: { accent: '#059669', bg: '#05966922' },
  cashier: { accent: '#d97706', bg: '#d9770622' },
  pharmacist: { accent: '#0891b2', bg: '#0891b222' },
  ward_nurse: { accent: '#7c3aed', bg: '#7c3aed22' },
}

const roleLabels = {
  admin: 'System Admin',
  receptionist: 'Reception',
  triage_nurse: 'Triage',
  doctor: 'Consultation',
  cashier: 'Cashier',
  pharmacist: 'Pharmacy',
  ward_nurse: 'Ward Nursing',
}

export default function Sidebar({ collapsed, onToggle }) {
  const { user, logout } = useAuth()
  const role = user?.role || 'receptionist'
  const menu = roleMenus[role] || []
  const colors = roleColors[role] || roleColors.receptionist

  return (
    <aside className="sidebar" style={{
      width: collapsed ? '64px' : '240px',
      transition: 'width 0.25s ease',
      background: 'var(--sidebar-bg)',
      display: 'flex', flexDirection: 'column',
      height: '100vh', position: 'sticky', top: 0,
      flexShrink: 0, overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{
        padding: collapsed ? '20px 16px' : '20px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', gap: 12, minHeight: 72,
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10, flexShrink: 0,
          background: `linear-gradient(135deg, ${colors.accent}, var(--accent))`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 18,
        }}>
          <i className="bi bi-hospital" />
        </div>
        {!collapsed && (
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 14, lineHeight: 1.2 }}>KenyaHMIS</div>
            <div style={{ color: 'var(--sidebar-text)', fontSize: 11, marginTop: 2 }}>Level 5 Hospital</div>
          </div>
        )}
      </div>

      {/* Role badge */}
      {!collapsed && (
        <div style={{ padding: '12px 20px 8px' }}>
          <div style={{
            background: colors.bg, border: `1px solid ${colors.accent}44`,
            borderRadius: 6, padding: '6px 10px',
            color: colors.accent, fontSize: 11, fontWeight: 700,
            letterSpacing: '0.06em', textTransform: 'uppercase',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <i className="bi bi-shield-check" style={{ fontSize: 12 }} />
            {roleLabels[role]}
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ flex: 1, padding: '8px 10px', overflowY: 'auto' }}>
        {menu.map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path.split('/').length <= 2}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 12,
              padding: collapsed ? '10px 14px' : '10px 14px',
              borderRadius: 8, marginBottom: 2, textDecoration: 'none',
              color: isActive ? '#fff' : 'var(--sidebar-text)',
              background: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
              fontWeight: isActive ? 600 : 400, fontSize: 14,
              transition: 'all 0.15s',
              position: 'relative',
              justifyContent: collapsed ? 'center' : 'flex-start',
            })}
            title={collapsed ? item.label : undefined}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span style={{
                    position: 'absolute', left: 0, top: '50%',
                    transform: 'translateY(-50%)', width: 3, height: 20,
                    background: colors.accent, borderRadius: '0 3px 3px 0',
                  }} />
                )}
                <i className={`bi ${item.icon}`} style={{ fontSize: 17, flexShrink: 0 }} />
                {!collapsed && <span>{item.label}</span>}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User info + logout */}
      <div style={{
        padding: '12px 10px', borderTop: '1px solid rgba(255,255,255,0.08)',
      }}>
        {!collapsed ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 8, flexShrink: 0,
              background: colors.accent, color: '#fff', display: 'flex',
              alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 14,
            }}>
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: '#fff', fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.first_name} {user?.last_name}
              </div>
              <div style={{ color: 'var(--sidebar-text)', fontSize: 11 }}>{user?.username}</div>
            </div>
            <button onClick={logout} style={{
              background: 'transparent', border: 'none', color: 'var(--sidebar-text)',
              cursor: 'pointer', padding: 4, borderRadius: 4, fontSize: 16,
              transition: 'color 0.15s',
            }} title="Logout">
              <i className="bi bi-box-arrow-right" />
            </button>
          </div>
        ) : (
          <button onClick={logout} style={{
            width: '100%', background: 'transparent', border: 'none',
            color: 'var(--sidebar-text)', cursor: 'pointer', padding: '8px 0',
            display: 'flex', justifyContent: 'center', fontSize: 18,
          }} title="Logout">
            <i className="bi bi-box-arrow-right" />
          </button>
        )}
      </div>
    </aside>
  )
}