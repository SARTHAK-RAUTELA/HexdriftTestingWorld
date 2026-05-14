(function () {
  try {
    /* main variables */
    var debug = 1;
    var variation_name = "Variation B";

    /* all Pure helper functions */

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







    /* Variation functions */

    function injectIframeStyles(iframeDoc) {
      if (iframeDoc.getElementById("cre-t-21-injected-styles")) return;
      var style = iframeDoc.createElement("style");
      style.id = "cre-t-21-injected-styles";
      style.textContent = [
        "#practice-search-by-name { display: none !important; }",
        "#practice-search-by-postcode { display: block !important; }",
        "#practice-search-by-postcode .MuiAutocomplete-endAdornment { display: none !important; }",
        "#practice-search-by-postcode .MuiOutlinedInput-root { height: 52px !important; }",
        "#cre-t-21-clinic-hint { margin-bottom: 18px !important; }",
        "#practice-search-by-postcode .cre-t-21-field-error .MuiOutlinedInput-notchedOutline { border-color: rgb(234,72,72) !important; border-width: 2px !important; }",
        "#practice-search-by-postcode .cre-t-21-field-error:hover .MuiOutlinedInput-notchedOutline { border-color: rgb(234,72,72) !important; }",
        "#practice-search-by-postcode .cre-t-21-field-error.Mui-focused .MuiOutlinedInput-notchedOutline { border-color: rgb(234,72,72) !important; }",
        "#practice-search-by-postcode .cre-t-21-field-error, #practice-search-by-postcode .cre-t-21-field-error:hover { background-color: transparent !important; }",
        "#cre-t-21-attended-checkbox, #cre-t-21-attended-checkbox + p { display: none !important; }",
      ].join(" ");
      iframeDoc.head.appendChild(style);
      if (debug) console.log(variation_name + " - iframe styles injected");
    }

    function updateIframeCopy(iframeDoc) {
      if (iframeDoc._cret21CopyDone) return;
      var label = iframeDoc.querySelector("#practice-search-by-postcode #practice-label");
      if (!label) return;

      if (label.textContent !== "Select a clinic") {
        label.textContent = "Select a clinic";
        if (debug) console.log(variation_name + " - label copy updated to 'Select a clinic'");
      }

      var postcodeInput = iframeDoc.querySelector("#practice-search-by-postcode input[role='combobox']");
      if (postcodeInput && postcodeInput.placeholder !== "Search clinic name or postcode") {
        postcodeInput.placeholder = "Search clinic name or postcode";
        if (debug) console.log(variation_name + " - postcode input placeholder updated");
      }

      var termsLink = iframeDoc.querySelector('a[href="/terms"]');
      if (termsLink) {
        var termsP = termsLink.closest("p");
        if (termsP && termsP.firstChild && termsP.firstChild.nodeType === 3) {
          if (termsP.firstChild.textContent.indexOf("agree") === -1) {
            termsP.firstChild.textContent = "I agree to the ";
            if (debug) console.log(variation_name + " - terms label copy updated");
          }
        }
      }

      if (!iframeDoc.getElementById("cre-t-21-clinic-hint")) {
        var hint = iframeDoc.createElement("p");
        hint.id = "cre-t-21-clinic-hint";
        hint.textContent = "Select a clinic you've visited within the last 12 months to continue with bulk billing.";
        label.parentNode.insertBefore(hint, label);
        if (debug) console.log(variation_name + " - clinic hint text inserted");
      }

      iframeDoc._cret21CopyDone = true;
    }

    function setupClinicValidation(iframeDoc) {
      if (iframeDoc._cret21ClinicValidation) return;
      iframeDoc._cret21ClinicValidation = true;

      var BTN_SEL      = '[data-testid="request-consult__next-step-button"]';
      var INPUT_SEL    = '#practice-search-by-postcode input[role="combobox"]';
      var LABEL_SEL    = '#practice-search-by-postcode #practice-label';
      var CONTAINER_SEL = '#practice-search-by-postcode .MuiOutlinedInput-root';

      function showError() {
        var container = iframeDoc.querySelector(CONTAINER_SEL);
        var label     = iframeDoc.querySelector(LABEL_SEL);
        if (container) container.classList.add("cre-t-21-field-error");
        if (label)     label.style.color = "rgb(234,72,72)";
        if (debug) console.log(variation_name + " - clinic validation error shown");
      }

      function clearError() {
        var container = iframeDoc.querySelector(CONTAINER_SEL);
        var label     = iframeDoc.querySelector(LABEL_SEL);
        if (container) container.classList.remove("cre-t-21-field-error");
        if (label)     label.style.color = "";
        if (debug) console.log(variation_name + " - clinic validation error cleared");
      }

      // Listen for Next button click
      iframeDoc.addEventListener("click", function (e) {
        var btn = e.target.closest && e.target.closest(BTN_SEL);
        if (!btn) return;

        window._conv_q = window._conv_q || [];
        window._conv_q.push(["triggerConversion", "100037720"]);

        var input = iframeDoc.querySelector(INPUT_SEL);
        if (!input) return;

        if (input.value.trim().length === 0) {
          showError();

          // Check if React's required fields are already satisfied
          // Rules from source: IsNotEmpty (phone), IsDateString (dob = 10 chars DD/MM/YYYY),
          // Equals(true) for attended + terms. consentToShareWithGP is NOT required.
          var phone    = iframeDoc.querySelector('input[name="userName"]');
          var dob      = iframeDoc.querySelector('input[id="secondaryUserName"]');
          var attended = iframeDoc.querySelector('input[name="hasAttendedPracticeIn12Months"]');
          var terms    = iframeDoc.querySelector('input[name="termsAndConditionsAccepted"]');

          var reactReady = (
            phone    && /^04\d{8}$/.test(phone.value.trim()) &&
            dob      && dob.value.trim().length === 10 &&
            attended && attended.checked               &&
            terms    && terms.checked
          );

          if (reactReady) {
            // React would navigate — block it until clinic is selected
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
          }
          // else: React has its own errors to show — let it handle them
          return;
        }

        clearError();
      }, true);

      // Clear error as soon as user starts typing / selects a value
      iframeDoc.addEventListener("input", function (e) {
        var el = e.target.closest && e.target.closest(INPUT_SEL);
        if (el && el.value.trim().length > 0) clearError();
      });
    }

    function preselectAttendedCheckbox(iframeDoc) {
      var checkbox = iframeDoc.querySelector('input[name="hasAttendedPracticeIn12Months"]');
      if (!checkbox) return;

      if (!checkbox.checked) {
        checkbox.click();
        if (debug) console.log(variation_name + " - attended checkbox pre-selected");
      }

      // Persistent watcher — re-check if React resets it on re-render
      if (iframeDoc._cret21AttendedWatcher) return;
      iframeDoc._cret21AttendedWatcher = true;

      var span = checkbox.closest(".MuiCheckbox-root") || checkbox.parentNode;
      var MO = (iframeDoc.defaultView || window).MutationObserver;
      var obs = new MO(function () {
        var cb = iframeDoc.querySelector('input[name="hasAttendedPracticeIn12Months"]');
        if (cb && !cb.checked) {
          cb.click();
          if (debug) console.log(variation_name + " - attended checkbox re-selected by watcher");
        }
      });

      obs.observe(span, { attributes: true, attributeFilter: ["class"] });
    }

    function addIdsToInputParents(iframeDoc) {
      if (iframeDoc._cret21IdsDone) return;

      var inputMappings = [
        { selector: 'input[name="userName"]',                      parentId: "cre-t-21-mobile-field" },
        { selector: 'input[id="secondaryUserName"]',               parentId: "cre-t-21-dob-field" },
        { selector: 'input[name="hasAttendedPracticeIn12Months"]', parentId: "cre-t-21-attended-checkbox" },
        { selector: 'input[name="consentToShareWithGP"]',          parentId: "cre-t-21-consent-checkbox" },
        { selector: 'input[name="termsAndConditionsAccepted"]',    parentId: "cre-t-21-terms-checkbox" },
      ];

      var allDone = true;
      inputMappings.forEach(function (mapping) {
        var input = iframeDoc.querySelector(mapping.selector);
        if (!input) { allDone = false; return; }
        var parent = input.closest(".MuiBox-root");
        if (parent && !parent.id) {
          parent.id = mapping.parentId;
          if (debug) console.log(variation_name + " - Added id '" + mapping.parentId + "' to parent of " + mapping.selector);
        }
      });

      if (allDone) iframeDoc._cret21IdsDone = true;
    }

    /* Variation Init */
    function init() {

  

      if (debug) console.log(variation_name + " - body[data-telehealth='step_4_Verify'] detected, starting 5s force interval");

      var forceInterval = setInterval(function () {
        var iframe = document.getElementById("mobile-viewport");
        if (!iframe) return;

        var iframeDoc;
        try {
          iframeDoc = iframe.contentWindow.document;
        } catch (e) {
          if (debug) console.log(variation_name + " - iframe contentWindow access error:", e);
          return;
        }

        if (iframeDoc && iframeDoc.body) {
          injectIframeStyles(iframeDoc);
          updateIframeCopy(iframeDoc);
          preselectAttendedCheckbox(iframeDoc);
          setupClinicValidation(iframeDoc);
          addIdsToInputParents(iframeDoc);
        }
      }, 100);

      setTimeout(function () {
        clearInterval(forceInterval);
        if (debug) console.log(variation_name + " - force interval cleared after 5s");
      }, 5000);
    }

    /* Initialise variation — observe outer body for step_4_Verify */
    waitForElement('body[data-telehealth="step_4_Verify"]', init);

  } catch (e) {
    if (debug) console.log(e, "error in Test " + variation_name);
  }
})();