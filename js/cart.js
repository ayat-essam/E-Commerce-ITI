document.addEventListener('DOMContentLoaded', function () {
    loadCartData();
});

const cartNum = document.getElementById('cart-counter');
const wishNum = document.getElementById('wishlist-counter');

// update wishlist counter

function updateNavbarCounters() {
    var xhrWish = new XMLHttpRequest();
    xhrWish.open('GET', 'http://localhost:3000/wishlist/', true);
    xhrWish.onreadystatechange = function () {
        if (xhrWish.readyState === 4 && xhrWish.status === 200) {
            const wishlist = JSON.parse(xhrWish.responseText);
            if (wishNum) wishNum.innerText = wishlist.length;
        }
    };
    xhrWish.send();

    // update cart counter
    var xhrCart = new XMLHttpRequest();
    xhrCart.open('GET', 'http://localhost:3000/cart/', true);
    xhrCart.onreadystatechange = function () {
        if (xhrCart.readyState === 4 && xhrCart.status === 200) {
            const cart = JSON.parse(xhrCart.responseText);
            if (cartNum) cartNum.innerText = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
        }
    };
    xhrCart.send();


}

updateNavbarCounters();

function loadCartData() {
    const container = document.getElementById('cart-container');
    const totalQty = document.getElementById('total-qty');
    const totalPriceDisp = document.getElementById('total-price');

    const xhrCartData = new XMLHttpRequest();
    xhrCartData.open('GET', 'http://localhost:3000/cart/', true);
    xhrCartData.onreadystatechange = function () {
        if (xhrCartData.readyState === 4 && xhrCartData.status === 200) {
            const cart = JSON.parse(xhrCartData.responseText);

            container.innerHTML = "";

            if (cart.length === 0) {
                container.innerHTML = "<h2>Your cart is empty.</h2>";
                totalQty.innerText = "0";
                totalPriceDisp.innerText = "0.00";
                return;
            }

            let totalSum = 0;

            cart.forEach((item, index) => {
                totalSum += item.numericPrice * item.quantity;
                const card = document.createElement('div');
                card.className = 'product-card';
                card.innerHTML = `
                    <img src="${item.image}" alt="${item.name}">
                    <div class="product-info">
                        <h3>${item.name}</h3>
                        <p>${item.price}</p>
                        <div class="quantity-controls">
                            <button onclick="decreaseQuantity('${item.id}')">-</button>
                            <span>${item.quantity}</span>
                            <button onclick="increaseQuantity('${item.id}')">+</button>
                        </div>
                    </div>
                `;
                container.appendChild(card);
            });

            totalQty.innerText = cart.reduce((sum, item) => sum + item.quantity, 0);
            totalPriceDisp.innerText = totalSum.toFixed(2);
        }
    };
    xhrRender.send();
}

function increaseQuantity(itemId) {

    const xhrGet = new XMLHttpRequest();
    xhrGet.open('GET', `http://localhost:3000/cart/${itemId}`, true);
    xhrGet.onreadystatechange = function () {
        if (xhrGet.readyState === 4 && xhrGet.status === 200) {
            const item = JSON.parse(xhrGet.responseText);
            const newQuantity = item.quantity + 1;
            const xhrUpdate = new XMLHttpRequest();
            xhrUpdate.open('PATCH', `http://localhost:3000/cart/${itemId}`, true);
            xhrUpdate.setRequestHeader('Content-Type', 'application/json');
            xhrUpdate.onreadystatechange = function () {
                if (xhrUpdate.readyState === 4 && xhrUpdate.status === 200) {
                    loadCartData();
                    updateNavbarCounters();
                }
            };
            xhrUpdate.send(JSON.stringify({ quantity: newQuantity }));
        }
    };
    xhrGet.send();
}

function decreaseQuantity(itemId) {

    const xhrGet = new XMLHttpRequest();
    xhrGet.open('GET', `http://localhost:3000/cart/${itemId}`, true);
    xhrGet.onreadystatechange = function () {
        if (xhrGet.readyState === 4 && xhrGet.status === 200) {
            const item = JSON.parse(xhrGet.responseText);
            const newQuantity = item.quantity - 1;
            if (newQuantity > 0) {
                const xhrUpdate = new XMLHttpRequest();
                xhrUpdate.open('PATCH', `http://localhost:3000/cart/${itemId}`, true);
                xhrUpdate.setRequestHeader('Content-Type', 'application/json');
                xhrUpdate.onreadystatechange = function () {
                    if (xhrUpdate.readyState === 4 && xhrUpdate.status === 200) {
                        loadCartData();
                        updateNavbarCounters();
                    }
                };
                xhrUpdate.send(JSON.stringify({ quantity: newQuantity }));
            } else {

                const xhrDelete = new XMLHttpRequest();
                xhrDelete.open('DELETE', `http://localhost:3000/cart/${itemId}`, true);
                xhrDelete.onreadystatechange = function () {
                    if (xhrDelete.readyState === 4 && xhrDelete.status === 200) {
                        loadCartData();
                        updateNavbarCounters();
                    }
                };
                xhrDelete.send();
            }
        }
    };
    xhrGet.send();
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