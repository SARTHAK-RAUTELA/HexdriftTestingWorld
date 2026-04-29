(function () {
  try {

    function waitForElement(selector, trigger, delayInterval, delayTimeout) {
      var interval = setInterval(function () {
        var el = document.querySelector(selector);
        if (el) { clearInterval(interval); trigger(el); }
      }, delayInterval);
      setTimeout(function () { clearInterval(interval); }, delayTimeout);
    }

    function debounce(func, timeout) {
      timeout = timeout || 200;
      var timer;
      return function () {
        clearTimeout(timer);
        var args = arguments;
        timer = setTimeout(function () { func.apply(null, args); }, timeout);
      };
    }

    function observeSelector(selector, callback, options) {
      options = options || {};
      var doc = options.document || document;
      var observeTarget = doc.documentElement || doc.body;
      var processed = new Map();
      function handle(el) {
        if (!processed.has(el)) { processed.set(el, true); callback(el); }
      }
      function scan() { doc.querySelectorAll(selector).forEach(handle); }
      var debouncedScan = debounce(scan, 100);
      scan();
      new MutationObserver(function () { debouncedScan(); })
        .observe(observeTarget, { childList: true, subtree: true });
    }

    function getFormProviderProps(iframeDoc) {
      var ta = iframeDoc.querySelector('[name="conditionDescription"]');
      if (!ta) return null;
      var fk = Object.keys(ta).find(function (k) { return k.startsWith("__reactFiber"); });
      if (!fk) return null;
      var f = ta[fk]["re" + "turn"];
      var i = 0;
      while (f && i < 80) {
        i++;
        var p = f.memoizedProps;
        if (p && p.setValue && p.handleSubmit && p.getValues) return p;
        f = f["re" + "turn"];
      }
      return null;
    }

    function getBtnProps(iframeDoc) {
      var btn = iframeDoc.querySelector('[data-testid="request-consult__next-step-button"]');
      if (!btn) return null;
      var bk = Object.keys(btn).find(function (k) { return k.startsWith("__reactProps"); });
      return bk ? { props: btn[bk], el: btn } : null;
    }

    function ChangeFrom(iframeDoc) {
      if (!iframeDoc) return;

      var MIN_LIMIT = 15;
      var NATIVE_LIMIT = 30;
      var PAD_CHAR = ".";

      /* ===== CSS ===== */
      var style = iframeDoc.createElement("style");
      style.textContent = "header{display:none!important;}.css-1ymu8si{display:none!important;}";
      iframeDoc.head.appendChild(style);

      /* ===== Clear Mui error ===== */
      var isClearingError = false;
      function clearMuiError(textarea) {
        if (isClearingError) return;
        isClearingError = true;
        textarea.removeAttribute("aria-invalid");
        var muiBase = textarea.closest(".MuiInputBase-root");
        if (muiBase) muiBase.classList.remove("Mui-error");
        var fc = textarea.closest(".MuiFormControl-root");
        if (fc) fc.classList.remove("Mui-error");
        var wrapper = textarea.closest('[data-testid="condition-description__symptoms-text-input"]');
        if (wrapper) {
          var sib = wrapper.parentElement;
          if (sib) {
            var lbl = sib.querySelector("label");
            if (lbl) { lbl.classList.remove("Mui-error"); lbl.style.color = ""; }
          }
        }
        setTimeout(function () { isClearingError = false; }, 150);
      }

      function watchErrors(textarea) {
        if (textarea._errorWatched) return;
        textarea._errorWatched = true;
        var debouncedClear = debounce(function () {
          if (textarea.value.length >= MIN_LIMIT) clearMuiError(textarea);
        }, 150);
        new MutationObserver(function (mutations) {
          if (isClearingError) return;
          var hit = mutations.some(function (m) {
            return m.type === "attributes" && m.attributeName === "class" &&
              m.target.classList && m.target.classList.contains("Mui-error");
          });
          if (hit) debouncedClear();
        }).observe(iframeDoc.body, {
          subtree: true, attributes: true, attributeFilter: ["class", "aria-invalid"]
        });
      }

      /* ===== Character counter ===== */
      function enhanceTextarea(textarea) {
        if (textarea.classList.contains("counter-bound")) return;
        textarea.classList.add("counter-bound");
        watchErrors(textarea);

        function initUI() {
          if (textarea.classList.contains("counter-added")) return;
          textarea.classList.add("counter-added");
          var parent = textarea.parentNode;
          parent.style.position = "relative";
          parent.insertAdjacentHTML("beforeend",
            '<div class="custom-char-counter" style="font-size:12px;text-align:right;' +
            'position:absolute;bottom:3px;right:10px;color:black;pointer-events:none;z-index:10;">' +
            '0 / ' + MIN_LIMIT + '</div>'
          );
          var counter = parent.querySelector(".custom-char-counter");
          function update() {
            var len = textarea.value.length;
            counter.innerText = len + " / " + MIN_LIMIT;
            counter.style.color = len >= MIN_LIMIT ? "green" : "black";
            if (len >= MIN_LIMIT) clearMuiError(textarea);
          }
          textarea.addEventListener("input", update);
          update();
        }
        ["focus", "click", "input"].forEach(function (evt) {
          textarea.addEventListener(evt, initUI);
        });
      }

      /* ===== Fire click inside iframe script context ===== */
      function fireInsideIframe(iframeDoc, realValue, paddedValue) {
        var script = iframeDoc.createElement("script");
        script.textContent = [
          "(function(){",
          "  try {",
          "    var ta = document.querySelector('[name=\"conditionDescription\"]');",
          "    var fk = Object.keys(ta).find(function(k){ return k.startsWith('__reactFiber'); });",
          "    var f = ta[fk]['re'+'turn'], i=0, fp=null;",
          "    while(f && i<80){ i++; var p=f.memoizedProps; if(p&&p.setValue&&p.getValues){fp=p;break;} f=f['re'+'turn']; }",
          "    var btn = document.querySelector('[data-testid=\"request-consult__next-step-button\"]');",
          "    var bk = Object.keys(btn).find(function(k){ return k.startsWith('__reactProps'); });",
          "    fp.clearErrors && fp.clearErrors('conditionDescription');",
          "    fp.setValue('conditionDescription', '" + paddedValue.replace(/'/g, "\\'") + "', {shouldValidate:false, shouldDirty:false});",
          "    setTimeout(function(){",
          "      btn[bk].onClick({",
          "        preventDefault:function(){},",
          "        stopPropagation:function(){},",
          "        nativeEvent: new MouseEvent('click'),",
          "        target: btn,",
          "        currentTarget: btn,",
          "        type: 'click',",
          "        bubbles: true,",
          "        isPropagationStopped: function(){ return false; },",
          "        isDefaultPrevented: function(){ return false; },",
          "        persist: function(){}",
          "      });",
          // Restore real value after navigation
          "      setTimeout(function(){",
          "        try{",
          "          var ta2=document.querySelector('[name=\"conditionDescription\"]');",
          "          if(ta2){",
          "            var fk2=Object.keys(ta2).find(function(k){return k.startsWith('__reactFiber');});",
          "            var f2=ta2[fk2]['re'+'turn'],i2=0,fp2=null;",
          "            while(f2&&i2<80){i2++;var pp=f2.memoizedProps;if(pp&&pp.setValue&&pp.getValues){fp2=pp;break;}f2=f2['re'+'turn'];}",
          "            if(fp2) fp2.setValue('conditionDescription', '" + realValue.replace(/'/g, "\\'") + "', {shouldValidate:false,shouldDirty:false});",
          "          }",
          "        }catch(e){}",
          "      }, 500);",
          "    }, 100);",
          "  } catch(e){ console.log('fireInsideIframe error:', e); }",
          "})();"
        ].join("\n");
        iframeDoc.head.appendChild(script);
        // Clean up script tag
        setTimeout(function () { try { script.parentNode.removeChild(script); } catch (e) { } }, 1000);
      }

      /* ===== Button click handler ===== */
      iframeDoc.addEventListener("click", function (e) {
        var target = e.target;
        var btnEl = null;
        while (target && target !== iframeDoc.body) {
          if (target.matches && target.matches('[data-testid="request-consult__next-step-button"]')) {
            btnEl = target;
            break;
          }
          target = target.parentElement;
        }
        if (!btnEl) return;

        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        /* ===== Our validation ===== */
        var textareas = iframeDoc.querySelectorAll('[name="conditionDescription"]');
        var isValid = true;

        textareas.forEach(function (ta) {
          var wrapper = ta.closest('[data-testid="condition-description__symptoms-text-input"]');
          if (!wrapper) return;

          var customError = wrapper.querySelector(".custom-error");
          if (!customError) {
            wrapper.insertAdjacentHTML("beforeend",
              '<div class="custom-error" style="color:rgb(234,72,72);font-size:14px;' +
              'margin-top:6px;display:none;">Please provide a description with at least ' +
              MIN_LIMIT + ' characters</div>'
            );
            customError = wrapper.querySelector(".custom-error");
          }

          var borderBox = wrapper.querySelector(".MuiInputBase-root");
          var sib = wrapper.parentElement;
          var label = sib ? sib.querySelector("label") : null;
          var len = ta.value.trim().length;

          if (len < MIN_LIMIT) {
            isValid = false;
            customError.style.display = "block";
            if (borderBox) borderBox.style.outline = "2px solid rgb(234,72,72)";
            if (label) label.style.color = "rgb(234,72,72)";
          } else {
            customError.style.display = "none";
            if (borderBox) borderBox.style.outline = "";
            if (label) label.style.color = "";
            clearMuiError(ta);
          }
        });

        if (!isValid) return;

        /* ===== Valid: pad with dots and fire via script injection ===== */
        var fp = getFormProviderProps(iframeDoc);
        if (!fp) return;

        var realValue = fp.getValues("conditionDescription").trim();
        var paddedValue = realValue;
        while (paddedValue.length < NATIVE_LIMIT) {
          paddedValue += PAD_CHAR;
        }

        fireInsideIframe(iframeDoc, realValue, paddedValue);

      }, true);

      observeSelector('[name="conditionDescription"]', enhanceTextarea, { document: iframeDoc });
    }

    /* ===== INIT ===== */
    function init() {
      if (window.creT17bserver) return;
      window.creT17bserver = true;

      setTimeout(function () {
        waitForElement("iframe#mobile-viewport", function (iframe) {
          function run() {
            try {
              var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
              ChangeFrom(iframeDoc);
            } catch (e) {
              console.log("iframe access error:", e);
            }
          }
          iframe.onload = run;
          if (iframe.contentDocument && iframe.contentDocument.readyState === "complete") run();
        }, 50, 15000);
      }, 200);
    }

    waitForElement("body", init, 50, 15000);

  } catch (e) {
    console.log("Main error:", e);
  }
})();