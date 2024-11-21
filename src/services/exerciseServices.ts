import { StatusCodes } from 'http-status-codes'
import { quizzesModle } from '~/models/quizs/quizzes.model'
import ApiError from '~/utils/ApiError'

const getDetail = async (id: string) => {
  const exerciseDetail = await quizzesModle.getDetail(id)

  if (!exerciseDetail || Object.keys(exerciseDetail).length === 0) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Exercise not found')
  }

  return { statusCode: StatusCodes.OK, data: exerciseDetail }
}

export const exerciseServices = { getDetail }
