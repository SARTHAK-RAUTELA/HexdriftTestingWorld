(function () {
  try {
    /* main variables */
    var debug = 1;
    var variation_name = "cre-t-161";

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

    /* Variation Init */
    function addModal() {
      var modalHtml = `<div class="cre-t-161-modal-main" style="display: none">
      <div id="cre-t-161-modal-overlay" class="cre-t-161-overlay"></div>
      <div class="cre-t-161-modal-content">
        <div class="cre-t-161-modal-cross-icon-wrapper">
          <img src="https://v2.crocdn.com/FirstTable/close.svg" alt="close">
        </div>

        <!-- Everything that should scroll lives inside this wrapper -->
        <div class="cre-t-161-modal-scrollable">
          <div class="cre-t-161-main-title">
            <h2 class="cre-t-161-text">Why is there a service fee?</h2>
          </div>
          <div class="cre-t-161-main-subtitle">
            <p class="cre-t-161-subtitle-text">Your service fee is a small but important part of how we continue to bring you incredible dining deals while supporting local restaurants.</p>
          </div>
          <div class="cre-t-161-modal-benefits-checklist">
            <span class="cre-t-161-modal-benefits-checklist-title">Here's why it's important:</span>
            <div class="cre-t-161-modal-benefits-checklist-item">
              <div class="cre-t-161-modal-benefits-checklist-item-icon">
                <img src="https://v2.crocdn.com/FirstTable/icon.svg" alt="i-icon">
              </div>
              <div class="cre-t-161-modal-benefits-checklist-item-text">
                <strong>It reduces no-shows</strong>
                <p class="cre-t-161-modal-benefits-checklist-item-p">Making it easier for restaurants to plan ahead and offer you the best deals.</p>
              </div>
            </div>
            <div class="cre-t-161-modal-benefits-checklist-item">
              <div class="cre-t-161-modal-benefits-checklist-item-icon">
                <img src="https://v2.crocdn.com/FirstTable/icon.svg" alt="i-icon">
              </div>
              <div class="cre-t-161-modal-benefits-checklist-item-text">
                <strong>It secures your table</strong>
                <p class="cre-t-161-modal-benefits-checklist-item-p">Your booking is guaranteed, along with your 50% discount.</p>
              </div>
            </div>
            <div class="cre-t-161-modal-benefits-checklist-item">
              <div class="cre-t-161-modal-benefits-checklist-item-icon">
                <img src="https://v2.crocdn.com/FirstTable/icon.svg" alt="i-icon">
              </div>
              <div class="cre-t-161-modal-benefits-checklist-item-text">
                <strong>It keeps us going</strong>
                <p class="cre-t-161-modal-benefits-checklist-item-p">The fee helps cover our costs so we can continue running our platform and bringing on new restaurants.</p>
              </div>
            </div>
            <div class="cre-t-161-modal-benefits-checklist-item">
              <div class="cre-t-161-modal-benefits-checklist-item-icon">
                <img src="https://v2.crocdn.com/FirstTable/icon.svg" alt="i-icon">
              </div>
              <div class="cre-t-161-modal-benefits-checklist-item-text">
                <strong>It helps us attract restaurants</strong>
                <p class="cre-t-161-modal-benefits-checklist-item-p">Restaurants join First Table for free, so the fee helps us bring more dining options to your area.</p>
              </div>
            </div>
          </div>
        </div>
        <!-- End scrollable wrapper -->

        <!-- CTA lives OUTSIDE the scrollable wrapper so it sticks at the bottom -->
        <div class="cre-t-161-modal-cta">
          <div class="cre-t-161-modal-cta-text">Got it</div>
        </div>
      </div>
    </div>`;

      if (!document.querySelector(".cre-t-161-modal-main")) {
        document.body.insertAdjacentHTML("beforeend", modalHtml);
      }

      // Attach close listeners immediately after modal is in the DOM
      function closeModal() {
        document.querySelector(".cre-t-161-modal-main").classList.remove("active");
        document.querySelector("body").classList.remove("cre-t-161-modal-open");
      }

      document.querySelectorAll(".cre-t-161-modal-cross-icon-wrapper, .cre-t-161-modal-cta").forEach(function (element) {
        element.addEventListener("click", closeModal);
      });

      // Also close on overlay click
      document.querySelector("#cre-t-161-modal-overlay").addEventListener("click", closeModal);
    }

    function init() {
      addClass("body", variation_name);
      addModal();

      waitForElement(
        ".tag-2 .cre-t-160-text, .tag-2 .cre-t-160-control-text",
        function () {
          var triggerElements = document.querySelectorAll(".tag-2 .cre-t-160-text, .tag-2 .cre-t-160-control-text");
          triggerElements.forEach(function (el) {
            el.addEventListener("click", function () {
              document.querySelector(".cre-t-161-modal-main").classList.add("active");
              document.querySelector("body").classList.add("cre-t-161-modal-open");
            });
          });
        },
        50,
        5000
      );
    }

    waitForElement("body", init, 50, 5000);
  } catch (e) {
    if (debug) console.log(e, "error in Test " + variation_name);
  }
})();