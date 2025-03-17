// upload-csv.js
document.addEventListener("DOMContentLoaded", async () => {
    if (!window.supabaseClient) {
        updateErrorMessage(" Supabase Client not found! Ensure `supabaseClient.js` is loaded first.");
        return;
    }

    const supabase = window.supabaseClient;
    const messageBox = document.querySelector("#csv-upload-message");
    const errorBox = document.querySelector("#error-message");
    const approveAllBtn = document.querySelector("#approve-all-btn");

    /** ===== CSV UPLOAD FORM ===== **/
    const uploadForm = document.querySelector("#csv-upload-form");
    const fileInput = document.querySelector("#csv-upload");

    if (uploadForm) {
        uploadForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            messageBox.textContent = "Uploading...";
            errorBox.textContent = ""; // Clear errors

            if (!fileInput.files.length) {
                messageBox.textContent = " Please select a CSV file.";
                return;
            }

            const file = fileInput.files[0];
            const reader = new FileReader();

            reader.onload = async (e) => {
                const csvData = e.target.result;
                const users = parseCSV(csvData);

                if (users.length === 0) {
                    messageBox.textContent = " Invalid CSV file.";
                    return;
                }

                try {
                    const { error } = await supabase.from("users_access").insert(users);
                    if (error) throw error;

                    messageBox.textContent = "CSV uploaded successfully!";
                    fileInput.value = ""; // Reset file input
                    window.fetchPendingUsers(); // Refresh pending users list
                } catch (err) {
                    updateErrorMessage(" Error uploading CSV: " + err.message);
                }
            };

            reader.readAsText(file);
        });
    }

    /** ===== FUNCTION: Show Errors on Webflow UI ===== **/
    function updateErrorMessage(message) {
        errorBox.textContent = message;
        console.error(message);
    }

    /** ===== FUNCTION: Parse CSV Data ===== **/
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
                    status: "pre-approved",
                    created_at: new Date().toISOString(),
                };
            })
            .filter(Boolean);
    }

    /** ===== FETCH PENDING USERS (Attach to Window) ===== **/
    window.fetchPendingUsers = async function () {
        const userList = document.querySelector("#pending-users-list");
        if (!userList) return;

        userList.innerHTML = "Loading users...";
        errorBox.textContent = ""; // Clear errors

        try {
            const { data: users, error } = await supabase
                .from("users_access")
                .select("*")
                .eq("status", "pre-approved");

            if (error) throw error;

            if (!users || users.length === 0) {
                userList.innerHTML = "No pending users.";
                approveAllBtn.style.display = "none"; // Hide Approve All Button
                return;
            }

            // Display user list but remove individual approve buttons
            userList.innerHTML = users
                .map(
                    (user) => `
                    <div class="user-row">
                        <p>${user.first_name} ${user.last_name} (${user.email})</p>
                    </div>
                `
                )
                .join("");

            approveAllBtn.style.display = "block"; // Show Approve All Button
        } catch (err) {
            updateErrorMessage(" Failed to load users: " + err.message);
        }
    };

    /** ===== APPROVE ALL USERS FUNCTION (Batch Update) ===== **/
    async function approveAllUsers() {
        try {
            // Fetch all pending users
            const { data: users, error: fetchError } = await supabase
                .from("users_access")
                .select("email")
                .eq("status", "pre-approved");

            if (fetchError) throw fetchError;
            if (!users || users.length === 0) {
                updateErrorMessage(" No pending users to approve.");
                return;
            }

            const emails = users.map(user => user.email); // Extract emails

            // Step 1: Update status to "approved" in bulk
            const { error: updateError } = await supabase
                .from("users_access")
                .update({ status: "approved" })
                .in("email", emails);

            if (updateError) throw updateError;

            // Step 2: Create users in Supabase Auth in batch
            for (const email of emails) {
                const { error: authError } = await supabase.auth.signUp({
                    email,
                    password: "TempPass123!", // You can generate a random password
                });

                if (authError) {
                    console.error(` Error creating auth for ${email}:`, authError);
                } else {
                    console.log(`User approved and added to auth: ${email}`);
                }
            }

            // Refresh the list after approval
            window.fetchPendingUsers();
        } catch (err) {
            updateErrorMessage(" Error approving users: " + err.message);
        }
    }

    // Attach Approve All function to button
    approveAllBtn.addEventListener("click", approveAllUsers);

    // Load pending users on page load
    window.fetchPendingUsers();
    setInterval(window.fetchPendingUsers, 30000); // Auto-refresh list every 30 seconds
});