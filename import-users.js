// import-users.js

document.querySelector("#user-csv-upload-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const fileInput = document.querySelector("#user-csv-file");
    const message = document.querySelector("#user-csv-upload-message");
  
    // Clear previous message
    message.textContent = "";
    message.style.color = "";
  
    // Check Supabase client
    if (!window.supabaseClient) {
      console.error("❌ Supabase Client not found! Ensure `supabaseClient.js` is loaded first.");
      message.textContent = "Supabase not ready. Please try again later.";
      message.style.color = "red";
      return;
    }
  
    const supabase = window.supabaseClient;
    const file = fileInput?.files?.[0];
  
    if (!file) {
      message.textContent = "Please select a CSV file.";
      message.style.color = "red";
      return;
    }
  
    try {
      // Show loading message
      message.textContent = "Uploading users...";
      message.style.color = "#ffaa00"; // yellow/orange
  
      const csvText = await file.text();
  
      // Get current session
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
  
      if (sessionError || !session) {
        message.textContent = "❌ You must be logged in to upload.";
        message.style.color = "red";
        return;
      }
  
      const token = session.access_token;
  
      // Upload CSV via Edge Function
      const response = await fetch("https://hcchvhjuegysshozazad.supabase.co/functions/v1/import-users", {
        method: "POST",
        headers: {
          "Content-Type": "text/csv",
          "Authorization": `Bearer ${token}`,
        },
        body: csvText,
      });
  
      const result = await response.json();
  
      if (response.ok) {
        const { created = 0, skipped = 0, failed = 0 } = result;
        message.style.color = "green";
        message.textContent = `✅ Users uploaded: ${created} created, ${skipped} skipped, ${failed} failed.`;
      } else {
        const errMsg = result?.error || "Unknown error";
        message.style.color = "red";
        message.textContent = `❌ Import failed: ${errMsg}`;
        console.error("Import Error:", errMsg);
      }
  
    } catch (err) {
      const errMsg = err instanceof Error ? err.message : String(err);
      message.style.color = "red";
      message.textContent = `❌ Unexpected error: ${errMsg}`;
      console.error("Unexpected Error:", err);
    }
  });  