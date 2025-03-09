// Include webflow-dark-light-switch-app
"use strict";
// Create script element for jQuery
var jQueryScript = document.createElement('script');
jQueryScript.src = 'https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js';
jQueryScript.onload = function () {
    var jQuery = window.jQuery.noConflict(true);
    (function ($) {
        window.Webflow = window.Webflow || [];
        window.Webflow.push(() => {

            // **Function to smoothly toggle Dark-Light mode**
            function toggleDarkLightMode(animate = true) {
                var darkMode = localStorage.getItem('darkMode') === 'true';
                var body = $('body');
                var transitionSpeed = 500; // Transition speed in ms

                var textColor = darkMode ? '#ffffff' : '#000000';
                var textColorBrand = darkMode ? '#d5ef00' : '#000000';
                var bgColor = darkMode ? '#061414' : '#ffffff';

                // Apply smooth transitions
                body.css({
                    'transition': `background-color ${transitionSpeed}ms ease, color ${transitionSpeed}ms ease`,
                    'background-color': bgColor,
                    'color': textColor
                });

                $('.paragraph, .rich-text p, .w-pagination-previous-icon, .w-pagination-next-icon, .pagination-numbers, .empath-text, .footer-link, .about-title, .title, .h2, .course-labels, .bonus-h2, .true-or-false-text, .slider-arrow-icon, .reset-password-link, .h3, .hello-text-black, .name-mark-text').css({
                    'transition': `color ${transitionSpeed}ms ease`,
                    'color': textColor
                });

                $('.empath-text-brand, .learn-more-link, .h2').css({
                    'transition': `color ${transitionSpeed}ms ease`,
                    'color': textColorBrand
                });

                $('.about-info-wrap, .pass-wrap').css({
                    'transition': `background-color ${transitionSpeed}ms ease`,
                    'background-color': bgColor
                });

                // Logo & Icon Changes
                $('.footer-logo-image').attr('src', darkMode
                    ? 'https://uploads-ssl.webflow.com/65f0d5739b651eae06b2ca56/665f6303f76b546721e71d23_FST%20Logo.svg'
                    : 'https://uploads-ssl.webflow.com/65f0d5739b651eae06b2ca56/665f645a54b57bd3f697c9b1_FST%20Logo-black.svg');

                $('.footer-logo-image-mobile').attr('src', darkMode
                    ? 'https://uploads-ssl.webflow.com/65f0d5739b651eae06b2ca56/665f640651bd7c85efe8b35c_FST%20Logo-footer-mobile-brrand.svg'
                    : 'https://uploads-ssl.webflow.com/65f0d5739b651eae06b2ca56/665f640413f98439e9de761e_FST%20Logo-footer-mobile-black.svg');

                $('.arrow-learn-more').attr('src', darkMode
                    ? 'https://uploads-ssl.webflow.com/65f0d5739b651eae06b2ca56/665d430ea891207010a463e6_arrow-dark.svg'
                    : 'https://uploads-ssl.webflow.com/65f0d5739b651eae06b2ca56/66302f64ff07464d678857b8_arrow-learn-more.svg');

                // **Button & Icon Transitions**
                $('.dark-light-button, .icon-circle-dark').toggleClass('opaque-dark', darkMode);

                if (darkMode) {
                    if (animate) {
                        $('.icon-circle-light').fadeOut(300, function () {
                            $('.icon-circle-dark').fadeIn(300);
                        });
                    } else {
                        $('.icon-circle-light').hide();
                        $('.icon-circle-dark').show();
                    }
                    $('.hero-image-wrap-light').fadeOut(300, function () {
                        $('.hero-image-wrap-dark').fadeIn(300);
                    });
                } else {
                    if (animate) {
                        $('.icon-circle-dark').fadeOut(300, function () {
                            $('.icon-circle-light').fadeIn(300);
                        });
                    } else {
                        $('.icon-circle-dark').hide();
                        $('.icon-circle-light').show();
                    }
                    $('.hero-image-wrap-dark').fadeOut(300, function () {
                        $('.hero-image-wrap-light').fadeIn(300);
                    });
                }

                // ✅ Save dark mode preference
                localStorage.setItem('darkMode', darkMode);
            }

            // **Initialize Dark Mode on Page Load**
            $(document).ready(function () {
                toggleDarkLightMode(false);
            });

            // **Toggle Dark Mode on Button Click**
            $('.dark-light-button').click(function () {
                var darkMode = localStorage.getItem('darkMode') === 'true';
                localStorage.setItem('darkMode', !darkMode);
                toggleDarkLightMode();
            });

            // **Ensure Dark Mode Setting Persists Across Pages**
            $(window).on('beforeunload', function () {
                var darkMode = localStorage.getItem('darkMode') === 'true';
                localStorage.setItem('darkMode', darkMode);
            });

        });
    })(jQuery);
};
document.head.appendChild(jQueryScript);