// webflow-quiz 
// webflow-quiz 
"use strict";

// Create script element for jQuery
var jQueryScript = document.createElement('script');
jQueryScript.src = 'https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js';
jQueryScript.onload = function () {
  var jQuery = $.noConflict(true);

  // Supabase Client (ensure this script runs after Supabase is initialized)
  const supabase = window.supabaseClient;

  jQuery(document).ready(async function() {

    // **Check if user is logged in and update #user-info**
    async function updateUserInfo() {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData?.session?.user;

      if (user) {
        // Fetch user metadata (first & last name)
        const firstName = user.user_metadata?.first_name || "";
        const lastName = user.user_metadata?.last_name || "";
        const fullName = `${firstName} ${lastName}`.trim();

        if (fullName) {
          jQuery("#user-info").text(`${fullName}!`);
          jQuery("#user-info").removeClass("hidden");
        } else {
          jQuery("#user-info").addClass("hidden");
        }
      } else {
        jQuery("#user-info").addClass("hidden");
      }
    }

    // **Fetch and Update User Info on Page Load**
    await updateUserInfo();

    // **Update on Auth State Change (Login/Logout)**
    supabase.auth.onAuthStateChange((event, session) => {
      updateUserInfo();
    });

    // **Function to get the current page's collection item ID**
    function getCurrentPageCollectionItemID() {
      var collectionItemID = jQuery('[data-collection-item-id]').data('collection-item-id');
      return collectionItemID;
    }

    // **Event handler for quiz items**
    jQuery('.quiz-cms-item').each(function () {
      var $collectionItem = jQuery(this);
      var formSubmitted = false;

      // Event handler for true/false option
      $collectionItem.find('.quiz-cms-link-true, .quiz-cms-link-false').on('click', function () {
        if (!formSubmitted) {
          var $this = jQuery(this);
          var $siblings = $this.siblings('.quiz-cms-link-true, .quiz-cms-link-false');
          $this.find('.icon-circle').addClass('selected');
          $siblings.find('.icon-circle').removeClass('selected');
        }
      });
    });

    // **Event handler for submit button**
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
            setTimeout(function() {
              jQuery('.pass-wrap').removeClass('hide');
              jQuery('.slide-nav').addClass('hidden'); // Hide slide navigation
              jQuery('.slider-arrow-icon').addClass('hidden'); // Hide slider arrows
              updateUserInfo(); // Ensure user info is updated when quiz is completed
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