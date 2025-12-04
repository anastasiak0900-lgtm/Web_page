// --- START OF FILE script.js ---

// Данные товаров (Используем локальные картинки из папки img/)
const products = [
    { id: 1, name: "Черная кожаная куртка", price: 15990, category: "men", image: "img/1.jpg", description: "Минималистичная кожаная куртка прямого кроя", rating: 4.8, sizes: ["M", "L", "XL"], color: "Черный", material: "Кожа" },
    { id: 2, name: "Белое хлопковое платье", price: 8490, category: "women", image: "img/2.jpg", description: "Простое платье из органического хлопка", rating: 4.9, sizes: ["XS", "S", "M", "L"], color: "Белый", material: "Хлопок" },
    { id: 3, name: "Кожаные кроссовки", price: 12990, category: "shoes", image: "img/3.jpg", description: "Минималистичные кожаные кроссовки", rating: 4.7, sizes: ["40", "41", "42", "43", "44", "45"], color: "Черный", material: "Кожа" },
    { id: 4, name: "Прямые джинсы", price: 6490, category: "men", image: "img/4.jpg", description: "Классические прямые джинсы из японского денима", rating: 4.5, sizes: ["46", "48", "50", "52"], color: "Индиго", material: "Деним" },
    { id: 5, name: "Кожаная сумка", price: 8990, category: "accessories", image: "img/5.jpg", description: "Минималистичная кожаная сумка через плечо", rating: 4.6, sizes: ["Один размер"], color: "Черный", material: "Кожа" },
    { id: 6, name: "Белая рубашка", price: 5490, category: "men", image: "img/6.jpg", description: "Классическая рубашка из египетского хлопка", rating: 4.4, sizes: ["M", "L", "XL"], color: "Белый", material: "Хлопок" },
    { id: 7, name: "Шерстяное пальто", price: 24990, category: "women", image: "img/7.jpg", description: "Длинное шерстяное пальто оверсайз", rating: 4.9, sizes: ["S", "M", "L"], color: "Серый", material: "Шерсть" },
    { id: 8, name: "Кожаные лоферы", price: 14990, category: "shoes", image: "img/8.jpg", description: "Классические кожаные лоферы", rating: 4.7, sizes: ["39", "40", "41", "42", "43"], color: "Черный", material: "Кожа" },
    { id: 9, name: "Кашемировый свитер", price: 18990, category: "women", image: "img/9.jpg", description: "Свитер из монгольского кашемира", rating: 4.8, sizes: ["XS", "S", "M"], color: "Серый", material: "Кашемир" },
    { id: 10, name: "Кожаный ремень", price: 3490, category: "accessories", image: "img/10.jpg", description: "Минималистичный кожаный ремень", rating: 4.5, sizes: ["Один размер"], color: "Черный", material: "Кожа" },
    { id: 11, name: "Шерстяное пальто мужское", price: 27990, category: "men", image: "img/11.jpg", description: "Длинное шерстяное пальто прямого кроя", rating: 4.9, sizes: ["L", "XL", "XXL"], color: "Коричневый", material: "Шерсть" },
    { id: 12, name: "Очки с прозрачной оправой", price: 8990, category: "accessories", image: "img/12.jpg", description: "Солнцезащитные очки с прозрачной оправой", rating: 4.7, sizes: ["Один размер"], color: "Прозрачный", material: "Ацетат" }
];

// Глобальное состояние
let cart = JSON.parse(localStorage.getItem('mono-cart')) || [];
let favorites = JSON.parse(localStorage.getItem('mono-favorites')) || [];
let compareList = JSON.parse(localStorage.getItem('mono-compare')) || [];
let currentFilter = 'all';
let currentSearch = '';

// --- ИНИЦИАЛИЗАЦИЯ ---
document.addEventListener('DOMContentLoaded', function() {
    renderProducts();
    updateAllCartViews();
    updateAllFavoritesViews();
    updateCompareUI();
    setupEventListeners();
    setupSizeSelection();
});

// --- ГЛАВНЫЕ ФУНКЦИИ ОБНОВЛЕНИЯ ---

