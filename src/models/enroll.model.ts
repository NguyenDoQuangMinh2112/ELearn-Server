import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/configs/connectDB'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

export const ENROLL_COLLECTION_NAME = 'enrolls'

export const ENROLL_COLLECTION_SCHEMA = Joi.object({
  courseId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  userId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  payment_id: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

export const enrollModel = {
  ENROLL_COLLECTION_NAME,
  ENROLL_COLLECTION_SCHEMA
}
