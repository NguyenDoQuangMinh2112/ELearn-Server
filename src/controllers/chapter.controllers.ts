import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { chapterServices } from '~/services/chapterServices'

const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const createNewChapter = await chapterServices.create(req.body)
    res.status(StatusCodes.CREATED).json(createNewChapter)
  } catch (error) {
    next(error)
  }
}
const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const chapter = await chapterServices.getAll()
    res.status(StatusCodes.OK).json(chapter)
  } catch (error) {
    next(error)
  }
}
const createQuestionExercise = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const exercise = await chapterServices.createQuestionExercise(req.body)
    res.status(StatusCodes.CREATED).json(exercise)
  } catch (error) {
    next(error)
  }
}

const createAnswerExercise = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const question = await chapterServices.createAnswerExercise(req.body)
    res.status(StatusCodes.CREATED).json(question)
  } catch (error) {
    next(error)
  }
}
export const chapterController = { create, getAll, createQuestionExercise, createAnswerExercise }
