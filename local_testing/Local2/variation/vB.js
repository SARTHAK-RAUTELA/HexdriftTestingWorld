(function () {
  try {
    /* ==== Modal CONFIGURATION ==== */
    var variation_name = "cre-t-19-variation";
    var cookie_name = "cre-t-19";
    var VARIATION_DELAY_SECONDS = 20; // Extra 20 seconds
    var debug = 1;

    var imageConfig = {
      crossIcon: "https://v2.crocdn.com/PAY/test8/cross.svg",
      icon1: "https://v2.crocdn.com/PAY/test8/laptop.svg",
      icon2: "https://v2.crocdn.com/PAY/test8/card.svg",
      icon3: "https://v2.crocdn.com/PAY/test8/rocket.svg",
    };

    // Cookie helpers 
    function getCookie(cname) {
      var name = cname + "=";
      var ca = document.cookie.split(";");
      for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == " ") c = c.substring(1);
        if (c.indexOf(name) != -1) return c.substring(name.length, c.length);
      }
      return "";
    }


    function setModalShownCookie() {
      document.cookie = cookie_name + "=modal-shown; path=/";
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

    function insertAfter(selector, html) {
      var element = typeof selector === "string" ? document.querySelector(selector) : selector;
      if (!element) return;
      if (typeof html === "string") {
        element.insertAdjacentHTML("afterbegin", html);
      } else if (html && html.nodeType === 1) {
        element.insertAdjacentElement("afterbegin", html);
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

    /* ==== MODAL HTML ==== */
    var modalHtml = `<div class="cre-t-19-modal-main">
  <div id="cre-t-19-modal-overlay" class="cre-t-19-overlay"></div>
  <div class="cre-t-19-modal-container">
    <div class="cre-t-19-modal-inner">
      <div class="cre-t-19-modal-cross-icon-wrapper">
        <img src="${imageConfig.crossIcon}" alt="cross_icon" class="cre-t-19-cross-icon">
      </div>
      
      <div class="cre-t-19-modal-content">
        <div class="cre-t-19-main-title">
          Not sure if pay.com.au is right for your business?
        </div>
        <div class="cre-t-19-sub-title"">
        You don't need to move all your payments to pay.com.au to get started. Many customers start with a single payment to see how it works.
        </div>

        <div class="cre-t-19-features-container">
    <div class="cre-t-19-feature-card card1">
        <div class="cre-t-19-icon-box">
            <div class="cre-t-19-icon-wrapper"><img src="${imageConfig.icon1}" alt="icon"></div>
        </div>
        <div class="cre-t-19-card-info">
            <div class="cre-t-19-card-title">Create a Free Account</div>
            <div class="cre-t-19-card-subtitle">Get set up in minutes. No charge unless you make a payment.
            </div>
        </div>
    </div>
    <div class="cre-t-19-feature-card card2">
        <div class="cre-t-19-icon-box">
            <div class="cre-t-19-icon-wrapper"><img src="${imageConfig.icon2}" alt="icon"></div>
        </div>
        <div class="cre-t-19-card-info">
            <div class="cre-t-19-card-title">Use Your Existing Cards</div>
            <div class="cre-t-19-card-subtitle">Keep using your cards, bank accounts and software.
            </div>
        </div>
    </div>
    <div class="cre-t-19-feature-card card3">
        <div class="cre-t-19-icon-box">
            <div class="cre-t-19-icon-wrapper"><img src="${imageConfig.icon3}" alt="icon"></div>
        </div>
        <div class="cre-t-19-card-info">
            <div class="cre-t-19-card-title">Start With a Single Payment</div>
            <div class="cre-t-19-card-subtitle">See your fees, points and rewards before you pay.</div>
        </div>
    </div>
</div>

        <button class="cre-t-19-modal-cta">Create your free account</button>
      </div>
    </div>
  </div>
</div>`;

    /* ==== MODAL CORE LOGIC ==== */

    function hideModal() {
      var modalMain = document.querySelector(".cre-t-19-modal-main");
      if (modalMain) {
        modalMain.classList.remove("active");
        document.body.classList.remove("cre-t-19-freeze");
      }
    }

    function showModal() {
      var alreadyExists = document.querySelector(".cre-t-19-modal-main");
      if (!alreadyExists) {
        if (debug) console.log("inserting modal");
        insertAfter("body", modalHtml);
      }

      var modal = document.querySelector(".cre-t-19-modal-main");
      if (modal) {
        modal.classList.add("active");
        document.body.classList.add("cre-t-19-freeze");
      }
    }

    function setupCloseEvents() {
      live(".cre-t-19-modal-cross-icon-wrapper, .cre-t-19-overlay", "click", function () {
        hideModal();
      });
      live(".cre-t-19-modal-cta", "click", function () {
        window['optimizely'] = window['optimizely'] || [];
        window['optimizely'].push({
          type: "event",
          eventName: "pay19_-_clicks_on__create_your_free_account__button",
          tags: {
            revenue: 0, // Optional in cents as integer (500 == $5.00)
            value: 0.00 // Optional as float
          }
        });

        var targetBtn = document.querySelector(".sticky-get-started a#mob-get-started");
        if (targetBtn) {
          targetBtn.click();
        }
        hideModal();
      });
    }


    function executeModalView() {
      // Check if already shown
      if (getCookie(cookie_name) === "modal-shown") return;

      window['optimizely'] = window['optimizely'] || [];
      window['optimizely'].push({
        type: "event",
        eventName: "pay19_-_modal_fires",
        tags: {
          revenue: 0, // Optional in cents as integer (500 == $5.00)
          value: 0.00 // Optional as float
        }
      });

      // Show modal and set cookie 
      showModal();
      setModalShownCookie();

      if (!window.CRE_EVENT_19) {
        window.CRE_EVENT_19 = true;
        setupCloseEvents();
      }
    }

    /* ==== VARIATION INITIALIZE ==== */
    function init() {
      addClass("body", variation_name);

      // Variation's internal 20s cross-page timer
      var sessionKeyVariation = cookie_name + "-variation-time";
      var sessionValue = sessionStorage.getItem(sessionKeyVariation);

      if (!sessionValue) {
        var triggerTime = new Date().getTime() + VARIATION_DELAY_SECONDS * 1000;
        sessionStorage.setItem(sessionKeyVariation, triggerTime);
      }

      var varInterval = setInterval(function () {
        var currentTime = new Date().getTime();
        var targetTime = parseInt(sessionStorage.getItem(sessionKeyVariation), 10);

        if (currentTime >= targetTime) {
          clearInterval(varInterval);
          executeModalView();
        }
      }, 1000);

      if (debug) console.log(variation_name + " initialized - waiting for extra 20s");
    }

    /* Initialise variation */
    waitForElement("body", init, 50, 15000);
  } catch (e) {
    if (debug) console.log(e, "error in Test " + variation_name);
  }
})();