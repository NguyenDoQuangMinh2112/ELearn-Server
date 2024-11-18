import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { catchAsync } from '~/middlewares/catchAsyncErrors'
import { commentServices } from '~/services/comment.services'

export const addComment = catchAsync(async (req: Request, res: Response) => {
  const userId = req.jwtDecoded?.id
  const createdComment = await commentServices.addComment(userId, req.body)
  res.status(StatusCodes.CREATED).json(createdComment)
})
export const getCommentByBlogId = catchAsync(async (req: Request, res: Response) => {
  const { blogId } = req.params
  const getCommentByBlogId = await commentServices.getCommentByBlogId(blogId)
  res.status(StatusCodes.OK).json(getCommentByBlogId)
})
export const commentController = { addComment, getCommentByBlogId }
