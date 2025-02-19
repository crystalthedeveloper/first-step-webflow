// Login
document.addEventListener("DOMContentLoaded", () => {
    // Supabase configuration
    const SUPABASE_URL = "https://hcchvhjuegysshozazad.supabase.co";
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjY2h2aGp1ZWd5c3Nob3phemFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5MzQ3OTUsImV4cCI6MjA1NTUxMDc5NX0.Y2cu9q58j8Ac8ApLp7uPcyvHx_-WFA-Wm7ZhIXBMRiE";

    // Initialize Supabase client
    const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

    const loginForm = document.querySelector("#login-form");
    const formError = document.querySelector("#form-error");

    // Utility function to display error messages
    const displayError = (message) => {
        formError.textContent = message; // Update error container
    };

    // Handle login form submission
    loginForm?.addEventListener("submit", async (event) => {
        event.preventDefault();

        const email = document.querySelector("#login-email")?.value.trim();
        const password = document.querySelector("#login-password")?.value.trim();

        formError.textContent = ""; // Clear previous errors

        if (!email || !password) {
            displayError("Please enter both email and password.");
            return;
        }

        try {
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email,
                password,
            });

            if (error) throw error;

            displayError(""); // Clear errors if successful
            window.location.href = "https://firststep-46e83b.webflow.io";
        } catch (err) {
            displayError(`Login failed: ${err.message}`); // Display error message
        }
    });
});