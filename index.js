const functions = require("firebase-functions");
const stripe = require("stripe")(functions.config().stripe.secret);

exports.createPaymentIntent = functions.https.onRequest(async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send("Method Not Allowed");
  }

  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).send("Bad Request: 'items' array is required.");
  }

  try {
    const totalAmount = items.reduce((total, item) => total + (item.price * item.quantity), 0);
    const amountInCents = Math.round(totalAmount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: 'eur',
      metadata: { integration_check: 'accept_a_payment' },
    });

    res.status(200).json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Error creating Payment Intent:", error);
    res.status(500).json({ error: error.message });
  }
});
