// Login
document.addEventListener("DOMContentLoaded", () => {
    if (!window.supabaseClient) {
      console.error("❌ Supabase Client not found! Ensure `supabaseClient.js` is loaded first.");
      return;
    }
  
    const supabase = window.supabaseClient;
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
        const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password });
  
        if (error) throw error;
  
        const { data: userSession } = await supabase.auth.getUser();
        const user = userSession?.user;
  
        if (!user || !user.email_confirmed_at) {
          displayError("Please verify your email before logging in.");
          return;
        }
  
        console.log(`✅ User authenticated: ${user.email}`);
  
        const firstName = user.user_metadata?.first_name || "Unknown";
        const lastName = user.user_metadata?.last_name || "Unknown";
  
        // 🔁 Check if user exists in users_access
        let { data: userData, error: userError } = await supabase
          .from("users_access")
          .select("id, company_id")
          .eq("email", email)
          .single();
  
        // ➕ Create user if not found (default to no company)
        if (!userData) {
          console.log("🚀 User not found in users_access. Adding them...");
          const upsertResult = await supabase
            .from("users_access")
            .upsert([
              {
                id: user.id,
                email,
                first_name: firstName,
                last_name: lastName,
                company_id: null, // ✅ default to no company
                role: "user",
                status: "approved",
                created_at: new Date().toISOString(),
              },
            ])
            .select()
            .single();
          userData = upsertResult.data;
        }
  
        // ✅ Default redirect
        let redirectUrl = "https://firststep-46e83b.webflow.io/login/home";
  
        // 🔍 If user has a company, get its redirect_url
        if (userData.company_id) {
          const { data: companyData, error: companyError } = await supabase
            .from("companies")
            .select("redirect_url")
            .eq("id", userData.company_id)
            .single();
  
          if (companyData?.redirect_url) {
            redirectUrl = companyData.redirect_url;
          }
        }
  
        // ✅ Last visited fallback
        const lastVisitedPage = localStorage.getItem("lastVisitedPage");
        redirectUrl = lastVisitedPage || redirectUrl;
  
        console.log(`🔄 Redirecting user to: ${redirectUrl}`);
        formError.textContent = "Login successful! Redirecting...";
        formError.style.color = "green";
  
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 2000);
  
      } catch (err) {
        displayError(`Login failed: ${err.message}`);
        console.error("❌ Login Error:", err);
      }
    });
  });  