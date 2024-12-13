import { ReqBodyLogin, ReqBodyRegister } from '~/interfaces/user.interface'
import { userModel } from '~/models/user.model'
import { sendVerificationEmail } from '~/utils/email'
import crypto from 'crypto'
import { GET_DB } from '~/configs/connectDB'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
const temporaryStorage: { [key: string]: { data: ReqBodyRegister; code: string } } = {}

const temporaryResetTokens: { [key: string]: string } = {}

const register = async (reqBody: ReqBodyRegister) => {
  const existingUser = await GET_DB().collection(userModel.USER_COLLECTION_NAME).findOne({ email: reqBody.email })
  if (existingUser) {
    throw new Error('Người dùng đã tồn tại. Vui lòng chọn một email khác !')
  }

  const verificationCode = crypto.randomBytes(3).toString('hex').toLocaleUpperCase()
  temporaryStorage[reqBody.email] = { data: reqBody, code: verificationCode }
  await sendVerificationEmail(reqBody.email, verificationCode)

  return {
    statusCode: StatusCodes.CREATED,
    message: 'Bạn đã đăng ký tài khoản thành công! Vui lòng truy cập email để lấy mã xác thực để xác thực tài khoản !'
  }
}

const verifyCode = async (code: string) => {
  const email = Object.keys(temporaryStorage).find((key) => temporaryStorage[key].code === code)
  if (!email) {
    throw new Error('Không tìm thấy mã code hoặc dữ liệu đăng ký không hợp lệ.')
  }
  const { data } = temporaryStorage[email]
  await userModel.register(data)
  delete temporaryStorage[email]

  return { statusCode: StatusCodes.CREATED, message: 'Đăng ký email thành công !' }
}
const login = async (reqBody: ReqBodyLogin) => {
  const { accessToken, refreshToken, userWithoutPassword } = await userModel.login(reqBody)

  return { accessToken, refreshToken, userWithoutPassword }
}
const emailCheckedBeforeRegister = async (email: string) => {
  const emailChecked = await userModel.emailCheckedBeforeRegister(email)
  return emailChecked
}

const getDetail = async (idU: any) => {
  const detailUser = await userModel.getDetail(idU)

  return detailUser
}
const getAll = async () => {
  const users = await userModel.getAll()

  if (!users) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Chapter not found')
  }

  return { message: '', statusCode: StatusCodes.OK, data: users }
}
const changePassword = async (idUser: string, reqBody: any) => {
  const updatedUser = await userModel.changePassword(idUser, reqBody)

  return {
    statusCode: StatusCodes.CREATED,
    message: updatedUser.acknowledged ? 'Reset password success!' : 'Something went wrong!'
  }
}

const uploadAvatar = async (userId: string, path: any) => {
  const updatedUser = await userModel.uploadAvatar(userId, path)
  return { success: true, avatar_url: updatedUser.avatar_url }
}
const updateInfo = async (userId: string, reqBody: any) => {
  const data = {
    ...reqBody,
    updatedAt: Date.now()
  }
  const updatedUser = await userModel.updateInfo(userId, data)

  return {
    statusCode: updatedUser ? StatusCodes.OK : StatusCodes.UNPROCESSABLE_ENTITY,
    message: updatedUser ? 'Update info success!' : 'Something went wrong!',
    data: updatedUser ? updatedUser : null
  }
}

const forgotPassword = async (email: string) => {
  const existingUser = await GET_DB().collection(userModel.USER_COLLECTION_NAME).findOne({ email: email })
  if (!existingUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'User not found.')
  }

  const resetToken = crypto.randomBytes(3).toString('hex').toLocaleUpperCase()

  temporaryResetTokens[email] = resetToken

  await sendVerificationEmail(email, resetToken)

  return {
    statusCode: StatusCodes.OK,
    message: 'A password reset link has been sent to your email.'
  }
}
const verifyResetToken = async (email: string, token: string) => {
  const storedToken = temporaryResetTokens[email]

  if (!storedToken) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid token.')
  }

  if (storedToken !== token) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid token.')
  }

  return {
    statusCode: StatusCodes.OK,
    message: 'Token is valid, you can now reset your password.'
  }
}

// Reset the password
const resetPassword = async (email: string, newPasswordReset: string, confirmPasswordReset: string) => {
  if (newPasswordReset !== confirmPasswordReset) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Mật khẩu xác nhận không khớp.')
  }
  const existingUser = await GET_DB().collection(userModel.USER_COLLECTION_NAME).findOne({ email: email })
  if (!existingUser) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Người dùng không tồn tại.')
  }
  await userModel.updatePassword(email, newPasswordReset)
  return {
    statusCode: StatusCodes.CREATED,
    message: 'Mật khẩu đã được reset thành công.'
  }
}

const getListStudent = async (userId: string, page: number, limit: number) => {
  const students = await userModel.getListStudent(userId, page, limit)
  return { statusCode: StatusCodes.OK, data: students }
}

export const userServices = {
  register,
  verifyCode,
  login,
  emailCheckedBeforeRegister,
  getDetail,
  getAll,
  changePassword,
  uploadAvatar,
  updateInfo,
  forgotPassword,
  verifyResetToken,
  resetPassword,
  getListStudent
}
