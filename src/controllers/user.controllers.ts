import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { userServices } from '~/services/userServices'
import ms from 'ms'
import { JwtProvider } from '~/providers/jwtProvider'
import { env } from '~/configs/evironment'
import { DecodedToken } from '~/interfaces/user.interface'
import { JwtPayload } from 'jsonwebtoken'

// Register a new user
const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const createNewUser = await userServices.register(req.body)
    res.status(StatusCodes.CREATED).json(createNewUser)
  } catch (error) {
    next(error)
  }
}

export const verifyCodeController = async (req: Request, res: Response) => {
  const { code } = req.body
  try {
    const result = await userServices.verifyCode(code)
    res.status(StatusCodes.CREATED).json(result)
  } catch (error: any) {
    res.status(400).json({ message: 'Xác minh không thành công', error: error.message })
  }
}

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
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

    res
      .status(StatusCodes.OK)
      .json({ statusCode: StatusCodes.OK, data: userWithoutPassword, accessToken, refreshToken })
  } catch (error) {
    next(error)
  }
}
export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    res.clearCookie('accessToken')
    res.clearCookie('refreshToken')
    res.status(StatusCodes.OK).json({ message: 'Logout API success!' })
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(error)
  }
}
export const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1 Lấy refreshToken từ body
    const refreshTokenFromBody = req.body?.refreshToken

    // 2. Verify token
    const refreshTokenDecoded: JwtPayload | string = await JwtProvider.verifyToken(
      // refreshTokenFromCookie,
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
  } catch (error) {
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: 'Refresh token api failed' })
  }
}

const updateInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const updatedUser = await userServices.updateInfo(id, req.body)
    res.status(StatusCodes.OK).json(updatedUser)
  } catch (error) {
    next(error)
  }
}
const getAlls = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await userServices.getAll()
    res.status(StatusCodes.OK).json(users)
  } catch (error) {
    next(error)
  }
}
const emailCheckedBeforeRegister = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = req.query.email as string
    const emailChecked = await userServices.emailCheckedBeforeRegister(email)
    res.send(emailChecked)
  } catch (error) {
    next(error)
  }
}
const getDetail = async (req: Request, res: Response, next: NextFunction) => {
  const idU = req.params.id
  if (idU) {
    const detailUser = await userServices.getDetail(idU)
    res.status(StatusCodes.OK).json(detailUser)
  } else {
    throw Error('Id user not found !')
  }
}

const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const idUser = req.jwtDecoded?.id
    const updatedUser = await userServices.resetPassword(String(idUser), req.body)
    res.status(StatusCodes.OK).json(updatedUser)
  } catch (error) {
    next(error)
  }
}
const uploadAvatar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      next(new Error('No file uploaded!'))
      return
    }
    const path = req.file.path
    const userId = req.params.id
    const updatedAvatarUser = await userServices.uploadAvatar(userId, path)
    res.status(StatusCodes.OK).json(updatedAvatarUser)
  } catch (error) {
    next(error)
  }
}
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
  resetPassword,
  uploadAvatar
}
