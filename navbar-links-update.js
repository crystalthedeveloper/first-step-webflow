// Navbar Links Update for Webflow with Supabase Authentication

document.addEventListener("DOMContentLoaded", async () => {
    // Wait for Supabase to load
    if (!window.supabaseClient) {
        console.error("❌ Supabase Client not found! Ensure `supabaseClient.js` is loaded first.");
        return;
    }

    const supabase = window.supabaseClient;

    // Fetch the user's session
    const { data: { session } } = await supabase.auth.getSession();
    const homeLink = document.getElementById("firststep");
    const modulesLink = document.getElementById("modules");
    
    if (!homeLink) {
        console.error("❌ Navbar link with ID 'firststep' not found.");
    }
    
    if (!modulesLink) {
        console.error("❌ Navbar link with ID 'modules' not found.");
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
        
        console.log(`🔄 Updating Home link to: ${newHomeLink}`);
        console.log(`🔄 Updating Modules link to: ${newModulesLink}`);
        
        if (homeLink) homeLink.href = newHomeLink;
        if (modulesLink) modulesLink.href = newModulesLink;
    } else {
        console.log("👤 User not logged in. Keeping default links.");
        if (homeLink) homeLink.href = "/"; // Default home link for non-logged-in users
        if (modulesLink) modulesLink.href = "/modules"; // Default modules link for non-logged-in users
    }
});