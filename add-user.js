// Add User Form 
const { createClient } = require("@supabase/supabase-js");

// **Supabase Admin Credentials**
const SUPABASE_URL = "https://hcchvhjuegysshozazad.supabase.co";
const SUPABASE_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjY2h2aGp1ZWd5c3Nob3phemFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5MzQ3OTUsImV4cCI6MjA1NTUxMDc5NX0.Y2cu9q58j8Ac8ApLp7uPcyvHx_-WFA-Wm7ZhIXBMRiE";

const supabaseAdmin = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

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
        const tempPassword = "TempPass123!"; // You can change this if needed.

        // **Step 1: Create User in Supabase Auth**
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password: tempPassword,
            email_confirm: true, // Mark email as confirmed
            user_metadata: { first_name: firstName, last_name: lastName },
        });

        if (authError) throw authError;

        console.log(`✅ User created in Auth: ${email}`);

        // **Step 2: Insert User into users_access Table**
        const domain = email.split("@")[1]; // Extract domain from email

        const { error: dbError } = await supabaseAdmin.from("users_access").insert([
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

        formMessages.textContent = `✅ User created successfully! Temporary password: ${tempPassword}`;
        formMessages.style.color = "green";

    } catch (error) {
        console.error("❌ Error:", error.message);
        formMessages.textContent = "❌ Error creating user. Try again.";
        formMessages.style.color = "red";
    }
});