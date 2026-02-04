var input = document.querySelector('.searchInput')
var tabs = document.querySelectorAll('.tabs li')
var heading = document.querySelector('.heading')
var logOut = document.querySelector('.logOut')
var profile = document.querySelector('.profile-card')
var orders = document.querySelector('.ordersTable')
var allOrders = []
var productsData = document.querySelector('.productsTable')
var allProducts = []
var categoriesData = document.querySelector('.categoriesTable')
var allCategories = []

var deletePopup = document.querySelector('#deletePopup')
var deletePopupDeletebtn = document.querySelector('.deletePopupDeletebtn')
var closeDeletePopup = document.querySelector('.deletePopupCancelbtn')
var closeDeletePopupIcon = document.querySelector('.closeDeletePopupIcon')

var productPopup = document.querySelector('#productPopup')
var productPopupSubmitbtn = document.querySelector('.productPopupSubmitbtn')
var closeProductPopupbtn = document.querySelector('.closeProductPopup')
var closeProductPopupIcon = document.querySelector('.closeProductPopupIcon')

var productPopupHeading = document.querySelector('#productPopupTitle')
var productForm = document.querySelector('#productForm')
var addProductBtn = document.querySelector('.addProductBtn')

var categoryPopup = document.querySelector('#categoryPopup')
var categoryForm = document.querySelector('#categoryForm')
var closeCategoryPopupIcon = document.querySelector('.closeCategoryPopupIcon')
var categoryPopupTitle = document.querySelector('#categoryPopupTitle')
var closeCategoryPopupbtn = document.querySelector('.closeCategoryPopup')
var categoryPopupSubmitbtn = document.querySelector('.categoryPopupSubmitbtn')
var addCategoryBtn = document.querySelector('.addCategoryBtn')


var userData = localStorage.getItem('userData');
userData = JSON.parse(userData);

// Set Username and Email for User in Header
profile.innerHTML = `
            <img src="../images/avatar.png" alt="userName Avatar" class="profile-img">
                        <div class="profile-info">
                            <h3 class="profile-name">${userData.name}</h3>
                            <p class="profile-email">${userData.email}</p>
                        </div>
            `

// Start of orders
function getOrders() {
    var http = new XMLHttpRequest()
    http.open('GET', 'http://localhost:3000/orders')
    http.setRequestHeader('Content-Type', 'application/json');
    http.addEventListener('readystatechange', function () {
        if (http.readyState == 4 && http.status == 200) {
            var response = http.responseText;
            response = JSON.parse(response)
            allOrders = response
            displayOrders(allOrders)
        }
    })
    http.send()
}

function displayOrders(customOrders) {
    orders.innerHTML = `
                <table>
                    <thead>
                        <tr>
                            <th>Order</th>
                            <th>Customer</th>
                            <th>Status</th>
                            <th>Total</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                       ${customOrders.map(
        order => `
                            <tr>
                            <td class="order-id">${order.id}</td>
                            <td>
                                <div class="customer">
                                    <img src="../images/avatar.png" alt="${order.user.name}">
                                    <span>${order.user.name}</span>
                                </div>
                            </td>
                            <td>
                            <div class="status-box">
                                <div class="status ${order.status}" onclick="toggleDropdown(this)">
                                    ${getStatusText(order.status)}
                                </div>
                                <div class="dropdown">
                                    <div onclick="changeOrderStatus('${order.id}', 'pending', 'Pending')">Pending</div>
                                    <div onclick="changeOrderStatus('${order.id}', 'confirmed', 'Confirmed')">Confirm</div>
                                    <div onclick="changeOrderStatus('${order.id}', 'rejected', 'Rejected')">Reject</div>
                                </div>
                            </div>
                        </td>
                            <td class='price'><span>EGP</span> ${order.totalOrderPrice.toLocaleString()}</td>
                            <td>${new Date(order.createdAt).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }
        )}</td>
                        </tr>
                        `
    ).join('')}
                    </tbody>
                </table>
            `
}
document.addEventListener('DOMContentLoaded', getOrders)

