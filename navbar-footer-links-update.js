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

    const homeLinks = document.querySelectorAll("#home, #home-footer");
    const modulesLinks = document.querySelectorAll("#modules, #modules-footer");
    const firstStepsLinks = document.querySelectorAll("#firststep, #firststep-footer");
    const theLibraryLinks = document.querySelectorAll("#the-library, #the-library-footer");

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
            "greenshield.ca": "/greenshield/home"
        };

        const modulesRedirects = {
            "gmail.com": "/colascanada/modules",
            "colascanada.ca": "/colascanada/modules",
            "blackandmcdonald.com": "/blackandmcdonald/modules",
            "greenshield.ca": "/greenshield/modules"
        };

        const firstStepsRedirects = {
            "gmail.com": "/colascanada/first-steps",
            "colascanada.ca": "/colascanada/first-steps",
            "blackandmcdonald.com": "/blackandmcdonald/first-steps",
            "greenshield.ca": "/greenshield/first-steps"
        };

        const theLibraryRedirects = {
            "gmail.com": "/colascanada/the-library",
            "colascanada.ca": "/colascanada/the-library",
            "blackandmcdonald.com": "/blackandmcdonald/the-library",
            "greenshield.ca": "/greenshield/the-library"
        };

        // ✅ Changed fallback to /login/home and /login/modules for unknown domains
        const newHomeLink = domainRedirects[userDomain] || "/login/home";
        const newModulesLink = modulesRedirects[userDomain] || "/login/modules";
        const newFirstStepsLink = modulesRedirects[userDomain] || "/login/first-steps";
        const newTheLibraryLink = modulesRedirects[userDomain] || "/login/the-library";

        homeLinks.forEach(link => link.href = newHomeLink);
        modulesLinks.forEach(link => link.href = newModulesLink);
        firstStepsLinks.forEach(link => link.href = newFirstStepsLink);
        theLibraryLinks.forEach(link => link.href = newTheLibraryLink);
    } else {
        homeLinks.forEach(link => link.href = "/"); // Optional: keep as is or point to login
        modulesLinks.forEach(link => link.href = "/modules"); // Optional: adjust for logged-out users
        firstStepsLinks.forEach(link => link.href = "/first-steps"); // Optional: adjust for logged-out users
        theLibraryLinks.forEach(link => link.href = "/the-library"); // Optional: adjust for logged-out users
    }
});