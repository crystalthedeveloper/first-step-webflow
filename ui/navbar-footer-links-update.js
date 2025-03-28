/**
 * navbar-footer-links-update.js
 * -------------------------------
 * 🔗 Dynamic Navbar & Footer Link Handler (Webflow + Supabase)
 * - Updates navigation and footer links based on authenticated user
 * - If logged in, uses the user's associated company's redirect path
 * - If not logged in, defaults to public routes
 * -------------------------------
 */

document.addEventListener("DOMContentLoaded", async () => {
  // ✅ Ensure Supabase client is available
  if (!window.supabaseClient) {
    console.error("❌ Supabase Client not found! Ensure `supabaseClient.js` is loaded first.");
    return;
  }

  const supabase = window.supabaseClient;

  // 🔗 Select nav + footer elements by ID
  const homeLinks = document.querySelectorAll("#home, #home-footer");
  const modulesLinks = document.querySelectorAll("#modules, #modules-footer, #the-modules-button");
  const firstStepsLinks = document.querySelectorAll("#firststep, #firststep-footer, #first-steps-button");
  const theLibraryLinks = document.querySelectorAll("#the-library, #the-library-footer, #the-library-button");

  // 🚨 Warn if expected links are missing
  if (homeLinks.length === 0) console.warn("⚠️ Navbar or footer link with ID 'home' not found.");
  if (modulesLinks.length === 0) console.warn("⚠️ Navbar or footer link with ID 'modules' not found.");
  if (firstStepsLinks.length === 0) console.warn("⚠️ Navbar or footer link with ID 'firststep' not found.");
  if (theLibraryLinks.length === 0) console.warn("⚠️ Navbar or footer link with ID 'the-library' not found.");

  try {
    // 🔐 Get session and check if user is logged in
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;

    // 👤 Public (not logged in) routes
    if (!user) {
      homeLinks.forEach(link => link.href = "/");
      modulesLinks.forEach(link => link.href = "/modules");
      firstStepsLinks.forEach(link => link.href = "/first-steps");
      theLibraryLinks.forEach(link => link.href = "/the-library");
      return;
    }

    // ✅ Fetch user's company association
    const { data: userAccess } = await supabase
      .from("users_access")
      .select("company_id")
      .eq("email", user.email)
      .single();

    let basePath = "/login"; // Default path if no company found

    if (userAccess?.company_id) {
      const { data: companyData } = await supabase
        .from("companies")
        .select("redirect_url")
        .eq("id", userAccess.company_id)
        .single();

      if (companyData?.redirect_url) {
        const companyPath = new URL(companyData.redirect_url).pathname;
        basePath = `/${companyPath.split("/")[1]}`; // e.g. "/colascanada"
      }
    }

    // 🛠️ Update all relevant links
    homeLinks.forEach(link => link.href = `${basePath}/home`);
    modulesLinks.forEach(link => link.href = `${basePath}/modules`);
    firstStepsLinks.forEach(link => link.href = `${basePath}/first-steps`);
    theLibraryLinks.forEach(link => link.href = `${basePath}/the-library`);

  } catch (err) {
    console.error("❌ Navbar update error:", err);
  }
});