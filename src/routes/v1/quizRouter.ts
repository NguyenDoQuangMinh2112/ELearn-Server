import express from 'express'
import { quizController } from '~/controllers/quiz.controllers'

const Router = express.Router()

Router.route('/create').post(quizController.create)

export const quizRouter = Router
