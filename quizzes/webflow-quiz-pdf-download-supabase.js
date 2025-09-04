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
      const fullName =
        `${user?.user_metadata?.first_name || ""} ${user?.user_metadata?.last_name || ""}`.trim() || "User";

      $("#certificate-name").text(fullName);
      $("#certificate-name-web").text(fullName);
      $(".congratulation-name").text(fullName);
    }

    await updateUserInfo();
    supabase.auth.onAuthStateChange(updateUserInfo);

    // ✅ Mobile + Desktop safe click logic for quiz options
    $(".quiz-cms-item").on("pointerup", ".quiz-cms-link-true, .quiz-cms-link-false", function (e) {
      e.preventDefault();
      e.stopPropagation(); // prevent slider intercept

      const $option = $(this);
      const $item = $option.closest(".quiz-cms-item");

      // Remove selected from all
      $item.find(".icon-circle").removeClass("selected");

      // Add selected to tapped one
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

        // Disable further changes on this item
        $item.find(".quiz-cms-link-true, .quiz-cms-link-false").off("pointerup");

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

        // 📏 Detect content size for proper aspect ratio
        const rect = certificateContent.getBoundingClientRect();
        const aspectRatio = rect.width / rect.height;

        // 📱 Mobile vs Desktop scaling
        const isMobile = window.innerWidth < 768;
        const baseWidth = isMobile ? 1280 : 1800;
        const pdfWidth = baseWidth;
        const pdfHeight = Math.round(baseWidth / aspectRatio);
        const scale = isMobile ? 2 : 3;

        setTimeout(() => {
          html2pdf()
            .set({
              margin: 0,
              filename: "Certificate.pdf",
              image: { type: "jpeg", quality: 1 },
              html2canvas: {
                scale: scale,
                useCORS: true,
                logging: false,
                backgroundColor: "#ffffff",
              },
              jsPDF: {
                unit: "px",
                format: [pdfWidth, pdfHeight],
                orientation: "landscape",
              },
            })
            .from(certificateContent)
            .save()
            .catch((err) => console.error("❌ PDF generation failed:", err));
        }, 300);
      });
    });
  });
})(jQuery);
