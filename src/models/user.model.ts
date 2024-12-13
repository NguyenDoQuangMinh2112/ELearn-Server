import Joi from 'joi'
import bcrypt from 'bcrypt'
import { GET_DB } from '~/configs/connectDB'
import { ReqBodyLogin, ReqBodyRegister, User } from '~/interfaces/user.interface'
import { JwtProvider } from '~/providers/jwtProvider'
import { ObjectId } from 'mongodb'
import { enrollModel } from './enroll.model'
import { catchAsyncErrors } from '~/middlewares/catchAsyncErrors'
import ApiError from '~/utils/ApiError'
import { StatusCodes } from 'http-status-codes'

const USER_COLLECTION_NAME = 'users'

const USER_COLLECTION_SCHEMA = Joi.object({
  email: Joi.string()
    .required()
    .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'vn'] } }),
  password: Joi.string().required().min(5).trim().strict(),
  fullName: Joi.string().required().min(5).trim().strict(),
  role: Joi.string().valid('admin', 'user', 'teacher').default('user'),
  isActive: Joi.boolean().default('false'),
  isLocked: Joi.boolean().default('false'),
  avatar_url: Joi.string().default('https://img.freepik.com/free-icon/user_318-159711.jpg'),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})
const validateBeforeCreate = async (data: any) => {
  return await USER_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const findOneById = catchAsyncErrors(async (id: any) => {
  const result = await GET_DB()
    .collection(USER_COLLECTION_NAME)
    .findOne({
      _id: new ObjectId(id)
    })
  return result
})

const register = catchAsyncErrors(async (data: ReqBodyRegister) => {
  const validateData = await validateBeforeCreate(data)
  const existingUser = await GET_DB().collection(USER_COLLECTION_NAME).findOne({ email: data.email })
  if (existingUser) {
    throw new Error('Người dùng đã tồn tại !')
  }

  validateData.password = await bcrypt.hash(validateData.password, 10)
  const createdUser = await GET_DB().collection(USER_COLLECTION_NAME).insertOne(validateData)

  return createdUser
})

const login = catchAsyncErrors(async (data: ReqBodyLogin) => {
  const { email, password } = data
  const user = (await GET_DB().collection(USER_COLLECTION_NAME).findOne({ email })) as User

  if (!user) {
    throw new Error('Người dùng không tồn tại !')
  }
  //Cập nhật trạng thái active của người dùng
  user.isActive = true
  const passwordMatch = await bcrypt.compare(password, user.password)
  if (!passwordMatch) {
    throw new Error('Mật khẩu không chính xác. Xin vui lòng kiểm tra lại !')
  }

  // Xóa trường password khỏi đối tượng người dùng
  const { password: _, ...userWithoutPassword } = user

  const userInfo = {
    id: user._id,
    email: user.email,
    role: user.role
  }

  const secretSignatureAccessToken = process.env.ACCESS_TOKEN_SECRET
  const secretSignatureRefreshToken = process.env.REFRESH_TOKEN_SECRET

  const accessToken = await JwtProvider.generateToken(userInfo, String(secretSignatureAccessToken), '14 days')
  const refreshToken = await JwtProvider.generateToken(userInfo, String(secretSignatureRefreshToken), '14 days')

  return { accessToken, refreshToken, userWithoutPassword }
})
const emailCheckedBeforeRegister = catchAsyncErrors(async (email: string) => {
  let isAvailable: boolean
  const existingUser = await GET_DB().collection(USER_COLLECTION_NAME).findOne({ email: email })
  if (existingUser) {
    // if user exists already => throw an error
    isAvailable = false
  } else {
    isAvailable = true
  }

  return { isAvailable }
})
const getDetail = catchAsyncErrors(async (idU: any) => {
  const result = await GET_DB()
    .collection(USER_COLLECTION_NAME)
    .aggregate([
      {
        $match: { _id: new ObjectId(idU), _destroy: false }
      },
      {
        $lookup: {
          from: enrollModel.ENROLL_COLLECTION_NAME,
          localField: '_id',
          foreignField: 'user_id',
          as: 'enrolls'
        }
      }
    ])
    .toArray()
  return result[0] || {}
})

const getAll = async () => {
  try {
    const result = await GET_DB().collection(USER_COLLECTION_NAME).find({}).toArray()
    return result
  } catch (error: any) {
    throw new Error(error)
  }
}
const changePassword = catchAsyncErrors(async (idUser: string, reqBody: any) => {
  const { currentPassword, newPassword, confirmPassword } = reqBody
  if (!currentPassword) {
    throw new Error('Missing current password value!')
  }
  if (!newPassword) {
    throw new Error('Missing new password value!')
  }
  if (!confirmPassword) {
    throw new Error('Missing confirm password value!')
  }

  if (newPassword !== confirmPassword) {
    throw new Error('The new password does not match !')
  }

  const existingUser = await findOneById(idUser)
  if (!existingUser) {
    throw new Error('User not found')
  }
  const isPasswordMatch = await bcrypt.compare(currentPassword, existingUser.password)

  if (!isPasswordMatch) {
    throw new Error('Incorrect old password')
  }

  const hashedNewPassword = await bcrypt.hash(newPassword, 10)
  const updated = await GET_DB()
    .collection(USER_COLLECTION_NAME)
    .updateOne({ _id: new ObjectId(idUser) }, { $set: { password: hashedNewPassword } })
  return updated
})

const uploadAvatar = catchAsyncErrors(async (userId: string, path: any) => {
  const result = await GET_DB()
    .collection(USER_COLLECTION_NAME)
    .findOneAndUpdate({ _id: new ObjectId(userId) }, { $set: { avatar_url: path } }, { returnDocument: 'after' })

  return result
})

const updateInfo = catchAsyncErrors(async (userId: string, reqBody: any) => {
  const result = await GET_DB()
    .collection(USER_COLLECTION_NAME)
    .findOneAndUpdate({ _id: new ObjectId(userId) }, { $set: reqBody }, { returnDocument: 'after' })

  return result
})

const updatePassword = async (email: string, newPassword: string) => {
  const hashedPassword = await bcrypt.hash(newPassword, 10) // '10' là số lượng rounds (bạn có thể thay đổi)

  const result = await GET_DB()
    .collection(userModel.USER_COLLECTION_NAME)
    .updateOne({ email: email }, { $set: { password: hashedPassword } })

  if (result.matchedCount === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Không tìm thấy người dùng để cập nhật mật khẩu.')
  }

  return result
}

const getListStudent = catchAsyncErrors(async (userId: string, page: number, limit: number) => {
  const courses = await GET_DB()
    .collection('courses')
    .find({
      instructor_id: new ObjectId(userId),
      _destroy: false
    })
    .toArray()

  if (courses.length === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'No courses found for this instructor')
  }
  const courseIds = courses.map((course: any) => course._id)
  const enrollments = await GET_DB()
    .collection('enrolls')
    .aggregate([
      {
        $match: {
          courseId: { $in: courseIds.map((id: any) => new ObjectId(id)) },
          _destroy: false
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      {
        $unwind: '$userInfo'
      },
      {
        $project: {
          _id: 0,
          courseId: 1,
          userId: 1,
          'userInfo.fullName': 1,
          'userInfo.email': 1,
          'userInfo.avatar_url': 1
        }
      }
    ])
    .toArray()
  return enrollments
})

export const userModel = {
  USER_COLLECTION_NAME,
  USER_COLLECTION_SCHEMA,
  register,
  login,
  emailCheckedBeforeRegister,
  getDetail,
  getAll,
  changePassword,
  uploadAvatar,
  updateInfo,
  findOneById,
  updatePassword,
  getListStudent
}
