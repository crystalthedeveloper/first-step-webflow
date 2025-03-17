// upload-csv.js
document.addEventListener("DOMContentLoaded", async () => {
    if (!window.supabaseClient) {
        console.error("Supabase Client not found! Ensure `supabaseClient.js` is loaded first.");
        return;
    }

    const supabase = window.supabaseClient;
    const messageBox = document.querySelector("#csv-upload-message");
    const fileInput = document.querySelector("#csv-upload");
    const uploadForm = document.querySelector("#csv-upload-form");

    if (uploadForm) {
        uploadForm.addEventListener("submit", async (event) => {
            event.preventDefault();
            messageBox.textContent = "Uploading...";

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

                try {
                    // Insert users with "pending" status
                    const { error } = await supabase.from("users_access").insert(users);
                    if (error) throw error;

                    messageBox.textContent = "CSV uploaded successfully!";
                    fileInput.value = ""; // Reset file input
                } catch (err) {
                    messageBox.textContent = "Error uploading CSV: " + err.message;
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
                    status: "pending", // Users start as "pending"
                    created_at: new Date().toISOString(),
                };
            })
            .filter(Boolean);
    }
});