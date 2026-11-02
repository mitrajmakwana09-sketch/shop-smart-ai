



document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("searchInput");
    const searchBtn = document.getElementById("searchBtn");
    const productContainer = document.getElementById("productContainer");
    const categoryFilter = document.getElementById("categoryFilter");
    const sortFilter = document.getElementById("sortFilter");

    let allProducts = [];

    // Fetch products from FakeStore API
    async function loadProducts() {
        try {
            const response = await fetch(
                "https://fakestoreapi.com/products"
            );

            if (!response.ok) {
                throw new Error("Failed to load products");
            }

            allProducts = await response.json();

            displayProducts(allProducts);
        } catch (error) {
            console.error("Error:", error);

            if (productContainer) {
                productContainer.innerHTML = `
                    <p class="error-message">
                        Unable to load products. Please try again.
                    </p>
                `;
            }
        }
    }

    // Display products
    function displayProducts(products) {
        if (!productContainer) return;

        if (products.length === 0) {
            productContainer.innerHTML = `
                <div class="no-products">
                    <h3>No Products Found</h3>
                    <p>Try searching for another product.</p>
                </div>
            `;
            return;
        }

        productContainer.innerHTML = products.map(product => `
            <div class="product-card">

                <img
                    src="${product.image}"
                    alt="${escapeHTML(product.title)}"
                    class="product-image"
                >

                <div class="product-info">
                    <h3>${escapeHTML(product.title)}</h3>

                    <p class="product-category">
                        ${escapeHTML(product.category)}
                    </p>

                    <div class="product-rating">
                        ⭐ ${product.rating.rate}
                        (${product.rating.count} reviews)
                    </div>

                    <h4 class="product-price">
                        ₹${(product.price * 85).toFixed(2)}
                    </h4>

                    <button
                        class="view-product-btn"
                        data-id="${product.id}"
                    >
                        View Details
                    </button>
                </div>

            </div>
        `).join("");

        // Product details navigation
        document.querySelectorAll(".view-product-btn").forEach(button => {
            button.addEventListener("click", () => {
                const productId = button.dataset.id;

                window.location.href =
                    `product-details.html?id=${productId}`;
            });
        });
    }

    // Search products
    function searchProducts() {
        const searchTerm = searchInput
            ? searchInput.value.trim().toLowerCase()
            : "";

        const selectedCategory = categoryFilter
            ? categoryFilter.value
            : "all";

        const selectedSort = sortFilter
            ? sortFilter.value
            : "default";

        let filteredProducts = allProducts.filter(product => {
            const title = product.title.toLowerCase();
            const category = product.category.toLowerCase();
            const description = product.description.toLowerCase();

            const matchesSearch =
                title.includes(searchTerm) ||
                category.includes(searchTerm) ||
                description.includes(searchTerm);

            const matchesCategory =
                selectedCategory === "all" ||
                product.category === selectedCategory;

            return matchesSearch && matchesCategory;
        });

        // Sorting
        if (selectedSort === "low-to-high") {
            filteredProducts.sort(
                (a, b) => a.price - b.price
            );
        }

        if (selectedSort === "high-to-low") {
            filteredProducts.sort(
                (a, b) => b.price - a.price
            );
        }

        if (selectedSort === "rating") {
            filteredProducts.sort(
                (a, b) => b.rating.rate - a.rating.rate
            );
        }

        displayProducts(filteredProducts);
    }

    // Prevent HTML injection in text fields
    function escapeHTML(text) {
        return String(text).replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);
    }

    // Live search
    if (searchInput) {
        searchInput.addEventListener("input", searchProducts);
    }

    // Search button
    if (searchBtn) {
        searchBtn.addEventListener("click", searchProducts);
    }

    // Enter key search
    if (searchInput) {
        searchInput.addEventListener("keydown", event => {
            if (event.key === "Enter") {
                searchProducts();
            }
        });
    }

    // Category filter
    if (categoryFilter) {
        categoryFilter.addEventListener(
            "change",
            searchProducts
        );
    }

    // Sorting filter
    if (sortFilter) {
        sortFilter.addEventListener(
            "change",
            searchProducts
        );
    }

    // Initial loading
    loadProducts();
});
