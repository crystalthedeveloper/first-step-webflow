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
    // ✅ Update user name in the UI
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

    // ✅ Toggle selected answer
    jQuery('.quiz-cms-item .quiz-cms-link-true, .quiz-cms-link-false').on('click', function () {
      const $this = jQuery(this);
      $this.siblings('.quiz-cms-link-true, .quiz-cms-link-false').find('.icon-circle').removeClass('selected');
      $this.find('.icon-circle').addClass('selected');
    });

    // ✅ Reset slider
    function moveToFirstSlide() {
      const slider = jQuery(".w-slider");
      if (slider.length) {
        slider.find(".w-slider-mask").css("transform", "translateX(0px)");
        jQuery(".w-icon-slider-left, .w-icon-slider-right").addClass("hidden");
      }
    }

    // ✅ Handle Submit button
    jQuery('.quiz-cms-item .submit-answer').on('click', function () {
      const $item = jQuery(this).closest('.quiz-cms-item');
      const $true = $item.find('.quiz-cms-link-true');
      const $false = $item.find('.quiz-cms-link-false');
      const $submit = jQuery(this);

      if (!$submit.hasClass('submitted') &&
        ($true.find('.icon-circle').hasClass('selected') || $false.find('.icon-circle').hasClass('selected'))
      ) {
        $submit.addClass('submitted');

        jQuery(".quiz-cms-item").each(function () {
          const $link = jQuery(this);
          if ($link.find('.selected .status').hasClass('correct')) {
            $link.find('.icon-circle').addClass('answer-true');
          } else {
            $link.find('.icon-circle').addClass('answer-false');
            $link.find('.wrong-wrap').removeClass('hide');
          }
        });

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

    // ✅ Certificate Download + Save Quiz Slug to Supabase
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

        // ✅ Get current quiz slug
        const courseSlug = window.location.pathname.split("/courses/")[1] || "unknown-course";
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData?.session?.user;

        if (user) {
          const { data: existing, error: fetchError } = await supabase
            .from("users_access")
            .select("quiz_complete")
            .eq("id", user.id)
            .single();

          if (fetchError) {
            console.error("❌ Failed to fetch quiz_complete:", fetchError);
          } else {
            const currentList = Array.isArray(existing?.quiz_complete) ? existing.quiz_complete : [];

            if (!currentList.includes(courseSlug)) {
              const updatedList = [...currentList, courseSlug];

              const { error: updateError } = await supabase
                .from("users_access")
                .update({ quiz_complete: updatedList })
                .eq("id", user.id);

              if (updateError) {
                console.error("❌ Supabase update error:", updateError);
              } else {
                console.log("✅ Quiz saved to Supabase:", courseSlug);
              }
            } else {
              console.log("ℹ️ Quiz already recorded:", courseSlug);
            }
          }
        }

        // ✅ Generate the PDF
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