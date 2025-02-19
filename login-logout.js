// login & logout button 
document.addEventListener("DOMContentLoaded", async () => {
    const SUPABASE_URL = "https://hcchvhjuegysshozazad.supabase.co";
    const SUPABASE_KEY =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjY2h2aGp1ZWd5c3Nob3phemFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5MzQ3OTUsImV4cCI6MjA1NTUxMDc5NX0.Y2cu9q58j8Ac8ApLp7uPcyvHx_-WFA-Wm7ZhIXBMRiE";

    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    const toggleBtn = document.querySelector("#auth-toggle-btn");

    // Update button based on user authentication status
    async function updateAuthButton() {
        const { data: { user } } = await supabaseClient.auth.getUser();

        if (user) {
            toggleBtn.textContent = "Logout";
            toggleBtn.dataset.authAction = "logout";
        } else {
            toggleBtn.textContent = "Login";
            toggleBtn.dataset.authAction = "login";
        }
    }

    await updateAuthButton();

    // Handle button click for login/logout
    toggleBtn.addEventListener("click", async () => {
        const authAction = toggleBtn.dataset.authAction;

        if (authAction === "logout") {
            try {
                const { error } = await supabaseClient.auth.signOut();
                if (!error) {
                    window.location.href = "https://firststep-46e83b.webflow.io/";
                }
            } catch (error) {
                // Optional: handle silent errors if needed
            }
        } else if (authAction === "login") {
            window.location.href = "https://firststep-46e83b.webflow.io/user-pages/log-in";
        }
    });
});