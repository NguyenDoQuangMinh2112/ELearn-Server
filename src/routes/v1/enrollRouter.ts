import express, { Response } from 'express'
import { enrollController } from '~/controllers/enroll.controllers'

const Router = express.Router()

Router.route('/create-checkout-session').post(enrollController.createCheckoutSession)

// Paypal moethod
export const enrollRoutes = Router
