import express from 'express'
import { blogController } from '~/controllers/blog.controllers'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { blogValidation } from '~/validations/blogValidate'
const uploadCloud = require('~/configs/cloudinary.config')
const Router = express.Router()

Router.route('/').get(blogController.getAll)

Router.route('/:id').get(blogController.getDetails)

Router.route('/create').post(
  authMiddleware.isAuthorized,
  uploadCloud.single('banner'),
  blogValidation.create,
  blogController.create
)

export const blogRoutes = Router
