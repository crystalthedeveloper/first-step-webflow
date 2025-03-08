// add-user.js
// Manually Confirm Emails in Supabase
// Ensure Supabase is properly initialized in Webflow
document.addEventListener("DOMContentLoaded", async () => {
    // Wait for Supabase to load
    if (!window.supabaseClient) {
        console.error("❌ Supabase Client not found! Ensure `supabaseClient.js` is loaded first.");
        return;
    }

    const supabase = window.supabaseClient;

    if (typeof supabase === "undefined") {
        console.error("⚠️ Supabase is not defined. Make sure you include the Supabase JS SDK.");
        return;
    }

    // **Select Form Elements**
    const form = document.querySelector("#add-user-form");
    const formMessages = document.querySelector("#form-messages");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        formMessages.textContent = "";

        const email = document.querySelector("#user-email").value.trim();
        const firstName = document.querySelector("#user-first-name").value.trim();
        const lastName = document.querySelector("#user-last-name").value.trim();

        if (!email || !firstName || !lastName) {
            formMessages.textContent = "All fields are required.";
            formMessages.style.color = "red";
            return;
        }

        try {
            // **Generate a Temporary Password**
            const tempPassword = "TempPass123!"; // Change if needed.

            // **Step 1: Create User Normally (No Admin Call)**
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email,
                password: tempPassword,
                options: {
                    data: { first_name: firstName, last_name: lastName },
                },
            });

            if (authError) throw authError;
            console.log(`✅ User created in Auth: ${email}`);

            // **Step 2: Manually Confirm Email in Supabase**
            const { error: confirmError } = await supabase
                .from("auth.users")
                .update({ email_confirmed_at: new Date().toISOString() })
                .eq("email", email);

            if (confirmError) throw confirmError;
            console.log(`✅ Email manually confirmed for: ${email}`);

            // **Step 3: Insert User into users_access Table**
            const domain = email.split("@")[1];

            const { error: dbError } = await supabase.from("users_access").insert([
                {
                    email,
                    first_name: firstName,
                    last_name: lastName,
                    domain,
                    role: "user",
                    status: "approved",
                    created_at: new Date().toISOString(),
                },
            ]);

            if (dbError) throw dbError;
            console.log(`✅ User inserted into users_access: ${email}`);

            // **Show Success Message**
            formMessages.textContent = `✅ User created successfully! Temporary password: ${tempPassword}`;
            formMessages.style.color = "green";

        } catch (error) {
            console.error("❌ Error:", error.message);
            formMessages.textContent = "❌ Error creating user. Try again.";
            formMessages.style.color = "red";
        }
    });
});