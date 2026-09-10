// Xotiradagi o'yin xonalari ombori.
// Ishlab chiqarishda bu Redis yoki DB bilan almashtiriladi.

/** @typedef {{ id: string, name: string, character: string, score: number }} Player */
/** @typedef {{ pin: string, hostId: string, status: 'lobby'|'active'|'ended', players: Map<string, Player>, quizId: string|null }} Room */

/** @type {Map<string, Room>} */
const rooms = new Map()

/** 6 xonali, chalkashtirmaydigan PIN (0/1/O/I yo'q) */
export function generatePin() {
  let pin
  do {
    pin = String(Math.floor(100000 + Math.random() * 900000))
  } while (rooms.has(pin))
  return pin
}

export function createRoom(hostId) {
  const pin = generatePin()
  /** @type {Room} */
  const room = { pin, hostId, status: 'lobby', players: new Map(), quizId: null }
  rooms.set(pin, room)
  return room
}

export function getRoom(pin) {
  return rooms.get(pin) ?? null
}

export function addPlayer(pin, player) {
  const room = rooms.get(pin)
  if (!room) return { error: "Bunday PIN kodli o'yin topilmadi." }
  if (room.status !== 'lobby') return { error: "O'yin allaqachon boshlangan." }
  if ([...room.players.values()].some((p) => p.name.toLowerCase() === player.name.toLowerCase())) {
    return { error: 'Bu ism band. Boshqa ism tanlang.' }
  }
  room.players.set(player.id, { ...player, score: 0 })
  return { room }
}

export function removePlayer(playerId) {
  for (const room of rooms.values()) {
    if (room.players.delete(playerId)) return room
  }
  return null
}

export function closeRoom(hostId) {
  for (const [pin, room] of rooms) {
    if (room.hostId === hostId) {
      rooms.delete(pin)
      return room
    }
  }
  return null
}

export function playerList(room) {
  return [...room.players.values()].map(({ id, name, character, score }) => ({
    id,
    name,
    character,
    score,
  }))
}
