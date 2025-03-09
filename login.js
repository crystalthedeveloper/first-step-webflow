// Login
document.addEventListener("DOMContentLoaded", () => {
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
            const { data, error } = await supabase.auth.signInWithPassword({ email, password });

            if (error) throw error;

            const { data: userSession } = await supabase.auth.getUser();
            const user = userSession?.user;

            if (!user || !user.email_confirmed_at) {
                displayError("Please verify your email before logging in.");
                return;
            }

            console.log(`✅ User authenticated: ${user.email}`);

            const domain = email.split("@")[1]?.toLowerCase();
            const firstName = user.user_metadata?.first_name || "Unknown";
            const lastName = user.user_metadata?.last_name || "Unknown";

            const { data: userData } = await supabase
                .from("users_access")
                .select("id")
                .eq("email", email)
                .single();

            if (!userData) {
                console.log("🚀 User not found in users_access. Adding them...");
                await supabase.from("users_access").upsert([
                    {
                        id: user.id,
                        email,
                        first_name: firstName,
                        last_name: lastName,
                        domain,
                        role: "user",
                        status: "approved",
                        created_at: new Date().toISOString(),
                    },
                ]);
            }

            // ✅ Retrieve Last Visited Page
            const lastVisitedPage = localStorage.getItem("lastVisitedPage");
            const domainRedirects = {
                "gmail.com": "https://firststep-46e83b.webflow.io/colascanada/home",
                "colascanada.ca": "https://firststep-46e83b.webflow.io/colascanada/home",
                "blackandmcdonald.com": "https://firststep-46e83b.webflow.io/blackandmcdonald/home",
                "greenshield.ca": "https://firststep-46e83b.webflow.io/greenshield/home",
                "crystalthedeveloper.ca": "https://firststep-46e83b.webflow.io",
            };

            const redirectUrl = lastVisitedPage || domainRedirects[domain] || "https://firststep-46e83b.webflow.io/user-pages/access-denied";

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