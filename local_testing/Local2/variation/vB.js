(function () {
  try {
    /* main variables */
    var debug = 1;
    var variation_name = "cre-t-9";

    function getCookie(name) {
      var cookies = document.cookie.split("; ");
      for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i].split("=");
        if (cookie[0] === name) {
          return decodeURIComponent(cookie[1]);
        }
      }
      return null; // Return null if the cookie is not found
    }

    function isExitPopupTriggered() {
      var cookie = getCookie("exit_popup_dismissed");
      return cookie === "true";
    }

    // Function to set a cookie with a 7-day expiration when modal is triggered
    function setInStorage() {
      document.cookie = "exit_popup_dismissed=true; path=/";
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

    function preloadImage(imageUrl) {
      const hiddenImage = new Image();
      hiddenImage.src = imageUrl;
    }
    /* Variation functions */
    var modalSectionHtml = `
      <cre09 class="cre-t-9-modal-overlay" style="display: none;"></cre09>
      <cre09 class="cre-t-9-modal-container" style="display: none;">
        <div class="cre-t-9-modal-wrapper">
          <div class="cre-t-9-modal-cross">
            <img src="https://v2.crocdn.com/AFP/test8/cross.svg" alt="close icon" />
          </div>
          <div class="cre-t-9-modal-body">
            <div class="cre-t-9-modal-body-wrapper1">
              <div class="cre-t-9-modal-content cre-t-9-modal-content1">
                <div class="cre-t-9-content-1-img">
                  <img src="https://v2.crocdn.com/AFP/test8/AFPLogo.png" alt="AFP 2026 Finance and Treasury Conference Logo" />
                </div>
              </div>
              <div class="cre-t-9-modal-content cre-t-9-modal-content2">
                <span>Why people attend AFP 2026</span>
              </div>
              <div class="cre-t-9-modal-content cre-t-9-modal-content3">
                <span>7,000+ attendees · 20+ networking events · 200+ providers</span>
              </div>
              <div class="cre-t-9-modal-content cre-t-9-modal-content4">
                <div class="cre-t-9-content-4-img">
                  <img src="https://v2.crocdn.com/AFP/test8/Conference.png" alt="AFP 2026 Finance and Treasury Conference" />
                </div>
              </div>
              <div class="cre-t-9-modal-content cre-t-9-modal-content5">
                <div class="cre-t-9-modal-cards">
                  <div class="cre-t-9-modal-card cre-t-9-modal-card1">
                    <div class="cre-t-9-modal-card-img">
                      <img src="https://v2.crocdn.com/AFP/test8/message.svg" alt="Message icon" />
                    </div>
                    <div class="cre-t-9-modal-card-header">See what’s actually working</div>
                    <div class="cre-t-9-modal-card-description">Hear how teams are handling forecasting, liquidity, risk and AI.</div>
                  </div>
                  <div class="cre-t-9-modal-card cre-t-9-modal-card2">
                    <div class="cre-t-9-modal-card-img">
                      <img src="https://v2.crocdn.com/AFP/test8/Compare.svg" alt="Compare icon" />
                    </div>
                    <div class="cre-t-9-modal-card-header">Compare approaches with peers</div>
                    <div class="cre-t-9-modal-card-description">Compare systems, tools and providers side by side in one place.</div>
                  </div>
                  <div class="cre-t-9-modal-card cre-t-9-modal-card3">
                    <div class="cre-t-9-modal-card-img">
                      <img src="https://v2.crocdn.com/AFP/test8/checkmark.svg" alt="Checkmark icon" />
                    </div>
                    <div class="cre-t-9-modal-card-header">Bring back better decisions</div>
                    <div class="cre-t-9-modal-card-description">One useful idea or connection can easily cover the cost of attending.</div>
                  </div>
                </div>
              </div>
              <div class="cre-t-9-modal-content cre-t-9-modal-content6">
                <div class="cre-t-9-modal-button1">
                  <a href="https://conference.financialprofessionals.org/registration" target="_blank" rel="noopener noreferrer" class="cre-t-9-modal-cta-link1">Register Now</a>
                  <div class="cre-t-9-modal-disclaimer">
                    <div class="cre-t-9-modal-disclaimer-icon">
                      <img src="https://v2.crocdn.com/AFP/test8/fire.svg" alt="info icon" />
                    </div>
                    <div class="cre-t-9-modal-disclaimer-text">Save $675 before June 26</div>
                  </div>
                </div>
                <div class="cre-t-9-modal-button2">
                  <a href="https://conference.financialprofessionals.org/" target="_blank" rel="noopener noreferrer" class="cre-t-9-modal-cta-link2">View Program & Pricing</a>
                </div>
              </div>
            </div>
            <div class="cre-t-9-modal-body-wrapper2">
              <div class="cre-t-9-modal-review">
                <div class="cre-t-9-modal-review-img">
                  <img src="https://v2.crocdn.com/AFP/test8/Cassie.png" alt="Image of a woman named Cassie Wang" />
                </div>
                <div class="cre-t-9-modal-review-text">
                  <div class="cre-t-9-modal-review-text1">“It’s easy to get stuck in your own bubble. I attend AFP Conference to get outside perspectives and connect with top talent.”</div>
                  <div class="cre-t-9-modal-review-text2">— Cassie Wang, Head of Finance, Lightship Security, Inc.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </cre09>
    `;

    function insertModal() {
      setTimeout(function () {
        if (!document.querySelector(".cre-t-9-modal-overlay")) {
          insertBeforeEnd("html body", modalSectionHtml);
        }
      }, 2000);
    }

    function eventHandler() {
      live(".cre-t-9-modal-cross", "click", function () {
        removeClass("body", "cre-t-9-show-modal");
      });

      live(".cre-t-9-modal-overlay", "click", function () {
        removeClass("body", "cre-t-9-show-modal");
      });
    }

    // ___________________________________________________________________
    // ___________________________________________________________________

    function getStartTime() {
      // Retrieve the start time from sessionStorage
      let startTime = sessionStorage.getItem("startTime");

      // If there's no start time, set it to the current time (current timestamp)
      if (!startTime) {
        startTime = Date.now();
        sessionStorage.setItem("startTime", startTime);
      } else {
        startTime = parseInt(startTime, 10);
      }

      return startTime;
    }

    function startModalTimer() {
      if (isExitPopupTriggered()) return;
      // Get the start time using the new function. then Calculate the time elapsed since the start time and Calculate the remaining time for the 15-second timer
      const startTime = getStartTime();
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, 30000 - elapsedTime);

      // If the modal hasn't been triggered yet and the time is up, trigger the modal and If the modal hasn't been triggered yet, set a timeout for when to trigger the modal
      if (remainingTime === 0) {
        showModal();
      }
      if (remainingTime > 0) {
        setTimeout(() => {
          showModal();
        }, remainingTime);
      }
    }
    // ___________________________________________________________________
    // ___________________________________________________________________
    var debouncedMouseLeaveHandler;

    function debounce(func, timeout = 100) {
      let timer;
      return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          func.apply(this, args);
        }, timeout);
      };
    }
    function handleMouseLeave(event) {
      if (event.clientY <= 50) {
        showModal();
      }
    }

    function handleExitIntent() {
      if (isExitPopupTriggered()) return;

      var debouncedMouseLeaveHandler = debounce(handleMouseLeave, 200);
      document.addEventListener("mousemove", debouncedMouseLeaveHandler);
    }

    // ___________________________________________________________________
    // ___________________________________________________________________

    function showModal() {
      if (isExitPopupTriggered()) return;
      addClass("body", "cre-t-9-show-modal");
      setInStorage();

      // Add the following snippet to trigger this event
      window.VWO = window.VWO || [];
      VWO.event =
        VWO.event ||
        function () {
          VWO.push(["event"].concat([].slice.call(arguments)));
        };

      VWO.event("afp09ModalFires");
    }

    // ___________________________________________________________________
    // ___________________________________________________________________

    /* Variation Init */
    function init() {
      /* start your code here */
      if (document.body.classList.contains(variation_name)) return;
      addClass("body", variation_name);

      preloadImage("https://v2.crocdn.com/AFP/test8/cross.svg");
      preloadImage("https://v2.crocdn.com/AFP/test8/AFPLogo.png");
      preloadImage("https://v2.crocdn.com/AFP/test8/Conference.png");
      preloadImage("https://v2.crocdn.com/AFP/test8/message.svg");
      preloadImage("https://v2.crocdn.com/AFP/test8/Compare.svg");
      preloadImage("https://v2.crocdn.com/AFP/test8/checkmark.svg");
      preloadImage("https://v2.crocdn.com/AFP/test8/fire.svg");
      preloadImage("https://v2.crocdn.com/AFP/test8/Cassie.png");

      insertModal();
      startModalTimer();

      if (!window.cre09eventHandler) {
        window.cre09eventHandler = true;
        eventHandler();
        handleExitIntent();
      }
    }

    /* Initialise variation */
    waitForElement(
      "#site-main",
      function () {
        if (isExitPopupTriggered()) return;
        init();
      },
      50,
      15000,
    );
  } catch (e) {
    if (debug) console.log(e, "error in Test " + variation_name);
  }
})();
