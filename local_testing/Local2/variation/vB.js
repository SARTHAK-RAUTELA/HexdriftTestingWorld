(function () {
  try {
    /* main variables */
    var debug = 0;
    var variation_name = "cre-t-132";
    var config = {
      phoneIcon: "http://v2.crocdn.com/SwiftTest/test132/cre-132-phone-icon.svg"
    };

    /* all Pure helper functions */

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

    function insertAfter(selector, html) {
      var element = typeof selector === "string" ? document.querySelector(selector) : selector;
      if (!element) return;
      if (typeof html === "string") {
        element.insertAdjacentHTML("afterend", html);
      } else if (html && html.nodeType === 1) {
        element.insertAdjacentElement("afterend", html);
      }
    }

    function addClass(selector, className) {
      var element = typeof selector === "string" ? document.querySelector(selector) : selector;
      if (!element) return;
      if (element.classList) element.classList.add(className);
      else if (!element.className.match(new RegExp("\b" + className + "\b"))) {
        element.className += " " + className;
      }
    }
    /* Variation functions */
    var phoneNumber = `
    <li class="cre-t-132-phone-container">
      <img src="${config.phoneIcon}" alt="Phone Icon" class="cre-t-132-phone-icon" fetchpriority="high">
      <a href="tel:+18006933529" class="cre-t-132-phone-link">+1 (800) 693-3529</a>
    </li>
    `;

    /* Variation Init */
    function init() {
      /* start your code here */
      // Your logic here
      if (debug) console.log(variation_name + " initialized");

      if (document.body.classList.contains("cre-t-132")) return;
      addClass("body", "cre-t-132");

      var menuItems = document.querySelectorAll(".header-nav .menu-item");
      menuItems.forEach(function (item) {
        if (item.textContent.includes("Contact")) {
          var existingPhone = document.querySelector(".cre-t-132-phone-container");
          if (item && !existingPhone) {
            addClass(item, "cre-t-132-contact-item");
            insertAfter(item, phoneNumber);
          }
        }
      });
    }

    /* Initialise variation */
    waitForElement(".header-nav .menu-item", init, 50, 15000);
  } catch (e) {
    if (debug) console.log(e, "error in Test " + variation_name);
  }
})();