// login & logout button 
document.addEventListener("DOMContentLoaded", async () => {
    const SUPABASE_URL = "https://hcchvhjuegysshozazad.supabase.co";
    const SUPABASE_KEY =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjY2h2aGp1ZWd5c3Nob3phemFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5MzQ3OTUsImV4cCI6MjA1NTUxMDc5NX0.Y2cu9q58j8Ac8ApLp7uPcyvHx_-WFA-Wm7ZhIXBMRiE";

    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    const toggleBtn = document.querySelector("#auth-toggle-btn");

    if (!toggleBtn) {
        console.error("Auth toggle button not found!");
        return;
    }

    // **Update button based on user authentication status**
    async function updateAuthButton() {
        const { data: { user }, error } = await supabaseClient.auth.getUser();

        if (error) {
            console.error("Error fetching user:", error);
            return;
        }

        if (user) {
            toggleBtn.textContent = "Logout";
            toggleBtn.dataset.authAction = "logout";
        } else {
            toggleBtn.textContent = "Login";
            toggleBtn.dataset.authAction = "login";
        }
    }

    await updateAuthButton();

    // **Handle button click for login/logout**
    toggleBtn.addEventListener("click", async () => {
        const authAction = toggleBtn.dataset.authAction;

        if (authAction === "logout") {
            try {
                const { error } = await supabaseClient.auth.signOut();
                if (!error) {
                    window.location.href = "https://firststep-46e83b.webflow.io/user-pages/log-in";
                }
            } catch (error) {
                console.error("Logout error:", error);
            }
        } else if (authAction === "login") {
            try {
                // **Check user session and redirect accordingly**
                const { data: sessionData } = await supabaseClient.auth.getSession();

                if (!sessionData.session) {
                    window.location.href = "https://firststep-46e83b.webflow.io/user-pages/log-in";
                    return;
                }

                const email = sessionData.session.user.email;
                const domain = email.split("@")[1];

                // **Redirect users based on email domain**
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

            } catch (error) {
                console.error("Login error:", error);
            }
        }
    });
});