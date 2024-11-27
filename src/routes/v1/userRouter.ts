import express from 'express'
import { userController } from '~/controllers/user.controllers'
import { authMiddleware } from '~/middlewares/authMiddleware'
import { userValidation } from '~/validations/userValidate'

const Router = express.Router()
const uploadCloud = require('~/configs/cloudinary.config')
// API lấy danh sách người dùng - ADMIN
Router.route('/').get(authMiddleware.isAuthorized, userController.getAlls)
// API đăng ký.
Router.route('/register').post(userValidation.register, userController.register)

// API verify code sau khi đăng ký.
Router.route('/verify-code').post(userController.verifyCodeController)

// API đăng nhập.
Router.route('/login').post(userValidation.login, userController.login)

// API đăng xuất.
Router.route('/logout').delete(userController.logout)

// API Refresh Token - Cấp lại Access Token mới.
Router.route('/refresh_token').put(userController.refreshToken)

// API cập nhật thông tin user
Router.route('/:id').put(authMiddleware.isAuthorized, userController.updateInfo)

// API Check email khi đăng ký tài khoản
Router.route('/check-email').get(userController.emailCheckedBeforeRegister)

// API GET DETAILS USER
Router.route('/detail/:id').get(authMiddleware.isAuthorized, userController.getDetail)

// API Reset password

Router.route('/reset-password').post(authMiddleware.isAuthorized, userController.resetPassword)

// API Change avatar
Router.route('/change-avatar/:id').put(
  authMiddleware.isAuthorized,
  uploadCloud.single('avatar_url'),
  userController.uploadAvatar
)

export const userRoutes = Router
