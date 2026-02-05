const TAX_RATE = 0.08;
const SHIPPING_COST = 10.00;

document.addEventListener('DOMContentLoaded', function () {
    loadCartItems();
    setupEventListeners();
    updateNavbarCounters();
});

const cartNum = document.getElementById('cart-counter');
const wishNum = document.getElementById('wishlist-counter');

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

function setupEventListeners() {
    document.getElementById('order-form').addEventListener('submit', handleCheckout);

    document.getElementById('card-number').addEventListener('input', (e) => {
        formatCardNumber(e);
        validateFieldRealtime('card-number');
    });
    document.getElementById('expiry').addEventListener('input', (e) => {
        formatExpiry(e);
        validateFieldRealtime('expiry');
    });
    document.getElementById('cvv').addEventListener('input', (e) => {
        formatCVV(e);
        validateFieldRealtime('cvv');
    });

    const phoneField = document.getElementById('phone');
    if (phoneField) {
        phoneField.addEventListener('input', (e) => {
            formatPhone(e);
            validateFieldRealtime('phone');
        });
    }

    const zipField = document.getElementById('zip');
    if (zipField) {
        zipField.addEventListener('input', (e) => {
            formatZip(e);
            validateFieldRealtime('zip');
        });
    }

    // Real-time validation on blur for all fields
    const validationFields = ['first-name', 'last-name', 'email', 'phone', 'address', 'city', 'state', 'zip', 'country', 'card-name', 'card-number', 'expiry', 'cvv'];
    validationFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('blur', () => validateField(fieldId));
        }
    });

    document.querySelectorAll('input[name="payment"]').forEach(radio => {
        radio.addEventListener('change', togglePaymentMethod);
    });

    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function () {
            document.body.classList.toggle('dark-mode');
            localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
        });

        if (localStorage.getItem('darkMode') === 'true') {
            document.body.classList.add('dark-mode');
        }
    }
}

function loadCartItems() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://localhost:3000/cart/', true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const cart = JSON.parse(xhr.responseText);
            displayItems(cart);
            calculateTotals(cart);
        }
    };
    xhr.send();
}

function displayItems(cart) {
    const itemsList = document.getElementById('items-list');
    itemsList.innerHTML = '';

    if (cart.length === 0) {
        itemsList.innerHTML = '<p style="text-align: center; color: #999;">Cart is empty</p>';
        return;
    }

    cart.forEach(item => {
        const price = item.numericPrice || parseFloat(item.price) || 0;
        const total = price * (item.quantity || 1);
        const row = document.createElement('div');
        row.className = 'item-row';
        row.innerHTML = `
            <span class="item-name">${item.name} x${item.quantity}</span>
            <span class="item-price">$${total.toFixed(2)}</span>
        `;
        itemsList.appendChild(row);
    });
}

function calculateTotals(cart) {
    const subtotal = cart.reduce((sum, item) => {
        const price = item.numericPrice || parseFloat(item.price) || 0;
        return sum + (price * (item.quantity || 1));
    }, 0);
    const tax = subtotal * TAX_RATE;
    const total = subtotal + tax + SHIPPING_COST;

    document.getElementById('subtotal').innerText = subtotal.toFixed(2);
    document.getElementById('tax').innerText = tax.toFixed(2);
    document.getElementById('total').innerText = total.toFixed(2);
}

function formatCardNumber(e) {
    let value = e.target.value.replace(/\s/g, '');
    value = value.match(/.{1,4}/g)?.join(' ') || value;
    e.target.value = value;
}

function formatExpiry(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
    }
    e.target.value = value;
}

function formatCVV(e) {
    e.target.value = e.target.value.replace(/\D/g, '').substring(0, 3);
}

function formatPhone(e) {
    let value = e.target.value.replace(/\D/g, '');
    e.target.value = value;
}

function formatZip(e) {
    let value = e.target.value.replace(/[^a-zA-Z0-9\-\s]/g, '').toUpperCase();
    value = value.substring(0, 10);
    e.target.value = value;
}

function togglePaymentMethod() {
    const payment = document.querySelector('input[name="payment"]:checked').value;
    const cardSection = document.getElementById('card-section');
    cardSection.style.display = payment === 'card' ? 'block' : 'none';
}

