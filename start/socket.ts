// init socket.io after the http server is up and running
import app from '@adonisjs/core/services/app'
import { initSocketServer } from '#socket/socket_server'

app.ready(async () => {
  initSocketServer()
})
