// paymentProcessor.js

const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Simulate a payment process using Stripe test mode.
 * @param {Object} order - Order object with at least _id and totalAmount
 */
async function processPayment(order) {
  try {
    const charge = await stripe.charges.create({
      amount: Math.round(order.totalAmount * 100), // cents
      currency: 'usd',
      source: 'tok_visa', // test card token
      description: 'Simulated order payment',
      metadata: {
        orderId: order._id.toString(),
      },
    });

    return { success: true, charge };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

module.exports = { processPayment };
