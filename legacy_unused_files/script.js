// ============================================
// FUO EATS - JavaScript
// Cart, Filtering, UI Interactions
// ============================================

// ── CART STATE ──
let cart = [];
let cartOpen = false;

/**
 * Toggle cart drawer open/closed
 */
function toggleCart(){
  cartOpen = !cartOpen;
  document.getElementById('cartDrawer').classList.toggle('open', cartOpen);
  document.getElementById('cartOverlay').classList.toggle('open', cartOpen);
}

/**
 * Add item to cart
 * @param {HTMLElement} btn - Button element clicked
 * @param {string} name - Item name
 * @param {number} price - Item price in Naira
 * @param {string} img - Item image URL
 */
function addToCart(btn, name, price, img){
  // Fix: price may be passed as string — handle safely
  price = parseInt(price);
  
  // Check if item already in cart
  const existing = cart.find(i => i.name === name);
  if(existing){ 
    existing.qty++; 
  } else { 
    cart.push({name, price, img, qty:1}); 
  }
  
  updateCartUI();
  
  // Button feedback animation
  btn.textContent = '✓';
  btn.style.background = 'var(--blue)';
  setTimeout(()=>{ 
    btn.textContent = '+'; 
    btn.style.background = ''; 
  }, 1000);
  
  showToast(name + ' added to cart 🛒');
  
  // Auto-open cart
  if(!cartOpen){ toggleCart(); }
}

/**
 * Update cart UI display
 */
function updateCartUI(){
  const count = cart.reduce((s,i)=>s+i.qty,0);
  document.getElementById('cartCount').textContent = count;
  
  const body = document.getElementById('cartBody');
  const total = cart.reduce((s,i)=>s+(i.price*i.qty),0);
  document.getElementById('cartTotal').textContent = '₦' + total.toLocaleString();

  if(cart.length === 0){
    body.innerHTML = '<div class="cart-empty"><p>🍽️</p><span>Your cart is empty.<br/>Add some delicious food!</span></div>';
    return;
  }

  body.innerHTML = cart.map((item,idx) => `
    <div class="cart-item">
      <img class="ci-img" src="${item.img}" alt="${item.name}"/>
      <div class="ci-txt">
        <h4>${item.name}</h4>
        <p>₦${(item.price * item.qty).toLocaleString()}</p>
        <div class="ci-qty">
          <button class="qbtn" onclick="changeQty(${idx},-1)">−</button>
          <span class="qnum">${item.qty}</span>
          <button class="qbtn" onclick="changeQty(${idx},1)">+</button>
        </div>
      </div>
      <button class="ci-del" onclick="removeItem(${idx})">🗑</button>
    </div>
  `).join('');
}

/**
 * Change item quantity in cart
 * @param {number} idx - Cart item index
 * @param {number} delta - Quantity change (+1 or -1)
 */
function changeQty(idx, delta){
  cart[idx].qty += delta;
  if(cart[idx].qty < 1) cart.splice(idx,1);
  updateCartUI();
}

/**
 * Remove item from cart
 * @param {number} idx - Cart item index
 */
function removeItem(idx){
  cart.splice(idx,1);
  updateCartUI();
  showToast('Item removed from cart');
}

/**
 * Checkout - finalize order
 */
function checkout(){
  if(cart.length === 0){ 
    showToast('Your cart is empty!'); 
    return; 
  }
  showToast('🎉 Order placed! Delivery in 20–30 mins');
  cart = [];
  updateCartUI();
  toggleCart();
}

// ── FILTER TABS (CATEGORY BAR) ──
/**
 * Filter menu by category
 * @param {string} cat - Category to show
 * @param {HTMLElement} el - Category element clicked
 */
function filterMenu(cat, el){
  document.querySelectorAll('.cat').forEach(c=>c.classList.remove('active'));
  el.classList.add('active');
  
  const secMap = {
    all:['rice','swallow','pepper','drinks'],
    rice:['rice'],
    swallow:['swallow'],
    pepper:['pepper'],
    drinks:['drinks']
  };
  
  const show = secMap[cat] || ['rice','swallow','pepper','drinks'];
  ['rice','swallow','pepper','drinks'].forEach(s=>{
    const el2 = document.getElementById('sec-'+s);
    if(el2) el2.style.display = show.includes(s)?'block':'none';
  });
}

