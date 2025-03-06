// Signup Form
document.addEventListener("DOMContentLoaded", () => {
  const SUPABASE_URL = "https://hcchvhjuegysshozazad.supabase.co";
  const SUPABASE_KEY =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjY2h2aGp1ZWd5c3Nob3phemFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5MzQ3OTUsImV4cCI6MjA1NTUxMDc5NX0.Y2cu9q58j8Ac8ApLp7uPcyvHx_-WFA-Wm7ZhIXBMRiE";

  const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  const signupForm = document.querySelector("#signup-form");
  const errorContainer = document.querySelector("#error-messages");

  signupForm?.addEventListener("submit", async (event) => {
      event.preventDefault();
      errorContainer.textContent = "";

      // Get input values
      const email = document.querySelector("#signup-email")?.value.trim();
      const firstName = document.querySelector("#signup-first-name")?.value.trim();
      const lastName = document.querySelector("#signup-last-name")?.value.trim();
      const password = document.querySelector("#signup-password")?.value.trim();
      const agreePolicy = document.querySelector("#agree-policy")?.checked;
      const agreeMarketing = document.querySelector("#agree-marketing")?.checked;

      if (!email || !password || !firstName || !lastName) {
          errorContainer.textContent = "All fields are required.";
          errorContainer.style.color = "red";
          return;
      }

      if (password.length < 6) {
          errorContainer.textContent = "Password must be at least 6 characters long.";
          errorContainer.style.color = "red";
          return;
      }

      if (!agreePolicy) {
          errorContainer.textContent = "You must agree to the privacy policy and terms.";
          errorContainer.style.color = "red";
          return;
      }

      try {
          const domain = email.split("@")[1];

          // **Sign Up User with Supabase Auth**
          const { data, error } = await supabaseClient.auth.signUp({
              email,
              password
          });

          if (error) throw error;

          // **Wait for user confirmation (auth.getUser)**
          let confirmedUser = null;
          let retries = 0;
          while (!confirmedUser && retries < 10) {
              const { data: userData } = await supabaseClient.auth.getUser();
              if (userData?.user) {
                  confirmedUser = userData.user;
              } else {
                  await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1 second before retrying
              }
              retries++;
          }

          if (!confirmedUser) {
              errorContainer.textContent = "Please check your email to verify your account.";
              errorContainer.style.color = "red";
              return;
          }

          // **Add user to `users_access` table with 'pre-approved' status**
          const { error: insertError } = await supabaseClient
              .from("users_access")
              .insert([
                  {
                      email: email,
                      first_name: firstName,
                      last_name: lastName,
                      domain: domain,
                      role: "user",
                      status: "pre-approved",
                      created_at: new Date().toISOString()
                  }
              ]);

          if (insertError) {
              console.error("Error adding user to users_access:", insertError);
          }

          errorContainer.textContent = "Signup successful! Please verify your email.";
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