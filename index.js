const functions = require("firebase-functions");
const stripe = require("stripe")(functions.config().stripe.secret);

// Função para criar uma intenção de pagamento no Stripe
exports.createPaymentIntent = functions.https.onCall(async (data, context) => {
  try {
    const items = data.items;

    if (!items || items.length === 0) {
      throw new functions.https.HttpsError('invalid-argument', 'O carrinho está vazio.');
    }

    // Calcular o valor total com base nos itens e no envio
    const SHIPPING_COST = 2.50; // Custo de envio fixo em Euros
    const totalAmount = items.reduce((total, item) => {
      // Usar a lógica do lado do servidor para calcular o preço
      // Nota: Em um ambiente real, você buscaria o preço do produto em um banco de dados
      // para evitar que o cliente manipule o valor.
      return total + (item.price * item.quantity);
    }, 0);

    const finalAmount = totalAmount + SHIPPING_COST;

    // Criar a intenção de pagamento com o Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(finalAmount * 100), // O Stripe espera o valor em cêntimos
      currency: "eur", // Euro
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
