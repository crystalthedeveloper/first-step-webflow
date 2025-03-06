// Login
document.addEventListener("DOMContentLoaded", () => {
    const SUPABASE_URL = "https://hcchvhjuegysshozazad.supabase.co";
    const SUPABASE_KEY =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjY2h2aGp1ZWd5c3Nob3phemFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5MzQ3OTUsImV4cCI6MjA1NTUxMDc5NX0.Y2cu9q58j8Ac8ApLp7uPcyvHx_-WFA-Wm7ZhIXBMRiE";
  
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    const loginForm = document.querySelector("#login-form");
    const formError = document.querySelector("#form-error");
  
    function displayError(message) {
      formError.textContent = message;
      formError.style.color = "red";
    }
  
    loginForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      formError.textContent = "";
  
      const email = document.querySelector("#login-email")?.value.trim();
      const password = document.querySelector("#login-password")?.value.trim();
  
      if (!email || !password) {
        displayError("Please enter both email and password.");
        return;
      }
  
      try {
        // **Step 1: Authenticate User with Supabase**
        const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
  
        if (error) throw error;
  
        // **Step 2: Ensure Email is Verified**
        const { data: userSession } = await supabaseClient.auth.getUser();
        if (!userSession?.user?.email_confirmed_at) {
          displayError("Please verify your email before logging in.");
          return;
        }
  
        console.log("User authenticated. Checking access table...");
  
        // **Step 3: Check if User is in `users_access`**
        const { data: userData, error: userError } = await supabaseClient
          .from("users_access")
          .select("first_name, last_name, domain, status")
          .eq("email", email)
          .single();
  
        if (userError || !userData) {
          displayError("Access denied. Your email is not pre-approved.");
          return;
        }
  
        // **Step 4: Ensure User is Approved**
        if (userData.status !== "approved") {
          displayError("Your account is pending approval. Please wait for admin approval.");
          return;
        }
  
        // **Step 5: Redirect Users Based on Domain**
        let redirectUrl = "https://firststep-46e83b.webflow.io"; // Default page
  
        const domainRedirects = {
          "colascanada.ca": "https://firststep-46e83b.webflow.io/colascanada/home",
          "blackandmcdonald.com": "https://firststep-46e83b.webflow.io/blackandmcdonald/home",
          "greenshield.ca": "https://firststep-46e83b.webflow.io/greenshield/home",
          "crystalthedeveloper.ca": "https://firststep-46e83b.webflow.io",
        };
  
        redirectUrl = domainRedirects[userData.domain] || redirectUrl;
  
        // **Step 6: Success Message & Redirect**
        formError.textContent = `Welcome, ${userData.first_name}! Redirecting...`;
        formError.style.color = "green";
  
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 2000);
      } catch (err) {
        displayError(`Login failed: ${err.message}`);
        console.error("Login Error:", err);
      }
    });
  });  