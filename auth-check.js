//auth-check.js - Check for user session
document.addEventListener("DOMContentLoaded", async () => {
    if (!window.supabaseClient) return;

    const supabase = window.supabaseClient;

    // ✅ Add all protected folders
    const protectedFolders = [
        "/colascanada/",
        "/blackandmcdonald/",
        "/greenshield/",
        "/login/",
        "/user-pages/user-account",
        "/first-steps",
        "/the-library"
    ];

    // ✅ Define per-domain access
    const domainAccess = {
        "colascanada.ca": [
            "/colascanada/home",
            "/colascanada/modules",
            "/colascanada/first-steps",
            "/colascanada/the-library",
            "/user-pages/user-account"
        ],
        "gmail.com": [
            "/colascanada/home",
            "/colascanada/modules",
            "/colascanada/first-steps",
            "/colascanada/the-library",
            "/user-pages/user-account"
        ],
        "blackandmcdonald.com": [
            "/blackandmcdonald/home",
            "/blackandmcdonald/modules",
            "/blackandmcdonald/first-steps",
            "/blackandmcdonald/the-library",
            "/user-pages/user-account"
        ],
        "greenshield.ca": [
            "/greenshield/home",
            "/greenshield/modules",
            "/greenshield/first-steps",
            "/greenshield/the-library",
            "/user-pages/user-account"
        ],
        "crystalthedeveloper.ca": [
            "/",
            "/user-pages/user-account",
            "/login/home",
            "/login/modules",
            "/login/first-steps",
            "/login/the-library"
        ]
    };

    const currentPath = window.location.pathname;
    const isProtected = protectedFolders.some(folder => currentPath.startsWith(folder));

    if (!isProtected) return;

    try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !sessionData.session) {
            window.location.href = "/user-pages/log-in";
            return;
        }

        const email = sessionData.session.user.email;
        const domain = email.split("@")[1]?.toLowerCase();
        const allowedPaths = domainAccess[domain] || [];

        if (currentPath === "/user-pages/user-account") return;

        const isAllowed = allowedPaths.some(path => currentPath.startsWith(path));

        if (!isAllowed) {
            window.location.href = "/access-denied";
            return;
        }

        // ✅ Save Last Visited Page
        localStorage.setItem("lastVisitedPage", currentPath);
    } catch (_) {
        window.location.href = "/user-pages/log-in";
    }

    // ✅ Auth State Listener
    supabase.auth.onAuthStateChange((event, session) => {
        if (session && event === "SIGNED_IN") {
            const email = session.user.email;
            const domain = email.split("@")[1]?.toLowerCase();
            const allowedPaths = domainAccess[domain] || [];

            const lastVisitedPage = localStorage.getItem("lastVisitedPage") || allowedPaths[0] || "/access-denied";
            window.location.href = lastVisitedPage;
        } else if (!session) {
            window.location.href = "/user-pages/log-in";
        }
    });
});