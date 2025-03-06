// Signup Form
document.addEventListener("DOMContentLoaded", () => {
  const SUPABASE_URL = "https://hcchvhjuegysshozazad.supabase.co";
  const SUPABASE_KEY =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjY2h2aGp1ZWd5c3Nob3phemFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5MzQ3OTUsImV4cCI6MjA1NTUxMDc5NX0.Y2cu9q58j8Ac8ApLp7uPcyvHx_-WFA-Wm7ZhIXBMRiE";

  const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  const signupForm = document.querySelector("#signup-form");
  const errorContainer = document.querySelector("#error-messages");

  // Allowed email domains
  const allowedDomains = ["colascanada.ca", "blackandmcdonald.com", "greenshield.ca", "crystalthedeveloper.ca"];

  signupForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      errorContainer.textContent = ""; // Clear previous errors

      const email = document.querySelector("#signup-email")?.value.trim();
      const password = document.querySelector("#signup-password")?.value.trim();
      const firstName = document.querySelector("#signup-first-name")?.value.trim();

      // **Validation Checks**
      if (!email || !password || !firstName) {
          errorContainer.textContent = "All fields are required.";
          errorContainer.style.color = "red";
          return;
      }

      if (password.length < 6) {
          errorContainer.textContent = "Password must be at least 6 characters long.";
          errorContainer.style.color = "red";
          return;
      }

      // Extract email domain
      const domain = email.split("@")[1];

      // **Check if the email domain is allowed**
      if (!allowedDomains.includes(domain)) {
          errorContainer.textContent = "Signups are restricted to approved company emails.";
          errorContainer.style.color = "red";
          return;
      }

      try {
          // **Signup User with Supabase**
          const { data, error } = await supabaseClient.auth.signUp({
              email,
              password,
              options: { data: { first_name: firstName } },
          });

          if (error) throw error;

          errorContainer.textContent = "Signup successful! Please verify your email.";
          errorContainer.style.color = "green";

          // **Redirect to login page after 2 seconds**
          setTimeout(() => {
              window.location.href = "https://firststep-46e83b.webflow.io/user-pages/log-in";
          }, 2000);
      } catch (err) {
          errorContainer.textContent = `Signup failed: ${err.message}`;
          errorContainer.style.color = "red";
      }
  });
});