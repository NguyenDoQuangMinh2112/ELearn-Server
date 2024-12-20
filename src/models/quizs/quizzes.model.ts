import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/configs/connectDB'
import { catchAsyncErrors } from '~/middlewares/catchAsyncErrors'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'
import { quizQuestionModle } from './quiz_questions.model'

const QUIZZES_COLLECTION_NAME = 'quizzes'

const QUIZZES_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().trim().strict(),
  description: Joi.string().required().trim().strict(),
  chapterId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  order: Joi.number().optional(),
  questions: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const validateBeforeCreate = async (data: any) => {
  return await QUIZZES_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const findOneById = catchAsyncErrors(async (id: any) => {
  const result = await GET_DB()
    .collection(QUIZZES_COLLECTION_NAME)
    .findOne({
      _id: new ObjectId(id)
    })
  return result
})

const createQuestionExercise = catchAsyncErrors(async (reqBody: any) => {
  const validateData = await validateBeforeCreate(reqBody)
  const addNewQuestion = {
    ...validateData,
    chapterId: new ObjectId(validateData.chapterId)
  }
  const result = await GET_DB().collection(QUIZZES_COLLECTION_NAME).insertOne(addNewQuestion)

  const insertedLesson = await GET_DB().collection(QUIZZES_COLLECTION_NAME).findOne({ _id: result.insertedId })

  return insertedLesson
})

const pushQuestionIds = catchAsyncErrors(async (answerExercise: any) => {
  const result = await GET_DB()
    .collection(QUIZZES_COLLECTION_NAME)
    .findOneAndUpdate(
      { _id: new ObjectId(answerExercise.quizId) },
      { $push: { questions: new ObjectId(answerExercise._id) } },
      { returnDocument: 'after' }
    )

  return result
})

const getDetail = catchAsyncErrors(async (id: string) => {
  const result = await GET_DB()
    .collection(QUIZZES_COLLECTION_NAME)
    .aggregate([
      { $match: { _id: new ObjectId(id) } },
      {
        $lookup: {
          from: quizQuestionModle.QUIZ_QUESTION_COLLECTION_NAME,
          localField: '_id',
          foreignField: 'quizId',
          as: 'questions'
        }
      }
    ])
    .toArray()

  return result[0] || {}
})

const getDetailAnswer = catchAsyncErrors(async (quizId: string) => {
  const quiz = await GET_DB()
    .collection(QUIZZES_COLLECTION_NAME)
    .findOne({
      _id: new ObjectId(quizId)
    })

  const questions = await GET_DB()
    .collection('quizQuestion')
    .find({
      _id: { $in: quiz.questions.map((questionId: any) => new ObjectId(questionId)) }
    })
    .toArray()
  return questions
})

export const quizzesModle = {
  QUIZZES_COLLECTION_NAME,
  QUIZZES_COLLECTION_SCHEMA,
  createQuestionExercise,
  findOneById,
  pushQuestionIds,
  getDetail,
  getDetailAnswer
}
