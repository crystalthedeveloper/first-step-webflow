/**
 * delete-account.js
 * -------------------------------
 * ❌ Account Deletion Handler (Webflow + Supabase API)
 * - Allows users to delete their account by entering email
 * - Confirms before proceeding with deletion
 * - Sends request to custom API endpoint
 * - Displays success or error messages and redirects user
 * -------------------------------
 */

document.addEventListener("DOMContentLoaded", () => {
  const deleteForm = document.querySelector("#delete-account-form");
  const notification = document.querySelector("#notification");

  // 💬 Display status message
  const displayNotification = (message, isError = false) => {
    notification.textContent = message;
    notification.style.color = isError ? "red" : "green";
    notification.style.display = "block";
  };

  // 🗑️ Handle account deletion
  deleteForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    displayNotification(""); // Clear any previous messages

    const email = document.querySelector("#delete-account-email")?.value.trim();

    if (!email) {
      displayNotification("Please enter your email.", true);
      return;
    }

    const confirmation = confirm(
      "Are you sure you want to delete your account? This action cannot be undone!"
    );

    if (!confirmation) return;

    try {
      // 📡 Send deletion request to serverless API
      const response = await fetch("https://user-auth-supabase.vercel.app/api/delete-account", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to delete account");
      }

      displayNotification("✅ Account deleted successfully!");

      setTimeout(() => {
        window.location.href = "https://www.takethefirststep.me";
      }, 1500); // Redirect after 1.5 seconds

    } catch (err) {
      console.error("❌ Delete account error:", err.message);
      displayNotification(`Error: ${err.message}`, true);
    }
  });
});