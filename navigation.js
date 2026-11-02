
document.addEventListener("DOMContentLoaded", () => {

    const menuToggle = document.getElementById("menuToggle");
    const navMenu = document.getElementById("navMenu");
    const navLinks = document.querySelectorAll(".nav-link");

    const cartCount = document.getElementById("cartCount");
    const wishlistCount = document.getElementById("wishlistCount");

    const profileLink = document.getElementById("profileLink");
    const loginLink = document.getElementById("loginLink");

    const themeToggle = document.getElementById("themeToggle");

    // Mobile Menu
    if (menuToggle && navMenu) {

        menuToggle.addEventListener("click", () => {

            navMenu.classList.toggle("active");

            const isOpen = navMenu.classList.contains("active");

            menuToggle.innerHTML = isOpen ? "✕" : "☰";

            menuToggle.setAttribute(
                "aria-expanded",
                isOpen.toString()
            );
        });
    }

    // Close menu after clicking navigation link
    navLinks.forEach(link => {

        link.addEventListener("click", () => {

            if (navMenu) {
                navMenu.classList.remove("active");
            }

            if (menuToggle) {
                menuToggle.innerHTML = "☰";
                menuToggle.setAttribute("aria-expanded", "false");
            }
        });
    });

    // Active Page Highlight
    function setActivePage() {

        const currentPage = window.location.pathname
            .split("/")
            .pop()
            .toLowerCase();

        navLinks.forEach(link => {

            const linkPage = link.getAttribute("href")
                ?.split("/")
                .pop()
                .toLowerCase();

            if (linkPage === currentPage) {

                link.classList.add("active");

                link.setAttribute("aria-current", "page");

            } else {

                link.classList.remove("active");

                link.removeAttribute("aria-current");
            }
        });
    }

    // Cart Count
    function updateCartCount() {

        const cart = JSON.parse(
            localStorage.getItem("shopSmartCart")
        ) || [];

        const totalItems = cart.reduce(
            (total, item) => total + Number(item.quantity || 0),
            0
        );

        if (cartCount) {
            cartCount.textContent = totalItems;
        }
    }

    // Wishlist Count
    function updateWishlistCount() {

        const wishlist = JSON.parse(
            localStorage.getItem("shopSmartWishlist")
        ) || [];

        if (wishlistCount) {
            wishlistCount.textContent = wishlist.length;
        }
    }

    // User Authentication UI
    function updateUserNavigation() {

        const loggedInUser = localStorage.getItem("loggedInUser");

        if (loggedInUser) {

            if (profileLink) {
                profileLink.style.display = "inline-flex";
            }

            if (loginLink) {
                loginLink.style.display = "none";
            }

        } else {

            if (profileLink) {
                profileLink.style.display = "none";
            }

            if (loginLink) {
                loginLink.style.display = "inline-flex";
            }
        }
    }

    // Dark Mode
    function initializeTheme() {

        const savedTheme = localStorage.getItem("shopSmartTheme");

        const theme = savedTheme || "light";

        document.documentElement.setAttribute(
            "data-theme",
            theme
        );

        updateThemeButton(theme);
    }

    function updateThemeButton(theme) {

        if (themeToggle) {

            themeToggle.innerHTML =
                theme === "dark" ? "☀️" : "🌙";

            themeToggle.setAttribute(
                "aria-label",
                theme === "dark"
                    ? "Switch to light mode"
                    : "Switch to dark mode"
            );
        }
    }

    if (themeToggle) {

        themeToggle.addEventListener("click", () => {

            const currentTheme =
                document.documentElement.getAttribute("data-theme");

            const newTheme =
                currentTheme === "dark" ? "light" : "dark";

            document.documentElement.setAttribute(
                "data-theme",
                newTheme
            );

            localStorage.setItem(
                "shopSmartTheme",
                newTheme
            );

            updateThemeButton(newTheme);
        });
    }

    // Logout
    const logoutBtn = document.getElementById("logoutBtn");

    if (logoutBtn) {

        logoutBtn.addEventListener("click", () => {

            const confirmLogout = confirm(
                "Are you sure you want to logout?"
            );

            if (confirmLogout) {

                localStorage.removeItem("loggedInUser");

                window.location.href = "login.html";
            }
        });
    }

    // Initialize Navigation
    setActivePage();

    updateCartCount();

    updateWishlistCount();

    updateUserNavigation();

    initializeTheme();

});
