import express from 'express'
import { exerciseController } from '~/controllers/exercise.controllers'
const Router = express.Router()

Router.route('/:id').get(exerciseController.getDetail)
export const exerciseRouter = Router
