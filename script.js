// Funções de Gestão do Carrinho (usando localStorage)
function getCart() {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function updateCartCount() {
    const cart = getCart();
    const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartItemCountElement = document.getElementById('cart-item-count');
    if (cartItemCountElement) {
        cartItemCountElement.textContent = itemCount;
    }
}

function addToCart(product) {
    const cart = getCart();
    const existingProductIndex = cart.findIndex(item => item.id === product.id);

    if (existingProductIndex > -1) {
        cart[existingProductIndex].quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart(cart);
    alert(`'${product.name}' adicionado ao carrinho! Total: ${cart.length} item(s)`);
}

function removeFromCart(productId) {
    const cart = getCart();
    const updatedCart = cart.filter(item => item.id !== productId);
    saveCart(updatedCart);
}

// Carregar o contador do carrinho ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    if (addToCartButtons.length > 0) {
        addToCartButtons.forEach(button => {
            button.addEventListener('click', () => {
                const product = {
                    id: button.dataset.id,
                    name: button.dataset.name,
                    price: parseFloat(button.dataset.price),
                    image: button.dataset.image
                };
                addToCart(product);
            });
        });
    }

    // Lógica para a página do carrinho
    if (document.getElementById('cart-items')) {
        renderCart();
    }
});

function renderCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const cart = getCart();
    
    cartItemsContainer.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `<p class="text-gray-500 text-center">O seu carrinho está vazio.</p>`;
    } else {
        cart.forEach(item => {
            total += item.price * item.quantity;
            const itemHTML = `
                <div class="flex items-center justify-between border-b pb-4 mb-4">
                    <div class="flex items-center">
                        <img src="${item.image}" alt="${item.name}" class="rounded-lg w-20 h-20 object-cover mr-4">
                        <div>
                            <h3 class="font-semibold">${item.name}</h3>
                            <p class="text-sm text-gray-500">Quantidade: ${item.quantity}</p>
                            <span class="font-bold text-[#8B4513]">€${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    </div>
                    <button class="remove-from-cart-btn bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors" data-id="${item.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm6 0a1 1 0 112 0v6a1 1 0 11-2 0V8z" clip-rule="evenodd" />
                        </svg>
                    </button>
                </div>
            `;
            cartItemsContainer.innerHTML += itemHTML;
        });

        // Adicionar listeners aos botões de remoção
        document.querySelectorAll('.remove-from-cart-btn').forEach(button => {
            button.addEventListener('click', () => {
                const productId = button.dataset.id;
                removeFromCart(productId);
                renderCart(); // Renderizar novamente o carrinho
            });
        });
    }

    cartTotalElement.textContent = `€${total.toFixed(2)}`;
}