/**
 * Switch menu tabs
 * @param {string} tab - Tab to show
 * @param {HTMLElement} el - Tab element clicked
 */
function switchTab(tab, el){
  document.querySelectorAll('.mtab').forEach(t=>t.classList.remove('active'));
  el.classList.add('active');
  
  const secMap = {
    all:['rice','swallow','pepper','drinks'],
    rice:['rice'],
    swallow:['swallow'],
    pepper:['pepper'],
    drinks:['drinks']
  };
  
  const show = secMap[tab] || ['rice','swallow','pepper','drinks'];
  ['rice','swallow','pepper','drinks'].forEach(s=>{
    const el2 = document.getElementById('sec-'+s);
    if(el2) el2.style.display = show.includes(s)?'block':'none';
  });
}

// ── FILTER PILLS ──
/**
 * Set active filter pill
 * @param {HTMLElement} btn - Pill button clicked
 */
function setPill(btn){
  document.querySelectorAll('.pill').forEach(p=>p.classList.remove('active'));
  btn.classList.add('active');
}

// ── PEPPER SOUP TAGS ──
/**
 * Select protein option for pepper soup
 * @param {HTMLElement} tag - Tag element clicked
 * @param {string} protein - Protein name
 */
function selectTag(tag, protein){
  const allTags = tag.parentElement.querySelectorAll('.ptag');
  allTags.forEach(t=>t.classList.remove('sel'));
  tag.classList.add('sel');
  showToast(protein + ' selected 🌶️');
}

// ── FAV TOGGLE ──
/**
 * Toggle favorite restaurant
 * @param {HTMLElement} btn - Favorite button
 */
function toggleFav(btn){
  if(btn.textContent === '♡'){ 
    btn.textContent = '♥'; 
    btn.style.color='red'; 
    showToast('Added to favourites ❤️'); 
  } else { 
    btn.textContent = '♡'; 
    btn.style.color=''; 
    showToast('Removed from favourites'); 
  }
}

// ── SEARCH ──
/**
 * Handle search functionality
 */
function doSearch(){
  const val = document.querySelector('.nav-srch input').value.trim();
  if(val) showToast('Searching for "'+val+'"...');
  else showToast('Type something to search 🔍');
}

// ── TOAST NOTIFICATIONS ──
let toastTimer;

/**
 * Show toast notification
 * @param {string} msg - Message to display
 */
function showToast(msg){
  clearTimeout(toastTimer);
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  toastTimer = setTimeout(()=>t.classList.remove('show'), 2800);
}

// ── SCROLL REVEAL ANIMATION ──
/**
 * Animate elements as they come into view (lazy reveal)
 */
const reveal = document.querySelectorAll('.fcard,.dcard,.rcard,.step,.promo,.cat');
const obs = new IntersectionObserver((entries)=>{
  entries.forEach((e,i)=>{
    if(e.isIntersecting){
      setTimeout(()=>{
        e.target.style.transition='opacity .4s ease,transform .4s ease';
        e.target.style.opacity='1';
        e.target.style.transform='translateY(0)';
      }, i*55);
      obs.unobserve(e.target);
    }
  });
},{threshold:.1});

reveal.forEach(el=>{ 
  el.style.opacity='0'; 
  el.style.transform='translateY(22px)'; 
  obs.observe(el); 
});

// ── GREETING & WELCOME ──
/**
 * Dynamic greeting based on time of day
 */
window.addEventListener('DOMContentLoaded',()=>{
  const h = new Date().getHours();
  let g = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  document.getElementById('heroH1').innerHTML = g + ', FUO! <span>What are you eating? 🍛</span>';
  setTimeout(()=> showToast('🎓 Welcome to FUO Eats — Knowledge, Excellence, Service!'), 900);
});
