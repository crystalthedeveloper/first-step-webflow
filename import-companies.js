//import-companies.js
document.querySelector("#company-csv-upload-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const fileInput = document.querySelector("#company-csv-file");
    const message = document.querySelector("#company-csv-upload-message");
    message.textContent = "";
    message.style.color = "";
  
    // ✅ Wait for Supabase client to load
    if (!window.supabaseClient) {
      console.error("❌ Supabase Client not found! Ensure `supabaseClient.js` is loaded first.");
      message.textContent = "Supabase not ready. Please try again later.";
      message.style.color = "red";
      return;
    }
  
    const file = fileInput?.files?.[0];
  
    if (!file) {
      message.textContent = "Please select a CSV file.";
      message.style.color = "red";
      return;
    }
  
    try {
      const csvText = await file.text();
  
      const response = await fetch("https://hcchvhjuegysshozazad.supabase.co/functions/v1/import-companies", {
        method: "POST",
        headers: {
          "Content-Type": "text/csv"
        },
        body: csvText
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