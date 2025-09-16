// O seu projeto Firebase - Credenciais copiadas da sua consola
const firebaseConfig = {
    apiKey: "AIzaSyC21TjWfC_mFjC_vF_v2vF_v2vF_v2vF_v2vF_v2vF_v2vF", 
    authDomain: "cantinho-outono-ecommerce.firebaseapp.com",
    projectId: "cantinho-outono-ecommerce",
    storageBucket: "cantinho-outono-ecommerce.appspot.com",
    messagingSenderId: "333333333333",
    appId: "1:333333333333:web:your-app-id-here",
};

// Inicialize o Firebase
firebase.initializeApp(firebaseConfig);

// Inicialize as Cloud Functions e o Stripe
const functions = firebase.functions();
const stripe = Stripe("pk_test_51S2uHiQeDrS4eWd37UExS3JrVEGEiKKf0D56ahzsTK0ro1VMCm5SuQl8bxpWTaZK2HkExrF5bcV68ERQjXIpYjot00zQnDtAtQ");

const SHIPPING_COST = 5.00;

// Funções de Gestão do Carrinho (usando localStorage)
function getCart() {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderCart();
    updateTotals();
}

function updateCartCount() {
    const cart = getCart();
    const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartItemCountElement = document.getElementById('cart-item-count');
    if (cartItemCountElement) {
        cartItemCountElement.textContent = itemCount;
    }
}

function updateQuantity(productId, change) {
    const cart = getCart();
    const product = cart.find(item => item.id === productId);
    if (product) {
        product.quantity += change;
        if (product.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart(cart);
        }
    }
}

function removeFromCart(productId) {
    const cart = getCart();
    const updatedCart = cart.filter(item => item.id !== productId);
    saveCart(updatedCart);
}

function renderCart() {
    const cart = getCart();
    const cartItemsContainer = document.getElementById('cart-items');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const checkoutButton = document.getElementById('checkout-button');

    cartItemsContainer.innerHTML = '';

    if (cart.length === 0) {
        emptyCartMessage.classList.remove('hidden');
        document.getElementById('checkout-content').classList.add('hidden');
        return;
    } else {
        emptyCartMessage.classList.add('hidden');
        document.getElementById('checkout-content').classList.remove('hidden');
    }

    cart.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.classList.add('flex', 'items-center', 'justify-between', 'border-b', 'border-gray-200', 'py-4');
        itemElement.innerHTML = `
            <div class="flex items-center">
                <img src="${item.image}" alt="${item.name}" class="w-20 h-20 object-cover rounded-lg mr-4">
                <div>
                    <h3 class="font-semibold text-lg">${item.name}</h3>
                    <p class="text-sm text-gray-600">Preço: €${item.price.toFixed(2)}</p>
                    <div class="flex items-center mt-2">
                        <button class="quantity-btn decrease-btn bg-gray-200 text-gray-700 rounded-full w-6 h-6 flex items-center justify-center" data-id="${item.id}">-</button>
                        <span class="mx-3">${item.quantity}</span>
                        <button class="quantity-btn increase-btn bg-gray-200 text-gray-700 rounded-full w-6 h-6 flex items-center justify-center" data-id="${item.id}">+</button>
                    </div>
                </div>
            </div>
            <div class="flex items-center space-x-4">
                <span class="font-bold text-[#8B4513] text-lg">€${(item.price * item.quantity).toFixed(2)}</span>
                <button class="remove-from-cart-btn text-red-500 hover:text-red-700" data-id="${item.id}">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>
        `;
        cartItemsContainer.appendChild(itemElement);
    });

    document.querySelectorAll('.increase-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            updateQuantity(id, 1);
        });
    });

    document.querySelectorAll('.decrease-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            updateQuantity(id, -1);
        });
    });

    document.querySelectorAll('.remove-from-cart-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const id = e.target.closest('button').dataset.id;
            removeFromCart(id);
        });
    });
}

function updateTotals() {
    const cart = getCart();
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const total = subtotal + SHIPPING_COST;
    
    document.getElementById('subtotal').textContent = `€${subtotal.toFixed(2)}`;
    document.getElementById('cart-total').textContent = `€${total.toFixed(2)}`;
}

// Lógica de Pagamento
document.addEventListener('DOMContentLoaded', () => {
    renderCart();
    updateTotals();

    const checkoutForm = document.getElementById('checkout-form');
    const checkoutContent = document.getElementById('checkout-content');
    const successMessage = document.getElementById('success-message');

    checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const cart = getCart();
        const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        const totalAmount = (subtotal + SHIPPING_COST) * 100;

        try {
            const createPaymentIntent = functions.https.onCall('createPaymentIntent');
            const response = await createPaymentIntent({ amount: totalAmount, currency: 'eur' });
            const clientSecret = response.data.clientSecret;
            
            const result = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: {
                        // Não é seguro. Apenas para simulação. Na vida real, use elementos Stripe.
                    },
                }
            });

            if (result.error) {
                alert(result.error.message);
            } else {
                if (result.paymentIntent.status === 'succeeded') {
                    checkoutContent.classList.add('hidden');
                    successMessage.classList.remove('hidden');

                    localStorage.removeItem('cart');
                    updateCartCount();
                }
            }

        } catch (error) {
            console.error("Erro no checkout:", error);
            alert("Ocorreu um erro ao processar o seu pagamento. Por favor, tente novamente.");
        }
    });

    const paymentOptions = document.querySelectorAll('input[name="payment_method"]');
    const paymentContainers = document.querySelectorAll('.payment-option');
    const detailsContainers = {
        card: document.getElementById('card-details'),
        mbway: document.getElementById('mbway-details'),
        transfer: document.getElementById('transfer-details')
    };

    paymentOptions.forEach(option => {
        option.addEventListener('change', (e) => {
            const selectedMethod = e.target.id.split('_')[1];
            paymentContainers.forEach(container => container.classList.remove('selected'));
            document.querySelector(`[data-payment-option="${selectedMethod}"]`).classList.add('selected');

            for (const method in detailsContainers) {
                if (method === selectedMethod) {
                    detailsContainers[method].classList.remove('hidden');
                } else {
                    detailsContainers[method].classList.add('hidden');
                }
            }
        });
    });
});
