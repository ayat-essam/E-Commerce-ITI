var form = document.querySelector('form');

var email = document.querySelector('#email');
var emailError = document.querySelector('#email-error')

var password = document.querySelector('#password');
var passwordError = document.querySelector('#password-error')

var rememberMe = document.querySelector('#rememberMe')

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
    if (validateEmail() && validatePassword()) {
        var data = {
            email: email.value,
            password: password.value
        }
        loginUser(data)
    }
}

function loginUser(data) {
    var http = new XMLHttpRequest();
    http.open('POST', 'https://ecommerce.routemisr.com/api/v1/auth/signin');
    http.setRequestHeader('Content-Type', 'application/json');

    http.addEventListener('readystatechange', function () {
        if (this.readyState == 4 && this.status == 200) {
            var response = JSON.parse(this.responseText);
            localStorage.setItem('userToken', response.token);
            localStorage.setItem('userData', JSON.stringify(response.user));
            if (rememberMe.checked) {
                localStorage.setItem('savedEmail', data.email)
            }
            else {
                localStorage.removeItem('savedEmail')
            }
           showToast('Login successful!', 'success');
            setTimeout(function() {
                window.location.href = 'admin.html';
            }, 1500);
        }else {
            var response = JSON.parse(this.responseText);
            showToast(response.message, 'error');
            console.log(this.responseText)
        }
    })
    http.send(JSON.stringify(data))
}

window.addEventListener('load', function () {
    var savedEmail = this.localStorage.getItem('savedEmail')
    if (savedEmail) {
        email.value = savedEmail
        rememberMe.checked = true
    }
})