//auth-check.js
// Check for user session
document.addEventListener("DOMContentLoaded", async () => {
    // Wait for Supabase to load
    if (!window.supabaseClient) {
        console.error("❌ Supabase Client not found! Ensure `supabaseClient.js` is loaded first.");
        return;
    }

    const supabase = window.supabaseClient;

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
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

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
    supabase.auth.onAuthStateChange((event, session) => {
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
