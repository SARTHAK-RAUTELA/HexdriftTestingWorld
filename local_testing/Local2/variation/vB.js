(function () {
  try {
    /* main variables */
    var debug = 1;
    var variation_name = "cre-t-03";

    var config = {
      tickIcon: `
        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 16 16" fill="none">
          <path d="M13.3334 4L6.00008 11.3333L2.66675 8" stroke="#0b4f8a" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      `,
      badges: ["Full Manufacturer Specs", "Exact Part Numbers"],
    };

    function waitForElement(selector, trigger, delayInterval = 50, delayTimeout = 15000) {
      var interval = setInterval(function () {
        if (document.querySelector(selector)) {
          clearInterval(interval);
          trigger();
        }
      }, delayInterval);
      setTimeout(function () {
        clearInterval(interval);
      }, delayTimeout);
    }

    function addBadges() {
      var viewer = document.querySelector("product-gallery .product-gallery__viewer");
      if (!viewer || viewer.querySelector(".cre-t-03-badges")) return;

      var badgesHtml = config.badges
        .map(function (text, i) {
          return '<span class="cre-t-03-badge cre-t-03-badge-' + (i + 1) + '">' + config.tickIcon + "<span>" + text + "</span></span>";
        })
        .join("");

      viewer.insertAdjacentHTML("beforeend", '<div class="cre-t-03-badges">' + badgesHtml + "</div>");
    }

    function init() {
      document.body.classList.add(variation_name);
      addBadges();

      /* re-add if the theme re-renders the gallery */
      // new MutationObserver(addBadges).observe(document.querySelector("product-gallery"), { childList: true, subtree: true });
    }

    waitForElement("product-gallery .product-gallery__viewer", init, 50, 15000);
  } catch (e) {
    if (debug) console.log(e, "error in Test " + variation_name);
  }
})();