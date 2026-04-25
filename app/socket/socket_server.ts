import { Server as SocketServer } from 'socket.io'
import server from '@adonisjs/core/services/server'
import JwtService from '#services/auth/jwt_service'
import { registerSessionHandlers } from '#socket/session_handler'
import type { JwtPayload } from '#types/auth'

let io: SocketServer

export function getSocketServer(): SocketServer {
  return io
}

// attach socket.io to the existing adonis http server
export function initSocketServer() {
  const httpServer = server.getNodeServer()
  if (!httpServer) {
    throw new Error('http server not available yet')
  }

  io = new SocketServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  })

  const jwtService = new JwtService()

  // verify jwt token before allowing connection
  // client must send token in handshake: io({ auth: { token: 'xxx' } })
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token
    if (!token) {
      return next(new Error('authentication required'))
    }

    try {
      const payload: JwtPayload = jwtService.verifyToken(token)
      // store user info on socket so we can use it later in event handlers
      socket.data.user = payload
      next()
    } catch {
      next(new Error('invalid or expired token'))
    }
  })

  io.on('connection', (socket) => {
    const user = socket.data.user as JwtPayload
    console.log(`socket connected: ${user.email} (id: ${user.userId})`)

    // register all game event handlers for this socket
    registerSessionHandlers(io, socket)

    socket.on('disconnect', () => {
      console.log(`socket disconnected: ${user.email} (id: ${user.userId})`)
    })
  })

  console.log('socket.io server ready')
}
