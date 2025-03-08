// Login
document.addEventListener("DOMContentLoaded", () => {
    // Wait for Supabase to load
    if (!window.supabaseClient) {
        console.error("❌ Supabase Client not found! Ensure `supabaseClient.js` is loaded first.");
        return;
    }

    const supabase = window.supabaseClient;
    const loginForm = document.querySelector("#login-form");
    const formError = document.querySelector("#form-error");

    function displayError(message) {
        formError.textContent = message;
        formError.style.color = "red";
    }

    loginForm?.addEventListener("submit", async (event) => {
        event.preventDefault();
        formError.textContent = "";

        const email = document.querySelector("#login-email")?.value.trim();
        const password = document.querySelector("#login-password")?.value.trim();

        if (!email || !password) {
            displayError("Please enter both email and password.");
            return;
        }

        try {
            // **Step 1: Authenticate User**
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });

            if (error) throw error;

            // **Step 2: Ensure Email is Verified**
            const { data: userSession } = await supabase.auth.getUser();
            const user = userSession?.user;

            if (!user || !user.email_confirmed_at) {
                displayError("Please verify your email before logging in.");
                return;
            }

            console.log(`✅ User authenticated: ${user.email}`);

            // **Step 3: Extract User Info**
            const domain = email.split("@")[1]?.toLowerCase(); // Normalize domain
            const firstName = user.user_metadata?.first_name || "Unknown";
            const lastName = user.user_metadata?.last_name || "Unknown";

            // **Step 4: Check if User Exists in `users_access`**
            const { data: userData, error: userError } = await supabase
                .from("users_access")
                .select("id")
                .eq("email", email)
                .single();

            // **Step 5: Insert User if Not Exists**
            if (!userData) {
                console.log("🚀 User not found in users_access. Adding them...");

                const { error: insertError } = await supabase.from("users_access").upsert([
                    {
                        id: user.id,
                        email,
                        first_name: firstName,
                        last_name: lastName,
                        domain,
                        role: "user",
                        status: "approved", // Auto-approve
                        created_at: new Date().toISOString(),
                    },
                ]);

                if (insertError) {
                    console.error("❌ Error inserting into users_access:", insertError);
                    displayError("Error saving your account. Please try again later.");
                    return;
                }
            } else {
                console.log("✅ User already exists in users_access.");
            }

            // **Step 6: Redirect Based on Domain**
            const domainRedirects = {
                "gmail.com": "https://firststep-46e83b.webflow.io/colascanada/home",
                "colascanada.ca": "https://firststep-46e83b.webflow.io/colascanada/home",
                "blackandmcdonald.com": "https://firststep-46e83b.webflow.io/blackandmcdonald/home",
                "greenshield.ca": "https://firststep-46e83b.webflow.io/greenshield/home",
                "crystalthedeveloper.ca": "https://firststep-46e83b.webflow.io",
            };

            // **Use fallback redirect if domain isn't recognized**
            const redirectUrl = domainRedirects[domain] || "https://firststep-46e83b.webflow.io/user-pages/access-denied";

            console.log(`🔄 Redirecting user to: ${redirectUrl}`);

            formError.textContent = "Login successful! Redirecting...";
            formError.style.color = "green";

            setTimeout(() => {
                window.location.href = redirectUrl;
            }, 2000);
        } catch (err) {
            displayError(`Login failed: ${err.message}`);
            console.error("❌ Login Error:", err);
        }
    });
});