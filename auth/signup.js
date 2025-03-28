/**
 * signup.js
 * -------------------------------
 * 📝 Signup Form Script (Webflow + Supabase)
 * - Registers a user via Supabase Auth
 * - Stores additional user details in `users_access` table
 * - Sets status to "pending" until email verification is complete
 * - Redirects to login page after successful signup
 * -------------------------------
 */

document.addEventListener("DOMContentLoaded", () => {
  // ✅ Ensure Supabase is available
  if (!window.supabaseClient) {
    console.error("❌ Supabase Client not found! Ensure `supabaseClient.js` is loaded first.");
    return;
  }

  const supabase = window.supabaseClient;
  const signupForm = document.querySelector("#signup-form");
  const errorContainer = document.querySelector("#error-messages");

  // 🔴 Display error message in UI
  function displayError(message) {
    errorContainer.textContent = message;
    errorContainer.style.color = "red";
  }

  // 🔄 Handle signup form submission
  signupForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    errorContainer.textContent = "";

    // ✅ Collect user inputs
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
      // ✅ Step 1: Sign up with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
          },
          emailRedirectTo: "https://firststep-46e83b.webflow.io/user-pages/log-in",
        },
      });

      if (error) throw error;

      console.log(`✅ User signed up: ${email}`);

      // ✅ Step 2: Add user to `users_access` table
      await supabase.from("users_access").upsert([
        {
          email,
          first_name: firstName,
          last_name: lastName,
          status: "pending",         // Email not verified yet
          company_id: null,          // No company assigned
          created_at: new Date().toISOString(),
        },
      ]);

      // ✅ Step 3: Show success and redirect
      errorContainer.textContent = "Signup successful! Check your email to verify your account.";
      errorContainer.style.color = "green";

      setTimeout(() => {
        window.location.href = "https://firststep-46e83b.webflow.io/user-pages/log-in";
      }, 3000);

    } catch (err) {
      displayError(`Signup failed: ${err.message}`);
      console.error("❌ Signup Error:", err);
    }
  });
});