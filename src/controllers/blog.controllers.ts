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
    const page = parseInt(req.query.page as string) || 1 // Trang hiện tại
    const limit = parseInt(req.query.limit as string) || 10
    const blogs = await blogServices.getAll(page, limit)
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

const reactions = async (req: Request, res: Response, next: NextFunction) => {
  const { blogId, isLiked } = req.body
  const userId = req?.jwtDecoded?.id
  const createReaction = await blogServices.reactions(blogId, String(userId), isLiked)
  res.status(StatusCodes.CREATED).json(createReaction)
}
const islikedByUser = async (req: Request, res: Response, next: NextFunction) => {
  const { blogId } = req.body
  const userId = req?.jwtDecoded?.id
  const createLikedByUser = await blogServices.likeByUser(blogId, String(userId))
  res.status(StatusCodes.CREATED).json(createLikedByUser)
}

export const blogController = { create, getAll, getDetails, reactions, islikedByUser }
