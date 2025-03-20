// upload-csv.js
document.addEventListener("DOMContentLoaded", async function () {
    console.log("🚀 CSV Upload Form Initialized");

    const SUPABASE_URL = "https://hcchvhjuegysshozazad.supabase.co";
    const supabase = createClient(SUPABASE_URL, "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjY2h2aGp1ZWd5c3Nob3phemFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5MzQ3OTUsImV4cCI6MjA1NTUxMDc5NX0.Y2cu9q58j8Ac8ApLp7uPcyvHx_-WFA-Wm7ZhIXBMRiE"); // Anon Key Safe Here

    // ✅ Get the user's authentication session
    const { data: session, error } = await supabase.auth.getSession();

    if (error || !session || !session.session) {
        console.error("❌ User not authenticated:", error);
        alert("You must be logged in to upload files.");
        return;
    }

    const userToken = session.session.access_token;

    const form = document.querySelector("#csv-upload-form");
    const fileInput = document.querySelector("#csv-upload");
    const messageDiv = document.querySelector("#csv-upload-message");

    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        messageDiv.innerHTML = ""; // Clear previous messages

        if (!fileInput.files.length) {
            messageDiv.innerHTML = "⚠️ Please select a CSV file.";
            return;
        }

        const file = fileInput.files[0];

        // ✅ Validate file type
        if (file.type !== "text/csv") {
            messageDiv.innerHTML = "❌ Invalid file format. Please upload a CSV file.";
            return;
        }

        // ✅ Upload to Supabase Edge Function with Authorization
        try {
            messageDiv.innerHTML = "⏳ Uploading file...";

            const formData = new FormData();
            formData.append("file", file);

            const response = await fetch(`${SUPABASE_URL}/functions/v1/upload-csv`, {
                method: "POST",
                body: formData,
                headers: {
                    "Authorization": `Bearer ${userToken}` // Secure!
                },
            });

            const result = await response.json();

            if (response.ok) {
                messageDiv.innerHTML = `✅ Upload successful! File: ${result.path}`;
            } else {
                throw new Error(result.error);
            }
        } catch (error) {
            console.error("❌ Upload error:", error);
            messageDiv.innerHTML = `❌ Upload failed: ${error.message}`;
        }
    });
});