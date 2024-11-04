import Joi from 'joi'
import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const create = async (req: Request, res: Response, next: NextFunction) => {
  const correctCondition = Joi.object({
    title: Joi.string().required().min(3).max(300).trim().strict(),
    des: Joi.string().max(200).required(),
    content: Joi.array().required(),
    author: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    tags: Joi.array().items(Joi.string()).optional(),
    banner: Joi.string(),
    activity: Joi.object({
      total_likes: Joi.number().default(0),
      total_comments: Joi.number().default(0),
      total_reads: Joi.number().default(0),
      total_parent_comments: Joi.number().default(0)
    }).default(),
    comments: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).optional(),
    draft: Joi.boolean().default(false)
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

export const blogValidation = { create }
