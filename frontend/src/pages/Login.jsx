import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const DEMO_ACCOUNTS = [
  { username: 'receptionist', role: 'Reception', icon: 'bi-person-badge', color: '#0f4c81' },
  { username: 'nurse', role: 'Triage Nurse', icon: 'bi-heart-pulse', color: '#dc2626' },
  { username: 'doctor', role: 'Doctor', icon: 'bi-stethoscope', color: '#059669' },
  { username: 'cashier', role: 'Cashier', icon: 'bi-cash-coin', color: '#d97706' },
  { username: 'pharmacist', role: 'Pharmacist', icon: 'bi-capsule', color: '#0891b2' },
  { username: 'ward_nurse', role: 'Ward Nurse', icon: 'bi-building', color: '#7c3aed' },
  { username: 'admin', role: 'Admin', icon: 'bi-shield-check', color: '#6d28d9' },
]

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const data = await login(form)
      navigate(data.redirect)
    } catch (err) {
      setError(err.message || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (username) => {
    setForm({ username, password: username === 'admin' ? 'admin123' : 'pass123' })
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex',
      background: 'linear-gradient(135deg, #0a2540 0%, #0f4c81 50%, #1a6bb5 100%)',
      position: 'relative', overflow: 'hidden',
    }}>
      {/* Background decoration */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `radial-gradient(circle at 20% 50%, rgba(0,180,216,0.15) 0%, transparent 50%),
                          radial-gradient(circle at 80% 20%, rgba(6,214,160,0.1) 0%, transparent 40%)`,
      }} />
      <div style={{
        position: 'absolute', top: -100, right: -100, width: 400, height: 400,
        border: '1px solid rgba(255,255,255,0.05)', borderRadius: '50%',
      }} />
      <div style={{
        position: 'absolute', bottom: -150, left: -100, width: 500, height: 500,
        border: '1px solid rgba(255,255,255,0.04)', borderRadius: '50%',
      }} />

      {/* Left panel */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
        padding: '60px', display: window.innerWidth < 900 ? 'none' : 'flex',
      }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 14, marginBottom: 48,
        }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'linear-gradient(135deg, #00b4d8, #06d6a0)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, color: '#fff',
          }}>
            <i className="bi bi-hospital" />
          </div>
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: 22 }}>KenyaHMIS</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Level 5 Hospital Management System</div>
          </div>
        </div>

        <h2 style={{ color: '#fff', fontSize: 36, fontWeight: 800, lineHeight: 1.2, marginBottom: 16, maxWidth: 400 }}>
          Integrated Hospital<br />
          <span style={{ color: '#00b4d8' }}>Information System</span>
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, maxWidth: 380, lineHeight: 1.7 }}>
          Complete patient journey management — from reception to discharge, including triage, consultation, billing, pharmacy, and ward management.
        </p>

        <div style={{ marginTop: 40, display: 'flex', gap: 24 }}>
          {[
            { label: 'Modules', value: '7', icon: 'bi-grid-3x3-gap' },
            { label: 'Roles', value: '6+', icon: 'bi-people' },
            { label: 'Features', value: 'Full Stack', icon: 'bi-layers' },
          ].map(stat => (
            <div key={stat.label}>
              <div style={{ color: '#00b4d8', fontSize: 22, fontWeight: 800 }}>{stat.value}</div>
              <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 2 }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel - Login form */}
      <div style={{
        width: '440px', background: '#fff', display: 'flex',
        flexDirection: 'column', justifyContent: 'center', padding: '48px 40px',
        overflowY: 'auto',
      }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text)' }}>Sign In</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 4 }}>
            Access your department portal
          </p>
        </div>

        {error && (
          <div className="alert alert-error">
            <i className="bi bi-exclamation-circle" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <div style={{ position: 'relative' }}>
              <i className="bi bi-person" style={{
                position: 'absolute', left: 12, top: '50%',
                transform: 'translateY(-50%)', color: 'var(--text-muted)',
              }} />
              <input
                type="text" className="form-control"
                style={{ paddingLeft: 36 }}
                placeholder="Enter username"
                value={form.username}
                onChange={e => setForm({ ...form, username: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <i className="bi bi-lock" style={{
                position: 'absolute', left: 12, top: '50%',
                transform: 'translateY(-50%)', color: 'var(--text-muted)',
              }} />
              <input
                type="password" className="form-control"
                style={{ paddingLeft: 36 }}
                placeholder="Enter password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
          </div>

          <button
            type="submit" className="btn btn-primary btn-lg"
            disabled={loading} style={{ width: '100%', marginTop: 8, justifyContent: 'center' }}
          >
            {loading ? (
              <><i className="bi bi-arrow-repeat" style={{ animation: 'spin 0.8s linear infinite' }} /> Signing in...</>
            ) : (
              <><i className="bi bi-box-arrow-in-right" /> Sign In</>
            )}
          </button>
        </form>

        {/* Demo accounts */}
        <div style={{ marginTop: 32 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14,
          }}>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>DEMO ACCOUNTS</span>
            <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            {DEMO_ACCOUNTS.map(acc => (
              <button key={acc.username} onClick={() => fillDemo(acc.username)} style={{
                background: 'var(--bg)', border: '1.5px solid var(--border)',
                borderRadius: 8, padding: '8px 10px', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
                transition: 'all 0.15s', textAlign: 'left',
                borderColor: form.username === acc.username ? acc.color : 'var(--border)',
                background: form.username === acc.username ? acc.color + '11' : 'var(--bg)',
              }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 6,
                  background: acc.color + '20', color: acc.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 14, flexShrink: 0,
                }}>
                  <i className={`bi ${acc.icon}`} />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{acc.role}</div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>{acc.username}</div>
                </div>
              </button>
            ))}
          </div>
          <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 10, textAlign: 'center' }}>
            Password: <span style={{ fontFamily: 'var(--mono)', background: 'var(--bg)', padding: '1px 6px', borderRadius: 4 }}>pass123</span>
            &nbsp;(admin: <span style={{ fontFamily: 'var(--mono)', background: 'var(--bg)', padding: '1px 6px', borderRadius: 4 }}>admin123</span>)
          </p>
        </div>
      </div>
    </div>
  )
}