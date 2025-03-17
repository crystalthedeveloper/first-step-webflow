// upload-csv.js
document.addEventListener("DOMContentLoaded", async () => {
    if (!window.supabaseClient) {
        document.querySelector("#csv-upload-message").textContent = "Supabase Client not found!";
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
                messageBox.textContent = "Please select a CSV file.";
                return;
            }

            const file = fileInput.files[0];
            const reader = new FileReader();

            reader.onload = async (e) => {
                const csvData = e.target.result;
                const users = parseCSV(csvData);

                if (users.length === 0) {
                    messageBox.textContent = "Invalid CSV file.";
                    return;
                }

                let successCount = 0;
                let errorMessages = [];

                try {
                    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
                    if (sessionError || !sessionData.session) {
                        messageBox.textContent = "You must be logged in to upload users.";
                        return;
                    }

                    for (const user of users) {
                        const tempPassword = "TempPass123!"; // Default password

                        // Step 1: Create user in Supabase Auth with password
                        const { error: authError } = await supabase.auth.admin.createUser({
                            email: user.email,
                            password: tempPassword,
                            email_confirm: true,  // Automatically confirm email
                            user_metadata: {
                                first_name: user.first_name,
                                last_name: user.last_name
                            }
                        });

                        if (authError) {
                            errorMessages.push(`${user.email}: ${authError.message}`);
                            continue; // Skip inserting into the table if Auth fails
                        }

                        // Step 2: Insert user into `users_access` table
                        const { error: dbError } = await supabase.from("users_access").insert([
                            {
                                email: user.email,
                                first_name: user.first_name,
                                last_name: user.last_name,
                                status: "approved",
                                created_at: new Date().toISOString(),
                            }
                        ]);

                        if (dbError) {
                            errorMessages.push(`${user.email}: Database error - ${dbError.message}`);
                            continue;
                        }

                        successCount++;
                    }

                    // Update UI message
                    if (successCount > 0) {
                        messageBox.innerHTML = `${successCount} users uploaded successfully! Users can log in now.`;
                    }
                    if (errorMessages.length > 0) {
                        messageBox.innerHTML += `<br><br>${errorMessages.join("<br>")}`;
                    }

                    fileInput.value = ""; // Reset file input
                    fetchUsers(); // Refresh user list
                } catch (err) {
                    messageBox.textContent = "Error uploading CSV: " + err.message;
                }
            };

            reader.readAsText(file);
        });
    }

    /** FUNCTION: Parse CSV Data **/
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

    /** FUNCTION: Fetch Users from `users_access` **/
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
            userList.innerHTML = "Failed to load users.";
        }
    }

    fetchUsers(); // Load users on page load
});