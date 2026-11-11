(function () {
  try {
    /* main variables */
    var debug = 0;
    var variation_name = "cre-t-28";
    var headerSelector = "header.sticky.top-0";
    var hiddenClass = "cre-t-28-header-hidden";
    var topOffset = 20;
    var minScroll = 10;
    var lastY = 0;

    /* helper functions */
    function addClass(selector, className) {
      var element = typeof selector === "string" ? document.querySelector(selector) : selector;

      if (!element) return;

      if (element.classList) {
        element.classList.add(className);
      } else if (!element.className.match(new RegExp("\\b" + className + "\\b"))) {
        element.className += " " + className;
      }
    }

    function debounce(func, timeout = 300) {
      let timer;
      return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          func.apply(this, args);
        }, timeout);
      };
    }

    function waitForElement(selector, trigger, delayInterval, delayTimeout) {
      delayInterval = delayInterval || 50;
      delayTimeout = delayTimeout || 15000;

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

    function isMenuOpen() {
      return !!document.querySelector("[role='dialog'][data-state='open']:not(#ch2-dialog)");
    }

    /* hide on scroll down, show on scroll up */
    function toggleHeader() {
      if (window.innerWidth > 1024) return;
      var header = document.querySelector(headerSelector);
      if (!header) return;

      var y = window.scrollY;

      if (y <= topOffset || isMenuOpen()) {
        header.classList.remove(hiddenClass);
      } else if (Math.abs(y - lastY) >= minScroll) {
        header.classList.toggle(hiddenClass, y > lastY);
      }

      lastY = y;
    }

    /* Variation Init */
    function init() {
      addClass("body", variation_name);

      if (!window.cre_t_28_listenerControl) {
        window.cre_t_28_listenerControl = true;
        lastY = window.scrollY;
        window.addEventListener("scroll", debounce(toggleHeader, 100), { passive: true });
      }
    }

    /* Init variation */
    waitForElement(headerSelector, init);
  } catch (e) {
    if (debug) console.log(e, "error in Test " + variation_name);
  }
})();