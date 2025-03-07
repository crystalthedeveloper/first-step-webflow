const { createClient } = require("@supabase/supabase-js");

// **Supabase Admin Credentials**
    const SUPABASE_URL = "https://hcchvhjuegysshozazad.supabase.co";
    const SUPABASE_KEY =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjY2h2aGp1ZWd5c3Nob3phemFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5MzQ3OTUsImV4cCI6MjA1NTUxMDc5NX0.Y2cu9q58j8Ac8ApLp7uPcyvHx_-WFA-Wm7ZhIXBMRiE";

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function createUserAndInsertIntoDatabase(email, firstName, lastName, domain) {
  try {
    // **Step 1: Create User in Supabase Auth**
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: "TempPass123!", // Temporary password (user can reset later)
      email_confirm: true, // Automatically mark email as confirmed
      user_metadata: { first_name: firstName, last_name: lastName },
    });

    if (authError) throw authError;

    console.log(`✅ User created in Auth: ${email}`);

    // **Step 2: Insert User into users_access Table**
    const { error: dbError } = await supabaseAdmin.from("users_access").upsert([
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
  } catch (error) {
    console.error("❌ Error:", error.message);
  }
}

// **Create Users**
createUserAndInsertIntoDatabase("contact@crystalthedeveloper.ca", "Crystal", "Lewis", "crystalthedeveloper.ca");
createUserAndInsertIntoDatabase("user2@example.com", "Jane", "Smith", "blackandmcdonald.com");
createUserAndInsertIntoDatabase("user3@example.com", "Alice", "Johnson", "greenshield.ca");
