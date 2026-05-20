(function () {
  try {
    /* main variables */
    var debug = 0;
    var variation_name = "cre-t-13";

    /* all Pure helper functions */
    function addClass(selector, className) {
      var element = typeof selector === "string" ? document.querySelector(selector) : selector;
      if (!element) return;
      if (element.classList) element.classList.add(className);
      else if (!element.className.match(new RegExp("\b" + className + "\b"))) {
        element.className += " " + className;
      }
    }
    function waitForElement(selector, trigger, delayInterval = 50, delayTimeout = 15000) {
      var interval = setInterval(function () {
        if (document && document.querySelector(selector) && document.querySelectorAll(selector).length > 0) {
          clearInterval(interval);
          trigger();
        }
      }, delayInterval);
      setTimeout(function () {
        clearInterval(interval);
      }, delayTimeout);
    }
    function live(selector, event, callback, context) {
      if (typeof callback !== "function") return;
      context = context || document;

      context.addEventListener(event, function (e) {
        var el = e.target.closest(selector);
        if (el && context.contains(el)) {
          callback.call(el, e);
        }
      });
    }

    function addButtonNav() {
      var buttonHtml = `<div class="cre-t-13-button">
      <div class="cre-t-13-button-copy"> <a href="https://conference.financialprofessionals.org/registration" class="cre-t-13-button-copy-a"> Register & Save $675</a> </div>
    </div>
`;

      if (!document.querySelector(".cre-t-13-button")) {
        document.querySelector(".nav-utilities-wrapper").insertAdjacentHTML("beforebegin", buttonHtml);
      }
    }

    function removeTextAndAddIcon() {
      // Get the link element with the class '.login-link a'
      const loginLink = document.querySelector(".login-link a");

      if (loginLink) {
        // Remove the text content
        loginLink.textContent = "";

        // Add the SVG icon
        const svgIcon = `
      <img src=http://v2.crocdn.com/AFP/test13/profile.svg />
    `;

        // Insert the SVG into the link
        loginLink.insertAdjacentHTML("afterbegin", svgIcon);
      }
    }

    /* Variation Init */
    function init() {
      if (document.body.classList.contains("cre-t-13")) return;
      addClass("body", variation_name);

      addButtonNav();
      removeTextAndAddIcon();
    }

    /* Init variation */
    waitForElement(".nav-utilities-wrapper .login", init, 50, 25000);
  } catch (e) {
    if (debug) console.log(e, "error in Test " + variation_name);
  }
})();
