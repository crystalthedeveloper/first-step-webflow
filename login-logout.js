// Login & Logout Button
document.addEventListener("DOMContentLoaded", async () => {
    // Supabase configuration
    const SUPABASE_URL = "https://hcchvhjuegysshozazad.supabase.co";
    const SUPABASE_KEY =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjY2h2aGp1ZWd5c3Nob3phemFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5MzQ3OTUsImV4cCI6MjA1NTUxMDc5NX0.Y2cu9q58j8Ac8ApLp7uPcyvHx_-WFA-Wm7ZhIXBMRiE";

    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    
    // Select both login/logout buttons
    const toggleBtns = document.querySelectorAll("#auth-toggle-btn, #auth-toggle-s-btn");

    if (!toggleBtns.length) {
        console.error("Auth toggle buttons not found!");
        return;
    }

    // **Update button based on user authentication status**
    async function updateAuthButton() {
        const { data: sessionData, error } = await supabaseClient.auth.getSession();

        if (error) {
            console.error("Error fetching user session:", error);
            return;
        }

        const user = sessionData.session ? sessionData.session.user : null;

        toggleBtns.forEach((btn) => {
            if (user) {
                btn.textContent = "Logout";
                btn.dataset.authAction = "logout";
            } else {
                btn.textContent = "Login";
                btn.dataset.authAction = "login";
            }
        });
    }

    await updateAuthButton();

    // **Handle button click for login/logout**
    toggleBtns.forEach((btn) => {
        btn.addEventListener("click", async () => {
            const authAction = btn.dataset.authAction;

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
                    // **Check user session**
                    const { data: sessionData } = await supabaseClient.auth.getSession();

                    if (!sessionData.session) {
                        window.location.href = "https://firststep-46e83b.webflow.io/user-pages/log-in";
                        return;
                    }

                    const email = sessionData.session.user.email;
                    const domain = email.split("@")[1];

                    // **Redirect users based on email domain**
                    let redirectUrl = "https://firststep-46e83b.webflow.io";

                    if (domain === "colascanada.ca" || domain === "gmail.com") {
                        redirectUrl = "https://firststep-46e83b.webflow.io/colascanada/home";
                    } else if (domain === "blackandmcdonald.com") {
                        redirectUrl = "https://firststep-46e83b.webflow.io/blackandmcdonald/home";
                    } else if (domain === "greenshield.ca") {
                        redirectUrl = "https://firststep-46e83b.webflow.io/greenshield/home";
                    } else if (domain === "crystalthedeveloper.ca") {
                        redirectUrl = "https://firststep-46e83b.webflow.io";
                    } else {
                        redirectUrl = "https://firststep-46e83b.webflow.io/access-denied";
                    }

                    window.location.href = redirectUrl;
                } catch (error) {
                    console.error("Login error:", error);
                }
            }
        });
    });
});