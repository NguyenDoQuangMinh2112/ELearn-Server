import Joi from 'joi'
import { OBJECT_ID_RULE, OBJECT_ID_RULE_MESSAGE } from '~/utils/validators'

const PAYMENT_COLLECTION_NAME = 'payments'

const PAYMENT_COLLECTION_SCHEMA = Joi.object({
  userId: Joi.string().required().pattern(OBJECT_ID_RULE).message(OBJECT_ID_RULE_MESSAGE),
  amount: Joi.number().greater(0).required(),
  payment_method: Joi.string().valid('stripe', 'paypal'),
  payment_status: Joi.string().valid('success', 'pending', 'failed').required(),
  createdAt: Joi.date().timestamp('javascript').default(Date.now),
  updatedAt: Joi.date().timestamp('javascript').default(null),
  _destroy: Joi.boolean().default(false)
})

export const paymentModel = {
  PAYMENT_COLLECTION_NAME,
  PAYMENT_COLLECTION_SCHEMA
}