function handleCheckout(e) {
    e.preventDefault();

    if (!validateForm()) return;

    const userData = localStorage.getItem('userData');
    const user = userData ? JSON.parse(userData) : null;

    const orderId = Date.now();

    // Get cart items
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://localhost:3000/cart/', true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const cartItems = JSON.parse(xhr.responseText);

            const orderData = {
                _id: orderId.toString(),
                id: orderId,
                status: 'pending',
                createdAt: new Date().toISOString(),
                shippingAddress: {
                    details: document.getElementById('address').value,
                    phone: document.getElementById('phone').value,
                    city: document.getElementById('city').value
                },
                paymentMethodType: document.querySelector('input[name="payment"]:checked').value,
                totalOrderPrice: parseFloat(document.getElementById('total').innerText.replace(/[^0-9.-]+/g, '')),
                isDelivered: false,
                user: user ? {
                    _id: user._id || user.id || '',
                    name: user.name || '',
                    email: user.email || document.getElementById('email').value,
                    phone: document.getElementById('phone').value
                } : {
                    _id: '',
                    name: document.getElementById('first-name').value + ' ' + document.getElementById('last-name').value,
                    email: document.getElementById('email').value,
                    phone: document.getElementById('phone').value
                },
                cartItems: cartItems.map(item => ({
                    count: item.quantity || 1,
                    _id: item.id || item._id,
                    title: item.title,
                    price: item.price || item.numericPrice || 0,
                    product: {
                        _id: item.id || item._id,
                        title: item.title,
                        imageCover: item.image || item.imageCover,
                        price: item.price || item.numericPrice || 0
                    }
                }))
            };

            submitOrder(orderData, orderId);
        }
    };
    xhr.send();
}

function submitOrder(orderData, orderId) {
    var xhrPost = new XMLHttpRequest();
    xhrPost.open('POST', 'http://localhost:3000/orders', true);
    xhrPost.setRequestHeader('Content-Type', 'application/json');
    xhrPost.onreadystatechange = function () {
        if (xhrPost.readyState === 4) {
            clearCart(orderId);
        }
    };
    xhrPost.send(JSON.stringify(orderData));
}

function validateForm() {
    clearAllErrors();
    const fields = ['first-name', 'last-name', 'email', 'phone', 'address', 'city', 'state', 'zip', 'country'];

    let isValid = true;
    fields.forEach(fieldId => {
        if (!validateField(fieldId)) {
            isValid = false;
        }
    });

    if (document.querySelector('input[name="payment"]:checked').value === 'card') {
        const cardFields = ['card-name', 'card-number', 'expiry', 'cvv'];
        cardFields.forEach(fieldId => {
            if (!validateField(fieldId)) {
                isValid = false;
            }
        });
    }

    return isValid;
}

function showError(fieldId, message) {
    const input = document.getElementById(fieldId);
    const errorEl = document.getElementById(fieldId + '-error');
    input.classList.add('error');
    input.classList.remove('success');
    if (errorEl) errorEl.innerText = message;
}

function showSuccess(fieldId) {
    const input = document.getElementById(fieldId);
    const errorEl = document.getElementById(fieldId + '-error');
    input.classList.remove('error');
    input.classList.add('success');
    if (errorEl) errorEl.innerText = '';
}

function clearAllErrors() {
    document.querySelectorAll('.form-input').forEach(input => {
        input.classList.remove('error', 'success');
    });
    document.querySelectorAll('.error-message').forEach(msg => {
        msg.innerText = '';
    });
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^(\+20|0020|0)?1[0125][0-9]{8}$/;
    return phoneRegex.test(phone);
}

function isValidZip(zip) {
    return /^[a-zA-Z0-9\s\-]{5,10}$/.test(zip);
}

function isValidCardNumber(num) {
    if (!/^\d{16}$/.test(num)) return false;
    let sum = 0;
    let isEven = false;
    for (let i = num.length - 1; i >= 0; i--) {
        let digit = parseInt(num[i], 10);
        if (isEven) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
        isEven = !isEven;
    }
    return sum % 10 === 0;
}

function isValidExpiry(expiry) {
    const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    return expiryRegex.test(expiry);
}

function clearCart(orderId) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://localhost:3000/cart/', true);
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const cart = JSON.parse(xhr.responseText);
            cart.forEach(item => {
                var deleteXhr = new XMLHttpRequest();
                deleteXhr.open('DELETE', `http://localhost:3000/cart/${item.id}`, true);
                deleteXhr.send();
            });
            goToThankYou(orderId);
        }
    };
    xhr.send();
}

function goToThankYou(orderId) {
    const orderDate = new Date().toISOString();
    const orderTotal = document.getElementById('total').innerText;

    window.location.href = `thankyou.html?orderId=${orderId}&orderDate=${orderDate}&orderTotal=${orderTotal}`;
}

function goToHome() {
    window.location.href = 'HomePage.html';
}

function goToCart() {
    window.location.href = 'cart.html';
}

