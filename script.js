// Firebase imports from CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, deleteDoc, onSnapshot, collection, updateDoc, getDocs } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Inicializa a configuração do Firebase (substituir pelos teus dados reais)
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_AUTH_DOMAIN",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_STORAGE_BUCKET",
    messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
    appId: "YOUR_APP_ID"
};

let db, auth, userId, cart = [];

async function initFirebase() {
    try {
        const app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);

        await signInAnonymously(auth);

        onAuthStateChanged(auth, user => {
            if (user) {
                userId = user.uid;
                console.log("Utilizador autenticado com ID:", userId);
                listenToCart();
            } else {
                userId = null;
                console.log("Usuário não autenticado.");
            }
        });
    } catch (error) {
        console.error("Erro ao inicializar o Firebase:", error);
    }
}

initFirebase();

window.addToCart = async function(product) {
    if (!userId) {
        console.error("Erro: userId não está definido. A autenticação Firebase pode ter falhado ou ainda não terminou.");
        showMessageBox("Erro: Utilizador não autenticado. A página está a carregar, por favor, tente em alguns segundos.");
        return;
    }
    try {
        const docRef = doc(db, `users/${userId}/cart/${product.id}-${product.size}`);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            const currentQuantity = docSnap.data().quantity;
            await updateDoc(docRef, { quantity: currentQuantity + 1 });
        } else {
            await setDoc(docRef, { ...product, quantity: 1, size: product.size });
        }
        showMessageBox(`Produto "${product.name}" (Tamanho: ${product.size}) adicionado ao carrinho!`);
    } catch (error) {
        console.error("Erro ao adicionar ao carrinho:", error);
        showMessageBox("Ocorreu um erro ao adicionar ao carrinho. Por favor, tente novamente.");
    }
}

function listenToCart() {
    if (!userId) {
        console.log("userId não disponível para listenToCart.");
        return;
    }
    const cartCollectionRef = collection(db, `users/${userId}/cart`);
    onSnapshot(cartCollectionRef, (querySnapshot) => {
        cart = [];
        querySnapshot.forEach((doc) => {
            cart.push({ id: doc.id, ...doc.data() });
        });
        updateCartDisplay();
    });
}
        
function updateCartDisplay() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalSpan = document.getElementById('cart-total');
    const emptyMessage = document.getElementById('empty-cart-message');
    
    if (!cartItemsContainer || !cartTotalSpan || !emptyMessage) return;

    cartItemsContainer.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        emptyMessage.classList.remove('hidden');
        document.getElementById('cart-summary').classList.add('hidden');
    } else {
        emptyMessage.classList.add('hidden');
        document.getElementById('cart-summary').classList.remove('hidden');
        cart.forEach(item => {
            total += item.price * item.quantity;
            const itemElement = document.createElement('div');
            itemElement.classList.add('flex', 'justify-between', 'items-center', 'mb-4', 'pb-4', 'border-b', 'border-gray-200');
            itemElement.innerHTML = `
                <div class="flex items-center">
                    <img src="${item.image}" alt="${item.name}" class="w-16 h-16 rounded-lg mr-4">
                    <div>
                        <h4 class="font-semibold">${item.name}</h4>
                        <p class="text-gray-600">€ ${item.price.toFixed(2)}</p>
                        <p class="text-sm text-gray-500">Tamanho: ${item.size}</p>
                    </div>
                </div>
                <div class="flex items-center space-x-4">
                    <input type="number" value="${item.quantity}" min="1" onchange="updateQuantity('${item.id.replace(/'/g, "\\'")}', this.value)" class="w-16 text-center rounded-md border-gray-300">
                    <button onclick="removeFromCart('${item.id.replace(/'/g, "\\'")}')" class="text-red-500 hover:text-red-700 transition-colors">Remover</button>
                </div>
            `;
            cartItemsContainer.appendChild(itemElement);
        });
    }

    cartTotalSpan.textContent = `€ ${total.toFixed(2)}`;
}

window.updateQuantity = async function(id, quantity) {
    if (!userId) return;
    try {
        const newQuantity = parseInt(quantity);
        const docRef = doc(db, `users/${userId}/cart/${id}`);
        if (newQuantity <= 0) {
            await deleteDoc(docRef);
        } else {
            await updateDoc(docRef, { quantity: newQuantity });
        }
    } catch (error) {
        console.error("Erro ao atualizar a quantidade:", error);
        showMessageBox("Ocorreu um erro ao atualizar a quantidade. Por favor, tente novamente.");
    }
}

window.removeFromCart = async function(id) {
    if (!userId) return;
    try {
        const docRef = doc(db, `users/${userId}/cart/${id}`);
        await deleteDoc(docRef);
    } catch (error) {
        console.error("Erro ao remover do carrinho:", error);
        showMessageBox("Ocorreu um erro ao remover o item do carrinho. Por favor, tente novamente.");
    }
}

window.showMessageBox = function(message) {
    document.getElementById('message-text').textContent = message;
    document.getElementById('message-box').classList.remove('hidden');
    document.getElementById('message-box').classList.add('flex');
}

window.closeMessageBox = function() {
    document.getElementById('message-box').classList.remove('flex');
    document.getElementById('message-box').classList.add('hidden');
}

document.addEventListener('DOMContentLoaded', () => {
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        setupStripeCheckout();
    }
});

let stripe;
function setupStripeCheckout() {
    try {
        if (!stripe) {
            stripe = Stripe('pk_test_51P71cR2KkE3E7hT5rV1X4nU3g7fQ8gJ5tA6eG8q8J0nL1c7r9B3gC2eG8gN1r7y6jR9E3gC2eG8gN1r7y6jR');
        }
        const elements = stripe.elements();
        const cardElement = elements.create('card');
        cardElement.mount('#card-element');
        
        const cardErrors = document.getElementById('card-errors');
        const checkoutButton = document.getElementById('checkout-button');
        const checkoutForm = document.getElementById('checkout-form');

        checkoutForm.addEventListener('submit', async function(event) {
            event.preventDefault();
            
            if (cart.length === 0) {
                showMessageBox("O seu carrinho está vazio. Adicione produtos antes de finalizar a compra.");
                return;
            }

            checkoutButton.disabled = true;
            checkoutButton.classList.add('btn-loading');
            checkoutButton.textContent = 'A processar...';

            const { token, error } = await stripe.createToken(cardElement, {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value
            });

            if (error) {
                cardErrors.textContent = error.message;
                checkoutButton.disabled = false;
                checkoutButton.classList.remove('btn-loading');
                checkoutButton.textContent = 'Pagar e Finalizar';
            } else {
                console.log("Token do Stripe gerado:", token);
                cardErrors.textContent = '';
                showMessageBox("Pagamento efetuado com sucesso! O seu pedido será processado em breve. Obrigado pela sua compra!");
                
                await clearCart();
                
                checkoutForm.reset();
                checkoutButton.disabled = false;
                checkoutButton.classList.remove('btn-loading');
                checkoutButton.textContent = 'Pagar e Finalizar';
            }
        });
    } catch (error) {
        console.error("Erro ao configurar o Stripe Checkout:", error);
    }
}

async function clearCart() {
    if (!userId) return;
    try {
        const cartRef = collection(db, `users/${userId}/cart`);
        const querySnapshot = await getDocs(cartRef);
        querySnapshot.forEach(async (doc) => {
            await deleteDoc(doc.ref);
        });
    } catch (error) {
        console.error("Erro ao limpar o carrinho:", error);
    }
}
