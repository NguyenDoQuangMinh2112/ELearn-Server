import express from 'express'
import { notificationController } from '~/controllers/notification.controllers'

const Router = express.Router()

Router.route('/').get(notificationController.getAll)

export const notificationRouter = Router
