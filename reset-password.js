// Reset Password
document.addEventListener("DOMContentLoaded", () => {
    const SUPABASE_URL = "https://hcchvhjuegysshozazad.supabase.co";
    const SUPABASE_KEY =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjY2h2aGp1ZWd5c3Nob3phemFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5MzQ3OTUsImV4cCI6MjA1NTUxMDc5NX0.Y2cu9q58j8Ac8ApLp7uPcyvHx_-WFA-Wm7ZhIXBMRiE";

    const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

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
            const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
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