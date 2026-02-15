let selectedQty = {};
let cart = {};
let currentCategory = "All";

document.addEventListener("DOMContentLoaded", () => {
    loadCategories();
    loadProducts();
});

/* ================= CATEGORY ================= */

function loadCategories(){
    let categories = ["All", ...new Set(products.map(p=>p.category))];
    let list = document.getElementById("categoryList");
    list.innerHTML = "";

    categories.forEach(cat=>{
        let li = document.createElement("li");
        li.innerText = cat;
        li.onclick = ()=>{
            currentCategory = cat;
            loadProducts();
        };
        list.appendChild(li);
    });
}

/* ================= PRODUCTS ================= */

function loadProducts(){
    let grid = document.getElementById("productGrid");
    grid.innerHTML="";
    let search = document.getElementById("search").value.toLowerCase();

    products.forEach(p=>{
        if((currentCategory==="All"||p.category===currentCategory)
        && p.name.toLowerCase().includes(search)){

            let div=document.createElement("div");
            div.className="card";

            div.innerHTML = `
            <div class="product-img">
                <img src="${p.image ? p.image : 'https://via.placeholder.com/120'}" alt="${p.name}">
            </div>

            <h4>${p.name}</h4>
            <p class="price">₹${p.price}</p>

            <div class="qty-control">
                <button onclick="changeQty(${p.id}, -1)">-</button>
                <span id="qty-${p.id}">${selectedQty[p.id] || 0}</span>
                <button onclick="changeQty(${p.id}, 1)">+</button>
            </div>

            <button class="add-btn" onclick="addToCart(${p.id})">
                Add to Cart
            </button>
            `;

            grid.appendChild(div);
        }
    });
}

document.getElementById("search").addEventListener("input", loadProducts);

/* ================= ADD TO CART ================= */

function addToCart(id){
    let qty = selectedQty[id] || 0;

    if(qty === 0){
        alert("Please select quantity first.");
        return;
    }

    cart[id] = (cart[id] || 0) + qty;
    selectedQty[id] = 0;
    document.getElementById(`qty-${id}`).innerText = 0;

    updateCart();
}

/* ================= UPDATE CART ================= */

function updateCart(){
    let subtotal=0;
    let itemsHTML="";
    let totalItems=0;

    products.forEach(p=>{
        if(cart[p.id] && cart[p.id]>0){
            subtotal+=cart[p.id]*p.price;
            totalItems+=cart[p.id];

            itemsHTML+=`
            <div class="cart-item">
                <div>${p.name}</div>
                <div>Qty: ${cart[p.id]}</div>
                <div>₹${p.price * cart[p.id]}</div>
            </div>
            `;
        }
    });

    let delivery=0;
    if(subtotal>=1000) delivery=0;
    else if(subtotal>=500) delivery=20;
    else if(subtotal>=300) delivery=30;

    let total=subtotal>=300?subtotal+delivery:subtotal;

    document.getElementById("cartItems").innerHTML = 
        itemsHTML || "<p style='text-align:center;color:#888;margin-top:20px;'>Your cart is empty 🛒</p>";

    document.getElementById("subtotal").innerText=subtotal;
    document.getElementById("delivery").innerText=subtotal>=300?delivery:0;
    document.getElementById("total").innerText=total;
    document.getElementById("cart-count").innerText=totalItems;
}

/* ================= CHECKOUT ================= */

function checkout(){
    if(Object.keys(cart).length === 0){
        alert("Cart is empty");
        return;
    }

    let user = JSON.parse(localStorage.getItem("user"));

    if(!user){
        alert("Please login again.");
        return;
    }

    let total = document.getElementById("total").innerText;
    let items = "";

    products.forEach(p=>{
        if(cart[p.id] && cart[p.id] > 0){
            items += `${p.name} x ${cart[p.id]}<br>`;
        }
    });

    document.getElementById("orderSummaryText").innerHTML = `
        <strong>Name:</strong> ${user.name}<br>
        <strong>Phone:</strong> ${user.phone}<br>
        <strong>Address:</strong> ${user.address}<br><br>
        <strong>Items:</strong><br>
        ${items}<br>
        <strong>Total:</strong> ₹${total}
    `;

    document.getElementById("addressModal").style.display = "flex";
}

/* ================= CONFIRM ORDER ================= */

function confirmOrder(){

    let user = JSON.parse(localStorage.getItem("user"));

    if(!user){
        alert("User missing.");
        return;
    }

    let itemsText = "";
    let total = 0;

    products.forEach(p=>{
        if(cart[p.id]){
            itemsText += `${p.name} x ${cart[p.id]}\n`;
            total += p.price * cart[p.id];
        }
    });

    let message = `
GaonMart Order

Name: ${user.name}
Phone: ${user.phone}
Address: ${user.address}

Items:
${itemsText}

Total: ₹${total}
`;

    window.open("https://wa.me/918826649468?text=" + encodeURIComponent(message));

    fetch("YOUR_GOOGLE_SCRIPT_URL", {
        method:"POST",
        body: JSON.stringify({
            name: user.name,
            phone: user.phone,
            address: user.address,
            items: itemsText,
            total
        })
    });

    cart = {};
    updateCart();
    closeModal();
}

/* ================= OTHER ================= */

function changeQty(id, change){
    selectedQty[id] = (selectedQty[id] || 0) + change;
    if(selectedQty[id] < 0) selectedQty[id] = 0;
    document.getElementById(`qty-${id}`).innerText = selectedQty[id];
}

function goCart(){
    document.getElementById("cartPanel").classList.toggle("active");
}

function clearCart(){
    cart = {};
    updateCart();
}

function closeModal(){
    document.getElementById("addressModal").style.display = "none";
}
