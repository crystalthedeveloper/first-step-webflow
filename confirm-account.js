// confirm-account.js
document.addEventListener("DOMContentLoaded", async () => {
    if (!window.supabaseClient) {
        console.error("❌ Supabase Client not found! Ensure `supabaseClient.js` is loaded first.");
        return;
    }

    const supabase = window.supabaseClient;
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const email = urlParams.get("email");
    const confirmationMessage = document.querySelector("#confirmation-message");

    if (!token || !email) {
        confirmationMessage.textContent = "❌ Invalid confirmation link.";
        return;
    }

    // ✅ Step 1: Confirm user in Supabase
    try {
        const { error } = await supabase.auth.verifyOtp({
            type: "signup",
            token,
            email
        });

        if (error) {
            confirmationMessage.textContent = "❌ Confirmation failed: " + error.message;
            return;
        }

        // ✅ Step 2: Check if user exists in `users_access`
        const { data: existingUser } = await supabase
            .from("users_access")
            .select("email")
            .eq("email", email)
            .single();

        if (!existingUser) {
            // ✅ Step 3: Insert into `users_access`
            await supabase.from("users_access").insert([
                {
                    email: email,
                    first_name: "New", // Default name if missing
                    last_name: "User",
                    status: "approved",
                    created_at: new Date().toISOString()
                }
            ]);
        }

        // ✅ Step 4: Success Message & Redirect
        confirmationMessage.textContent = "✅ Confirmation successful! Redirecting...";
        setTimeout(() => {
            window.location.href = "https://firststep-46e83b.webflow.io/user-pages/log-in";
        }, 3000);
    } catch (err) {
        confirmationMessage.textContent = "❌ An error occurred. Please try again.";
    }
});