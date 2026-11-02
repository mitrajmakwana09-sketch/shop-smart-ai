
document.addEventListener("DOMContentLoaded", () => {

    // =================================
    // DOM ELEMENTS
    // =================================

    const cartContainer = document.getElementById("cartContainer");
    const cartSummary = document.getElementById("cartSummary");
    const cartCount = document.getElementById("cartCount");
    const checkoutBtn = document.getElementById("checkoutBtn");
    const clearCartBtn = document.getElementById("clearCartBtn");

    // =================================
    // CART CONFIGURATION
    // =================================

    const INR_RATE = 85;
    const DELIVERY_CHARGE = 50;
    const FREE_DELIVERY_LIMIT = 1000;

    let cart = JSON.parse(
        localStorage.getItem("shopSmartCart")
    ) || [];

    // =================================
    // FORMAT PRICE
    // =================================

    function formatPrice(price) {

        return "₹" + Number(price).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

    }

    // =================================
    // SAVE CART
    // =================================

    function saveCart() {

        localStorage.setItem(
            "shopSmartCart",
            JSON.stringify(cart)
        );

        updateCartCount();
    }

    // =================================
    // DISPLAY CART
    // =================================

    function displayCart() {

        if (!cartContainer) return;

        if (cart.length === 0) {

            cartContainer.innerHTML = `
                <div class="empty-cart">

                    <div class="empty-cart-icon">
                        🛒
                    </div>

                    <h2>Your Cart is Empty</h2>

                    <p>
                        Looks like you haven't added any
                        products to your cart yet.
                    </p>

                    <a href="search.html" class="shop-btn">
                        Continue Shopping
                    </a>

                </div>
            `;

            if (checkoutBtn) {
                checkoutBtn.disabled = true;
            }

            if (clearCartBtn) {
                clearCartBtn.disabled = true;
            }

            if (cartSummary) {
                cartSummary.innerHTML = "";
            }

            updateCartCount();

            return;
        }

        if (checkoutBtn) {
            checkoutBtn.disabled = false;
        }

        if (clearCartBtn) {
            clearCartBtn.disabled = false;
        }

        cartContainer.innerHTML = cart.map(item => `
            <div class="cart-item" data-id="${item.id}">

                <div class="cart-image-box">

                    <img
                        src="${item.image}"
                        alt="${escapeHTML(item.title)}"
                    >

                </div>

                <div class="cart-item-details">

                    <h3>
                        ${escapeHTML(item.title)}
                    </h3>

                    <p class="cart-price">
                        ${formatPrice(item.price * INR_RATE)}
                    </p>

                    <div class="quantity-controls">

                        <button
                            class="quantity-btn decrease-btn"
                            data-id="${item.id}"
                            aria-label="Decrease quantity"
                        >
                            −
                        </button>

                        <span class="quantity-value">
                            ${item.quantity}
                        </span>

                        <button
                            class="quantity-btn increase-btn"
                            data-id="${item.id}"
                            aria-label="Increase quantity"
                        >
                            +
                        </button>

                    </div>

                    <p class="item-total">
                        Total:
                        <strong>
                            ${formatPrice(
                                item.price *
                                item.quantity *
                                INR_RATE
                            )}
                        </strong>
                    </p>

                    <div class="cart-actions">

                        <button
                            class="remove-btn"
                            data-id="${item.id}"
                        >
                            🗑 Remove
                        </button>

                        <button
                            class="wishlist-btn"
                            data-id="${item.id}"
                        >
                            ♡ Wishlist
                        </button>

                    </div>

                </div>

            </div>
        `).join("");

        attachCartEvents();

        calculateCartTotal();
    }

    // =================================
    // QUANTITY EVENTS
    // =================================

    function attachCartEvents() {

        document.querySelectorAll(".increase-btn")
            .forEach(button => {

                button.addEventListener("click", () => {

                    updateQuantity(
                        Number(button.dataset.id),
                        1
                    );

                });

            });

        document.querySelectorAll(".decrease-btn")
            .forEach(button => {

                button.addEventListener("click", () => {

                    updateQuantity(
                        Number(button.dataset.id),
                        -1
                    );

                });

            });

        // Remove Product
        document.querySelectorAll(".remove-btn")
            .forEach(button => {

                button.addEventListener("click", () => {

                    removeProduct(
                        Number(button.dataset.id)
                    );

                });

            });

        // Wishlist
        document.querySelectorAll(".wishlist-btn")
            .forEach(button => {

                button.addEventListener("click", () => {

                    moveToWishlist(
                        Number(button.dataset.id)
                    );

                });

            });

    }

    // =================================
    // UPDATE QUANTITY
    // =================================

    function updateQuantity(productId, change) {

        const item = cart.find(
            product => product.id === productId
        );

        if (!item) return;

        const newQuantity = item.quantity + change;

        if (newQuantity < 1) {

            alert("Minimum quantity is 1.");

            return;
        }

        if (newQuantity > 10) {

            alert("Maximum quantity is 10.");

            return;
        }

        item.quantity = newQuantity;

        saveCart();

        displayCart();
    }

    // =================================
    // REMOVE PRODUCT
    // =================================

    function removeProduct(productId) {

        const confirmRemove = confirm(
            "Are you sure you want to remove this product?"
        );

        if (!confirmRemove) return;

        cart = cart.filter(
            item => item.id !== productId
        );

        saveCart();

        displayCart();
    }

    // =================================
    // MOVE TO WISHLIST
    // =================================

    function moveToWishlist(productId) {

        const item = cart.find(
            product => product.id === productId
        );

        if (!item) return;

        let wishlist = JSON.parse(
            localStorage.getItem("shopSmartWishlist")
        ) || [];

        const exists = wishlist.some(
            product => product.id === productId
        );

        if (exists) {

            alert("Product already exists in wishlist!");

            return;
        }

        wishlist.push({
            id: item.id,
            title: item.title,
            image: item.image,
            price: item.price
        });

        localStorage.setItem(
            "shopSmartWishlist",
            JSON.stringify(wishlist)
        );

        cart = cart.filter(
            product => product.id !== productId
        );

        saveCart();

        displayCart();

        alert("Product moved to wishlist!");
    }

    // =================================
    // CLEAR CART
    // =================================

    function clearCart() {

        if (cart.length === 0) return;

        const confirmClear = confirm(
            "Are you sure you want to clear your cart?"
        );

        if (!confirmClear) return;

        cart = [];

        saveCart();

        displayCart();
    }

    // =================================
    // CALCULATE CART TOTAL
    // =================================

    function calculateCartTotal() {

        if (!cartSummary) return;

        const subtotal = cart.reduce(
            (total, item) =>
                total +
                (item.price * item.quantity * INR_RATE),
            0
        );

        const deliveryCharge =
            subtotal >= FREE_DELIVERY_LIMIT
                ? 0
                : DELIVERY_CHARGE;

        const totalAmount =
            subtotal + deliveryCharge;

        cartSummary.innerHTML = `

            <div class="summary-row">

                <span>Subtotal</span>

                <strong>
                    ${formatPrice(subtotal)}
                </strong>

            </div>

            <div class="summary-row">

                <span>Delivery Charge</span>

                <strong>
                    ${deliveryCharge === 0
                        ? "FREE"
                        : formatPrice(deliveryCharge)}
                </strong>

            </div>

            <hr>

            <div class="summary-row total-row">

                <span>Total Amount</span>

                <strong>
                    ${formatPrice(totalAmount)}
                </strong>

            </div>

            <p class="delivery-message">
                ${
                    subtotal >= FREE_DELIVERY_LIMIT
                    ? "🎉 You have unlocked Free Delivery!"
                    : "Add more products to unlock Free Delivery."
                }
            </p>

        `;
    }

    // =================================
    // UPDATE CART COUNT
    // =================================

    function updateCartCount() {

        const totalItems = cart.reduce(
            (total, item) =>
                total + Number(item.quantity || 0),
            0
        );

        if (cartCount) {
            cartCount.textContent = totalItems;
        }
    }

    // =================================
    // CHECKOUT NAVIGATION
    // =================================

    if (checkoutBtn) {

        checkoutBtn.addEventListener("click", () => {

            if (cart.length === 0) {

                alert("Your cart is empty!");

                return;
            }

            window.location.href = "checkout.html";

        });

    }

    // =================================
    // CLEAR CART BUTTON
    // =================================

    if (clearCartBtn) {

        clearCartBtn.addEventListener(
            "click",
            clearCart
        );

    }

    // =================================
    // HTML ESCAPE
    // =================================

    function escapeHTML(text) {

        return String(text).replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);

    }

    // =================================
    // INITIALIZE
    // =================================

    displayCart();

    updateCartCount();

});
