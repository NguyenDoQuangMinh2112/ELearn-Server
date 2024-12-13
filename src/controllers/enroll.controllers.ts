import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { catchAsync } from '~/middlewares/catchAsyncErrors'
import { enrollServices } from '~/services/enrollServices'

import { paymentServices } from '~/services/paymentServices'

const createCheckoutSession = catchAsync(async (req: Request, res: Response) => {
  const checkoutSession = await paymentServices.createCheckoutSession(req.body)
  res.status(StatusCodes.CREATED).json(checkoutSession)
})

const isUserEnroll = catchAsync(async (req: Request, res: Response) => {
  const userId = req.jwtDecoded?.id
  const { courseId } = req.body
  const checkUserEnroll = await enrollServices.checkUserEnroll(String(userId), courseId)
  res.status(StatusCodes.CREATED).json(checkUserEnroll)
})

const userEnrollCourses = catchAsync(async (req: Request, res: Response) => {
  const userId = req.jwtDecoded?.id

  const listUserEnroll = await enrollServices.userEnrollCourses(String(userId))
  res.status(StatusCodes.CREATED).json(listUserEnroll)
})

export const enrollController = { createCheckoutSession, isUserEnroll, userEnrollCourses }
