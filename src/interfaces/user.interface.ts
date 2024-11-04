import { ObjectId } from 'mongodb'
export interface ReqBodyRegister {
  fullName: string
  email: string
  password: string
}

export interface ReqBodyLogin {
  email: string
  password: string
}

export interface DecodedToken {
  id: string
  email: string
  role: 'admin' | 'teacher' | 'user'
  iat: number
  exp: number
}

export interface User {
  _id: ObjectId
  fullName: string
  email: string
  password: string
  role: string
  isActive: boolean
  isLocked: boolean
  verified: boolean
  avatar_url: string
  createdAt: number
  updatedAt: number | null
  _destroy: boolean
}
