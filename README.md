# First Step Webflow

A Webflow project showcasing various functionalities using custom HTML and JavaScript. This repository includes three primary features: a dark/light mode toggle, a PDF download implementation, and video watch tracking with Vimeo API integration.

---

## Files Overview

### 1. `webflow-dark-light-switch.html`
**Description:**  
Implements a dark/light mode toggle feature for a Webflow site. The state of the mode is stored in `localStorage` to persist user preferences across sessions.

**Key Features:**
- Toggles dark and light modes dynamically.
- Updates styles for multiple elements on the page, including colors and images.
- Persists mode selection in `localStorage`.
- Animates icon transitions for better user experience.

**Dependencies:**
- jQuery (`https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js`)

---

### 2. `webflow-pdf-download.html`
**Description:**  
Adds functionality to generate and download a certificate in PDF format upon user interaction.

**Key Features:**
- Checks if the quiz is completed before allowing PDF generation.
- Dynamically creates a certificate using the `html2pdf.js` library.
- Ensures compatibility with Webflow designs.

**Dependencies:**
- html2pdf.js (`https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.9.2/html2pdf.bundle.min.js`)

---

### 3. `webflow-vimeo-watch-all-videos.html`
**Description:**  
Tracks user interactions with Vimeo videos embedded on the page. Ensures that all videos are watched before enabling specific actions like taking a quiz.

**Key Features:**
- Uses the Vimeo API to track video progress and detect when a video ends.
- Stores watched video states in `localStorage` (separately for guests and logged-in users).
- Displays visual indicators for completed videos and enables the quiz button once all videos are watched.

**Dependencies:**
- Vimeo Player API (`https://player.vimeo.com/api/player.js`)

---

## How to Use

1. **Setup:**
   - Include the necessary libraries for each file (`jQuery`, `html2pdf.js`, and Vimeo API) in your project.
   - Link the appropriate HTML files to your Webflow project or local environment.

2. **Customization:**
   - Update the CSS selectors in the scripts to match your Webflow class names and structure.
   - Replace placeholder image URLs in the dark/light mode script with your own assets.

3. **Testing:**
   - Open each file in a browser to test its functionality.
   - Ensure that localStorage is enabled for your browser.

---

## Additional Notes

- Ensure all required dependencies are properly included in the `<head>` or dynamically loaded by the scripts.
- Customize the styles and logic as needed to match your project requirements.
- For questions or support, feel free to reach out.

---

## License

This project is open-source and available under the MIT License.
