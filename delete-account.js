// Delete Account
document.addEventListener("DOMContentLoaded", () => {
    const deleteForm = document.querySelector("#delete-account-form");
    const notification = document.querySelector("#notification");
  
    // Utility to display notifications
    const displayNotification = (message, isError = false) => {
      notification.textContent = message;
      notification.style.color = isError ? "red" : "green";
      notification.style.display = "block";
    };
  
    deleteForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
  
      // Clear previous notifications
      displayNotification("");
  
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
        const response = await fetch(
          "https://user-auth-supabase.vercel.app/api/delete-account",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ email }),
          }
        );
  
        const result = await response.json();
  
        if (!response.ok) {
          throw new Error(result.error || "Failed to delete account");
        }
  
        displayNotification("Account deleted successfully!");
        setTimeout(() => {
          window.location.href = "https://firststep-46e83b.webflow.io";
        }, 1500); // Redirect after 1.5 seconds
      } catch (err) {
        console.error("Delete account error:", err.message);
        displayNotification(`Error: ${err.message}`, true);
      }
    });
  });