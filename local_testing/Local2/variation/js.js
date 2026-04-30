(function () {
  try {
    var debug = 1;

    /* ---------- waitForElement ---------- */
    function waitForElement(selector, trigger, delayInterval, delayTimeout) {
      var interval = setInterval(function () {
        var el = document.querySelector(selector);
        if (el) {
          clearInterval(interval);
          trigger(el);
        }
      }, delayInterval);

      setTimeout(function () {
        clearInterval(interval);
        log("Timeout:", selector);
      }, delayTimeout);
    }

    /* ---------- debounce ---------- */
    function debounce(func, timeout = 200) {
      let timer;
      return function () {
        clearTimeout(timer);
        var args = arguments;
        timer = setTimeout(function () {
          func.apply(null, args);
        }, timeout);
      };
    }

    /* ---------- observeSelector (kept) ---------- */
    function observeSelector(selector, callback, options = {}) {
      const doc = options.document || document;
      const processed = new Map();

      function handle(el) {
        if (!processed.has(el)) {
          processed.set(el, true);
          callback(el);
        }
      }

      function scan() {
        doc.querySelectorAll(selector).forEach(handle);
      }

      const debouncedScan = debounce(scan, 100);

      scan();

      const observer = new MutationObserver(function () {
        debouncedScan();
      });

      observer.observe(doc, {
        childList: true,
        subtree: true,
      });
    }

    /* ---------- LIVE EVENT DELEGATION ---------- */
    function live(selector, event, callback, context) {
      var doc = context || document;

      function addEvent(el, type, handler) {
        if (el.attachEvent) el.attachEvent("on" + type, handler);
        else el.addEventListener(type, handler);
      }

      if (!Element.prototype.matches) {
        Element.prototype.matches =
          Element.prototype.matchesSelector ||
          Element.prototype.webkitMatchesSelector ||
          Element.prototype.msMatchesSelector ||
          function (selector) {
            var nodes = (this.parentNode || document).querySelectorAll(selector);
            var i = -1;
            while (nodes[++i] && nodes[i] !== this);
            return !!nodes[i];
          };
      }

      addEvent(doc, event, function (e) {
        var el = e.target || e.srcElement;

        while (el && el !== doc) {
          if (el.matches && el.matches(selector)) {
            callback.call(el, e);
            break;
          }
          el = el.parentElement;
        }
      });
    }

    /* ---------- MAIN ---------- */
    function ChangeFrom(iframeDoc) {
      if (!iframeDoc) return;

      

      /* ---------- CSS ---------- */
      var style = iframeDoc.createElement("style");
      style.innerHTML = `header { display:none !important; }`;
      iframeDoc.head.appendChild(style);

      var MIN_LIMIT = 15;

      /* ---------- TEXTAREA (lazy UI + live input) ---------- */
      function enhanceTextarea(textarea) {
        if (textarea.classList.contains("counter-bound")) return;

        textarea.classList.add("counter-bound");

        function initUI() {
          if (textarea.classList.contains("counter-added")) return;

          textarea.classList.add("counter-added");

          var parent = textarea.parentNode;
          parent.style.position = "relative";

          parent.insertAdjacentHTML(
            "beforeend",
  `<div class="custom-char-counter"
    style="font-size:12px;text-align:right;color:black;position:absolute;bottom:3px;right:10px;">
    0 / ${MIN_LIMIT}
  </div>`
          );

          var counter = parent.querySelector(".custom-char-counter");

          function update() {
            var len = textarea.value.length;
            counter.innerText = `${len} / ${MIN_LIMIT}`;
            counter.style.color = len < MIN_LIMIT ? "black" : "green";
          }

          textarea.addEventListener("input", update);
          update();
        }

        /* ---------- LIVE triggers ---------- */
        live('[name="conditionDescription"]', "focus", function () {
          if (this === textarea) initUI();
        }, iframeDoc);

        live('[name="conditionDescription"]', "click", function () {
          if (this === textarea) initUI();
        }, iframeDoc);

        live('[name="conditionDescription"]', "input", function () {
          if (this === textarea) initUI();
        }, iframeDoc);
      }

      /* ---------- BUTTON VALIDATION (LIVE CLICK) ---------- */
      function bindButton(btn) {
        if (btn.classList.contains("validation-bound")) return;

        btn.classList.add("validation-bound");

        live(".MuiButton-fullWidth", "click", function (e) {

          var isValid = true;

          var textareas = iframeDoc.querySelectorAll('[name="conditionDescription"]');

          textareas.forEach(function (textarea) {

            var wrapper = textarea.closest('[data-testid="condition-description__symptoms-text-input"]');
            if (!wrapper) return;

            var borderBox = wrapper.querySelector("div");

            error = wrapper.querySelector(".custom-error");
if (!error) {
  wrapper.insertAdjacentHTML(
    "beforeend",
    `<div class="custom-error"
      style="color:rgb(234,72,72);font-size:14px;margin-top:6px;display:none;">
      Please provide a description with at least 15 characters
    </div>`
  );
}

            var len = textarea.value.trim().length;

            var siblingWrapper = wrapper.parentElement;
            var label = siblingWrapper ? siblingWrapper.querySelector("label") : null;

            if (label) {
              label.style.color = len < MIN_LIMIT ? "rgb(234,72,72)" : "";
            }

            if (len < MIN_LIMIT) {
              isValid = false;
              error.style.display = "block";
              if (borderBox) borderBox.style.border = "2px solid red";
            } else {
              error.style.display = "none";
              if (borderBox) borderBox.style.border = "";
            }

          });

          if (!isValid) {
            e.preventDefault();
            e.stopPropagation();
          }

        }, iframeDoc);
      }

      /* ---------- OBSERVERS ---------- */
      function observeChanges() {
        observeSelector('[name="conditionDescription"]', enhanceTextarea, {
          document: iframeDoc
        });

        observeSelector('.MuiButton-fullWidth', bindButton, {
          document: iframeDoc
        });
      }

      observeChanges();
    }

    /* ---------- INIT ---------- */
    function init() {
      if (window.creT17bserver) return;

      window.creT17bserver = true;

      setTimeout(function () {
        waitForElement(
          "iframe#mobile-viewport",
          function (iframe) {
            function run() {
              try {
                var iframeDoc =
                  iframe.contentDocument || iframe.contentWindow.document;

                ChangeFrom(iframeDoc);
              } catch (e) {
                log("iframe access error:", e);
              }
            }

            iframe.onload = run;

            if (
              iframe.contentDocument &&
              iframe.contentDocument.readyState === "complete"
            ) {
              run();
            }
          },
          50,
          15000
        );
      }, 200);
    }

    waitForElement("body", init, 50, 15000);

  } catch (e) {
    console.log("Main error:", e);
  }
})();