import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { catchAsync } from '~/middlewares/catchAsyncErrors'
import { blogServices } from '~/services/blogServices'

const create = catchAsync(async (req: Request, res: Response) => {
  const { file, body } = req
  const banner = file?.path || ''

  const createdBlog = await blogServices.create({ ...body, banner })
  res.status(StatusCodes.CREATED).json(createdBlog)
})
const getAll = catchAsync(async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 10
  const blogs = await blogServices.getAll(page, limit)
  res.status(StatusCodes.OK).json(blogs)
})

const getDetails = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  const blogDetail = await blogServices.getDetails(id)
  res.status(StatusCodes.OK).json(blogDetail)
})

const reactions = catchAsync(async (req: Request, res: Response) => {
  const { blogId, isLiked } = req.body
  const userId = req?.jwtDecoded?.id
  const createReaction = await blogServices.reactions(blogId, String(userId), isLiked)
  res.status(StatusCodes.CREATED).json(createReaction)
})
const islikedByUser = catchAsync(async (req: Request, res: Response) => {
  const { blogId } = req.body
  const userId = req?.jwtDecoded?.id
  const createLikedByUser = await blogServices.likeByUser(blogId, String(userId))
  res.status(StatusCodes.CREATED).json(createLikedByUser)
})

export const blogController = { create, getAll, getDetails, reactions, islikedByUser }
