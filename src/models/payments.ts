import Joi from 'joi'
import Stripe from 'stripe'
import { catchAsyncErrors } from '~/middlewares/catchAsyncErrors'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

import { GET_DB } from '~/configs/connectDB'
import { ObjectId } from 'mongodb'
import { ENROLL_COLLECTION_NAME } from './enroll.model'

const PAYMENT_COLLECTION_NAME = 'payments'

const PAYMENT_COLLECTION_SCHEMA = Joi.object({
  userId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  amount: Joi.number().greater(0).required(),
  payment_method: Joi.string().valid('stripe', 'paypal'),
  payment_status: Joi.string().valid('success', 'pending', 'failed').required(),
  transactionId: Joi.string().optional(),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string)

const createCheckoutSession = catchAsyncErrors(async (reqBody: any) => {
  const { course, userId } = reqBody

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'vnd',
          product_data: {
            name: course.title,
            description: course.description,
            images: [course.thumbnail]
          },
          unit_amount: course.price
        },
        quantity: 1
      }
    ],
    mode: 'payment',
    success_url: `${process.env.FE_URL}/enroll/${course._id}/success`,
    cancel_url: `${process.env.FE_URL}/enroll/${course._id}/cancel`
  })

  const payment = {
    userId: new ObjectId(userId),
    amount: course.price,
    payment_method: 'stripe',
    payment_status: 'success',
    transactionId: session.id,
    createdAt: Date.now(),
    updatedAt: null,
    _destroy: false
  }

  const addPayment = await GET_DB().collection(PAYMENT_COLLECTION_NAME).insertOne(payment)

  const enroll = {
    courseId: new ObjectId(course._id),
    userId: new ObjectId(userId),
    payment_id: addPayment.insertedId,
    createdAt: Date.now(),
    updatedAt: null,
    _destroy: false
  }

  await GET_DB().collection(ENROLL_COLLECTION_NAME).insertOne(enroll)

  return { id: session.id }
})

export const paymentModel = {
  PAYMENT_COLLECTION_NAME,
  PAYMENT_COLLECTION_SCHEMA,
  createCheckoutSession
}
