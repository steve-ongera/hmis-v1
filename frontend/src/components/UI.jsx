import { useState, useEffect } from 'react'

// ── Modal ──────────────────────────────────────────────────
export function Modal({ title, onClose, children, footer, size = '' }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${size === 'lg' ? 'modal-lg' : ''}`}>
        <div className="modal-header">
          <span className="modal-title">{title}</span>
          <button className="btn-icon" onClick={onClose}><i className="bi bi-x-lg" /></button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  )
}

// ── Status Badge ───────────────────────────────────────────
const statusMap = {
  registered: { cls: 'badge-info', label: 'Registered' },
  waiting_triage: { cls: 'badge-warning', label: 'Awaiting Triage' },
  triaged: { cls: 'badge-warning', label: 'Triaged' },
  waiting_consultation: { cls: 'badge-warning', label: 'Awaiting Doctor' },
  in_consultation: { cls: 'badge-purple', label: 'In Consultation' },
  waiting_payment: { cls: 'badge-orange', label: 'Awaiting Payment' },
  paid: { cls: 'badge-success', label: 'Paid' },
  at_pharmacy: { cls: 'badge-info', label: 'At Pharmacy' },
  admitted: { cls: 'badge-purple', label: 'Admitted' },
  discharged: { cls: 'badge-neutral', label: 'Discharged' },
  unpaid: { cls: 'badge-danger', label: 'Unpaid' },
  partial: { cls: 'badge-warning', label: 'Partial' },
  pending: { cls: 'badge-warning', label: 'Pending' },
  dispensed: { cls: 'badge-success', label: 'Dispensed' },
  active: { cls: 'badge-success', label: 'Active' },
  cancelled: { cls: 'badge-neutral', label: 'Cancelled' },
}

export function StatusBadge({ status }) {
  const s = statusMap[status] || { cls: 'badge-neutral', label: status }
  return <span className={`badge ${s.cls}`}>{s.label}</span>
}

// ── Priority Badge ─────────────────────────────────────────
export function PriorityBadge({ priority }) {
  const map = {
    '1': { cls: 'badge-danger', icon: 'bi-exclamation-octagon', label: 'Critical' },
    '2': { cls: 'badge-orange', icon: 'bi-exclamation-triangle', label: 'Urgent' },
    '3': { cls: 'badge-warning', icon: 'bi-dash-circle', label: 'Semi-Urgent' },
    '4': { cls: 'badge-success', icon: 'bi-check-circle', label: 'Non-Urgent' },
    '5': { cls: 'badge-neutral', icon: 'bi-x-circle', label: 'Deceased' },
  }
  const p = map[priority] || map['4']
  return (
    <span className={`badge ${p.cls}`}>
      <i className={`bi ${p.icon}`} style={{ fontSize: 11 }} />
      {p.label}
    </span>
  )
}

// ── Confirm Dialog ─────────────────────────────────────────
export function Confirm({ message, onConfirm, onCancel, danger }) {
  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 400 }}>
        <div className="modal-body" style={{ textAlign: 'center', padding: '32px 24px' }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%', margin: '0 auto 16px',
            background: danger ? '#fee2e2' : '#dbeafe',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 24, color: danger ? 'var(--danger)' : 'var(--primary)',
          }}>
            <i className={`bi ${danger ? 'bi-trash' : 'bi-question-circle'}`} />
          </div>
          <p style={{ fontSize: 15, color: 'var(--text)', lineHeight: 1.5 }}>{message}</p>
        </div>
        <div className="modal-footer" style={{ justifyContent: 'center' }}>
          <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button className={`btn ${danger ? 'btn-danger' : 'btn-primary'}`} onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Vitals Display ─────────────────────────────────────────
export function VitalsDisplay({ triage }) {
  if (!triage) return <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>Not triaged</span>
  return (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 12 }}>
      {triage.temperature && (
        <span className="tag"><i className="bi bi-thermometer-half" /> {triage.temperature}°C</span>
      )}
      {triage.blood_pressure_systolic && (
        <span className="tag"><i className="bi bi-heart-pulse" /> {triage.blood_pressure_systolic}/{triage.blood_pressure_diastolic} mmHg</span>
      )}
      {triage.pulse_rate && (
        <span className="tag"><i className="bi bi-activity" /> {triage.pulse_rate} bpm</span>
      )}
      {triage.oxygen_saturation && (
        <span className="tag"><i className="bi bi-lungs" /> {triage.oxygen_saturation}% SpO2</span>
      )}
    </div>
  )
}

// ── Search Input ───────────────────────────────────────────
export function SearchInput({ value, onChange, placeholder = 'Search...' }) {
  return (
    <div className="search-box">
      <i className="bi bi-search" />
      <input
        type="text" className="form-control" value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  )
}

// ── Patient Info Row ───────────────────────────────────────
export function PatientInfo({ patient }) {
  if (!patient) return null
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12,
      background: 'var(--bg)', borderRadius: 10, padding: '12px 16px',
      border: '1px solid var(--border)', marginBottom: 16,
    }}>
      <div style={{
        width: 44, height: 44, borderRadius: 10, background: 'var(--primary)',
        color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 700, fontSize: 16, flexShrink: 0,
      }}>
        {patient.first_name?.[0]}{patient.last_name?.[0]}
      </div>
      <div>
        <div style={{ fontWeight: 700, fontSize: 15 }}>{patient.first_name} {patient.last_name}</div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2, display: 'flex', gap: 12 }}>
          <span><i className="bi bi-hash" /> {patient.patient_number}</span>
          <span><i className="bi bi-person" /> {patient.gender === 'M' ? 'Male' : patient.gender === 'F' ? 'Female' : 'Other'}, {patient.age} yrs</span>
          <span><i className="bi bi-telephone" /> {patient.phone}</span>
        </div>
      </div>
    </div>
  )
}

// ── Toast ──────────────────────────────────────────────────
export function Toast({ message, type = 'success', onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3000)
    return () => clearTimeout(t)
  }, [onClose])

  const colors = {
    success: { bg: '#dcfce7', color: '#166534', icon: 'bi-check-circle-fill' },
    error: { bg: '#fee2e2', color: '#991b1b', icon: 'bi-x-circle-fill' },
    warning: { bg: '#fef9c3', color: '#854d0e', icon: 'bi-exclamation-circle-fill' },
  }
  const c = colors[type] || colors.success

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      background: c.bg, color: c.color, padding: '12px 20px',
      borderRadius: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
      display: 'flex', alignItems: 'center', gap: 10,
      fontSize: 14, fontWeight: 600, maxWidth: 360,
      animation: 'slideUp 0.2s ease',
    }}>
      <i className={`bi ${c.icon}`} style={{ fontSize: 18 }} />
      <span>{message}</span>
      <button onClick={onClose} style={{
        background: 'none', border: 'none', cursor: 'pointer',
        color: c.color, marginLeft: 8, fontSize: 14,
      }}>
        <i className="bi bi-x" />
      </button>
    </div>
  )
}

// ── useToast hook ──────────────────────────────────────────
export function useToast() {
  const [toast, setToast] = useState(null)
  const show = (message, type = 'success') => setToast({ message, type })
  const hide = () => setToast(null)
  const ToastEl = toast ? <Toast {...toast} onClose={hide} /> : null
  return { show, ToastEl }
}