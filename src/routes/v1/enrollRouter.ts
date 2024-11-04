import express, { Response } from 'express'
import { enrollController } from '~/controllers/enroll.controllers'

const Router = express.Router()

Router.route('/').post(enrollController.enrollCourse)

export const enrollRoutes = Router
