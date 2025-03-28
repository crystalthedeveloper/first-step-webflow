/**
 * save-quiz-result.js
 * -------------------------------
 * 🧠 Quiz Result Saver (Webflow + Supabase Edge Function)
 * - Runs on course quiz completion page
 * - Authenticates user session
 * - Calls Edge Function to log the quiz result by course slug
 * - Skips execution if user is not logged in
 * -------------------------------
 */

document.addEventListener("DOMContentLoaded", async () => {
  // ✅ Ensure Supabase is available
  if (!window.supabaseClient) {
    console.error("❌ Supabase Client not found! Ensure `supabaseClient.js` is loaded first.");
    return;
  }

  const supabase = window.supabaseClient;

  try {
    // 🔐 Get current session and token
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user;
    const accessToken = sessionData?.session?.access_token;

    if (!user || !accessToken) {
      console.warn("⚠️ User not logged in or missing token, skipping quiz save.");
      return;
    }

    // 🧾 Derive course slug from URL
    const courseSlug = window.location.pathname.split("/courses/")[1] || "unknown-course";

    // 🚀 Call Supabase Edge Function to save result
    const response = await fetch("https://hcchvhjuegysshozazad.supabase.co/functions/v1/save-quiz", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}` // 🔐 Optional: for future secure verification
      },
      body: JSON.stringify({
        user_id: user.id,
        quiz_slug: courseSlug,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("❌ Edge Function Error:", result.error || result);
    } else {
      console.log("✅ Quiz result saved:", result);
    }

  } catch (error) {
    console.error("❌ Unexpected error calling Edge Function:", error);
  }
});
