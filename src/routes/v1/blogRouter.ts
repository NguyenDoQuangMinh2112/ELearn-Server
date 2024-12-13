import express from 'express'
import { blogController } from '~/controllers/blog.controllers'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { blogValidation } from '~/validations/blogValidate'
const uploadCloud = require('~/configs/cloudinary.config')
const Router = express.Router()

Router.route('/').get(blogController.getAll)

Router.route('/reactions').post(authMiddleware.isAuthorized, blogController.reactions)

Router.route('/isliked-by-user').post(authMiddleware.isAuthorized, blogController.islikedByUser)

Router.route('/:id')
  .get(blogController.getDetails)
  .put(authMiddleware.isAuthorized, blogController.editBlog)
  .delete(authMiddleware.isAuthorized, blogController.deleteBlog)

Router.route('/create').post(
  authMiddleware.isAuthorized,
  uploadCloud.single('banner'),
  blogValidation.create,
  blogController.create
)

export const blogRoutes = Router
