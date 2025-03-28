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

// ✅ Load jQuery dynamically
const jQueryScript = document.createElement('script');
jQueryScript.src = 'https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js';

jQueryScript.onload = function () {
  const jQuery = $.noConflict(true);

  // ✅ Check for Supabase
  if (!window.supabaseClient) {
    console.error("❌ Supabase Client not found! Ensure `supabaseClient.js` is loaded first.");
    return;
  }

  const supabase = window.supabaseClient;

  jQuery(document).ready(async function () {
    // ✅ Fetch user info
    async function updateUserInfo() {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;
      const firstName = user?.user_metadata?.first_name || "";
      const lastName = user?.user_metadata?.last_name || "";
      const fullName = `${firstName} ${lastName}`.trim() || "User";
      jQuery("#certificate-name").text(fullName);
      jQuery(".congratulation-name").text(fullName);
    }

    await updateUserInfo();
    supabase.auth.onAuthStateChange(updateUserInfo);

    // ✅ FIXED: Answer selection — works with <div> answers
    jQuery('.quiz-cms-item').on('click', '.quiz-cms-link-true, .quiz-cms-link-false, .icon-circle, .true-or-false-text', function () {
      const $option = jQuery(this).closest('.quiz-cms-link-true, .quiz-cms-link-false');
      const $item = $option.closest('.quiz-cms-item');

      // Remove previously selected
      $item.find('.icon-circle').removeClass('selected');

      // Add selected to this one
      $option.find('.icon-circle').addClass('selected');
    });

    // Reset slider to first
    function moveToFirstSlide() {
      const slider = jQuery(".w-slider");
      if (slider.length) {
        slider.find(".w-slider-mask").css("transform", "translateX(0px)");
        jQuery(".w-icon-slider-left, .w-icon-slider-right").addClass("hidden");
      }
    }

    // ✅ Handle submission
    jQuery('.quiz-cms-item .submit-answer').on('click', function () {
      const $item = jQuery(this).closest('.quiz-cms-item');
      const $true = $item.find('.quiz-cms-link-true');
      const $false = $item.find('.quiz-cms-link-false');
      const $submit = jQuery(this);

      const hasSelected = $item.find('.icon-circle.selected').length > 0;

      if (!$submit.hasClass('submitted') && hasSelected) {
        $submit.addClass('submitted');

        const $selected = $item.find('.icon-circle.selected');
        const $option = $selected.closest('.quiz-cms-link-true, .quiz-cms-link-false');
        const isCorrect = $option.find('.status').hasClass('correct');

        if (isCorrect) {
          $selected.addClass('answer-true');
          $item.find('.wrong-wrap').addClass('hide');
        } else {
          $selected.addClass('answer-false');
          $item.find('.wrong-wrap').removeClass('hide');
        }

        $true.addClass('submitted').off('click');
        $false.addClass('submitted').off('click');

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