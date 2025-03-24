// save-quiz-result
// save-quiz-result.js
document.addEventListener("DOMContentLoaded", async () => {
    // ✅ Ensure Supabase client is loaded
    if (!window.supabaseClient) {
      console.error("❌ Supabase Client not found! Ensure `supabaseClient.js` is loaded first.");
      return;
    }
  
    const supabase = window.supabaseClient;
  
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
  
      if (!user) {
        console.warn("⚠️ User not logged in, skipping quiz save.");
        return;
      }
  
      const courseSlug = window.location.pathname.split("/courses/")[1] || "unknown-course";
  
      const response = await fetch("https://hcchvhjuegysshozazad.supabase.co/functions/v1/save-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user.id,     // ✅ Using user ID for reliability
          quiz_slug: courseSlug // ✅ Current course slug from URL
        }),
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        console.error("❌ Edge Function Error:", result.error);
      } else {
        console.log("✅ Quiz save success:", result);
      }
    } catch (error) {
      console.error("❌ Unexpected error calling Edge Function:", error);
    }
  });  