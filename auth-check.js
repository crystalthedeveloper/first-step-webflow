//auth-check.js - Check for user session
document.addEventListener("DOMContentLoaded", async () => {
    if (!window.supabaseClient) {
        console.error("❌ Supabase Client not found! Ensure `supabaseClient.js` is loaded first.");
        return;
    }

    const supabase = window.supabaseClient;
    
    // ✅ Add protected pages, including user account page
    const protectedFolders = [
        "/colascanada/",
        "/blackandmcdonald/",
        "/greenshield/",
        "/user-pages/user-account"
    ];

    // ✅ Define which domains have access to which pages
    const domainAccess = {
        "colascanada.ca": ["/colascanada/home", "/colascanada/modules", "/user-pages/user-account"],
        "gmail.com": ["/colascanada/home", "/colascanada/modules", "/user-pages/user-account"],
        "blackandmcdonald.com": ["/blackandmcdonald/home", "/blackandmcdonald/modules", "/user-pages/user-account"],
        "greenshield.ca": ["/greenshield/home", "/greenshield/modules", "/user-pages/user-account"],
        "crystalthedeveloper.ca": ["/", "/user-pages/user-account"], 
    };

    const currentPath = window.location.pathname;
    const isProtected = protectedFolders.some(folder => currentPath.startsWith(folder));

    if (!isProtected) {
        console.log("This page does not require authentication.");
        return;
    }

    try {
        // ✅ Check if the user is logged in
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !sessionData.session) {
            console.warn("No active session. Redirecting to login page.");
            window.location.href = "/user-pages/log-in";
            return;
        }

        const email = sessionData.session.user.email;
        const domain = email.split("@")[1]?.toLowerCase();
        const allowedPaths = domainAccess[domain] || [];

        // ✅ Ensure access to `/user-pages/user-account` for all logged-in users
        if (currentPath === "/user-pages/user-account") {
            console.log(`✅ Logged-in user accessing ${currentPath}. Access granted.`);
            return; // Allow access without checking domain-specific paths
        }

        // ✅ Check if the user has permission to access the current path
        if (!allowedPaths.some(path => currentPath.startsWith(path))) {
            console.warn(`🚨 Unauthorized access to ${currentPath}. Redirecting to: /access-denied`);
            window.location.href = "/access-denied";
            return;
        }

        console.log(`✅ Access granted to ${currentPath}`);

        // ✅ Save Last Visited Page
        localStorage.setItem("lastVisitedPage", currentPath);

    } catch (err) {
        console.error("❌ Session error:", err);
        window.location.href = "/user-pages/log-in";
    }

    // ✅ Handle Authentication State Changes
    supabase.auth.onAuthStateChange((event, session) => {
        if (session && event === "SIGNED_IN") {
            const email = session.user.email;
            const domain = email.split("@")[1]?.toLowerCase();
            const allowedPaths = domainAccess[domain] || [];

            const lastVisitedPage = localStorage.getItem("lastVisitedPage") || allowedPaths[0] || "/access-denied";
            console.log(`🔄 Auth change detected. Redirecting user to: ${lastVisitedPage}`);
            window.location.href = lastVisitedPage;
        } else if (!session) {
            console.log("🚪 User logged out. Redirecting to login.");
            window.location.href = "/user-pages/log-in";
        }
    });
});