/**
 * webflow-quiz-pdf-download-supabase.js
 * -------------------------------
 * 🧠 Interactive Quiz System for Webflow (jQuery + Supabase)
 * - Handles quiz answer selection and feedback
 * - Shows certificate upon completion
 * - Generates downloadable PDF via html2pdf
 * -------------------------------
 */

"use strict";

// ✅ No need to add jQuery — Webflow already includes it
(function ($) {
  if (!window.supabaseClient) {
    console.error("❌ Supabase Client not found! Ensure `supabaseClient.js` is loaded first.");
    return;
  }

  const supabase = window.supabaseClient;

  $(document).ready(async function () {
    async function updateUserInfo() {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      const fullName = `${user?.user_metadata?.first_name || ""} ${user?.user_metadata?.last_name || ""}`.trim() || "User";

      $("#certificate-name").text(fullName);
      $(".congratulation-name").text(fullName);
    }

    await updateUserInfo();
    supabase.auth.onAuthStateChange(updateUserInfo);

    // ✅ Click logic for <a> quiz options
    $(".quiz-cms-item").on("click", ".quiz-cms-link-true, .quiz-cms-link-false", function (e) {
      e.preventDefault();
      const $option = $(this);
      const $item = $option.closest(".quiz-cms-item");

      // Remove selected from all
      $item.find(".icon-circle").removeClass("selected");

      // Add selected to clicked one
      $option.find(".icon-circle").addClass("selected");
    });

    // ⏪ Reset slide
    function moveToFirstSlide() {
      const slider = $(".w-slider");
      if (slider.length) {
        slider.find(".w-slider-mask").css("transform", "translateX(0px)");
        $(".w-icon-slider-left, .w-icon-slider-right").addClass("hidden");
      }
    }

    // ✅ Submit answer
    $(".quiz-cms-item .submit-answer").on("click", function () {
      const $item = $(this).closest(".quiz-cms-item");
      const $submit = $(this);
      const $selected = $item.find(".icon-circle.selected");
      const $option = $selected.closest(".quiz-cms-link-true, .quiz-cms-link-false");

      if (!$submit.hasClass("submitted") && $selected.length) {
        $submit.addClass("submitted");

        const isCorrect = $option.find(".status").hasClass("correct");

        if (isCorrect) {
          $selected.addClass("answer-true");
          $item.find(".wrong-wrap").addClass("hide");
        } else {
          $selected.addClass("answer-false");
          $item.find(".wrong-wrap").removeClass("hide");
        }

        $item.find(".quiz-cms-link-true, .quiz-cms-link-false").off("click");

        const total = $(".quiz-cms-item").length;
        const answered = $(".quiz-cms-item .icon-circle.selected").length;

        if (total === answered) {
          setTimeout(() => {
            $(".pass-wrap").removeClass("hide");
            $(".slide-nav, .slider-arrow-icon").addClass("hidden");
            moveToFirstSlide();
            updateUserInfo();
          }, 2000);
        }
      }
    });

    // 🧾 Certificate PDF
    const cmsButtons = document.querySelectorAll(".button-primary");
    const certificateWrap = document.getElementById("certificate-wrap");
    const certificateContent = document.getElementById("certificate-content");

    cmsButtons.forEach((button) => {
      button.addEventListener("click", async (event) => {
        event.preventDefault();

        const passWrap = button.closest(".pass-wrap");
        if (!passWrap || passWrap.classList.contains("hide")) return;

        certificateWrap.classList.remove("hide");
        certificateWrap.style.display = "block";

        await updateUserInfo();

        html2pdf()
          .from(certificateContent)
          .set({
            margin: 0,
            filename: "Certificate.pdf",
            image: { type: "jpeg", quality: 1 },
            html2canvas: { scale: 2, useCORS: true, allowTaint: false },
            jsPDF: { format: "a4", orientation: "landscape" },
          })
          .save();
      });
    });
  });
})(jQuery);