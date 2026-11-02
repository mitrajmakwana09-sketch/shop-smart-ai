
document.addEventListener("DOMContentLoaded", () => {

    const compareContainer = document.getElementById("compareContainer");
    const compareCount = document.getElementById("compareCount");
    const clearCompareBtn = document.getElementById("clearCompareBtn");

    const MAX_COMPARE_PRODUCTS = 4;

    let compareProducts = JSON.parse(
        localStorage.getItem("shopSmartCompare")
    ) || [];

    // ===============================
    // SAVE COMPARE PRODUCTS
    // ===============================

    function saveCompareProducts() {

        localStorage.setItem(
            "shopSmartCompare",
            JSON.stringify(compareProducts)
        );

        updateCompareCount();
    }

    // ===============================
    // ADD PRODUCT TO COMPARISON
    // ===============================

    function addToCompare(product) {

        if (!product || !product.id) {
            alert("Invalid product!");
            return;
        }

        const exists = compareProducts.some(
            item => item.id === product.id
        );

        if (exists) {
            alert("Product already added for comparison!");
            return;
        }

        if (compareProducts.length >= MAX_COMPARE_PRODUCTS) {
            alert("You can compare maximum 4 products!");
            return;
        }

        compareProducts.push({
            id: product.id,
            title: product.title,
            image: product.image,
            price: product.price,
            category: product.category,
            rating: product.rating.rate,
            reviews: product.rating.count,
            description: product.description
        });

        saveCompareProducts();

        displayCompareProducts();

        alert("Product added to comparison!");
    }

    // ===============================
    // DISPLAY COMPARE PRODUCTS
    // ===============================

    function displayCompareProducts() {

        if (!compareContainer) return;

        if (compareProducts.length === 0) {

            compareContainer.innerHTML = `
                <div class="empty-compare">

                    <h2>No Products to Compare</h2>

                    <p>
                        Add products to compare their prices,
                        ratings and features.
                    </p>

                    <a href="search.html">
                        Explore Products
                    </a>

                </div>
            `;

            return;
        }

        compareContainer.innerHTML = `
            <div class="compare-table-wrapper">

                <table class="compare-table">

                    <thead>
                        <tr>
                            <th>Specifications</th>

                            ${compareProducts.map(product => `
                                <th>
                                    ${escapeHTML(product.title)}
                                </th>
                            `).join("")}
                        </tr>
                    </thead>

                    <tbody>

                        <tr>
                            <td>Product Image</td>

                            ${compareProducts.map(product => `
                                <td>
                                    <img
                                        src="${product.image}"
                                        alt="${escapeHTML(product.title)}"
                                        class="compare-image"
                                    >
                                </td>
                            `).join("")}
                        </tr>

                        <tr>
                            <td>Price</td>

                            ${compareProducts.map(product => `
                                <td class="compare-price">
                                    ₹${(product.price * 85).toFixed(2)}
                                </td>
                            `).join("")}
                        </tr>

                        <tr>
                            <td>Category</td>

                            ${compareProducts.map(product => `
                                <td>
                                    ${escapeHTML(product.category)}
                                </td>
                            `).join("")}
                        </tr>

                        <tr>
                            <td>Rating</td>

                            ${compareProducts.map(product => `
                                <td>
                                    ⭐ ${product.rating}/5
                                </td>
                            `).join("")}
                        </tr>

                        <tr>
                            <td>Reviews</td>

                            ${compareProducts.map(product => `
                                <td>
                                    ${product.reviews}
                                </td>
                            `).join("")}
                        </tr>

                        <tr>
                            <td>Description</td>

                            ${compareProducts.map(product => `
                                <td>
                                    ${escapeHTML(product.description)}
                                </td>
                            `).join("")}
                        </tr>

                        <tr>
                            <td>Action</td>

                            ${compareProducts.map(product => `
                                <td>

                                    <button
                                        class="view-product-btn"
                                        data-id="${product.id}"
                                    >
                                        View Details
                                    </button>

                                    <button
                                        class="remove-compare-btn"
                                        data-id="${product.id}"
                                    >
                                        Remove
                                    </button>

                                </td>
                            `).join("")}
                        </tr>

                    </tbody>

                </table>

            </div>
        `;

        attachCompareEvents();
    }

    // ===============================
    // COMPARE EVENTS
    // ===============================

    function attachCompareEvents() {

        document.querySelectorAll(".remove-compare-btn")
            .forEach(button => {

                button.addEventListener("click", () => {

                    const productId = Number(button.dataset.id);

                    removeCompareProduct(productId);
                });
            });

        document.querySelectorAll(".view-product-btn")
            .forEach(button => {

                button.addEventListener("click", () => {

                    const productId = button.dataset.id;

                    window.location.href =
                        `product-details.html?id=${productId}`;
                });
            });
    }

    // ===============================
    // REMOVE PRODUCT
    // ===============================

    function removeCompareProduct(productId) {

        compareProducts = compareProducts.filter(
            product => product.id !== productId
        );

        saveCompareProducts();

        displayCompareProducts();
    }

    // ===============================
    // CLEAR ALL PRODUCTS
    // ===============================

    function clearCompareProducts() {

        const confirmClear = confirm(
            "Are you sure you want to clear comparison?"
        );

        if (!confirmClear) return;

        compareProducts = [];

        saveCompareProducts();

        displayCompareProducts();
    }

    // ===============================
    // COMPARE COUNT
    // ===============================

    function updateCompareCount() {

        if (compareCount) {
            compareCount.textContent = compareProducts.length;
        }
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
    // CLEAR BUTTON
    // ===============================

    if (clearCompareBtn) {

        clearCompareBtn.addEventListener(
            "click",
            clearCompareProducts
        );
    }

    // ===============================
    // INITIALIZATION
    // ===============================

    displayCompareProducts();

    updateCompareCount();

    // Export function for other JS files
    window.addToCompare = addToCompare;

});
