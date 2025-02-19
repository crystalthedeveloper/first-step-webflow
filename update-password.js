// update password
document.addEventListener("DOMContentLoaded", () => {
    const SUPABASE_URL = "https://hcchvhjuegysshozazad.supabase.co";
    const SUPABASE_KEY =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjY2h2aGp1ZWd5c3Nob3phemFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5MzQ3OTUsImV4cCI6MjA1NTUxMDc5NX0.Y2cu9q58j8Ac8ApLp7uPcyvHx_-WFA-Wm7ZhIXBMRiE";
  
    const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  
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
  
        const { error } = await supabaseClient.auth.updateUser({ password: newPassword });
  
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