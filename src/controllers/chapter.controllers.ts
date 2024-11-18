import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { catchAsync } from '~/middlewares/catchAsyncErrors'
import { chapterServices } from '~/services/chapterServices'

const create = catchAsync(async (req: Request, res: Response) => {
  const createNewChapter = await chapterServices.create(req.body)
  res.status(StatusCodes.CREATED).json(createNewChapter)
})
const getAll = catchAsync(async (req: Request, res: Response) => {
  const chapter = await chapterServices.getAll()
  res.status(StatusCodes.OK).json(chapter)
})
const createQuestionExercise = catchAsync(async (req: Request, res: Response) => {
  const exercise = await chapterServices.createQuestionExercise(req.body)
  res.status(StatusCodes.CREATED).json(exercise)
})

const createAnswerExercise = catchAsync(async (req: Request, res: Response) => {
  const question = await chapterServices.createAnswerExercise(req.body)
  res.status(StatusCodes.CREATED).json(question)
})
const getAllChapterByCourseId = catchAsync(async (req: Request, res: Response) => {
  const { courseId } = req.params

  const chapters = await chapterServices.getAllChapterByCourseId(courseId)

  res.status(StatusCodes.OK).json(chapters)
})
export const chapterController = {
  create,
  getAll,
  createQuestionExercise,
  createAnswerExercise,
  getAllChapterByCourseId
}
