import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getQuizzes, startSession } from '../api'

export default function QuizList() {
  const navigate = useNavigate()
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getQuizzes()
      .then((data) => setQuizzes(data))
      .catch((err) => console.error('failed to load quizzes', err))
      .finally(() => setLoading(false))
  }, [])

  async function handleStart(quizId, mode) {
    try {
      const data = await startSession(quizId, mode)
      // save session data so game page can pick it up
      sessionStorage.setItem(`session_${data.session_id}`, JSON.stringify(data))
      navigate(`/game/${data.session_id}`)
    } catch (err) {
      alert(err.message || 'Failed to start session')
    }
  }

  if (loading) return <p>Loading quizzes...</p>

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2>Available Quizzes</h2>
        <div>
          <button onClick={() => navigate('/profile')} style={linkBtn}>Profile</button>
          <button onClick={() => navigate('/leaderboard')} style={linkBtn}>Leaderboard</button>
          <button onClick={() => navigate('/join')} style={linkBtn}>Join Game</button>
        </div>
      </div>

      {quizzes.length === 0 && <p>No quizzes available</p>}

      {quizzes.map((quiz) => (
        <div key={quiz.id} style={cardStyle}>
          <h3>{quiz.title}</h3>
          <p>{quiz.description}</p>
          <p>
            <strong>Category:</strong> {quiz.category} | <strong>Difficulty:</strong> {quiz.difficulty} |{' '}
            <strong>Questions:</strong> {quiz.questions.length} | <strong>Time:</strong> {quiz.time_per_question}s each
          </p>
          <button onClick={() => handleStart(quiz.id, 'solo')} style={btnStyle}>Play Solo</button>
          <button onClick={() => handleStart(quiz.id, 'multiplayer')} style={{ ...btnStyle, marginLeft: 10, background: '#28a745' }}>
            Create Multiplayer
          </button>
        </div>
      ))}
    </div>
  )
}

const cardStyle = { border: '1px solid #ddd', padding: 16, marginBottom: 12, borderRadius: 6 }
const btnStyle = { padding: '8px 16px', fontSize: 14, cursor: 'pointer', background: '#0066cc', color: '#fff', border: 'none', borderRadius: 4 }
const linkBtn = { background: 'none', border: '1px solid #ccc', padding: '6px 12px', marginLeft: 8, cursor: 'pointer', borderRadius: 4 }
