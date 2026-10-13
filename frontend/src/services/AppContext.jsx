import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { api } from './api'
import { getRole, getWorkspace, setRole as saveRole } from './session'

const Ctx = createContext(null)
export const useApp = () => useContext(Ctx)

export function AppProvider({ children }) {
  const [config, setConfig] = useState(null)
  const [configError, setConfigError] = useState('')
  const [role, setRoleState] = useState(getRole())
  const [workspace] = useState(getWorkspace())

  const load = useCallback(() => {
    api.config().then(setConfig).catch((e) => setConfigError(e.message || 'Cannot reach the API'))
  }, [])
  useEffect(load, [load])

  const setRole = (r) => { saveRole(r); setRoleState(r) }
  return <Ctx.Provider value={{ config, configError, role, setRole, workspace, reload: load }}>{children}</Ctx.Provider>
}
