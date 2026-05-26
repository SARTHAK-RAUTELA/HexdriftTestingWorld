(function () {
  try {
    /* main variables */
    var debug = 1;
    var variation_name = "cre-t-08";

    /* all Pure helper functions */

    function waitForElement(selector, trigger, delayInterval = 50, delayTimeout = 15000) {
      var interval = setInterval(function () {
        if (document && document.querySelector(selector)) {
          clearInterval(interval);
          trigger();
        }
      }, delayInterval);
      setTimeout(function () {
        clearInterval(interval);
      }, delayTimeout);
    }

    function addClass(selector, className) {
      var element = typeof selector === "string" ? document.querySelector(selector) : selector;
      if (!element) return;
      if (element.classList) element.classList.add(className);
      else if (!element.className.match(new RegExp("\b" + className + "\b"))) {
        element.className += " " + className;
      }
    }

    // Main logic function
    function hideSection() {
      var allheadings = document.querySelectorAll(".elementor-heading-title");
      allheadings.forEach(function (el) {
        console.log("test Heading text found:", el.textContent.trim());
        if (el.textContent.trim() === "How does it work?") {
          var parentElement = el.closest(".elementor-element.e-con.e-parent");
          if (parentElement) {
            parentElement.classList.add("cre-t-08-decluttering");
          }
        }
        if (el.textContent.trim() === "Book a Telehealth Consultation") {
          var parentElement = el.closest(".elementor-element.e-con.e-parent");
          if (parentElement) {
            parentElement.classList.add("cre-t-08-decluttering");
          }
        }

        if (el.textContent.trim() === "Incredible Ways Telehealth Improves Urgent Care") {
          var newparentElement = el.closest(".elementor-element.e-child");
          if (newparentElement) {
            newparentElement.classList.add("cre-t-08-decluttering-child");
          }
        }

        if (el.textContent.trim().includes("Common health")) {
          var parentContainer = el.closest('.elementor-element[data-element_type="container"]');
          if (parentContainer) {
            var topParent = parentContainer.parentElement.closest('.elementor-element[data-element_type="container"]');
            var finalElement = topParent ? topParent : parentContainer;
            finalElement.classList.add("cre-t-08-decluttering-child-common");
          }
        }
      });
    }

    /* Variation Init */
    function init() {
      addClass("body", variation_name);
      hideSection();

      if (debug) console.log(variation_name + " initialized");
    }

    /* Initialise variation */
    waitForElement(".elementor-heading-title", init, 50, 15000);
  } catch (e) {
    if (debug) console.log(e, "error in Test " + variation_name);
  }
})();