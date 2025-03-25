// import-users.js

document.querySelector("#user-csv-upload-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const fileInput = document.querySelector("#user-csv-file");
    const message = document.querySelector("#user-csv-upload-message");
    message.textContent = "";
    message.style.color = "";
  
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
      const csvText = await file.text();
  
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
        message.style.color = "green";
        message.textContent = `✅ Users uploaded: ${result.created} created, ${result.skipped} skipped, ${result.failed} failed.`;
      } else {
        message.style.color = "red";
        message.textContent = `❌ Import failed: ${result.error}`;
        console.error("Import Error:", result.error);
      }
  
    } catch (err) {
      message.style.color = "red";
      message.textContent = `❌ Unexpected error: ${err.message}`;
      console.error("Unexpected Error:", err);
    }
  });
  