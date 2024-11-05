import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { courseServices } from '~/services/courseServices'
import { lessonServices } from '~/services/lessonServices'

const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { body, file } = req
    const thumbnailUrl = file?.path || '' // URL của hình ảnh từ Cloudinary

    // Gắn URL của thumbnail vào body của request
    const createNewCourse = await courseServices.create({ ...body, thumbnail: thumbnailUrl })
    res.status(StatusCodes.CREATED).json(createNewCourse)
  } catch (error) {
    next(error)
  }
}

const getDetailCourse = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const courseId = req.params
    const course = await courseServices.getDetails(courseId)
    res.status(StatusCodes.OK).json(course)
  } catch (error) {
    next(error)
  }
}

const getAllCourses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const couse = await courseServices.getAll()
    res.status(StatusCodes.OK).json(couse)
  } catch (error) {
    next(error)
  }
}


export const courseController = { create, getDetailCourse, getAllCourses }
