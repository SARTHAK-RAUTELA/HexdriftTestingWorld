(function () {
  try {
    /* main variables */
    var debug = 1;
    var variation_name = "Control";

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

    function setupClinicValidation(iframeDoc) {
      if (iframeDoc._cret21ControlValidation) return;
      iframeDoc._cret21ControlValidation = true;

      var BTN_SEL       = '[data-testid="request-consult__next-step-button"]';
      var INPUT_SEL     = '#practice-search-by-name input[role="combobox"]';
      var LABEL_SEL     = '#practice-search-by-name #practice-label';
      var CONTAINER_SEL = '#practice-search-by-name .MuiOutlinedInput-root';

      function injectErrorStyles(iframeDoc) {
        if (iframeDoc.getElementById("cre-t-21-control-styles")) return;
        var style = iframeDoc.createElement("style");
        style.id = "cre-t-21-control-styles";
        style.textContent = [
          "#practice-search-by-name .cre-t-21-field-error .MuiOutlinedInput-notchedOutline { border-color: rgb(234,72,72) !important; border-width: 2px !important; }",
          "#practice-search-by-name .cre-t-21-field-error:hover .MuiOutlinedInput-notchedOutline { border-color: rgb(234,72,72) !important; }",
          "#practice-search-by-name .cre-t-21-field-error.Mui-focused .MuiOutlinedInput-notchedOutline { border-color: rgb(234,72,72) !important; }",
          "#practice-search-by-name .cre-t-21-field-error, #practice-search-by-name .cre-t-21-field-error:hover { background-color: transparent !important; }",
        ].join(" ");
        iframeDoc.head.appendChild(style);
      }

      function showError() {
        injectErrorStyles(iframeDoc);
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

          // Rules from source: IsNotEmpty (phone), IsDateString (dob = 10 chars DD/MM/YYYY),
          // Equals(true) for attended + terms. consentToShareWithGP is NOT required.
          var phone    = iframeDoc.querySelector('input[name="userName"]');
          var dob      = iframeDoc.querySelector('input[id="secondaryUserName"]');
          var attended = iframeDoc.querySelector('input[name="hasAttendedPracticeIn12Months"]');
          var terms    = iframeDoc.querySelector('input[name="termsAndConditionsAccepted"]');

          var reactReady = (
            phone    && /^04\d{8}$/.test(phone.value.trim()) &&
            dob      && dob.value.trim().length === 10       &&
            attended && attended.checked                     &&
            terms    && terms.checked
          );

          if (reactReady) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
          }
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
          setupClinicValidation(iframeDoc);
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