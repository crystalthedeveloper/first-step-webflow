// Login
document.addEventListener("DOMContentLoaded", () => {
    // Supabase configuration
    const SUPABASE_URL = "https://hcchvhjuegysshozazad.supabase.co";
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjY2h2aGp1ZWd5c3Nob3phemFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5MzQ3OTUsImV4cCI6MjA1NTUxMDc5NX0.Y2cu9q58j8Ac8ApLp7uPcyvHx_-WFA-Wm7ZhIXBMRiE";

    // Initialize Supabase client
    const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    const loginForm = document.querySelector("#login-form");
    const formError = document.querySelector("#form-error");

    // Utility function to display error messages
    const displayError = (message) => {
        formError.textContent = message;
        formError.style.color = "red"; // Make error messages red
    };

    // Handle login form submission
    loginForm?.addEventListener("submit", async (event) => {
        event.preventDefault();
        formError.textContent = ""; // Clear previous errors

        const email = document.querySelector("#login-email")?.value.trim();
        const password = document.querySelector("#login-password")?.value.trim();

        if (!email || !password) {
            displayError("Please enter both email and password.");
            return;
        }

        try {
            // Authenticate user with Supabase
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            // **Ensure user has verified their email before logging in**
            if (!data.user?.email_confirmed_at) {
                displayError("Please verify your email before logging in.");
                return;
            }

            // Fetch user info from `users_access`
            const { data: userData, error: userError } = await supabaseClient
                .from("users_access")
                .select("first_name, last_name, domain, status")
                .eq("email", email)
                .single();

            if (userError || !userData) {
                displayError("Access denied. Your email is not pre-approved.");
                return;
            }

            // **Check if user is approved**
            if (userData.status !== "approved") {
                displayError("Your account is pending approval. Please wait for admin approval.");
                return;
            }

            // Redirect users based on domain
            let redirectUrl = "https://firststep-46e83b.webflow.io"; // Default page

            if (userData.domain === "colascanada.ca") {
                redirectUrl = "https://firststep-46e83b.webflow.io/colascanada/home";
            } else if (userData.domain === "blackandmcdonald.com") {
                redirectUrl = "https://firststep-46e83b.webflow.io/blackandmcdonald/home";
            } else if (userData.domain === "greenshield.ca") {
                redirectUrl = "https://firststep-46e83b.webflow.io/greenshield/home";
            } else if (userData.domain === "crystalthedeveloper.ca") {
                redirectUrl = "https://firststep-46e83b.webflow.io";
            } else {
                // Unauthorized domain
                displayError("Access denied. Your domain is not allowed.");
                return;
            }

            // Show welcome message before redirecting
            formError.textContent = `Welcome, ${userData.first_name}! Redirecting...`;
            formError.style.color = "green";

            setTimeout(() => {
                window.location.href = redirectUrl;
            }, 2000);

        } catch (err) {
            displayError(`Login failed: ${err.message}`);
        }
    });
});