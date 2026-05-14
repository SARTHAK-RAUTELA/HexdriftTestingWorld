(function () {
  try {
    /* main variables */
    var debug = 1;
    var variation_name = "cre-t-08";

    function isExitPopupTriggered() {
      return sessionStorage.getItem("modalTriggered") === "true";
    }

    /* all Pure helper functions */

    /**
     * Adds a CSS class to an element
     * @param {string|HTMLElement} selector - CSS selector string or DOM element
     * @param {string} className - The class name to add (without dot)
     *
     * Usage Examples:
     * addClass(".button", "active");
     * addClass(document.getElementById("btn"), "active");
     */
    function addClass(selector, className) {
      var element = typeof selector === "string" ? document.querySelector(selector) : selector;
      if (!element) return;
      if (element.classList) element.classList.add(className);
      else if (!element.className.match(new RegExp("\b" + className + "\b"))) {
        element.className += " " + className;
      }
    }

    /**
     * Removes a CSS class from an element
     * @param {string|HTMLElement} selector - CSS selector string or DOM element
     * @param {string} className - The class name to remove (without dot)
     *
     * Usage Examples:
     * removeClass(".button", "active");
     * removeClass(document.getElementById("btn"), "active");
     */
    function removeClass(selector, className) {
      var element = typeof selector === "string" ? document.querySelector(selector) : selector;
      if (!element) return;
      if (element.classList) element.classList.remove(className);
      else element.className = element.className.replace(new RegExp("\b" + className + "\b", "g"), "");
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
    /**
     * Inserts HTML content or element before a target element
     * @param {string|HTMLElement} selector - CSS selector string or target element
     * @param {string|HTMLElement} html - HTML string to insert or DOM element
     */
    function insertBeforeEnd(selector, html) {
      var element = typeof selector === "string" ? document.querySelector(selector) : selector;
      if (!element) return;
      if (typeof html === "string") {
        element.insertAdjacentHTML("beforeend", html);
      } else if (html && html.nodeType === 1) {
        element.insertAdjacentElement("beforeend", html);
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
    var modalSectionHtml = `
      <div class="cre-t-8-modal-overlay" style="display: none;"></div>
      <div class="cre-t-8-modal-container" style="display: none;">
        <div class="cre-t-8-modal-wrapper">
          <div class="cre-t-8-modal-cross">
            <img src="https://v2.crocdn.com/AFP/test8/cross.svg" alt="close icon" />
          </div>
          <div class="cre-t-8-modal-body">
            <div class="cre-t-8-modal-body-wrapper1">
              <div class="cre-t-8-modal-content cre-t-8-modal-content1">
                <div class="cre-t-8-content-1-img">
                  <img src="https://v2.crocdn.com/AFP/test8/AFPLogo.png" alt="AFP 2026 Finance and Treasury Conference Logo" />
                </div>
              </div>
              <div class="cre-t-8-modal-content cre-t-8-modal-content2">
                <span>Why people attend AFP 2026</span>
              </div>
              <div class="cre-t-8-modal-content cre-t-8-modal-content3">
                <span>7,000+ attendees · 20+ networking events · 200+ providers</span>
              </div>
              <div class="cre-t-8-modal-content cre-t-8-modal-content4">
                <div class="cre-t-8-content-4-img">
                  <img src="https://v2.crocdn.com/AFP/test8/Conference.png" alt="AFP 2026 Finance and Treasury Conference" />
                </div>
              </div>
              <div class="cre-t-8-modal-content cre-t-8-modal-content5">
                <div class="cre-t-8-modal-cards">
                  <div class="cre-t-8-modal-card cre-t-8-modal-card1">
                    <div class="cre-t-8-modal-card-img">
                      <img src="https://v2.crocdn.com/AFP/test8/message.svg" alt="Message icon" />
                    </div>
                    <div class="cre-t-8-modal-card-header">See what’s actually working</div>
                    <div class="cre-t-8-modal-card-description">Hear how teams are handling forecasting, liquidity, risk and AI.</div>
                  </div>
                  <div class="cre-t-8-modal-card cre-t-8-modal-card2">
                    <div class="cre-t-8-modal-card-img">
                      <img src="https://v2.crocdn.com/AFP/test8/Compare.svg" alt="Compare icon" />
                    </div>
                    <div class="cre-t-8-modal-card-header">Compare approaches with peers</div>
                    <div class="cre-t-8-modal-card-description">Compare systems, tools and providers side by side in one place.</div>
                  </div>
                  <div class="cre-t-8-modal-card cre-t-8-modal-card3">
                    <div class="cre-t-8-modal-card-img">
                      <img src="https://v2.crocdn.com/AFP/test8/checkmark.svg" alt="Checkmark icon" />
                    </div>
                    <div class="cre-t-8-modal-card-header">Bring back better decisions</div>
                    <div class="cre-t-8-modal-card-description">One useful idea or connection can easily cover the cost of attending.</div>
                  </div>
                </div>
              </div>
              <div class="cre-t-8-modal-content cre-t-8-modal-content6">
                <div class="cre-t-8-modal-button1">
                  <a href="/registration" class="cre-t-8-modal-cta-link1">Register Now</a>
                  <div class="cre-t-8-modal-disclaimer">
                    <div class="cre-t-8-modal-disclaimer-icon">
                      <img src="https://v2.crocdn.com/AFP/test8/fire.svg" alt="info icon" />
                    </div>
                    <div class="cre-t-8-modal-disclaimer-text">Save $675 before June 26</div>
                  </div>
                </div>
                <div class="cre-t-8-modal-button2">
                  <a href="/program/overview/schedule" class="cre-t-8-modal-cta-link2">View Program & Pricing</a>
                </div>
              </div>
            </div>
            <div class="cre-t-8-modal-body-wrapper2">
              <div class="cre-t-8-modal-review">
                <div class="cre-t-8-modal-review-img">
                  <img src="https://v2.crocdn.com/AFP/test8/Cassie.png" alt="Image of a woman named Cassie Wang" />
                </div>
                <div class="cre-t-8-modal-review-text">
                  <div class="cre-t-8-modal-review-text1">“It’s easy to get stuck in your own bubble. I attend AFP Conference to get outside perspectives and connect with top talent.”</div>
                  <div class="cre-t-8-modal-review-text2">— Cassie Wang, Head of Finance, Lightship Security, Inc.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    function insertModal() {
      if (!document.querySelector(".cre-t-8-modal-overlay")) {
        insertBeforeEnd("html body", modalSectionHtml);
      }
    }

    function eventHandler() {
      live(".cre-t-8-modal-cross", "click", function () {
        removeClass("body", "cre-t-8-show-modal");
        // setInStorage();
      });

      live(".cre-t-8-modal-overlay", "click", function () {
        removeClass("body", "cre-t-8-show-modal");
        // setInStorage();
      });
    }

    // ___________________________________________________________________
    // ___________________________________________________________________

    function getStartTime() {
      // Retrieve the start time from sessionStorage
      let startTime = sessionStorage.getItem("startTime");

      // If there's no start time, set it to the current time (current timestamp)
      if (!startTime) {
        startTime = Date.now(); // Get the current timestamp in milliseconds
        sessionStorage.setItem("startTime", startTime); // Store the timestamp
        console.log("Start time set: " + new Date(startTime).toLocaleTimeString());
      } else {
        startTime = parseInt(startTime, 10); // Ensure it's parsed as an integer (timestamp)
        console.log("Start time already exists: " + new Date(startTime).toLocaleTimeString());
      }

      return startTime;
    }

    function startModalTimer() {
      if (isExitPopupTriggered()) return;
      // Get the start time using the new function
      const startTime = getStartTime();

      // Calculate the time elapsed since the start time
      const elapsedTime = Date.now() - startTime;
      console.log("Elapsed time: " + Math.floor(elapsedTime / 1000) + " seconds");

      // Calculate the remaining time for the 15-second timer
      const remainingTime = Math.max(0, 15000 - elapsedTime);
      console.log("Remaining time: " + Math.floor(remainingTime / 1000) + " seconds");

      // If the modal hasn't been triggered yet and the time is up, trigger the modal
      if (remainingTime === 0) {
        showModal(); // Show the modal if 15 seconds are up
        console.log("Modal triggered after 15 seconds");
      }

      // If the modal hasn't been triggered yet, set a timeout for when to trigger the modal
      if (remainingTime > 0) {
        console.log("Setting timeout to trigger modal in " + Math.floor(remainingTime / 1000) + " seconds");
        setTimeout(() => {
          showModal();
          console.log("Modal triggered after timeout");
        }, remainingTime);
      }
    }

    function showModal() {
      addClass("body", "cre-t-8-show-modal");
      sessionStorage.setItem("modalTriggered", "true");
      console.log("Modal displayed (class added to body)");

      // for goal
      // Add the following snippet to trigger this event
      window.VWO = window.VWO || [];
      VWO.event =
        VWO.event ||
        function () {
          VWO.push(["event"].concat([].slice.call(arguments)));
        };

      VWO.event("afp08ModalFires");
    }

    // ___________________________________________________________________
    // ___________________________________________________________________

    /* Variation Init */
    function init() {
      if (debug) console.log(variation_name + " initialized");
      /* start your code here */
      if (document.body.classList.contains(variation_name)) return;
      addClass("body", variation_name);

      insertModal();
      startModalTimer();

      if (!window.cre08eventHandler) {
        window.cre08eventHandler = true;
        eventHandler();
      }
    }

    /* Initialise variation */
    waitForElement("body", init, 50, 15000);
  } catch (e) {
    if (debug) console.log(e, "error in Test " + variation_name);
  }
})();
