import { NextFunction, Request, Response } from 'express'

const { StatusCodes } = require('http-status-codes')
const { JwtProvider } = require('~/providers/jwtProvider')

const isAuthorized = async (req: Request, res: Response, next: NextFunction) => {
  // Cách 1: Lấy AccessToken nằm trong cookie phía client - withCredentials trong file axios và credentials trong CORS
  const accessTokenFromCookies = req.cookies.accessToken
  if (!accessTokenFromCookies) {
    res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized! (Token not found)' })
    return
  }
  // Cách 2: Lấy AccessToken trong trường hợp phía client lưu ở local storage và gửi lên thông qua header
  const accessTokenFromHeader = req.headers.authorization
  if (!accessTokenFromHeader) {
    res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized! (Token not found)' })
    return
  }

  try {
    // B1:Thực hiện giải mã Token xem nó có hợp lệ hay không
    const accessTokenDecoded = await JwtProvider.verifyToken(
      //   accessTokenFromCookies,
      accessTokenFromHeader.substring('Bearer '.length),
      process.env.ACCESS_TOKEN_SECRET
    )
    // B2: Lưu thông tin vào req.jwtDecoded, để sử dụng cho các tầng cần xử lý
    req.jwtDecoded = accessTokenDecoded
    // B3: Cho phép các request thực hiện tiếp
    next()
  } catch (error: any) {
    if (error?.message?.includes('jwt expired')) {
      res.status(StatusCodes.GONE).json({ message: 'Need refresh token' })
      return
    }

    res.status(StatusCodes.UNAUTHORIZED).json({ message: 'Unauthorized! Please login.' })
  }
}
//Check role Admin
const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const role = req.jwtDecoded?.role
  if (role !== 'admin')
    return res.status(StatusCodes.FORBIDDEN).json({
      success: false,
      statusCode: StatusCodes.FORBIDDEN,
      message: 'Bạn không phải là Admin !'
    })
  next()
}

export const authMiddleware = {
  isAuthorized,
  isAdmin
}
