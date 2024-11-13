import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const QUIZZES_COLLECTION_NAME = 'quizzes'

const QUIZZES_COLLECTION_SCHEMA = Joi.object({
  title: Joi.string().required().trim().strict(),
  description: Joi.string().required().trim().strict(),
  chapter: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  questions: Joi.array().items(Joi.string().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE)).default([]),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

export const quizzesModle = {
  QUIZZES_COLLECTION_NAME,
  QUIZZES_COLLECTION_SCHEMA
}
