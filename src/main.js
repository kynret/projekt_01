let products = [];
let categories = [];
const discountCodes = {
  RABAT10: 10,
  RABAT20: 20,
  STUDENT: 15,
};

const statusMsgEl = document.getElementById('status-message');
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

async function loadStoreData() {
  statusMsgEl.classList.remove('error');
  statusMsgEl.innerHTML = '⏳ Trwa ladowanie produktow...';
  try {
    const response = await fetch('https://fakestoreapi.com/products');
    if (!response.ok) throw new Error(response.status);

    const result = await response.json();
    products = [...products, ...result];
    categories = ['all', ...new Set(result.map((el) => el.category).sort())];
    statusMsgEl.innerHTML = '';
    displayProducts();
    displayCategories();
  } catch (error) {
    statusMsgEl.classList.add('error');
    statusMsgEl.innerHTML = `X Blad polaczenia: ${error.message}`;

    console.error(error.message);
  }
}

function displayCategories() {
  filtersEl.innerHTML = '';
  for (const category of categories) {
    const catBtnEl = document.createElement('button');
    catBtnEl.className = 'filter-btn';
    catBtnEl.dataset.category = category != 'all' ? category : '';
    catBtnEl.innerText = category.replace(
      category[0],
      category[0].toUpperCase(),
    );
    filtersEl.appendChild(catBtnEl);
  }
}

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
    const matchesSearch = product.title.toLowerCase().includes(currentSearch);
    return matchesCategory && matchesSearch;
  });
}

function displayProducts() {
  productListEl.textContent = '';

  for (const product of getFilteredProducts()) {
    const productEl = document.createElement('div');
    productEl.classList.add('product-item');

    const productImgEl = document.createElement('img');
    productImgEl.src = product.image;
    productImgEl.alt = product.title;

    const productInfoEl = document.createElement('p');
    productInfoEl.innerHTML = `Nazwa: ${product.title}<br> Cena: ${product.price}  PLN <br> Rating: ${product.rating.rate} ⭐  / ${product.rating.count} 👥 <br>`;

    const buyBtnEl = document.createElement('button');
    buyBtnEl.textContent = 'Kup';
    buyBtnEl.classList.add('buy-btn');
    buyBtnEl.dataset.id = product.id;

    productEl.appendChild(productImgEl);
    productEl.appendChild(productInfoEl);
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
    cartItemEl.textContent = `${product.title} x ${item.qty} (${itemTotal} PLN)`;

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

loadStoreData();
displayCart();
