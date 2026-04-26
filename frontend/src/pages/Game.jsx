import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { connectSocket, disconnectSocket } from '../socket'

export default function Game() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const sid = Number(sessionId)

  // try to load session data from sessionStorage (set by QuizList or JoinGame)
  const stored = sessionStorage.getItem(`session_${sid}`)
  const initial = stored ? JSON.parse(stored) : null

  const [currentQ, setCurrentQ] = useState(0)
  const [rankings, setRankings] = useState([])
  const [lastResult, setLastResult] = useState(null)
  const [gameOver, setGameOver] = useState(false)
  const [finalData, setFinalData] = useState(null)
  const [timeLeft, setTimeLeft] = useState(0)
  const [waiting, setWaiting] = useState(initial?.mode === 'multiplayer' && initial?.status === 'waiting')
  const [players, setPlayers] = useState([])
  const [questions, setQuestions] = useState(initial?.quiz?.questions || [])
  const [endsAt, setEndsAt] = useState(initial?.ends_at || null)
  const socketRef = useRef(null)

  useEffect(() => {
    const socket = connectSocket()
    socketRef.current = socket
    if (!socket) return

    socket.emit('session:join', { session_id: sid })

    socket.on('player:joined', (data) => {
      // replace entire player list with the one from server
      if (data.players) {
        setPlayers(data.players)
      }
    })

    socket.on('quiz:started', (data) => {
      setWaiting(false)
      if (data.questions) setQuestions(data.questions)
      if (data.ends_at) setEndsAt(data.ends_at)
    })

    socket.on('answer:result', (data) => setLastResult(data))

    socket.on('score:update', () => {})

    socket.on('rank:update', (data) => setRankings(data))

    socket.on('quiz:ended', (data) => {
      setGameOver(true)
      setFinalData(data)
      sessionStorage.removeItem(`session_${sid}`)
    })

    socket.on('player:left', (data) => {
      setPlayers((prev) => prev.filter((p) => p.user_id !== data.user_id))
    })

    socket.on('error', (data) => console.log('game error:', data))

    return () => disconnectSocket()
  }, [sid])

  // countdown timer
  useEffect(() => {
    if (!endsAt || waiting) return
    const endTime = new Date(endsAt).getTime()
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000))
      setTimeLeft(remaining)
      if (remaining <= 0) clearInterval(interval)
    }, 1000)
    return () => clearInterval(interval)
  }, [endsAt, waiting])

  function submitAnswer(optionId) {
    if (!socketRef.current) return
    const q = questions[currentQ]
    socketRef.current.emit('answer:submit', {
      session_id: sid,
      question_id: q.id,
      selected_option_id: optionId,
    })
    setTimeout(() => {
      if (currentQ < questions.length - 1) {
        setCurrentQ(currentQ + 1)
        setLastResult(null)
      }
    }, 800)
  }

  function beginGame() {
    if (socketRef.current) {
      socketRef.current.emit('session:begin', { session_id: sid })
    }
  }

  // no session data and not a multiplayer join — redirect home
  if (!initial && questions.length === 0 && !waiting) {
    return (
      <div style={{ maxWidth: 600, margin: '40px auto' }}>
        <p>Session not found or expired.</p>
        <button onClick={() => navigate('/')} style={btnStyle}>Back to Quizzes</button>
      </div>
    )
  }

  // waiting for players (multiplayer)
  if (waiting) {
    return (
      <div style={{ maxWidth: 600, margin: '40px auto' }}>
        <button onClick={() => navigate('/')} style={{ ...btnStyle, background: '#666', marginBottom: 20 }}>← Back</button>
        <h2>Waiting for players...</h2>
        <p>Session ID: <strong style={{ fontSize: 24 }}>{sid}</strong></p>
        <p>Invite code: <strong style={{ fontSize: 24 }}>{initial?.invite_code}</strong></p>
        <p>Share both with friends to join</p>
        <h3>Players ({players.length}):</h3>
        <ul>{players.map((p) => <li key={p.user_id}>{p.full_name}</li>)}</ul>
        {players.length >= 2 && (
          <button onClick={beginGame} style={btnStyle}>Start Quiz</button>
        )}
      </div>
    )
  }

  // game over
  if (gameOver && finalData) {
    return (
      <div style={{ maxWidth: 600, margin: '40px auto' }}>
        <h2>Game Over!</h2>
        <p>Reason: {finalData.reason}</p>
        {finalData.winner && (
          <p style={{ fontSize: 18 }}>
            Winner: <strong>{finalData.winner.full_name}</strong> with {finalData.winner.score} points
          </p>
        )}
        <h3>Final Rankings:</h3>
        <table style={tableStyle}>
          <thead><tr><th>Rank</th><th>Player</th><th>Score</th></tr></thead>
          <tbody>
            {finalData.final_rankings.map((p) => (
              <tr key={p.user_id}><td>#{p.rank}</td><td>{p.full_name}</td><td>{p.score}</td></tr>
            ))}
          </tbody>
        </table>
        <button onClick={() => navigate('/')} style={{ ...btnStyle, marginTop: 20 }}>Back to Quizzes</button>
      </div>
    )
  }

  // playing
  const q = questions[currentQ]
  if (!q) return <p>Loading questions...</p>

  return (
    <div style={{ maxWidth: 600, margin: '40px auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <button onClick={() => { if (confirm('Quit the game?')) navigate('/') }} style={{ background: 'none', border: '1px solid #ccc', padding: '4px 10px', cursor: 'pointer', borderRadius: 4 }}>← Quit</button>
        <span>Question {currentQ + 1} / {questions.length}</span>
        <span>Time left: {timeLeft}s</span>
        <span>Score: {lastResult?.total_score ?? 0}</span>
      </div>

      <h3>{q.text}</h3>

      <div>
        {q.options.map((opt) => (
          <button
            key={opt.id}
            onClick={() => submitAnswer(opt.id)}
            style={{
              ...optionBtn,
              background: lastResult?.question_id === q.id
                ? (lastResult.is_correct ? '#d4edda' : '#f8d7da')
                : '#f8f9fa',
            }}
          >
            {opt.text}
          </button>
        ))}
      </div>

      {lastResult && (
        <p style={{ marginTop: 10, fontWeight: 'bold', color: lastResult.is_correct ? 'green' : 'red' }}>
          {lastResult.is_correct ? `Correct! +${lastResult.score_awarded}` : 'Wrong!'}
        </p>
      )}

      {rankings.length > 1 && (
        <div style={{ marginTop: 20 }}>
          <h4>Live Rankings:</h4>
          {rankings.map((r) => (
            <div key={r.user_id}>#{r.rank} {r.full_name} — {r.score} pts</div>
          ))}
        </div>
      )}
    </div>
  )
}

const btnStyle = { padding: '10px 20px', fontSize: 14, cursor: 'pointer', background: '#0066cc', color: '#fff', border: 'none', borderRadius: 4 }
const optionBtn = { display: 'block', width: '100%', padding: 12, marginBottom: 8, fontSize: 14, cursor: 'pointer', border: '1px solid #ddd', borderRadius: 4, textAlign: 'left' }
const tableStyle = { width: '100%', borderCollapse: 'collapse', marginTop: 10 }
