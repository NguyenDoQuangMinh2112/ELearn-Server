import express from 'express'
import cors from 'cors'
import exitHook from 'async-exit-hook'
import cookieParser from 'cookie-parser'
import { env } from '~/configs/evironment'
import { CLOSE_DB, CONNECT_DB } from './configs/connectDB'
import { errorHandlingMiddleware } from '~/middlewares/errorHandlingMiddleware'
import { APIs_V1 } from './routes/v1'

const START_SERVER = () => {
  const app = express()

  app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
  })

  app.use(express.json())
  // Use Cookie
  app.use(cookieParser())

  app.use(
    cors({
      origin: 'http://localhost:5173',
      methods: ['GET', 'PUT', 'POST', 'DELETE', 'PATCH'],
      credentials: true
    })
  )

  // User API v1
  app.use('/v1', APIs_V1)

  // Middleware handlle error
  app.use(errorHandlingMiddleware)

  app.listen(process.env.PORT, () => {
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
