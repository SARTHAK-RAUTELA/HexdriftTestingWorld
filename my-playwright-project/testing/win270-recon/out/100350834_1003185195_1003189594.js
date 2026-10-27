function(convertContext){ 
(function () {
  try {
    /* main variables */
    var debug = 0;
    var variation_name = "cre-t-288";

    /* control anchor — the "Or buy now, pay later..." paragraph under the payment icons */
    var payLaterSelector = "#orderForm";

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

    function append(selector, html) {
      var element = typeof selector === "string" ? document.querySelector(selector) : selector;
      if (!element) return;

      if (typeof html === "string") {
        element.insertAdjacentHTML("beforeend", html);
      } else if (html && html.nodeType === 1) {
        element.appendChild(html);
      }
    }

    function insertBeforeEnd(selector, html) {
      var element = typeof selector === "string" ? document.querySelector(selector) : selector;
      if (!element) return;

      if (typeof html === "string") {
        element.insertAdjacentHTML("beforeend", html);
      } else if (html && html.nodeType === 1) {
        element.insertAdjacentElement("beforeend", html);
      }
    }

    /* Variation functions */

    var hsaEligibilityMarkup = `
      <div class="cre-t-288-container">
        <div class="cre-t-288-hsa-text">
          <span class="cre-t-288-hsa-label">HSA/FSA eligible </span>
          <span class="cre-t-288-hsa-with">with</span>
          <span class="cre-t-288-hsa-logo-wrapper">
            <img class="cre-t-288-hsa-logo" src="https://v2.crocdn.com/Winkbed/WIN272/Truemed%20Logo%202.svg" alt="Truemed" />
          </span>
          <span class="cre-t-288-hsa-learn-more" role="button" tabindex="0">
            <span class="cre-t-288-hsa-learn-more-text">Learn more</span>
          </span>
        </div>
      </div>
    `;

    /* placeholder image URLs — swap for the real assets */
    var closeIconUrl = "https://v2.crocdn.com/Winkbed/win288/Close.svg";
    var truemedIconUrl = "https://v2.crocdn.com/Winkbed/win288/TruemedLogo.svg";
    var modalImageUrl = "https://v2.crocdn.com/Winkbed/win288/ModalImage1.png";
    // var modalImageUrl = "https://v2.crocdn.com/Winkbed/win288/ModalImage2.png";
    // var modalImageUrl = "https://v2.crocdn.com/Winkbed/win288/ModalImage3.png";

    var hsaModalMarkup = `
      <div class="cre-t-288-modal-overlay"></div>
      <div class="cre-t-288-modal-container" role="dialog" aria-label="Save up to 30% with HSA/FSA">
        <div class="cre-t-288-modal-wrapper">
          <div class="cre-t-288-modal-close" role="button" tabindex="0" aria-label="Close">
            <img class="cre-t-288-modal-close-img" src="${closeIconUrl}" alt="Close" />
          </div>
          <div class="cre-t-288-modal-main">
            <div class="cre-t-288-modal-main-wrap">
              <div class="cre-t-288-modal-header">
                <h2 class="cre-t-288-modal-title">Save up to 30% with HSA/FSA</h2>
                <p class="cre-t-288-modal-subtitle">
                  <span class="cre-t-288-modal-subtitle-text">Pay for your WinkBed with pre-tax dollars through</span>
                  <span class="cre-t-288-modal-truemed-logo"><img class="cre-t-288-modal-truemed" src="${truemedIconUrl}" alt="Truemed" /></span>
                </p>
              </div>
              <div class="cre-t-288-modal-image">
                <img src="${modalImageUrl}" alt="Woman sleeping comfortably on a WinkBed" />
              </div>
              <div class="cre-t-288-modal-step-wrap">
                <div class="cre-t-288-modal-steps">
                  <div class="cre-t-288-modal-step">
                    <div class="cre-t-288-modal-step-number">1.</div>
                    <div class="cre-t-288-modal-step-text"><span class="cre-t-288-modal-step-strong">Select “Truemed - Pay with HSA/FSA” at checkout.</span></div>
                  </div>
                  <div class="cre-t-288-modal-step">
                    <div class="cre-t-288-modal-step-number">2.</div>
                    <div class="cre-t-288-modal-step-text"><span class="cre-t-288-modal-step-strong">Complete a quick eligibility check.</span><br>Find out instantly if you qualify.</div>
                  </div>
                  <div class="cre-t-288-modal-step">
                    <div class="cre-t-288-modal-step-number">3.</div>
                    <div class="cre-t-288-modal-step-text"><span class="cre-t-288-modal-step-strong">If approved, pay with your HSA/FSA funds.</span></div>
                  </div>
                </div>
                <p class="cre-t-288-modal-note">Financing options and extended warranties are not HSA/FSA eligible.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    function addHsaEligibilityLine() {
      if (document.querySelector(".cre-t-288-container")) return;
      insertBeforeEnd(payLaterSelector, hsaEligibilityMarkup);
    }

    function modalInsertion() {
      if (document.querySelector(".cre-t-288-modal-overlay")) return;
      append("body", hsaModalMarkup);
    }

    function closeModal() {
      document.body.classList.remove("cre-t-288-modal-open");
    }

    function eventHandler() {
      /* open modal from the learn more link */
      live(".cre-t-288-hsa-learn-more", "click", function () {
        document.body.classList.add("cre-t-288-modal-open");
      });

      /* close via close icon */
      live(".cre-t-288-modal-close", "click", closeModal);

      /* close via overlay click */
      live(".cre-t-288-modal-overlay", "click", closeModal);
    }

    /* Variation Init */
    function init() {
      if (document.body.classList.contains(variation_name)) return;
      document.body.classList.add(variation_name);

      addHsaEligibilityLine();
      modalInsertion();

      if (!window.cre288EventsBound) {
        window.cre288EventsBound = true;
        eventHandler();
      }
    }

    /* Initialise variation */
    waitForElement(payLaterSelector, init, 50, 15000);
  } catch (e) {
    if (debug) console.log(e, "error in Test " + variation_name);
  }
})();
}