function updateAllCartViews() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountEl = document.getElementById('cartCount');
    if (cartCountEl) cartCountEl.textContent = totalItems;
    renderCartItemsHTML();
    products.forEach(product => updateProductCardState(product.id));
    localStorage.setItem('mono-cart', JSON.stringify(cart));
}

function updateAllFavoritesViews() {
    const favCountEl = document.getElementById('favoritesCount');
    if (favCountEl) favCountEl.textContent = favorites.length;
    renderFavoritesItemsHTML();
    products.forEach(product => updateFavoriteButtonState(product.id));
    localStorage.setItem('mono-favorites', JSON.stringify(favorites));
}

function updateCompareUI() {
    const btn = document.getElementById('compareFloatingBtn');
    const countSpan = document.getElementById('compareCount');
    if (!btn || !countSpan) return;
    
    if (compareList.length > 0) {
        btn.style.display = 'block';
        countSpan.textContent = compareList.length;
    } else {
        btn.style.display = 'none';
    }
}

// --- ЛОГИКА ТОВАРОВ ---

function renderProducts() {
    const grid = document.getElementById('productsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const filtered = products.filter(product => {
        const catMatch = currentFilter === 'all' || product.category === currentFilter;
        const searchMatch = !currentSearch || product.name.toLowerCase().includes(currentSearch.toLowerCase());
        return catMatch && searchMatch;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `<div class="col-12 text-center py-5"><h4 class="text-muted">Товары не найдены</h4><button class="btn btn-outline-dark mt-3" onclick="resetFilters()">Сбросить фильтры</button></div>`;
        return;
    }

    filtered.forEach(product => {
        grid.innerHTML += createProductCard(product);
    });
    
    // Восстанавливаем выбранные размеры
    filtered.forEach(p => {
        const savedSize = localStorage.getItem(`size_${p.id}`);
        if (savedSize) highlightSelectedSize(p.id, savedSize);
    });
}

