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

const jQueryScript = document.createElement('script');
jQueryScript.src = 'https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js';

jQueryScript.onload = function () {
  const jQuery = $.noConflict(true);

  if (!window.supabaseClient) {
    console.error("❌ Supabase Client not found! Ensure `supabaseClient.js` is loaded first.");
    return;
  }

  const supabase = window.supabaseClient;

  jQuery(document).ready(async function () {
    async function updateUserInfo() {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      const fullName = `${user?.user_metadata?.first_name || ""} ${user?.user_metadata?.last_name || ""}`.trim() || "User";

      jQuery("#certificate-name").text(fullName);
      jQuery(".congratulation-name").text(fullName);
    }

    await updateUserInfo();
    supabase.auth.onAuthStateChange(updateUserInfo);

    // ✅ Fix click handler (supports <div> structure)
    jQuery('.quiz-cms-item').on('click', '.quiz-cms-link-true, .quiz-cms-link-false, .icon-circle, .true-or-false-text', function (e) {
      e.preventDefault();

      const $option = jQuery(this).closest('.quiz-cms-link-true, .quiz-cms-link-false');
      if (!$option.length) return;

      const $item = $option.closest('.quiz-cms-item');
      const $icon = $option.find('.icon-circle');

      // Remove .selected from all other options in the same item
      $item.find('.icon-circle').removeClass('selected');

      // ✅ Add selected class
      $icon.addClass('selected');
    });

    function moveToFirstSlide() {
      const slider = jQuery(".w-slider");
      if (slider.length) {
        slider.find(".w-slider-mask").css("transform", "translateX(0px)");
        jQuery(".w-icon-slider-left, .w-icon-slider-right").addClass("hidden");
      }
    }

    // ✅ Submission logic
    jQuery('.quiz-cms-item .submit-answer').on('click', function () {
      const $item = jQuery(this).closest('.quiz-cms-item');
      const $submit = jQuery(this);
      const $selected = $item.find('.icon-circle.selected');
      const $option = $selected.closest('.quiz-cms-link-true, .quiz-cms-link-false');

      if (!$submit.hasClass('submitted') && $selected.length) {
        $submit.addClass('submitted');

        const isCorrect = $option.find('.status').hasClass('correct');
        if (isCorrect) {
          $selected.addClass('answer-true');
          $item.find('.wrong-wrap').addClass('hide');
        } else {
          $selected.addClass('answer-false');
          $item.find('.wrong-wrap').removeClass('hide');
        }

        // Prevent double click
        $item.find('.quiz-cms-link-true, .quiz-cms-link-false').off('click');

        const total = jQuery(".quiz-cms-item").length;
        const answered = jQuery('.quiz-cms-item .icon-circle.selected').length;

        if (total === answered) {
          setTimeout(() => {
            jQuery('.pass-wrap').removeClass('hide');
            jQuery('.slide-nav, .slider-arrow-icon').addClass('hidden');
            moveToFirstSlide();
            updateUserInfo();
          }, 2000);
        }
      }
    });

    // ✅ PDF Certificate Download
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
};

document.head.appendChild(jQueryScript);