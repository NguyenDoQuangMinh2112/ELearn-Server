import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/configs/connectDB'
import { catchAsyncErrors } from '~/middlewares/catchAsyncErrors'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const QUIZ_QUESTION_COLLECTION_NAME = 'quizQuestion'

const QUIZ_QUESTION_COLLECTION_SCHEMA = Joi.object({
  quizId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  question: Joi.string().required().trim().strict(),
  options: Joi.array().optional(),
  correct_answer: Joi.string().optional(),
  explain: Joi.string().optional(),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const validateBeforeCreate = async (data: any) => {
  return await QUIZ_QUESTION_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const findOneById = catchAsyncErrors(async (id: any) => {
  const result = await GET_DB()
    .collection(QUIZ_QUESTION_COLLECTION_NAME)
    .findOne({
      _id: new ObjectId(id)
    })
  return result
})

const createAnswerExercise = catchAsyncErrors(async (reqBody: any) => {
  const validateData = await validateBeforeCreate(reqBody)
  const existingQuestion = await GET_DB().collection(QUIZ_QUESTION_COLLECTION_NAME).findOne({
    question: validateData.question.trim()
  })

  if (existingQuestion) {
    throw new Error('This question already exists!')
  }
  const addNewAnswer = {
    ...validateData,
    quizId: new ObjectId(validateData.quizId)
  }
  const result = await GET_DB().collection(QUIZ_QUESTION_COLLECTION_NAME).insertOne(addNewAnswer)

  const insertedLesson = await GET_DB().collection(QUIZ_QUESTION_COLLECTION_NAME).findOne({ _id: result.insertedId })

  return insertedLesson
})
const getDetailAnswer = catchAsyncErrors(async (id: string) => {
  const result = await GET_DB()
    .collection(QUIZ_QUESTION_COLLECTION_NAME)
    .findOne({
      _id: new ObjectId(id)
    })
  return result
})
export const quizQuestionModle = {
  QUIZ_QUESTION_COLLECTION_NAME,
  QUIZ_QUESTION_COLLECTION_SCHEMA,
  createAnswerExercise,
  findOneById,
  getDetailAnswer
}
