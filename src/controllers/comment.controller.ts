import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { commentServices } from '~/services/comment.services'

export const addComment = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.jwtDecoded?.id
  const createdComment = await commentServices.addComment(userId, req.body)
  res.status(StatusCodes.CREATED).json(createdComment)
}

export const commentController = { addComment }
