// webflow-quiz-status.js

// webflow-quiz-status.js

document.addEventListener("DOMContentLoaded", async () => {
    if (!window.supabaseClient) {
      console.error("❌ Supabase Client not found! Make sure supabaseClient.js is loaded.");
      return;
    }
  
    const supabase = window.supabaseClient;
  
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
  
      if (!user) {
        console.warn("⚠️ User not logged in. Quiz overlay will remain hidden.");
        return;
      }
  
      // ✅ Loop through all course buttons on the modules page
      document.querySelectorAll("a.button-primary").forEach(async (button) => {
        const href = button.getAttribute("href");
        const courseSlug = href?.split("/courses/")[1];
  
        if (!courseSlug) return;
  
        const { data, error } = await supabase
          .from("users_access")
          .select("quiz_complete")
          .eq("id", user.id)
          .single();
  
        if (error) {
          console.error("❌ Failed to fetch quiz completion:", error);
          return;
        }
  
        const completed = Array.isArray(data.quiz_complete) ? data.quiz_complete : [];
  
        if (completed.includes(courseSlug)) {
          console.log(`✅ Quiz completed for: ${courseSlug}`);
  
          // ✅ Show the overlay
          const courseItem = button.closest(".courses-cms-item");
          const overlay = courseItem?.querySelector(".overlay-quiz-complete");
          if (overlay) {
            overlay.classList.remove("hide");
            overlay.style.display = "flex"; // ✅ Force it visible even if Webflow sets display: none
          }
        } else {
          console.log(`ℹ️ Quiz not completed yet for: ${courseSlug}`);
        }
      });
  
    } catch (err) {
      console.error("❌ Error checking quiz completion:", err);
    }
  });  