function createProductCard(product) {
    const isFavorite = favorites.some(fav => fav.id === product.id);
    const isInCompare = compareList.some(item => item.id === product.id);
    
    let sizesHTML = '';
    if (product.sizes.length === 1 && product.sizes[0] === "Один размер") {
        sizesHTML = `<small class="text-muted">Один размер</small>`;
    } else {
        sizesHTML = product.sizes.map(size => 
            `<span class="size-badge" data-product-id="${product.id}" data-size="${size}">${size}</span>`
        ).join('');
    }
    
    return `
        <div class="col-md-6 col-lg-4 col-xl-3">
            <div class="card product-card h-100 position-relative" data-product-id="${product.id}">
                
                <!-- ВЕРХНИЕ КНОПКИ ДЕЙСТВИЙ -->
                <div class="card-top-actions">
                    <!-- 1. Лайк -->
                    <button class="btn-action-round ${isFavorite ? 'active-favorite' : ''}" 
                            onclick="toggleFavorite(${product.id})"
                            title="${isFavorite ? 'Убрать из избранного' : 'В избранное'}">
                        <i class="bi ${isFavorite ? 'bi-heart-fill' : 'bi-heart'}"></i>
                    </button>

                    <!-- 2. Меню (Dropdown) -->
                    <div class="dropdown">
                        <button class="btn-action-round dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                            <i class="bi bi-three-dots-vertical"></i>
                        </button>
                        <ul class="dropdown-menu dropdown-menu-end">
                            <li>
                                <a class="dropdown-item" onclick="addToCompare(${product.id})">
                                    <i class="bi bi-arrow-left-right"></i> 
                                    ${isInCompare ? 'Уже в сравнении' : 'К сравнению'}
                                </a>
                            </li>
                            <li>
                                <a class="dropdown-item" onclick="shareProduct(${product.id})">
                                    <i class="bi bi-share"></i> Поделиться
                                </a>
                            </li>
                            <li><hr class="dropdown-divider"></li>
                            <li>
                                <a class="dropdown-item" onclick="openQuestionModal(${product.id})">
                                    <i class="bi bi-chat-dots"></i> Задать вопрос
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
                
                <!-- БЕЙДЖ КОРЗИНЫ -->
                <div class="badge-container position-absolute top-0 start-0 m-2"></div>
                
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                
                <div class="card-body">
                    <h6 class="product-title">${product.name}</h6>
                    <p class="product-description">${product.description}</p>
                    
                    <div class="mb-2">
                        <small class="text-muted">${product.color} • ${product.material}</small>
                    </div>
                    
                    <div class="mb-3 sizes-container" id="sizes-container-${product.id}">
                        ${sizesHTML}
                    </div>
                    
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="price">${formatPrice(product.price)}</span>
                        <div class="rating">
                            <i class="bi bi-star-fill"></i> ${product.rating}
                        </div>
                    </div>
                    
                    <div class="product-actions">
                        <button class="btn btn-outline-dark flex-grow-1 btn-add-cart" onclick="addToCart(${product.id})">
                            В корзину
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// --- ЛОГИКА КОРЗИНЫ ---

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    let size = "Один размер";
    if (product.sizes.length > 1 || product.sizes[0] !== "Один размер") {
        size = localStorage.getItem(`size_${productId}`) || product.sizes[0];
    }

    const existingIndex = cart.findIndex(item => item.id === productId && item.selectedSize === size);

    if (existingIndex !== -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1, selectedSize: size });
    }

    updateAllCartViews();
    showAlert('Добавлено в корзину', 'success');
}

function updateCartQuantity(index, change) {
    if (index < 0 || index >= cart.length) return;
    
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    
    updateAllCartViews();
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateAllCartViews();
    showAlert('Удалено из корзины', 'error');
}

function renderCartItemsHTML() {
    const container = document.getElementById('cartItems');
    const emptyMsg = document.getElementById('emptyCartMessage');
    const totalEl = document.getElementById('cartTotal');
    
    if (!container) return;

    if (cart.length === 0) {
        container.innerHTML = '';
        if (emptyMsg) emptyMsg.style.display = 'block';
        if (totalEl) totalEl.textContent = '0 ₽';
        return;
    }

    if (emptyMsg) emptyMsg.style.display = 'none';
    
    let html = '';
    let total = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        const sizeInfo = item.selectedSize !== "Один размер" ? `<br><small class="text-muted">Размер: ${item.selectedSize}</small>` : '';

        html += `
            <div class="cart-item py-2 border-bottom">
                <div class="d-flex justify-content-between align-items-start">
                    <div class="flex-grow-1">
                        <h6 class="mb-0">${item.name}</h6>
                        ${sizeInfo}
                        <div class="mt-1"><small>${formatPrice(item.price)} × ${item.quantity}</small></div>
                    </div>
                    <div class="d-flex flex-column align-items-end">
                        <span class="fw-bold mb-2">${formatPrice(itemTotal)}</span>
                        <div class="d-flex align-items-center">
                            <div class="btn-group btn-group-sm me-2">
                                <button class="btn btn-outline-dark" onclick="updateCartQuantity(${index}, -1)">-</button>
                                <span class="btn btn-outline-dark border-start-0 border-end-0" style="cursor: default;">${item.quantity}</span>
                                <button class="btn btn-outline-dark" onclick="updateCartQuantity(${index}, 1)">+</button>
                            </div>
                            <button class="btn btn-outline-danger btn-sm" onclick="removeFromCart(${index})">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
    if (totalEl) totalEl.textContent = formatPrice(total);
}

function updateProductCardState(productId) {
    const card = document.querySelector(`.product-card[data-product-id="${productId}"]`);
    if (!card) return;

    const qty = cart.filter(i => i.id === productId).reduce((sum, i) => sum + i.quantity, 0);
    const badgeContainer = card.querySelector('.badge-container');
    if (badgeContainer) {
        badgeContainer.innerHTML = qty > 0 ? `<span class="badge bg-dark">${qty} в корзине</span>` : '';
    }

    const btn = card.querySelector('.btn-add-cart');
    if (btn) {
        btn.textContent = qty > 0 ? 'Ещё' : 'В корзину';
        btn.classList.toggle('btn-dark', qty > 0);
        btn.classList.toggle('btn-outline-dark', qty === 0);
    }
}

