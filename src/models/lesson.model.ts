import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/configs/connectDB'
import { LessonRequestBody } from '~/interfaces/lesson.interface'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { chapterModel } from './chapter.model'
import { courseModel } from './course.model'
import { catchAsyncErrors } from '~/middlewares/catchAsyncErrors'
import { noteLessonModel } from './noteLesson.model'

const LESSON_COLLECTION_NAME = 'lessons'

const LESSON_COLLECTION_SCHEMA = Joi.object({
  courseId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  title: Joi.string().required().min(3).max(50).trim().strict(),
  chapter_id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  order: Joi.number().required(),
  videoUrl: Joi.string().required(),
  duration: Joi.number(),
  description: Joi.string(),
  noteVideo: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const validateBeforeCreate = async (data: any) => {
  return await LESSON_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const findOneById = catchAsyncErrors(async (id: any) => {
  const result = await GET_DB()
    .collection(LESSON_COLLECTION_NAME)
    .findOne({
      _id: new ObjectId(id)
    })
  return result
})

const create = catchAsyncErrors(async (data: any) => {
  const validateData = await validateBeforeCreate(data)
  const addNewLesson = {
    ...validateData,
    courseId: new ObjectId(validateData.courseId),
    chapter_id: new ObjectId(validateData.chapter_id)
  }

  const result = await GET_DB().collection(LESSON_COLLECTION_NAME).insertOne(addNewLesson)

  const insertedLesson = await GET_DB().collection(LESSON_COLLECTION_NAME).findOne({ _id: result.insertedId })

  return insertedLesson
})
const getDetails = catchAsyncErrors(async (id: any) => {
  const result = await GET_DB()
    .collection(LESSON_COLLECTION_NAME)
    .aggregate([
      {
        $match: {
          _id: new ObjectId(id),
          _destroy: false
        }
      },
      {
        $lookup: {
          from: noteLessonModel.NOTE_COLLECTION_NAME,
          localField: '_id',
          foreignField: 'lesson_id',
          as: 'noteVideo'
        }
      }
    ])
    .toArray()

  return result[0] || {}
})

const update = catchAsyncErrors(async (id: any, data: any) => {
  const result = await GET_DB()
    .collection(LESSON_COLLECTION_NAME)
    .findOneAndUpdate({ _id: new ObjectId(id) }, { $set: data }, { returnDocument: 'after' })
  return result
})
const pushNoteLessonIds = catchAsyncErrors(async (noteLesson: any) => {
  const result = await GET_DB()
    .collection(LESSON_COLLECTION_NAME)
    .findOneAndUpdate(
      { _id: new ObjectId(noteLesson.lesson_id) },
      { $push: { noteVideo: new ObjectId(noteLesson._id) } },
      { returnDocument: 'after' }
    )

  return result
})

export const lessonModel = {
  LESSON_COLLECTION_NAME,
  LESSON_COLLECTION_SCHEMA,
  create,
  findOneById,
  getDetails,
  update,
  pushNoteLessonIds
}
