
document.addEventListener("DOMContentLoaded", () => {

    // ==============================
    // DOM ELEMENTS
    // ==============================

    const checkoutItems = document.getElementById("checkoutItems");
    const checkoutSummary = document.getElementById("checkoutSummary");
    const checkoutForm = document.getElementById("checkoutForm");
    const placeOrderBtn = document.getElementById("placeOrderBtn");

    const fullName = document.getElementById("fullName");
    const email = document.getElementById("email");
    const phone = document.getElementById("phone");
    const address = document.getElementById("address");
    const city = document.getElementById("city");
    const pincode = document.getElementById("pincode");
    const paymentMethod = document.getElementById("paymentMethod");

    // ==============================
    // CART DATA
    // ==============================

    let cart = JSON.parse(
        localStorage.getItem("shopSmartCart")
    ) || [];

    const INR_RATE = 85;
    const DELIVERY_CHARGE = 50;
    const FREE_DELIVERY_LIMIT = 1000;

    // ==============================
    // FORMAT PRICE
    // ==============================

    function formatPrice(price) {

        return "₹" + Number(price).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

    }

    // ==============================
    // DISPLAY CART ITEMS
    // ==============================

    function displayCheckoutItems() {

        if (!checkoutItems) return;

        if (cart.length === 0) {

            checkoutItems.innerHTML = `
                <div class="empty-checkout">

                    <h2>Your Cart is Empty</h2>

                    <p>Please add products before checkout.</p>

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

        checkoutItems.innerHTML = cart.map(item => `
            <div class="checkout-item">

                <img
                    src="${item.image}"
                    alt="${escapeHTML(item.title)}"
                >

                <div class="checkout-item-info">

                    <h3>${escapeHTML(item.title)}</h3>

                    <p>
                        Quantity: ${item.quantity}
                    </p>

                    <p>
                        Price:
                        ${formatPrice(item.price * INR_RATE)}
                    </p>

                    <strong>
                        Total:
                        ${formatPrice(
                            item.price * item.quantity * INR_RATE
                        )}
                    </strong>

                </div>

            </div>
        `).join("");

    }

    // ==============================
    // CALCULATE TOTAL
    // ==============================

    function calculateTotal() {

        const subtotal = cart.reduce((total, item) => {

            return total +
                (item.price * item.quantity * INR_RATE);

        }, 0);

        const deliveryCharge =
            subtotal >= FREE_DELIVERY_LIMIT
                ? 0
                : DELIVERY_CHARGE;

        const totalAmount = subtotal + deliveryCharge;

        return {
            subtotal,
            deliveryCharge,
            totalAmount
        };

    }

    // ==============================
    // DISPLAY ORDER SUMMARY
    // ==============================

    function displayCheckoutSummary() {

        if (!checkoutSummary) return;

        const totals = calculateTotal();

        checkoutSummary.innerHTML = `

            <div class="summary-row">

                <span>Subtotal</span>

                <span>
                    ${formatPrice(totals.subtotal)}
                </span>

            </div>

            <div class="summary-row">

                <span>Delivery Charge</span>

                <span>
                    ${totals.deliveryCharge === 0
                        ? "FREE"
                        : formatPrice(totals.deliveryCharge)}
                </span>

            </div>

            <hr>

            <div class="summary-row total">

                <strong>Total Amount</strong>

                <strong>
                    ${formatPrice(totals.totalAmount)}
                </strong>

            </div>

        `;

    }

    // ==============================
    // FORM VALIDATION
    // ==============================

    function validateCheckoutForm() {

        const nameValue = fullName.value.trim();
        const emailValue = email.value.trim();
        const phoneValue = phone.value.trim();
        const addressValue = address.value.trim();
        const cityValue = city.value.trim();
        const pincodeValue = pincode.value.trim();

        if (
            !nameValue ||
            !emailValue ||
            !phoneValue ||
            !addressValue ||
            !cityValue ||
            !pincodeValue
        ) {

            alert("Please fill in all required fields.");

            return false;

        }

        const emailPattern =
            /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailPattern.test(emailValue)) {

            alert("Please enter a valid email address.");

            return false;

        }

        if (!/^[0-9]{10}$/.test(phoneValue)) {

            alert("Enter a valid 10-digit phone number.");

            return false;

        }

        if (!/^[0-9]{6}$/.test(pincodeValue)) {

            alert("Enter a valid 6-digit PIN code.");

            return false;

        }

        if (cart.length === 0) {

            alert("Your cart is empty.");

            return false;

        }

        return true;

    }

    // ==============================
    // PLACE ORDER
    // ==============================

    function placeOrder(event) {

        if (event) {
            event.preventDefault();
        }

        if (!validateCheckoutForm()) {
            return;
        }

        const totals = calculateTotal();

        const orderId =
            "SSA-" + Date.now();

        const order = {

            orderId: orderId,

            customer: {

                name: fullName.value.trim(),

                email: email.value.trim(),

                phone: phone.value.trim(),

                address: address.value.trim(),

                city: city.value.trim(),

                pincode: pincode.value.trim()

            },

            products: cart.map(item => ({

                id: item.id,

                title: item.title,

                image: item.image,

                price: item.price,

                quantity: item.quantity,

                total:
                    item.price * item.quantity * INR_RATE

            })),

            subtotal: totals.subtotal,

            deliveryCharge: totals.deliveryCharge,

            totalAmount: totals.totalAmount,

            paymentMethod: paymentMethod.value,

            paymentStatus:
                paymentMethod.value === "COD"
                    ? "Pending"
                    : "Unpaid",

            orderStatus: "Placed",

            orderDate: new Date().toISOString()

        };

        // ==============================
        // SAVE ORDER HISTORY
        // ==============================

        let orders = JSON.parse(
            localStorage.getItem("shopSmartOrders")
        ) || [];

        orders.push(order);

        localStorage.setItem(
            "shopSmartOrders",
            JSON.stringify(orders)
        );

        // Save last order
        localStorage.setItem(
            "shopSmartLastOrder",
            JSON.stringify(order)
        );

        // Clear cart
        localStorage.removeItem("shopSmartCart");

        // Redirect to success page
        window.location.href =
            `order-success.html?id=${encodeURIComponent(orderId)}`;

    }

    // ==============================
    // EVENT LISTENERS
    // ==============================

    if (checkoutForm) {

        checkoutForm.addEventListener(
            "submit",
            placeOrder
        );

    }

    if (placeOrderBtn && !checkoutForm) {

        placeOrderBtn.addEventListener(
            "click",
            placeOrder
        );

    }

    // ==============================
    // HTML ESCAPE
    // ==============================

    function escapeHTML(text) {

        return String(text).replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);

    }

    // ==============================
    // INITIALIZE CHECKOUT
    // ==============================

    displayCheckoutItems();

    displayCheckoutSummary();

});
