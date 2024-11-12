import express from 'express'
import { notificationController } from '~/controllers/notification.controllers'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

Router.route('/').get(authMiddleware.isAuthorized, notificationController.getAll)

export const notificationRouter = Router
