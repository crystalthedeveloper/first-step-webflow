// upload-csv.js
  document.addEventListener("DOMContentLoaded", function () {
    console.log("🚀 CSV Upload Form Initialized");

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

      // ✅ Upload to Supabase Edge Function
      try {
        messageDiv.innerHTML = "⏳ Uploading file...";

        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("https://your-supabase-url.functions.supabase.co/upload-csv", {
          method: "POST",
          body: formData,
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
