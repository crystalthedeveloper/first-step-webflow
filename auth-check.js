//auth-check.js - Check for user session
document.addEventListener("DOMContentLoaded", async () => {
    if (!window.supabaseClient) {
        console.error("❌ Supabase Client not found! Ensure `supabaseClient.js` is loaded first.");
        return;
    }

    const supabase = window.supabaseClient;
    const protectedFolders = ["/colascanada/", "/blackandmcdonald/", "/greenshield/"];
    
    const domainAccess = {
        "colascanada.ca": ["/colascanada/home", "/colascanada/modules"],
        "gmail.com": ["/colascanada/home", "/colascanada/modules"],
        "blackandmcdonald.com": ["/blackandmcdonald/home", "/blackandmcdonald/modules"],
        "greenshield.ca": ["/greenshield/home", "/greenshield/modules"],
        "crystalthedeveloper.ca": ["/"], 
    };

    const currentPath = window.location.pathname;
    const isProtected = protectedFolders.some(folder => currentPath.startsWith(folder));

    if (!isProtected) {
        console.log("This page does not require authentication.");
        return;
    }

    try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !sessionData.session) {
            console.warn("No active session. Redirecting to login page.");
            window.location.href = "/user-pages/log-in";
            return;
        }

        const email = sessionData.session.user.email;
        const domain = email.split("@")[1]?.toLowerCase();

        console.log(`User logged in: ${email} (Domain: ${domain})`);

        const allowedPaths = domainAccess[domain] || [];
        
        if (!allowedPaths.some(path => currentPath.startsWith(path))) {
            console.warn(`Unauthorized access to ${currentPath}. Redirecting to: /access-denied`);
            window.location.href = "/access-denied";
            return;
        }

        console.log(`✅ Access granted to ${currentPath}`);

        // ✅ Save Last Visited Page
        localStorage.setItem("lastVisitedPage", currentPath);

    } catch (err) {
        console.error("Session error:", err);
        window.location.href = "/user-pages/log-in";
    }

    supabase.auth.onAuthStateChange((event, session) => {
        if (session && event === "SIGNED_IN") {
            const email = session.user.email;
            const domain = email.split("@")[1]?.toLowerCase();
            const allowedPaths = domainAccess[domain] || [];

            const lastVisitedPage = localStorage.getItem("lastVisitedPage") || allowedPaths[0] || "/access-denied";
            console.log(`Auth change detected. Redirecting user to: ${lastVisitedPage}`);
            window.location.href = lastVisitedPage;
        } else if (!session) {
            console.log("User logged out. Redirecting to login.");
            window.location.href = "/user-pages/log-in";
        }
    });
});