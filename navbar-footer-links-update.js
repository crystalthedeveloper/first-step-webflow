// Navbar and Footer Links Update for Webflow with Supabase Authentication

document.addEventListener("DOMContentLoaded", async () => {
    // ✅ Wait for Supabase to load
    if (!window.supabaseClient) {
      console.error("Supabase Client not found! Ensure `supabaseClient.js` is loaded first.");
      return;
    }
  
    const supabase = window.supabaseClient;
  
    // ✅ Grab nav + footer links
    const homeLinks = document.querySelectorAll("#home, #home-footer");
    const modulesLinks = document.querySelectorAll("#modules, #modules-footer, #the-modules-button");
    const firstStepsLinks = document.querySelectorAll("#firststep, #firststep-footer, #first-steps-button");
    const theLibraryLinks = document.querySelectorAll("#the-library, #the-library-footer, #the-library-button");
  
    // ✅ Check if links exist
    if (homeLinks.length === 0) console.warn("Navbar or footer link with ID 'home' not found.");
    if (modulesLinks.length === 0) console.warn("Navbar or footer link with ID 'modules' not found.");
    if (firstStepsLinks.length === 0) console.warn("Navbar or footer link with ID 'firststep' not found.");
    if (theLibraryLinks.length === 0) console.warn("Navbar or footer link with ID 'the-library' not found.");
  
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
  
      if (!user) {
        // 👤 Not logged in: use public/default routes
        homeLinks.forEach(link => link.href = "/");
        modulesLinks.forEach(link => link.href = "/modules");
        firstStepsLinks.forEach(link => link.href = "/first-steps");
        theLibraryLinks.forEach(link => link.href = "/the-library");
        return;
      }
  
      // ✅ Get user from users_access
      const { data: userAccess, error: userAccessError } = await supabase
        .from("users_access")
        .select("company_id")
        .eq("email", user.email)
        .single();
  
      let basePath = "/login"; // Default for users without a company
  
      if (userAccess?.company_id) {
        const { data: companyData, error: companyError } = await supabase
          .from("companies")
          .select("redirect_url")
          .eq("id", userAccess.company_id)
          .single();
  
        if (companyData?.redirect_url) {
          const companyPath = new URL(companyData.redirect_url).pathname;
          basePath = `/${companyPath.split("/")[1]}`; // e.g. /colascanada
        }
      }
  
      // ✅ Set nav + footer links based on company or default
      homeLinks.forEach(link => link.href = `${basePath}/home`);
      modulesLinks.forEach(link => link.href = `${basePath}/modules`);
      firstStepsLinks.forEach(link => link.href = `${basePath}/first-steps`);
      theLibraryLinks.forEach(link => link.href = `${basePath}/the-library`);
  
    } catch (err) {
      console.error("Navbar update error:", err);
    }
  });  