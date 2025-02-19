// Fetch the authenticated user name
document.addEventListener("DOMContentLoaded", async () => {
    const SUPABASE_URL = "https://hcchvhjuegysshozazad.supabase.co";
    const SUPABASE_KEY =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhjY2h2aGp1ZWd5c3Nob3phemFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5MzQ3OTUsImV4cCI6MjA1NTUxMDc5NX0.Y2cu9q58j8Ac8ApLp7uPcyvHx_-WFA-Wm7ZhIXBMRiE";
  
    // Properly initialize Supabase client
    const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  
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