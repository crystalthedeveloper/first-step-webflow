// user-info.js - Fetch and update the authenticated user's name
document.addEventListener("DOMContentLoaded", async () => {
  // Wait for Supabase to load
  if (!window.supabaseClient) {
    console.error("❌ Supabase Client not found! Ensure `supabaseClient.js` is loaded first.");
    return;
  }

  const supabase = window.supabaseClient;

  try {
    // Fetch the currently logged-in user session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      updateUserInfo("Hello, FirstStep");
      return;
    }

    const user = session.user;

    // Retrieve the first and last name from user metadata
    const firstName = user.user_metadata?.first_name || "User";
    const lastName = user.user_metadata?.last_name || "";
    updateUserInfo(`Hello, ${firstName} ${lastName}`.trim());
  } catch (err) {
    updateUserInfo("Hello, FirstStep");
  }

  // Function to update the #user-info element
  function updateUserInfo(message) {
    const userElement = document.querySelector("#user-info");
    if (userElement) {
      userElement.textContent = message;
    }
  }
});