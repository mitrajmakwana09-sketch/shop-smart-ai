
document.addEventListener("DOMContentLoaded", () => {

    // =========================================
    // SHOP SMART AI ASSISTANT CONFIGURATION
    // =========================================

    const API_URL = "https://fakestoreapi.com/products";
    const INR_RATE = 85;

    let products = [];
    let isTyping = false;

    // =========================================
    // HTML ELEMENTS
    // =========================================

    const chatBox = document.getElementById("aiChatBox");
    const chatInput = document.getElementById("aiChatInput");
    const sendBtn = document.getElementById("aiSendBtn");
    const clearChatBtn = document.getElementById("aiClearChat");

    const suggestionButtons =
        document.querySelectorAll(".ai-suggestion");

    // =========================================
    // LOAD PRODUCTS
    // =========================================

    async function loadProducts() {

        try {

            const response = await fetch(API_URL);

            if (!response.ok) {
                throw new Error("Product API failed");
            }

            products = await response.json();

        } catch (error) {

            console.error(
                "AI Assistant Product Loading Error:",
                error
            );

            products = [];

        }

    }

    // =========================================
    // FORMAT PRICE
    // =========================================

    function formatPrice(price) {

        return "₹" + Number(price).toLocaleString("en-IN", {
            maximumFractionDigits: 2
        });

    }

    // =========================================
    // ESCAPE HTML
    // =========================================

    function escapeHTML(value) {

        return String(value).replace(/[&<>"']/g, character => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);

    }

    // =========================================
    // ADD CHAT MESSAGE
    // =========================================

    function addMessage(message, sender = "bot") {

        if (!chatBox) return;

        const messageElement =
            document.createElement("div");

        messageElement.className =
            sender === "user"
                ? "ai-message user-message"
                : "ai-message bot-message";

        const content =
            document.createElement("div");

        content.className = "ai-message-content";

        content.textContent = message;

        messageElement.appendChild(content);

        chatBox.appendChild(messageElement);

        chatBox.scrollTop = chatBox.scrollHeight;

    }

    // =========================================
    // ADD PRODUCT MESSAGE
    // =========================================

    function addProductMessage(product) {

        if (!chatBox) return;

        const messageElement =
            document.createElement("div");

        messageElement.className =
            "ai-message bot-message";

        const productCard =
            document.createElement("div");

        productCard.className =
            "ai-product-card";

        const image =
            document.createElement("img");

        image.src = product.image;
        image.alt = product.title;
        image.loading = "lazy";

        const title =
            document.createElement("h4");

        title.textContent = product.title;

        const price =
            document.createElement("p");

        price.className = "ai-product-price";

        price.textContent =
            formatPrice(product.price * INR_RATE);

        const rating =
            document.createElement("p");

        rating.textContent =
            "⭐ " +
            (product.rating?.rate || "N/A");

        const detailsLink =
            document.createElement("a");

        detailsLink.href =
            "product-details.html?id=" + product.id;

        detailsLink.className =
            "ai-product-link";

        detailsLink.textContent =
            "View Product";

        productCard.appendChild(image);
        productCard.appendChild(title);
        productCard.appendChild(price);
        productCard.appendChild(rating);
        productCard.appendChild(detailsLink);

        messageElement.appendChild(productCard);

        chatBox.appendChild(messageElement);

        chatBox.scrollTop = chatBox.scrollHeight;

    }

    // =========================================
    // TYPING ANIMATION
    // =========================================

    function showTyping() {

        if (!chatBox) return null;

        const typingElement =
            document.createElement("div");

        typingElement.className =
            "ai-message bot-message ai-typing";

        typingElement.textContent =
            "Shop Smart AI is typing...";

        chatBox.appendChild(typingElement);

        chatBox.scrollTop = chatBox.scrollHeight;

        return typingElement;

    }

    // =========================================
    // SEARCH PRODUCTS
    // =========================================

    function searchProducts(query) {

        const searchTerm =
            query.toLowerCase().trim();

        return products.filter(product => {

            const title =
                product.title.toLowerCase();

            const category =
                product.category.toLowerCase();

            const description =
                product.description.toLowerCase();

            return (
                title.includes(searchTerm) ||
                category.includes(searchTerm) ||
                description.includes(searchTerm)
            );

        });

    }

    // =========================================
    // GET CHEAPEST PRODUCTS
    // =========================================

    function getCheapestProducts(limit = 3) {

        return [...products]
            .sort((a, b) => a.price - b.price)
            .slice(0, limit);

    }

    // =========================================
    // GET TOP RATED PRODUCTS
    // =========================================

    function getTopRatedProducts(limit = 3) {

        return [...products]
            .sort(
                (a, b) =>
                    (b.rating?.rate || 0) -
                    (a.rating?.rate || 0)
            )
            .slice(0, limit);

    }

    // =========================================
    // PRODUCT CATEGORY
    // =========================================

    function getCategoryProducts(category) {

        return products.filter(product =>
            product.category.toLowerCase()
                .includes(category.toLowerCase())
        );

    }

    // =========================================
    // CART DATA
    // =========================================

    function getCart() {

        return JSON.parse(
            localStorage.getItem("shopSmartCart")
        ) || [];

    }

    // =========================================
    // AI RESPONSE GENERATOR
    // =========================================

    function generateResponse(message) {

        const query =
            message.toLowerCase().trim();

        // Greetings
        if (
            query.includes("hello") ||
            query.includes("hi") ||
            query.includes("hey")
        ) {

            return {
                text:
                    "Hello! 👋 Welcome to Shop Smart AI. " +
                    "I can help you find products, compare prices, " +
                    "and discover shopping recommendations."
            };

        }

        // Help
        if (
            query.includes("help") ||
            query.includes("what can you do")
        ) {

            return {
                text:
                    "I can help you with:\n\n" +
                    "🔍 Find products\n" +
                    "💰 Find affordable products\n" +
                    "⭐ Recommend top-rated products\n" +
                    "👕 Search product categories\n" +
                    "🛒 Check your cart\n\n" +
                    "Try asking: Show me cheap products."
            };

        }

        // Cart
        if (
            query.includes("my cart") ||
            query.includes("cart") ||
            query.includes("shopping cart")
        ) {

            const cart = getCart();

            if (cart.length === 0) {

                return {
                    text:
                        "Your shopping cart is currently empty. " +
                        "Would you like me to recommend some products?"
                };

            }

            const totalItems = cart.reduce(
                (sum, item) =>
                    sum + Number(item.quantity || 0),
                0
            );

            const totalPrice = cart.reduce(
                (sum, item) =>
                    sum +
                    item.price *
                    item.quantity *
                    INR_RATE,
                0
            );

            return {
                text:
                    "🛒 Your cart contains " +
                    totalItems +
                    " item(s).\n\n" +
                    "Estimated total: " +
                    formatPrice(totalPrice) +
                    "\n\nYou can visit your cart to manage your products."
            };

        }

        // Cheapest products
        if (
            query.includes("cheap") ||
            query.includes("cheapest") ||
            query.includes("low price") ||
            query.includes("affordable")
        ) {

            return {
                text:
                    "Here are some affordable products for you:",
                products: getCheapestProducts(3)
            };

        }

        // Top rated
        if (
            query.includes("top rated") ||
            query.includes("best product") ||
            query.includes("best rated") ||
            query.includes("popular")
        ) {

            return {
                text:
                    "⭐ Here are some top-rated products:",
                products: getTopRatedProducts(3)
            };

        }

        // Electronics
        if (query.includes("electronics")) {

            return {
                text:
                    "Here are some electronics products:",
                products:
                    getCategoryProducts("electronics").slice(0, 3)
            };

        }

        // Men's Clothing
        if (
            query.includes("men's clothing") ||
            query.includes("mens clothing") ||
            query.includes("men clothing")
        ) {

            return {
                text:
                    "Here are some men's clothing products:",
                products:
                    getCategoryProducts("men's clothing").slice(0, 3)
            };

        }

        // Women's Clothing
        if (
            query.includes("women's clothing") ||
            query.includes("womens clothing") ||
            query.includes("women clothing")
        ) {

            return {
                text:
                    "Here are some women's clothing products:",
                products:
                    getCategoryProducts("women's clothing").slice(0, 3)
            };

        }

        // Jewelry
        if (
            query.includes("jewelry") ||
            query.includes("jewellery")
        ) {

            return {
                text:
                    "Here are some jewelry products:",
                products:
                    getCategoryProducts("jewelery").slice(0, 3)
            };

        }

        // Search product name
        const results = searchProducts(query);

        if (results.length > 0) {

            return {
                text:
                    "🔍 I found these products matching your search:",
                products: results.slice(0, 3)
            };

        }

        // Default response
        return {
            text:
                "Sorry, I couldn't find an exact match. 😕\n\n" +
                "Try searching for:\n" +
                "• Electronics\n" +
                "• Men's clothing\n" +
                "• Women's clothing\n" +
                "• Jewelry\n" +
                "• Cheap products\n" +
                "• Top-rated products"
        };

    }

    // =========================================
    // SEND MESSAGE
    // =========================================

    async function sendMessage() {

        if (!chatInput || isTyping) return;

        const message =
            chatInput.value.trim();

        if (!message) return;

        addMessage(message, "user");

        chatInput.value = "";

        isTyping = true;

        if (sendBtn) {
            sendBtn.disabled = true;
        }

        const typingElement = showTyping();

        await new Promise(resolve =>
            setTimeout(resolve, 700)
        );

        if (typingElement) {
            typingElement.remove();
        }

        const response =
            generateResponse(message);

        addMessage(response.text, "bot");

        if (response.products) {

            if (response.products.length === 0) {

                addMessage(
                    "No products are available in this category right now.",
                    "bot"
                );

            } else {

                response.products.forEach(product => {
                    addProductMessage(product);
                });

            }

        }

        isTyping = false;

        if (sendBtn) {
            sendBtn.disabled = false;
        }

        chatInput.focus();

    }

    // =========================================
    // SEND BUTTON
    // =========================================

    if (sendBtn) {

        sendBtn.addEventListener(
            "click",
            sendMessage
        );

    }

    // =========================================
    // ENTER KEY
    // =========================================

    if (chatInput) {

        chatInput.addEventListener(
            "keydown",
            event => {

                if (event.key === "Enter") {

                    event.preventDefault();

                    sendMessage();

                }

            }
        );

    }

    // =========================================
    // QUICK SUGGESTIONS
    // =========================================

    suggestionButtons.forEach(button => {

        button.addEventListener("click", () => {

            if (!chatInput) return;

            chatInput.value =
                button.dataset.message ||
                button.textContent.trim();

            sendMessage();

        });

    });

    // =========================================
    // CLEAR CHAT
    // =========================================

    if (clearChatBtn) {

        clearChatBtn.addEventListener(
            "click",
            () => {

                if (!chatBox) return;

                chatBox.innerHTML = "";

                addMessage(
                    "Hello! 👋 I'm Shop Smart AI. " +
                    "How can I help you today?",
                    "bot"
                );

            }
        );

    }

    // =========================================
    // INITIALIZE ASSISTANT
    // =========================================

    async function initializeAssistant() {

        await loadProducts();

        addMessage(
            "Hello! 👋 Welcome to Shop Smart AI.\n\n" +
            "I can help you find products, discover " +
            "affordable items, and get shopping recommendations.\n\n" +
            "What are you looking for today?",
            "bot"
        );

    }

    initializeAssistant();

});
