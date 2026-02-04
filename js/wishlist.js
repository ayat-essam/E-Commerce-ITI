document.addEventListener('DOMContentLoaded', function () {
    const container = document.getElementById('wishlist-container');
    const wishlist = JSON.parse(localStorage.getItem('userWishlist')) || [];

    if (wishlist.length === 0) {
        container.innerHTML = "<h2>Your wishlist is empty!</h2>";
        return;
    }

    wishlist.forEach((item, index) => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
                    <div class="wishlist-icon" style="color: red;" onclick="removeFromWishlist('${item.name}')">
                        <i class="fas fa-trash"></i>
                    </div>
                    <img src="${item.image}" alt="${item.name}">
                    <div class="product-info">
                        <h3>${item.name}</h3>
                        <div class="rating">${item.rating}</div>
                        <p>${item.price}</p>
                        <button class="add-to-cart">Add to Cart</button>
                    </div>
                `;
        container.appendChild(card);
    });
});

function removeFromWishlist(name) {
    let wishlist = JSON.parse(localStorage.getItem('userWishlist')) || [];
    wishlist = wishlist.filter(item => item.name !== name);
    localStorage.setItem('userWishlist', JSON.stringify(wishlist));
    location.reload();
}

function goToWishlist() {
    window.location.href = "wishlist.html";
}

function goToCart() {
    window.location.href = "cart.html";

}