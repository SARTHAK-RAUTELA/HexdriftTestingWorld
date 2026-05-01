(function () {
  try {
    var MIN_LIMIT = 1;
    var TA_SEL = '[name="conditionDescription"]';
    var BTN_SEL = '[data-testid="request-consult__next-step-button"]';
    var WRAPPER_SEL = '[data-testid="condition-description__symptoms-text-input"]';

    // Coalesce rapid bursts of calls (e.g. MutationObserver firing on every React re-render)
    // into a single trailing-edge invocation.
    function debounce(fn, wait) {
      var timer;
      return function () {
        var ctx = this;
        var args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function () {
          fn.apply(ctx, args);
        }, wait);
      };
    }

    // Wait for an element to exist, checking existing and then watching for mutations.
    function waitForElement(selector, callback) {
      var existing = document.querySelector(selector);
      if (existing) return callback(existing);
      var ob = new MutationObserver(function () {
        var el = document.querySelector(selector);
        if (el) {
          ob.disconnect();
          callback(el);
        }
      });
      ob.observe(document.documentElement, { childList: true, subtree: true });
      setTimeout(function () {
        ob.disconnect();
      }, 15000);
    }

    // Clear MUI error state so the red error styles go away when the user has typed enough.
    function clearMuiError(ta) {
      try {
        ta.removeAttribute("aria-invalid");
        var box = ta.closest(".MuiInputBase-root");
        if (box) box.classList.remove("Mui-error");
        var fc = ta.closest(".MuiFormControl-root");
        if (fc) fc.classList.remove("Mui-error");
      } catch (e) { }
    }

    // Show a custom error message below the textarea.
    function showCustomError(wrapper, show) {
      var err = wrapper.querySelector(".custom-error");
      if (!err) {
        wrapper.insertAdjacentHTML("beforeend", '<div class="custom-error" style="color:rgb(234,72,72);font-size:14px;margin-top:6px;display:none;">Please provide a description </div>');
        err = wrapper.querySelector(".custom-error");
      }
      err.style.display = show ? "block" : "none";
    }

    // Attach a character counter to the textarea that updates as the user types.
    function attachCounter(iframeDoc, ta) {
      if (ta.dataset.cccDone) return;

      var parent = ta.parentNode;
      if (!parent) return;

      // Skip if a counter already exists in this parent (e.g. React replaced the textarea but kept the wrapper).
      if (parent.querySelector(".custom-char-counter")) {
        ta.dataset.cccDone = "1";
        return;
      }

      ta.dataset.cccDone = "1";

      // Only set position if the parent is static — don't override an existing absolute/fixed layout.
      var win = iframeDoc.defaultView || window;
      if (win.getComputedStyle(parent).position === "static") {
        parent.style.position = "relative";
      }

      var counter = iframeDoc.createElement("div");
      counter.className = "custom-char-counter";
      counter.style.cssText = "font-size:12px;text-align:right;position:absolute;bottom:3px;right:10px;color:black;pointer-events:none;z-index:10;";
      parent.appendChild(counter);

      function update() {
        var len = ta.value.trim().length;
        counter.textContent = len + " / " + MIN_LIMIT;
        counter.style.color = len >= MIN_LIMIT ? "green" : "black";
        if (len >= MIN_LIMIT) clearMuiError(ta);
      }

      ta.addEventListener("input", update);
      update();
    }

    function setupSubmit(iframeDoc) {
      iframeDoc.addEventListener(
        "click",
        function (e) {
          var btn = e.target.closest && e.target.closest(BTN_SEL);
          if (!btn) return;

          var ta = iframeDoc.querySelector(TA_SEL);
          if (!ta) return;

          var wrapper = ta.closest(WRAPPER_SEL);
          var value = ta.value.trim();

          if (value.length < MIN_LIMIT) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            if (wrapper) showCustomError(wrapper, true);
            return;
          }

          if (wrapper) showCustomError(wrapper, false);
          clearMuiError(ta);
        },
        true
      );
    }

    function init(iframeDoc) {
      if (iframeDoc._cccInit) return;
      iframeDoc._cccInit = true;

      if (!iframeDoc.documentElement) return;

      // setup submission
      setupSubmit(iframeDoc);

      var checkForTextarea = debounce(function () {
        var ta = iframeDoc.querySelector(TA_SEL);
        if (ta) attachCounter(iframeDoc, ta);
      }, 50);

      var ob = new MutationObserver(checkForTextarea);
      ob.observe(iframeDoc.documentElement, { childList: true, subtree: true });

      var existing = iframeDoc.querySelector(TA_SEL);
      if (existing) attachCounter(iframeDoc, existing);
    }

    if (!window.creT17bserver) {
      window.creT17bserver = true;
      waitForElement("iframe#mobile-viewport", function (iframe) {
        function run() {
          try {
            var doc = iframe.contentDocument || iframe.contentWindow.document;
            if (doc && doc.head) init(doc);
          } catch (e) { }
        }

        iframe.addEventListener("load", run);
        // If the iframe is already loaded, run immediately. Otherwise, wait for the load event.
        if (iframe.contentDocument && iframe.contentDocument.readyState === "complete") {
          run();
        }
      });
    }
  } catch (e) {
    console.log("variation error:", e);
  }
})();