/**
 * update-password.js
 * -------------------------------
 * 🔐 Update Password Script (Webflow + Supabase)
 * - Allows users to set a new password after clicking the reset email link
 * - Uses Supabase's `updateUser()` to apply the new password
 * - Displays error, info, or success messages
 * - Redirects user to login page after update
 * -------------------------------
 */

document.addEventListener("DOMContentLoaded", () => {
  // ✅ Ensure Supabase is loaded
  if (!window.supabaseClient) {
    console.error("❌ Supabase Client not found! Ensure `supabaseClient.js` is loaded first.");
    return;
  }

  const supabase = window.supabaseClient;
  const updateForm = document.querySelector("#update-password-form");
  const messageContainer = document.querySelector("#message-container");

  // 💬 Helper to display messages with styles
  function displayMessage(message, type = "error") {
    messageContainer.innerHTML = `<p class="${type}">${message}</p>`;
    messageContainer.style.display = "block";
  }

  // 🔄 Handle form submission
  updateForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    messageContainer.innerHTML = "";
    messageContainer.style.display = "none";

    const newPassword = document.querySelector("#new-password")?.value.trim();

    if (!newPassword) {
      displayMessage("Please enter a new password.", "error");
      return;
    }

    try {
      displayMessage("Updating password...", "info");

      const { error } = await supabase.auth.updateUser({ password: newPassword });

      if (error) throw error;

      displayMessage("✅ Password updated successfully! Redirecting...", "success");

      setTimeout(() => {
        window.location.href = "https://www.takethefirststep.me/user-pages/log-in";
      }, 2000);
    } catch (err) {
      displayMessage(`❌ Error: ${err.message}`, "error");
      console.error("❌ Update password error:", err.message);
    }
  });
});