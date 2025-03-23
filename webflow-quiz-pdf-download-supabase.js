// webflow-quiz 
"use strict";

// Create script element for jQuery
var jQueryScript = document.createElement('script');
jQueryScript.src = 'https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js';
jQueryScript.onload = function () {
  var jQuery = $.noConflict(true);

  if (!window.supabaseClient) {
    console.error("❌ Supabase Client not found! Ensure `supabaseClient.js` is loaded first.");
    return;
  }

  const supabase = window.supabaseClient;

  jQuery(document).ready(async function () {

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

    jQuery('.quiz-cms-item .quiz-cms-link-true, .quiz-cms-link-false').on('click', function () {
      const $this = jQuery(this);
      $this.siblings('.quiz-cms-link-true, .quiz-cms-link-false')
        .find('.icon-circle').removeClass('selected');
      $this.find('.icon-circle').addClass('selected');
    });

    function moveToFirstSlide() {
      const slider = jQuery(".w-slider");
      if (slider.length) {
        slider.find(".w-slider-mask").css("transform", "translateX(0px)");
        jQuery(".w-icon-slider-left, .w-icon-slider-right").addClass("hidden");
      }
    }

    jQuery('.quiz-cms-item .submit-answer').on('click', function () {
      const $item = jQuery(this).closest('.quiz-cms-item');
      const $true = $item.find('.quiz-cms-link-true');
      const $false = $item.find('.quiz-cms-link-false');
      const $submit = jQuery(this);

      if (!$submit.hasClass('submitted') &&
          ($true.find('.icon-circle').hasClass('selected') || $false.find('.icon-circle').hasClass('selected'))) {
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

    // ✅ PDF + Edge Function call
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

        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData?.session?.user;
        const courseSlug = window.location.pathname.split("/courses/")[1] || "unknown-course";

        if (user) {
          try {
            const response = await fetch("https://hcchvhjuegysshozazad.supabase.co/functions/v1/save-quiz", {
              method: "POST",
              headers: {
                "Content-Type": "application/json"
              },
              body: JSON.stringify({
                user_email: user.email,
                quiz_slug: courseSlug
              })
            });

            const result = await response.json();
            if (!response.ok) {
              console.error("❌ Edge Function Error:", result.error);
            } else {
              console.log("✅ Edge Function Result:", result);
            }
          } catch (err) {
            console.error("❌ Network error calling Edge Function:", err);
          }
        }

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