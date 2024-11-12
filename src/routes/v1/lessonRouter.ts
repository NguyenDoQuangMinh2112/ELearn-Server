import express from 'express'
import { lessonController } from '~/controllers/lesson.controllers'
import multer from 'multer'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { lessonValidation } from '~/validations/lessonValidate'
const Router = express.Router()
// const upload = multer({ dest: 'uploads/' })
const upload = multer()
Router.route('/create').post(upload.single('videoUrl'), lessonController.create)

Router.route('/auth').get(lessonController.getAuthUrlController)
Router.route('/oauth2callback').get(lessonController.oauth2callbackController)

Router.route('/:id').get(lessonController.getDetails).put(lessonController.update)

Router.route('/add-noteLesson').post(lessonController.addNoteLesson)

Router.route('/list-note/:lessonID').get(lessonController.getNoteLessonByID)

Router.route('/edit-note/:id').put(
  authMiddleware.isAuthorized,
  lessonValidation.updateNoteLesson,
  lessonController.editNoteLesson
)

export const lessonRoutes = Router
