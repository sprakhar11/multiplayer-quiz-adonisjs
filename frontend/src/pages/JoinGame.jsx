import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { joinSession } from '../api'

export default function JoinGame() {
  const navigate = useNavigate()
  const [inviteCode, setInviteCode] = useState('')
  const [error, setError] = useState('')

  async function handleJoin(e) {
    e.preventDefault()
    setError('')
    try {
      const res = await joinSession(inviteCode.toUpperCase())
      sessionStorage.setItem(`session_${res.session_id}`, JSON.stringify({
        session_id: res.session_id,
        mode: res.mode,
        status: 'waiting',
        invite_code: null,
        quiz: null,
        ends_at: null,
      }))
      navigate(`/game/${res.session_id}`)
    } catch (err) {
      setError(err.message || 'Failed to join')
    }
  }

  return (
    <div style={{ maxWidth: 400, margin: '60px auto', padding: 20 }}>
      <h2>Join a Game</h2>
      <form onSubmit={handleJoin}>
        <input
          type="text"
          placeholder="Invite Code (8 letters)"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
          required
          maxLength={8}
          style={inputStyle}
        />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" style={btnStyle}>Join</button>
        <button type="button" onClick={() => navigate('/')} style={{ ...btnStyle, background: '#666', marginLeft: 10 }}>Back</button>
      </form>
    </div>
  )
}

const inputStyle = { display: 'block', width: '100%', padding: 10, marginBottom: 10, fontSize: 14, boxSizing: 'border-box' }
const btnStyle = { padding: '10px 20px', fontSize: 14, cursor: 'pointer', background: '#0066cc', color: '#fff', border: 'none', borderRadius: 4 }
