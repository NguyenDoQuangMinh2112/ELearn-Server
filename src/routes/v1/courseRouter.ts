import express from 'express'
import { courseController } from '~/controllers/course.controllers'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { courseValidation } from '~/validations/courseValidate'
const uploadCloud = require('~/configs/cloudinary.config')

const Router = express.Router()

Router.route('/').get(courseController.getAllCourses)
Router.route('/:id').get(courseController.getDetailCourse)

Router.route('/create').post(
  authMiddleware.isAuthorized,
  authMiddleware.isAdmin,
  uploadCloud.single('thumbnail'),
  courseValidation.create,
  courseController.create
)

Router.route('/add-noteLesson').post(courseController.addNoteLesson)

export const courseRoutes = Router
