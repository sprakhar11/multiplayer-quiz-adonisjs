import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login, register, saveTokens } from '../api'

export default function Login() {
  const navigate = useNavigate()
  const [isRegister, setIsRegister] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const res = isRegister
        ? await register(name, email, password)
        : await login(email, password)
      saveTokens(res.data.tokens)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Something went wrong')
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '60px auto', padding: 20 }}>
      <h2>{isRegister ? 'Register' : 'Login'}</h2>
      <form onSubmit={handleSubmit}>
        {isRegister && (
          <input type="text" placeholder="Full Name" value={name} onChange={(e) => setName(e.target.value)} required style={inputStyle} />
        )}
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
        <input type="password" placeholder="Password (min 8 chars)" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} style={inputStyle} />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" style={btnStyle}>{isRegister ? 'Register' : 'Login'}</button>
      </form>
      <p style={{ marginTop: 10 }}>
        {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button onClick={() => setIsRegister(!isRegister)} style={{ background: 'none', border: 'none', color: '#0066cc', cursor: 'pointer' }}>
          {isRegister ? 'Login' : 'Register'}
        </button>
      </p>
    </div>
  )
}

const inputStyle = { display: 'block', width: '100%', padding: 10, marginBottom: 10, fontSize: 14, boxSizing: 'border-box' }
const btnStyle = { padding: '10px 20px', fontSize: 14, cursor: 'pointer', background: '#0066cc', color: '#fff', border: 'none', borderRadius: 4 }
