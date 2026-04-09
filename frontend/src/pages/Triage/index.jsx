import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import api from '../../services/api'
import { Modal, StatusBadge, PriorityBadge, PatientInfo, useToast } from '../../components/UI'

function TriageForm({ visit, onDone, onClose }) {
  const [form, setForm] = useState({
    visit: visit.id, temperature: '', blood_pressure_systolic: '',
    blood_pressure_diastolic: '', pulse_rate: '', respiratory_rate: '',
    oxygen_saturation: '', weight: '', height: '', priority: '4', notes: '',
  })
  const [loading, setLoading] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const clean = Object.fromEntries(Object.entries(form).filter(([, v]) => v !== ''))
      await api.triage.create(clean)
      onDone()
    } catch (err) {
      alert(err.message)
    } finally { setLoading(false) }
  }

  return (
    <form onSubmit={handleSubmit}>
      <PatientInfo patient={visit.patient} />
      <div style={{ marginBottom: 16 }}>
        <label className="form-label">Triage Priority</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[
            { value: '1', label: 'Critical', color: '#dc2626', bg: '#fee2e2' },
            { value: '2', label: 'Urgent', color: '#ea580c', bg: '#fff7ed' },
            { value: '3', label: 'Semi-Urgent', color: '#ca8a04', bg: '#fef9c3' },
            { value: '4', label: 'Non-Urgent', color: '#16a34a', bg: '#dcfce7' },
          ].map(p => (
            <button
              key={p.value} type="button"
              onClick={() => set('priority', p.value)}
              style={{
                padding: '8px 16px', borderRadius: 8, border: '2px solid',
                cursor: 'pointer', fontWeight: 600, fontSize: 13,
                borderColor: form.priority === p.value ? p.color : 'var(--border)',
                background: form.priority === p.value ? p.bg : 'transparent',
                color: form.priority === p.value ? p.color : 'var(--text-muted)',
                transition: 'all 0.15s',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid-3">
        <div className="form-group">
          <label className="form-label">Temperature (°C)</label>
          <input className="form-control" type="number" step="0.1" placeholder="36.6" value={form.temperature} onChange={e => set('temperature', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">BP Systolic (mmHg)</label>
          <input className="form-control" type="number" placeholder="120" value={form.blood_pressure_systolic} onChange={e => set('blood_pressure_systolic', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">BP Diastolic (mmHg)</label>
          <input className="form-control" type="number" placeholder="80" value={form.blood_pressure_diastolic} onChange={e => set('blood_pressure_diastolic', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Pulse Rate (bpm)</label>
          <input className="form-control" type="number" placeholder="72" value={form.pulse_rate} onChange={e => set('pulse_rate', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Respiratory Rate</label>
          <input className="form-control" type="number" placeholder="16" value={form.respiratory_rate} onChange={e => set('respiratory_rate', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">SpO2 (%)</label>
          <input className="form-control" type="number" step="0.1" placeholder="98.0" value={form.oxygen_saturation} onChange={e => set('oxygen_saturation', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Weight (kg)</label>
          <input className="form-control" type="number" step="0.1" placeholder="70" value={form.weight} onChange={e => set('weight', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Height (cm)</label>
          <input className="form-control" type="number" placeholder="170" value={form.height} onChange={e => set('height', e.target.value)} />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Triage Notes</label>
        <textarea className="form-control" rows={3} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Additional observations..." />
      </div>

      <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : <><i className="bi bi-check-circle" /> Complete Triage</>}
        </button>
      </div>
    </form>
  )
}

function TriageQueue() {
  const [visits, setVisits] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const { show, ToastEl } = useToast()

  const load = async () => {
    setLoading(true)
    try {
      const res = await api.visits.list({ status: 'waiting_triage' })
      setVisits(res.results || res)
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const priorityColor = { '1': '#dc2626', '2': '#ea580c', '3': '#ca8a04', '4': '#16a34a' }

  return (
    <div>
      {ToastEl}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 className="page-title">Triage Queue</h2>
          <p className="page-subtitle">{visits.length} patients waiting</p>
        </div>
        <button className="btn btn-ghost btn-sm" onClick={load}><i className="bi bi-arrow-clockwise" /> Refresh</button>
      </div>

      {loading ? <div className="loading-spinner" /> : visits.length === 0 ? (
        <div className="card"><div className="empty-state"><i className="bi bi-check-circle" style={{ color: 'var(--accent-2)' }} /><p>No patients waiting for triage</p></div></div>
      ) : (
        <div style={{ display: 'grid', gap: 12 }}>
          {visits.map((v, i) => (
            <div key={v.id} className="card card-sm" style={{
              display: 'flex', alignItems: 'center', gap: 16,
              borderLeft: '4px solid var(--primary)',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8, background: 'var(--bg)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 800, color: 'var(--text-muted)', fontSize: 14, flexShrink: 0,
              }}>
                #{i + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700 }}>{v.patient_name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  <span className="tag" style={{ marginRight: 8 }}>{v.patient_number}</span>
                  {v.visit_type} • {v.chief_complaint || 'No complaint recorded'}
                </div>
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                {new Date(v.created_at).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}
              </div>
              <button className="btn btn-primary btn-sm" onClick={async () => {
                const full = await api.visits.get(v.id)
                setSelected(full)
              }}>
                <i className="bi bi-clipboard-pulse" /> Triage
              </button>
            </div>
          ))}
        </div>
      )}

      {selected && (
        <Modal title={`Triage — ${selected.visit_number}`} onClose={() => setSelected(null)} size="lg">
          <TriageForm
            visit={selected}
            onClose={() => setSelected(null)}
            onDone={() => { setSelected(null); show('Triage completed!'); load() }}
          />
        </Modal>
      )}
    </div>
  )
}

function TriageHistory() {
  const [triages, setTriages] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.visits.list({ status: 'waiting_consultation' })
      .then(d => { setTriages(d.results || d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Triage History</h2>
        <p className="page-subtitle">Recently triaged patients</p>
      </div>
      <div className="card">
        {loading ? <div className="loading-spinner" /> : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Visit</th><th>Patient</th><th>Complaint</th><th>Status</th><th>Time</th></tr>
              </thead>
              <tbody>
                {triages.map(v => (
                  <tr key={v.id}>
                    <td><span className="tag">{v.visit_number}</span></td>
                    <td><div style={{ fontWeight: 600 }}>{v.patient_name}</div></td>
                    <td>{v.chief_complaint || '—'}</td>
                    <td><StatusBadge status={v.status} /></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{new Date(v.created_at).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Triage() {
  return (
    <Routes>
      <Route index element={<TriageQueue />} />
      <Route path="history" element={<TriageHistory />} />
    </Routes>
  )
}