// --- ЛОГИКА ИЗБРАННОГО ---

function toggleFavorite(productId) {
    const existingIndex = favorites.findIndex(f => f.id === productId);
    
    if (existingIndex !== -1) {
        favorites.splice(existingIndex, 1);
        showAlert('Удалено из избранного', 'error');
    } else {
        const product = products.find(p => p.id === productId);
        favorites.push(product);
        showAlert('Добавлено в избранное', 'success');
    }

    updateAllFavoritesViews();
}

function removeFromFavorites(index) {
    favorites.splice(index, 1);
    updateAllFavoritesViews();
}

function addAllFavoritesToCart() {
    if (favorites.length === 0) return;
    
    favorites.forEach(fav => {
        const existing = cart.find(c => c.id === fav.id);
        if(existing) {
            existing.quantity++;
        } else {
            cart.push({ ...fav, quantity: 1, selectedSize: fav.sizes[0] === "Один размер" ? "Один размер" : fav.sizes[0] });
        }
    });

    updateAllCartViews();
    showAlert('Все товары добавлены в корзину', 'success');
}

function renderFavoritesItemsHTML() {
    const container = document.getElementById('favoritesItems');
    const emptyMsg = document.getElementById('emptyFavoritesMessage');
    
    if (!container) return;

    if (favorites.length === 0) {
        container.innerHTML = '';
        if (emptyMsg) emptyMsg.style.display = 'block';
        return;
    }

    if (emptyMsg) emptyMsg.style.display = 'none';

    let html = '';
    favorites.forEach((item, index) => {
        const inCart = cart.some(c => c.id === item.id);
        
        html += `
            <div class="favorite-item py-2 border-bottom">
                <div class="d-flex align-items-center">
                    <div class="me-3" style="width: 60px; height: 60px; overflow: hidden; border-radius: 4px; background: #f9f9f9;">
                        <img src="${item.image}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover;">
                    </div>
                    <div class="flex-grow-1">
                        <h6 class="mb-0">${item.name}</h6>
                        <small class="text-muted">${formatPrice(item.price)}</small>
                        ${inCart ? '<br><small class="text-success"><i class="bi bi-check"></i> В корзине</small>' : ''}
                    </div>
                    <div>
                        <button class="btn btn-sm btn-link text-dark" onclick="addToCart(${item.id})"><i class="bi bi-bag-plus"></i></button>
                        <button class="btn btn-sm btn-link text-danger" onclick="removeFromFavorites(${index})"><i class="bi bi-trash"></i></button>
                    </div>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

function updateFavoriteButtonState(productId) {
    const card = document.querySelector(`.product-card[data-product-id="${productId}"]`);
    if (!card) return;

    const btn = card.querySelector('.btn-action-round');
    if (!btn) return;
    
    const icon = btn.querySelector('i');
    const isFav = favorites.some(f => f.id === productId);

    if (btn.onclick.toString().includes('toggleFavorite')) {
         if (isFav) {
            btn.classList.add('active-favorite');
            icon.classList.remove('bi-heart');
            icon.classList.add('bi-heart-fill');
            btn.title = 'Убрать из избранного';
        } else {
            btn.classList.remove('active-favorite');
            icon.classList.remove('bi-heart-fill');
            icon.classList.add('bi-heart');
            btn.title = 'В избранное';
        }
    }
}

// --- ЛОГИКА СРАВНЕНИЯ ---

function addToCompare(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    if (compareList.some(item => item.id === id)) {
        showAlert('Товар уже в списке сравнения', 'error');
        return;
    }

    if (compareList.length >= 3) {
        showAlert('Можно сравнивать максимум 3 товара', 'error');
        return;
    }

    compareList.push(product);
    localStorage.setItem('mono-compare', JSON.stringify(compareList));
    updateCompareUI();
    showAlert('Добавлено к сравнению', 'success');
}

function openCompareModal() {
    const table = document.getElementById('compareTable');
    const modalEl = document.getElementById('compareModal');
    if (!table || !modalEl) return;

    let modal = bootstrap.Modal.getInstance(modalEl);
    if (!modal) {
        modal = new bootstrap.Modal(modalEl);
    }
    
    if (compareList.length === 0) return;

    let html = '';
    html += `<tr><td class="text-muted fw-bold p-3">Товар</td>`;
    compareList.forEach(p => html += `<td class="p-3 text-center"><img src="${p.image}" alt="${p.name}" style="width: 80px; height: 80px; object-fit: cover; border-radius: 4px;"></td>`);
    html += `</tr>`;
    html += `<tr><td class="text-muted fw-bold p-3">Название</td>`;
    compareList.forEach(p => html += `<td class="text-center"><strong>${p.name}</strong></td>`);
    html += `</tr>`;
    html += `<tr><td class="text-muted fw-bold p-3 bg-light">Цена</td>`;
    compareList.forEach(p => html += `<td class="text-center bg-light">${formatPrice(p.price)}</td>`);
    html += `</tr>`;
    html += `<tr><td class="text-muted fw-bold p-3">Материал</td>`;
    compareList.forEach(p => html += `<td class="text-center">${p.material}</td>`);
    html += `</tr>`;
    html += `<tr><td class="p-3"></td>`;
    compareList.forEach(p => {
        html += `<td class="p-3 text-center">
                    <button class="btn btn-dark btn-sm w-100 mb-2" onclick="addToCart(${p.id})">В корзину</button>
                    <button class="btn btn-outline-danger btn-sm w-100" onclick="removeFromCompare(${p.id})">Убрать</button>
                 </td>`;
    });
    html += `</tr>`;

    table.innerHTML = html;
    modal.show();
}

function removeFromCompare(id) {
    compareList = compareList.filter(item => item.id !== id);
    localStorage.setItem('mono-compare', JSON.stringify(compareList));
    updateCompareUI();
    
    const modalEl = document.getElementById('compareModal');
    if (compareList.length === 0) {
        const modal = bootstrap.Modal.getInstance(modalEl);
        if (modal) modal.hide();
        setTimeout(() => {
            document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
            document.body.classList.remove('modal-open');
            document.body.style = '';
        }, 300);
    } else {
        openCompareModal();
    }
}

function clearComparison() {
    compareList = [];
    localStorage.setItem('mono-compare', JSON.stringify(compareList));
    updateCompareUI();
    
    const modalEl = document.getElementById('compareModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();
    
    setTimeout(() => {
        document.querySelectorAll('.modal-backdrop').forEach(el => el.remove());
        document.body.classList.remove('modal-open');
        document.body.style = '';
    }, 300);
}

// --- ВОПРОСЫ И ШЕРИНГ ---

function openQuestionModal(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;
    
    const nameEl = document.getElementById('modalQuestionProductName');
    const idEl = document.getElementById('modalQuestionProductId');
    
    if (nameEl) nameEl.textContent = product.name;
    if (idEl) idEl.value = product.id;
    
    const modal = new bootstrap.Modal(document.getElementById('questionModal'));
    modal.show();
}

function shareProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    const link = window.location.href.split('?')[0] + '?product=' + id;
    navigator.clipboard.writeText(link)
        .then(() => showAlert('Ссылка на товар скопирована!', 'success'))
        .catch(() => showAlert('Не удалось скопировать ссылку', 'error'));
}

// --- ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ---

function setupEventListeners() {
    // 1. Поиск
    document.getElementById('searchButton').addEventListener('click', () => {
        currentSearch = document.getElementById('searchInput').value;
        renderProducts();
        scrollToProducts();
    });
    
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if(e.key === 'Enter') {
            currentSearch = e.target.value;
            renderProducts();
            scrollToProducts();
        }
    });

    // 2. Фильтры
    document.querySelectorAll('.category-filter').forEach(btn => {
        btn.addEventListener('click', function() {
            currentFilter = this.dataset.category;
            document.querySelectorAll('.category-filter').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            renderProducts();
        });
    });

    // 3. Заказ
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) checkoutBtn.addEventListener('click', openOrderModal);
    
    const orderForm = document.getElementById('orderForm');
    if (orderForm) orderForm.addEventListener('submit', processOrder);
    
    // 4. Формы входа (заглушки)
    document.getElementById('loginForm')?.addEventListener('submit', e => {
        e.preventDefault();
        bootstrap.Modal.getInstance(document.getElementById('loginModal')).hide();
        showAlert('Вход выполнен', 'success');
    });
    
    document.getElementById('registerForm')?.addEventListener('submit', e => {
        e.preventDefault();
        bootstrap.Modal.getInstance(document.getElementById('registerModal')).hide();
        showAlert('Регистрация успешна', 'success');
    });
    
    // 5. Форма вопроса
    document.getElementById('questionForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        bootstrap.Modal.getInstance(document.getElementById('questionModal')).hide();
        this.reset();
        showAlert('Ваш вопрос отправлен! Мы ответим на Email.', 'success');
    });
}

function setupSizeSelection() {
    document.addEventListener('click', e => {
        if (e.target.classList.contains('size-badge')) {
            const id = e.target.dataset.productId;
            const size = e.target.dataset.size;
            
            document.querySelectorAll(`#sizes-container-${id} .size-badge`).forEach(b => b.classList.remove('selected'));
            e.target.classList.add('selected');
            localStorage.setItem(`size_${id}`, size);
        }
    });
}

