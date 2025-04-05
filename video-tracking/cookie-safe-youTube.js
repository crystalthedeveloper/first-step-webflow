// Cookie-safe YouTube Lazy Loader - Webflow footer
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll(".lazy-youtube").forEach((container) => {
      container.addEventListener("click", () => {
        const id = container.getAttribute("data-id");
        const iframe = document.createElement("iframe");
        iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`;
        iframe.setAttribute("frameborder", "0");
        iframe.setAttribute("allow", "autoplay; fullscreen; picture-in-picture");
        iframe.setAttribute("allowfullscreen", "");
        iframe.style.position = "absolute";
        iframe.style.top = "0";
        iframe.style.left = "0";
        iframe.style.width = "100%";
        iframe.style.height = "100%";
        container.innerHTML = "";
        container.appendChild(iframe);
      });
    });
  });