import Joi from 'joi'
import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import ApiError from '~/utils/ApiError'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const create = async (req: Request, res: Response, next: NextFunction) => {
  const correctCondition = Joi.object({
    title: Joi.string().required().min(3).max(50).trim().strict(),
    courseId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    order: Joi.number().required()
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

const createQuestionExercise = async (req: Request, res: Response, next: NextFunction) => {
  const correctCondition = Joi.object({
    title: Joi.string().required().trim().strict(),
    description: Joi.string().required().trim().strict(),
    chapterId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    questions: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([])
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

const createAnswerExercise = async (req: Request, res: Response, next: NextFunction) => {
  const correctCondition = Joi.object({
    quizId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
    question: Joi.string().required().trim().strict(),
    options: Joi.array().optional(),
    correct_answer: Joi.string().optional(),
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

export const chapterValidation = { create, createQuestionExercise, createAnswerExercise }
