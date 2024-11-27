import { Server } from 'socket.io'
import http from 'http'
import express from 'express'

const app = express()

const server = http.createServer(app)
const io = new Server(server, {
  cors: {
    origin: process.env.FE_URL,
    methods: ['GET', 'POST']
  }
})

let onlineUsers: any = []

const addNewUser = (idUser: string, socketId: string) => {
  !onlineUsers.some((user: any) => user.idUser === idUser) && onlineUsers.push({ idUser, socketId })
}
export const getUser = (idUser: string) => {
  return onlineUsers?.find((user: any) => user.idUser === idUser)
}
const removeUser = (socketId: string) => {
  onlineUsers = onlineUsers.filter((user: any) => user.socketId !== socketId)
}

io.on('connection', (socket: any) => {
  socket.on('newUser', (userId: string) => {
    addNewUser(userId, socket.id)
  })

  socket.on('newNotification', (notification: any) => {
    const userSocket = getUser(notification.notification_for)
    if (userSocket) {
      // Gửi sự kiện chỉ tới người nhận
      socket.to(userSocket.socketId).emit('newNotification', notification)
    }
  })

  socket.on('disconnect', () => {
    removeUser(socket.id)
  })
})
// Send event to the client => use io
// to send every client => use io.emit
// to send one client =>use io.to(socketId).emit
// take event from client => use socket.on
// Send event to server => use socket.emit
// Take event from server => use socket.on
export { app, io, server }
