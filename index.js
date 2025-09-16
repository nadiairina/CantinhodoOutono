const functions = require("firebase-functions");
const stripe = require("stripe")(functions.config().stripe.secret);

// Função para criar uma intenção de pagamento no Stripe
exports.createPaymentIntent = functions.https.onCall(async (data, context) => {
    try {
        // CORREÇÃO: Espaços removidos aqui, por exemplo: const { items } = data;
        // As variáveis 'onRequest' e 'logger' já foram removidas
        const {items} = data;

        if (!items || items.length === 0) {
            throw new functions.https.HttpsError('invalid-argument', 'O carrinho está vazio.');
        }

        // Calcular o valor total com base nos itens e no envio
        const SHIPPING_COST = 5.00;
        const totalAmount = items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);

        const finalAmount = totalAmount + SHIPPING_COST;

        // CORREÇÃO: A chave usada para o Stripe é a 'secret', não a 'key'
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(finalAmount * 100),
            currency: "eur",
        });

        // Retornar a chave secreta de cliente para o frontend
        return {
            clientSecret: paymentIntent.client_secret,
        };
    } catch (error) {
        console.error("Erro ao criar o Payment Intent:", error);
        throw new functions.https.HttpsError('unknown', 'Não foi possível criar o Payment Intent.', error.message);
    }
});
