const paypal = require('@paypal/checkout-server-sdk')

// PayPal sandbox environment setup
const environment = new paypal.core.SandboxEnvironment(process.env.PAYPAL_CLIENT_ID, process.env.PAYPAL_CLIENT_SECRET)

const client = new paypal.core.PayPalHttpClient(environment)

module.exports = { client }
