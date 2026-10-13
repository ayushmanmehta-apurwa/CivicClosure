import { getReporterId, getRole, getWorkspace } from './session'

const BASE = import.meta.env.VITE_API_BASE || ''

function headers(extra = {}) {
  return { 'X-Workspace': getWorkspace(), 'X-Role': getRole(), 'X-Reporter': getReporterId(), ...extra }
}

async function request(path, options = {}) {
  const res = await fetch(BASE + path, { ...options, headers: headers(options.headers) })
  let data = null
  try { data = await res.json() } catch { /* empty body */ }
  if (!res.ok) {
    const detail = data && data.detail
    const msg = typeof detail === 'string' ? detail : Array.isArray(detail) ? detail.map((d) => d.msg).join('; ') : 'Request failed (' + res.status + ')'
    const err = new Error(msg)
    err.status = res.status
    throw err
  }
  return data
}

const json = (method, body) => ({ method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })

export const api = {
  config: () => request('/api/config'),
  tickets: (params = {}) => {
    const q = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== '' && v != null && v !== false))
    return request('/api/tickets?' + q.toString())
  },
  ticket: (id) => request('/api/tickets/' + id),
  audit: (id) => request('/api/tickets/' + id + '/audit'),
  createReport: (form) => request('/api/reports', { method: 'POST', body: form }),
  provideInfo: (id, body) => request('/api/tickets/' + id + '/info', json('POST', body)),
  confirm: (id, fixed, comment = '') => request('/api/tickets/' + id + '/confirm', json('POST', { fixed, comment })),
  deleteData: (id) => request('/api/tickets/' + id + '/my_data', { method: 'DELETE' }),
  start: (id) => request('/api/tickets/' + id + '/start', { method: 'POST' }),
  claimClosure: (id, form) => request('/api/tickets/' + id + '/claim_closure', { method: 'POST', body: form }),
  humanDecision: (id, body) => request('/api/tickets/' + id + '/human_decision', json('POST', body)),
  stats: () => request('/api/stats'),
  advanceClock: (hours) => request('/api/admin/advance_clock?hours=' + hours, { method: 'POST' }),
  resetClock: () => request('/api/admin/reset_clock', { method: 'POST' }),
  resetWorkspace: () => request('/api/admin/reset_workspace', { method: 'POST' }),
  runHotspots: () => request('/api/admin/hotspots/run', { method: 'POST' }),
  hotspots: () => request('/api/hotspots'),
  metrics: () => request('/api/metrics'),
  samples: () => request('/api/samples'),
  sampleBlob: async (name, seed) => {
    const res = await fetch(BASE + '/api/samples/' + name + '?seed=' + seed)
    if (!res.ok) throw new Error('Could not load the sample image.')
    return res.blob()
  },
  imageUrl: (id) => BASE + '/api/images/' + id + '?ws=' + encodeURIComponent(getWorkspace()),
}
