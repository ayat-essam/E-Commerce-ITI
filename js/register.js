var form = document.querySelector('form');

var userName = document.querySelector('#name');
var nameError = document.querySelector('#name-error')

var email = document.querySelector('#email');
var emailError = document.querySelector('#email-error')

var phNumber = document.querySelector('#phNumber');
var phNumberError = document.querySelector('#phNumber-error')

var password = document.querySelector('#password');
var passwordError = document.querySelector('#password-error')

var rePassword = document.querySelector('#rePassword');
var rePasswordError = document.querySelector('#rePassword-error')


function validateName() {
    if (userName.value != '' && userName.value.length >= 3) {
        userName.style.border = '1px solid #10b981'
        nameError.style.display = 'none'
        return true;
    }
    else {
        userName.style.border = '1px solid #ef4444'
        nameError.style.display = 'flex'
        return false
    }
}

userName.addEventListener('blur', () => {
    validateName()
})

userName.addEventListener('input', () => {
    validateName()
})

function validateEmail() {
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (emailRegex.test(email.value)) {
        email.style.border = '1px solid #10b981'
        emailError.style.display = 'none'
        return true;
    }
    else {
        email.style.border = '1px solid #ef4444'
        emailError.style.display = 'flex'
        return false
    }
}

email.addEventListener('blur', () => {
    validateEmail()
})

email.addEventListener('input', () => {
    validateEmail()
})

function validatePhone() {
    var phoneRegex = /^01[0-2,5]{1}[0-9]{8}$/;

    if (phoneRegex.test(phNumber.value)) {
        phNumber.style.border = '1px solid #10b981'
        phNumberError.style.display = 'none'
        return true;
    }
    else {
        phNumber.style.border = '1px solid #ef4444'
        phNumberError.style.display = 'flex'
        return false
    }
}

phNumber.addEventListener('blur', () => {
    validatePhone()
})

phNumber.addEventListener('input', () => {
    validatePhone()
})

function validatePassword() {
    if (password.value != '' && password.value.length >= 8) {
        password.style.border = '1px solid #10b981'
        passwordError.style.display = 'none'
        return true
    }
    else {
        password.style.border = '1px solid #ef4444'
        passwordError.style.display = 'flex'
        return false
    }
}

password.addEventListener('blur', () => {
    validatePassword()
})

password.addEventListener('input', () => {
    validatePassword()
})

function validateRePassword() {
    if (password.value === rePassword.value && password.value != '') {
        rePassword.style.border = '1px solid #10b981'
        rePasswordError.style.display = 'none'
        return true
    }
    else {
        rePassword.style.border = '1px solid #ef4444'
        rePasswordError.style.display = 'flex'
        return false
    }
}

rePassword.addEventListener('blur', () => {
    validateRePassword()
})

rePassword.addEventListener('input', () => {
    validateRePassword()
})

function showToast(message, type) {
    var toast = document.getElementById('toast');
    var toastMessage = document.getElementById('toast-message');

    toastMessage.textContent = message;
    toast.className = 'toast show ' + type;

    setTimeout(function () {
        toast.classList.remove('show');
    }, 3000);
}

function submitForm(e) {
    e.preventDefault()

    if (validateName() && validateEmail() && validatePhone() && validatePassword() && validateRePassword()) {
        var data = {
            name: userName.value,
            email: email.value,
            phone: phNumber.value,
            password: password.value,
            rePassword: rePassword.value
        }
        registerUser(data)
    }
}

function registerUser(data) {
    var http = new XMLHttpRequest()
    http.open('POST', 'https://ecommerce.routemisr.com/api/v1/auth/signup')
    http.setRequestHeader('Content-Type', 'application/json');

    http.addEventListener('readystatechange', function () {
        if (this.readyState == 4 && this.status == 200) {
            showToast('Registration successful!', 'success');
            setTimeout(function () {
                window.location.href = 'login.html';
            }, 1500);
        }
        else if (this.status == 409) {
            showToast('This email is already registered!', 'error');
        }
        else {
            showToast(response.message, 'error');
        }
    })
    http.send(JSON.stringify(data));
}