// End of orders


// Start of Auth
function checkAuth() {
    var userData = localStorage.getItem('userData')

    if (!userData) {
        window.location.replace('login.html')
        return;
    }
    userData = JSON.parse(userData)
    if (userData.email !== 'aymankhaled651@gmail.com') {
        window.location.replace('login.html')
        return;
    }
    document.body.classList.add('authenticated');
}
checkAuth()

logOut.addEventListener('click', function (e) {
    e.preventDefault();
    localStorage.clear()
    window.location.href = 'login.html'
})
// End of Auth


// Start of StatusDropdown
function toggleDropdown(element) {
    var dropdown = element.nextElementSibling

    document.querySelectorAll('.dropdown').forEach(d => {
        if (d !== dropdown) {
            d.classList.remove('show')
        }
    })
    dropdown.classList.toggle('show')
}

function getStatusText(status) {
    var statusMap = {
        'pending': 'Pending',
        'confirmed': 'Confirmed',
        'rejected': 'Rejected'
    }
    return statusMap[status] || 'Pending'
}
// End of StatusDropdown

function changeOrderStatus(orderId, newStatus, statusText) {
    var http = new XMLHttpRequest()
    http.open('PATCH', `http://localhost:3000/orders/${orderId}`)
    http.setRequestHeader('Content-Type', 'application/json')

    http.addEventListener('readystatechange', function () {
        if (http.readyState == 4 && http.status == 200) {
            var i = allOrders.findIndex(o => o.id == orderId)
            allOrders[i].status = newStatus

            displayOrders(allOrders)
            showToast(`Order status changed to ${statusText}`, 'success')
        } else
            showToast('Failed to update order status', 'error')
    })
    http.send(JSON.stringify({ status: newStatus }))
}

// Get Products from Api
function getProducts() {
    var http = new XMLHttpRequest()
    http.open('GET', 'http://localhost:3000/products')
    http.setRequestHeader('Content-Type', 'application/json');
    http.addEventListener('readystatechange', function () {
        if (http.readyState == 4 && http.status == 200) {
            var products = http.responseText
            allProducts = JSON.parse(products)
            displayProducts(allProducts)
        }
    })
    http.send()
}

// Display Products in Table in HTML
function displayProducts(products) {
    productsData.innerHTML =
        `
        <table>
                        <thead>
                            <tr>
                            <th>Product Name</th>
                            <th>Category</th>
                            <th>Brand</th>
                                <th>Description</th>
                                <th>Quantity</th>
                                <th>Price</th>
                                <th style="width: 50px;"></th>
                            </tr>
                        </thead>
                        <tbody>
                           ${products.map(
            product =>
                `
                                <tr data-id="${product.id}">
                                <td>
                                    <div class="product-name">
                                        <span>${product.title.substring(0, 20)}...</span>
                                    </div>
                                </td>
                                <td>
                                    <div class="category-name">
                                        <span>${product.category.name}</span>
                                    </div>
                                </td>
                                 <td>
                                    <div class="brand-name">
                                        <span>${product.brand.name}</span>
                                    </div>
                                </td>
                                <td>
                                    <div class="description">
                                        <span>${product.description.substring(0, 40)}...</span>
                                    </div>
                                </td>
                                <td>${product.quantity}</td>
                        <td class='price'><span>EGP</span> ${product.price.toLocaleString()}</td>
                                <td>
                                    <div class="crud">
                                        <button class="crud-btn" onclick='toggleCrud(this)'>⋯</button>
                                        <div class="crud-dropdown">
                                            <div onclick="updateProduct('${product.id}')">Edit</div>
                                            <div class="crud-delete" onclick="deleteProduct('${product.id}')">Delete</div>
                                        </div>
                                    </div>
                                </td>
                            </tr>`
        ).join('')}

                        </tbody>
                    </table>
    `
}
document.addEventListener('DOMContentLoaded', getProducts)

