(function () {
  try {
    /* main variables */
    var debug = 1;
    var variation_name = "cre-t-21";

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

    function addElement() {
      var html = `<div class="cre-t-21-container">
  <div class="cre-t-21-wrapper">
    <div class="cre-t-21-main">
      <div class="cre-t-21-left-side">
        <div class="cre-t-21-header">
          <div class="cre-t-header-content">Pay any business expense with your credit card. <span class="cre-t-21-earn-points">Earn points</span>.</div>
        </div>
        <div class="cre-t-21-subHeader">
          <div class="cre-t-subHeader-content">
            <span>Pay the ATO, payroll, rent and other business expenses with your existing credit card and earn reward points—even if they don’t accept cards.</span>
            <span class="cre-t-21-trusted-points"> $3B+ processed. Trusted by 50,000+ businesses. </span>
          </div>
        </div>
        <div class="cre-t-21-button">
          <div class="cre-t-button-main">
            <a href="https://id.pay.com.au/register" class="cre-t-21-create-button">Create your free account</a>
            <a class="cre-t-21-contact-button">
              <span>Contact sales</span>
            </a>
          </div>
          <div class="cre-t-21-button-text-bottom">Set up a payment <span class="cre-t-21-free">for free</span> to see your fees, points and rewards.</div>
        </div>
      </div>
     <div class="cre-t-21-right-side">
          <div class="cre-t-21-img-wrapper">
            <img
              src="https://v2.crocdn.com/PAY/Pay14/image.png"
              alt="Business expense payment illustration"
            />
          </div>
        </div>
    </div>
  </div>
</div>
`;
      if (!document.querySelector(".cre-t-21-container")) {
        document.querySelector("#content .main-header").insertAdjacentHTML("beforeend", html);
      }
    }
    /* Initialize variation */
    function init() {
      // Add the variation class to the body
      document.body.classList.add(variation_name);

      addElement();

      if (!window.cre_21_listener) {
        window.cre_21_listener = true;
        live(".cre-t-21-contact-button", "click", function () {
          console.log("check");

          document.querySelector('[data-target="#contact-sales-modal"]').click();
        });
      }
    }

    waitForElement("#content .main-header", init);
  } catch (e) {
    if (debug) console.log(e, "Error in Test " + variation_name);
  }
})();
