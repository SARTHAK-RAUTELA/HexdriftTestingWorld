(function () {
  try {
    /* ==== Modal CONFIGURATION ==== */
    var variation_name = "cre-t-13-control";
    var debug = 0;

    var imageConfig = {
      crossIcon: "https://v2.crocdn.com/PAY/test8/cross.svg",
      icon1: "https://v2.crocdn.com/PAY/test8/laptop.svg",
      icon2: "https://v2.crocdn.com/PAY/test8/card.svg",
      icon3: "https://v2.crocdn.com/PAY/test8/rocket.svg"
    };

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
    var modalHtml = `<div class="cre-t-13-modal-main">
  <div id="cre-t-13-modal-overlay" class="cre-t-13-overlay"></div>
  <div class="cre-t-13-modal-container">
    <div class="cre-t-13-modal-inner">
      <div class="cre-t-13-modal-cross-icon-wrapper">
        <img src="${imageConfig.crossIcon}" alt="cross_icon" class="cre-t-13-cross-icon">
      </div>
      
      <div class="cre-t-13-modal-content">
        <div class="cre-t-13-main-title">
          Not sure if Pay.com.au is right for your business?
        </div>
        <div class="cre-t-13-sub-title"">
        You don't need to move all your payments to Pay.com.au to get started. Many customers start with a single payment to see how it works.
        </div>

        <div class="cre-t-13-features-container">
    <div class="cre-t-13-feature-card card1">
        <div class="cre-t-13-icon-box">
            <div class="cre-t-13-icon-wrapper"><img src="${imageConfig.icon1}" alt="icon"></div>
        </div>
        <div class="cre-t-13-card-info">
            <div class="cre-t-13-card-title">Create a Free Account</div>
            <div class="cre-t-13-card-subtitle">Create your account in minutes. No charge unless you make a payment.
            </div>
        </div>
    </div>
    <div class="cre-t-13-feature-card card2">
        <div class="cre-t-13-icon-box">
            <div class="cre-t-13-icon-wrapper"><img src="${imageConfig.icon2}" alt="icon"></div>
        </div>
        <div class="cre-t-13-card-info">
            <div class="cre-t-13-card-title">Use Your Existing Cards</div>
            <div class="cre-t-13-card-subtitle">Keep using your existing cards, bank accounts and accounting software.
            </div>
        </div>
    </div>
    <div class="cre-t-13-feature-card card3">
        <div class="cre-t-13-icon-box">
            <div class="cre-t-13-icon-wrapper"><img src="${imageConfig.icon3}" alt="icon"></div>
        </div>
        <div class="cre-t-13-card-info">
            <div class="cre-t-13-card-title">Make a Single Payment</div>
            <div class="cre-t-13-card-subtitle">Review your fees, points and rewards before making your first payment.</div>
        </div>
    </div>
</div>

        <button class="cre-t-13-modal-cta">Create your free account</button>
      </div>
    </div>
  </div>
</div>`;

    /* ==== MODAL CORE LOGIC ==== */
    function optimizelyGoal(eventName) {
      window["optimizely"] = window["optimizely"] || [];
      window["optimizely"].push({
        type: "event",
        eventName: eventName,
        tags: {
          revenue: 0,
          value: 0.0
        }
      });
    }

    function hideModal() {
      var modalMain = document.querySelector(".cre-t-13-modal-main");
      if (modalMain) {
        modalMain.remove();
        document.body.classList.remove("cre-t-13-freeze");
      }
    }

    function showModal() {
      var alreadyExists = document.querySelector(".cre-t-13-modal-main");
      if (!alreadyExists) {
        if (debug) console.log("inserting modal");
        insertAfter("body", modalHtml);
      }

      var modal = document.querySelector(".cre-t-13-modal-main");
      if (modal) {
        modal.classList.add("active");
        document.body.classList.add("cre-t-13-freeze");
      }
    }

    function setupCloseEvents() {
      live(".cre-t-13-modal-cross-icon-wrapper, .cre-t-13-overlay", "click", function () {
        hideModal();
      });
      live(".cre-t-13-modal-cta", "click", function () {
        // Optimizely Goal Create Account
        optimizelyGoal("pay13_-_clicks_on__create_your_free_account__button");

        var targetBtn = document.querySelector(".sticky-get-started a#mob-get-started");
        if (targetBtn) {
          targetBtn.click();
        }
        hideModal();
      });
    }

    /* ==== VARIATION INITIALIZE ==== */
    function init() {
      addClass("body", variation_name);
      //Modal Fires Goal
      optimizelyGoal("pay13_-_modal_fires");
      showModal();

      if (!window.CRE_EVENT_13) {
        window.CRE_EVENT_13 = true;
        setupCloseEvents();
      }

      if (debug) console.log(variation_name + " initialized");
    }

    /* ==== Trigger timing (exit-intent only, desktop-only) is owned by the Optimizely
       Activation Code field (pay13-trigger-control.js), which calls activate() -> init(). ==== */
    waitForElement("body", init, 50, 15000);
  } catch (e) {
    if (debug) console.log(e, "error in Test " + variation_name);
  }
})();
