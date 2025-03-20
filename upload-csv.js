// upload-csv.js
document.addEventListener("DOMContentLoaded", async function () {
    console.log("🚀 CSV Upload Form Initialized");

    // ✅ Import Supabase Client
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");

    // ✅ Replace with your Supabase Project Details
    const SUPABASE_URL = "https://hcchvhjuegysshozazad.supabase.co";
    const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjY2h2aGp1ZWd5c3Nob3phemFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5MzQ3OTUsImV4cCI6MjA1NTUxMDc5NX0.Y2cu9q58j8Ac8ApLp7uPcyvHx_-WFA-Wm7ZhIXBMRiE"; // 🔥 Consider securing this in an Edge Function

    // ✅ Initialize Supabase Client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // ✅ Select Form Elements
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

        // ✅ Upload CSV file to Supabase Storage
        try {
            messageDiv.innerHTML = "⏳ Uploading file...";

            const { data, error } = await supabase.storage
                .from("csv-uploads")
                .upload(`uploads/${file.name}`, file, {
                    cacheControl: "3600",
                    upsert: true, // Allows overwriting
                });

            if (error) throw error;

            messageDiv.innerHTML = `✅ Upload successful! File: ${data.path}`;
        } catch (error) {
            console.error("❌ Upload error:", error);
            messageDiv.innerHTML = `❌ Upload failed: ${error.message}`;
        }
    });
});
