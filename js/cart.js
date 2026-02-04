
document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('cart-container');
    const cart = JSON.parse(localStorage.getItem('userCart')) || [];
    const totalQty = document.getElementById('total-qty');
    const totalPriceDisp = document.getElementById('total-price');

    if (cart.length === 0) {
        container.innerHTML = "<h2>Your cart is empty.</h2>";
        return;
    }

    let totalSum = 0;

    cart.forEach((item, index) => {
        totalSum += item.numericPrice;
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
                    <div class="wishlist-icon" style="color: #ff4d4d;" onclick="removeFromCart(${index})">
                        <i class="fas fa-times-circle"></i>
                    </div>
                    <img src="${item.image}" alt="${item.name}">
                    <div class="product-info">
                        <h3>${item.name}</h3>
                        <p>${item.price}</p>
                    </div>
                `;
        container.appendChild(card);
    });

    totalQty.innerText = cart.length;
    totalPriceDisp.innerText = totalSum.toFixed(2);
});

function removeFromCart(index) {
    let cart = JSON.parse(localStorage.getItem('userCart')) || [];
    cart.splice(index, 1);
    localStorage.setItem('userCart', JSON.stringify(cart));
    location.reload();
}

function goToWishlist() {
    window.location.href = "wishlist.html";
}

function goToCart() {
    window.location.href = "cart.html";

}