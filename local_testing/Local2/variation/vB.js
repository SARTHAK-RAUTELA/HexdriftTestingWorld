(function () {
  try {
    /* ==== Modal CONFIGURATION ==== */
    var variation_name = "cre-t-13-variation";
    var debug = 0;

    var imageConfig = {
      crossIcon: "https://v2.crocdn.com/PAY/test8/cross.svg",
      icon1: "https://v2.crocdn.com/PAY/test8/laptop.svg",
      icon2: "https://v2.crocdn.com/PAY/test13/iconTicket.svg",
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
         See <span class="cre-t-13-highlight">your</span> fees, points and rewards
        </div>
        <div class="cre-t-13-sub-title"">
        Create a free account to see how your numbers stack up based on how you’d use pay.com.au. Then decide if it’s right for you.
        </div>

        <div class="cre-t-13-features-container">
    <div class="cre-t-13-feature-card card1">
        <div class="cre-t-13-icon-box">
            <div class="cre-t-13-icon-wrapper"><img src="${imageConfig.icon1}" alt="icon"></div>
        </div>
        <div class="cre-t-13-card-info">
            <div class="cre-t-13-card-title">Create a Free Account</div>
            <div class="cre-t-13-card-subtitle">Get started in minutes. No credit card required.</div>
        </div>
    </div>
    <div class="cre-t-13-feature-card card2">
        <div class="cre-t-13-icon-box">
            <div class="cre-t-13-icon-wrapper"><img src="${imageConfig.icon2}" alt="icon"></div>
        </div>
        <div class="cre-t-13-card-info">
            <div class="cre-t-13-card-title">See Your Numbers</div>
            <div class="cre-t-13-card-subtitle">See what you’d pay and earn based on your spend, card and rewards options.
            </div>
        </div>
    </div>
    <div class="cre-t-13-feature-card card3">
        <div class="cre-t-13-icon-box">
            <div class="cre-t-13-icon-wrapper"><img src="${imageConfig.icon3}" alt="icon"></div>
        </div>
        <div class="cre-t-13-card-info">
            <div class="cre-t-13-card-title">Then Decide</div>
            <div class="cre-t-13-card-subtitle">If the numbers make sense, make your first payment and start earning.</div>
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

    /* ==== Trigger timing (40s-or-exit-intent, desktop-only) is owned by the Optimizely
       Activation Code field (pay13-trigger-variation.js), which calls activate() -> init(). ==== */
    waitForElement("body", init, 50, 15000);
  } catch (e) {
    if (debug) console.log(e, "error in Test " + variation_name);
  }
})();