function getCategories() {
    var http = new XMLHttpRequest()
    http.open('GET', 'http://localhost:3000/categories')
    http.setRequestHeader('Content-Type', 'application/json');
    http.addEventListener('readystatechange', function () {
        if (http.readyState == 4 && http.status == 200) {
            var response = JSON.parse(http.responseText)
            allCategories = response
            console.log(allCategories)
            displayCategories(allCategories)
        }
    })
    http.send()
}

function displayCategories(categories) {
    categoriesData.innerHTML = `
        <table>
                        <thead>
                            <tr>
                            <th>Category Name</th>
                            <th style="width: 50px;"></th>
                            </tr>
                        </thead>
                        <tbody>
                           ${categories.map(
        category =>
            `
                                <tr data-id="${category.id}">
                                <td>
                                    <div class="category-name">
                                        <span>${category.name}</span>
                                    </div>
                                </td>
                                <td>
                                    <div class="crud">
                                        <button class="crud-btn" onclick='toggleCrud(this)'>⋯</button>
                                        <div class="crud-dropdown">
                                            <div onclick="updateCategoryPopup('${category.id}')">Edit</div>
                                            <div class="crud-delete" onclick="deleteCategory('${category.id}')">Delete</div>
                                        </div>
                                    </div>
                                </td>
                            </tr>`
    ).join('')}

                        </tbody>
                    </table>
    `
}

document.addEventListener('DOMContentLoaded', getCategories)

var categorytoUpdate
var isUpdateCategory = false
var categoryNameInput = document.querySelector('#categoryName')

function updateCategoryPopup(categoryID){
    var category = allCategories.find(c=>c.id == categoryID)
    isUpdateCategory = true
    categoryPopupTitle.textContent = 'Update Category'
    categoryPopupSubmitbtn.textContent = 'Update'
    categorytoUpdate = categoryID
    categoryNameInput.value = category.name
    categoryPopup.showModal();
    document.body.style.overflow = 'hidden'
}

function openAddCategory(){
    isUpdateCategory = false
    categoryPopupTitle.textContent = 'Add Category'
    categoryPopupSubmitbtn.textContent = 'Add'
    categoryPopup.showModal();
    document.body.style.overflow = 'hidden'

}

function closeCategoryPopup(){
    categoryPopup.close()
    document.body.style.overflow = ''
}

closeCategoryPopupIcon.addEventListener('click', closeCategoryPopup)
closeCategoryPopupbtn.addEventListener('click', closeCategoryPopup)

categoryForm.addEventListener('submit', function(e){
    e.preventDefault()
    var formData = {
        name: categoryNameInput.value
    }
    if(isUpdateCategory){
        confirmUpdateCategory(formData)
    }else {
        confirmAddCategory(formData)
    }
})

function confirmUpdateCategory(formData){
    var http = new XMLHttpRequest()
    http.open('PATCH', `http://localhost:3000/categories/${categorytoUpdate}`)
    http.setRequestHeader('Content-Type', 'application/json')
    http.addEventListener('readystatechange', function(){
        if(http.readyState == 4 && http.status == 200){
            var i = allCategories.findIndex(c=> c.id == categorytoUpdate)
            allCategories[i] = {...allCategories[i], ...formData}
            displayCategories(allCategories)
            closeCategoryPopup()
            showToast('Category updated successfully!', 'success')
        } else{
            showToast('Failed to update category', 'error')
        }
    })
    http.send(JSON.stringify(formData))
}

function confirmAddCategory(formData){
    var http = new XMLHttpRequest()
    http.open('POST',`http://localhost:3000/categories`)
    http.setRequestHeader('Content-Type', 'application/json')
    http.addEventListener('readystatechange', function(){
        if(http.readyState == 4 && (http.status == 200 || http.status == 201)){
            var newCategory = JSON.parse(http.responseText)
            allCategories.push(newCategory)
            displayCategories(allCategories)
            closeCategoryPopup()
            showToast('Category added successfully!', 'success')
        } else{
            showToast('Failed to add category', 'error')
        }
    })
    http.send(JSON.stringify(formData))
}

