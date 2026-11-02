
document.addEventListener("DOMContentLoaded", () => {

    const orderContainer = document.getElementById("orderContainer");
    const orderSummary = document.getElementById("orderSummary");
    const placeOrderBtn = document.getElementById("placeOrderBtn");

    const customerName = document.getElementById("customerName");
    const customerEmail = document.getElementById("customerEmail");
    const customerPhone = document.getElementById("customerPhone");
    const customerAddress = document.getElementById("customerAddress");

    const paymentMethod = document.getElementById("paymentMethod");

    let cart = JSON.parse(
        localStorage.getItem("shopSmartCart")
    ) || [];

    // Load Cart
    function loadCart() {

        if (!orderContainer) return;

        if (cart.length === 0) {

            orderContainer.innerHTML = `
                <div class="empty-order">
                    <h2>Your Cart is Empty!</h2>
                    <p>Add products before placing an order.</p>

                    <a href="search.html">
                        Continue Shopping
                    </a>
                </div>
            `;

            if (placeOrderBtn) {
                placeOrderBtn.disabled = true;
            }

            return;
        }

        displayOrderItems();
        calculateOrderTotal();
    }

    // Display Order Items
    function displayOrderItems() {

        orderContainer.innerHTML = cart.map(item => `
            <div class="order-item">

                <img
                    src="${item.image}"
                    alt="${escapeHTML(item.title)}"
                >

                <div class="order-item-info">

                    <h3>${escapeHTML(item.title)}</h3>

                    <p>
                        Quantity: ${item.quantity}
                    </p>

                    <p>
                        Price: ₹${(item.price * 85).toFixed(2)}
                    </p>

                    <p class="item-total">
                        Total:
                        ₹${(item.price * item.quantity * 85).toFixed(2)}
                    </p>

                </div>

            </div>
        `).join("");
    }

    // Calculate Total
    function calculateOrderTotal() {

        const subtotal = cart.reduce(
            (total, item) =>
                total + (item.price * item.quantity * 85),
            0
        );

        const deliveryCharge = subtotal >= 1000 ? 0 : 50;

        const totalAmount = subtotal + deliveryCharge;

        if (orderSummary) {

            orderSummary.innerHTML = `
                <div class="summary-row">
                    <span>Subtotal</span>
                    <span>₹${subtotal.toFixed(2)}</span>
                </div>

                <div class="summary-row">
                    <span>Delivery</span>
                    <span>
                        ${deliveryCharge === 0
                            ? "FREE"
                            : "₹" + deliveryCharge.toFixed(2)}
                    </span>
                </div>

                <hr>

                <div class="summary-row total">
                    <strong>Total Amount</strong>
                    <strong>₹${totalAmount.toFixed(2)}</strong>
                </div>
            `;
        }

        return {
            subtotal,
            deliveryCharge,
            totalAmount
        };
    }

    // Place Order
    function placeOrder() {

        if (cart.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        const name = customerName.value.trim();
        const email = customerEmail.value.trim();
        const phone = customerPhone.value.trim();
        const address = customerAddress.value.trim();

        if (!name || !email || !phone || !address) {
            alert("Please fill in all customer details.");
            return;
        }

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(email)) {
            alert("Please enter a valid email address.");
            return;
        }

        if (!/^[0-9]{10}$/.test(phone)) {
            alert("Enter a valid 10-digit phone number.");
            return;
        }

        const totals = calculateOrderTotal();

        const order = {
            orderId: "SSAI-" + Date.now(),

            customer: {
                name: name,
                email: email,
                phone: phone,
                address: address
            },

            items: cart.map(item => ({
                id: item.id,
                title: item.title,
                image: item.image,
                price: item.price,
                quantity: item.quantity
            })),

            subtotal: totals.subtotal,
            deliveryCharge: totals.deliveryCharge,
            totalAmount: totals.totalAmount,

            paymentMethod: paymentMethod
                ? paymentMethod.value
                : "Cash on Delivery",

            status: "Pending",

            orderDate: new Date().toLocaleString()
        };

        // Save Order History
        let orders = JSON.parse(
            localStorage.getItem("shopSmartOrders")
        ) || [];

        orders.push(order);

        localStorage.setItem(
            "shopSmartOrders",
            JSON.stringify(orders)
        );

        // Clear Cart
        localStorage.removeItem("shopSmartCart");

        // Save Last Order
        localStorage.setItem(
            "shopSmartLastOrder",
            JSON.stringify(order)
        );

        alert(
            "Order placed successfully!\nOrder ID: " +
            order.orderId
        );

        window.location.href = "order-success.html";
    }

    // HTML Escape
    function escapeHTML(text) {

        return String(text).replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);
    }

    // Place Order Button
    if (placeOrderBtn) {
        placeOrderBtn.addEventListener(
            "click",
            placeOrder
        );
    }

    // Initialize
    loadCart();

});
