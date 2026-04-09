import { createContext, useContext, useState, useEffect } from 'react'
import { api, getToken, setToken, setUser, getUser, removeToken } from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUserState] = useState(getUser())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = getToken()
    if (token && !user) {
      api.auth.me()
        .then(u => setUserState(u))
        .catch(() => removeToken())
        .finally(() => setLoading(false))
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (credentials) => {
    const data = await api.auth.login(credentials)
    setToken(data.access)
    setUser(data.user)
    setUserState(data.user)
    return data
  }

  const logout = () => {
    removeToken()
    setUserState(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)