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
      console.error("Auth button update failed:", err);
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
        } catch (err) {
          console.error("Logout error:", err);
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

          // 🔍 Check if user is in users_access
          const { data: userAccess, error: accessError } = await supabase
            .from("users_access")
            .select("company_id")
            .eq("email", email)
            .single();

          let redirectUrl = "https://firststep-46e83b.webflow.io/login/home";

          if (userAccess?.company_id) {
            // 🔍 Lookup the company redirect
            const { data: company, error: companyError } = await supabase
              .from("companies")
              .select("redirect_url")
              .eq("id", userAccess.company_id)
              .single();

            if (company?.redirect_url) {
              redirectUrl = company.redirect_url;
            }
          }

          // Optional: override with last visited page
          const lastVisitedPage = localStorage.getItem("lastVisitedPage");
          if (lastVisitedPage) redirectUrl = lastVisitedPage;

          console.log("🔄 Redirecting to:", redirectUrl);
          window.location.href = redirectUrl;

        } catch (err) {
          console.error("Login redirect error:", err);
        }
      }
    });
  });
});