import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { getTokens } from './api'
import Login from './pages/Login'
import QuizList from './pages/QuizList'
import Game from './pages/Game'
import JoinGame from './pages/JoinGame'
import Profile from './pages/Profile'
import Leaderboard from './pages/Leaderboard'
import Layout from './Layout'

function ProtectedRoute({ children }) {
  const tokens = getTokens()
  if (!tokens?.accessToken) return <Navigate to="/login" />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index element={<QuizList />} />
          <Route path="profile" element={<Profile />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="join" element={<JoinGame />} />
          <Route path="game/:sessionId" element={<Game />} />
        </Route>
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}
