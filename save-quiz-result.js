// save-quiz-result
// save-quiz-result.js
document.addEventListener("DOMContentLoaded", async () => {
    if (!window.supabaseClient) {
      console.error("❌ Supabase Client not found! Ensure `supabaseClient.js` is loaded first.");
      return;
    }
  
    const supabase = window.supabaseClient;
  
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      const accessToken = sessionData?.session?.access_token;
  
      if (!user || !accessToken) {
        console.warn("⚠️ User not logged in or missing token, skipping quiz save.");
        return;
      }
  
      const courseSlug = window.location.pathname.split("/courses/")[1] || "unknown-course";
  
      const response = await fetch("https://hcchvhjuegysshozazad.supabase.co/functions/v1/save-quiz", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}` // Required for auth (if checking in future)
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