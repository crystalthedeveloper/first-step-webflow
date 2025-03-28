/**
 * webflow-supabase-vimeo-watch-all-videos.js
 * -------------------------------
 * 🎥 Vimeo Course Tracking (Webflow + Supabase + Vimeo API)
 * - Detects which videos a user (or guest) has watched
 * - Stores session-based progress per page
 * - Unlocks quiz button only after all required videos are viewed
 * - Custom behavior for different chapters
 * -------------------------------
 */

"use strict";

// ✅ Supabase Client
const supabase = window.supabaseClient;

// 🗂️ Identify page and track progress in sessionStorage
const pageKey = window.location.pathname;
const guestVideoWatched = JSON.parse(sessionStorage.getItem(`guestVideoWatched_${pageKey}`)) || {};
const userVideoWatched = JSON.parse(sessionStorage.getItem(`userVideoWatched_${pageKey}`)) || {};
const totalVideos = new Set(); // Unique video IDs for this page

// 🔐 Check if user is authenticated
async function checkAuth() {
  const { data: sessionData } = await supabase.auth.getSession();
  return sessionData?.session?.user ?? null;
}

// 👀 Update visibility based on auth
async function updateVisibility() {
  const user = await checkAuth();

  if (user) {
    document.querySelectorAll(".userVideo").forEach(el => el.classList.remove("hidden"));
    document.querySelectorAll(".guestVideo").forEach(el => el.classList.add("hidden"));
    document.querySelectorAll(".quiz-button").forEach(el => el.classList.remove("hidden"));
    document.querySelectorAll(".quiz-button-default").forEach(el => el.classList.add("hidden"));
  } else {
    document.querySelectorAll(".userVideo").forEach(el => el.classList.add("hidden"));
    document.querySelectorAll(".guestVideo").forEach(el => el.classList.remove("hidden"));
    document.querySelectorAll(".quiz-button").forEach(el => el.classList.add("hidden"));
    document.querySelectorAll(".quiz-button-default").forEach(el => el.classList.remove("hidden"));
  }
}

// 🚫 Disable quiz button initially
function disableQuizButton() {
  const button = document.querySelector(".quiz-button");
  if (button) {
    button.classList.add("disabled");
    button.style.pointerEvents = "none";
    button.style.opacity = "0.5";
  }
}

// ✅ Enable quiz button only if all videos have been watched
function enableQuizButtonIfAllWatched() {
  checkAuth().then((user) => {
    const videoWatched = user ? userVideoWatched : guestVideoWatched;
    const watchedCount = Object.keys(videoWatched).filter(id => videoWatched[id]).length;

    console.log(`📽️ Watched Videos: ${watchedCount}/${totalVideos.size}`);

    if (watchedCount === totalVideos.size && totalVideos.size > 0) {
      const button = document.querySelector(".quiz-button");
      if (button) {
        button.classList.remove("disabled");
        button.style.pointerEvents = "auto";
        button.style.opacity = "1";
      }
    }
  });
}

// 🎯 Show completion UI when a video finishes
function unhideVideoComplete(videoId, chapter) {
  checkAuth().then((user) => {
    const completeClass = user ? `.video_complete_${chapter}` : `.guest_complete_${chapter}`;
    document.querySelectorAll(completeClass).forEach(el => el.classList.remove("hidden"));

    const watchedLinks = {
      1: { link: ".watched_link1", tab: "[data-w-tab='Tab 1']" },
      2: { link: ".watched_link2", tab: "[data-w-tab='Tab 2']" },
      3: null // No link for Chapter 3; just unlocks quiz
    };

    if (watchedLinks[chapter]) {
      document.querySelectorAll(watchedLinks[chapter].link).forEach(link => {
        link.classList.remove("disabled");
        link.style.pointerEvents = "auto";
        link.addEventListener("click", () => {
          document.querySelector(watchedLinks[chapter].tab)?.click();
        });
      });
    }

    if (chapter === 3) {
      enableQuizButtonIfAllWatched();
    }
  });
}

// 🧠 Initialize all Vimeo players on the page
function initializeVimeoPlayers() {
  document.querySelectorAll("iframe[data-vimeo-id]").forEach((iframe) => {
    const videoId = iframe.getAttribute("data-vimeo-id");
    const chapterElement = iframe.closest("[id^='Chapter']");
    const chapter = chapterElement ? parseInt(chapterElement.id.replace("Chapter ", ""), 10) : null;

    if (!videoId || !chapter) {
      console.warn("⚠️ Missing video ID or chapter:", iframe);
      return;
    }

    if (!totalVideos.has(videoId)) totalVideos.add(videoId);

    const player = new Vimeo.Player(iframe, {
      id: videoId.split("?")[0],
      controls: false,
      background: true,
    });

    player.on("ended", async () => {
      const user = await checkAuth();
      const storageKey = user ? "userVideoWatched" : "guestVideoWatched";
      const videoWatched = user ? userVideoWatched : guestVideoWatched;

      videoWatched[videoId] = true;
      sessionStorage.setItem(`${storageKey}_${pageKey}`, JSON.stringify(videoWatched));

      unhideVideoComplete(videoId, chapter);
    });
  });
}

// ➕ Utility: Load external scripts (like Vimeo API)
function loadScript(src, callback) {
  const script = document.createElement("script");
  script.src = src;
  script.defer = true;
  script.onload = callback;
  document.head.appendChild(script);
}

// 🚀 Initialize script on DOM ready
document.addEventListener("DOMContentLoaded", async () => {
  disableQuizButton();
  await updateVisibility();

  // Load Vimeo API then initialize players
  loadScript("https://player.vimeo.com/api/player.js", () => {
    initializeVimeoPlayers();
  });

  // 🔁 Listen for auth changes to update video access
  supabase.auth.onAuthStateChange(() => {
    updateVisibility();
  });
});