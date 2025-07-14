/**
 * save-quiz-result.js
 * -------------------------------
 * 🧠 Quiz Result Saver (Webflow + Supabase Edge Function)
 * - Saves quiz result ONLY when #trigger-download or #trigger-modules is clicked
 * -------------------------------
 */

document.addEventListener("DOMContentLoaded", () => {
  // ✅ Ensure Supabase is available
  if (!window.supabaseClient) {
    console.error("❌ Supabase Client not found! Ensure `supabaseClient.js` is loaded first.");
    return;
  }

  const supabase = window.supabaseClient;

  // Select both buttons
  const downloadBtn = document.querySelector("#trigger-download");
  const modulesBtn = document.querySelector("#trigger-modules");

  // Shared save function
  const saveQuizResult = async () => {
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      const accessToken = sessionData?.session?.access_token;

      if (!user || !accessToken) {
        console.warn("⚠️ User not logged in or missing token, skipping quiz save.");
        return;
      }

      const courseSlug = window.location.pathname.split("/courses/")[1] || "unknown-course";

      // 🚀 Call Supabase Edge Function to save result
      const response = await fetch("https://hcchvhjuegysshozazad.supabase.co/functions/v1/save-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          user_id: user.id,
          quiz_slug: courseSlug,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("❌ Error saving quiz result:", result.error || result);
      } else {
        console.log("✅ Quiz result saved successfully!", result);
      }

    } catch (error) {
      console.error("❌ Unexpected error saving quiz result:", error);
    }
  };

  // Attach event listener if buttons exist
  if (downloadBtn) downloadBtn.addEventListener("click", saveQuizResult);
  if (modulesBtn) modulesBtn.addEventListener("click", saveQuizResult);
});