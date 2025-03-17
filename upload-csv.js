// upload-csv.js
document.addEventListener("DOMContentLoaded", async () => {
    if (!window.supabaseClient) {
        updateErrorMessage("❌ Supabase Client not found! Ensure `supabaseClient.js` is loaded first.");
        return;
    }

    const supabase = window.supabaseClient;
    const messageBox = document.querySelector("#csv-upload-message");
    const errorBox = document.querySelector("#error-message");

    /** ===== CSV UPLOAD FORM ===== **/
    const uploadForm = document.querySelector("#csv-upload-form");
    const fileInput = document.querySelector("#csv-upload");

    if (uploadForm) {
        uploadForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            messageBox.textContent = "Uploading...";
            errorBox.textContent = ""; // Clear errors

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
                    const { error } = await supabase.from("users_access").insert(users);
                    if (error) throw error;

                    messageBox.textContent = "✅ CSV uploaded successfully!";
                    fileInput.value = ""; // Reset file input
                    window.fetchPendingUsers(); // ✅ Ensure this function is accessible
                } catch (err) {
                    updateErrorMessage("❌ Error uploading CSV: " + err.message);
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

    /** ===== ✅ FETCH PENDING USERS (Attach to Window) ===== **/
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
                userList.innerHTML = "✅ No pending users.";
                return;
            }

            userList.innerHTML = users
                .map(
                    (user) => `
                    <div class="user-row">
                        <p>${user.first_name} ${user.last_name} (${user.email})</p>
                        <button class="approve-btn" data-email="${user.email}">Approve</button>
                    </div>
                `
                )
                .join("");

            document.querySelectorAll(".approve-btn").forEach((btn) =>
                btn.addEventListener("click", (e) => window.approveUser(e.target.dataset.email))
            );
        } catch (err) {
            updateErrorMessage("❌ Failed to load users: " + err.message);
        }
    };

    /** ===== ✅ APPROVE USER FUNCTION (Attach to Window) ===== **/
    window.approveUser = async function (email) {
        try {
            // Step 1: Update status to "approved"
            const { error: updateError } = await supabase
                .from("users_access")
                .update({ status: "approved" })
                .eq("email", email);

            if (updateError) throw updateError;

            // Step 2: Create user in Supabase Auth
            const { error: authError } = await supabase.auth.signUp({
                email,
                password: "TempPass123!", // You can generate a random password
            });

            if (authError) throw authError;

            console.log(`✅ User approved: ${email}`);

            // Refresh the list
            window.fetchPendingUsers();
        } catch (err) {
            updateErrorMessage("❌ Error approving user: " + err.message);
        }
    };

    // ✅ Load pending users on page load
    window.fetchPendingUsers();
    setInterval(window.fetchPendingUsers, 30000); // Auto-refresh list every 30 seconds
});