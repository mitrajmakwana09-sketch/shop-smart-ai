
document.addEventListener("DOMContentLoaded", () => {

    const profileName = document.getElementById("profileName");
    const profileEmail = document.getElementById("profileEmail");
    const profilePhone = document.getElementById("profilePhone");
    const profileAddress = document.getElementById("profileAddress");
    const profileImage = document.getElementById("profileImage");

    const editProfileBtn = document.getElementById("editProfileBtn");
    const saveProfileBtn = document.getElementById("saveProfileBtn");
    const cancelProfileBtn = document.getElementById("cancelProfileBtn");
    const logoutBtn = document.getElementById("logoutBtn");

    const editProfileForm = document.getElementById("editProfileForm");

    const nameInput = document.getElementById("nameInput");
    const emailInput = document.getElementById("emailInput");
    const phoneInput = document.getElementById("phoneInput");
    const addressInput = document.getElementById("addressInput");
    const imageInput = document.getElementById("imageInput");

    // Default user profile
    const defaultProfile = {
        name: "Shop Smart User",
        email: "user@shopsmart.com",
        phone: "",
        address: "",
        image: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
    };

    // Load profile from localStorage
    function getProfile() {
        const savedProfile = localStorage.getItem("shopSmartProfile");

        if (savedProfile) {
            try {
                return {
                    ...defaultProfile,
                    ...JSON.parse(savedProfile)
                };
            } catch {
                return { ...defaultProfile };
            }
        }

        return { ...defaultProfile };
    }

    let userProfile = getProfile();

    // Display profile information
    function displayProfile() {
        if (profileName) {
            profileName.textContent = userProfile.name;
        }

        if (profileEmail) {
            profileEmail.textContent = userProfile.email;
        }

        if (profilePhone) {
            profilePhone.textContent =
                userProfile.phone || "Not added";
        }

        if (profileAddress) {
            profileAddress.textContent =
                userProfile.address || "Not added";
        }

        if (profileImage) {
            profileImage.src = userProfile.image;
        }
    }

    // Open edit profile
    if (editProfileBtn) {
        editProfileBtn.addEventListener("click", () => {

            if (nameInput) {
                nameInput.value = userProfile.name;
            }

            if (emailInput) {
                emailInput.value = userProfile.email;
            }

            if (phoneInput) {
                phoneInput.value = userProfile.phone;
            }

            if (addressInput) {
                addressInput.value = userProfile.address;
            }

            if (editProfileForm) {
                editProfileForm.style.display = "block";
            }
        });
    }

    // Save profile
    if (saveProfileBtn) {
        saveProfileBtn.addEventListener("click", () => {

            const newName = nameInput.value.trim();
            const newEmail = emailInput.value.trim();
            const newPhone = phoneInput.value.trim();
            const newAddress = addressInput.value.trim();

            if (!newName || !newEmail) {
                alert("Name and Email are required!");
                return;
            }

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailPattern.test(newEmail)) {
                alert("Please enter a valid email address.");
                return;
            }

            userProfile.name = newName;
            userProfile.email = newEmail;
            userProfile.phone = newPhone;
            userProfile.address = newAddress;

            // Save profile
            localStorage.setItem(
                "shopSmartProfile",
                JSON.stringify(userProfile)
            );

            displayProfile();

            if (editProfileForm) {
                editProfileForm.style.display = "none";
            }

            alert("Profile updated successfully!");
        });
    }

    // Cancel editing
    if (cancelProfileBtn) {
        cancelProfileBtn.addEventListener("click", () => {

            if (editProfileForm) {
                editProfileForm.style.display = "none";
            }
        });
    }

    // Upload profile image
    if (imageInput) {
        imageInput.addEventListener("change", event => {

            const file = event.target.files[0];

            if (!file) return;

            if (!file.type.startsWith("image/")) {
                alert("Please select a valid image.");
                return;
            }

            if (file.size > 2 * 1024 * 1024) {
                alert("Image size must be less than 2MB.");
                return;
            }

            const reader = new FileReader();

            reader.onload = function () {

                userProfile.image = reader.result;

                localStorage.setItem(
                    "shopSmartProfile",
                    JSON.stringify(userProfile)
                );

                displayProfile();

                alert("Profile image updated!");
            };

            reader.readAsDataURL(file);
        });
    }

    // Logout
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

    // Initial profile display
    displayProfile();

});
