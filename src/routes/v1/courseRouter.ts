import express from 'express'
import { courseController } from '~/controllers/course.controllers'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { courseValidation } from '~/validations/courseValidate'
const uploadCloud = require('~/configs/cloudinary.config')

const Router = express.Router()

Router.route('/').get(courseController.getAllCourses)
Router.route('/:id')
  .get(courseController.getDetailCourse)
  .put(uploadCloud.single('thumbnail'), courseController.editCourseDetail)

Router.route('/create').post(
  authMiddleware.isAuthorized,
  uploadCloud.single('thumbnail'),
  courseValidation.create,
  courseController.create
)

// Teacher
Router.route('/teacher/courses').get(authMiddleware.isAuthorized, courseController.getAllCoursesByTeacher)

export const courseRoutes = Router
