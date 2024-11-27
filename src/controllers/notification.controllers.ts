import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { catchAsync } from '~/middlewares/catchAsyncErrors'
import { notificationServices } from '~/services/notificationServices'

const getAll = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.jwtDecoded?.id
  const notifications = await notificationServices.getAll(userId)

  res.status(StatusCodes.OK).json(notifications)
})

const markAll = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.jwtDecoded?.id
  const notifications = await notificationServices.markAll(userId)
  res.status(StatusCodes.OK).json(notifications)
})

const markAsSeen = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params

  const notifications = await notificationServices.markAsSeen(id)
  res.status(StatusCodes.OK).json(notifications)
})
export const notificationController = { getAll, markAll, markAsSeen }
