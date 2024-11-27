import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { catchAsync } from '~/middlewares/catchAsyncErrors'

import { paymentServices } from '~/services/paymentServices'

const createCheckoutSession = catchAsync(async (req: Request, res: Response) => {
  const checkoutSession = await paymentServices.createCheckoutSession(req.body)
  res.status(StatusCodes.CREATED).json(checkoutSession)
})
export const enrollController = { createCheckoutSession }
