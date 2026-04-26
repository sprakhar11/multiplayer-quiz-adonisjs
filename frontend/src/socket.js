import { io } from 'socket.io-client'
import { API_URL, getTokens } from './api'

let socket = null

export function connectSocket() {
  const tokens = getTokens()
  if (!tokens?.accessToken) return null

  if (socket?.connected) return socket

  socket = io(API_URL, {
    auth: { token: tokens.accessToken },
  })

  socket.on('connect', () => console.log('socket connected'))
  socket.on('disconnect', () => console.log('socket disconnected'))
  socket.on('connect_error', (err) => console.log('socket error:', err.message))

  return socket
}

export function getSocket() {
  return socket
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}
