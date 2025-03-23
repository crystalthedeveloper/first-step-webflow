// Login & Logout Button
document.addEventListener("DOMContentLoaded", async () => {
  if (!window.supabaseClient) return;

  const supabase = window.supabaseClient;
  const toggleBtns = document.querySelectorAll("#auth-toggle-btn, #auth-toggle-s-btn");

  if (!toggleBtns.length) return;

  async function updateAuthButtons() {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user || null;

      toggleBtns.forEach((btn) => {
        btn.textContent = user ? "Logout" : "Login";
        btn.dataset.authAction = user ? "logout" : "login";
      });
    } catch (err) {
      // silently fail
    }
  }

  await updateAuthButtons();

  toggleBtns.forEach((btn) => {
    btn.addEventListener("click", async () => {
      const authAction = btn.dataset.authAction;

      if (authAction === "logout") {
        try {
          const { error } = await supabase.auth.signOut();
          if (!error) {
            await updateAuthButtons();
            window.location.href = "https://firststep-46e83b.webflow.io/user-pages/log-in";
          }
        } catch (_) {
          // silently fail
        }
      } else if (authAction === "login") {
        try {
          const { data: sessionData } = await supabase.auth.getSession();
          const user = sessionData?.session?.user;

          if (!user) {
            window.location.href = "https://firststep-46e83b.webflow.io/user-pages/log-in";
            return;
          }

          const email = user.email;
          const domain = email.split("@")[1];
          let redirectUrl = "https://firststep-46e83b.webflow.io/login/home";

          const domainRedirects = {
            "gmail.com": "https://firststep-46e83b.webflow.io/colascanada/home",
            "colascanada.ca": "https://firststep-46e83b.webflow.io/colascanada/home",
            "blackandmcdonald.com": "https://firststep-46e83b.webflow.io/blackandmcdonald/home",
            "greenshield.ca": "https://firststep-46e83b.webflow.io/greenshield/home"
          };

          redirectUrl = domainRedirects[domain] || redirectUrl;
          window.location.href = redirectUrl;

        } catch (_) {
          // silently fail
        }
      }
    });
  });
});