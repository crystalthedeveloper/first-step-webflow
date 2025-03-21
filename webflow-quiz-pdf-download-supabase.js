// webflow-quiz 
"use strict";

// Create script element for jQuery
var jQueryScript = document.createElement('script');
jQueryScript.src = 'https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js';
jQueryScript.onload = function () {
  var jQuery = $.noConflict(true);

  // Supabase Client (ensure this script runs after Supabase is initialized)
  const supabase = window.supabaseClient;

  jQuery(document).ready(async function () {

    // **Check if user is logged in and update all instances of #user-info & #certificate-name**
    async function updateUserInfo() {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;

      if (user) {
        const firstName = user.user_metadata?.first_name || "";
        const lastName = user.user_metadata?.last_name || "";
        const fullName = `${firstName} ${lastName}`.trim();

        if (fullName) {
          jQuery("#certificate-name").text(fullName);

          // Update all elements with the class "congratulation-name" on every slide
          jQuery(".congratulation-name").each(function () {
            jQuery(this).text(fullName);
          });

        } else {
          jQuery(".congratulation-name, #certificate-name").text("User");
        }
      } else {
        jQuery(".congratulation-name, #certificate-name").text("User");
      }
    }

    // **Fetch and Update User Info on Page Load**
    await updateUserInfo();

    // **Update on Auth State Change (Login/Logout)**
    supabase.auth.onAuthStateChange((event, session) => {
      updateUserInfo();
    });

    // **Allow Clicking True/False Again**
    jQuery('.quiz-cms-item .quiz-cms-link-true, .quiz-cms-link-false').on('click', function () {
      var $this = jQuery(this);
      var $siblings = $this.siblings('.quiz-cms-link-true, .quiz-cms-link-false');

      // Remove selection from the other option
      $siblings.find('.icon-circle').removeClass('selected');

      // Add selection to the clicked option
      $this.find('.icon-circle').addClass('selected');
    });

    // **Move Slider to First Slide and Hide Arrows on Completion**
    function moveToFirstSlide() {
      const slider = jQuery(".w-slider");
      if (slider.length) {
        // Move the slider to the first slide
        slider.find(".w-slider-mask").css("transform", "translateX(0px)");

        // Hide left and right arrows
        jQuery(".w-icon-slider-left, .w-icon-slider-right").addClass("hidden");

        console.log("✅ Slider moved to the first slide and arrows are hidden.");
      }
    }

    // **Handle Quiz Completion & Disable Navigation**
    jQuery('.quiz-cms-item .submit-answer').on('click', function () {
      var $collectionItem = jQuery(this).closest('.quiz-cms-item');
      var $trueOption = $collectionItem.find('.quiz-cms-link-true');
      var $falseOption = $collectionItem.find('.quiz-cms-link-false');
      var $submitButton = jQuery(this);

      if (!$submitButton.hasClass('submitted')) {
        if ($trueOption.find('.icon-circle').hasClass('selected') || $falseOption.find('.icon-circle').hasClass('selected')) {
          $submitButton.addClass('submitted');

          var totalQuestions = jQuery(".quiz-cms-item").length;
          var answeredQuestions = jQuery('.quiz-cms-item .icon-circle.selected').length;

          // Mark answers
          $collectionItem.find('.true-false-options-wrap').each(function () {
            var $link = jQuery(this);
            if ($link.find('.selected .status').hasClass('correct')) {
              $link.find('.icon-circle').addClass('answer-true');
            } else {
              $link.find('.icon-circle').addClass('answer-false');
              $collectionItem.find('.wrong-wrap').removeClass('hide');
            }
          });

          // **Disable Clicking After Submission**
          $trueOption.addClass('submitted').off('click');
          $falseOption.addClass('submitted').off('click');

          if (totalQuestions === answeredQuestions) {
            setTimeout(function () {
              jQuery('.pass-wrap').removeClass('hide');
              jQuery('.slide-nav, .slider-arrow-icon').addClass('hidden'); // Hide navigation
              moveToFirstSlide(); // Move slider to first slide
              updateUserInfo(); // Ensure full name is updated
            }, 2000);
          }
        }
      }
    });

    // **PDF Download Logic for CMS Buttons**
    const cmsButtons = document.querySelectorAll(".button-primary");
    const certificateWrap = document.getElementById("certificate-wrap");
    const certificateContent = document.getElementById("certificate-content");

    cmsButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();

        const passWrap = button.closest(".quiz-cms-item").querySelector(".pass-wrap");
        if (passWrap && !passWrap.classList.contains("hide")) {
          certificateWrap.classList.remove("hide");
          certificateWrap.style.display = "block";

          // Ensure the full name is added before generating PDF
          updateUserInfo();

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
        }
      });
    });

  });
};
document.head.appendChild(jQueryScript);