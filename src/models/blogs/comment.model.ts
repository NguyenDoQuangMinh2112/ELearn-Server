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

export const commentModel = {
  COMMENT_COLLECTION_NAME,
  COMMENT_COLLECTION_SCHEMA,
  addComment,
  findOneById
}
