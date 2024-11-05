import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/configs/connectDB'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
const NOTIFICATION_COLLECTION_NAME = 'notifications'
const NOTIFICATION_COLLECTION_SCHEMA = Joi.object({
  type: Joi.string().valid('like', 'comment', 'reply').required(),
  blog: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).required(),
  notification_for: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).required(),
  user: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).required(),
  comment: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).allow(null),
  reply: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).allow(null),
  replied_on_comment: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).allow(null),
  seen: Joi.boolean().default(false),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})
const validateBeforeCreate = async (data: any) => {
  return await NOTIFICATION_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const create = async (notificationData: any) => {
  try {
    const validateData = await validateBeforeCreate(notificationData)
    const addNewNotification = {
      ...validateData,
      user: new ObjectId(validateData.user),
      blog: new ObjectId(validateData.blog),
      notification_for: new ObjectId(validateData.notification_for),
      comment: new ObjectId(validateData.comment)
    }
    const createdNotification = await GET_DB().collection(NOTIFICATION_COLLECTION_NAME).insertOne(addNewNotification)

    return createdNotification
  } catch (error: any) {
    throw new Error(error)
  }
}

const checkNotificationExists = async (userId: string, type: string, blogId: string) => {
  try {
    const createdNotification = await GET_DB()
      .collection(NOTIFICATION_COLLECTION_NAME)
      .countDocuments({
        user: new ObjectId(userId),
        type: type,
        blog: new ObjectId(blogId)
      })

    return createdNotification
  } catch (error: any) {
    throw new Error(error)
  }
}

export const findOneAndDelete = async (userId: string, type: string, blogId: string) => {
  try {
    const result = await GET_DB()
      .collection(NOTIFICATION_COLLECTION_NAME)
      .findOneAndDelete({
        user: new ObjectId(userId),
        type: type,
        blog: new ObjectId(blogId)
      })
    return result
  } catch (error: any) {
    throw new Error(error)
  }
}

export const notificationModel = {
  NOTIFICATION_COLLECTION_NAME,
  NOTIFICATION_COLLECTION_SCHEMA,
  create,
  checkNotificationExists,
  findOneAndDelete
}
