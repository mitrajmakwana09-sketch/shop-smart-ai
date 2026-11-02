
document.addEventListener("DOMContentLoaded", () => {

    const productDetails = document.getElementById("productDetails");

    const cartCount = document.getElementById("cartCount");
    const wishlistCount = document.getElementById("wishlistCount");

    let currentProduct = null;
    let quantity = 1;

    // Get product ID from URL
    const params = new URLSearchParams(window.location.search);
    const productId = params.get("id");

    // Load product details
    async function loadProduct() {

        if (!productId) {
            showError("Product ID not found.");
            return;
        }

        try {
            const response = await fetch(
                `https://fakestoreapi.com/products/${productId}`
            );

            if (!response.ok) {
                throw new Error("Product not found");
            }

            currentProduct = await response.json();

            displayProduct(currentProduct);

        } catch (error) {
            console.error(error);
            showError("Unable to load product details.");
        }
    }

    // Display product
    function displayProduct(product) {

        if (!productDetails) return;

        productDetails.innerHTML = `
            <div class="product-details-container">

                <div class="product-image-section">
                    <img
                        src="${product.image}"
                        alt="${escapeHTML(product.title)}"
                        class="main-product-image"
                    >
                </div>

                <div class="product-info-section">

                    <span class="product-category">
                        ${escapeHTML(product.category)}
                    </span>

                    <h1>${escapeHTML(product.title)}</h1>

                    <div class="product-rating">
                        ⭐ ${product.rating.rate}
                        (${product.rating.count} Reviews)
                    </div>

                    <h2 class="product-price">
                        ₹${(product.price * 85).toFixed(2)}
                    </h2>

                    <p class="product-description">
                        ${escapeHTML(product.description)}
                    </p>

                    <div class="quantity-section">

                        <button id="decreaseQty">−</button>

                        <span id="quantityValue">1</span>

                        <button id="increaseQty">+</button>

                    </div>

                    <div class="product-buttons">

                        <button id="addToCartBtn">
                            🛒 Add to Cart
                        </button>

                        <button id="buyNowBtn">
                            Buy Now
                        </button>

                        <button id="addToWishlistBtn">
                            ♡ Wishlist
                        </button>

                    </div>

                </div>

            </div>
        `;

        attachEvents();
    }

    // Quantity events
    function attachEvents() {

        const decreaseBtn = document.getElementById("decreaseQty");
        const increaseBtn = document.getElementById("increaseQty");
        const quantityValue = document.getElementById("quantityValue");

        decreaseBtn.addEventListener("click", () => {

            if (quantity > 1) {
                quantity--;
                quantityValue.textContent = quantity;
            }

        });

        increaseBtn.addEventListener("click", () => {

            if (quantity < 10) {
                quantity++;
                quantityValue.textContent = quantity;
            }

        });

        // Add to cart
        document.getElementById("addToCartBtn")
            .addEventListener("click", addToCart);

        // Buy now
        document.getElementById("buyNowBtn")
            .addEventListener("click", buyNow);

        // Wishlist
        document.getElementById("addToWishlistBtn")
            .addEventListener("click", addToWishlist);
    }

    // Add to cart
    function addToCart() {

        if (!currentProduct) return;

        let cart = JSON.parse(
            localStorage.getItem("shopSmartCart")
        ) || [];

        const existingProduct = cart.find(
            item => item.id === currentProduct.id
        );

        if (existingProduct) {

            existingProduct.quantity += quantity;

        } else {

            cart.push({
                id: currentProduct.id,
                title: currentProduct.title,
                price: currentProduct.price,
                image: currentProduct.image,
                quantity: quantity
            });

        }

        localStorage.setItem(
            "shopSmartCart",
            JSON.stringify(cart)
        );

        updateCartCount();

        alert("Product added to cart successfully!");
    }

    // Buy Now
    function buyNow() {

        if (!currentProduct) return;

        addToCart();

        window.location.href = "cart.html";
    }

    // Add to wishlist
    function addToWishlist() {

        if (!currentProduct) return;

        let wishlist = JSON.parse(
            localStorage.getItem("shopSmartWishlist")
        ) || [];

        const exists = wishlist.some(
            item => item.id === currentProduct.id
        );

        if (exists) {

            alert("Product already exists in wishlist!");

        } else {

            wishlist.push({
                id: currentProduct.id,
                title: currentProduct.title,
                price: currentProduct.price,
                image: currentProduct.image
            });

            localStorage.setItem(
                "shopSmartWishlist",
                JSON.stringify(wishlist)
            );

            updateWishlistCount();

            alert("Added to wishlist successfully!");
        }
    }

    // Update cart count
    function updateCartCount() {

        const cart = JSON.parse(
            localStorage.getItem("shopSmartCart")
        ) || [];

        const totalItems = cart.reduce(
            (total, item) => total + item.quantity,
            0
        );

        if (cartCount) {
            cartCount.textContent = totalItems;
        }
    }

    // Update wishlist count
    function updateWishlistCount() {

        const wishlist = JSON.parse(
            localStorage.getItem("shopSmartWishlist")
        ) || [];

        if (wishlistCount) {
            wishlistCount.textContent = wishlist.length;
        }
    }

    // Error message
    function showError(message) {

        if (productDetails) {
            productDetails.innerHTML = `
                <div class="error-message">
                    <h2>Oops!</h2>
                    <p>${escapeHTML(message)}</p>
                    <a href="search.html">
                        Back to Products
                    </a>
                </div>
            `;
        }
    }

    // HTML escape
    function escapeHTML(text) {

        return String(text).replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);
    }

    // Initialize
    loadProduct();

    updateCartCount();
    updateWishlistCount();

});
