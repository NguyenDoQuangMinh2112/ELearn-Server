import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/configs/connectDB'
import { ChapterRequestBody } from '~/interfaces/chapter.interface'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const CHAPTER_COLLECTION_NAME = 'chapters'

const CHAPTER_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().min(3).max(50).trim().strict(),
  courseId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  order: Joi.number().required(),
  lessons: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const validateBeforeCreate = async (data: any) => {
  return await CHAPTER_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const findOneById = async (id: any) => {
  try {
    const result = await GET_DB()
      .collection(CHAPTER_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(id)
      })
    return result
  } catch (error: any) {
    throw new Error(error)
  }
}

const create = async (data: ChapterRequestBody) => {
  try {
    const validateData = (await validateBeforeCreate(data)) as ChapterRequestBody
    const addNewChapter = {
      ...validateData,
      courseId: new ObjectId(validateData.courseId)
    }
    const createdCourse = await GET_DB().collection(CHAPTER_COLLECTION_NAME).insertOne(addNewChapter)
    return createdCourse
  } catch (error: any) {
    throw new Error(error)
  }
}

const pushLessonIdToChapter = async (lesson: any) => {
  try {
    const result = await GET_DB()
      .collection(CHAPTER_COLLECTION_NAME)
      .findOneAndUpdate(
        { _id: new ObjectId(lesson.chapter_id) },
        { $push: { lessons: lesson._id } },
        { returnDocument: 'after' }
      )

    return result
  } catch (error: any) {
    throw new Error(error)
  }
}

const getAll = async () => {
  try {
    const result = await GET_DB().collection(CHAPTER_COLLECTION_NAME).find({}).toArray()
    return result
  } catch (error: any) {
    throw new Error(error)
  }
}

export const chapterModel = {
  CHAPTER_COLLECTION_NAME,
  CHAPTER_COLLECTION_SCHEMA,
  create,
  findOneById,
  pushLessonIdToChapter,
  getAll
}
