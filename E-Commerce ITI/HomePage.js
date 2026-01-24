    const darkModeToggle = document.getElementById('dark-mode-toggle');
        darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
    darkModeToggle.classList.toggle('fa-moon');
    darkModeToggle.classList.toggle('fa-sun');
        });

    const hamburger = document.getElementById('hamburger');
    const sidebar = document.getElementById('sidebar');
    const closeSidebar = document.getElementById('close-sidebar');

        hamburger.addEventListener('click', () => {
        sidebar.classList.add('open');
        });

        closeSidebar.addEventListener('click', () => {
        sidebar.classList.remove('open');
        });

        document.addEventListener('click', (e) => {
            if (!sidebar.contains(e.target) && !hamburger.contains(e.target)) {
        sidebar.classList.remove('open');
            }
        });

    const wishlistCounter = document.getElementById('wishlist-counter');
    const wishlistCountInDropdown = document.getElementById('wishlist-count');
    const wishlistIcons = document.querySelectorAll('.wishlist-icon');
    const wishlist = new Set(); 

    function loadWishlist() {
            const savedWishlist = localStorage.getItem('fashionhub_wishlist');
    if (savedWishlist) {
                const products = JSON.parse(savedWishlist);
                products.forEach(productId => {
        wishlist.add(productId);
    const icon = document.querySelector(`.wishlist-icon[data-product="${productId}"]`);
    if (icon) {
        icon.classList.add('active');
    icon.innerHTML = '<i class="fas fa-heart"></i>';
                    }
                });
    updateWishlistCounter();
            }
        }

    function updateWishlistCounter() {
        wishlistCounter.textContent = wishlist.size;
    wishlistCountInDropdown.textContent = wishlist.size;

    wishlistCounter.style.transform = 'scale(1.5)';
            setTimeout(() => {
        wishlistCounter.style.transform = 'scale(1)';
            }, 300);
        }

    function saveWishlist() {
        localStorage.setItem('fashionhub_wishlist', JSON.stringify([...wishlist]));
        }

    function toggleWishlist(productId, iconElement) {
            if (wishlist.has(productId)) {
        wishlist.delete(productId);
    iconElement.classList.remove('active');
    iconElement.innerHTML = '<i class="far fa-heart"></i>';
    showNotification('Product removed from wishlist', 'info');
            } else {
        wishlist.add(productId);
    iconElement.classList.add('active');
    iconElement.innerHTML = '<i class="fas fa-heart"></i>';
    showNotification('Product added to wishlist!', 'success');
            }

    updateWishlistCounter();
    saveWishlist();
        }

        wishlistIcons.forEach(icon => {
        icon.addEventListener('click', (e) => {
            e.stopPropagation(); 
            const productId = icon.getAttribute('data-product');
            toggleWishlist(productId, icon);
        });
        });

    const cartCounter = document.getElementById('cart-counter');
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    let cartCount = 0;

        addToCartButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.stopPropagation(); 
            cartCount++;
            cartCounter.textContent = cartCount;
            cartCounter.style.transform = 'scale(1.5)';
            setTimeout(() => {
                cartCounter.style.transform = 'scale(1)';
            }, 300);

            showNotification('Product added to cart!', 'success');
        });
        });

    const viewAllBtn = document.getElementById('view-all');
        viewAllBtn.addEventListener('click', () => {
        alert('Redirecting to all products page...');
        });

    const subscribeBtn = document.getElementById('subscribe-btn');
    const newsletterEmail = document.getElementById('newsletter-email');

        subscribeBtn.addEventListener('click', () => {
            if (newsletterEmail.value && newsletterEmail.value.includes('@')) {
        showNotification('Thank you for subscribing!', 'success');
    newsletterEmail.value = '';
            } else {
        showNotification('Please enter a valid email address.', 'error');
            }
        });

    const profileIcon = document.getElementById('profile-icon');
    const logoutBtn = document.getElementById('logout');
    const wishlistLink = document.getElementById('wishlist-link');
    const ordersLink = document.getElementById('orders-link');
    let isLoggedIn = false;

    function checkLoginStatus() {
            const user = localStorage.getItem('fashionhub_user');
    isLoggedIn = !!user;

    if (!isLoggedIn) {
        profileIcon.title = "Login / Register";
    logoutBtn.textContent = "Login";
            } else {
        profileIcon.title = "Profile";
    logoutBtn.textContent = "Logout";
            }
        }

        profileIcon.addEventListener('click', () => {
            if (!isLoggedIn) {
                const login = confirm("Please log in or register. Click OK for demo login.");
    if (login) {
        localStorage.setItem('fashionhub_user', 'demo_user');
    isLoggedIn = true;
    checkLoginStatus();
    showNotification('Successfully logged in!', 'success');
                }
            }
        });

        logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
    if (isLoggedIn) {
        localStorage.removeItem('fashionhub_user');
    isLoggedIn = false;
    checkLoginStatus();
    showNotification('Successfully logged out!', 'info');
            } else {
                const login = confirm("Please log in or register. Click OK for demo login.");
    if (login) {
        localStorage.setItem('fashionhub_user', 'demo_user');
    isLoggedIn = true;
    checkLoginStatus();
    showNotification('Successfully logged in!', 'success');
                }
            }
        });

        wishlistLink.addEventListener('click', (e) => {
        e.preventDefault();
            if (wishlist.size > 0) {
        showNotification(`You have ${wishlist.size} items in your wishlist!`, 'info');
            } else {
        showNotification('Your wishlist is empty!', 'info');
            }
        });

        ordersLink.addEventListener('click', (e) => {
        e.preventDefault();
    showNotification('Redirecting to orders page...', 'info');
        });

        document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.add-to-cart') && !e.target.closest('.wishlist-icon')) {
                const productTitle = card.querySelector('h3').textContent;
                showNotification(`Quick view: ${productTitle}`, 'info');
            }
        });
        });

        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId !== '#') {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                    sidebar.classList.remove('open');
                }
            }
        });
        });

    function showNotification(message, type) {
            const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
            }

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    background-color: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
    color: white;
    border-radius: 5px;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    animation: slideIn 0.3s ease-out;
    font-weight: 600;
    `;

    document.body.appendChild(notification);

    // Add animation keyframes
    const style = document.createElement('style');
    style.textContent = `
    @keyframes slideIn {
        from {transform: translateX(100%); opacity: 0; }
    to {transform: translateX(0); opacity: 1; }
                }
    `;
    document.head.appendChild(style);

            // Remove notification after 3 seconds
            setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out forwards';
                setTimeout(() => notification.remove(), 300);
            }, 3000);
        }

    // Initialize
    checkLoginStatus();
    loadWishlist();
    updateWishlistCounter();
