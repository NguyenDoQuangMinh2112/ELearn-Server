import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/configs/connectDB'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const COMMENT_COLLECTION_NAME = 'comments'
const COMMENT_COLLECTION_SCHEMA = Joi.object({
  blog_id: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).required(),
  blog_author: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).required(),
  comment: Joi.string().required(),
  children: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),
  commented_by: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).required(),
  isReply: Joi.boolean().default(false),
  parent: Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).allow(null),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const validateBeforeCreate = async (data: any) => {
  return await COMMENT_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}
const findOneById = async (id: any) => {
  try {
    const result = await GET_DB()
      .collection(COMMENT_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(id)
      })
    return result
  } catch (error: any) {
    throw new Error(error)
  }
}

const addComment = async (reqBody: any) => {
  const validateData = await validateBeforeCreate(reqBody)

  const addNewComment = {
    ...validateData,
    blog_id: new ObjectId(validateData.blog_id),
    blog_author: new ObjectId(validateData.blog_author),
    commented_by: new ObjectId(validateData.commented_by)
  }

  const createdComment = await GET_DB().collection(COMMENT_COLLECTION_NAME).insertOne(addNewComment)
  return createdComment
}
const addReply = async (parentId: string, replyId: string) => {
  try {
    // Cập nhật comment cha bằng cách thêm ID của reply vào mảng `children`
    const result = await GET_DB()
      .collection(COMMENT_COLLECTION_NAME)
      .updateOne({ _id: new ObjectId(parentId) }, { $push: { children: new ObjectId(replyId) } })
    return result
  } catch (error: any) {
    throw new Error(error)
  }
}
const getCommentsByBlogId = async (blogId: any) => {
  try {
    const comments = await GET_DB()
      .collection(COMMENT_COLLECTION_NAME)
      .aggregate([
        { $match: { blog_id: new ObjectId(blogId), isReply: false, _destroy: false } },
        {
          $lookup: {
            from: COMMENT_COLLECTION_NAME,
            localField: '_id',
            foreignField: 'parent',
            as: 'replies'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'commented_by',
            foreignField: '_id',
            as: 'commented_by',
            pipeline: [
              { $project: { avatar_url: 1, fullName: 1 } } // Chỉ lấy avatar_url và fullName
            ]
          }
        },
        { $sort: { createdAt: -1 } }
      ])
      .toArray()
    comments.forEach((comment: any) => {
      // Cập nhật phần replies trong comment cha
      if (comment.children && comment.children.length > 0) {
        comment.replies = comment.children.map((childId: any) => {
          return comments.find((c: any) => c._id.toString() === childId.toString())
        })
      }
      if (comment.commented_by && comment.commented_by.length > 0) {
        comment.commented_by = comment.commented_by[0] // Chỉ cần lấy một phần tử duy nhất, vì 'commented_by' là duy nhất
      }
    })
    return comments
  } catch (error: any) {
    throw new Error(error)
  }
}
export const commentModel = {
  COMMENT_COLLECTION_NAME,
  COMMENT_COLLECTION_SCHEMA,
  addComment,
  findOneById,
  addReply,
  getCommentsByBlogId
}
