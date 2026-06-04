(function () {
  try {
    /* main variables */
    var debug = 0;
    var variation_name = "cre-t-18";
    var targetSelector = '.main-nav a[href="/general-information/experience/convince"]';

    /* Variation Init */
    function init() {
      // Global flag to prevent duplicate execution during client-side navigation
      if (document.body.classList.contains('cre-t-18')) {
        return;
      }
      
      document.body.classList.add('cre-t-18');

      if (debug) console.log(variation_name + " initialized");

      // Find all instances of the "Convince Your Boss" anchor tag
      var targetAnchors = document.querySelectorAll(targetSelector);

      targetAnchors.forEach(function (targetAnchor) {
        // Traverse up to the parent list item
        var parentLi = targetAnchor.closest('.main-nav__links-column-list-item');

        if (parentLi) {
          // HTML string for the new list item
          // NOTE: Replace href="#" with your actual target="_blank" link later
          var newLinkHtml = `
            <li class="main-nav__links-column-list-item cre-t-18-new-item">
                <a href="https://v2.crocdn.com/AFP/test18/AFP_2026_Conference_Summary-cre-t-18.pdf" target="_blank" class="main-nav__links-column-list-link cre-t-18-new-link">
                    Download One-Page Conference Summary
                </a>
            </li>
          `;

          // Insert the new list item directly after the current "Convince Your Boss" item
          parentLi.insertAdjacentHTML('afterend', newLinkHtml);
        }
      });
    }

    /* Custom Polling Logic for 2 Elements */
    var pollInterval = setInterval(function () {
      var elements = document.querySelectorAll(targetSelector);
      
      // Wait specifically for both links to be rendered
      if (elements && elements.length >= 2) {
        clearInterval(pollInterval);
        init();
      }
    }, 250); // 250ms interval

    // Clear interval after 5000ms fallback
    setTimeout(function () {
      clearInterval(pollInterval);
    }, 5000);

  } catch (e) {
    if (debug) console.log(e, "error in Test " + variation_name);
  }
})();
