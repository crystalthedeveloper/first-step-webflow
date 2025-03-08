// Login & Logout Button
document.addEventListener("DOMContentLoaded", async () => {
  // Wait for Supabase to load
  if (!window.supabaseClient) {
    console.error("❌ Supabase Client not found! Ensure `supabaseClient.js` is loaded first.");
    return;
  }

  const supabase = window.supabaseClient;
  const toggleBtns = document.querySelectorAll("#auth-toggle-btn, #auth-toggle-s-btn");

  if (!toggleBtns.length) {
    console.error("Auth toggle buttons not found!");
    return;
  }

  // **Function: Update buttons based on authentication status**
  async function updateAuthButtons() {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user || null;

      toggleBtns.forEach((btn) => {
        btn.textContent = user ? "Logout" : "Login";
        btn.dataset.authAction = user ? "logout" : "login";
      });
    } catch (err) {
      console.error("Error updating auth buttons:", err);
    }
  }

  await updateAuthButtons();

  // **Handle button click for login/logout**
  toggleBtns.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const authAction = btn.dataset.authAction;

      if (authAction === "logout") {
        try {
          const { error } = await supabase.auth.signOut();
          if (!error) {
            console.log("User logged out. Redirecting...");
            await updateAuthButtons();
            window.location.href = "https://firststep-46e83b.webflow.io/user-pages/log-in";
          } else {
            console.error("Logout error:", error);
          }
        } catch (error) {
          console.error("Logout error:", error);
        }
      } else if (authAction === "login") {
        try {
          // **Check user session**
          const { data: sessionData } = await supabase.auth.getSession();
          const user = sessionData?.session?.user;

          if (!user) {
            console.log("No active session. Redirecting to login...");
            window.location.href = "https://firststep-46e83b.webflow.io/user-pages/log-in";
            return;
          }

          const email = user.email;
          const domain = email.split("@")[1];

          let redirectUrl = "https://firststep-46e83b.webflow.io/colascanada/home"; // Default redirect

          const domainRedirects = {
            "gmail.com": "https://firststep-46e83b.webflow.io/colascanada/home",
            "colascanada.ca": "https://firststep-46e83b.webflow.io/colascanada/home",
            "blackandmcdonald.com": "https://firststep-46e83b.webflow.io/blackandmcdonald/home",
            "greenshield.ca": "https://firststep-46e83b.webflow.io/greenshield/home",
            "crystalthedeveloper.ca": "https://firststep-46e83b.webflow.io",
          };

          redirectUrl = domainRedirects[domain] || redirectUrl;
          console.log(`User logged in. Redirecting to ${redirectUrl}...`);
          window.location.href = redirectUrl;

        } catch (error) {
          console.error("Login error:", error);
        }
      }
    });
  });
});  