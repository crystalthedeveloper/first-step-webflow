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
  
      // ✅ Extract the course slug from each button's href (on the Modules CMS page)
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
          
          // Find the .overlay-quiz-complete inside the same course block and unhide it
          const courseItem = button.closest(".courses-cms-item");
          courseItem?.querySelector(".overlay-quiz-complete")?.classList.remove("hide");
        } else {
          console.log(`ℹ️ Quiz not completed yet for: ${courseSlug}`);
        }
      });
  
    } catch (err) {
      console.error("❌ Error checking quiz completion:", err);
    }
  });  