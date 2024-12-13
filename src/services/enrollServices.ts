import { StatusCodes } from 'http-status-codes'
import { enrollModel } from '~/models/enroll.model'
import { paymentModel } from '~/models/payments'

const checkUserEnroll = async (userId: string, courseId: string) => {
  const isUserEnroll = await enrollModel.checkUserEnroll(userId, courseId)

  return isUserEnroll
}

const userEnrollCourses = async (userId: string) => {
  const listUsers = await enrollModel.userEnrollCourses(userId)

  return { statusCode: StatusCodes.OK, data: listUsers }
}
export const enrollServices = {
  checkUserEnroll,
  userEnrollCourses
}
