//auth-check.js
// Check for user session
document.addEventListener("DOMContentLoaded", async () => {
    const SUPABASE_URL = "https://hcchvhjuegysshozazad.supabase.co";
    const SUPABASE_KEY =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjY2h2aGp1ZWd5c3Nob3phemFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5MzQ3OTUsImV4cCI6MjA1NTUxMDc5NX0.Y2cu9q58j8Ac8ApLp7uPcyvHx_-WFA-Wm7ZhIXBMRiE";

    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // **Define domain-based redirects**
    const domainRedirects = {
        "gmail.com": "https://firststep-46e83b.webflow.io/colascanada/home",
        "colascanada.ca": "https://firststep-46e83b.webflow.io/colascanada/home",
        "blackandmcdonald.com": "https://firststep-46e83b.webflow.io/blackandmcdonald/home",
        "greenshield.ca": "https://firststep-46e83b.webflow.io/greenshield/home",
        "crystalthedeveloper.ca": "https://firststep-46e83b.webflow.io",
    };

    try {
        // **Check for active session**
        const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();

        if (sessionError || !sessionData.session) {
            console.warn("No active session. Redirecting to login page.");
            window.location.href = "https://firststep-46e83b.webflow.io/user-pages/log-in";
            return;
        }

        // **Extract user email and domain**
        const email = sessionData.session.user.email;
        const domain = email.split("@")[1]?.toLowerCase(); // Normalize domain

        console.log("User logged in with domain:", domain);

        // **Redirect User**
        const redirectUrl = domainRedirects[domain] || "https://firststep-46e83b.webflow.io/access-denied";
        console.log(`Redirecting user to: ${redirectUrl}`);
        window.location.href = redirectUrl;

    } catch (err) {
        console.error("Session error:", err);
        window.location.href = "https://firststep-46e83b.webflow.io/user-pages/log-in";
    }

    // **Handle Auth State Changes (Logout/Login)**
    supabaseClient.auth.onAuthStateChange((event, session) => {
        if (session && event === "SIGNED_IN") {
            const email = session.user.email;
            const domain = email.split("@")[1]?.toLowerCase();

            console.log("Auth change detected. User signed in:", domain);

            const redirectUrl = domainRedirects[domain] || "https://firststep-46e83b.webflow.io/access-denied";
            console.log(`Redirecting user to: ${redirectUrl}`);
            window.location.href = redirectUrl;
        } else if (!session) {
            console.log("Auth change detected. User logged out. Redirecting...");
            window.location.href = "https://firststep-46e83b.webflow.io/user-pages/log-in";
        }
    });
});