function goToWishlist() {
    window.location.href = 'wishlist.html';
}
function validateField(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return true;

    const value = field.value.trim();
    let isValid = true;
    let errorMsg = '';

    switch (fieldId) {
        case 'first-name':
        case 'last-name':
            if (!value) {
                errorMsg = 'This field is required';
                isValid = false;
            } else if (value.length < 2) {
                errorMsg = 'Must be at least 2 characters';
                isValid = false;
            } else if (!/^[a-zA-Z\s'-]+$/.test(value)) {
                errorMsg = 'Only letters, spaces, and hyphens allowed';
                isValid = false;
            }
            break;

        case 'email':
            if (!value) {
                errorMsg = 'Email is required';
                isValid = false;
            } else if (!isValidEmail(value)) {
                errorMsg = 'Invalid email format';
                isValid = false;
            }
            break;

        case 'phone':
            if (!value) {
                errorMsg = 'Phone is required';
                isValid = false;
            } else if (!isValidPhone(value)) {
                errorMsg = 'Must be 10+ digits';
                isValid = false;
            }
            break;

        case 'address':
            if (!value) {
                errorMsg = 'Address is required';
                isValid = false;
            } else if (value.length < 5) {
                errorMsg = 'Address too short (min 5 characters)';
                isValid = false;
            }
            break;

        case 'city':
        case 'state':
        case 'country':
            if (!value) {
                errorMsg = 'This field is required';
                isValid = false;
            } else if (value.length < 2) {
                errorMsg = 'Must be at least 2 characters';
                isValid = false;
            }
            break;

        case 'zip':
            if (!value) {
                errorMsg = 'ZIP code is required';
                isValid = false;
            } else if (!isValidZip(value)) {
                errorMsg = 'ZIP must be 5-10 characters';
                isValid = false;
            }
            break;

        case 'card-name':
            if (!value) {
                errorMsg = 'Cardholder name is required';
                isValid = false;
            } else if (value.length < 3) {
                errorMsg = 'Name too short (min 3 characters)';
                isValid = false;
            }
            break;

        case 'card-number':
            const cardNum = value.replace(/\s/g, '');
            if (!cardNum) {
                errorMsg = 'Card number is required';
                isValid = false;
            } else if (cardNum.length !== 16) {
                errorMsg = `${cardNum.length}/16 digits`;
                isValid = false;
            } else if (!isValidCardNumber(cardNum)) {
                errorMsg = 'Invalid card number';
                isValid = false;
            }
            break;

        case 'expiry':
            if (!value) {
                errorMsg = 'Expiry date is required';
                isValid = false;
            } else if (!isValidExpiry(value)) {
                errorMsg = 'Use MM/YY format';
                isValid = false;
            } else if (isExpired(value)) {
                errorMsg = 'Card has expired';
                isValid = false;
            }
            break;

        case 'cvv':
            if (!value) {
                errorMsg = 'CVV is required';
                isValid = false;
            } else if (!/^\d{3,4}$/.test(value)) {
                errorMsg = 'CVV must be 3-4 digits';
                isValid = false;
            }
            break;
    }

    if (isValid) {
        showSuccess(fieldId);
    } else {
        showError(fieldId, errorMsg);
    }

    return isValid;
}

function validateFieldRealtime(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field || !field.value) {
        clearFieldError(fieldId);
        return;
    }

    if (fieldId === 'card-number') {
        const cardNum = field.value.replace(/\s/g, '');
        if (cardNum.length === 16 && !isValidCardNumber(cardNum)) {
            showError(fieldId, 'Invalid card number');
        } else if (cardNum.length < 16) {
            clearFieldError(fieldId);
        }
    } else if (fieldId === 'email' && field.value.includes('@')) {
        if (!isValidEmail(field.value.trim())) {
            showError(fieldId, 'Invalid email format');
        } else {
            showSuccess(fieldId);
        }
    }
}

function clearFieldError(fieldId) {
    const input = document.getElementById(fieldId);
    const errorEl = document.getElementById(fieldId + '-error');
    input.classList.remove('error', 'success');
    if (errorEl) errorEl.innerText = '';
}

function isExpired(expiry) {
    const [month, year] = expiry.split('/');
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear() % 100;
    const currentMonth = currentDate.getMonth() + 1;

    const expiryYear = parseInt(year);
    const expiryMonth = parseInt(month);

    if (expiryYear < currentYear) return true;
    if (expiryYear === currentYear && expiryMonth < currentMonth) return true;
    return false;
}

// update wishlist counter

function updateNavbarCounters() {
    const userData = localStorage.getItem('userData');
    const userToken = localStorage.getItem('userToken');
    const user = userData ? JSON.parse(userData) : null;

    var xhrWish = new XMLHttpRequest();
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

    // update cart counter
    var xhrCart = new XMLHttpRequest();
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