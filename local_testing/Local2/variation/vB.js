(function () {
  try {
    /* ==== Modal CONFIGURATION ==== */
    var MODAL_DELAY_SECONDS = 3;

    var variation_name = "cre-t-08";
    var debug = 1;

    var imageConfig = {
      crossIcon: "https://v2.crocdn.com/PAY/test8/cross.svg",
      icon1: "https://v2.crocdn.com/PAY/test8/laptop.svg",
      icon2: "https://v2.crocdn.com/PAY/test8/card.svg",
      icon3: "https://v2.crocdn.com/PAY/test8/rocket.svg",
    };

    /* ==== SESSION & COOKIE HELPERS ==== */

    function setSession(key, value) {
      sessionStorage.setItem(key, value);
    }

    function getSession(key) {
      return sessionStorage.getItem(key);
    }

    function setSessionCookie() {
      document.cookie = variation_name + "=modal-triggered; path=/";
    }

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

    /* ==== DOM HELPERS ==== */

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

    function addClass(selector, className) {
      var element = typeof selector === "string" ? document.querySelector(selector) : selector;
      if (!element) return;
      if (element.classList) element.classList.add(className);
      else if (!element.className.match(new RegExp("\b" + className + "\b"))) {
        element.className += " " + className;
      }
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

    /* ==== MODAL HTML ==== */
    var modalHtml = `<div class="cre-t-08-modal-main">
  <div id="cre-t-08-modal-overlay" class="cre-t-08-overlay"></div>
  <div class="cre-t-08-modal-container">
    <div class="cre-t-08-modal-inner">
      <div class="cre-t-08-modal-cross-icon-wrapper">
        <img src="${imageConfig.crossIcon}" alt="cross_icon" class="cre-t-08-cross-icon">
      </div>
      
      <div class="cre-t-08-modal-content">
        <div class="cre-t-08-main-title">
          Not sure if Pay.com.au is right for your business?
        </div>
        <div class="cre-t-08-sub-title">
        You don't need to move all your payments to Pay.com.au to get started. Many customers start with a single payment to see how it works.
        </div>

        <div class="cre-t-08-features-container">
    <div class="cre-t-08-feature-card card1">
        <div class="cre-t-08-icon-box">
            <div class="cre-t-08-icon-wrapper"><img src="${imageConfig.icon1}" alt="icon"></div>
        </div>
        <div class="cre-t-08-card-info">
            <div class="cre-t-08-card-title">Create a Free Account</div>
            <div class="cre-t-08-card-subtitle">Create your account in minutes. No charge unless you make a payment.
            </div>
        </div>
    </div>
    <div class="cre-t-08-feature-card card2">
        <div class="cre-t-08-icon-box">
            <div class="cre-t-08-icon-wrapper"><img src="${imageConfig.icon2}" alt="icon"></div>
        </div>
        <div class="cre-t-08-card-info">
            <div class="cre-t-08-card-title">Use Your Existing Cards</div>
            <div class="cre-t-08-card-subtitle">Keep using your existing cards, bank accounts and accounting software.
            </div>
        </div>
    </div>
    <div class="cre-t-08-feature-card card3">
        <div class="cre-t-08-icon-box">
            <div class="cre-t-08-icon-wrapper"><img src="${imageConfig.icon3}" alt="icon"></div>
        </div>
        <div class="cre-t-08-card-info">
            <div class="cre-t-08-card-title">Make a Single Payment</div>
            <div class="cre-t-08-card-subtitle">See fees, points and rewards before deciding whether to proceed.</div>
        </div>
    </div>
</div>

        <button class="cre-t-08-modal-cta">Create your free account</button>
      </div>
    </div>
  </div>
</div>`;

    /* ==== MODAL CORE LOGIC ==== */

    function hideModal() {
      var modalMain = document.querySelector(".cre-t-08-modal-main");
      if (modalMain) {
        modalMain.classList.remove("active");
        document.body.classList.remove("cre-t-08-freeze");
      }
    }

    function showModal() {
      var alreadyExists = document.querySelector(".cre-t-08-modal-main");
      if (!alreadyExists) {
        if (debug) console.log("inserting modal");
        insertAfter("body", modalHtml);
      }

      var modal = document.querySelector(".cre-t-08-modal-main");
      if (modal) {
        modal.classList.add("active");
        document.body.classList.add("cre-t-08-freeze");

        window["optimizely"] = window["optimizely"] || [];
        window["optimizely"].push({
          type: "event",
          eventName: "pay08_-_modal_fires",
          tags: {
            revenue: 0, // Optional in cents as integer (500 == $5.00)
            value: 0.0, // Optional as float
          },
        });
        setSessionCookie();
      }
    }

    function handleModalTiming() {
      if (getCookie(variation_name) === "modal-triggered") {
        if (debug) console.log("Modal already triggered in this session.");
        return;
      }

      var sessionKey = variation_name + "-target-time";
      var countdownKey = "cre-t-08-live-countdown";
      var sessionValue = getSession(sessionKey);
      if (!sessionValue) {
        var triggerTime = new Date().getTime() + MODAL_DELAY_SECONDS * 1000;
        setSession(sessionKey, triggerTime);
      }

      var interval = setInterval(function () {
        var currentTime = new Date().getTime();
        var targetTime = parseInt(getSession(sessionKey), 10);

        var secondsRemaining = Math.max(0, Math.ceil((targetTime - currentTime) / 1000));
        setSession(countdownKey, secondsRemaining + "s remaining");

        if (currentTime >= targetTime) {
          clearInterval(interval);
          setSession(countdownKey, "triggered");
          showModal();
        }
      }, 1000);
    }

    function setupCloseEvents() {
      live(".cre-t-08-modal-cross-icon-wrapper, .cre-t-08-overlay", "click", function () {
        hideModal();
      });
      live(".cre-t-08-modal-cta", "click", function () {
        window["optimizely"] = window["optimizely"] || [];
        window["optimizely"].push({
          type: "event",
          eventName: "pay08_-_clicks_on__create_your_free_account__button",
          tags: {
            revenue: 0, // Optional in cents as integer (500 == $5.00)
            value: 0.0, // Optional as float
          },
        });
        var getStartedLink = document.querySelector(".sticky-get-started a#mob-get-started") || document.querySelector("a#mob-get-started") || document.querySelector(".get-started a");
        if (getStartedLink) getStartedLink.click();
        hideModal();
      });
    }

    /* ==== VARIATION INITIALIZE ==== */
    function init() {
      addClass("body", variation_name);
      handleModalTiming();
      if (!window.CRE_EVENT_08) {
        window.CRE_EVENT_08 = true;
        setupCloseEvents();
      }

      if (debug) console.log(variation_name + " initialized");
    }

    /* Initialise variation */
    waitForElement("body", init, 50, 15000);
  } catch (e) {
    if (debug) console.log(e, "error in Test " + variation_name);
  }
})();
