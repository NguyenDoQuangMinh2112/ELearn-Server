import express from 'express'
import { commentController } from '~/controllers/comment.controller'
import { authMiddleware } from '~/middlewares/authMiddleware'
const Router = express.Router()

Router.route('/add-comment').post(authMiddleware.isAuthorized, commentController.addComment)

export const commentRoutes = Router
