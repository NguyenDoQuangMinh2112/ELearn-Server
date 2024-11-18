import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { catchAsync } from '~/middlewares/catchAsyncErrors'
import { notificationServices } from '~/services/notificationServices'

const getAll = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.jwtDecoded?.id
  const notifications = await notificationServices.getAll(userId)

  res.status(StatusCodes.OK).json(notifications)
})
export const notificationController = { getAll }
