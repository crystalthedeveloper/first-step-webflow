// Check for user session
document.addEventListener("DOMContentLoaded", async () => {
    const SUPABASE_URL = "https://hcchvhjuegysshozazad.supabase.co";
    const SUPABASE_KEY =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjY2h2aGp1ZWd5c3Nob3phemFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5MzQ3OTUsImV4cCI6MjA1NTUxMDc5NX0.Y2cu9q58j8Ac8ApLp7uPcyvHx_-WFA-Wm7ZhIXBMRiE";

    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    try {
        // Check for session with getSession()
        const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();

        if (sessionError || !sessionData.session) {
            window.location.href = "https://firststep-46e83b.webflow.io/user-pages/log-in";
            return;
        }

        // Allow the authenticated user access to the protected page
        if (window.location.pathname === "/user-pages/log-in") {
            window.location.href = "https://firststep-46e83b.webflow.io";
        }
    } catch (err) {
        window.location.href = "https://www.crystalthedeveloper.ca/user-pages/login";
    }

    // Listen for real-time session changes
    supabaseClient.auth.onAuthStateChange((event, session) => {
        if (session && event === "SIGNED_IN") {
            window.location.href = "https://firststep-46e83b.webflow.io";
        } else if (!session) {
            window.location.href = "https://firststep-46e83b.webflow.io/user-pages/log-in";
        }
    });
});