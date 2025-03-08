// update password
document.addEventListener("DOMContentLoaded", () => {
  // Wait for Supabase to load
  if (!window.supabaseClient) {
    console.error("❌ Supabase Client not found! Ensure `supabaseClient.js` is loaded first.");
    return;
  }

  const supabase = window.supabaseClient;

  const updateForm = document.querySelector("#update-password-form");
  const messageContainer = document.querySelector("#message-container");

  function displayMessage(message, type = "error") {
    messageContainer.innerHTML = `<p class="${type}">${message}</p>`;
    messageContainer.style.display = "block";
  }

  updateForm?.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Clear any previous messages
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

      displayMessage("Password updated successfully! Redirecting...", "success");

      // Redirect after a short delay
      setTimeout(() => {
        window.location.href = "https://firststep-46e83b.webflow.io/user-pages/log-in";
      }, 2000);
    } catch (err) {
      displayMessage(`Error: ${err.message}`, "error");
      console.error("Update password error:", err.message);
    }
  });
});