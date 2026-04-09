import { useState, useEffect } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import api from '../../services/api'
import { Modal, StatusBadge, SearchInput, PatientInfo, useToast } from '../../components/UI'

// ── Reception Dashboard ──────────────────────────────────
export function ReceptionDashboard() {
  const [stats, setStats] = useState({})
  const [recentVisits, setRecentVisits] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    api.stats.dashboard().then(setStats).catch(() => {})
    api.visits.list({ date: new Date().toISOString().split('T')[0] })
      .then(d => setRecentVisits(d.results || d))
      .catch(() => {})
  }, [])

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 className="page-title">Reception Dashboard</h2>
          <p className="page-subtitle">Manage patient registration and visits</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="btn btn-ghost" onClick={() => navigate('/reception/patients')}>
            <i className="bi bi-people" /> Patients
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/reception/new-patient')}>
            <i className="bi bi-person-plus" /> New Patient
          </button>
          <button className="btn btn-accent" onClick={() => navigate('/reception/new-visit')}>
            <i className="bi bi-clipboard-plus" /> New Visit
          </button>
        </div>
      </div>

      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: "Today's Visits", value: stats.visits_today || 0, icon: 'bi-calendar-check', color: '#0f4c81', bg: '#dbeafe' },
          { label: 'Total Patients', value: stats.total_patients || 0, icon: 'bi-people', color: '#059669', bg: '#dcfce7' },
          { label: 'Waiting Triage', value: stats.waiting_triage || 0, icon: 'bi-hourglass-split', color: '#dc2626', bg: '#fee2e2' },
          { label: 'In Consultation', value: stats.in_consultation || 0, icon: 'bi-stethoscope', color: '#7c3aed', bg: '#f3e8ff' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ background: s.bg, color: s.color }}>
              <i className={`bi ${s.icon}`} />
            </div>
            <div className="stat-info">
              <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontWeight: 700, fontSize: 16 }}>Today's Visit Queue</h3>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/reception/visits')}>View All</button>
        </div>
        {recentVisits.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-calendar2-x" />
            <p>No visits registered today</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Visit No.</th>
                  <th>Patient</th>
                  <th>Type</th>
                  <th>Chief Complaint</th>
                  <th>Status</th>
                  <th>Time</th>
                </tr>
              </thead>
              <tbody>
                {recentVisits.slice(0, 10).map(v => (
                  <tr key={v.id}>
                    <td><span className="tag">{v.visit_number}</span></td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{v.patient_name || v.patient?.first_name + ' ' + v.patient?.last_name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{v.patient_number || v.patient?.patient_number}</div>
                    </td>
                    <td><span className="badge badge-info" style={{ textTransform: 'capitalize' }}>{v.visit_type}</span></td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {v.chief_complaint || '—'}
                    </td>
                    <td><StatusBadge status={v.status} /></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                      {new Date(v.created_at).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}
                    </td>
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

// ── New Patient ──────────────────────────────────────────
export function NewPatient() {
  const navigate = useNavigate()
  const { show, ToastEl } = useToast()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    first_name: '', last_name: '', date_of_birth: '', gender: '',
    phone: '', email: '', address: '', national_id: '',
    insurance_provider: '', insurance_number: '',
    next_of_kin: '', next_of_kin_phone: '', blood_group: '', allergies: '',
  })

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const patient = await api.patients.create(form)
      show(`Patient ${patient.patient_number} registered successfully!`)
      setTimeout(() => navigate('/reception/new-visit', { state: { patient } }), 1200)
    } catch (err) {
      show(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
      {ToastEl}
      <div className="page-header">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 12 }}>
          <i className="bi bi-arrow-left" /> Back
        </button>
        <h2 className="page-title">Register New Patient</h2>
        <p className="page-subtitle">Fill in patient demographics</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="bi bi-person-vcard" /> Personal Information
          </h3>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">First Name *</label>
              <input className="form-control" required value={form.first_name} onChange={e => set('first_name', e.target.value)} placeholder="John" />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name *</label>
              <input className="form-control" required value={form.last_name} onChange={e => set('last_name', e.target.value)} placeholder="Doe" />
            </div>
            <div className="form-group">
              <label className="form-label">Date of Birth *</label>
              <input className="form-control" type="date" required value={form.date_of_birth} onChange={e => set('date_of_birth', e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Gender *</label>
              <select className="form-control" required value={form.gender} onChange={e => set('gender', e.target.value)}>
                <option value="">Select Gender</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
                <option value="O">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input className="form-control" required value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+254 7XX XXX XXX" />
            </div>
            <div className="form-group">
              <label className="form-label">National ID</label>
              <input className="form-control" value={form.national_id} onChange={e => set('national_id', e.target.value)} placeholder="12345678" />
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Address</label>
              <input className="form-control" value={form.address} onChange={e => set('address', e.target.value)} placeholder="Town, County" />
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="bi bi-shield-plus" /> Insurance & Medical
          </h3>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Insurance Provider</label>
              <select className="form-control" value={form.insurance_provider} onChange={e => set('insurance_provider', e.target.value)}>
                <option value="">None</option>
                <option value="NHIF">NHIF</option>
                <option value="AAR">AAR Insurance</option>
                <option value="Jubilee">Jubilee Insurance</option>
                <option value="CIC">CIC Insurance</option>
                <option value="Resolution">Resolution Insurance</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Insurance / NHIF Number</label>
              <input className="form-control" value={form.insurance_number} onChange={e => set('insurance_number', e.target.value)} placeholder="Membership number" />
            </div>
            <div className="form-group">
              <label className="form-label">Blood Group</label>
              <select className="form-control" value={form.blood_group} onChange={e => set('blood_group', e.target.value)}>
                <option value="">Unknown</option>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Known Allergies</label>
              <input className="form-control" value={form.allergies} onChange={e => set('allergies', e.target.value)} placeholder="Penicillin, Aspirin..." />
            </div>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <i className="bi bi-person-heart" /> Next of Kin
          </h3>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Name</label>
              <input className="form-control" value={form.next_of_kin} onChange={e => set('next_of_kin', e.target.value)} placeholder="Full name & relationship" />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-control" value={form.next_of_kin_phone} onChange={e => set('next_of_kin_phone', e.target.value)} placeholder="+254 7XX XXX XXX" />
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
            {loading ? <><i className="bi bi-arrow-repeat" style={{ animation: 'spin 0.8s linear infinite' }} /> Saving...</> : <><i className="bi bi-check-circle" /> Register Patient</>}
          </button>
        </div>
      </form>
    </div>
  )
}

// ── New Visit ────────────────────────────────────────────
export function NewVisit() {
  const navigate = useNavigate()
  const { show, ToastEl } = useToast()
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [patients, setPatients] = useState([])
  const [selected, setSelected] = useState(null)
  const [form, setForm] = useState({ visit_type: 'outpatient', chief_complaint: '' })

  const searchPatients = async (q) => {
    if (!q) return setPatients([])
    try {
      const res = await api.patients.list({ search: q })
      setPatients(res.results || res)
    } catch {}
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!selected) return show('Please select a patient', 'error')
    setLoading(true)
    try {
      const visit = await api.visits.create({ ...form, patient_id: selected.id })
      show(`Visit ${visit.visit_number} created!`)
      setTimeout(() => navigate('/reception/visits'), 1200)
    } catch (err) {
      show(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      {ToastEl}
      <div className="page-header">
        <button className="btn btn-ghost btn-sm" onClick={() => navigate(-1)} style={{ marginBottom: 12 }}>
          <i className="bi bi-arrow-left" /> Back
        </button>
        <h2 className="page-title">Register New Visit</h2>
        <p className="page-subtitle">Search for patient and create visit</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card" style={{ marginBottom: 16 }}>
          <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>
            <i className="bi bi-search" /> Search Patient
          </h3>
          <div className="form-group">
            <label className="form-label">Search by name, patient number, or phone</label>
            <input
              className="form-control"
              value={search}
              onChange={e => { setSearch(e.target.value); searchPatients(e.target.value) }}
              placeholder="Start typing to search..."
            />
          </div>
          {patients.length > 0 && (
            <div style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
              {patients.map(p => (
                <div
                  key={p.id}
                  onClick={() => { setSelected(p); setPatients([]) }}
                  style={{
                    padding: '12px 16px', cursor: 'pointer',
                    background: selected?.id === p.id ? '#dbeafe' : 'transparent',
                    borderBottom: '1px solid var(--border)', display: 'flex',
                    alignItems: 'center', gap: 12, transition: 'background 0.1s',
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 8, background: 'var(--primary)',
                    color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: 13, flexShrink: 0,
                  }}>
                    {p.first_name[0]}{p.last_name[0]}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{p.first_name} {p.last_name}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                      {p.patient_number} • {p.phone} • {p.gender === 'M' ? 'Male' : 'Female'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {selected && <PatientInfo patient={selected} />}
        </div>

        <div className="card" style={{ marginBottom: 24 }}>
          <h3 style={{ fontWeight: 700, fontSize: 15, marginBottom: 16 }}>Visit Details</h3>
          <div className="form-group">
            <label className="form-label">Visit Type *</label>
            <select className="form-control" value={form.visit_type} onChange={e => setForm(f => ({ ...f, visit_type: e.target.value }))}>
              <option value="outpatient">Outpatient</option>
              <option value="inpatient">Inpatient</option>
              <option value="emergency">Emergency</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Chief Complaint</label>
            <textarea
              className="form-control" rows={3}
              value={form.chief_complaint}
              onChange={e => setForm(f => ({ ...f, chief_complaint: e.target.value }))}
              placeholder="Main reason for visit..."
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-ghost" onClick={() => navigate(-1)}>Cancel</button>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading || !selected}>
            {loading ? 'Creating...' : <><i className="bi bi-clipboard-plus" /> Create Visit</>}
          </button>
        </div>
      </form>
    </div>
  )
}

// ── Patients List ────────────────────────────────────────
export function PatientsList() {
  const [patients, setPatients] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const load = async (s = '') => {
    setLoading(true)
    try {
      const res = await api.patients.list({ search: s })
      setPatients(res.results || res)
    } catch {} finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 className="page-title">Patient Records</h2>
          <p className="page-subtitle">{patients.length} patients registered</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/reception/new-patient')}>
          <i className="bi bi-person-plus" /> New Patient
        </button>
      </div>

      <div className="card">
        <div style={{ marginBottom: 16 }}>
          <SearchInput value={search} onChange={s => { setSearch(s); load(s) }} placeholder="Search patients..." />
        </div>
        {loading ? <div className="loading-spinner" /> : patients.length === 0 ? (
          <div className="empty-state">
            <i className="bi bi-people" /><p>No patients found</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Patient No.</th>
                  <th>Name</th>
                  <th>Age / Gender</th>
                  <th>Phone</th>
                  <th>Insurance</th>
                  <th>Registered</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {patients.map(p => (
                  <tr key={p.id}>
                    <td><span className="tag">{p.patient_number}</span></td>
                    <td style={{ fontWeight: 600 }}>{p.first_name} {p.last_name}</td>
                    <td>{p.age} yrs / {p.gender === 'M' ? 'Male' : p.gender === 'F' ? 'Female' : 'Other'}</td>
                    <td>{p.phone}</td>
                    <td>{p.insurance_provider || <span style={{ color: 'var(--text-muted)' }}>None</span>}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>{new Date(p.created_at).toLocaleDateString('en-KE')}</td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => navigate('/reception/new-visit', { state: { patient: p } })}>
                        <i className="bi bi-clipboard-plus" /> Visit
                      </button>
                    </td>
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

// ── Visits List ──────────────────────────────────────────
export function VisitsList() {
  const [visits, setVisits] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.visits.list({ date: new Date().toISOString().split('T')[0] })
      .then(d => { setVisits(d.results || d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Today's Visits</h2>
        <p className="page-subtitle">{visits.length} visits registered today</p>
      </div>
      <div className="card">
        {loading ? <div className="loading-spinner" /> : visits.length === 0 ? (
          <div className="empty-state"><i className="bi bi-calendar2-x" /><p>No visits today</p></div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr><th>Visit No.</th><th>Patient</th><th>Type</th><th>Complaint</th><th>Status</th><th>Time</th></tr>
              </thead>
              <tbody>
                {visits.map(v => (
                  <tr key={v.id}>
                    <td><span className="tag">{v.visit_number}</span></td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{v.patient_name}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{v.patient_number}</div>
                    </td>
                    <td><span className="badge badge-info" style={{ textTransform: 'capitalize' }}>{v.visit_type}</span></td>
                    <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.chief_complaint || '—'}</td>
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

// ── Router ───────────────────────────────────────────────
export default function Reception() {
  return (
    <Routes>
      <Route index element={<ReceptionDashboard />} />
      <Route path="new-patient" element={<NewPatient />} />
      <Route path="new-visit" element={<NewVisit />} />
      <Route path="patients" element={<PatientsList />} />
      <Route path="visits" element={<VisitsList />} />
    </Routes>
  )
}