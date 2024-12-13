import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/configs/connectDB'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { chapterModel } from './chapter.model'
import { lessonModel } from './lesson.model'
import { catchAsyncErrors } from '~/middlewares/catchAsyncErrors'

const NOTE_COLLECTION_NAME = 'noteLessons'
const NOTE_COLLECTION_SCHEMA = Joi.object({
  course_id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).required(),
  chapter_id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).required(),
  user_id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).required(),
  lesson_id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE).required(),
  content: Joi.string().required().min(1).max(500).trim().strict(),
  time: Joi.string().required(),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null)
})

const validateBeforeCreate = async (data: any) => {
  return await NOTE_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}
const findOneById = catchAsyncErrors(async (id: any) => {
  const result = await GET_DB()
    .collection(NOTE_COLLECTION_NAME)
    .findOne({
      _id: new ObjectId(id)
    })
  return result
})
const addNoteLesson = catchAsyncErrors(async (reqBody: any, userId: string) => {
  const validateData = await validateBeforeCreate(reqBody)
  const addNewNoteLesson = {
    ...validateData,
    course_id: new ObjectId(validateData.course_id),
    chapter_id: new ObjectId(validateData.chapter_id),
    lesson_id: new ObjectId(validateData.lesson_id),
    user_id: new ObjectId(userId)
  }
  const createdNoteLesson = await GET_DB().collection(NOTE_COLLECTION_NAME).insertOne(addNewNoteLesson)
  return createdNoteLesson
})
const getNoteLessonByID = catchAsyncErrors(async (lessonID: string, userId: string) => {
  const noteLesson = await GET_DB()
    .collection(NOTE_COLLECTION_NAME)
    .aggregate([
      {
        $match: {
          lesson_id: new ObjectId(lessonID),
          user_id: new ObjectId(userId)
        }
      },
      {
        $lookup: {
          from: chapterModel.CHAPTER_COLLECTION_NAME,
          localField: 'chapter_id',
          foreignField: '_id',
          as: 'chapter_id',
          pipeline: [{ $project: { title: 1, order: 1 } }]
        }
      },
      {
        $lookup: {
          from: lessonModel.LESSON_COLLECTION_NAME,
          localField: 'lesson_id',
          foreignField: '_id',
          as: 'lesson_id',
          pipeline: [{ $project: { title: 1, order: 1 } }]
        }
      }
    ])
    .toArray()

  noteLesson.forEach((note: any) => {
    if (note.chapter_id && note.chapter_id.length > 0) {
      note.chapter_id = note.chapter_id[0]
    }
    if (note.lesson_id && note.lesson_id.length > 0) {
      note.lesson_id = note.lesson_id[0]
    }
  })

  return noteLesson
})
const updateNoteLesson = catchAsyncErrors(async (noteLessonId: string, reqBody: any) => {
  const result = await GET_DB()
    .collection(NOTE_COLLECTION_NAME)
    .findOneAndUpdate({ _id: new ObjectId(noteLessonId) }, { $set: reqBody }, { returnDocument: 'after' })
  if (!result) {
    throw new Error('Note lesson not found!')
  }
  return result
})

export const noteLessonModel = {
  NOTE_COLLECTION_NAME,
  NOTE_COLLECTION_SCHEMA,
  addNoteLesson,
  findOneById,
  getNoteLessonByID,
  updateNoteLesson
}
