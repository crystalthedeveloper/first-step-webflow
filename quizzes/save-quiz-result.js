/**
 * save-quiz-result.js
 * -------------------------------
 * 🧠 Quiz Result Saver (Webflow + Supabase Edge Function)
 * - Saves quiz result ONLY when #trigger-download or #trigger-modules is clicked
 * -------------------------------
 */

document.addEventListener("DOMContentLoaded", () => {
  if (!window.supabaseClient) {
    console.error("❌ Supabase Client not found!");
    return;
  }

  const supabase = window.supabaseClient;

  const downloadBtn = document.querySelector("#trigger-download");
  const modulesBtn = document.querySelector("#trigger-modules");

  const saveQuizResult = async (e) => {
    // 🔥 STOP the link navigation
    if (e) e.preventDefault();

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      const accessToken = sessionData?.session?.access_token;

      if (!user || !accessToken) {
        console.warn("⚠️ User not logged in or missing token");
        return;
      }

      const courseSlug =
        window.location.pathname.split("/courses/")[1] || "unknown-course";

      await fetch(
        "https://hcchvhjuegysshozazad.supabase.co/functions/v1/save-quiz",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            user_id: user.id,
            quiz_slug: courseSlug,
          }),
        }
      );

      console.log("✅ Quiz saved:", courseSlug);

      // ✅ NOW navigate (only for Modules button)
      if (e?.currentTarget?.id === "trigger-modules") {
        window.location.href = "/login/modules";
      }

    } catch (err) {
      console.error("❌ Failed to save quiz:", err);
    }
  };

  if (downloadBtn) {
    downloadBtn.addEventListener("click", saveQuizResult);
  }

  if (modulesBtn) {
    modulesBtn.addEventListener("click", saveQuizResult);
  }
});
