document.addEventListener('DOMContentLoaded', function () {
    loadProducts();

    const cartNum = document.getElementById('cart-counter');
    const wishNum = document.getElementById('wishlist-counter');

    let categoryName = "Women's Fashion";
    if (document.title.includes("Men")) {
        categoryName = "Men's Fashion";
    } else if (document.title.includes("kids'")) {
        categoryName = "Baby & Toys";
    }

    loadProducts(categoryName);


    const xhrWish = new XMLHttpRequest();
    xhrWish.open('GET', 'http://localhost:3000/wishlist/', true);
    xhrWish.onreadystatechange = function () {
        if (xhrWish.readyState === 4 && xhrWish.status === 200) {
            const wishlist = JSON.parse(xhrWish.responseText);
            if (wishNum) wishNum.innerText = wishlist.length;
        }
    };
    xhrWish.send();

    const xhrCart = new XMLHttpRequest();
    xhrCart.open('GET', 'http://localhost:3000/cart/', true);
    xhrCart.onreadystatechange = function () {
        if (xhrCart.readyState === 4 && xhrCart.status === 200) {
            const cart = JSON.parse(xhrCart.responseText);
            if (cartNum) cartNum.innerText = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        }
    };
    xhrCart.send();


    function loadProducts(category) {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', 'http://localhost:3000/products', true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && xhr.status === 200) {
                const products = JSON.parse(xhr.responseText);
                const filteredProducts = products.filter(product => product.category && product.category.name === category);
                renderProducts(filteredProducts);
            }
        };
        xhr.send();
    }

    function renderProducts(products) {
        const grid = document.getElementById('product-grid');
        grid.innerHTML = '';

        products.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.setAttribute('data-id', product._id);

            const rating = '★'.repeat(Math.round(product.ratingsAverage)) + '☆'.repeat(5 - Math.round(product.ratingsAverage));
            const price = product.priceAfterDiscount ? `$${product.priceAfterDiscount}` : `$${product.price}`;

            card.innerHTML = `
                <div class="wishlist-icon"><i class="far fa-heart"></i></div>
                <img src="${product.imageCover}" alt="${product.title}">
                <div class="product-info">
                    <h3>${product.title}</h3>
                    <div class="rating">${rating}</div>
                    <p>${price}</p>
                    <button class="add-to-cart" data-id="${product._id}">Add to Cart</button>
                </div>
            `;
            grid.appendChild(card);
        });

        const controls = document.querySelector('.catalog-controls span');
        if (controls) {
            controls.textContent = `Showing 1-${products.length} of ${products.length} products`;
        }

        attachEventListeners();
    }

    function attachEventListeners() {
        const addToCartButtons = document.querySelectorAll('.add-to-cart');
        const addToWishlistButtons = document.querySelectorAll('.wishlist-icon');

        addToCartButtons.forEach(button => {
            button.addEventListener('click', function () {
                const itemId = this.dataset.id;
                const card = this.closest('.product-card');
                const productData = {
                    id: itemId,
                    name: card.querySelector('h3').innerText,
                    price: card.querySelector('p').innerText,
                    image: card.querySelector('img').src
                };
                addItemToCart(productData);
            });
        });

        addToWishlistButtons.forEach(icon => {
            icon.addEventListener('click', function (e) {
                e.stopPropagation();
                e.preventDefault();
                const card = this.closest('.product-card');
                const productId = card.dataset.id;
                const productName = card.querySelector('h3').innerText;

                const isAdded = this.querySelector('i').classList.contains('fas');

                if (!isAdded) {
                    // ADD
                    const card = icon.closest('.product-card');
                    const productImage = card.querySelector('img').src;
                    const productPrice = card.querySelector('p').innerText;
                    const xhrAddWish = new XMLHttpRequest();
                    xhrAddWish.open('POST', 'http://localhost:3000/wishlist/', true);
                    xhrAddWish.setRequestHeader('Content-Type', 'application/json');
                    xhrAddWish.onreadystatechange = function () {
                        if (xhrAddWish.readyState === 4 && xhrAddWish.status === 200) {
                            const updatedWish = JSON.parse(xhrAddWish.responseText);
                            icon.querySelector('i').classList.replace('far', 'fas');
                            icon.querySelector('i').style.color = "red";
                            if (wishNum) wishNum.innerText = updatedWish.length;
                        }
                    };
                    xhrAddWish.send(JSON.stringify({ id: productId, name: productName, image: productImage, price: productPrice }));
                } else {
                    // REMOVE
                    const xhrRemWish = new XMLHttpRequest();
                    xhrRemWish.open('DELETE', 'http://localhost:3000/wishlist/' + productId, true);
                    xhrRemWish.onreadystatechange = function () {
                        if (xhrRemWish.readyState === 4 && xhrRemWish.status === 200) {
                            const updatedWish = JSON.parse(xhrRemWish.responseText);
                            icon.querySelector('i').classList.replace('fas', 'far');
                            icon.querySelector('i').style.color = "gray";
                            if (wishNum) wishNum.innerText = updatedWish.length;
                        }
                    };
                    xhrRemWish.send();
                }
            });
        });
    }

    function updateNavbarCounters() {
        // Update wishlist counter
        const xhrWish = new XMLHttpRequest();
        xhrWish.open('GET', 'http://localhost:3000/wishlist/', true);
        xhrWish.onreadystatechange = function () {
            if (xhrWish.readyState === 4 && xhrWish.status === 200) {
                const wishlist = JSON.parse(xhrWish.responseText);
                if (wishNum) wishNum.innerText = wishlist.length;
            }
        };
        xhrWish.send();

        // Update cart counter
        const xhrCart = new XMLHttpRequest();
        xhrCart.open('GET', 'http://localhost:3000/cart/', true);
        xhrCart.onreadystatechange = function () {
            if (xhrCart.readyState === 4 && xhrCart.status === 200) {
                const cart = JSON.parse(xhrCart.responseText);
                if (cartNum) cartNum.innerText = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
            }
        };
        xhrCart.send();
    }

    function addItemToCart(productData) {
        const numericPrice = parseFloat(productData.price.replace('$', ''));
        const itemToAdd = {
            id: productData.id,
            name: productData.name,
            price: productData.price,
            image: productData.image,
            numericPrice: numericPrice,
            quantity: 1
        };

        const xhrGetCart = new XMLHttpRequest();
        xhrGetCart.open('GET', 'http://localhost:3000/cart/', true);
        xhrGetCart.onreadystatechange = function () {
            if (xhrGetCart.readyState === 4 && xhrGetCart.status === 200) {
                const cart = JSON.parse(xhrGetCart.responseText);
                const existingItem = cart.find(item => item.id === productData.id);

                if (existingItem) {
                    // Update quantity
                    const xhrUpdate = new XMLHttpRequest();
                    xhrUpdate.open('PATCH', `http://localhost:3000/cart/${existingItem.id}`, true);
                    xhrUpdate.setRequestHeader('Content-Type', 'application/json');
                    xhrUpdate.onreadystatechange = function () {
                        if (xhrUpdate.readyState === 4 && xhrUpdate.status === 200) {
                            updateNavbarCounters();
                            alert(`${productData.name} quantity is now ${existingItem.quantity + 1}!`);
                        }
                    };
                    xhrUpdate.send(JSON.stringify({ quantity: existingItem.quantity + 1 }));
                } else {
                    // Add new item
                    const xhrAdd = new XMLHttpRequest();
                    xhrAdd.open('POST', 'http://localhost:3000/cart/', true);
                    xhrAdd.setRequestHeader('Content-Type', 'application/json');
                    xhrAdd.onreadystatechange = function () {
                        if (xhrAdd.readyState === 4 && xhrAdd.status === 200) {
                            updateNavbarCounters();
                            alert(`${productData.name} added to cart (quantity: 1)!`);
                        }
                    };
                    xhrAdd.send(JSON.stringify(itemToAdd));
                }
            }
        };
        xhrGetCart.send();
    }

    // Dark Mode
    const darkModeBtn = document.getElementById('dark-mode-toggle');
    if (darkModeBtn) {
        darkModeBtn.onclick = function () {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            darkModeBtn.classList.replace(isDark ? 'fa-moon' : 'fa-sun', isDark ? 'fa-sun' : 'fa-moon');
        };
    }

    //functions for navbar

    function goToCart() {
        window.location.href = 'cart.html';
    }

    function goToWishlist() {
        window.location.href = 'wishlist.html';
    }

    const cartIcon = document.querySelector('.fa-shopping-cart.icon');
    if (cartIcon) {
        cartIcon.addEventListener('click', goToCart);
    }

    const wishlistIcon = document.querySelector('.fa-heart.icon');
    if (wishlistIcon) {
        wishlistIcon.addEventListener('click', goToWishlist);
    }
});

