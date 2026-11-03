// const productList = document.querySelector('#product-list')

// productList.addEventListener('click', (e)=>{
//   if (!e.target.classList.contains('buy-btn')) {
//     console.log('Kliknoles w tlo, nie w przycisk')
//     return
//   }

//   const productId=e.target.getAttribute('data-id')
//   console.log(`Do koszyka dodano produkt o id ${productId}`)
// })

// const addNewBtn = document.querySelector('#add-new-btn')

// addNewBtn.addEventListener('click', (e) => {
//   const newProduct = document.createElement('li')
//   newProduct.className = 'product-item'
//   newProduct.innerHTML = `Monitor <button class = 'buy-btn' data-id=
//     '999'>Kup</button>`
//   productList.appendChild(newProduct)
// })
// stopPropagation()

const products = [
  { id: 1, name: 'Laptop Pro', price: 4500, category: 'Elektronika' },
  { id: 2, name: 'Myszka Bezprzewodowa', price: 150, category: 'Elektronika' },
  { id: 3, name: 'Kawa Ziarnista 1kg', price: 70, category: 'Spozywcze' },
  { id: 4, name: 'Sluchawki Bluetooth', price: 300, category: 'Elektronika' },
  { id: 5, name: 'Czekolada Gorzka', price: 15, category: 'Spozywcze' },
  { id: 6, name: 'Monitor 27 cali', price: 1200, category: 'Elektronika' },
  { id: 7, name: 'Herbata zielona', price: 20, category: 'Spozywcze' },
];

const discountCodes = {
  RABAT10: 10,
  RABAT20: 20,
  STUDENT: 15,
};

const productListEl = document.getElementById('product-list');
const cartListEl = document.getElementById('cart-list');
const cartTotalEl = document.getElementById('cart-total');
const clearCartBtnEl = document.getElementById('clear-cart-btn');
const filtersEl = document.getElementById('filters');
const searchInputEl = document.getElementById('search-input');
const searchBtnEl = document.getElementById('search-btn');
const discountInputEl = document.getElementById('discount-input');
const discountBtnEl = document.getElementById('discount-btn');
const discountMessageEl = document.getElementById('discount-message');
const cartDiscountEl = document.getElementById('cart-discount');

let cart = loadCart();
let currentCategory = null;
let currentSearch = '';
let appliedCode = localStorage.getItem('discountCode');

function loadCart() {
  const saved = localStorage.getItem('cart');
  return saved ? JSON.parse(saved) : [];
}

function saveCart() {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function getFilteredProducts() {
  return products.filter((product) => {
    const matchesCategory =
      !currentCategory || product.category === currentCategory;
    const matchesSearch = product.name.toLowerCase().includes(currentSearch);
    return matchesCategory && matchesSearch;
  });
}

function displayProducts() {
  productListEl.textContent = '';

  for (const product of getFilteredProducts()) {
    const productEl = document.createElement('div');
    productEl.classList.add('product-item');
    productEl.textContent = `Nazwa: ${product.name}   Cena: ${product.price} PLN`;

    const buyBtnEl = document.createElement('button');
    buyBtnEl.textContent = 'Kup';
    buyBtnEl.classList.add('buy-btn');
    buyBtnEl.dataset.id = product.id;

    productEl.appendChild(buyBtnEl);
    productListEl.appendChild(productEl);
  }
}

function applyDiscountCode() {
  const code = discountInputEl.value.trim().toUpperCase();

  if (!discountCodes[code]) {
    discountMessageEl.textContent = 'Nieprawidłowy kod rabatowy';
    return;
  }

  appliedCode = code;
  localStorage.setItem('discountCode', code);
  discountMessageEl.textContent = `Zastosowano kod ${code} (-${discountCodes[code]}%)`;
  discountInputEl.value = '';
  displayCart();
}

function addToCart(productId) {
  const item = cart.find((item) => item.productId === productId);

  if (item) {
    item.qty++;
  } else {
    cart = [...cart, { productId: productId, qty: 1 }];
  }

  displayCart();
  saveCart();
}

function removeFromCart(productId) {
  const item = cart.find((item) => item.productId === productId);
  if (!item) return;

  item.qty--;

  if (item.qty === 0) {
    cart = cart.filter((item) => item.productId !== productId);
  }

  displayCart();
  saveCart();
}

function clearCart() {
  cart = [];
  appliedCode = null;
  displayCart();
  localStorage.removeItem('cart');
  localStorage.removeItem('discountCode');
  discountMessageEl.textContent = '';
}

function displayCart() {
  cartListEl.textContent = '';
  let total = 0;

  for (const item of cart) {
    const product = products.find((product) => product.id === item.productId);
    const itemTotal = product.price * item.qty;
    total += itemTotal;

    const cartItemEl = document.createElement('div');
    cartItemEl.classList.add('cart-item');
    cartItemEl.textContent = `${product.name} x ${item.qty} (${itemTotal} PLN)`;

    const removeBtnEl = document.createElement('button');
    removeBtnEl.textContent = 'Usun';
    removeBtnEl.classList.add('remove-item-btn');
    removeBtnEl.dataset.id = product.id;
    cartItemEl.appendChild(removeBtnEl);
    cartListEl.appendChild(cartItemEl);
  }

  const percent = appliedCode ? discountCodes[appliedCode] : 0;
  const discount = (total * percent) / 100;

  cartDiscountEl.textContent = discount.toFixed(2);
  cartTotalEl.textContent = (total - discount).toFixed(2);
}

filtersEl.addEventListener('click', (e) => {
  if (!e.target.classList.contains('filter-btn')) return;

  currentCategory = e.target.dataset.category || null;
  displayProducts();
});

searchBtnEl.addEventListener('click', () => {
  currentSearch = searchInputEl.value.toLowerCase();
  displayProducts();
});

productListEl.addEventListener('click', (e) => {
  if (!e.target.classList.contains('buy-btn')) return;
  addToCart(Number(e.target.dataset.id));
});

cartListEl.addEventListener('click', (e) => {
  if (!e.target.classList.contains('remove-item-btn')) return;
  removeFromCart(Number(e.target.dataset.id));
});

clearCartBtnEl.addEventListener('click', clearCart);

discountBtnEl.addEventListener('click', applyDiscountCode);

displayProducts();
displayCart();
