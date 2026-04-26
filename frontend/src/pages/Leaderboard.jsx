import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getLeaderboard } from '../api'

export default function Leaderboard() {
  const navigate = useNavigate()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getLeaderboard()
      .then((data) => setEntries(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p>Loading leaderboard...</p>

  return (
    <div style={{ maxWidth: 600, margin: '40px auto' }}>
      <h2>Global Leaderboard</h2>

      {entries.length === 0 ? (
        <p>No games played yet</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #333' }}>
              <th style={th}>Rank</th><th style={th}>Player</th><th style={th}>Score</th>
              <th style={th}>Played</th><th style={th}>Won</th><th style={th}>Win %</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.user_id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={td}>#{e.rank}</td><td style={td}>{e.full_name}</td><td style={td}>{e.total_score}</td>
                <td style={td}>{e.games_played}</td><td style={td}>{e.games_won}</td><td style={td}>{e.win_rate}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button onClick={() => navigate('/')} style={{ marginTop: 20, padding: '8px 16px', cursor: 'pointer' }}>Back</button>
    </div>
  )
}

const th = { textAlign: 'left', padding: 8 }
const td = { padding: 8 }
