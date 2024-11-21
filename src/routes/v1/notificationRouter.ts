import express from 'express'
import { notificationController } from '~/controllers/notification.controllers'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

Router.route('/').get(authMiddleware.isAuthorized, notificationController.getAll)

Router.route('/mark-all').put(authMiddleware.isAuthorized, notificationController.markAll)

Router.route('/:id').patch(authMiddleware.isAuthorized, notificationController.markAsSeen)

export const notificationRouter = Router
