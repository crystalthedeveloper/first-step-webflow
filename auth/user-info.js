/**
 * user-info.js
 * -------------------------------
 * 👤 User Info Fetcher (Webflow + Supabase)
 * - Retrieves the currently authenticated user's name
 * - Displays their full name inside the `#user-info` element
 * - Falls back to "FirstStep" or "User" if unavailable
 * -------------------------------
 */

document.addEventListener("DOMContentLoaded", async () => {
  // ✅ Ensure Supabase client is available
  if (!window.supabaseClient) {
    console.error("❌ Supabase Client not found! Ensure `supabaseClient.js` is loaded first.");
    return;
  }

  const supabase = window.supabaseClient;

  try {
    // 🔍 Get active session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      updateUserInfo("FirstStep");
      return;
    }

    const user = session.user;

    // 🧾 Extract name from metadata
    const firstName = user.user_metadata?.first_name || "User";
    const lastName = user.user_metadata?.last_name || "";

    updateUserInfo(`${firstName} ${lastName}`.trim());
  } catch (err) {
    console.error("❌ Error fetching user info:", err);
    updateUserInfo("FirstStep");
  }

  // 🖊️ Update the DOM with user's name
  function updateUserInfo(message) {
    const userElement = document.querySelector("#user-info");
    if (userElement) {
      userElement.textContent = message;
    }
  }
});