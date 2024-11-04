import express from 'express'
import { lessonController } from '~/controllers/lesson.controllers'
import multer from 'multer'
const Router = express.Router()
// const upload = multer({ dest: 'uploads/' })
const upload = multer()
Router.route('/create').post(upload.single('videoUrl'), lessonController.create)

Router.route('/auth').get(lessonController.getAuthUrlController)
Router.route('/oauth2callback').get(lessonController.oauth2callbackController)

Router.route('/:id').get(lessonController.getDetails).put(lessonController.update)

export const lessonRoutes = Router
