document.addEventListener('DOMContentLoaded', function () {
    const userToken = localStorage.getItem('userToken');
    const userData = localStorage.getItem('userData');

    if (!userToken || !userData) {
        alert('Please login first to view your wishlist. You will be redirected to the login page.');
        window.location.href = 'login.html';
        return;
    }

    loadWishlistData();
});

const cartNum = document.getElementById('cart-counter');
const wishNum = document.getElementById('wishlist-counter');

function updateNavbarCounters() {
    const userData = localStorage.getItem('userData');
    const userToken = localStorage.getItem('userToken');
    const user = userData ? JSON.parse(userData) : null;

    const xhrWish = new XMLHttpRequest();
    xhrWish.open('GET', 'http://localhost:3000/wishlist/', true);
    xhrWish.setRequestHeader('Authorization', 'Bearer ' + userToken);
    xhrWish.onreadystatechange = function () {
        if (xhrWish.readyState === 4 && xhrWish.status === 200) {
            const wishlist = JSON.parse(xhrWish.responseText);
            let filteredWishlist = wishlist;
            if (user && user.email) {
                filteredWishlist = wishlist.filter(item => item.userEmail === user.email);
            }
            if (wishNum) wishNum.innerText = filteredWishlist.length;
        }
    };
    xhrWish.send();

    const xhrCart = new XMLHttpRequest();
    xhrCart.open('GET', 'http://localhost:3000/cart/', true);
    xhrCart.setRequestHeader('Authorization', 'Bearer ' + userToken);
    xhrCart.onreadystatechange = function () {
        if (xhrCart.readyState === 4 && xhrCart.status === 200) {
            const cart = JSON.parse(xhrCart.responseText);
            let filteredCart = cart;
            if (user && user.email) {
                filteredCart = cart.filter(item => item.userEmail === user.email);
            }
            if (cartNum) cartNum.innerText = filteredCart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        }
    };
    xhrCart.send();
}

updateNavbarCounters();

function loadWishlistData() {
    const userData = localStorage.getItem('userData');
    const userToken = localStorage.getItem('userToken');
    const user = userData ? JSON.parse(userData) : null;

    const container = document.getElementById('wishlist-container');

    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://localhost:3000/wishlist/', true);
    xhr.setRequestHeader('Authorization', 'Bearer ' + userToken);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            let wishlist = JSON.parse(xhr.responseText);

            // Filter wishlist by logged-in user
            if (user && user.email) {
                wishlist = wishlist.filter(item => item.userEmail === user.email);
            }

            container.innerHTML = "";

            if (wishlist.length === 0) {
                container.innerHTML = "<h2>Your wishlist is empty!</h2>";
                return;
            }

            wishlist.forEach((item) => {
                const card = document.createElement('div');
                card.className = 'product-card';
                card.innerHTML = `
                    <div class="wishlist-icon" style="color: red;" onclick="removeFromWishlist('${item.id}')">
                        <i class="fas fa-trash"></i>
                    </div>
                    <img src="${item.image || 'default-image.jpg'}" alt="${item.name}">
                    <div class="product-info">
                        <h3>${item.name}</h3>
                        <div class="rating">★★★★★</div>
                        <p>${item.price}</p>
                        <button class="add-to-cart">Add to Cart</button>
                    </div>
                `;

                card.querySelector('.add-to-cart').onclick = function () {
                    addToCartFromWishlist(item);
                };

                container.appendChild(card);
            });
        }
    };
    xhr.send();
}

function addToCartFromWishlist(item) {
    const userData = localStorage.getItem('userData');
    const userToken = localStorage.getItem('userToken');
    const user = userData ? JSON.parse(userData) : null;
    if (!item.numericPrice && item.price) {
        item.numericPrice = parseFloat(item.price.replace('$', ''));
    }
    item.userEmail = user ? user.email : 'guest';

    const xhrGetCart = new XMLHttpRequest();
    xhrGetCart.open('GET', 'http://localhost:3000/cart/', true);
    xhrGetCart.setRequestHeader('Authorization', 'Bearer ' + userToken);
    xhrGetCart.onreadystatechange = function () {
        if (xhrGetCart.readyState === 4 && xhrGetCart.status === 200) {
            const cart = JSON.parse(xhrGetCart.responseText);
            const existingItem = cart.find(cartItem => cartItem.id === item.id);

            if (existingItem) {
                const xhrUpdate = new XMLHttpRequest();
                xhrUpdate.open('PATCH', `http://localhost:3000/cart/${existingItem.id}`, true);
                xhrUpdate.setRequestHeader('Content-Type', 'application/json');
                xhrUpdate.setRequestHeader('Authorization', 'Bearer ' + userToken);
                xhrUpdate.onreadystatechange = function () {
                    if (xhrUpdate.readyState === 4 && xhrUpdate.status === 200) {
                        updateNavbarCounters();
                        alert(`${item.name} quantity is now ${existingItem.quantity + 1}!`);
                    }
                };
                xhrUpdate.send(JSON.stringify({ quantity: existingItem.quantity + 1 }));
            } else {
                const itemToAdd = { ...item, quantity: 1 };
                const xhrAdd = new XMLHttpRequest();
                xhrAdd.open('POST', 'http://localhost:3000/cart/', true);
                xhrAdd.setRequestHeader('Content-Type', 'application/json');
                xhrAdd.setRequestHeader('Authorization', 'Bearer ' + userToken);
                xhrAdd.onreadystatechange = function () {
                    if (xhrAdd.readyState === 4 && xhrAdd.status === 200) {
                        updateNavbarCounters();
                        alert(`${item.name} added to cart (quantity: 1)!`);
                    }
                };
                xhrAdd.send(JSON.stringify(itemToAdd));
            }
        }
    };
    xhrGetCart.send();
}

function removeFromWishlist(id) {
    const userToken = localStorage.getItem('userToken');
    const xhr = new XMLHttpRequest();
    xhr.open('DELETE', 'http://localhost:3000/wishlist/' + id, true);
    xhr.setRequestHeader('Authorization', 'Bearer ' + userToken);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const updatedWishlist = JSON.parse(xhr.responseText);

            if (wishNum) wishNum.innerText = updatedWishlist.length;

            loadWishlistData();
        }
    };
    xhr.send();
}

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