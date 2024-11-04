import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/configs/connectDB'
import { blogInterface } from '~/interfaces/blog.interface'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { userModel } from '../user.model'
import { commentModel } from './comment.model'

const BLOG_COLLECTION_NAME = 'blogs'

const BLOG_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(300).trim().strict(),
  slug: Joi.string().min(3).trim().strict(),
  banner: Joi.string().required(),
  des: Joi.string().max(200).required(),
  content: Joi.array().required(),
  views: Joi.number().default(0),
  tags: Joi.array().items(Joi.string()).optional(),
  author: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  activity: Joi.object({
    total_likes: Joi.number().default(0),
    total_comments: Joi.number().default(0),
    total_reads: Joi.number().default(0),
    total_parent_comments: Joi.number().default(0)
  }).default(),
  comments: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).optional(),
  draft: Joi.boolean().default(false),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})
const validateBeforeCreate = async (data: any) => {
  return await BLOG_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const findOneById = async (id: any) => {
  try {
    const result = await GET_DB()
      .collection(BLOG_COLLECTION_SCHEMA)
      .findOne({
        _id: new ObjectId(id)
      })
    return result
  } catch (error: any) {
    throw new Error(error)
  }
}
const findOneAndUpdate = async (id: any, updateData: any) => {
  try {
    const result = await GET_DB()
      .collection(BLOG_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(id) }, // Điều kiện tìm kiếm
        {
          $push: { comments: updateData.commentId }, // Thêm comment mới vào mảng comments
          $inc: {
            'activity.total_comments': 1, // Tăng số lượng comment
            'activity.total_parent_comments': 1 // Tăng số lượng comment cha
          }
        },
        { returnDocument: 'after' } // Trả về tài liệu đã cập nhật
      )
    return result.value // Trả về tài liệu đã được cập nhật
  } catch (error: any) {
    throw new Error(error)
  }
}
const create = async (reqBody: blogInterface) => {
  try {
    const validateData = await validateBeforeCreate(reqBody)
    const tags = Array.isArray(reqBody.tags) ? reqBody.tags : [reqBody.tags]
    const addNewBlog = {
      ...validateData,
      tags,
      author: new ObjectId(reqBody.author)
    }

    // Thêm blog vào collection
    const createdBlog = await GET_DB().collection(BLOG_COLLECTION_NAME).insertOne(addNewBlog)

    // Lấy chi tiết blog vừa tạo
    const result = await GET_DB().collection(BLOG_COLLECTION_NAME).findOne({
      _id: createdBlog.insertedId
    })

    if (!result) {
      return { message: 'Something went wrong!', data: null }
    }

    return result // Trả về blog vừa tạo
  } catch (error: any) {
    throw new Error(error)
  }
}

const getAll = async () => {
  try {
    const result = await GET_DB()
      .collection(BLOG_COLLECTION_NAME)
      .aggregate([
        {
          $lookup: {
            from: userModel.USER_COLLECTION_NAME,
            localField: 'author',
            foreignField: '_id',
            as: 'author'
          }
        },
        {
          $unwind: '$author'
        },
        {
          $project: {
            _id: 1,
            title: 1,
            slug: 1,
            banner: 1,
            des: 1,
            content: 1,
            tags: 1,
            activity: 1,
            comments: 1,
            draft: 1,
            views: 1,
            createdAt: 1,
            updatedAt: 1,
            _destroy: 1,
            'author.fullName': 1,
            'author.avatar_url': 1,
            'author.role': 1
          }
        }
      ])
      .toArray()

    return result
  } catch (error: any) {
    throw new Error(error)
  }
}

const getDetails = async (id: any) => {
  try {
    const result = await GET_DB()
      .collection(BLOG_COLLECTION_NAME)
      .aggregate([
        {
          $match: {
            _id: new ObjectId(id),
            _destroy: false
          }
        },
        {
          $lookup: {
            from: userModel.USER_COLLECTION_NAME,
            localField: 'author',
            foreignField: '_id',
            as: 'author'
          }
        },
        {
          $lookup: {
            from: commentModel.COMMENT_COLLECTION_NAME,
            localField: 'comments',
            foreignField: '_id',
            as: 'comments'
          }
        },
        {
          $lookup: {
            from: userModel.USER_COLLECTION_NAME,
            localField: 'blog_author',
            foreignField: '_id',
            as: 'blog_author'
          }
        },
        {
          $unwind: '$author'
        },
        {
          $project: {
            _id: 1,
            title: 1,
            slug: 1,
            banner: 1,
            des: 1,
            content: 1,
            tags: 1,
            activity: 1,
            comments: 1,
            draft: 1,
            createdAt: 1,
            updatedAt: 1,
            _destroy: 1,
            'author.fullName': 1,
            'author.avatar_url': 1,
            'author.role': 1
          }
        }
      ])
      .toArray()
    if (result.length > 0) {
      // Cập nhật lượt xem
      await GET_DB()
        .collection(BLOG_COLLECTION_NAME)
        .updateOne({ _id: new ObjectId(id) }, { $inc: { views: 1 } })
    }
    return result[0] || {}
  } catch (error: any) {
    throw new Error(error)
  }
}

export const blogModel = {
  BLOG_COLLECTION_NAME,
  BLOG_COLLECTION_SCHEMA,
  create,
  findOneById,
  getAll,
  getDetails,
  findOneAndUpdate
}