function highlightSelectedSize(id, size) {
    const badge = document.querySelector(`#sizes-container-${id} .size-badge[data-size="${size}"]`);
    if(badge) badge.classList.add('selected');
}

function openOrderModal() {
    if(cart.length === 0) return showAlert('Корзина пуста', 'error');
    
    const total = cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
    const delivery = total >= 5000 ? 0 : 300;
    
    document.getElementById('orderTotal').textContent = formatPrice(total);
    document.getElementById('orderDelivery').textContent = delivery === 0 ? 'Бесплатно' : formatPrice(delivery);
    document.getElementById('orderFinalTotal').textContent = formatPrice(total + delivery);
    
    new bootstrap.Modal(document.getElementById('orderModal')).show();
}

function processOrder(e) {
    e.preventDefault();
    const modal = bootstrap.Modal.getInstance(document.getElementById('orderModal'));
    modal.hide();
    
    cart = [];
    updateAllCartViews();
    document.getElementById('orderForm').reset();
    
    showAlert(`Заказ MONO-${Date.now().toString().slice(-6)} успешно оформлен!`, 'success');
}

function resetFilters() {
    currentFilter = 'all';
    currentSearch = '';
    document.getElementById('searchInput').value = '';
    document.querySelectorAll('.category-filter').forEach(b => b.classList.remove('active'));
    renderProducts();
}

