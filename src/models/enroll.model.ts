import Joi from 'joi'
import { ObjectId } from 'mongodb'
import { GET_DB } from '~/configs/connectDB'
import { catchAsyncErrors } from '~/middlewares/catchAsyncErrors'
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

const checkUserEnroll = catchAsyncErrors(async (userId: string, courseId: string) => {
  const enroll = await GET_DB()
    .collection(ENROLL_COLLECTION_NAME)
    .findOne({
      userId: new ObjectId(userId),
      courseId: new ObjectId(courseId),
      _destroy: false
    })

  return enroll !== null
})

const userEnrollCourses = catchAsyncErrors(async (userId: string) => {
  const result = await GET_DB()
    .collection(ENROLL_COLLECTION_NAME)
    .aggregate([
      {
        $match: {
          userId: new ObjectId(userId),
          _destroy: false
        }
      },
      {
        $lookup: {
          from: 'courses',
          localField: 'courseId',
          foreignField: '_id',
          as: 'courseId'
        }
      }
    ])
    .toArray()

  return result
})

export const enrollModel = {
  ENROLL_COLLECTION_NAME,
  ENROLL_COLLECTION_SCHEMA,
  checkUserEnroll,
  userEnrollCourses
}
