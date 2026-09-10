import { createServer } from 'node:http'
import express from 'express'
import cors from 'cors'
import { Server } from 'socket.io'
import {
  createRoom,
  getRoom,
  addPlayer,
  removePlayer,
  closeRoom,
  playerList,
} from './rooms.js'

const PORT = process.env.PORT || 4000
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173'

const app = express()
app.use(cors({ origin: CLIENT_ORIGIN }))
app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'kahoot-uz-server' }))

const httpServer = createServer(app)
const io = new Server(httpServer, { cors: { origin: CLIENT_ORIGIN } })

io.on('connection', (socket) => {
  // ---- HOST (o'qituvchi ekrani) ----
  socket.on('host:create', (_payload, ack) => {
    const room = createRoom(socket.id)
    socket.join(room.pin)
    socket.data.role = 'host'
    socket.data.pin = room.pin
    ack?.({ pin: room.pin })
  })

  socket.on('host:start', ({ quizId } = {}) => {
    const pin = socket.data.pin
    const room = getRoom(pin)
    if (!room || room.hostId !== socket.id) return
    room.status = 'active'
    room.quizId = quizId ?? null
    io.to(pin).emit('game:started', { quizId: room.quizId })
    // TODO: savol-javob sikli (question:show, answer:submit, question:result, game:leaderboard)
  })

  // ---- PLAYER (o'quvchi telefoni) ----
  socket.on('player:join', ({ pin, name, character }, ack) => {
    const result = addPlayer(pin, { id: socket.id, name: String(name || '').trim(), character })
    if (result.error) return ack?.({ error: result.error })
    socket.join(pin)
    socket.data.role = 'player'
    socket.data.pin = pin
    ack?.({ ok: true, pin })
    io.to(pin).emit('lobby:update', { players: playerList(result.room) })
  })

  socket.on('disconnect', () => {
    if (socket.data.role === 'host') {
      const room = closeRoom(socket.id)
      if (room) io.to(room.pin).emit('game:closed')
    } else if (socket.data.role === 'player') {
      const room = removePlayer(socket.id)
      if (room) io.to(room.pin).emit('lobby:update', { players: playerList(room) })
    }
  })
})

httpServer.listen(PORT, () => {
  console.log(`Kahoot UZ server → http://localhost:${PORT}`)
})
