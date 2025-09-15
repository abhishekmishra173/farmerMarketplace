// const translations = {
//   en: {
//     title: "Welcome",
//     description: "This is a demo website.",
//   },
//   mr: {
//     title: "स्वागत आहे",
//     description: "हे एक डेमो वेबसाइट आहे.",
//   }
// };

// const elementsToTranslate = ["title", "description"];

// document.getElementById("languageSelector").addEventListener("change", (event) => {
//   const selectedLang = event.target.value;
//   elementsToTranslate.forEach(id => {
//     const element = document.getElementById(id);
//     if (element) {
//       element.textContent = translations[selectedLang][id];
//     }
//   });
// });

//  app.js — minimal JS to power nav, smooth scroll, and a localStorage cart

(function () {
  // -------- Utilities --------
  const qs = (s, el = document) => el.querySelector(s);
  const qsa = (s, el = document) => [...el.querySelectorAll(s)];
  const moneyToNumber = (text) => Number(text.replace(/[^\d.]/g, '')) || 0;

  const storage = {
    get(key, fallback) {
      try { return JSON.parse(localStorage.getItem(key)) ?? fallback; }
      catch { return fallback; }
    },
    set(key, val) {
      localStorage.setItem(key, JSON.stringify(val));
    }
  };

  // -------- Smooth scroll for anchor links --------
  function enableSmoothScroll() {
    qsa('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const id = a.getAttribute('href');
        if (id.length > 1) {
          const target = qs(id);
          if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // close mobile nav if open
            const toggle = qs('#nav-toggle');
            if (toggle && toggle.checked) toggle.checked = false;
          }
        }
      });
    });
  }

  // -------- Cart state --------
  const CART_KEY = 'ff_cart_v1';
  let cart = storage.get(CART_KEY, []); // [{id, name, price, qty}]

  const cartAPI = {
    save() { storage.set(CART_KEY, cart); updateCartCount(); renderMiniCart(); },
    add(item) {
      const idx = cart.findIndex(i => i.id === item.id);
      if (idx > -1) cart[idx].qty += item.qty;
      else cart.push(item);
      this.save();
      toast(`Added ${item.name}`);
    },
    remove(id) {
      cart = cart.filter(i => i.id !== id);
      this.save();
    },
    updateQty(id, qty) {
      const it = cart.find(i => i.id === id);
      if (!it) return;
      it.qty = Math.max(1, qty);
      this.save();
    },
    clear() { cart = []; this.save(); }
  };

  // -------- Cart badge --------
  let cartBtn, cartCountEl;
  function mountCartButton() {
    cartBtn = document.createElement('button');
    cartBtn.type = 'button';
    cartBtn.className = 'ff-cart-btn';
    cartBtn.innerHTML = `
      <span class="ff-cart-icon" aria-hidden="true">🧺</span>
      <span class="ff-cart-text">Cart</span>
      <span class="ff-cart-count">0</span>
    `;
    document.body.appendChild(cartBtn);

    // quick styles (scoped, minimal)
    const style = document.createElement('style');
    style.textContent = `
      .ff-cart-btn{
        position: fixed; right: 18px; bottom: 18px; z-index: 60;
        display:inline-flex; align-items:center; gap:8px;
        padding:.6rem .9rem; border:none; border-radius:999px;
        background: radial-gradient(60% 120% at 30% 30%, #21d0e8, #14a3c0);
        color:#021017; font-weight:800; cursor:pointer;
        box-shadow: 0 8px 22px rgba(0,0,0,.35);
      }
      .ff-cart-count{
        background:#0b0e11; color:#e8eef5; border-radius:999px;
        padding:.1rem .45rem; font-size:12px; font-weight:800;
        border:1px solid rgba(255,255,255,.15);
      }
      .ff-toast{
        position:fixed; left:50%; bottom:86px; transform:translateX(-50%);
        background:#121721; color:#e8eef5; border:1px solid #273245; border-radius:12px;
        padding:.55rem .8rem; box-shadow:0 10px 26px rgba(0,0,0,.45);
        opacity:0; transition:opacity .2s ease, transform .2s ease; z-index:70;
      }
      .ff-toast.show{ opacity:1; transform:translateX(-50%) translateY(-4px); }
      .ff-mini-cart{
        position:fixed; right:18px; bottom:76px; width:min(360px, 92vw);
        background:#121721; color:#e8eef5; border:1px solid #273245; border-radius:14px;
        box-shadow:0 16px 40px rgba(0,0,0,.5); padding:10px; display:none; z-index:65;
      }
      .ff-mini-cart.open{ display:block; }
      .ff-mini-cart header{ display:flex; align-items:center; justify-content:space-between; padding:6px 6px 8px; border-bottom:1px solid #273245; }
      .ff-mini-list{ max-height:40vh; overflow:auto; display:grid; gap:10px; padding:10px 6px; }
      .ff-item{ display:grid; grid-template-columns:1fr auto; gap:8px; align-items:center; }
      .ff-item h4{ margin:0; font-size:14px; }
      .ff-item .meta{ color:#8ea0b5; font-size:12px; }
      .ff-qty{ display:inline-flex; align-items:center; gap:6px; }
      .ff-qty input{ width:46px; text-align:center; padding:.2rem .3rem; border-radius:8px; border:1px solid #273245; background:#0b0e11; color:#e8eef5; }
      .ff-remove{ background:transparent; border:1px solid #273245; color:#e8eef5; border-radius:10px; padding:.3rem .5rem; cursor:pointer; }
      .ff-mini-cart footer{ border-top:1px solid #273245; padding:10px 6px 6px; display:grid; gap:8px; }
      .ff-row{ display:flex; align-items:center; justify-content:space-between; }
      .ff-pay{ display:inline-flex; align-items:center; justify-content:center; gap:8px;
               background: radial-gradient(60% 120% at 30% 30%, #37e38c, #19be69);
               color:#041416; font-weight:800; border:none; border-radius:12px; padding:.6rem .9rem; cursor:pointer; }
      @media (max-width:560px){ .ff-cart-text{ display:none; } }
    `;
    document.head.appendChild(style);

    cartCountEl = cartBtn.querySelector('.ff-cart-count');
    cartBtn.addEventListener('click', toggleMiniCart);
    updateCartCount();
  }

  function updateCartCount() {
    const count = cart.reduce((n, i) => n + i.qty, 0);
    if (cartCountEl) cartCountEl.textContent = String(count);
  }

  // -------- Toast --------
  let toastTimer;
  function toast(msg) {
    clearTimeout(toastTimer);
    let el = qs('.ff-toast');
    if (!el) {
      el = document.createElement('div');
      el.className = 'ff-toast';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('show');
    toastTimer = setTimeout(() => el.classList.remove('show'), 1400);
  }

  // -------- Mini cart panel --------
  let miniCartEl;
  function ensureMiniCart() {
    if (miniCartEl) return;
    miniCartEl = document.createElement('div');
    miniCartEl.className = 'ff-mini-cart';
    miniCartEl.innerHTML = `
      <header>
        <strong>Your cart</strong>
        <button class="ff-remove ff-close" aria-label="Close cart">Close</button>
      </header>
      <div class="ff-mini-list"></div>
      <footer>
        <div class="ff-row"><span>Subtotal</span><strong class="ff-subtotal">₹0</strong></div>
        <button class="ff-pay">Checkout</button>
        <button class="ff-remove ff-clear">Clear cart</button>
      </footer>
    `;
    document.body.appendChild(miniCartEl);

    miniCartEl.querySelector('.ff-close').addEventListener('click', () => miniCartEl.classList.remove('open'));
    miniCartEl.querySelector('.ff-clear').addEventListener('click', () => { cartAPI.clear(); toast('Cart cleared'); });
    miniCartEl.querySelector('.ff-pay').addEventListener('click', () => {
      toast('Proceed to checkout flow (connect backend to pay).');
    });
  }

  function toggleMiniCart() {
    ensureMiniCart();
    miniCartEl.classList.toggle('open');
    renderMiniCart();
  }

  function renderMiniCart() {
    ensureMiniCart();
    const list = miniCartEl.querySelector('.ff-mini-list');
    list.innerHTML = '';
    if (cart.length === 0) {
      list.innerHTML = '<p class="meta" style="margin:8px 6px;">Your cart is empty.</p>';
    } else {
      cart.forEach(item => {
        const row = document.createElement('div');
        row.className = 'ff-item';
        row.innerHTML = `
          <div>
            <h4>${item.name}</h4>
            <div class="meta">₹${item.price} × ${item.qty}</div>
          </div>
          <div class="ff-qty">
            <button class="ff-remove" data-act="dec" aria-label="Decrease">−</button>
            <input type="number" min="1" value="${item.qty}" />
            <button class="ff-remove" data-act="inc" aria-label="Increase">+</button>
            <button class="ff-remove" data-act="del" aria-label="Remove">✕</button>
          </div>
        `;
        // events
        const input = row.querySelector('input');
        const [dec, inc, del] = row.querySelectorAll('button');
        dec.addEventListener('click', () => cartAPI.updateQty(item.id, item.qty - 1));
        inc.addEventListener('click', () => cartAPI.updateQty(item.id, item.qty + 1));
        del.addEventListener('click', () => cartAPI.remove(item.id));
        input.addEventListener('change', () => cartAPI.updateQty(item.id, Number(input.value) || 1));
        list.appendChild(row);
      });
    }
    const subtotal = cart.reduce((s, i) => s + i.price * i.qty, 0);
    miniCartEl.querySelector('.ff-subtotal').textContent = `₹${subtotal}`;
  }

  // -------- Hook up "Add to cart" buttons from your HTML --------
  function bindProductCards() {
    // Assumes the HTML structure you have: article.card.product with .card__body > h3 and .price__current and a button/link
    qsa('.card.product').forEach((card, idx) => {
      const name = qs('h3', card)?.textContent?.trim() || `Item ${idx+1}`;
      const price = moneyToNumber(qs('.price__current', card)?.textContent || '0');
      // Normalize the "Add to cart" trigger
      let btn = qs('.btn', card);
      if (!btn) {
        btn = document.createElement('button');
        btn.className = 'btn btn--block';
        btn.textContent = 'Add to cart';
        qs('.card__body', card)?.appendChild(btn);
      } else {
        btn.setAttribute('type', 'button'); // avoid jumping to #cta
      }
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        cartAPI.add({ id: `p_${name}_${price}`, name, price, qty: 1 });
      });
    });
  }

  // -------- Close mobile nav on outside tap (optional polish) --------
  function closeNavOnOutsideClick() {
    const toggle = qs('#nav-toggle');
    const nav = qs('.nav');
    if (!toggle || !nav) return;
    document.addEventListener('click', (e) => {
      if (!toggle.checked) return;
      const within = nav.contains(e.target) || e.target === toggle || e.target.closest('.nav-toggle-btn');
      if (!within) toggle.checked = false;
    });
  }

  // -------- Init --------
  window.addEventListener('DOMContentLoaded', () => {
    enableSmoothScroll();
    mountCartButton();
    ensureMiniCart();
    bindProductCards();
    closeNavOnOutsideClick();
    renderMiniCart();
  });
})();