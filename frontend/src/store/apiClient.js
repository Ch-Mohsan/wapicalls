const DEFAULT_TIMEOUT_MS = 15000

let authToken = null

export function setAuthToken(token) {
  authToken = token || null
}

export async function apiFetch(path, { method = 'GET', headers = {}, body, signal, timeoutMs = DEFAULT_TIMEOUT_MS } = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(new Error('timeout')), timeoutMs)
  const base = import.meta.env.VITE_API_BASE_URL || ''
  const url = `${base}${path}`
  const requestHeaders = {
    'Accept': 'application/json',
    ...(body && !(body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
    ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
    ...headers,
  }
  try {
    const res = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body && !(body instanceof FormData) ? JSON.stringify(body) : body,
      signal: signal || controller.signal,
      credentials: 'include',
    })
    const isJson = (res.headers.get('content-type') || '').includes('application/json')
    const data = isJson ? await res.json() : await res.text()
    if (!res.ok) {
      const error = new Error(res.statusText)
      error.status = res.status
      error.data = data
      throw error
    }
    return data
  } finally {
    clearTimeout(timeout)
  }
}

export const ApiClient = {
  get: (p, opts) => apiFetch(p, { ...opts, method: 'GET' }),
  post: (p, body, opts) => apiFetch(p, { ...opts, method: 'POST', body }),
  put: (p, body, opts) => apiFetch(p, { ...opts, method: 'PUT', body }),
  patch: (p, body, opts) => apiFetch(p, { ...opts, method: 'PATCH', body }),
  delete: (p, opts) => apiFetch(p, { ...opts, method: 'DELETE' }),
}