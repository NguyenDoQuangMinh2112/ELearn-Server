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

export const chapterController = { create, getAll }
