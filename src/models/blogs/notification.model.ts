import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/configs/connectDB'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { userModel } from '../user.model'
import { blogModel } from './blog.model'
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

const findOneById = async (id: any) => {
  try {
    const result = await GET_DB()
      .collection(NOTIFICATION_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(id)
      })
    return result
  } catch (error: any) {
    throw new Error(error)
  }
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

const getAll = async (userId: string) => {
  try {
    const result = await GET_DB()
      .collection(NOTIFICATION_COLLECTION_NAME)
      .aggregate([
        { $match: { notification_for: new ObjectId(userId) } },
        {
          $lookup: {
            from: blogModel.BLOG_COLLECTION_NAME,
            localField: 'blog',
            foreignField: '_id',
            as: 'blog'
          }
        },
        { $unwind: '$blog' },
        {
          $project: {
            'blog._id': 1,
            'blog.title': 1,
            type: 1,
            user: 1,
            notification_for: 1,
            comment: 1,
            seen: 1,
            createdAt: 1,
            updatedAt: 1,
            _destroy: 1
          }
        },
        {
          $lookup: {
            from: userModel.USER_COLLECTION_NAME,
            localField: 'user',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $project: {
            'user._id': 1,
            'user.avatar_url': 1,
            'user.fullName': 1,
            type: 1,
            blog: 1,
            notification_for: 1,
            comment: 1,
            seen: 1,
            createdAt: 1,
            updatedAt: 1,
            _destroy: 1
          }
        },
        {
          $lookup: {
            from: userModel.USER_COLLECTION_NAME,
            localField: 'notification_for',
            foreignField: '_id',
            as: 'notification_for'
          }
        },
        { $unwind: '$notification_for' },
        {
          $project: {
            'notification_for._id': 1,
            'notification_for.avatar_url': 1,
            'notification_for.fullName': 1,
            type: 1,
            blog: 1,
            user: 1,
            comment: 1,
            seen: 1,
            createdAt: 1,
            updatedAt: 1,
            _destroy: 1
          }
        },
        { $sort: { createdAt: -1 } }
      ])
      .toArray()

    return result
  } catch (error: any) {
    throw new Error(error)
  }
}

const getDetail = async (notificationId: string) => {
  const result = await GET_DB()
    .collection(NOTIFICATION_COLLECTION_NAME)
    .aggregate([
      { $match: { _id: new ObjectId(notificationId) } },
      {
        $lookup: {
          from: blogModel.BLOG_COLLECTION_NAME,
          localField: 'blog',
          foreignField: '_id',
          as: 'blog'
        }
      },
      { $unwind: '$blog' },
      {
        $project: {
          'blog._id': 1,
          'blog.title': 1,
          type: 1,
          user: 1,
          notification_for: 1,
          comment: 1,
          seen: 1,
          createdAt: 1,
          updatedAt: 1,
          _destroy: 1
        }
      },
      {
        $lookup: {
          from: userModel.USER_COLLECTION_NAME,
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          'user._id': 1,
          'user.avatar_url': 1,
          'user.fullName': 1,
          type: 1,
          blog: 1,
          notification_for: 1,
          comment: 1,
          seen: 1,
          createdAt: 1,
          updatedAt: 1,
          _destroy: 1
        }
      },
      {
        $lookup: {
          from: userModel.USER_COLLECTION_NAME,
          localField: 'notification_for',
          foreignField: '_id',
          as: 'notification_for'
        }
      },
      { $unwind: '$notification_for' },
      {
        $project: {
          'notification_for._id': 1,
          'notification_for.avatar_url': 1,
          'notification_for.fullName': 1,
          type: 1,
          blog: 1,
          user: 1,
          comment: 1,
          seen: 1,
          createdAt: 1,
          updatedAt: 1,
          _destroy: 1
        }
      }
    ])
    .toArray()

  return result[0] || {}
}

export const notificationModel = {
  NOTIFICATION_COLLECTION_NAME,
  NOTIFICATION_COLLECTION_SCHEMA,
  create,
  findOneById,
  checkNotificationExists,
  findOneAndDelete,
  getAll,
  getDetail
}
