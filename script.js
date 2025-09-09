// Funções de Gestão do Carrinho (usando localStorage)
function getCart() {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    renderCartPreview(); // Atualiza a pré-visualização ao salvar
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
}

function removeFromCart(productId) {
    const cart = getCart();
    const updatedCart = cart.filter(item => item.id !== productId);
    saveCart(updatedCart);
}

// Animação "fly to cart"
function flyToCartAnimation(imageElement) {
    const cartIcon = document.querySelector('.cart-icon-container a');
    const imageRect = imageElement.getBoundingClientRect();
    const cartRect = cartIcon.getBoundingClientRect();

    const flyingImage = imageElement.cloneNode(true);
    flyingImage.style.position = 'fixed';
    flyingImage.style.top = `${imageRect.top}px`;
    flyingImage.style.left = `${imageRect.left}px`;
    flyingImage.style.width = `${imageRect.width}px`;
    flyingImage.style.height = `${imageRect.height}px`;
    flyingImage.style.opacity = '1';
    flyingImage.style.transition = 'all 1s ease-in-out';
    flyingImage.style.zIndex = '1000';
    flyingImage.style.borderRadius = '9999px';

    document.body.appendChild(flyingImage);

    flyingImage.getBoundingClientRect();
    
    flyingImage.style.top = `${cartRect.top}px`;
    flyingImage.style.left = `${cartRect.left}px`;
    flyingImage.style.width = '30px';
    flyingImage.style.height = '30px';
    flyingImage.style.opacity = '0.5';

    setTimeout(() => {
        flyingImage.remove();
    }, 1000);
}

// Pré-visualização do carrinho
function renderCartPreview() {
    const cartPreviewContainer = document.getElementById('cart-preview-items');
    if (!cartPreviewContainer) return;

    const cart = getCart();
    cartPreviewContainer.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartPreviewContainer.innerHTML = `<p class="text-gray-500 text-center text-sm">O carrinho está vazio.</p>`;
    } else {
        cart.forEach(item => {
            total += item.price * item.quantity;
            const itemHTML = `
                <div class="flex items-center mb-2">
                    <img src="${item.image}" alt="${item.name}" class="w-10 h-10 object-cover rounded-md mr-2">
                    <div class="flex-grow">
                        <p class="text-sm font-medium">${item.name}</p>
                        <p class="text-xs text-gray-500">Qtd: ${item.quantity} | €${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                </div>
            `;
            cartPreviewContainer.innerHTML += itemHTML;
        });
        const totalHTML = `
            <div class="border-t pt-2 mt-2">
                <div class="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>€${total.toFixed(2)}</span>
                </div>
            </div>
        `;
        cartPreviewContainer.innerHTML += totalHTML;
    }
}


document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    renderCartPreview();

    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    if (addToCartButtons.length > 0) {
        addToCartButtons.forEach(button => {
            button.addEventListener('click', () => {
                const productCard = button.closest('.product-card');
                const productImage = productCard.querySelector('img');

                if (productImage) {
                    flyToCartAnimation(productImage);
                }

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

    if (document.getElementById('cart-items')) {
        renderCart();
    }

    const cartIconLink = document.querySelector('.cart-icon-container a');
    const cartPreview = document.getElementById('cart-preview');
    if (cartIconLink && cartPreview) {
        // Mostra/esconde a pré-visualização ao clicar no ícone do carrinho
        cartIconLink.addEventListener('click', (e) => {
            e.preventDefault(); // Impede a navegação
            renderCartPreview();
            cartPreview.classList.toggle('hidden');
        });

        // Esconde a pré-visualização ao clicar em qualquer lugar fora dela
        document.addEventListener('click', (e) => {
            if (!cartPreview.contains(e.target) && !cartIconLink.contains(e.target)) {
                cartPreview.classList.add('hidden');
            }
        });
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
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </div>
            `;
            cartItemsContainer.innerHTML += itemHTML;
        });

        document.querySelectorAll('.remove-from-cart-btn').forEach(button => {
            button.addEventListener('click', () => {
                const productId = button.dataset.id;
                removeFromCart(productId);
                renderCart();
            });
        });
    }

    cartTotalElement.textContent = `€${total.toFixed(2)}`;
}
