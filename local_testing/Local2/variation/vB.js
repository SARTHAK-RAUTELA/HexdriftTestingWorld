(function () {
  try {
    /* main variables */
    var debug = 0;
    var variation_name = "cre-t-15";

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

    function addClassForNavMenu() {
      const targetElements = document.querySelectorAll('li.afp-nav__item > [type="button"]');
      const targetElements2 = document.querySelectorAll(".afp-nav__sub-nav-title[href]");
      const targetElements3 = document.querySelectorAll(".afp-nav__item a");

      targetElements.forEach((element) => {
        if (element.textContent.trim() === "Events") {
          const navItem = element.closest(".afp-nav__item");

          if (navItem && !navItem.classList.contains("cre-t-15-events")) {
            navItem.classList.add("cre-t-15-events");
          }
        }
      });

      targetElements2.forEach((element) => {
        if (element.textContent.trim() === "Annual Conference") {
          const li = element.closest("li");

          if (li && !li.classList.contains("cre-t-15-conference")) {
            li.classList.add("cre-t-15-conference");
          }
        }
      });

      targetElements3.forEach((element) => {
        if (element.textContent.trim() === "Conference Session Archives") {
          const li = element.closest("li");

          if (li && !li.classList.contains("cre-t-15-conference-archive")) {
            li.classList.add("cre-t-15-conference-archive");
          }
        }
      });
    }

    function addNewNavMenu() {
      const addedElement = document.querySelector(".cre-t-15-conference ul");

      if (addedElement && !addedElement.querySelector(".cre-t-15-nav-item")) {
        const navHtml = `
      <li class="afp-nav__item cre-t-15-nav-item cre-t-15-nav-item-register">
        <a href="https://conference.financialprofessionals.org/program/overview/schedule" target="_self" class="afp-nav__link">Register & Save $675</a>
        <div class="cre-t-15-tool">ENDS JUNE 26</div>
      </li>
      <li class="afp-nav__item cre-t-15-nav-item cre-t-15-nav-item-glance">
        <a href="https://conference.financialprofessionals.org/program/overview/schedule" target="_self" class="afp-nav__link">Schedule at a Glance</a>
      </li>
      <li class="afp-nav__item cre-t-15-nav-item cre-t-15-nav-item-pricing">
        <a href="https://conference.financialprofessionals.org/registration/team" target="_self" class="afp-nav__link">Team Pricing</a>
      </li>
      <li class="afp-nav__item cre-t-15-nav-item cre-t-15-nav-item-ctp">
        <a href="https://conference.financialprofessionals.org/general-information/about-the-event/recertification" target="_self" class="afp-nav__link">CTP / FPAC / CPE Credits</a>
      </li>
      <li class="afp-nav__item cre-t-15-nav-item cre-t-15-nav-item-convince">
        <a href="https://conference.financialprofessionals.org/general-information/experience/convince" target="_self" class="afp-nav__link">Convince Your Manager</a>
      </li>
      <li class="afp-nav__item cre-t-15-nav-item cre-t-15-nav-item-hotel">
        <a href="https://conference.financialprofessionals.org/hotel-travel" target="_self" class="afp-nav__link">Hotel & Travel</a>
      </li>
    `;

        addedElement.insertAdjacentHTML("beforeend", navHtml);
      }
    }

    function eventListener() {
      live(".cre-t-02-testimonial-content-review", "click", function () {
        document.querySelector("#experience-685c134809420")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
      live(".cre-t-02-benefit-view", "click", function () {
        document.querySelector("#InteriorContent_C035_Col00")?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      });
    }

    /* Variation Init */
    function init() {
      if (document.body.classList.contains("cre-t-15")) return;
      addClass("body", variation_name);

      addClassForNavMenu();
      addNewNavMenu();

      if (!window.creT02Event) {
        eventListener();
        window.creT02Event = true;
      }
    }

    /* Init variation */
    waitForElement("li.afp-nav__item > [type='button']", init, 50, 25000);
  } catch (e) {
    if (debug) console.log(e, "error in Test " + variation_name);
  }
})();
