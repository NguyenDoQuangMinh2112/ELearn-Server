import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { userServices } from '~/services/userServices'
import ms from 'ms'
import { JwtProvider } from '~/providers/jwtProvider'
import { env } from '~/configs/evironment'
import { JwtPayload } from 'jsonwebtoken'
import { catchAsync } from '~/middlewares/catchAsyncErrors'

// Register a new user
const register = catchAsync(async (req: Request, res: Response) => {
  const createNewUser = await userServices.register(req.body)
  res.status(StatusCodes.CREATED).json(createNewUser)
})

export const verifyCodeController = catchAsync(async (req: Request, res: Response) => {
  const { code } = req.body
  const result = await userServices.verifyCode(code)
  res.status(StatusCodes.CREATED).json(result)
})

export const login = catchAsync(async (req: Request, res: Response) => {
  const { accessToken, refreshToken, userWithoutPassword } = await userServices.login(req.body)
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: ms('14 days')
  })
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: ms('14 days')
  })

  res.status(StatusCodes.OK).json({ statusCode: StatusCodes.OK, data: userWithoutPassword, accessToken, refreshToken })
})

export const logout = catchAsync(async (req: Request, res: Response) => {
  res.clearCookie('accessToken')
  res.clearCookie('refreshToken')
  res.status(StatusCodes.OK).json({ message: 'Logout API success!' })
})

export const refreshToken = catchAsync(async (req: Request, res: Response) => {
  const refreshTokenFromBody = req.body?.refreshToken

  // 2. Verify token
  const refreshTokenDecoded: JwtPayload | string = await JwtProvider.verifyToken(
    refreshTokenFromBody,
    String(env.REFRESH_TOKEN_SECRET)
  )

  if (JwtProvider.isDecodedToken(refreshTokenDecoded)) {
    const userInfo = {
      id: refreshTokenDecoded.id,
      email: refreshTokenDecoded.email,
      role: refreshTokenDecoded.role
    }

    const secretSignatureAccessToken = process.env.ACCESS_TOKEN_SECRET
    const accessToken = await JwtProvider.generateToken(userInfo, String(secretSignatureAccessToken), '7 days')

    // Res lai cookie accessToken moi
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: ms('14 days')
    })
    res.status(StatusCodes.OK).json({ accessToken })
  }
})

const updateInfo = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  const updatedUser = await userServices.updateInfo(id, req.body)
  res.status(StatusCodes.OK).json(updatedUser)
})

const getAlls = catchAsync(async (req: Request, res: Response) => {
  const users = await userServices.getAll()
  res.status(StatusCodes.OK).json(users)
})

const emailCheckedBeforeRegister = catchAsync(async (req: Request, res: Response) => {
  const email = req.query.email as string
  const emailChecked = await userServices.emailCheckedBeforeRegister(email)
  res.send(emailChecked)
})

const getDetail = catchAsync(async (req: Request, res: Response) => {
  const idU = req.params.id
  if (idU) {
    const detailUser = await userServices.getDetail(idU)
    res.status(StatusCodes.OK).json(detailUser)
  } else {
    throw Error('Id user not found !')
  }
})

const changePassword = catchAsync(async (req: Request, res: Response) => {
  const idUser = req.jwtDecoded?.id
  const updatedUser = await userServices.changePassword(String(idUser), req.body)
  res.status(StatusCodes.OK).json(updatedUser)
})

const uploadAvatar = catchAsync(async (req: Request, res: Response) => {
  if (!req.file) {
    throw new Error('No file uploaded!')
  }
  const path = req.file.path
  const userId = req.params.id
  const updatedAvatarUser = await userServices.uploadAvatar(userId, path)
  res.status(StatusCodes.OK).json(updatedAvatarUser)
})

const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const { email } = req.body
  const user = await userServices.forgotPassword(email)
  res.status(StatusCodes.OK).json(user)
})

const verifyResetToken = catchAsync(async (req: Request, res: Response) => {
  const { code, email } = req.body
  const result = await userServices.verifyResetToken(email, code)
  res.status(StatusCodes.CREATED).json(result)
})

const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const { email, newPasswordReset, confirmPasswordReset } = req.body
  const result = await userServices.resetPassword(email, newPasswordReset, confirmPasswordReset)
  res.status(StatusCodes.OK).json(result)
})

export const userController = {
  register,
  verifyCodeController,
  login,
  logout,
  refreshToken,
  updateInfo,
  getAlls,
  emailCheckedBeforeRegister,
  getDetail,
  changePassword,
  uploadAvatar,
  forgotPassword,
  verifyResetToken,
  resetPassword
}
