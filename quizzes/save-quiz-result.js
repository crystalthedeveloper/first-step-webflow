/**
 * save-quiz-result.js
 * -------------------------------
 * 🧠 Quiz Result Saver (Webflow + Supabase Edge Function)
 * - Saves quiz result when module buttons are clicked
 * - Uses explicit data attributes (no URL guessing)
 */

document.addEventListener("DOMContentLoaded", () => {
  if (!window.supabaseClient) {
    console.error("❌ Supabase Client not found!");
    return;
  }

  const supabase = window.supabaseClient;

  // Module buttons (Modules 1–5 and Module 6)
  const buttons = document.querySelectorAll(
    "#trigger-modules, #trigger-download"
  );

  const saveQuizResult = async (e) => {
    e.preventDefault(); // 🔥 stop Webflow navigation

    const target = e.currentTarget;
    const redirectUrl = target.getAttribute("href");
    const courseSlug = target.getAttribute("data-module-slug");

    if (!courseSlug) {
      console.error("❌ Missing data-module-slug on button");
      return;
    }

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      const accessToken = sessionData?.session?.access_token;

      if (!user || !accessToken) {
        console.warn("⚠️ User not logged in or missing token");
        return;
      }

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

      // Navigate only AFTER save completes
      if (redirectUrl) {
        window.location.href = redirectUrl;
      }

    } catch (err) {
      console.error("❌ Failed to save quiz:", err);
    }
  };

  // Attach to ALL relevant buttons
  buttons.forEach((btn) =>
    btn.addEventListener("click", saveQuizResult)
  );
});
