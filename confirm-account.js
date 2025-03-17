// confirm-account.js
document.addEventListener("DOMContentLoaded", async () => {
    if (!window.supabaseClient) {
        console.error("❌ Supabase Client not found! Ensure `supabaseClient.js` is loaded first.");
        return;
    }

    const supabase = window.supabaseClient;
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get("token");
    const confirmationMessage = document.querySelector("#confirmation-message");

    if (!token) {
        confirmationMessage.textContent = "❌ Invalid confirmation link.";
        return;
    }

    try {
        // ✅ Step 1: Verify Token
        const { error } = await supabase.auth.verifyOtp({
            type: "signup",
            token
        });

        if (error) {
            confirmationMessage.textContent = "❌ Confirmation failed: " + error.message;
            return;
        }

        // ✅ Step 2: Fetch the authenticated user
        const { data: sessionData, error: sessionError } = await supabase.auth.getUser();
        if (sessionError || !sessionData?.user?.email) {
            confirmationMessage.textContent = "❌ Could not retrieve user.";
            return;
        }

        const email = sessionData.user.email; // ✅ Get user's email after verification

        // ✅ Step 3: Check if user exists in `users_access`
        const { data: existingUser, error: fetchError } = await supabase
            .from("users_access")
            .select("email")
            .eq("email", email)
            .single();

        if (!existingUser) {
            // ✅ Step 4: Insert into `users_access`
            const { error: insertError } = await supabase.from("users_access").insert([
                {
                    email: email,
                    first_name: sessionData.user.user_metadata?.first_name || "New",
                    last_name: sessionData.user.user_metadata?.last_name || "User",
                    status: "approved",
                    created_at: new Date().toISOString()
                }
            ]);

            if (insertError) {
                confirmationMessage.textContent = "❌ Error adding user to database.";
                return;
            }
        }

        // ✅ Step 5: Success Message & Redirect
        confirmationMessage.textContent = "✅ Confirmation successful! Redirecting...";
        setTimeout(() => {
            window.location.href = "https://firststep-46e83b.webflow.io/user-pages/log-in";
        }, 3000);
    } catch (err) {
        confirmationMessage.textContent = "❌ An error occurred. Please try again.";
    }
});