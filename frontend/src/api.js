function csrfToken() {
  const match = document.cookie.match(/(?:^|; )csrftoken=([^;]*)/)
  return match ? decodeURIComponent(match[1]) : ''
}

export function apiFetch(url, options = {}) {
  const headers = new Headers(options.headers || {})
  const method = (options.method || 'GET').toUpperCase()
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && csrfToken()) {
    headers.set('X-CSRFToken', csrfToken())
  }
  return fetch(url, { ...options, headers, credentials: 'same-origin' })
}

export async function prepareCsrf() {
  const response = await fetch('/api/auth/csrf/', { credentials: 'same-origin' })
  if (!response.ok) throw new Error('无法初始化安全会话，请刷新页面后重试。')
}
