// webflow-quiz-status

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

        // Get course slug from URL
        const courseSlug = window.location.pathname.split("/courses/")[1] || "unknown-course";

        // ✅ Fetch completed quiz list from Supabase
        const { data, error } = await supabase
            .from("users_access")
            .select("quiz_complete")
            .eq("id", user.id) // Match by user ID (recommended over email)
            .single();

        if (error) {
            console.error("❌ Failed to fetch quiz completion:", error);
            return;
        }

        const completed = Array.isArray(data.quiz_complete) ? data.quiz_complete : [];

        if (completed.includes(courseSlug)) {
            console.log("✅ Quiz completed for:", courseSlug);
            document.querySelector(".overlay-quiz-complete")?.classList.remove("hide");
        } else {
            console.log("ℹ️ Quiz not completed yet for:", courseSlug);
        }

    } catch (err) {
        console.error("❌ Error checking quiz completion:", err);
    }
});
