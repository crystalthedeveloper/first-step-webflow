// upload-csv.js
document.addEventListener("DOMContentLoaded", async () => {
    if (!window.supabaseClient) {
        console.error("❌ Supabase Client not found! Ensure `supabaseClient.js` is loaded first.");
        return;
    }

    const supabase = window.supabaseClient;
    
    /** ===== CSV UPLOAD FORM ===== **/
    const uploadForm = document.querySelector("#csv-upload-form");
    const fileInput = document.querySelector("#csv-upload");
    const messageBox = document.querySelector("#csv-upload-message");

    if (uploadForm) {
        uploadForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            messageBox.textContent = "Uploading...";

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
                    fetchPendingUsers(); // Refresh user list
                } catch (err) {
                    console.error(err);
                    messageBox.textContent = "❌ Error uploading CSV.";
                }
            };

            reader.readAsText(file);
        });
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

    /** ===== FETCH PENDING USERS ===== **/
    async function fetchPendingUsers() {
        const userList = document.querySelector("#pending-users-list");
        if (!userList) return;

        userList.innerHTML = "Loading users...";

        const { data: users, error } = await supabase
            .from("users_access")
            .select("*")
            .eq("status", "pre-approved");

        if (error) {
            console.error(error);
            userList.innerHTML = "❌ Error loading users.";
            return;
        }

        if (!users.length) {
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
            btn.addEventListener("click", (e) => approveUser(e.target.dataset.email))
        );
    }

    /** ===== APPROVE USER FUNCTION ===== **/
    async function approveUser(email) {
        const tempPassword = "TempPass123!"; // You can generate a random password instead

        try {
            // Step 1: Update status to "approved"
            const { error: updateError } = await supabase
                .from("users_access")
                .update({ status: "approved" })
                .eq("email", email);

            if (updateError) throw updateError;

            // Step 2: Create user in Supabase Auth with temp password
            const { error: authError } = await supabase.auth.signUp({
                email,
                password: tempPassword,
            });

            if (authError) throw authError;

            console.log(`✅ User approved: ${email}`);

            // Refresh the list to remove the approved user
            fetchPendingUsers();
        } catch (err) {
            console.error("❌ Error approving user:", err.message);
        }
    }

    fetchPendingUsers(); // Load pending users when the page loads
    setInterval(fetchPendingUsers, 30000); // Auto-refresh list every 30 seconds
});