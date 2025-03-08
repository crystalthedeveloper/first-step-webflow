// Navbar Links Update for Webflow with Supabase Authentication

document.addEventListener("DOMContentLoaded", async () => {
    const SUPABASE_URL = "https://hcchvhjuegysshozazad.supabase.co";
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjY2h2aGp1ZWd5c3Nob3phemFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5MzQ3OTUsImV4cCI6MjA1NTUxMDc5NX0.Y2cu9q58j8Ac8ApLp7uPcyvHx_-WFA-Wm7ZhIXBMRiE";
    
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // Fetch the user's session
    const { data: { session } } = await supabaseClient.auth.getSession();
    const homeLink = document.getElementById("firststep");
    
    if (!homeLink) {
        console.error("❌ Navbar link with ID 'firststep' not found.");
        return;
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
        
        const newLink = domainRedirects[userDomain] || "/user-pages/access-denied";
        
        console.log(`🔄 Updating Home link to: ${newLink}`);
        homeLink.href = newLink;
    } else {
        console.log("👤 User not logged in. Keeping default link.");
        homeLink.href = "/"; // Default home link for non-logged-in users
    }
});