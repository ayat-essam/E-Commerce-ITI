document.addEventListener('DOMContentLoaded', function () {

    /////////////////// counters ////////////////////////

    const cartNum = document.getElementById('cart-counter');
    const wishNum = document.getElementById('wishlist-counter');

    let wishlist = JSON.parse(localStorage.getItem('userWishlist')) || [];
    if (wishNum) wishNum.innerText = wishlist.length;

    let countCart = 0;
    let countWish = 0;


    /////////////////////  cart  //////////////////////////

    const allCartBtns = document.querySelectorAll('.add-to-cart');

    allCartBtns.forEach(function (btn) {
        btn.onclick = function (e) {
            e.stopPropagation();

            const card = btn.closest('.product-card');
            const productData = {
                name: card.querySelector('h3').innerText,
                price: card.querySelector('p').innerText,
                image: card.querySelector('img').src,
                numericPrice: parseFloat(card.querySelector('p').innerText.replace('$', ''))
            };

            let cart = JSON.parse(localStorage.getItem('userCart')) || [];

            cart.push(productData);

            localStorage.setItem('userCart', JSON.stringify(cart));

            const cartNum = document.getElementById('cart-counter');
            if (cartNum) cartNum.innerText = cart.length;

            alert(productData.name + " added to cart!");
        };
    });

    ///////////////////  wish list  ///////////////////

    const allHearts = document.querySelectorAll('.product-card');

    allHearts.forEach(function (card) {
        const heartBtn = card.querySelector('.wishlist-icon');
        const icon = heartBtn.querySelector('i');
        const productName = card.querySelector('h3').innerText;

        // Check if item is already in wishlist 
        if (wishlist.some(item => item.name === productName)) {
            icon.classList.replace('far', 'fas');
            heartBtn.style.color = "red";
        }

        heartBtn.onclick = function (e) {
            e.stopPropagation();

            let currentWishlist = JSON.parse(localStorage.getItem('userWishlist')) || [];

            if (icon.classList.contains('far')) {
                // ADD TO WISHLIST
                icon.classList.replace('far', 'fas');
                heartBtn.style.color = "red";

                const productData = {
                    name: productName,
                    price: card.querySelector('p').innerText,
                    image: card.querySelector('img').src,
                    rating: card.querySelector('.rating').innerText
                };

                currentWishlist.push(productData);
            } else {
                // REMOVE FROM WISHLIST
                icon.classList.replace('fas', 'far');
                heartBtn.style.color = "gray";
                currentWishlist = currentWishlist.filter(item => item.name !== productName);
            }

            localStorage.setItem('userWishlist', JSON.stringify(currentWishlist));
            if (wishNum) wishNum.innerText = currentWishlist.length;
        };
    });
    /////////////////// Dark Mode  ///////////////////

    const darkModeBtn = document.getElementById('dark-mode-toggle');

    if (darkModeBtn) {
        darkModeBtn.onclick = function () {

            document.body.classList.toggle('dark-mode');

            if (document.body.classList.contains('dark-mode')) {
                darkModeBtn.classList.replace('fa-moon', 'fa-sun');
            } else {
                darkModeBtn.classList.replace('fa-sun', 'fa-moon');
            }
        };
    }
});


function goToWishlist() {
    window.location.href = "wishlist.html";
}

function goToCart() {
    window.location.href = "cart.html";

}

