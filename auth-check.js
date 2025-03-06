// Check for user session
document.addEventListener("DOMContentLoaded", async () => {
    const SUPABASE_URL = "https://hcchvhjuegysshozazad.supabase.co";
    const SUPABASE_KEY =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjY2h2aGp1ZWd5c3Nob3phemFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5MzQ3OTUsImV4cCI6MjA1NTUxMDc5NX0.Y2cu9q58j8Ac8ApLp7uPcyvHx_-WFA-Wm7ZhIXBMRiE";

    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    try {
        // Check for active session
        const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();

        if (sessionError || !sessionData.session) {
            window.location.href = "https://firststep-46e83b.webflow.io/user-pages/log-in";
            return;
        }

        // Extract user email
        const email = sessionData.session.user.email;
        const domain = email.split("@")[1]; // Extract domain from email

        // Redirect users based on their email domain
        if (domain === "colascanada.ca" || domain === "gmail.com") {
            window.location.href = "https://firststep-46e83b.webflow.io/colascanada/home";
        } else if (domain === "blackandmcdonald.com") {
            window.location.href = "https://firststep-46e83b.webflow.io/blackandmcdonald/home";
        } else if (domain === "greenshield.ca") {
            window.location.href = "https://firststep-46e83b.webflow.io/greenshield/home";
        } else if (domain === "crystalthedeveloper.ca") {
            window.location.href = "https://firststep-46e83b.webflow.io";
        } else {
            // Redirect unauthorized users to the access-denied page
            window.location.href = "https://firststep-46e83b.webflow.io/access-denied";
        }

    } catch (err) {
        console.error("Session error:", err);
        window.location.href = "https://firststep-46e83b.webflow.io/user-pages/log-in";
    }

    // Listen for session changes (logout or login)
    supabaseClient.auth.onAuthStateChange((event, session) => {
        if (session && event === "SIGNED_IN") {
            const email = session.user.email;
            const domain = email.split("@")[1];

            if (domain === "colascanada.ca" || domain === "gmail.com") {
                window.location.href = "https://firststep-46e83b.webflow.io/colascanada/home";
            } else if (domain === "blackandmcdonald.com") {
                window.location.href = "https://firststep-46e83b.webflow.io/blackandmcdonald/home";
            } else if (domain === "greenshield.ca") {
                window.location.href = "https://firststep-46e83b.webflow.io/greenshield/home";
            } else if (domain === "crystalthedeveloper.ca") {
                window.location.href = "https://firststep-46e83b.webflow.io";
            } else {
                window.location.href = "https://firststep-46e83b.webflow.io/access-denied";
            }
        } else if (!session) {
            window.location.href = "https://firststep-46e83b.webflow.io/user-pages/log-in";
        }
    });
});