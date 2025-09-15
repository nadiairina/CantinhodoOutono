const functions = require("firebase-functions");
const stripe = require("stripe")(functions.config().stripe.secret);

exports.createPaymentIntent = functions.https.onCall(async (data, context) => {
    console.log("Recebendo pedido para criar PaymentIntent");

    const { items } = data;

    if (!items || !Array.isArray(items) || items.length === 0) {
        throw new functions.https.HttpsError(
            'invalid-argument',
            "'items' array is required."
        );
    }

    try {
        const totalAmount = items.reduce((total, item) => total + (item.price * item.quantity), 0);
        const amountInCents = Math.round(totalAmount * 100);

        const paymentIntent = await stripe.paymentIntents.create({
            amount: amountInCents,
            currency: 'eur',
            metadata: { integration_check: 'accept_a_payment' },
        });

        return { clientSecret: paymentIntent.client_secret };
    } catch (error) {
        console.error("Error creating Payment Intent:", error);
        throw new functions.https.HttpsError(
            'internal',
            error.message
        );
    }
});

exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
    const sig = req.headers['stripe-signature'];

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, functions.config().stripe.webhook_secret);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
        case 'payment_intent.succeeded':
            const paymentIntent = event.data.object;
            console.log(`Pagamento bem-sucedido: ${paymentIntent.id}`);
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
});
