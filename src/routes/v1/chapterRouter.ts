import express from 'express'
import { chapterController } from '~/controllers/chapter.controllers'
import { chapterValidation } from '~/validations/chapterValidate'

const Router = express.Router()

Router.route('/create').post(chapterValidation.create, chapterController.create)

Router.route('/').get(chapterController.getAll)

export const chapterRoutes = Router
