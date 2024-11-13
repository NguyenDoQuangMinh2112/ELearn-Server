import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/configs/connectDB'
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

const findOneById = async (id: any) => {
  try {
    const result = await GET_DB()
      .collection(QUIZ_QUESTION_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(id)
      })
    return result
  } catch (error: any) {
    throw new Error(error)
  }
}

const createAnswerExercise = async (reqBody: any) => {
  try {
    const validateData = await validateBeforeCreate(reqBody)
    const existingQuestion = await GET_DB().collection(QUIZ_QUESTION_COLLECTION_NAME).findOne({
      question: validateData.question.trim()
    })

    if (existingQuestion) {
      throw new Error('Câu hỏi này đã tồn tại.')
    }
    const addNewAnswer = {
      ...validateData,
      quizId: new ObjectId(validateData.quizId)
    }
    const result = await GET_DB().collection(QUIZ_QUESTION_COLLECTION_NAME).insertOne(addNewAnswer)

    const insertedLesson = await GET_DB().collection(QUIZ_QUESTION_COLLECTION_NAME).findOne({ _id: result.insertedId })

    return insertedLesson
  } catch (error: any) {
    throw new Error(error)
  }
}

export const quizQuestionModle = {
  QUIZ_QUESTION_COLLECTION_NAME,
  QUIZ_QUESTION_COLLECTION_SCHEMA,
  createAnswerExercise,
  findOneById
}
