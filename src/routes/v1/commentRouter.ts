import express from 'express'
import { commentController } from '~/controllers/comment.controllers'
import { authMiddleware } from '~/middlewares/authMiddleware'
const Router = express.Router()

Router.route('/add-comment').post(authMiddleware.isAuthorized, commentController.addComment)
Router.route('/:blogId').get(commentController.getCommentByBlogId)

export const commentRoutes = Router
