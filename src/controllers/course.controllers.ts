import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { catchAsync } from '~/middlewares/catchAsyncErrors'
import { courseServices } from '~/services/courseServices'

const create = catchAsync(async (req: Request, res: Response) => {
  const { body, file } = req
  const thumbnailUrl = file?.path || '' // URL của hình ảnh từ Cloudinary

  // Gắn URL của thumbnail vào body của request
  const createNewCourse = await courseServices.create({ ...body, thumbnail: thumbnailUrl })
  res.status(StatusCodes.CREATED).json(createNewCourse)
})

const getDetailCourse = catchAsync(async (req: Request, res: Response) => {
  const courseId = req.params
  const course = await courseServices.getDetails(courseId)
  res.status(StatusCodes.OK).json(course)
})

const getAllCourses = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 10
  const course = await courseServices.getAll(page, limit)
  res.status(StatusCodes.OK).json(course)
})

const search = catchAsync(async (req: Request, res: Response) => {
  const keyword = req.query.q as string

  const searchData = await courseServices.search(keyword)
  res.status(StatusCodes.OK).json(searchData)
})

const getAllCoursesByTeacher = catchAsync(async (req: Request, res: Response) => {
  const userId = req.jwtDecoded?.id as string
  const course = await courseServices.getAllCoursesByTeacher(userId)
  res.status(StatusCodes.OK).json(course)
})

const editCourseDetail = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  const { file, body } = req
  const thumbnail = file?.path || ''

  const course = await courseServices.editCourseDetail(id, body, thumbnail)
  res.status(StatusCodes.OK).json(course)
})

const stats = catchAsync(async (req: Request, res: Response) => {
  const instructorId = req.jwtDecoded?.id as string
  const stats = await courseServices.stats(instructorId)
  res.status(StatusCodes.OK).json(stats)
})

export const courseController = {
  create,
  getDetailCourse,
  getAllCourses,
  search,
  getAllCoursesByTeacher,
  editCourseDetail,
  stats
}
