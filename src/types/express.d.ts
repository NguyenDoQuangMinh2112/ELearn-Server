import { Request } from 'express'
import { Multer } from 'multer'
import { DecodedToken } from '~/interfaces/user.interface'
declare global {
  namespace Express {
    export interface Request {
      jwtDecoded?: DecodedToken
      file?: Multer.File
    }
  }
}
