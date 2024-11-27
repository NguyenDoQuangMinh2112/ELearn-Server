import { paymentModel } from '~/models/payments'

const createCheckoutSession = async (reqBody: any) => {
  const checkoutSession = await paymentModel.createCheckoutSession(reqBody)

  return checkoutSession
}
export const paymentServices = {
  createCheckoutSession
}
