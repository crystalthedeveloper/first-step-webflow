// Navbar and Footer Links Update for Webflow with Supabase Authentication

document.addEventListener("DOMContentLoaded", async () => {
    // Wait for Supabase to load
    if (!window.supabaseClient) {
        console.error("Supabase Client not found! Ensure `supabaseClient.js` is loaded first.");
        return;
    }

    const supabase = window.supabaseClient;

    // Fetch the user's session
    const { data: { session } } = await supabase.auth.getSession();
    
    const homeLinks = document.querySelectorAll("#firststep, #firststep-footer");
    const modulesLinks = document.querySelectorAll("#modules, #modules-footer");
    
    if (homeLinks.length === 0) {
        console.error("Navbar or footer link with ID 'firststep' not found.");
    }
    
    if (modulesLinks.length === 0) {
        console.error("Navbar or footer link with ID 'modules' not found.");
    }
    
    if (session && session.user) {
        const userEmail = session.user.email;
        const userDomain = userEmail.split("@")[1]?.toLowerCase();
        
        const domainRedirects = {
            "gmail.com": "/colascanada/home",
            "colascanada.ca": "/colascanada/home",
            "blackandmcdonald.com": "/blackandmcdonald/home",
            "greenshield.ca": "/greenshield/home",
            "crystalthedeveloper.ca": "/"
        };
        
        const modulesRedirects = {
            "gmail.com": "/colascanada/modules",
            "colascanada.ca": "/colascanada/modules",
            "blackandmcdonald.com": "/blackandmcdonald/modules",
            "greenshield.ca": "/greenshield/modules",
            "crystalthedeveloper.ca": "/modules"
        };
        
        const newHomeLink = domainRedirects[userDomain] || "/user-pages/access-denied";
        const newModulesLink = modulesRedirects[userDomain] || "/user-pages/access-denied";
        
        console.log(`🔄 Updating Home links to: ${newHomeLink}`);
        console.log(`🔄 Updating Modules links to: ${newModulesLink}`);
        
        homeLinks.forEach(link => link.href = newHomeLink);
        modulesLinks.forEach(link => link.href = newModulesLink);
    } else {
        console.log("👤 User not logged in. Keeping default links.");
        homeLinks.forEach(link => link.href = "/"); // Default home link for non-logged-in users
        modulesLinks.forEach(link => link.href = "/modules"); // Default modules link for non-logged-in users
    }
});