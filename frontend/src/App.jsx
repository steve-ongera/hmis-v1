import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import LoginPage from './pages/Login'
import Reception from './pages/Reception'
import Triage from './pages/Triage'
import Consultation from './pages/Consultation'
import Cashier from './pages/Cashier'
import Pharmacy from './pages/Pharmacy'
import Wards from './pages/Wards'
import AdminDashboard from './pages/Admin'

// Role → default route mapping
const ROLE_HOME = {
  admin: '/admin-dashboard',
  receptionist: '/reception',
  triage_nurse: '/triage',
  doctor: '/consultation',
  cashier: '/cashier',
  pharmacist: '/pharmacy',
  ward_nurse: '/wards',
}

function ProtectedRoute({ children, roles }) {
  const { user, loading, isAuthenticated } = useAuth()
  if (loading) return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: 'var(--sidebar-bg)', flexDirection: 'column', gap: 16,
    }}>
      <div style={{
        width: 40, height: 40, border: '3px solid rgba(255,255,255,0.1)',
        borderTopColor: '#00b4d8', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Loading...</span>
    </div>
  )
  if (!isAuthenticated) return <Navigate to="/" replace />
  if (roles && !roles.includes(user?.role)) {
    return <Navigate to={ROLE_HOME[user?.role] || '/'} replace />
  }
  return children
}

function RoleRedirect() {
  const { user, isAuthenticated } = useAuth()
  if (!isAuthenticated) return <Navigate to="/" replace />
  return <Navigate to={ROLE_HOME[user?.role] || '/reception'} replace />
}

function AppRoutes() {
  const { isAuthenticated } = useAuth()

  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={isAuthenticated ? <RoleRedirect /> : <LoginPage />} />

      {/* Protected layout */}
      <Route element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        {/* Admin */}
        <Route path="/admin-dashboard/*" element={
          <ProtectedRoute roles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        {/* Shared admin routes */}
        <Route path="/patients/*" element={
          <ProtectedRoute roles={['admin', 'receptionist']}>
            <Reception />
          </ProtectedRoute>
        } />
        <Route path="/visits/*" element={
          <ProtectedRoute roles={['admin', 'receptionist']}>
            <Reception />
          </ProtectedRoute>
        } />
        <Route path="/users/*" element={
          <ProtectedRoute roles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/drugs/*" element={
          <ProtectedRoute roles={['admin', 'pharmacist']}>
            <Pharmacy />
          </ProtectedRoute>
        } />

        {/* Reception */}
        <Route path="/reception/*" element={
          <ProtectedRoute roles={['admin', 'receptionist']}>
            <Reception />
          </ProtectedRoute>
        } />

        {/* Triage */}
        <Route path="/triage/*" element={
          <ProtectedRoute roles={['admin', 'triage_nurse']}>
            <Triage />
          </ProtectedRoute>
        } />

        {/* Consultation */}
        <Route path="/consultation/*" element={
          <ProtectedRoute roles={['admin', 'doctor']}>
            <Consultation />
          </ProtectedRoute>
        } />

        {/* Cashier */}
        <Route path="/cashier/*" element={
          <ProtectedRoute roles={['admin', 'cashier']}>
            <Cashier />
          </ProtectedRoute>
        } />

        {/* Pharmacy */}
        <Route path="/pharmacy/*" element={
          <ProtectedRoute roles={['admin', 'pharmacist']}>
            <Pharmacy />
          </ProtectedRoute>
        } />

        {/* Wards */}
        <Route path="/wards/*" element={
          <ProtectedRoute roles={['admin', 'ward_nurse', 'doctor']}>
            <Wards />
          </ProtectedRoute>
        } />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<RoleRedirect />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}