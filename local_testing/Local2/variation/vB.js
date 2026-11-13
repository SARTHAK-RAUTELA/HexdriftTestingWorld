(function () {
  try {
    /* main variables */
    var debug = 0;
    var variation_name = "cre-t-43";

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

    function prepend(selector, html) {
      var element = document.querySelector(selector);
      if (!element) return;
      element.insertAdjacentHTML("afterbegin", html);
    }

    function append(selector, html) {
      var element = document.querySelector(selector);
      if (!element) return;
      element.insertAdjacentHTML("beforeend", html);
    }

    function insertBefore(selector, html) {
      var element = document.querySelector(selector);
      if (!element) return;
      element.insertAdjacentHTML("beforebegin", html);
    }

    /* Variation functions */

    /* move the forum nav bar to sit right under the breadcrumb, as a child of main */
    function moveNavBarUnderBreadcrumb() {
      var navBar = document.querySelector(".sub-header");
      var mainContent = document.querySelector("main#site-main > .main-content");
      if (!navBar || !mainContent) return;
      if (navBar.classList.contains("cre-t-43-nav-bar")) return;
      mainContent.parentElement.insertBefore(navBar, mainContent);
      navBar.classList.add("cre-t-43-nav-bar");
    }

    /* mark the Registration item so CSS can hide it */
    function markRegistrationItem() {
      var registrationLink = document.querySelector(".cre-t-43-nav-bar .afp-nav__list > li > a[href$='/pricing']");
      if (!registrationLink) return;
      registrationLink.parentElement.classList.add("cre-t-43-registration-item");
    }

    /* add the orange Pricing & Register button */
    function addPricingButton() {
      if (document.querySelector(".cre-t-43-cta-item")) return;
      var pricingHref = "/afp-fp-a--forum/pricing";
      append(".cre-t-43-nav-bar .afp-nav__list", `<li class="cre-t-43-cta-item"><div class="cre-t-43-cta-container"><a href="${pricingHref}" target="_self" class="cre-t-43-cta">Pricing &amp; Register</a></div></li>`);
    }

    /* rename top bar JOIN AFP to JOIN */
    function renameJoinLabel() {
      var joinLabels = document.querySelectorAll(".global-login__link--join .global-login__link-text");
      joinLabels.forEach(function (joinLabel) {
        joinLabel.textContent = "JOIN";
      });
    }

    /* find the Program dropdown list */
    function findProgramMenu() {
      var navButtons = document.querySelectorAll(".cre-t-43-nav-bar .afp-nav__list > li > button");
      var programMenu = null;
      navButtons.forEach(function (navButton) {
        if (navButton.textContent.trim() === "Program") {
          programMenu = navButton.parentElement.querySelector(".afp-nav__sub-nav");
        }
      });
      return programMenu;
    }

    /* tag each Program link with its column and new label */
    function groupProgramLinks() {
      var programMenu = findProgramMenu();
      if (!programMenu) return;
      if (programMenu.classList.contains("cre-t-43-program-menu")) return;
      programMenu.classList.add("cre-t-43-program-menu");

      var programLinks = programMenu.querySelectorAll("a");
      programLinks.forEach(function (programLink) {
        var href = programLink.getAttribute("href");
        var item = programLink.parentElement;
        if (href.indexOf("schedule-at-a-glance") > -1) {
          programLink.textContent = "Schedule at a Glance";
          item.classList.add("cre-t-43-program-sessions", "cre-t-43-program-schedule");
        } else if (href.indexOf("educational-sessions") > -1) {
          item.classList.add("cre-t-43-program-sessions", "cre-t-43-program-educational");
        } else if (href.indexOf("keynote-speakers") > -1) {
          item.classList.add("cre-t-43-program-sessions", "cre-t-43-program-keynote");
        } else if (href.indexOf("/program/networking") > -1) {
          programLink.textContent = "Networking Opportunities";
          item.classList.add("cre-t-43-program-networking", "cre-t-43-program-networking-link");
        } else if (href.indexOf("attendee-feedback") > -1) {
          programLink.textContent = "Attendee Feedback";
          item.classList.add("cre-t-43-program-networking", "cre-t-43-program-feedback");
        } else if (href.indexOf("past-forum-sessions") > -1) {
          item.classList.add("cre-t-43-program-past");
        }
      });
    }

    /* add the two column headings and the divider */
    function addProgramHeadings() {
      if (document.querySelector(".cre-t-43-program-heading")) return;
      prepend(
        ".cre-t-43-program-menu",
        `<li class="cre-t-43-program-heading cre-t-43-program-heading-sessions">Sessions &amp; Schedule</li>
         <li class="cre-t-43-program-heading cre-t-43-program-heading-networking">Networking &amp; Experience</li>`,
      );
      insertBefore(".cre-t-43-program-past", `<li class="cre-t-43-program-divider" role="presentation"></li>`);
    }

    /* Variation Init */
    function init() {
      if (!window.matchMedia("(min-width: 1200px)").matches) return;
      moveNavBarUnderBreadcrumb();
      markRegistrationItem();
      addPricingButton();
      groupProgramLinks();
      addProgramHeadings();
      renameJoinLabel();
    }

    /* Initialise variation */
    waitForElement(".sub-header .afp-nav__list .afp-nav__sub-nav", init, 50, 15000);
  } catch (e) {
    if (debug) console.log(e, "error in Test" + variation_name);
  }
})();
