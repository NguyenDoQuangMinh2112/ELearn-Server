import Joi from 'joi'

import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'

const register = async (req: Request, res: Response, next: NextFunction) => {
  const correctCondition = Joi.object({
    email: Joi.string()
      .required()
      .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'vn'] } }),
    password: Joi.string().required().min(5).trim().strict(),
    fullName: Joi.string().required().min(5).trim().strict()
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error) {
    if (error instanceof Error) {
      next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, error.message))
    } else {
      next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, String(error)))
    }
  }
}

const login = async (req: Request, res: Response, next: NextFunction) => {
  const correctCondition = Joi.object({
    email: Joi.string()
      .required()
      .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net', 'vn'] } }),
    password: Joi.string().required().min(3).trim().strict()
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error: any) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  const correctCondition = Joi.object({
    password: Joi.string().required().min(3).trim().strict().messages({
      'any.required': 'Please enter new password',
      'string.min': 'Password min 3 chars'
    })
  })

  try {
    await correctCondition.validateAsync(req.body, { abortEarly: false })
    next()
  } catch (error: any) {
    next(new ApiError(StatusCodes.UNPROCESSABLE_ENTITY, new Error(error).message))
  }
}

export const userValidation = { register, login }
