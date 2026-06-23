(function () {
  try {
    /* main variables */
    var debug = 1;
    var variation_name = "cre-t-123";
    var cookie_name = "cre-t-123-cookie";

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

    function setBmCookie() {
      document.cookie = cookie_name + "=cre-t-123-variation; path=/";
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

      var html = `<div class="cre-t-123-container" style="display: none;">

        <div class="cre-t-123-wrapper">
        <div class="cre-t-123-close-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
  <path d="M1.4 14L0 12.6L5.6 7L0 1.4L1.4 0L7 5.6L12.6 0L14 1.4L8.4 7L14 12.6L12.6 14L7 8.4L1.4 14Z" fill="#8C8EA0"/>
</svg></div>
          <div class="cre-t-123-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 19 19" fill="none">
  <path d="M8.75 14.25H10.25V8.5H8.75V14.25ZM10.073 6.55625C10.2295 6.40142 10.3077 6.20958 10.3077 5.98075C10.3077 5.75192 10.2303 5.56008 10.0755 5.40525C9.92067 5.25058 9.72883 5.17325 9.5 5.17325C9.27117 5.17325 9.07933 5.25058 8.9245 5.40525C8.76967 5.56008 8.69225 5.75192 8.69225 5.98075C8.69225 6.20958 8.7705 6.40142 8.927 6.55625C9.08333 6.71108 9.27433 6.7885 9.5 6.7885C9.72567 6.7885 9.91667 6.71108 10.073 6.55625ZM9.50175 19C8.18775 19 6.95267 18.7507 5.7965 18.252C4.64033 17.7533 3.63467 17.0766 2.7795 16.2218C1.92433 15.3669 1.24725 14.3617 0.74825 13.206C0.249417 12.0503 0 10.8156 0 9.50175C0 8.18775 0.249333 6.95267 0.748 5.7965C1.24667 4.64033 1.92342 3.63467 2.77825 2.7795C3.63308 1.92433 4.63833 1.24725 5.794 0.74825C6.94967 0.249417 8.18442 0 9.49825 0C10.8123 0 12.0473 0.249333 13.2035 0.748C14.3597 1.24667 15.3653 1.92342 16.2205 2.77825C17.0757 3.63308 17.7528 4.63833 18.2518 5.794C18.7506 6.94967 19 8.18442 19 9.49825C19 10.8123 18.7507 12.0473 18.252 13.2035C17.7533 14.3597 17.0766 15.3653 16.2218 16.2205C15.3669 17.0757 14.3617 17.7528 13.206 18.2518C12.0503 18.7506 10.8156 19 9.50175 19ZM9.5 17.5C11.7333 17.5 13.625 16.725 15.175 15.175C16.725 13.625 17.5 11.7333 17.5 9.5C17.5 7.26667 16.725 5.375 15.175 3.825C13.625 2.275 11.7333 1.5 9.5 1.5C7.26667 1.5 5.375 2.275 3.825 3.825C2.275 5.375 1.5 7.26667 1.5 9.5C1.5 11.7333 2.275 13.625 3.825 15.175C5.375 16.725 7.26667 17.5 9.5 17.5Z" fill="#0272E4"/>
</svg>
          </div>
          <div class="cre-t-123-content">
            <div class="cre-t-123-header">
              <div class="cre-t-123-hero-title">Looking at ${updateName}?</div>
            </div>
            <div class="cre-t-123-subheader">
              <div class="cre-t-123-subheader-title">We’ve reviewed 29 pet insurance providers to bring you the top 10—many with <span>instant online approval</span> and <span>fast claim payouts</span>. Start with our top picks below (${updateName} didn’t make the list).</div>
            </div>
          </div>
        </div>
      </div>`;

      if (!document.querySelector(".cre-t-123-container")) {
        document.querySelector(`#comparison-section .ct-section-inner-wrap [data-unique="comparison-table"]`).insertAdjacentHTML("afterbegin", html);
      }
    }

    /* Variation Init */
    function init() {
      // 1. Check if the dismiss cookie already exists. If yes, exit.
      if (getCookie(cookie_name) === "cre-t-123-variation") return;

      document.body.classList.add(variation_name);

      // Something our element remove so thats why use interval
      var addElementInterval = setInterval(function () {
        addElement();
      }, 250);
      setTimeout(function () {
        clearInterval(addElementInterval);
      }, 1000);

      if (!window.cre_t_123_event) {
        window.cre_t_123_event = true;

        // Handle Dismiss Click
        live(".cre-t-123-close-icon", "click", function () {
          setBmCookie();
          document.body.classList.remove(variation_name);

          var container = document.querySelector(".cre-t-123-container");
          if (container) {
            container.remove();
          }
        });
      }
    }

    /* Init variation */
    waitForElement(`#comparison-section .ct-section-inner-wrap [data-unique="comparison-table"]`, init);
  } catch (e) {
    if (debug) console.log(e, "error in Test " + variation_name);
  }
})();