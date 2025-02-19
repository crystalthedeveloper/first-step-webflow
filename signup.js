// signup
document.addEventListener("DOMContentLoaded", () => {
    const SUPABASE_URL = "https://hcchvhjuegysshozazad.supabase.co";
    const SUPABASE_KEY =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjY2h2aGp1ZWd5c3Nob3phemFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5MzQ3OTUsImV4cCI6MjA1NTUxMDc5NX0.Y2cu9q58j8Ac8ApLp7uPcyvHx_-WFA-Wm7ZhIXBMRiE";
  
    const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    const signupForm = document.querySelector("#signup-form");
    const errorContainer = document.querySelector("#error-messages");
  
    signupForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      errorContainer.textContent = ""; // Clear previous errors
  
      const email = document.querySelector("#signup-email")?.value.trim();
      const password = document.querySelector("#signup-password")?.value.trim();
      const firstName = document.querySelector("#signup-first-name")?.value.trim();
  
      try {
        const { data, error } = await supabaseClient.auth.signUp({
          email,
          password,
          options: { data: { first_name: firstName } },
        });
  
        if (error) throw error;
  
        errorContainer.textContent = "Signup successful! Verify your email.";
        errorContainer.style.color = "green";
  
        setTimeout(() => {
          window.location.href = "https://firststep-46e83b.webflow.io/user-pages/log-in";
        }, 2000);
      } catch (err) {
        errorContainer.textContent = `Signup failed: ${err.message}`;
        errorContainer.style.color = "red";
      }
    });
  });