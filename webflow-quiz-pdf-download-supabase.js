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

    // **Check if user is logged in and update #user-info & #certificate-name**
    async function updateUserInfo() {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;

      if (user) {
        const firstName = user.user_metadata?.first_name || "";
        const lastName = user.user_metadata?.last_name || "";
        const fullName = `${firstName} ${lastName}`.trim();

        if (fullName) {
          jQuery("#user-info").text(`Congratulations ${fullName}!`);
          jQuery("#user-info").removeClass("hidden");
          jQuery("#certificate-name").text(fullName);
        } else {
          jQuery("#user-info").addClass("hidden");
          jQuery("#certificate-name").text("");
        }
      } else {
        jQuery("#user-info").addClass("hidden");
        jQuery("#certificate-name").text("");
      }
    }

    // **Fetch and Update User Info on Page Load**
    await updateUserInfo();

    // **Update on Auth State Change (Login/Logout)**
    supabase.auth.onAuthStateChange((event, session) => {
      updateUserInfo();
    });

    // **Handle Quiz Completion & Disable Navigation**
    jQuery('.quiz-cms-item .submit-answer').on('click', function () {
      var $questionItem = jQuery(".quiz-cms-item");
      var $collectionItem = jQuery(this).closest('.quiz-cms-item');
      var $trueOption = $collectionItem.find('.quiz-cms-link-true');
      var $falseOption = $collectionItem.find('.quiz-cms-link-false');
      var $submitButton = jQuery(this);

      if (!$submitButton.hasClass('submitted')) {
        if ($trueOption.find('.icon-circle').hasClass('selected') || $falseOption.find('.icon-circle').hasClass('selected')) {
          $submitButton.addClass('submitted');
          $trueOption.addClass('submitted');
          $falseOption.addClass('submitted');
          $trueOption.off('click');
          $falseOption.off('click');

          var totalQuestions = $questionItem.length;
          var answeredQuestions = jQuery('.quiz-cms-item .icon-circle.selected').length;

          $collectionItem.find('.true-false-options-wrap').each(function () {
            var $link = jQuery(this);
            if ($link.find('.selected').find('.status').hasClass('correct')) {
              $link.find('.icon-circle').addClass('answer-true');
            } else if ($link.find('.selected').find('.status').hasClass('incorrect')) {
              $link.find('.icon-circle').addClass('answer-false');
              $collectionItem.find('.wrong-wrap').removeClass('hide');
            }
          });

          if (totalQuestions === answeredQuestions) {
            setTimeout(function () {
              jQuery('.pass-wrap').removeClass('hide');
              jQuery('.slide-nav').addClass('hidden'); // Hide slide navigation
              jQuery('.slider-arrow-icon').addClass('hidden'); // Hide slider arrows
              jQuery(".quiz-cms-item").hide(); // Hide all quiz items
              jQuery(".quiz-cms-item:first").show(); // Show only the first quiz item
              updateUserInfo();
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