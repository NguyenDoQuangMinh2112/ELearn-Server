import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/configs/connectDB'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const QUIZZES_COLLECTION_NAME = 'quizzes'

const QUIZZES_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().trim().strict(),
  description: Joi.string().required().trim().strict(),
  chapterId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  questions: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const validateBeforeCreate = async (data: any) => {
  return await QUIZZES_COLLECTION_SCHEMA.validateAsync(data, { abortEarly: false })
}

const findOneById = async (id: any) => {
  try {
    const result = await GET_DB()
      .collection(QUIZZES_COLLECTION_NAME)
      .findOne({
        _id: new ObjectId(id)
      })
    return result
  } catch (error: any) {
    throw new Error(error)
  }
}

const createQuestionExercise = async (reqBody:any)=>{
  try {
    const validateData = await validateBeforeCreate(reqBody)
    const addNewQuestion = {
      ...validateData,
      chapterId: new ObjectId(validateData.chapter_id)
    }
    const result = await GET_DB().collection(QUIZZES_COLLECTION_NAME).insertOne(addNewQuestion)

    const insertedLesson = await GET_DB().collection(QUIZZES_COLLECTION_NAME).findOne({ _id: result.insertedId })

    return insertedLesson 
  } catch (error:any) {
    throw new Error(error)
  }
}


const pushQuestionIds = async (answerExercise:any)=>{
  try {
    const result = await GET_DB()
    .collection(QUIZZES_COLLECTION_NAME)
    .findOneAndUpdate(
      { _id: new ObjectId(answerExercise.quizId) },
      { $push: { questions: new ObjectId(answerExercise._id) } }, 
      { returnDocument: 'after' } 
    )

  return result
  } catch (error:any) {
    throw new Error(error)
  }
}


export const quizzesModle = {
  QUIZZES_COLLECTION_NAME,
  QUIZZES_COLLECTION_SCHEMA,
  createQuestionExercise,
  findOneById,
  pushQuestionIds
}
