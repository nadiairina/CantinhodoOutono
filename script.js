document.addEventListener('DOMContentLoaded', () => {
    const cartIcon = document.getElementById('cart-icon');
    const cartCount = document.getElementById('cart-count');
    const cartPreview = document.getElementById('cart-preview');
    const cartItemsPreview = document.getElementById('cart-items-preview');
    const cartTotalPreview = document.getElementById('cart-total-preview');
    const addToCartButtons = document.querySelectorAll('.add-to-cart-btn');
    const cartItemsContainer = document.getElementById('cart-items-container');
    const cartTotal = document.getElementById('cart-total');
    const emptyCartMessage = document.getElementById('empty-cart-message');
    const clearCartBtn = document.getElementById('clear-cart-btn');
    const checkoutForm = document.getElementById('checkout-form');
    const orderSuccess = document.getElementById('order-success');

    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Função para salvar o carrinho no localStorage
    const saveCart = () => {
        localStorage.setItem('cart', JSON.stringify(cart));
    };

    // Função para atualizar a contagem do carrinho
    const updateCartCount = () => {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        if (totalItems > 0) {
            cartCount.textContent = totalItems;
            cartCount.classList.remove('hidden');
        } else {
            cartCount.classList.add('hidden');
        }
    };

    // Função para renderizar os itens no carrinho (página do carrinho)
    const renderCartItems = () => {
        if (!cartItemsContainer) return; // Só executa se estiver na página do carrinho

        cartItemsContainer.innerHTML = '';
        if (cart.length === 0) {
            emptyCartMessage.classList.remove('hidden');
            clearCartBtn.classList.add('hidden');
        } else {
            emptyCartMessage.classList.add('hidden');
            clearCartBtn.classList.remove('hidden');
            cart.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.classList.add('flex', 'items-center', 'space-x-4', 'border-b', 'pb-4');
                itemElement.innerHTML = `
                    <img src="https://placehold.co/100x100/fef9f5/8B4513/png?text=Produto" alt="${item.name}" class="w-20 h-20 object-cover rounded-md">
                    <div class="flex-grow">
                        <h3 class="text-xl font-semibold text-brown-primary">${item.name}</h3>
                        <p class="text-gray-600">Preço: €${item.price.toFixed(2)}</p>
                    </div>
                    <div class="flex items-center space-x-2">
                        <button class="update-quantity-btn bg-gray-200 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-300" data-id="${item.id}" data-action="decrease">-</button>
                        <span class="text-lg font-semibold">${item.quantity}</span>
                        <button class="update-quantity-btn bg-gray-200 text-gray-700 px-3 py-1 rounded-md hover:bg-gray-300" data-id="${item.id}" data-action="increase">+</button>
                    </div>
                    <button class="remove-from-cart-btn text-red-500 hover:text-red-700" data-id="${item.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                `;
                cartItemsContainer.appendChild(itemElement);
            });
        }
        updateCartTotal();
    };

    // Função para atualizar o total do carrinho
    const updateCartTotal = () => {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        if (cartTotal) cartTotal.textContent = `€${total.toFixed(2)}`;
        if (cartTotalPreview) cartTotalPreview.textContent = `€${total.toFixed(2)}`;
    };

    // Função para renderizar o carrinho de pré-visualização
    const renderCartPreview = () => {
        if (!cartItemsPreview) return; // Só executa se tiver o elemento de pré-visualização

        cartItemsPreview.innerHTML = '';
        if (cart.length === 0) {
            cartItemsPreview.innerHTML = '<p class="text-gray-600 text-sm">Nenhum item no carrinho.</p>';
        } else {
            cart.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.classList.add('flex', 'items-center', 'justify-between', 'text-gray-700', 'text-sm');
                itemElement.innerHTML = `
                    <span>${item.name} (${item.quantity})</span>
                    <span>€${(item.price * item.quantity).toFixed(2)}</span>
                `;
                cartItemsPreview.appendChild(itemElement);
            });
        }
        updateCartTotal();
    };

    // Adicionar item ao carrinho
    const addToCart = (id, name, price) => {
        const existingItem = cart.find(item => item.id === id);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({ id, name, price, quantity: 1 });
        }
        saveCart();
        updateCartCount();
        renderCartItems(); // Atualiza a página do carrinho se estiver nela
        renderCartPreview(); // Atualiza a pré-visualização
        // Feedback visual (opcional)
        alert(`${name} adicionado ao carrinho!`);
    };

    // Remover item do carrinho
    const removeFromCart = (id) => {
        cart = cart.filter(item => item.id !== id);
        saveCart();
        updateCartCount();
        renderCartItems();
        renderCartPreview();
    };

    // Atualizar quantidade do item no carrinho
    const updateQuantity = (id, action) => {
        const item = cart.find(item => item.id === id);
        if (item) {
            if (action === 'increase') {
                item.quantity++;
            } else if (action === 'decrease') {
                item.quantity--;
                if (item.quantity <= 0) {
                    removeFromCart(id); // Remove se a quantidade for 0 ou menos
                    return;
                }
            }
            saveCart();
            updateCartCount();
            renderCartItems();
            renderCartPreview();
        }
    };

    // Event listeners para "Adicionar ao Carrinho"
    addToCartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const id = e.target.dataset.id;
            const name = e.target.dataset.name;
            const price = parseFloat(e.target.dataset.price);
            addToCart(id, name, price);
        });
    });

    // Event listener para o ícone do carrinho (mostrar/esconder pré-visualização)
    if (cartIcon) {
        cartIcon.addEventListener('click', (e) => {
            e.preventDefault(); // Evita que o link navegue imediatamente
            // Se estiver na página do carrinho, apenas navega, não mostra preview
            if (window.location.pathname.includes('cart.html')) {
                window.location.href = 'cart.html';
                return;
            }
            // Toggle do preview para outras páginas
            cartPreview.classList.toggle('hidden');
            renderCartPreview(); // Renderiza sempre que abre
        });

        // Fechar o preview se clicar fora
        document.addEventListener('click', (e) => {
            if (!cartPreview.contains(e.target) && !cartIcon.contains(e.target) && !cartPreview.classList.contains('hidden')) {
                cartPreview.classList.add('hidden');
            }
        });
    }

    // Event listener para botões de remover e atualizar quantidade (na página do carrinho)
    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', (e) => {
            if (e.target.closest('.remove-from-cart-btn')) {
                const id = e.target.closest('.remove-from-cart-btn').dataset.id;
                removeFromCart(id);
            } else if (e.target.closest('.update-quantity-btn')) {
                const btn = e.target.closest('.update-quantity-btn');
                const id = btn.dataset.id;
                const action = btn.dataset.action;
                updateQuantity(id, action);
            }
        });
    }

    // Event listener para o botão "Limpar Carrinho"
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            cart = [];
            saveCart();
            updateCartCount();
            renderCartItems();
            renderCartPreview();
        });
    }

    // Event listener para o formulário de checkout
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            // Simular o processamento do pedido
            console.log('Pedido enviado!', {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                address: document.getElementById('address').value,
                paymentMethod: document.getElementById('payment-method').value,
                items: cart,
                total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
            });

            // Limpar carrinho e mostrar mensagem de sucesso
            cart = [];
            saveCart();
            updateCartCount();
            renderCartItems();
            renderCartPreview();

            checkoutForm.classList.add('hidden');
            orderSuccess.classList.remove('hidden');

            // Opcional: Redirecionar para uma página de confirmação após alguns segundos
            // setTimeout(() => {
            //     window.location.href = 'order-confirmation.html';
            // }, 5000);
        });
    }

    // Inicializar o carrinho ao carregar a página
    updateCartCount();
    renderCartItems(); // Garante que a página do carrinho é renderizada se for o caso
    renderCartPreview(); // Garante que a pré-visualização é renderizada se for o caso
});
