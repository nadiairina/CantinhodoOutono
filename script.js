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

function renderCartPreview() {
    const cart = getCart();
    const cartPreviewContainer = document.getElementById('cart-preview-items');
    const cartPreviewTotal = document.getElementById('cart-preview-total');
    let total = 0;

    if (cartPreviewContainer) {
        cartPreviewContainer.innerHTML = '';
        if (cart.length === 0) {
            cartPreviewContainer.innerHTML = '<p class="text-gray-500">O seu carrinho está vazio.</p>';
        } else {
            cart.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = 'flex items-center justify-between mb-4';
                itemElement.innerHTML = `
                    <div class="flex items-center">
                        <img src="${item.image}" alt="${item.name}" class="rounded-lg w-16 h-16 object-cover mr-4">
                        <div>
                            <h3 class="font-semibold">${item.name}</h3>
                            <p class="text-sm text-gray-500">Qtd: ${item.quantity}</p>
                            <span class="font-bold text-[#8B4513]">€${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    </div>
                    <button class="remove-from-cart-btn text-red-500 hover:text-red-700 transition-colors" data-id="${item.id}">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                `;
                cartPreviewContainer.appendChild(itemElement);
                total += item.price * item.quantity;
            });
        }
        if (cartPreviewTotal) {
            cartPreviewTotal.textContent = `€${total.toFixed(2)}`;
        }
    }
}

// Animação "fly to cart"
function flyToCartAnimation(imageElement) {
    const cartIcon = document.querySelector('.cart-icon-container button');
    if (!cartIcon) return;

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

    setTimeout(() => {
        flyingImage.style.top = `${cartRect.top}px`;
        flyingImage.style.left = `${cartRect.left}px`;
        flyingImage.style.width = '0px';
        flyingImage.style.height = '0px';
        flyingImage.style.opacity = '0';
    }, 10);

    setTimeout(() => {
        flyingImage.remove();
        updateCartCount();
    }, 1000);
}

// Lógica de manipulação de produtos
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    renderCartPreview();

    // Event listener para abrir/fechar o pop-up do carrinho
    const cartBtn = document.getElementById('cart-btn');
    const cartPreview = document.getElementById('cart-preview');

    if (cartBtn && cartPreview) {
        cartBtn.addEventListener('click', (e) => {
            e.stopPropagation(); // Impede a propagação para o document
            cartPreview.classList.toggle('hidden');
        });

        document.addEventListener('click', (e) => {
            if (!cartBtn.contains(e.target) && !cartPreview.contains(e.target)) {
                cartPreview.classList.add('hidden');
            }
        });
    }

    // Adiciona funcionalidade aos botões de adicionar ao carrinho
    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const productCard = e.target.closest('.product-card');
            if (productCard) {
                const product = {
                    id: productCard.dataset.id,
                    name: productCard.dataset.name,
                    price: parseFloat(productCard.dataset.price),
                    image: productCard.dataset.image
                };
                addToCart(product);
                const imageElement = productCard.querySelector('img');
                if (imageElement) {
                    flyToCartAnimation(imageElement);
                }
            }
        });
    });

    // Event listeners para filtros e ordenação
    const categoryFilter = document.getElementById('category');
    const sortFilter = document.getElementById('sort');

    if (categoryFilter && sortFilter) {
        categoryFilter.addEventListener('change', () => {
            filterAndSortProducts();
        });

        sortFilter.addEventListener('change', () => {
            filterAndSortProducts();
        });
    }

    function filterAndSortProducts() {
        const selectedCategory = categoryFilter.value;
        const selectedSort = sortFilter.value;
        const productsGrid = document.getElementById('products-grid');
        let products = Array.from(document.querySelectorAll('.product-card'));

        // Primeiro, filtramos para ocultar os produtos que não correspondem à categoria
        products.forEach(product => {
            const productCategory = product.getAttribute('data-category');
            if (selectedCategory === 'all' || productCategory === selectedCategory) {
                product.classList.remove('hidden');
            } else {
                product.classList.add('hidden');
            }
        });
        
        // Em seguida, ordenamos apenas os produtos visíveis
        const visibleProducts = products.filter(p => !p.classList.contains('hidden'));

        if (selectedSort === 'price-asc') {
            visibleProducts.sort((a, b) => {
                const priceA = parseFloat(a.dataset.price);
                const priceB = parseFloat(b.dataset.price);
                return priceA - priceB;
            });
        } else if (selectedSort === 'price-desc') {
            visibleProducts.sort((a, b) => {
                const priceA = parseFloat(a.dataset.price);
                const priceB = parseFloat(b.dataset.price);
                return priceB - priceA;
            });
        } else if (selectedSort === 'relevance') {
            visibleProducts.sort((a, b) => {
                const relevanceA = parseInt(a.dataset.relevanceOrder) || Infinity;
                const relevanceB = parseInt(b.dataset.relevanceOrder) || Infinity;
                return relevanceA - relevanceB;
            });
        }

        // Removemos todos os produtos da grelha e adicionamos os ordenados
        productsGrid.innerHTML = '';
        visibleProducts.forEach(product => productsGrid.appendChild(product));
    }

    // Chamamos a função ao carregar a página para garantir a ordenação inicial
    filterAndSortProducts();
});
