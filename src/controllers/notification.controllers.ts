import { NextFunction, Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { notificationServices } from '~/services/notificationServices'

const getAll = async (req: Request, res: Response, next: NextFunction) => {
  const notifications = await notificationServices.getAll()

  res.status(StatusCodes.OK).json(notifications)
}
export const notificationController = { getAll }
