import { StatusCodes } from 'http-status-codes'
import { notificationModel } from '~/models/blogs/notification.model'

const getAll = async (userId: any) => {
  const notification = await notificationModel.getAll(userId)
  return { statusCode: StatusCodes.OK, data: notification }
}

const markAll = async (userId: any) => {
  await notificationModel.markAll(userId)
  return { statusCode: StatusCodes.OK, message: 'All notifications marked as read' }
}

const markAsSeen = async (id: string) => {
  const notification = await notificationModel.markAsSeen(id)
  return { statusCode: StatusCodes.OK, message: 'Notification marked as seen' }
}
export const notificationServices = { getAll, markAll, markAsSeen }