function formatPrice(p) {
    return new Intl.NumberFormat('ru-RU').format(p) + ' ₽';
}

function showAlert(msg, type) {
    const id = type === 'success' ? 'successAlert' : 'errorAlert';
    let el = document.getElementById(id);
    
    if (el) {
        el.innerHTML = msg;
        el.classList.remove('d-none');
        el.style.display = 'block';
        setTimeout(() => { el.style.display = 'none'; }, 3000);
    }
}

function scrollToProducts() {
    const productsSection = document.getElementById('products');
    if (productsSection) {
        const headerOffset = 80; 
        const elementPosition = productsSection.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.scrollY - headerOffset;

        window.scrollTo({
            top: offsetPosition,
            behavior: "smooth"
        });
    }
}

// Экспорт функций
window.addToCart = addToCart;
window.updateCartQuantity = updateCartQuantity;
window.removeFromCart = removeFromCart;
window.toggleFavorite = toggleFavorite;
window.removeFromFavorites = removeFromFavorites;
window.resetFilters = resetFilters;
window.addToCompare = addToCompare;
window.openCompareModal = openCompareModal;
window.removeFromCompare = removeFromCompare;
window.clearComparison = clearComparison;
window.openQuestionModal = openQuestionModal;
window.shareProduct = shareProduct;
window.scrollToProducts = scrollToProducts;
window.addAllFavoritesToCart = addAllFavoritesToCart;