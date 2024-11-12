import Joi from 'joi'
import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const updateNoteLesson = async (req: Request, res: Response, next: NextFunction) => {
  const correctCondition = Joi.object({
    content: Joi.string().required().min(1).max(500).trim().strict().messages({
      'any.required': 'Title is required',
      'string.empty': 'Title is not allowed to be empty'
    })
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

export const lessonValidation = { updateNoteLesson }
