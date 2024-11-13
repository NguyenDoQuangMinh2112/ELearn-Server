import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const QUIZ_QUESTION_COLLECTION_NAME = 'quizQuestion'

const QUIZ_QUESTION_COLLECTION_SCHEMA = Joi.object({
  quiz: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  question: Joi.string().required().trim().strict(),
  options: Joi.array().optional(),
  correct_answer: Joi.string().optional(),
  question_type: Joi.string()
    .optional()
    .valid('multiple_choice', 'true_false', 'short_answer', 'essay')
    .default('essay'),
  topic: Joi.string().optional().trim().strict(),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

export const quizQuestionModle = {
  QUIZ_QUESTION_COLLECTION_NAME,
  QUIZ_QUESTION_COLLECTION_SCHEMA
}
