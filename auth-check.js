//auth-check.js
// Check for user session
document.addEventListener("DOMContentLoaded", async () => {
    const SUPABASE_URL = "https://hcchvhjuegysshozazad.supabase.co";
    const SUPABASE_KEY =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjY2h2aGp1ZWd5c3Nob3phemFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5MzQ3OTUsImV4cCI6MjA1NTUxMDc5NX0.Y2cu9q58j8Ac8ApLp7uPcyvHx_-WFA-Wm7ZhIXBMRiE";

    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    // **Folders that require authentication**
    const protectedFolders = ["/colascanada/", "/blackandmcdonald/", "/greenshield/"];

    // **User access rules based on email domain**
    const domainAccess = {
        "colascanada.ca": "/colascanada/",
        "gmail.com": "/colascanada/",
        "blackandmcdonald.com": "/blackandmcdonald/",
        "greenshield.ca": "/greenshield/",
        "crystalthedeveloper.ca": "/", // Crystal gets access to homepage
    };

    // **Check if the page requires authentication**
    const currentPath = window.location.pathname;
    const isProtected = protectedFolders.some(folder => currentPath.startsWith(folder));

    if (!isProtected) {
        console.log("This page does not require authentication.");
        return; // Stop script if page is public
    }

    try {
        // **Check for active session**
        const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();

        if (sessionError || !sessionData.session) {
            console.warn("No active session. Redirecting to login page.");
            window.location.href = "/user-pages/log-in";
            return;
        }

        // **Extract user email & domain**
        const email = sessionData.session.user.email;
        const domain = email.split("@")[1]?.toLowerCase();

        console.log(`User logged in: ${email} (Domain: ${domain})`);

        // **Check if user has access to this folder**
        const allowedPath = domainAccess[domain];

        if (!allowedPath || !currentPath.startsWith(allowedPath)) {
            console.warn(`Unauthorized access to ${currentPath}. Redirecting to: /access-denied`);
            window.location.href = "/access-denied";
            return;
        }

        console.log(`Access granted to ${currentPath}`);
    } catch (err) {
        console.error("Session error:", err);
        window.location.href = "/user-pages/log-in";
    }

    // **Handle Auth State Changes (Logout/Login)**
    supabaseClient.auth.onAuthStateChange((event, session) => {
        if (session && event === "SIGNED_IN") {
            const email = session.user.email;
            const domain = email.split("@")[1]?.toLowerCase();
            const allowedPath = domainAccess[domain] || "/access-denied";

            console.log(`Auth change detected. Redirecting user to: ${allowedPath}`);
            window.location.href = allowedPath;
        } else if (!session) {
            console.log("User logged out. Redirecting to login.");
            window.location.href = "/user-pages/log-in";
        }
    });
});
