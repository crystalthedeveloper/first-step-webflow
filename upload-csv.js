// upload-csv.js
document.addEventListener("DOMContentLoaded", async () => {
    if (!window.supabaseClient) {
        console.error("❌ Supabase Client not found! Ensure `supabaseClient.js` is loaded first.");
        return;
    }

    const supabase = window.supabaseClient;
    const messageBox = document.querySelector("#csv-upload-message");
    const fileInput = document.querySelector("#csv-upload");
    const uploadForm = document.querySelector("#csv-upload-form");

    if (uploadForm) {
        uploadForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            messageBox.textContent = "🔄 Uploading...";

            if (!fileInput.files.length) {
                messageBox.textContent = "❌ Please select a CSV file.";
                return;
            }

            const file = fileInput.files[0];
            const reader = new FileReader();

            reader.onload = async (e) => {
                const csvData = e.target.result;
                const users = parseCSV(csvData);

                if (users.length === 0) {
                    messageBox.textContent = "❌ Invalid CSV file.";
                    return;
                }

                try {
                    for (const user of users) {
                        // ✅ Step 1: Use a fixed password for all users
                        const tempPassword = "TempPass123!";

                        // ✅ Step 2: Create user in Supabase Authentication
                        const { error: authError } = await supabase.auth.signUp({
                            email: user.email,
                            password: tempPassword,
                            options: {
                                data: {
                                    first_name: user.first_name,
                                    last_name: user.last_name
                                }
                            }
                        });

                        if (authError) {
                            console.error(`❌ Error creating user in Auth: ${authError.message}`);
                            continue; // Skip inserting if Auth fails
                        }

                        // ✅ Step 3: Insert into `users_access` table
                        await supabase.from("users_access").insert([
                            {
                                email: user.email,
                                first_name: user.first_name,
                                last_name: user.last_name,
                                status: "approved", // Automatically approved
                                created_at: new Date().toISOString(),
                            }
                        ]);

                        console.log(`✅ User created: ${user.email}, Password: ${tempPassword}`);
                    }

                    messageBox.textContent = "✅ CSV uploaded successfully! Users can log in now.";
                    fileInput.value = ""; // Reset file input
                    fetchUsers(); // Refresh user list
                } catch (err) {
                    messageBox.textContent = "❌ Error uploading CSV: " + err.message;
                }
            };

            reader.readAsText(file);
        });
    }

    /** ✅ FUNCTION: Parse CSV Data **/
    function parseCSV(csv) {
        const rows = csv.split("\n").slice(1);
        return rows
            .map((row) => {
                const [email, firstName, lastName] = row.split(",");
                if (!email || !firstName || !lastName) return null;

                return {
                    email: email.trim(),
                    first_name: firstName.trim(),
                    last_name: lastName.trim(),
                };
            })
            .filter(Boolean);
    }

    /** ✅ FUNCTION: Fetch Users from `users_access` **/
    async function fetchUsers() {
        const userList = document.querySelector("#pending-users-list");
        if (!userList) return;

        userList.innerHTML = "🔄 Loading users...";

        try {
            const { data: users, error } = await supabase
                .from("users_access")
                .select("first_name, last_name, email");

            if (error) throw error;

            if (!users || users.length === 0) {
                userList.innerHTML = "No users found.";
                return;
            }

            userList.innerHTML = users
                .map(
                    (user) => `
                    <div class="user-row">
                        <p>${user.first_name} ${user.last_name} (${user.email})</p>
                    </div>
                `
                )
                .join("");
        } catch (err) {
            userList.innerHTML = "❌ Failed to load users.";
        }
    }

    fetchUsers(); // ✅ Load users on page load
});