import express from 'express'
import cors from 'cors'
import exitHook from 'async-exit-hook'
import cookieParser from 'cookie-parser'
import { env } from '~/configs/evironment'
import { CLOSE_DB, CONNECT_DB } from './configs/connectDB'
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware'
import { APIs_V1 } from './routes/v1'
import { courseController } from './controllers/course.controllers'
import { app, server } from './sockets/socket'

const START_SERVER = () => {
  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  })

  app.use(express.json())
  // Use Cookie
  app.use(cookieParser())

  const allowedOrigins = ['http://localhost:5174', 'http://localhost:5175', process.env.FE_URL]

  app.use(
    cors({
      origin: function (origin, callback) {
        if (allowedOrigins.includes(origin) || !origin) {
          callback(null, true) // Chấp nhận yêu cầu từ origin trong mảng
        } else {
          callback(new Error('CORS not allowed'), false) // Từ chối yêu cầu
        }
      },
      methods: ['GET', 'PUT', 'POST', 'DELETE', 'PATCH'],
      credentials: true
    })
  )

  // User API v1
  app.use('/v1', APIs_V1)
  app.use('/search', courseController.search)
  // Middleware handlle error
  app.use(errorHandlingMiddleware)

  server.listen(process.env.PORT, () => {
    console.log(`2. I am running on Production at Port ${env.PORT}`)
  })

  // Thực hiện các tác vụ cleanup trước khi dừng server
  exitHook(() => {
    console.log('3. Disconect from MongoDB Atlas')
    CLOSE_DB()
  })
}
// IIFE (Immediately Invoked Function Expression)
;(async () => {
  try {
    console.log('1. Connected to MongoDB Cloud Atlas!')
    await CONNECT_DB()
    START_SERVER()
  } catch (error) {
    console.log(error)
    process.exit(0)
  }
})()
