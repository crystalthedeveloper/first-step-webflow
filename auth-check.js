//auth-check.js - Check for user session
document.addEventListener("DOMContentLoaded", async () => {
    if (!window.supabaseClient) return;
  
    const supabase = window.supabaseClient;
  
    // ✅ Define protected folders
    const protectedFolders = [
      "/colascanada/",
      "/blackandmcdonald/",
      "/greenshield/",
      "/login/",
      "/user-pages/user-account",
      "/first-steps",
      "/the-library"
    ];
  
    const currentPath = window.location.pathname;
    const isProtected = protectedFolders.some(folder => currentPath.startsWith(folder));
  
    if (!isProtected) return;
  
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  
      if (sessionError || !sessionData.session) {
        window.location.href = "/user-pages/log-in";
        return;
      }
  
      const user = sessionData.session.user;
  
      // 🔍 Lookup user info and get their company_id
      const { data: userAccess, error: userAccessError } = await supabase
        .from("users_access")
        .select("company_id")
        .eq("email", user.email)
        .single();
  
      const companyId = userAccess?.company_id || null;
  
      // ✅ Allow access to /login/ pages if user is NOT in a company
      if (!companyId && currentPath.startsWith("/login/")) {
        localStorage.setItem("lastVisitedPage", currentPath);
        return;
      }
  
      // 🔍 Fetch company to determine allowed path prefix
      if (!companyId) {
        window.location.href = "/access-denied";
        return;
      }
  
      const { data: companyData, error: companyError } = await supabase
        .from("companies")
        .select("redirect_url")
        .eq("id", companyId)
        .single();
  
      if (companyError || !companyData?.redirect_url) {
        window.location.href = "/access-denied";
        return;
      }
  
      // ✅ Derive allowed prefix from redirect_url
      const redirectPath = new URL(companyData.redirect_url).pathname;
      const basePath = redirectPath.split("/")[1]; // e.g. "colascanada"
      const allowedPrefix = `/${basePath}/`;
  
      const alwaysAllowed = [
        "/user-pages/user-account",
        "/first-steps",
        "/the-library"
      ];
  
      const isAllowed =
        currentPath.startsWith(allowedPrefix) ||
        alwaysAllowed.some(path => currentPath.startsWith(path));
  
      if (!isAllowed) {
        window.location.href = "/access-denied";
        return;
      }
  
      // ✅ Save last visited page
      localStorage.setItem("lastVisitedPage", currentPath);
    } catch (err) {
      console.error("auth-check failed:", err);
      window.location.href = "/user-pages/log-in";
    }
  
    // ✅ Auth state listener
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session && event === "SIGNED_IN") {
        try {
          const email = session.user.email;
  
          const { data: userAccess } = await supabase
            .from("users_access")
            .select("company_id")
            .eq("email", email)
            .single();
  
          const companyId = userAccess?.company_id || null;
  
          // Independent user → send to login/home
          if (!companyId) {
            const lastVisitedPage = localStorage.getItem("lastVisitedPage") || "/login/home";
            window.location.href = lastVisitedPage;
            return;
          }
  
          const { data: companyData } = await supabase
            .from("companies")
            .select("redirect_url")
            .eq("id", companyId)
            .single();
  
          const redirectPath = new URL(companyData?.redirect_url || "/login/home").pathname;
          const lastVisitedPage = localStorage.getItem("lastVisitedPage") || redirectPath;
  
          window.location.href = lastVisitedPage;
        } catch (err) {
          console.error("auth state error:", err);
          window.location.href = "/access-denied";
        }
      } else if (!session) {
        window.location.href = "/user-pages/log-in";
      }
    });
  });  