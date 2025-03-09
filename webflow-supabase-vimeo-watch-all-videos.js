//webflow-supabase-vimeo-watch-all-videos
"use strict";

// Supabase Client (ensure this script runs after Supabase is initialized)
const supabase = window.supabaseClient;

// Generate a unique key for each page based on the URL
const pageKey = window.location.pathname;

// Initialize videoWatched objects for guest and logged-in users
const guestVideoWatched = JSON.parse(sessionStorage.getItem(`guestVideoWatched_${pageKey}`)) || {};
const userVideoWatched = JSON.parse(sessionStorage.getItem(`userVideoWatched_${pageKey}`)) || {};

const totalVideos = new Set(); // Store unique video IDs for this page

// **Check if user is logged in via Supabase**
async function checkAuth() {
    const { data: sessionData } = await supabase.auth.getSession();
    return sessionData?.session?.user ?? null;
}

// **Toggle Video Visibility Based on Auth State**
async function updateVideoVisibility() {
    const user = await checkAuth();

    if (user) {
        document.querySelectorAll(".userVideo").forEach(el => el.classList.remove("hidden"));
        document.querySelectorAll(".guestVideo").forEach(el => el.classList.add("hidden"));
    } else {
        document.querySelectorAll(".userVideo").forEach(el => el.classList.add("hidden"));
        document.querySelectorAll(".guestVideo").forEach(el => el.classList.remove("hidden"));
    }
}

// **Disable Quiz Button Initially**
function disableQuizButton() {
    const button = document.querySelector(".quiz-button");
    if (button) {
        button.classList.add("disabled");
        button.style.pointerEvents = "none";
        button.style.opacity = "0.5";
    }
}

// **Enable Quiz Button If All Videos Are Watched**
function enableQuizButtonIfAllWatched() {
    checkAuth().then((user) => {
        const videoWatched = user ? userVideoWatched : guestVideoWatched;
        const watchedCount = Object.keys(videoWatched).filter(id => videoWatched[id]).length;

        console.log(`Watched Videos: ${watchedCount}/${totalVideos.size}`);

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

// **Unhide Completion Elements After Watching Video & Add Click Handlers**
function unhideVideoComplete(videoId, chapter) {
    checkAuth().then((user) => {
        if (user) {
            document.querySelectorAll(`.video_complete_${chapter}`).forEach(el => el.classList.remove("hidden"));
        } else {
            document.querySelectorAll(`.guest_complete_${chapter}`).forEach(el => el.classList.remove("hidden"));
        }

        // **Attach click handlers to watched links**
        const watchedLinks = {
            1: { link: ".watched_link1", tab: "[data-w-tab='Tab 1']" },
            2: { link: ".watched_link2", tab: "[data-w-tab='Tab 2']" },
            3: null, // No link for Chapter 3, just unlocks quiz button
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

        // **Enable Quiz Button if Chapter 3 is completed**
        if (chapter === 3) {
            enableQuizButtonIfAllWatched();
        }
    });
}

// **Initialize Vimeo Players**
function initializeVimeoPlayers() {
    document.querySelectorAll("iframe[data-vimeo-id]").forEach((iframe) => {
        const videoId = iframe.getAttribute("data-vimeo-id");
        const chapterElement = iframe.closest("[id^='Chapter']");
        const chapter = chapterElement ? parseInt(chapterElement.id.replace("Chapter ", ""), 10) : null;

        if (!videoId || !chapter) {
            console.warn("Missing video ID or chapter data:", iframe);
            return;
        }

        if (!totalVideos.has(videoId)) totalVideos.add(videoId);

        const player = new Vimeo.Player(iframe, {
            id: videoId.split("?")[0], // Ensure clean video ID
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

// **Load External Scripts Dynamically**
function loadScript(src, callback) {
    const script = document.createElement("script");
    script.src = src;
    script.defer = true;
    script.onload = callback;
    document.head.appendChild(script);
}

// **Initialize on DOMContentLoaded**
document.addEventListener("DOMContentLoaded", async () => {
    disableQuizButton();  // Ensure quiz starts disabled
    await updateVideoVisibility(); // Check user auth & update visibility

    // Dynamically load Vimeo API and initialize players
    loadScript("https://player.vimeo.com/api/player.js", () => {
        initializeVimeoPlayers();
    });

    // **Watch for Auth State Changes**
    supabase.auth.onAuthStateChange((event, session) => {
        updateVideoVisibility();
    });
});