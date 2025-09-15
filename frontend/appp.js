// ===== Simple cart + Razorpay payment =====
(function () {
  const cart = [];

  // Utility to parse ₹ price text to number
  const moneyToNumber = (text) => Number(text.replace(/[^\d.]/g, '')) || 0;

  // Bind "Add to cart" buttons
  document.querySelectorAll('.card.product').forEach((card, idx) => {
    const name = card.querySelector('h3')?.textContent.trim() || `Item ${idx+1}`;
    const price = moneyToNumber(card.querySelector('.price__current')?.textContent || '0');
    const btn = card.querySelector('.btn') || card.querySelector('a.btn');
    if (!btn) return;
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      cart.push({ name, price, qty: 1 });
      alert(`${name} added to cart`);
    });
  });

  // Checkout button (you can place this anywhere in your HTML)
  const checkoutBtn = document.createElement('button');
  checkoutBtn.textContent = 'Checkout';
  checkoutBtn.style.position = 'fixed';
  checkoutBtn.style.bottom = '20px';
  checkoutBtn.style.right = '20px';
  checkoutBtn.style.padding = '10px 16px';
  checkoutBtn.style.background = '#2dd36f';
  checkoutBtn.style.color = '#fff';
  checkoutBtn.style.border = 'none';
  checkoutBtn.style.borderRadius = '8px';
  checkoutBtn.style.cursor = 'pointer';
  document.body.appendChild(checkoutBtn);

  checkoutBtn.addEventListener('click', startPayment);

  async function startPayment() {
    if (cart.length === 0) {
      alert('Cart is empty');
      return;
    }

    // ===== Normally, you'd call your backend here to create a Razorpay order =====
    // For demo purposes, we'll fake an order with a fixed amount
    const amount = cart.reduce((sum, i) => sum + i.price * i.qty, 0) * 100; // in paise

    // Replace with your real Razorpay key
    const options = {
      key: "rzp_test_xxxxxxxxxxxx", // <-- your Razorpay key_id
      amount: amount,
      currency: "INR",
      name: "KhedFresh",
      description: "Farmer Marketplace Order",
      // order_id: "order_DBJOWzybf0sJbb", // from backend in real flow
      handler: function (response) {
        // This runs after successful payment
        alert("Payment successful! Payment ID: " + response.razorpay_payment_id);
        console.log("Full payment response:", response);
        // Here you would send response + cart to your backend to verify & fulfill
      },
      prefill: {
        name: "Swapnil",
        email: "you@example.com",
        contact: "9999999999"
      },
      theme: {
        color: "#2dd36f"
      }
    };

    const rzp1 = new Razorpay(options);
    rzp1.open();
  }
})();