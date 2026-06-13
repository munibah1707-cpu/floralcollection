// ====== CART CONFIG ======
const STORE_EMAIL = "floralcollection001@gmail.com";
const WHATSAPP_NUMBER = "92 000 0000000";
const STORAGE_KEY = "floral_cart";
const FREE_DELIVERY_THRESHOLD = 5000;
const DEFAULT_DELIVERY = 300;

let cart = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

// ====== UTILITIES ======
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const fmtPKR = (n) => "PKR " + Number(n || 0).toLocaleString();

function saveCart() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  renderCart();
  updateCartCount();
}

function updateCartCount() {
  const el = $("#cartCount");
  if (el) el.textContent = cart.reduce((s, i) => s + (i.qty || 0), 0);
}
// ====== CART FUNCTIONS ======
function addToCart(name, price, id = null, selectedColor = null, img = null) {
  price = Number(price) || 0;
  if (!selectedColor && id) {
    const colorInput = document.querySelector(`input[name="color-${id}"]:checked`);
    selectedColor = colorInput ? colorInput.value : "Default";
  }

  const existing = cart.find(c => (id && c.id === id && c.color === selectedColor));
  if (existing) {
    existing.qty = (existing.qty || 0) + 1;
  } else {
    cart.push({ id: id || null, name, price, qty: 1, color: selectedColor, img: img || "" });
  }

  saveCart();
  openCartDrawer();
  showToast(`✅ Added to cart (${selectedColor})`);
}

function removeFromCart(id, color = null) {
  cart = cart.filter(i => !(i.id === id && (!color || i.color === color)));
  saveCart();
}

function renderCart() {
  const container = $("#cartItems");
  const totalEl = $("#cartTotal");
  if (!container) return;

  container.innerHTML = "";
  if (cart.length === 0) {
    container.innerHTML = '<div style="text-align:center;color:#666;padding:20px">Your cart is empty.</div>';
    if ($("#cartSubtotal")) $("#cartSubtotal").textContent = fmtPKR(0);
    if ($("#cartDelivery")) $("#cartDelivery").textContent = fmtPKR(0);
    if (totalEl) totalEl.textContent = fmtPKR(0);
    return;
  }

  let subtotal = 0;
  cart.forEach((it, idx) => {
    subtotal += it.price * it.qty;
    const row = document.createElement("div");
    row.style.borderBottom = "1px solid #eee";
    row.style.padding = "10px 0";
    row.style.display = "flex";
    row.style.flexWrap = "wrap";
    row.innerHTML = `
      <div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start;width:100%">
        <div style="display:flex;gap:10px;align-items:flex-start;flex:1">
          ${it.img ? `<img src="${it.img}" style="width:60px;height:60px;object-fit:cover;border-radius:6px;">` : ""}
          <div>
            <div style="font-weight:600">${it.name}</div>
            ${it.color ? `<div style="font-size:12px;color:#555">Color: ${it.color}</div>` : ""}
            <div style="font-size:12px;color:#777">${fmtPKR(it.price)} each</div>
            <div style="margin-top:6px;display:flex;gap:6px;align-items:center;flex-wrap:wrap">
              <button data-act="dec" data-idx="${idx}">-</button>
              <span>${it.qty}</span>
              <button data-act="inc" data-idx="${idx}">+</button>
              <button data-act="rm" data-idx="${idx}" style="margin-left:6px">Remove</button>
            </div>
          </div>
        </div>
        <div style="font-weight:700;margin-left:auto">${fmtPKR(it.price * it.qty)}</div>
      </div>
    `;
    container.appendChild(row);
  });

  const deliveryCharge = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DEFAULT_DELIVERY;
  if ($("#cartSubtotal")) $("#cartSubtotal").textContent = fmtPKR(subtotal);
  if ($("#cartDelivery")) $("#cartDelivery").textContent = fmtPKR(subtotal > 0 ? deliveryCharge : 0);
  if (totalEl) totalEl.textContent = fmtPKR(subtotal > 0 ? subtotal + deliveryCharge : 0);

  // qty buttons
  $$("#cartItems [data-act]").forEach(btn => {
    const act = btn.getAttribute("data-act");
    const idx = Number(btn.getAttribute("data-idx"));
    btn.onclick = () => {
      if (act === "inc") cart[idx].qty++;
      if (act === "dec") {
        cart[idx].qty--;
        if (cart[idx].qty <= 0) cart.splice(idx, 1);
      }
      if (act === "rm") cart.splice(idx, 1);
      saveCart();
    };
  });
}

// ====== DRAWER ======
function openCartDrawer(){ $("#cartDrawer")?.classList.add("open"); }
function closeCartDrawer(){ $("#cartDrawer")?.classList.remove("open"); }
$("#cartIcon")?.addEventListener("click", () => $("#cartDrawer")?.classList.toggle("open"));
$("#closeCartBtn")?.addEventListener("click", closeCartDrawer);

// ====== TOAST ======
function showToast(msg){
  const t = $("#toast");
  if(!t) return;
  t.querySelector(".toast-message").textContent = msg;
  t.classList.add("show");
  setTimeout(()=>t.classList.remove("show"), 1800);
}

// ====== CHECKOUT ======
let checkoutMode = "cart"; 
let directProduct = null;

function openCheckout() {
  const overlay = $("#checkoutOverlay");
  if (!overlay) return;
  overlay.classList.add("open");
  $("#custName").value = "";
  $("#custPhone").value = "";
  $("#custAddress").value = "";
  $("#custNotes").value = "";
  const summaryEl = $("#directProductSummary");
  if (summaryEl) summaryEl.style.display = "none";
}

