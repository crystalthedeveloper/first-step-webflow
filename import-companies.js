//import-companies.js
document.querySelector("#company-csv-upload-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const fileInput = document.querySelector("#company-csv-file");
    const message = document.querySelector("#company-csv-upload-message");
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
  
      // ✅ Get session and token
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
  
      // ✅ Send the token in the Authorization header
      const response = await fetch("https://hcchvhjuegysshozazad.supabase.co/functions/v1/import-companies", {
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
        message.textContent = `✅ Successfully imported ${result.inserted} compan${result.inserted === 1 ? "y" : "ies"}.`;
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