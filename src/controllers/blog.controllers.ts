import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { blogServices } from '~/services/blogServices'

const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { file, body } = req
    const banner = file?.path || ''

    const createdBlog = await blogServices.create({ ...body, banner })
    res.status(StatusCodes.CREATED).json(createdBlog)
  } catch (error) {
    next(error)
  }
}
const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const blogs = await blogServices.getAll()
    res.status(StatusCodes.OK).json(blogs)
  } catch (error) {
    next(error)
  }
}

const getDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params
    const blogDetail = await blogServices.getDetails(id)
    res.status(StatusCodes.OK).json(blogDetail)
  } catch (error) {
    next(error)
  }
}

export const blogController = { create, getAll, getDetails }