function closeCheckout() {
  $("#checkoutOverlay")?.classList.remove("open");
}

$("#openCheckoutForm")?.addEventListener("click", ()=>{ 
  if(cart.length===0){ alert("Cart is empty."); return; }
  checkoutMode = "cart"; 
  openCheckout(); 
});

// ====== HANDLE CHECKOUT ======
async function handleCheckout(method) {
  const name = $("#custName").value.trim();
  const phone = $("#custPhone").value.trim();
  const email = $("#custEmail")?.value.trim() || "noemail@customer.com";
  const address = $("#custAddress").value.trim();
  const notes = $("#custNotes").value.trim();

  if (!name || !phone || !address) {
    alert("Please fill in Name, Phone, and Address.");
    return;
  }

  let items = [];
  let subtotal = 0;

  if (checkoutMode === "cart") {
    if (cart.length === 0) { 
      alert("Cart is empty."); 
      return; 
    }
    items = cart.map(item => 
      `${item.name} (x${item.qty}) - Rs.${item.price}${item.img ? `\nImage: ${item.img}` : ""}`
    );
    subtotal = cart.reduce((s, i) => s + (i.price * i.qty), 0);
  } 
  
  else if (checkoutMode === "direct" && directProduct) {
    items = [
      `${directProduct.name} (x${directProduct.qty}) - Rs.${directProduct.price}${directProduct.img ? `\nImage: ${directProduct.img}` : ""}`
    ];
    subtotal = directProduct.price * directProduct.qty;
  }

  // calculate delivery
  let delivery = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DEFAULT_DELIVERY;
  let total = subtotal + delivery;

  let message = `🛍️ New Order\n\nName: ${name}\nPhone: ${phone}\nEmail: ${email}\nAddress: ${address}\nNotes: ${notes}\n\nItems:\n${items.join("\n\n")}\n\nSubtotal: Rs.${subtotal}\nDelivery: Rs.${delivery}\nTotal: Rs.${total}`;

if (method === "email") {
  try {
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_key: "c358eb90-07d6-49c6-b6c0-e20a0ce50f65",
        subject: "New Order from Floral Collection",
        from_name: name,
        email: email,
        message
      })
    });
    const result = await response.json();
    if (result.success) {
      // ✅ FIX IS HERE
      localStorage.setItem("lastOrder", JSON.stringify({ 
        name, phone, email, address, notes, items, subtotal, delivery, total 
      }));
      window.location.href = "orderconfirmation.html";
    } else {
      alert("❌ Failed: " + result.message);
    }
  } catch (e) {
    alert("⚠️ Error sending order.");
  }
}

  if (method === "whatsapp") {
    const waText = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${waText}`, "_blank");
  }

  if (checkoutMode === "cart") {
    cart = [];
    saveCart();
  }
  closeCheckout();
}

// ====== INIT ======
document.addEventListener("DOMContentLoaded", () => {
  renderCart();
  updateCartCount();

  // Auto-hook Add to Cart buttons
  $$(".add-to-cart").forEach(btn => {
    if (btn._hooked) return;
    btn._hooked = true;
    btn.addEventListener("click", () => {
      const name  = btn.dataset.name  || "Product";
      const price = btn.dataset.price || 0;
      const id    = btn.dataset.id    || null;
      const img   = btn.dataset.img   || "";
      const color = btn.dataset.color || "Default";
      addToCart(name, price, id, color, img);
    });
  });

  // Product details page
  const detailBtn = $("#detailAddToCart");
  if (detailBtn) {
    detailBtn.addEventListener("click", () => {
      const name = detailBtn.dataset.name || "Product";
      const price = detailBtn.dataset.price || 0;
      const id = detailBtn.dataset.id || null;
      const img = detailBtn.dataset.img || "";
      const colorSelect = $("#detailColor");
      const selectedColor = colorSelect ? colorSelect.value : "Default";
      addToCart(name, price, id, selectedColor, img);
    });
  }

  // Buy Now buttons
  $$(".buy-now").forEach(btn => {
    btn.addEventListener("click", () => {
      const product = {
        name: btn.dataset.name,
        price: Number(btn.dataset.price),
        id: btn.dataset.id,
        img: btn.dataset.img || "",
        qty: 1
      };
      directProduct = product;
      directCheckoutInstant(product, "email");
    });
  });

  $$(".buy-now-whatsapp").forEach(btn => {
    btn.addEventListener("click", () => {
      const product = {
        name: btn.dataset.name,
        price: Number(btn.dataset.price),
        id: btn.dataset.id,
        img: btn.dataset.img || "",
        qty: 1
      };
      directProduct = product;
      directCheckoutInstant(product, "whatsapp");
    });
  });

  // Clear cart
  $("#clearCartBtn")?.addEventListener("click", () => {
    cart = [];
    saveCart();
    showToast("🗑 Cart cleared");
  });

  $("#continueShoppingBtn")?.addEventListener("click", closeCartDrawer);

  // Checkout overlay buttons
  $("#emailCheckoutBtn")?.addEventListener("click", () => handleCheckout("email"));
  $("#waCheckoutBtn")?.addEventListener("click", () => handleCheckout("whatsapp"));
  $("#closeModalBtn")?.addEventListener("click", closeCheckout);
  $("#cancelCheckoutBtn")?.addEventListener("click", closeCheckout);
  $("#checkoutOverlay")?.addEventListener("click",(e)=>{ if(e.target.id==="checkoutOverlay") closeCheckout(); });
});
