import JWT, { JwtPayload } from 'jsonwebtoken'
import { DecodedToken } from '~/interfaces/user.interface'

const generateToken = async (userInfo: any, secretSignature: string, tokenLife: string) => {
  try {
    return JWT.sign(userInfo, secretSignature, {
      algorithm: 'HS256',
      expiresIn: tokenLife
    })
  } catch (error: any) {
    throw new Error(error)
  }
}

const verifyToken = async (token: string, secretSignature: string) => {
  try {
    return JWT.verify(token, secretSignature)
  } catch (error: any) {
    throw new Error(error)
  }
}

function isDecodedToken(payload: JwtPayload | string): payload is DecodedToken {
  return typeof payload === 'object' && 'id' in payload && 'email' in payload && 'role' in payload
}

export const JwtProvider = { generateToken, verifyToken, isDecodedToken }
