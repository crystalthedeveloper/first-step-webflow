// Signup Form
document.addEventListener("DOMContentLoaded", () => {
  if (!window.supabaseClient) {
    console.error("Supabase Client not found! Ensure `supabaseClient.js` is loaded first.");
    return;
  }

  const supabase = window.supabaseClient;
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
      // **Step 1: Register User in Supabase Auth**
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { first_name: firstName, last_name: lastName }
        }
      });

      if (error) throw error;

      // **Step 2: Add User to `users_access` as "pending"**
      console.log(`User signed up: ${email}`);
      await supabase.from("users_access").upsert([
        {
          email,
          first_name: firstName,
          last_name: lastName,
          status: "pending", // Pending until they confirm email
          created_at: new Date().toISOString(),
        }
      ]);

      // **Step 3: Redirect to login page**
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