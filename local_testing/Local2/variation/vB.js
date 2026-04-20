(function () {
  try {
    /* main variables */
    var debug = 1;
    var variation_name = "cre-t-109";

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
     * Inserts HTML content or element after a target element
     * @param {string|HTMLElement} selector - CSS selector string or target element
     * @param {string|HTMLElement} html - HTML string to insert or DOM element
     */
    function insertAfter(selector, html) {
      var element = typeof selector === "string" ? document.querySelector(selector) : selector;
      if (!element) return;
      if (typeof html === "string") {
        element.insertAdjacentHTML("afterend", html);
      } else if (html && html.nodeType === 1) {
        element.insertAdjacentElement("afterend", html);
      }
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
    function getQueryVariable(name) {
      var query = window.location.search.substring(1);
      var vars = query.split("&");

      for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");

        if (decodeURIComponent(pair[0]) === name) {
          return pair[1] ? decodeURIComponent(pair[1].replace(/\+/g, " ")) : "";
        }
      }

      return "";
    }

    function addElement() {
      var updateName = getQueryVariable("insurer") || "Colonial Penn";
      var html = `<div class="cre-t-109-container" style="display: none;">
        <div class="cre-t-109-wrapper">
          <div class="cre-t-109-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 19 19" fill="none">
              <path
                d="M8.75 14.25H10.25V8.5H8.75V14.25ZM10.073 6.55625C10.2295 6.40142 10.3077 6.20958 10.3077 5.98075C10.3077 5.75192 10.2303 5.56008 10.0755 5.40525C9.92067 5.25058 9.72883 5.17325 9.5 5.17325C9.27117 5.17325 9.07933 5.25058 8.9245 5.40525C8.76967 5.56008 8.69225 5.75192 8.69225 5.98075C8.69225 6.20958 8.7705 6.40142 8.927 6.55625C9.08333 6.71108 9.27433 6.7885 9.5 6.7885C9.72567 6.7885 9.91667 6.71108 10.073 6.55625ZM9.50175 19C8.18775 19 6.95267 18.7507 5.7965 18.252C4.64033 17.7533 3.63467 17.0766 2.7795 16.2218C1.92433 15.3669 1.24725 14.3617 0.74825 13.206C0.249417 12.0503 0 10.8156 0 9.50175C0 8.18775 0.249333 6.95267 0.748 5.7965C1.24667 4.64033 1.92342 3.63467 2.77825 2.7795C3.63308 1.92433 4.63833 1.24725 5.794 0.74825C6.94967 0.249417 8.18442 0 9.49825 0C10.8123 0 12.0473 0.249333 13.2035 0.748C14.3597 1.24667 15.3653 1.92342 16.2205 2.77825C17.0757 3.63308 17.7528 4.63833 18.2518 5.794C18.7506 6.94967 19 8.18442 19 9.49825C19 10.8123 18.7507 12.0473 18.252 13.2035C17.7533 14.3597 17.0766 15.3653 16.2218 16.2205C15.3669 17.0757 14.3617 17.7528 13.206 18.2518C12.0503 18.7506 10.8156 19 9.50175 19ZM9.5 17.5C11.7333 17.5 13.625 16.725 15.175 15.175C16.725 13.625 17.5 11.7333 17.5 9.5C17.5 7.26667 16.725 5.375 15.175 3.825C13.625 2.275 11.7333 1.5 9.5 1.5C7.26667 1.5 5.375 2.275 3.825 3.825C2.275 5.375 1.5 7.26667 1.5 9.5C1.5 11.7333 2.275 13.625 3.825 15.175C5.375 16.725 7.26667 17.5 9.5 17.5Z"
                fill="#5E1394"
              />
            </svg>
          </div>
          <div class="cre-t-109-content">
            <div class="cre-t-109-header">
              <div class="cre-t-109-hero-title">Looking at ${updateName}?</div>
            </div>
            <div class="cre-t-109-subheader">
              <div class="cre-t-109-subheader-title">We’ve reviewed 85 providers to find the best overall options—many with <span>no medical exam</span> and <span>faster approval.</span> Start with our top picks below.</div>
            </div>
          </div>
        </div>
      </div>`;

      if (!document.querySelector(".cre-t-109-container")) {
        insertBefore(".page-description ul", html);
      }
    }

    /* Variation Init */
    function init() {
      /* start your code here */
      if (document.body.classList.contains(variation_name)) return;

      document.body.classList.add(variation_name);
      addElement();
    }

    /* Init variation */
    waitForElement(".page-description ul", init);
  } catch (e) {
    if (debug) console.log(e, "error in Test " + variation_name);
  }
})();