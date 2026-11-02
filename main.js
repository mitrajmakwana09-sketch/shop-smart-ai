
document.addEventListener("DOMContentLoaded", () => {

    const featuredProducts = document.getElementById("featuredProducts");
    const trendingProducts = document.getElementById("trendingProducts");
    const categoryContainer = document.getElementById("categoryContainer");

    const homeSearchInput = document.getElementById("homeSearchInput");
    const homeSearchBtn = document.getElementById("homeSearchBtn");

    const newsletterForm = document.getElementById("newsletterForm");

    let allProducts = [];

    // ===============================
    // LOAD PRODUCTS
    // ===============================

    async function loadProducts() {

        try {

            const response = await fetch(
                "https://fakestoreapi.com/products"
            );

            if (!response.ok) {
                throw new Error("Failed to fetch products");
            }

            allProducts = await response.json();

            displayFeaturedProducts();
            displayTrendingProducts();
            displayCategories();

        } catch (error) {

            console.error("Product loading error:", error);

            if (featuredProducts) {
                featuredProducts.innerHTML = `
                    <p class="error-message">
                        Unable to load products.
                    </p>
                `;
            }
        }
    }

    // ===============================
    // FEATURED PRODUCTS
    // ===============================

    function displayFeaturedProducts() {

        if (!featuredProducts) return;

        const featured = [...allProducts]
            .sort((a, b) => b.rating.rate - a.rating.rate)
            .slice(0, 4);

        featuredProducts.innerHTML = featured.map(product => `
            <div class="product-card">

                <div class="product-image-box">

                    <img
                        src="${product.image}"
                        alt="${escapeHTML(product.title)}"
                        loading="lazy"
                    >

                    <button
                        class="wishlist-btn"
                        data-id="${product.id}"
                    >
                        ♡
                    </button>

                </div>

                <div class="product-info">

                    <p class="product-category">
                        ${escapeHTML(product.category)}
                    </p>

                    <h3>
                        ${escapeHTML(product.title)}
                    </h3>

                    <div class="product-rating">
                        ⭐ ${product.rating.rate}
                    </div>

                    <div class="product-price">
                        ₹${(product.price * 85).toFixed(2)}
                    </div>

                    <button
                        class="view-product-btn"
                        data-id="${product.id}"
                    >
                        View Product
                    </button>

                </div>

            </div>
        `).join("");

        attachProductEvents(featuredProducts);
    }

    // ===============================
    // TRENDING PRODUCTS
    // ===============================

    function displayTrendingProducts() {

        if (!trendingProducts) return;

        const trending = [...allProducts]
            .sort((a, b) => b.rating.count - a.rating.count)
            .slice(0, 4);

        trendingProducts.innerHTML = trending.map(product => `
            <div class="product-card">

                <img
                    src="${product.image}"
                    alt="${escapeHTML(product.title)}"
                    loading="lazy"
                >

                <h3>
                    ${escapeHTML(product.title)}
                </h3>

                <p>
                    ⭐ ${product.rating.rate}
                </p>

                <h4>
                    ₹${(product.price * 85).toFixed(2)}
                </h4>

                <button
                    class="view-product-btn"
                    data-id="${product.id}"
                >
                    View Details
                </button>

            </div>
        `).join("");

        attachProductEvents(trendingProducts);
    }

    // ===============================
    // PRODUCT EVENTS
    // ===============================

    function attachProductEvents(container) {

        if (!container) return;

        container.querySelectorAll(".view-product-btn")
            .forEach(button => {

                button.addEventListener("click", () => {

                    const productId = button.dataset.id;

                    window.location.href =
                        `product-details.html?id=${productId}`;
                });
            });

        container.querySelectorAll(".wishlist-btn")
            .forEach(button => {

                button.addEventListener("click", () => {

                    addToWishlist(button.dataset.id);
                });
            });
    }

    // ===============================
    // WISHLIST
    // ===============================

    function addToWishlist(productId) {

        const product = allProducts.find(
            item => item.id === Number(productId)
        );

        if (!product) return;

        let wishlist = JSON.parse(
            localStorage.getItem("shopSmartWishlist")
        ) || [];

        const exists = wishlist.some(
            item => item.id === product.id
        );

        if (exists) {

            alert("Product already in wishlist!");

            return;
        }

        wishlist.push({
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.image
        });

        localStorage.setItem(
            "shopSmartWishlist",
            JSON.stringify(wishlist)
        );

        alert("Added to wishlist successfully!");
    }

    // ===============================
    // CATEGORIES
    // ===============================

    function displayCategories() {

        if (!categoryContainer) return;

        const categories = [
            ...new Set(allProducts.map(product => product.category))
        ];

        categoryContainer.innerHTML = categories.map(category => `

            <div class="category-card">

                <div class="category-icon">
                    🛍️
                </div>

                <h3>
                    ${escapeHTML(category)}
                </h3>

                <button
                    class="category-btn"
                    data-category="${escapeHTML(category)}"
                >
                    Explore
                </button>

            </div>

        `).join("");

        categoryContainer.querySelectorAll(".category-btn")
            .forEach(button => {

                button.addEventListener("click", () => {

                    const category = button.dataset.category;

                    window.location.href =
                        `search.html?category=${encodeURIComponent(category)}`;
                });
            });
    }

    // ===============================
    // HOMEPAGE SEARCH
    // ===============================

    function performSearch() {

        if (!homeSearchInput) return;

        const searchValue = homeSearchInput.value.trim();

        if (searchValue === "") {

            alert("Please enter a product name.");

            return;
        }

        window.location.href =
            `search.html?q=${encodeURIComponent(searchValue)}`;
    }

    if (homeSearchBtn) {

        homeSearchBtn.addEventListener(
            "click",
            performSearch
        );
    }

    if (homeSearchInput) {

        homeSearchInput.addEventListener("keydown", event => {

            if (event.key === "Enter") {
                performSearch();
            }
        });
    }

    // ===============================
    // NEWSLETTER
    // ===============================

    if (newsletterForm) {

        newsletterForm.addEventListener("submit", event => {

            event.preventDefault();

            const emailInput =
                document.getElementById("newsletterEmail");

            if (!emailInput) return;

            const email = emailInput.value.trim();

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailPattern.test(email)) {

                alert("Please enter a valid email address.");

                return;
            }

            let subscribers = JSON.parse(
                localStorage.getItem("shopSmartSubscribers")
            ) || [];

            if (subscribers.includes(email)) {

                alert("You are already subscribed!");

                return;
            }

            subscribers.push(email);

            localStorage.setItem(
                "shopSmartSubscribers",
                JSON.stringify(subscribers)
            );

            alert("Successfully subscribed!");

            newsletterForm.reset();
        });
    }

    // ===============================
    // HTML ESCAPE
    // ===============================

    function escapeHTML(text) {

        return String(text).replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);
    }

    // ===============================
    // INITIALIZATION
    // ===============================

    loadProducts();

});
