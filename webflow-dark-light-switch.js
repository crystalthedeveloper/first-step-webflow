// Include webflow-dark-light-switch-app
"use strict";
// Create script element for jQuery
var jQueryScript = document.createElement('script');
jQueryScript.src = 'https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js';
jQueryScript.onload = function () {
    var jQuery = window.jQuery.noConflict(true);
    // Encapsulate jQuery code in an anonymous function
    (function ($) {
        // Ensure Webflow array exists
        window.Webflow = window.Webflow || [];
        // Push function to Webflow array
        window.Webflow.push(() => {
            // Function to toggle dark-light mode
            function toggleDarkLightMode() {
                var darkMode = localStorage.getItem('darkMode') === 'true';
                var body = $('body');
                var textColor = darkMode ? '#ffffff' : '#000000';
                var textColorBrand = darkMode ? '#d5ef00' : '#000000';
                var bgColor = darkMode ? '#061414' : '#ffffff';

                body.css({
                    'background-color': bgColor,
                    'color': textColor
                });

                // Set styles for various elements
                $('.paragraph, .rich-text p, .w-pagination-previous-icon, .w-pagination-next-icon, .pagination-numbers, .empath-text, .footer-link, .about-title, .title, .h2, .course-labels, .bonus-h2, .true-or-false-text, .slider-arrow-icon, .reset-password-link, .h3, .hello-text-black, .name-mark-text').css('color', textColor);
                $('.empath-text-brand, .learn-more-link, .h2').css('color', textColorBrand);
                $('.about-info-wrap, .pass-wrap').css('background-color', bgColor);
                $('.footer-logo-image').attr('src', darkMode ? 'https://uploads-ssl.webflow.com/65f0d5739b651eae06b2ca56/665f6303f76b546721e71d23_FST%20Logo.svg' : 'https://uploads-ssl.webflow.com/65f0d5739b651eae06b2ca56/665f645a54b57bd3f697c9b1_FST%20Logo-black.svg');
                $('.footer-logo-image-mobile').attr('src', darkMode ? 'https://uploads-ssl.webflow.com/65f0d5739b651eae06b2ca56/665f640651bd7c85efe8b35c_FST%20Logo-footer-mobile-brrand.svg' : 'https://uploads-ssl.webflow.com/65f0d5739b651eae06b2ca56/665f640413f98439e9de761e_FST%20Logo-footer-mobile-black.svg');
                $('.arrow-learn-more').attr('src', darkMode ? 'https://uploads-ssl.webflow.com/65f0d5739b651eae06b2ca56/665d430ea891207010a463e6_arrow-dark.svg' : 'https://uploads-ssl.webflow.com/65f0d5739b651eae06b2ca56/66302f64ff07464d678857b8_arrow-learn-more.svg');

                // Add/remove classes for dark mode
                $('.dark-light-button, .icon-circle-dark').toggleClass('opaque-dark', darkMode);

                if (darkMode) {
                    $('.icon-circle-light').fadeOut(400, function () {
                        $('.icon-circle-dark').fadeIn(400);
                    });
                    $('.hero-image-wrap-light').hide();
                    $('.hero-image-wrap-dark').show();
                } else {
                    $('.icon-circle-dark').fadeOut(400, function () {
                        $('.icon-circle-light').fadeIn(400);
                    });
                    $('.hero-image-wrap-light').show();
                    $('.hero-image-wrap-dark').hide();
                }

                // Update local storage
                localStorage.setItem('darkMode', darkMode);
            }

            // Check and toggle dark-light mode on page load
            $(document).ready(function () {
                toggleDarkLightMode();
            });

            // Toggle dark-light mode on button click
            $('.dark-light-button').click(function () {
                var darkMode = localStorage.getItem('darkMode') === 'true';
                localStorage.setItem('darkMode', !darkMode);
                toggleDarkLightMode();
            });

            // Store dark-light mode selection in local storage when navigating to a different page
            $(window).on('beforeunload', function () {
                var darkMode = localStorage.getItem('darkMode') === 'true';
                localStorage.setItem('darkMode', darkMode);
            });

        });
    })(jQuery);
};
document.head.appendChild(jQueryScript);