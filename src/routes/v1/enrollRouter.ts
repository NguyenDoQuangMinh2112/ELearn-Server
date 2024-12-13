import express, { Response } from 'express'
import { enrollController } from '~/controllers/enroll.controllers'
import { authMiddleware } from '~/middlewares/authMiddleware'

const Router = express.Router()

Router.route('/create-checkout-session').post(enrollController.createCheckoutSession)

Router.route('/check-user-enroll').post(authMiddleware.isAuthorized, enrollController.isUserEnroll)

Router.route('/user-enroll-courses').get(authMiddleware.isAuthorized, enrollController.userEnrollCourses)

// Paypal method
export const enrollRoutes = Router