// Open and Close ... button to show Edit and delete buttons in products section
function toggleCrud(element) {
    var crudDropdown = element.nextElementSibling

    document.querySelectorAll('.crud-dropdown').forEach(d => {
        if (d !== crudDropdown) {
            d.classList.remove('show')
        }
    })
    crudDropdown.classList.toggle('show')
}

document.addEventListener('click', function (e) {
    if (!e.target.closest('.status-box')) {
        document.querySelectorAll('.dropdown').forEach(d => d.classList.remove('show'));
    }
    if (!e.target.closest('.crud')) {
        document.querySelectorAll('.crud-dropdown').forEach(d => d.classList.remove('show'));
    }

});

// Select Active Tab in sidebar
for (var tab of tabs) {
    tab.addEventListener('click', function (e) {
        document.querySelector('.tabs .active').classList.remove('active')
        e.currentTarget.classList.add('active')

        var sections = document.querySelectorAll('.container .section')
        for (var section of sections) {
            section.classList.remove('active')
        }
        var targetSection = this.getAttribute('data-title').toLowerCase()
        document.querySelector(`.${targetSection}`).classList.add('active')
        heading.innerHTML = e.target.getAttribute('data-title')
        input.placeholder = e.target.getAttribute('data-search')
        input.value = '';
        if (targetSection === 'orders') {
            displayOrders(allOrders);
            addProductBtn.style.bottom = '-50px'
            addCategoryBtn.style.bottom = '-50px'
        }
        else if (targetSection === 'products') {
            displayProducts(allProducts);
            addProductBtn.style.bottom = '25px'
            addCategoryBtn.style.bottom = '-50px'
        }
        else if (targetSection === 'categories') {
            displayCategories(allCategories);
            addProductBtn.style.bottom = '-50px'
            addCategoryBtn.style.bottom = '25px'
        }
    })

}

// Search in all sections => check the active section then search on it
input.addEventListener('input', function () {
    var searchValue = this.value.toLowerCase()

    var activeSection = document.querySelector('.section.active').classList[0]

    if (activeSection === 'orders') {
        var filteredOrders = allOrders.filter(order => {
            return order.user.name.toLowerCase().includes(searchValue) || order.id.toString().includes(searchValue) || order.totalOrderPrice.toString().includes(searchValue)
        })
        displayOrders(filteredOrders)
    }
    else if (activeSection === 'products') {
        var filteredProducts = allProducts.filter(product => {
            return product.title.toLowerCase().includes(searchValue) || product.category.name.toLowerCase().includes(searchValue) || product.price.toString().includes(searchValue)
        })
        displayProducts(filteredProducts)
    }
    else if (activeSection === 'categories') {
        var filteredCategories = allCategories.filter(category => {
            return category.name.toLowerCase().includes(searchValue)
        })
        displayCategories(filteredCategories)
    }
})

var itemToDelete;
var deleteType;

function deleteProduct(productID) {
    itemToDelete = productID
    deleteType = 'product'
    deletePopup.showModal()
    document.body.style.overflow = 'hidden'
}

function deleteCategory(categoryID) {
    itemToDelete = categoryID
    deleteType = 'category'
    deletePopup.showModal()
    document.body.style.overflow = 'hidden'
}

function closeDelPopup() {
    deletePopup.close();
    document.body.style.overflow = '';
}

closeDeletePopup.addEventListener('click', closeDelPopup)
closeDeletePopupIcon.addEventListener('click', closeDelPopup)

