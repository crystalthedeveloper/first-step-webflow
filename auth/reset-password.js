/**
 * reset-password.js
 * -------------------------------
 * 🔐 Password Reset Request Script (Webflow + Supabase)
 * - Sends a reset password link to the user's email
 * - Displays success or error messages in the UI
 * - Uses Supabase's `resetPasswordForEmail()` method
 * - Redirects users to your custom password update page
 * -------------------------------
 */

document.addEventListener("DOMContentLoaded", () => {
    // ✅ Ensure Supabase client is available
    if (!window.supabaseClient) {
      console.error("❌ Supabase Client not found! Ensure `supabaseClient.js` is loaded first.");
      return;
    }
  
    const supabase = window.supabaseClient;
    const resetForm = document.querySelector("#reset-password-form");
    const messageContainer = document.querySelector("#message-container");
  
    // 💬 Helper to show success/error messages
    const displayMessage = (message, type = "success") => {
      messageContainer.textContent = message;
      messageContainer.className = `message-container ${type}`;
      messageContainer.style.display = "block";
    };
  
    // 🔄 Handle password reset request
    resetForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
  
      const email = document.querySelector("#reset-email")?.value.trim();
      if (!email) {
        displayMessage("Please enter your email.", "error");
        return;
      }
  
      try {
        console.log("📧 Sending password reset email to:", email);
  
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: "https://firststep-46e83b.webflow.io/user-pages/update-password",
        });
  
        if (error) throw error;
  
        displayMessage("✅ Password reset link sent! Check your inbox.", "success");
      } catch (err) {
        console.error("❌ Reset password error:", err.message);
        displayMessage(`❌ Error: ${err.message}`, "error");
      }
    });
  });  