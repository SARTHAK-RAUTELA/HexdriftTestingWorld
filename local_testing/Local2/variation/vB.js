(function () {
  try {
    /* main variables */
    var debug = 1;
    var variation_name = "cre-t-01";
    var variation_name2 = "cre-t-01-v2";

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

    /**
     * Inserts HTML content or element before a target element
     * @param {string|HTMLElement} selector - CSS selector string or target element
     * @param {string|HTMLElement} html - HTML string to insert or DOM element
     */
    function insertBefore(selector, html) {
      var element = typeof selector === "string" ? document.querySelector(selector) : selector;
      if (!element) return;
      if (typeof html === "string") {
        element.insertAdjacentHTML("beforebegin", html);
      } else if (html && html.nodeType === 1) {
        element.insertAdjacentElement("beforebegin", html);
      }
    }

    /**
     * Event delegation - Listen for events on dynamically added elements
     * @param {string} selector - CSS selector to match child elements
     * @param {string} event - Event type (e.g., "click", "change", "submit")
     * @param {Function} callback - Function to call when event fires
     * @param {HTMLElement} context - Parent element to attach listener (default: document)
     *
     * Usage Examples:
     * live(".btn-delete", "click", function(e) { console.log("Delete clicked"); });
     * live(".menu-item", "click", function(e) { alert(this.textContent); }, document.getElementById("menu"));
     */
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

    /* Variation functions */
    var payAnyoneHtml = `
      <div class="cre-t-01-pay-anyone-container">
        <div class="cre-t-01-pay-anyone-wrapper">
          <div class="cre-t-01-pay-anyone-header">
            <span>Pay anyone. <span>Earn points.</span></span>
          </div>
          <div class="cre-t-01-pay-anyone-body">
            <div class="cre-t-01-pay-anyone-left">
              <div class="cre-t-01-pay-anyone-list">
                <div class="cre-t-01-pay-anyone-item cre-t-01-pay-anyone-item1">
                  <div class="cre-t-01-pay-anyone-item-left">
                    <span>1</span>
                  </div>
                  <div class="cre-t-01-pay-anyone-item-right">
                    <div class="cre-t-01-pay-anyone-item-header">
                      <span>Pay any business expense</span>
                    </div>
                    <div class="cre-t-01-pay-anyone-item-description">
                      <span>Use Pay.com.au securely to pay the ATO, payroll or anyone that doesn’t accept cards, via bank transfer.</span>
                    </div>
                  </div>
                </div>
                <div class="cre-t-01-pay-anyone-item cre-t-01-pay-anyone-item2">
                  <div class="cre-t-01-pay-anyone-item-left">
                    <span>2</span>
                  </div>
                  <div class="cre-t-01-pay-anyone-item-right">
                    <div class="cre-t-01-pay-anyone-item-header">
                      <span>Fund with your card</span>
                    </div>
                    <div class="cre-t-01-pay-anyone-item-description">
                      <span>Use an existing credit card to fund the payment, with a simple per-transaction fee (tax deductible).</span>
                    </div>
                  </div>
                </div>
                <div class="cre-t-01-pay-anyone-item cre-t-01-pay-anyone-item3">
                  <div class="cre-t-01-pay-anyone-item-left">
                    <span>3</span>
                  </div>
                  <div class="cre-t-01-pay-anyone-item-right">
                    <div class="cre-t-01-pay-anyone-item-header">
                      <span>Earn points</span>
                    </div>
                    <div class="cre-t-01-pay-anyone-item-description">
                      <span>Earn your standard credit card rewards on payments that normally wouldn’t qualify.</span>
                    </div>
                  </div>
                </div>
              </div>
              <div class="cre-t-01-pay-anyone-cta-container">
                <div class="cre-t-01-pay-anyone-cta">
                  <div class="cre-t-01-pay-anyone-cta-text">Create your free account</div>
                  <div class="cre-t-01-pay-anyone-cta-icon">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h10M9 4l4 4-4 4"></path></svg>
                  </div>
                </div>
                <div class="cre-t-01-pay-anyone-cta-description">Free forever. No credit card required.</div>
              </div>
            </div>
            <div class="cre-t-01-pay-anyone-right">
              <div class="cre-t-01-pay-anyone-img"><img src="https://v2.crocdn.com/PAY/test1/PayAnyoneImage.png" alt="Pay anyone. Earn points." /></div>
            </div>
          </div>
        </div>
      </div>
      <!-- --------------- -->
      <div class="cre-t-01-pay-rewards-container">
        <div class="cre-t-01-pay-rewards-wrapper">
          <div class="cre-t-01-pay-rewards-main">
            <div class="cre-t-01-pay-rewards-left">
              <div class="cre-t-01-pay-rewards-content1">
                <span>
                  Earn even more with <span>PayRewards<sup>TM</sup></span>
                </span>
              </div>
              <div class="cre-t-01-pay-rewards-content2">
                <span>Credit card points + PayRewards = more rewards</span>
              </div>
              <div class="cre-t-01-pay-rewards-content3">
                <span>Add PayRewards to boost your points on each payment. Earn additional rewards on top of your credit card points, with the flexibility to opt in per transaction.</span>
              </div>
              <div class="cre-t-01-pay-rewards-content4">
                <a href="/payrewards/" class="cre-t-01-pay-rewards-cta">
                  <span>See how PayRewards works</span>
                </a>
              </div>
            </div>
            <div class="cre-t-01-pay-rewards-right">
              <div class="cre-t-01-pay-rewards-img">
                <img src="https://v2.crocdn.com/PAY/test1/payRewardsImage.png" alt="" />
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    var heroSection = `
      <div class="cre-t-01-hero-container">
        <div class="cre-t-01-hero-wrapper">
          <section class="cre-t-01-hero-main">
            <div class="cre-t-01-content">
              <h1 class="cre-t-01-heading">Earn points on <span class="cre-t-01-highlight">every</span> business payment</h1>
              <p class="cre-t-01-subtext"><strong>Stop leaving money on the table.</strong> Earn credit card points on ATO, payroll, rent and other payments that usually earn little or no rewards.</p>

              <ul class="cre-t-01-benefits">
                <li class="cre-t-01-benefits-item1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M8.6 11.8L6.45 9.65C6.26667 9.46667 6.03333 9.375 5.75 9.375C5.46667 9.375 5.23334 9.46667 5.05 9.65C4.86667 9.83333 4.775 10.0667 4.775 10.35C4.775 10.6333 4.86667 10.8667 5.05 11.05L7.9 13.9C8.1 14.1 8.33333 14.2 8.6 14.2C8.86667 14.2 9.1 14.1 9.3 13.9L14.95 8.25C15.1333 8.06667 15.225 7.83333 15.225 7.55C15.225 7.26667 15.1333 7.03333 14.95 6.85C14.7667 6.66667 14.5333 6.575 14.25 6.575C13.9667 6.575 13.7333 6.66667 13.55 6.85L8.6 11.8ZM10 20C8.61667 20 7.31667 19.7373 6.1 19.212C4.88334 18.6867 3.825 17.9743 2.925 17.075C2.025 16.1757 1.31267 15.1173 0.788001 13.9C0.263335 12.6827 0.000667933 11.3827 1.26582e-06 10C-0.000665401 8.61733 0.262001 7.31733 0.788001 6.1C1.314 4.88267 2.02633 3.82433 2.925 2.925C3.82367 2.02567 4.882 1.31333 6.1 0.788C7.318 0.262667 8.618 0 10 0C11.382 0 12.682 0.262667 13.9 0.788C15.118 1.31333 16.1763 2.02567 17.075 2.925C17.9737 3.82433 18.6863 4.88267 19.213 6.1C19.7397 7.31733 20.002 8.61733 20 10C19.998 11.3827 19.7353 12.6827 19.212 13.9C18.6887 15.1173 17.9763 16.1757 17.075 17.075C16.1737 17.9743 15.1153 18.687 13.9 19.213C12.6847 19.739 11.3847 20.0013 10 20ZM10 18C12.2333 18 14.125 17.225 15.675 15.675C17.225 14.125 18 12.2333 18 10C18 7.76667 17.225 5.875 15.675 4.325C14.125 2.775 12.2333 2 10 2C7.76667 2 5.875 2.775 4.325 4.325C2.775 5.875 2 7.76667 2 10C2 12.2333 2.775 14.125 4.325 15.675C5.875 17.225 7.76667 18 10 18Z" fill="#3066C9" />
                  </svg>
                  Use your credit card - even where cards aren’t accepted
                </li>
                <li class="cre-t-01-benefits-item2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M8.6 11.8L6.45 9.65C6.26667 9.46667 6.03333 9.375 5.75 9.375C5.46667 9.375 5.23334 9.46667 5.05 9.65C4.86667 9.83333 4.775 10.0667 4.775 10.35C4.775 10.6333 4.86667 10.8667 5.05 11.05L7.9 13.9C8.1 14.1 8.33333 14.2 8.6 14.2C8.86667 14.2 9.1 14.1 9.3 13.9L14.95 8.25C15.1333 8.06667 15.225 7.83333 15.225 7.55C15.225 7.26667 15.1333 7.03333 14.95 6.85C14.7667 6.66667 14.5333 6.575 14.25 6.575C13.9667 6.575 13.7333 6.66667 13.55 6.85L8.6 11.8ZM10 20C8.61667 20 7.31667 19.7373 6.1 19.212C4.88334 18.6867 3.825 17.9743 2.925 17.075C2.025 16.1757 1.31267 15.1173 0.788001 13.9C0.263335 12.6827 0.000667933 11.3827 1.26582e-06 10C-0.000665401 8.61733 0.262001 7.31733 0.788001 6.1C1.314 4.88267 2.02633 3.82433 2.925 2.925C3.82367 2.02567 4.882 1.31333 6.1 0.788C7.318 0.262667 8.618 0 10 0C11.382 0 12.682 0.262667 13.9 0.788C15.118 1.31333 16.1763 2.02567 17.075 2.925C17.9737 3.82433 18.6863 4.88267 19.213 6.1C19.7397 7.31733 20.002 8.61733 20 10C19.998 11.3827 19.7353 12.6827 19.212 13.9C18.6887 15.1173 17.9763 16.1757 17.075 17.075C16.1737 17.9743 15.1153 18.687 13.9 19.213C12.6847 19.739 11.3847 20.0013 10 20ZM10 18C12.2333 18 14.125 17.225 15.675 15.675C17.225 14.125 18 12.2333 18 10C18 7.76667 17.225 5.875 15.675 4.325C14.125 2.775 12.2333 2 10 2C7.76667 2 5.875 2.775 4.325 4.325C2.775 5.875 2 7.76667 2 10C2 12.2333 2.775 14.125 4.325 15.675C5.875 17.225 7.76667 18 10 18Z" fill="#3066C9" />
                  </svg>
                  Works with ATO, payroll, rent and all suppliers
                </li>
                <li class="cre-t-01-benefits-item3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M8.6 11.8L6.45 9.65C6.26667 9.46667 6.03333 9.375 5.75 9.375C5.46667 9.375 5.23334 9.46667 5.05 9.65C4.86667 9.83333 4.775 10.0667 4.775 10.35C4.775 10.6333 4.86667 10.8667 5.05 11.05L7.9 13.9C8.1 14.1 8.33333 14.2 8.6 14.2C8.86667 14.2 9.1 14.1 9.3 13.9L14.95 8.25C15.1333 8.06667 15.225 7.83333 15.225 7.55C15.225 7.26667 15.1333 7.03333 14.95 6.85C14.7667 6.66667 14.5333 6.575 14.25 6.575C13.9667 6.575 13.7333 6.66667 13.55 6.85L8.6 11.8ZM10 20C8.61667 20 7.31667 19.7373 6.1 19.212C4.88334 18.6867 3.825 17.9743 2.925 17.075C2.025 16.1757 1.31267 15.1173 0.788001 13.9C0.263335 12.6827 0.000667933 11.3827 1.26582e-06 10C-0.000665401 8.61733 0.262001 7.31733 0.788001 6.1C1.314 4.88267 2.02633 3.82433 2.925 2.925C3.82367 2.02567 4.882 1.31333 6.1 0.788C7.318 0.262667 8.618 0 10 0C11.382 0 12.682 0.262667 13.9 0.788C15.118 1.31333 16.1763 2.02567 17.075 2.925C17.9737 3.82433 18.6863 4.88267 19.213 6.1C19.7397 7.31733 20.002 8.61733 20 10C19.998 11.3827 19.7353 12.6827 19.212 13.9C18.6887 15.1173 17.9763 16.1757 17.075 17.075C16.1737 17.9743 15.1153 18.687 13.9 19.213C12.6847 19.739 11.3847 20.0013 10 20ZM10 18C12.2333 18 14.125 17.225 15.675 15.675C17.225 14.125 18 12.2333 18 10C18 7.76667 17.225 5.875 15.675 4.325C14.125 2.775 12.2333 2 10 2C7.76667 2 5.875 2.775 4.325 4.325C2.775 5.875 2 7.76667 2 10C2 12.2333 2.775 14.125 4.325 15.675C5.875 17.225 7.76667 18 10 18Z" fill="#3066C9" />
                  </svg>
                  Simple per-transaction fee (tax deductible)
                </li>
              </ul>

              <div class="cre-t-01-cta-group">
                <div class="cre-t-01-btn cre-t-01-btn-primary">
                  <div class="cre-t-01-btn-text">Create your free account</div>
                  <div class="cre-t-01-btn-icon">
                    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h10M9 4l4 4-4 4"></path></svg>
                  </div>
                </div>
                <div class="cre-t-01-btn cre-t-01-btn-secondary">Contact sales</div>
              </div>
            </div>

            <div class="cre-t-01-visuals">
              <img src="https://v2.crocdn.com/PAY/test1/heroImage1.png" alt="Earn points on business payments" class="cre-t-01-hero-image" />
            </div>
          </section>
        </div>
      </div>
      ${payAnyoneHtml}
    `;

    function htmlInsertion() {
      // heroSection
      waitForElement("html body .pca.main-header.pr-hero-v2", function () {
        if (!document.querySelector(".cre-t-01-hero-container")) {
          insertBefore("html body .pca.main-header.pr-hero-v2", heroSection);
        }
      });
    }

    function eventHandler() {
      // Create your free account
      live(".cre-t-01-pay-anyone-cta, .cre-t-01-btn-primary", "click", function () {
        var prCalcCta = document.querySelector(".pr-calc-cta");
        if (prCalcCta) {
          prCalcCta.click();
        }
      });

      // Contact sales
      live(".cre-t-01-btn-secondary", "click", function () {
        var prCalcContact = document.querySelector(".pr-calc-contact");
        if (prCalcContact) {
          prCalcContact.click();
        }
      });
    }

    /* Variation Init */
    function init() {
      /* start your code here */
      if (document.body.classList.contains(variation_name)) return;
      document.body.classList.add(variation_name);
      document.body.classList.add(variation_name2);

      htmlInsertion();

      if (!window.cre01EventHandler) {
        eventHandler();
        window.cre01EventHandler = true;
      }
    }

    /* Initialise variation */
    waitForElement("body", init);
  } catch (e) {
    if (debug) console.log(e, "error in Test " + variation_name);
  }
})();
