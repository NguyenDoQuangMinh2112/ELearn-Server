import { StatusCodes } from 'http-status-codes'
import { notificationModel } from '~/models/blogs/notification.model'

const getAll = async (userId: any) => {
  const notification = await notificationModel.getAll(userId)
  return { statusCode: StatusCodes.OK, data: notification }
}
export const notificationServices = { getAll }
