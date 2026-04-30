(function () {
  try {

    /* ========== UTILITIES ========== */

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

    /* 
      FIX #2 + #8: observeSelector with proper WeakRef-safe deduplication
      Uses element identity via a WeakSet (not Map) so GC'd nodes
      are automatically removed, preventing memory leaks.
    */
    function observeSelector(selector, callback, options) {
      options = options || {};
      var doc = options.document || document;
      var observeTarget = doc.documentElement || doc.body;
      if (!observeTarget) return;

      var processed = new WeakSet();

      function handle(el) {
        if (!processed.has(el)) {
          processed.add(el);
          callback(el);
        }
      }

      function scan() {
        try {
          doc.querySelectorAll(selector).forEach(handle);
        } catch(e) {}
      }

      var debouncedScan = debounce(scan, 150);
      scan();

      // FIX #8: store debouncedScan reference so observer always calls same fn
      var observer = new MutationObserver(debouncedScan);
      observer.observe(observeTarget, { childList: true, subtree: true });
      return observer;
    }

    /* FIX #3: Cache fiber walk result, invalidate on DOM change */
    var _fpCache = null;
    var _fpCacheDoc = null;

    function getFormProviderProps(iframeDoc) {
      // Return cached result if same doc and still valid
      if (_fpCache && _fpCacheDoc === iframeDoc) {
        try {
          // Validate cache is still live by checking a method exists
          if (_fpCache.getValues) return _fpCache;
        } catch(e) {}
      }

      var ta = iframeDoc.querySelector('[name="conditionDescription"]');
      if (!ta) return null;
      var fk = Object.keys(ta).find(function(k){ return k.startsWith("__reactFiber"); });
      if (!fk) return null;
      var f = ta[fk]["re"+"turn"];
      var i = 0;
      while (f && i < 80) {
        i++;
        var p = f.memoizedProps;
        if (p && p.setValue && p.handleSubmit && p.getValues) {
          _fpCache = p;
          _fpCacheDoc = iframeDoc;
          return p;
        }
        f = f["re"+"turn"];
      }
      return null;
    }

    /* ========== MAIN ========== */

    function ChangeFrom(iframeDoc) {
      if (!iframeDoc) return;
      // Prevent running twice on same document
      if (iframeDoc._changeFromInit) return;
      iframeDoc._changeFromInit = true;

      var MIN_LIMIT = 15;
      var NATIVE_LIMIT = 30;
      var PAD_CHAR = ".";

      /* FIX #9: Check before injecting style to avoid duplicates */
      if (!iframeDoc.querySelector('style[data-cre-test]')) {
        var style = iframeDoc.createElement("style");
        style.setAttribute('data-cre-test', '1');
        style.textContent = [
          "header { display: none !important; }",
          ".css-1ymu8si { display: none !important; }"
        ].join(" ");
        iframeDoc.head.appendChild(style);
      }

      /* ========== MUI ERROR SUPPRESSION ========== */

      // FIX #5: isClearingError scoped per-textarea via closure, not shared
      function createErrorWatcher(textarea) {
        if (textarea._errorWatched) return;
        textarea._errorWatched = true;

        var isClearingError = false;

        function clearMuiError() {
          if (isClearingError) return;
          isClearingError = true;

          try {
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
          } catch(e) {}

          setTimeout(function () { isClearingError = false; }, 150);
        }

        var debouncedClear = debounce(function () {
          if (textarea.value.trim().length >= MIN_LIMIT) clearMuiError();
        }, 150);

        /* FIX #4: Store observer reference so it can be disconnected */
        var errorObserver = new MutationObserver(function (mutations) {
          if (isClearingError) return;
          var hit = mutations.some(function (m) {
            return m.type === "attributes" &&
              m.attributeName === "class" &&
              m.target.classList &&
              m.target.classList.contains("Mui-error");
          });
          if (hit) debouncedClear();
        });

        errorObserver.observe(iframeDoc.body, {
          subtree: true,
          attributes: true,
          attributeFilter: ["class", "aria-invalid"]
        });

        // Disconnect observer when textarea is removed from DOM
        var removalObserver = new MutationObserver(function () {
          if (!iframeDoc.contains(textarea)) {
            errorObserver.disconnect();
            removalObserver.disconnect();
          }
        });
        removalObserver.observe(iframeDoc.body, { childList: true, subtree: true });

        // Expose clearMuiError for use in counter update
        textarea._clearMuiError = clearMuiError;
      }

      /* ========== CHARACTER COUNTER ========== */

      function enhanceTextarea(textarea) {
        if (textarea.classList.contains("counter-bound")) return;
        textarea.classList.add("counter-bound");

        createErrorWatcher(textarea);

        /* FIX #6: initUI guarded by flag set BEFORE async work */
        var uiInitialised = false;

        function initUI() {
          if (uiInitialised) return;
          uiInitialised = true;

          var parent = textarea.parentNode;
          if (!parent) return;

          // FIX #6: Extra DOM check — never add counter if one already exists
          if (parent.querySelector(".custom-char-counter")) return;

          parent.style.position = "relative";
          parent.insertAdjacentHTML("beforeend",
            '<div class="custom-char-counter" style="font-size:12px;text-align:right;' +
            'position:absolute;bottom:3px;right:10px;color:black;pointer-events:none;z-index:10;">' +
            '0 / ' + MIN_LIMIT + '</div>'
          );

          var counter = parent.querySelector(".custom-char-counter");

          function update() {
            var len = textarea.value.trim().length;
            counter.innerText = len + " / " + MIN_LIMIT;
            counter.style.color = len >= MIN_LIMIT ? "green" : "black";
            if (len >= MIN_LIMIT && textarea._clearMuiError) {
              textarea._clearMuiError();
            }
          }

          textarea.addEventListener("input", update);
          update();
        }

        ["focus", "click", "input"].forEach(function (evt) {
          textarea.addEventListener(evt, initUI);
        });
      }

      /* ========== SCRIPT INJECTION (FIX #1) ========== */

      /* 
        FIX #1: Guard against multiple simultaneous injections.
        Only one script can be in-flight at a time.
      */
      var isFireInProgress = false;

      function fireInsideIframe(realValue, paddedValue) {
        if (isFireInProgress) return;
        isFireInProgress = true;

        // Invalidate FP cache so next click re-walks fiber
        _fpCache = null;

        var scriptId = 'cre-fire-' + Date.now();
        var safeReal = realValue.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        var safePadded = paddedValue.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

        var scriptContent = [
          "(function(){",
          "  try{",
          "    var ta=document.querySelector('[name=\"conditionDescription\"]');",
          "    if(!ta){ console.log('ta not found'); return; }",
          "    var fk=Object.keys(ta).find(function(k){return k.startsWith('__reactFiber');});",
          "    var f=ta[fk]['re'+'turn'],i=0,fp=null;",
          "    while(f&&i<80){i++;var p=f.memoizedProps;if(p&&p.setValue&&p.getValues){fp=p;break;}f=f['re'+'turn'];}",
          "    if(!fp){ console.log('fp not found'); return; }",
          "    var btn=document.querySelector('[data-testid=\"request-consult__next-step-button\"]');",
          "    if(!btn){ console.log('btn not found'); return; }",
          "    var bk=Object.keys(btn).find(function(k){return k.startsWith('__reactProps');});",
          "    if(!bk){ console.log('bk not found'); return; }",
          "    if(fp.clearErrors) fp.clearErrors('conditionDescription');",
          "    fp.setValue('conditionDescription','"+safePadded+"',{shouldValidate:false,shouldDirty:false});",
          "    setTimeout(function(){",
          "      btn[bk].onClick({",
          "        preventDefault:function(){},stopPropagation:function(){},",
          "        nativeEvent:new MouseEvent('click'),",
          "        target:btn,currentTarget:btn,type:'click',bubbles:true,",
          "        isPropagationStopped:function(){return false;},",
          "        isDefaultPrevented:function(){return false;},",
          "        persist:function(){}",
          "      });",
          // FIX #7: Only restore if textarea still exists
          "      setTimeout(function(){",
          "        try{",
          "          var ta2=document.querySelector('[name=\"conditionDescription\"]');",
          "          if(!ta2) return;", // page navigated, skip restore
          "          var fk2=Object.keys(ta2).find(function(k){return k.startsWith('__reactFiber');});",
          "          var f2=ta2[fk2]['re'+'turn'],i2=0,fp2=null;",
          "          while(f2&&i2<80){i2++;var pp=f2.memoizedProps;if(pp&&pp.setValue&&pp.getValues){fp2=pp;break;}f2=f2['re'+'turn'];}",
          "          if(fp2) fp2.setValue('conditionDescription','"+safeReal+"',{shouldValidate:false,shouldDirty:false});",
          "        }catch(e){}",
          "      },500);",
          "    },100);",
          // FIX #1: Remove script tag after execution
          "    var s=document.getElementById('"+scriptId+"');",
          "    if(s) s.parentNode.removeChild(s);",
          "  }catch(err){ console.log('fire error:',err); }",
          "})();"
        ].join("\n");

        var script = iframeDoc.createElement("script");
        script.id = scriptId;
        script.textContent = scriptContent;
        iframeDoc.head.appendChild(script);

        // Reset in-progress flag after enough time for navigation
        setTimeout(function () {
          isFireInProgress = false;
          // Clean up script if still present
          var leftover = iframeDoc.getElementById(scriptId);
          if (leftover) leftover.parentNode.removeChild(leftover);
        }, 2000);
      }

      /* ========== BUTTON CLICK HANDLER ========== */

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

        // Block ALL clicks on this button — we control when it fires
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        /* ===== Our validation ===== */
        var textareas = iframeDoc.querySelectorAll('[name="conditionDescription"]');
        var isValid = true;

        textareas.forEach(function (ta) {
          var wrapper = ta.closest('[data-testid="condition-description__symptoms-text-input"]');
          if (!wrapper) return;

          // FIX #6: Check before inserting custom error
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
            if (ta._clearMuiError) ta._clearMuiError();
          }
        });

        if (!isValid) return;

        /* ===== Valid: get real value, pad with dots, fire ===== */
        var fp = getFormProviderProps(iframeDoc);
        if (!fp) {
          console.log("FormProvider not found");
          return;
        }

        var realValue = fp.getValues("conditionDescription").trim();
        var paddedValue = realValue;
        while (paddedValue.length < NATIVE_LIMIT) {
          paddedValue += PAD_CHAR;
        }

        fireInsideIframe(realValue, paddedValue);

      }, true);

      /* ===== Observe textarea ===== */
      observeSelector('[name="conditionDescription"]', enhanceTextarea, { document: iframeDoc });
    }

    /* ========== INIT ========== */

    function init() {
      if (window.creT17bserver) return;
      window.creT17bserver = true;

      setTimeout(function () {
        waitForElement("iframe#mobile-viewport", function (iframe) {
          function run() {
            try {
              var iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
              if (!iframeDoc || !iframeDoc.head) return;
              ChangeFrom(iframeDoc);
            } catch (e) {
              console.log("iframe access error:", e);
            }
          }

          iframe.addEventListener("load", run);

          if (iframe.contentDocument &&
              iframe.contentDocument.readyState === "complete") {
            run();
          }
        }, 50, 15000);
      }, 200);
    }

    waitForElement("body", init, 50, 15000);

  } catch (e) {
    console.log("Main error:", e);
  }
})();