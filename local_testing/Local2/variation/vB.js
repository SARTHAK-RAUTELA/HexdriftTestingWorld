(function () {
  try {
    var MIN_LIMIT = 1;
    var TA_SEL = '[name="conditionDescription"]';
    var BTN_SEL = '[data-testid="request-consult__next-step-button"]';
    var WRAPPER_SEL = '[data-testid="condition-description__symptoms-text-input"]';

    /* ---------- debounce ---------- */
    function debounce(fn, wait) {
      var timer;
      return function () {
        var ctx = this;
        var args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function () { fn.apply(ctx, args); }, wait);
      };
    }

    /* ---------- waitForElement ---------- */
    function waitForElement(selector, callback) {
      var existing = document.querySelector(selector);
      if (existing) return callback(existing);
      var ob = new MutationObserver(function () {
        var el = document.querySelector(selector);
        if (el) { ob.disconnect(); callback(el); }
      });
      ob.observe(document.documentElement, { childList: true, subtree: true });
      setTimeout(function () { ob.disconnect(); }, 15000);
    }

    /* ---------- Clear MUI red error classes ---------- */
    function clearMuiError(ta) {
      try {
        ta.removeAttribute("aria-invalid");
        var box = ta.closest(".MuiInputBase-root");
        if (box) box.classList.remove("Mui-error");
        var fc = ta.closest(".MuiFormControl-root");
        if (fc) fc.classList.remove("Mui-error");
        var wrapper = ta.closest(WRAPPER_SEL);
        if (wrapper) {
          var sib = wrapper.parentElement;
          if (sib) {
            var lbl = sib.querySelector("label");
            if (lbl) { lbl.classList.remove("Mui-error"); lbl.style.color = ""; }
          }
        }
      } catch (e) { }
    }

    /* ---------- Show/hide custom error message ---------- */
    function showCustomError(wrapper, show) {
      var err = wrapper.querySelector(".custom-error");
      if (!err) {
        wrapper.insertAdjacentHTML(
          "beforeend",
          '<div class="custom-error" style="color:rgb(234,72,72);font-size:14px;' +
          'margin-top:6px;display:none;">Please provide a description</div>'
        );
        err = wrapper.querySelector(".custom-error");
      }
      err.style.display = show ? "block" : "none";
    }

    /* ---------- Attach character counter to textarea ---------- */
    function attachCounter(iframeDoc, ta) {
      if (ta.dataset.cccDone) return;

      var parent = ta.parentNode;
      if (!parent) return;

      // Don't add if already exists
      if (parent.querySelector(".custom-char-counter")) {
        ta.dataset.cccDone = "1";
        return;
      }

      ta.dataset.cccDone = "1";

      // Set relative position only if parent is static
      var win = iframeDoc.defaultView || window;
      if (win.getComputedStyle(parent).position === "static") {
        parent.style.position = "relative";
      }

      // Counter — hidden on page load per design spec
      var counter = iframeDoc.createElement("div");
      counter.className = "custom-char-counter";
      counter.style.cssText =
        "font-size:12px;text-align:right;position:absolute;bottom:3px;" +
        "right:10px;color:black;pointer-events:none;z-index:10;display:none;";
      parent.appendChild(counter);

      var hasTyped = false;

      function update() {
        // Show counter only on first keystroke (hidden on page load per Figma)
        if (!hasTyped) {
          hasTyped = true;
          counter.style.display = "block";
        }
        var len = ta.value.trim().length;
        counter.textContent = len + " / " + MIN_LIMIT;
        counter.style.color = len >= MIN_LIMIT ? "green" : "black";
        if (len >= MIN_LIMIT) clearMuiError(ta);
      }

      // Counter only appears on input — not focus or click
      ta.addEventListener("input", update);
    }

    /* ---------- Setup Next button validation ---------- */
    function setupSubmit(iframeDoc) {
      iframeDoc.addEventListener(
        "click",
        function (e) {
          var btn = e.target.closest && e.target.closest(BTN_SEL);
          if (!btn) return;

          var ta = iframeDoc.querySelector(TA_SEL);
          if (!ta) return;

          var wrapper = ta.closest(WRAPPER_SEL);
          var len = ta.value.trim().length;

          if (len < MIN_LIMIT) {
            // Block click — show our error
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            if (wrapper) showCustomError(wrapper, true);
            // Show red border
            var borderBox = wrapper ? wrapper.querySelector(".MuiInputBase-root") : null;
            if (borderBox) borderBox.style.outline = "2px solid rgb(234,72,72)";
            // Red label
            var sib = wrapper ? wrapper.parentElement : null;
            var label = sib ? sib.querySelector("label") : null;
            if (label) label.style.color = "rgb(234,72,72)";
            return;
          }

          // Valid — clear any errors and let click through naturally
          // No padding needed — client removed the 30-char backend check
          if (wrapper) showCustomError(wrapper, false);
          clearMuiError(ta);
          var borderBox = wrapper ? wrapper.querySelector(".MuiInputBase-root") : null;
          if (borderBox) borderBox.style.outline = "";
          var sib = wrapper ? wrapper.parentElement : null;
          var label = sib ? sib.querySelector("label") : null;
          if (label) label.style.color = "";

          // Let the click propagate naturally to React
        },
        true // capture phase
      );
    }

    /* ---------- INIT ---------- */
    function init(iframeDoc) {
      if (iframeDoc._cccInit) return;
      iframeDoc._cccInit = true;
      if (!iframeDoc.documentElement) return;

      // Hide native 30-char error message (CSS class from original site)
      if (!iframeDoc.querySelector('style[data-cre-v2]')) {
        var style = iframeDoc.createElement("style");
        style.setAttribute('data-cre-v2', '1');
        style.textContent = ".css-1ymu8si { display: none !important; }";
        iframeDoc.head.appendChild(style);
      }

      // Setup Next button validation
      setupSubmit(iframeDoc);

      // Watch for textarea appearing (React may render it after init)
      var checkForTextarea = debounce(function () {
        var ta = iframeDoc.querySelector(TA_SEL);
        if (ta) attachCounter(iframeDoc, ta);
      }, 50);

      var ob = new MutationObserver(checkForTextarea);
      ob.observe(iframeDoc.documentElement, { childList: true, subtree: true });

      // Attach immediately if textarea already exists
      var existing = iframeDoc.querySelector(TA_SEL);
      if (existing) attachCounter(iframeDoc, existing);
    }

    /* ---------- Find iframe and run ---------- */
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

        if (iframe.contentDocument &&
          iframe.contentDocument.readyState === "complete") {
          run();
        }
      });
    }

  } catch (e) {
    console.log("variation error:", e);
  }
})();