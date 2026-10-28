import { useState } from 'react'
import { apiFetch, prepareCsrf } from './api'

export default function AuthView({ onAuthenticated }) {
  const [mode, setMode] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(event) {
    event.preventDefault()
    setError('')
    if (mode === 'register' && password !== confirmPassword) {
      setError('两次输入的密码不一致。')
      return
    }
    setBusy(true)
    try {
      await prepareCsrf()
      const response = await apiFetch(`/api/auth/${mode === 'login' ? 'login' : 'register'}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      })
      const contentType = response.headers.get('content-type') || ''
      const result = contentType.includes('application/json')
        ? await response.json()
        : { detail: response.ok ? '服务器返回了无法识别的响应。' : `请求被服务器拒绝（${response.status}）。请确认开发服务器已重启后再试。` }
      if (!response.ok) throw new Error(result.username?.[0] || result.password?.[0] || result.detail || '无法完成请求，请重试。')
      onAuthenticated(result)
    } catch (submitError) {
      setError(submitError.message || '无法连接服务器，请确认 Django 正在运行。')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <a className="brand auth-brand" href="#projects"><span className="brand-symbol">d</span><span>devtrack</span><span className="brand-beta">BETA</span></a>
        <span className="eyebrow">YOUR PERSONAL WORKSPACE</span>
        <h1>{mode === 'login' ? '欢迎回来' : '创建你的账号'}</h1>
        <p className="auth-subtitle">登录后管理自己的项目和任务。</p>
        <form onSubmit={submit}>
          <label className="field-label" htmlFor="auth-username">用户名</label>
          <input id="auth-username" autoComplete="username" required maxLength="150" value={username} onChange={(event) => setUsername(event.target.value)} />
          <label className="field-label" htmlFor="auth-password">密码</label>
          <input id="auth-password" type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} required value={password} onChange={(event) => setPassword(event.target.value)} />
          {mode === 'register' && <><label className="field-label" htmlFor="auth-confirm">确认密码</label><input id="auth-confirm" type="password" autoComplete="new-password" required value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} /></>}
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button button-primary auth-submit" type="submit" disabled={busy}>{busy ? '请稍候…' : mode === 'login' ? '登录' : '创建账号'}</button>
        </form>
        <p className="auth-switch">{mode === 'login' ? '还没有账号？' : '已有账号？'} <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError('') }}>{mode === 'login' ? '注册' : '返回登录'}</button></p>
        <p className="auth-note">每个账号的数据相互隔离。</p>
      </section>
    </main>
  )
}
