// Reset Password
document.addEventListener("DOMContentLoaded", () => {
    // Wait for Supabase to load
    if (!window.supabaseClient) {
        console.error("❌ Supabase Client not found! Ensure `supabaseClient.js` is loaded first.");
        return;
    }

    const supabase = window.supabaseClient;

    const resetForm = document.querySelector("#reset-password-form");
    const messageContainer = document.querySelector("#message-container");

    // Function to display messages
    const displayMessage = (message, type = "success") => {
        messageContainer.textContent = message;
        messageContainer.className = `message-container ${type}`;
        messageContainer.style.display = "block";
    };

    resetForm?.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = document.querySelector("#reset-email")?.value.trim();
        if (!email) {
            displayMessage("Please enter your email.", "error");
            return;
        }

        try {
            console.log("Sending reset password email for:", email);

            // Send the reset password email
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: "https://firststep-46e83b.webflow.io/user-pages/update-password",
            });

            if (error) throw error;

            displayMessage("✅ Password reset link sent! Check your inbox.", "success");
        } catch (err) {
            console.error("Reset password error:", err.message);
            displayMessage(`❌ Error: ${err.message}`, "error");
        }
    });
});