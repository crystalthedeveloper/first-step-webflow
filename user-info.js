// Fetch the authenticated user name
document.addEventListener("DOMContentLoaded", async () => {
  // Wait for Supabase to load
  if (!window.supabaseClient) {
    console.error("❌ Supabase Client not found! Ensure `supabaseClient.js` is loaded first.");
    return;
  }

  const supabase = window.supabaseClient;

  try {
    // Fetch the currently logged-in user session
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      updateUserInfo("Welcome");
      return;
    }

    const user = session.user;

    // Retrieve the first_name from user metadata
    const firstName = user.user_metadata?.first_name || "User";
    updateUserInfo(`Welcome, ${firstName}!`);
  } catch (err) {
    updateUserInfo("Welcome");
  }

  // Function to update the #user-info element
  function updateUserInfo(message) {
    const userElement = document.querySelector("#user-info");
    if (userElement) {
      userElement.textContent = message;
    }
  }
});