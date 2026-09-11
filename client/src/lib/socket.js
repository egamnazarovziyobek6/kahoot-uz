// Socket.IO ulanishi. Lokalda Vite dev proxy /socket.io ni :4000 ga yo'naltiradi, shuning
// uchun bir xil origin ishlatiladi. Productionda backend boshqa domenda bo'lgani uchun
// VITE_API_URL orqali to'liq manzilga ulanadi (auth cookie withCredentials bilan boradi).

import { io } from 'socket.io-client'

const API_ORIGIN = import.meta.env.VITE_API_URL || undefined

let socket = null

export function getSocket() {
  if (!socket) {
    socket = io(API_ORIGIN, { withCredentials: true, autoConnect: true })
  }
  return socket
}

export function disconnectSocket() {
  socket?.disconnect()
  socket = null
}
