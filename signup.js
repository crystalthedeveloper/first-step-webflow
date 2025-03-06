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
    const agreePolicy = document.querySelector("#agree-policy")?.checked;
    const agreeMarketing = document.querySelector("#agree-marketing")?.checked;

    // **Validation**
    if (!email || !password || !firstName || !lastName) {
      displayError("All fields are required.");
      return;
    }

    if (password.length < 6) {
      displayError("Password must be at least 6 characters long.");
      return;
    }

    if (!agreePolicy) {
      displayError("You must agree to the privacy policy and terms.");
      return;
    }

    try {
      const domain = email.split("@")[1];

      // **Step 1: Register the User in Supabase Auth**
      const { data, error } = await supabaseClient.auth.signUp({ email, password });

      if (error) throw error;

      console.log("Signup initiated. Waiting for email confirmation...");

      // **Step 2: Wait for Email Confirmation**
      let emailConfirmed = false;
      let retries = 0;
      let userId = null;

      while (!emailConfirmed && retries < 10) {
        const { data: sessionData, error: sessionError } = await supabaseClient.auth.getUser();
        if (sessionError) console.error("Error checking user confirmation:", sessionError);

        if (sessionData?.user?.email_confirmed_at) {
          emailConfirmed = true;
          userId = sessionData.user.id; // Get the user ID from Supabase Auth
        }

        await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds
        retries++;
      }

      if (!emailConfirmed) {
        console.log("Resending email confirmation...");
        await supabaseClient.auth.resend({ type: "signup", email });

        displayError("Please check your email and verify your account.");
        return;
      }

      console.log("Email confirmed. Proceeding to database entry...");

      // **Step 3: Insert User into `users_access` Table**
      const { error: insertError } = await supabaseClient.from("users_access").insert([
        {
          id: userId, // Store the user's unique ID
          email,
          first_name: firstName,
          last_name: lastName,
          domain,
          role: "user",
          status: "approved", // Automatically approve after email confirmation
          created_at: new Date().toISOString(),
        },
      ]);

      if (insertError) {
        console.error("Error inserting into users_access:", insertError);
        displayError("Error creating user. Please try again later.");
        return;
      }

      // **Step 4: Success Message & Redirect**
      errorContainer.textContent = "Signup successful! Redirecting to login...";
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