import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'
import { catchAsync } from '~/middlewares/catchAsyncErrors'
import { exerciseServices } from '~/services/exerciseServices'

const getDetail = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params
  const exerciseDetail = await exerciseServices.getDetail(String(id))

  res.status(StatusCodes.OK).json(exerciseDetail)
})

export const exerciseController = { getDetail }