function confirmDelete() {
    var endpoint, successMessage;

    if (deleteType === 'product') {
        endpoint = `http://localhost:3000/products/${itemToDelete}`
        successMessage = 'Product deleted successfully!'
    } else if (deleteType === 'category') {
        endpoint = `http://localhost:3000/categories/${itemToDelete}`
        successMessage = 'Category deleted successfully!'
    }

    var http = new XMLHttpRequest();
    http.open('DELETE', endpoint)
    http.addEventListener('readystatechange', function () {
        if (http.readyState == 4 && http.status == 200) {

            if (deleteType === 'product') {
                allProducts = allProducts.filter(p => p.id !== Number(itemToDelete))
            } else if (deleteType === 'category') {
                allCategories = allCategories.filter(c => c._id !== itemToDelete)
            }
            var row = document.querySelector(`tr[data-id="${itemToDelete}"]`)
            row.remove()

            closeDelPopup()
            showToast(successMessage, 'success')
        } else {
            showToast('Failed to delete', 'error')
        }
    })
    http.send()
}

deletePopupDeletebtn.addEventListener('click', confirmDelete)

var producttoUpdate
var isUpdate = false

function updateProduct(productID) {
    isUpdate = true
    productPopupHeading.textContent = 'Update Product'
    productPopupSubmitbtn.textContent = 'Update'

    producttoUpdate = productID
    var product = allProducts.find(p => p.id == productID)
    document.querySelector('#productName').value = product.title
    document.querySelector('#productCategory').value = product.category.name
    document.querySelector('#productBrand').value = product.brand.name
    document.querySelector('#productPrice').value = product.price
    document.querySelector('#productQuantity').value = product.quantity
    document.querySelector('#productDescription').value = product.description

    productPopup.showModal()
    document.body.style.overflow = 'hidden'
}

function openAddProduct() {
    isUpdate = false
    productPopupHeading.textContent = 'Add Product'
    productPopupSubmitbtn.textContent = 'Add'
    productForm.reset()
    productPopup.showModal()
    document.body.style.overflow = 'hidden'
}

function closeProductPopup() {
    productPopup.close()
    document.body.style.overflow = ''
}

closeProductPopupIcon.addEventListener('click', closeProductPopup)
closeProductPopupbtn.addEventListener('click', closeProductPopup)

productForm.addEventListener('submit', function (e) {
    e.preventDefault()

    var formData = {
        title: document.querySelector('#productName').value,
        category: {
            name: document.querySelector('#productCategory').value
        },
        brand: {
            name: document.querySelector('#productBrand').value
        },
        price: document.querySelector('#productPrice').value,
        quantity: document.querySelector('#productQuantity').value,
        description: document.querySelector('#productDescription').value
    }

    if (isUpdate) {
        confirmUpdateProduct(formData)
    } else {
        confirmAddProduct(formData)
    }
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

function confirmUpdateProduct(formData) {
    var http = new XMLHttpRequest()
    http.open('PATCH', `http://localhost:3000/products/${producttoUpdate}`)
    http.setRequestHeader('Content-Type', 'application/json')
    http.addEventListener('readystatechange', function () {
        if (http.readyState == 4 && http.status == 200) {
            var i = allProducts.findIndex(p => p.id == producttoUpdate)
            allProducts[i] = { ...allProducts[i], ...formData }
            displayProducts(allProducts)
            closeProductPopup()
            showToast('Product Updated successfully!', 'success');
        }
        else {
            var response = JSON.parse(this.responseText);
            showToast(response.message || 'Failed to update product', 'error')
        }
    })
    http.send(JSON.stringify(formData))
}

function confirmAddProduct(formData) {
    var http = new XMLHttpRequest()
    http.open('POST', `http://localhost:3000/products`)
    http.setRequestHeader('Content-Type', 'application/json')
    http.addEventListener('readystatechange', function () {
        if (http.readyState == 4 && (http.status == 200 || http.status == 201)) {
            var newProduct = JSON.parse(http.responseText)
            allProducts.push(newProduct)
            displayProducts(allProducts)
            closeProductPopup()
            showToast('Product Added successfully!', 'success');
        }
        else {
            var response = JSON.parse(this.responseText);
            showToast(response.message || 'Failed to add product', 'error')
        }
    })
    http.send(JSON.stringify(formData))
}
