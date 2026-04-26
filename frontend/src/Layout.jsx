import { Outlet, useNavigate } from 'react-router-dom'
import { clearTokens } from './api'

export default function Layout() {
  const navigate = useNavigate()

  function handleLogout() {
    clearTokens()
    navigate('/login')
  }

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #ddd', paddingBottom: 10, marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 20, cursor: 'pointer' }} onClick={() => navigate('/')}>Quiz Game</h1>
        <button onClick={handleLogout} style={{ background: 'none', border: '1px solid #ccc', padding: '6px 12px', cursor: 'pointer', borderRadius: 4 }}>
          Logout
        </button>
      </div>
      <Outlet />
    </div>
  )
}
