import { ReqBodyLogin, ReqBodyRegister } from '~/interfaces/user.interface'
import { userModel } from '~/models/user.model'
import { sendVerificationEmail } from '~/utils/email'
import crypto from 'crypto'
import { GET_DB } from '~/configs/connectDB'
import { StatusCodes } from 'http-status-codes'
import { ObjectId } from 'mongodb'
import ApiError from '~/utils/ApiError'
const temporaryStorage: { [key: string]: { data: ReqBodyRegister; code: string } } = {}

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
const resetPassword = async (idUser: string, reqBody: any) => {
  const updatedUser = await userModel.resetPassword(idUser, reqBody)

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
  const updatedUser = await userModel.updateInfo(userId, reqBody)

  return {
    statusCode: updatedUser ? StatusCodes.OK : StatusCodes.UNPROCESSABLE_ENTITY,
    message: updatedUser ? 'Update info success!' : 'Something went wrong!',
    data: updatedUser ? updatedUser : null
  }
}
export const userServices = {
  register,
  verifyCode,
  login,
  emailCheckedBeforeRegister,
  getDetail,
  getAll,
  resetPassword,
  uploadAvatar,
  updateInfo
}
