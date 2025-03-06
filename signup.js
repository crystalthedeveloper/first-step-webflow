// Signup Form
document.addEventListener("DOMContentLoaded", () => {
  const SUPABASE_URL = "https://hcchvhjuegysshozazad.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjY2h2aGp1ZWd5c3Nob3phemFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5MzQ3OTUsImV4cCI6MjA1NTUxMDc5NX0.Y2cu9q58j8Ac8ApLp7uPcyvHx_-WFA-Wm7ZhIXBMRiE";

  const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  const signupForm = document.querySelector("#signup-form");
  const errorContainer = document.querySelector("#error-messages");

  function displayError(message) {
    errorContainer.textContent = message;
    errorContainer.style.color = "red";
  }

  signupForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    errorContainer.textContent = "";

    // **Get input values**
    const email = document.querySelector("#signup-email")?.value.trim();
    const firstName = document.querySelector("#signup-first-name")?.value.trim();
    const lastName = document.querySelector("#signup-last-name")?.value.trim();
    const password = document.querySelector("#signup-password")?.value.trim();

    if (!email || !password || !firstName || !lastName) {
      displayError("All fields are required.");
      return;
    }

    if (password.length < 6) {
      displayError("Password must be at least 6 characters long.");
      return;
    }

    try {
      // **Step 1: Register User with Metadata**
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName
          }
        }
      });

      if (error) throw error;

      // **Step 2: Redirect User**
      errorContainer.textContent = "Signup successful! Check your email to verify your account.";
      errorContainer.style.color = "green";

      setTimeout(() => {
        window.location.href = "https://firststep-46e83b.webflow.io/user-pages/log-in";
      }, 3000);
    } catch (err) {
      displayError(`Signup failed: ${err.message}`);
      console.error("Signup Error:", err);
    }
  });
});