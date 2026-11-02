
document.addEventListener("DOMContentLoaded", () => {

    const productDetails = document.getElementById("productDetails");
    const relatedProducts = document.getElementById("relatedProducts");

    let currentProduct = null;
    let quantity = 1;

    const params = new URLSearchParams(window.location.search);
    const productId = params.get("id");

    // Load Product Details
    async function loadProductDetails() {

        if (!productId) {
            showError("Product ID is missing.");
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

            loadRelatedProducts(currentProduct.category);

        } catch (error) {
            console.error(error);
            showError("Unable to load product.");
        }
    }

    // Display Product
    function displayProduct(product) {

        if (!productDetails) return;

        productDetails.innerHTML = `
            <div class="product-details-wrapper">

                <div class="product-gallery">

                    <div class="main-image-box">
                        <img
                            id="mainProductImage"
                            src="${product.image}"
                            alt="${escapeHTML(product.title)}"
                        >
                    </div>

                </div>

                <div class="product-details-info">

                    <p class="product-category">
                        ${escapeHTML(product.category)}
                    </p>

                    <h1>${escapeHTML(product.title)}</h1>

                    <div class="rating">
                        ⭐ ${product.rating.rate}
                        <span>
                            (${product.rating.count} Reviews)
                        </span>
                    </div>

                    <h2 class="price">
                        ₹${(product.price * 85).toFixed(2)}
                    </h2>

                    <p class="description">
                        ${escapeHTML(product.description)}
                    </p>

                    <div class="stock-status">
                        <span>✔ In Stock</span>
                    </div>

                    <div class="quantity-box">

                        <button id="minusBtn">−</button>

                        <span id="quantity">1</span>

                        <button id="plusBtn">+</button>

                    </div>

                    <div class="action-buttons">

                        <button id="addCartBtn">
                            🛒 Add to Cart
                        </button>

                        <button id="buyNowBtn">
                            Buy Now
                        </button>

                        <button id="wishlistBtn">
                            ♡ Add to Wishlist
                        </button>

                    </div>

                    <div class="product-benefits">

                        <p>🚚 Free Delivery</p>
                        <p>🔒 Secure Shopping</p>
                        <p>↩ Easy Returns</p>

                    </div>

                </div>

            </div>
        `;

        attachProductEvents();
    }

    // Quantity and Buttons
    function attachProductEvents() {

        const minusBtn = document.getElementById("minusBtn");
        const plusBtn = document.getElementById("plusBtn");
        const quantityDisplay = document.getElementById("quantity");

        minusBtn.addEventListener("click", () => {

            if (quantity > 1) {
                quantity--;
                quantityDisplay.textContent = quantity;
            }

        });

        plusBtn.addEventListener("click", () => {

            if (quantity < 10) {
                quantity++;
                quantityDisplay.textContent = quantity;
            }

        });

        document.getElementById("addCartBtn")
            .addEventListener("click", addToCart);

        document.getElementById("buyNowBtn")
            .addEventListener("click", buyNow);

        document.getElementById("wishlistBtn")
            .addEventListener("click", addToWishlist);
    }

    // Add To Cart
    function addToCart() {

        if (!currentProduct) return;

        let cart = JSON.parse(
            localStorage.getItem("shopSmartCart")
        ) || [];

        const existingItem = cart.find(
            item => item.id === currentProduct.id
        );

        if (existingItem) {

            existingItem.quantity += quantity;

        } else {

            cart.push({
                id: currentProduct.id,
                title: currentProduct.title,
                image: currentProduct.image,
                price: currentProduct.price,
                quantity: quantity
            });

        }

        localStorage.setItem(
            "shopSmartCart",
            JSON.stringify(cart)
        );

        updateCartCount();

        alert("Product added to cart!");
    }

    // Buy Now
    function buyNow() {

        addToCart();

        window.location.href = "cart.html";
    }

    // Wishlist
    function addToWishlist() {

        if (!currentProduct) return;

        let wishlist = JSON.parse(
            localStorage.getItem("shopSmartWishlist")
        ) || [];

        const exists = wishlist.some(
            item => item.id === currentProduct.id
        );

        if (exists) {

            alert("Already added to wishlist!");

        } else {

            wishlist.push({
                id: currentProduct.id,
                title: currentProduct.title,
                image: currentProduct.image,
                price: currentProduct.price
            });

            localStorage.setItem(
                "shopSmartWishlist",
                JSON.stringify(wishlist)
            );

            updateWishlistCount();

            alert("Product added to wishlist!");
        }
    }

    // Related Products
    async function loadRelatedProducts(category) {

        if (!relatedProducts) return;

        try {
            const response = await fetch(
                "https://fakestoreapi.com/products"
            );

            const products = await response.json();

            const filteredProducts = products.filter(
                product =>
                    product.category === category &&
                    product.id !== currentProduct.id
            );

            relatedProducts.innerHTML =
                filteredProducts.map(product => `
                    <div class="related-product-card">

                        <img
                            src="${product.image}"
                            alt="${escapeHTML(product.title)}"
                        >

                        <h3>${escapeHTML(product.title)}</h3>

                        <p>
                            ₹${(product.price * 85).toFixed(2)}
                        </p>

                        <button
                            onclick="window.location.href='product-details.html?id=${product.id}'"
                        >
                            View Details
                        </button>

                    </div>
                `).join("");

        } catch (error) {
            console.error("Related products error:", error);
        }
    }

    // Cart Count
    function updateCartCount() {

        const cart = JSON.parse(
            localStorage.getItem("shopSmartCart")
        ) || [];

        const count = cart.reduce(
            (total, item) => total + item.quantity,
            0
        );

        const cartCount = document.getElementById("cartCount");

        if (cartCount) {
            cartCount.textContent = count;
        }
    }

    // Wishlist Count
    function updateWishlistCount() {

        const wishlist = JSON.parse(
            localStorage.getItem("shopSmartWishlist")
        ) || [];

        const wishlistCount =
            document.getElementById("wishlistCount");

        if (wishlistCount) {
            wishlistCount.textContent = wishlist.length;
        }
    }

    // Error
    function showError(message) {

        if (productDetails) {
            productDetails.innerHTML = `
                <div class="error-box">
                    <h2>Product Not Found</h2>
                    <p>${escapeHTML(message)}</p>

                    <a href="search.html">
                        Back to Shopping
                    </a>
                </div>
            `;
        }
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

    // Initialize
    loadProductDetails();

    updateCartCount();
    updateWishlistCount();

});
