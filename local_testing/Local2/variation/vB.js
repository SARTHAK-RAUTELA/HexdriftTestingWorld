(function () {
  try {
    var debug = 1;
    var variation_name = "cre-t-32";

    var config = {
      stepSelector: '[data-telehealth="step_8_Waiting_Room"]',
      iframeSelector: "#mobile-viewport",
      targetSelectorForSvg: ".MuiBox-root svg",
      buttonSelector: ".MuiButton-root",
      intervalDelay: 400,
      timeout: 30000,
      styleId: "cre-t-32-style",

      // CLIENT REQUIREMENT: Change this number to update the countdown duration easily
      hideDurationMinutes: 10,
    };

    // This CSS hides the targeted layout box containing the button and extra notice copy
    var styleCSS = `
      .cre-t-32 .cre-t-32-1 ~ div {
          display: none !important;
      }
    `;

    // --------- Persistent Cookie Management ----------
    function getCookie(cname) {
      var match = document.cookie.match(new RegExp("(^| )" + cname + "=([^;]+)"));
      if (match) return match[2];
      return "";
    }

    function setLandingCookie() {
      var cookieName = variation_name + "-land-time";
      if (!getCookie(cookieName)) {
        var currentTimestamp = Date.now().toString();
        var d = new Date();
        d.setTime(d.getTime() + 24 * 60 * 60 * 1000);
        document.cookie = cookieName + "=" + currentTimestamp + "; expires=" + d.toUTCString() + "; path=/";
        if (debug) console.log("New landing timestamp captured:", currentTimestamp);
      }
    }

    function getRemainingTime() {
      var landingTime = parseInt(getCookie(variation_name + "-land-time"), 10);
      if (isNaN(landingTime)) return 0;

      var totalHideDurationMs = config.hideDurationMinutes * 60 * 1000;
      var timeElapsed = Date.now() - landingTime;
      return totalHideDurationMs - timeElapsed;
    }
    // -------------------------------------------------

    function waitForElement(selector, callback, interval, timeout) {
      interval = interval || 50;
      timeout = timeout || 15000;
      var start = Date.now();

      var timer = setInterval(function () {
        var el = document.querySelector(selector);
        if (el) {
          clearInterval(timer);
          callback(el);
          return;
        }
        if (Date.now() - start > timeout) {
          clearInterval(timer);
        }
      }, interval);
    }

    function getIframe() {
      var step = document.querySelector(config.stepSelector);
      var iframe = null;
      if (step) iframe = step.querySelector(config.iframeSelector);
      if (!iframe) iframe = document.querySelector(config.iframeSelector);
      return iframe;
    }

    function getIframeDoc(iframe) {
      try {
        if (!iframe) return null;
        var doc = iframe.contentDocument || (iframe.contentWindow && iframe.contentWindow.document) || null;
        return doc;
      } catch (e) {
        return null;
      }
    }

    function injectStyles(doc) {
      if (!doc || !document.querySelector(config.stepSelector)) return;

      var head = doc.head || doc.getElementsByTagName("head")[0];
      if (!head) return;

      var existingStyle = doc.getElementById(config.styleId);
      if (existingStyle) return;

      var style = doc.createElement("style");
      style.id = config.styleId;
      style.type = "text/css";
      style.textContent = styleCSS;
      head.appendChild(style);
      if (debug) console.log("Hiding styles injected successfully into iframe.");
    }

    function removeStyles(doc) {
      if (!doc) return;
      var existingStyle = doc.getElementById(config.styleId);
      if (existingStyle) {
        existingStyle.remove();
        if (debug) console.log("Hiding styles removed. Button is visible again.");
      }
    }

    function processElements() {
      var iframe = getIframe();
      var doc = getIframeDoc(iframe);

      if (!doc) {
        return false;
      }

      var button = doc.querySelector(config.buttonSelector);
      var svgElements = doc.querySelectorAll(config.targetSelectorForSvg);

      if (button && svgElements.length >= 2) {
        svgElements.forEach(function (svgElement, index) {
          var parentBox = svgElement.closest(".MuiBox-root");
          if (!parentBox) return;

          var outerBox = parentBox.parentElement;
          if (outerBox && outerBox.classList.contains("MuiBox-root")) {
            var newClass = "cre-t-32-" + index;
            if (!outerBox.classList.contains(newClass)) {
              outerBox.classList.add(newClass);
              if (debug) console.log("Added structural wrapper class:", newClass);
            }
          }
        });
        return true;
      } else {
        return false;
      }
    }

    function init() {
      var stepElement = document.querySelector(config.stepSelector);
      if (!stepElement) return;

      setLandingCookie();

      var remainingMs = getRemainingTime();

      if (remainingMs <= 0) {
        if (debug) console.log("User landed, but lock window has already expired. Doing nothing.");
        return;
      }

      if (!stepElement.classList.contains(variation_name)) {
        stepElement.classList.add(variation_name);
      }

      var lastLoggedSeconds = -1;

      // 3. Dynamic Loop with strict kill switches
      var liveTimerInterval = setInterval(function () {
        var currentStepElement = document.querySelector(config.stepSelector);

        // KILL SWITCH 1: Step component vanished (User changed views)
        if (!currentStepElement) {
          if (debug) console.log("Kill Switch: Step element no longer on screen. Clearing interval loop.");
          clearInterval(liveTimerInterval);
          return;
        }

        var iframe = getIframe();
        var doc = getIframeDoc(iframe);

        // KILL SWITCH 2: Iframe context was detached or destroyed
        if (!iframe) {
          if (debug) console.log("Kill Switch: Iframe element dropped from DOM. Clearing interval loop.");
          clearInterval(liveTimerInterval);
          return;
        }

        var currentRemainingMs = getRemainingTime();
        var currentRemainingSec = Math.ceil(currentRemainingMs / 1000);

        if (debug && currentRemainingSec > 0 && (currentRemainingSec % 5 === 0 || lastLoggedSeconds === -1) && currentRemainingSec !== lastLoggedSeconds) {
          console.log("Lock active. Remaining time until button appears: " + currentRemainingSec + "s");
          lastLoggedSeconds = currentRemainingSec;
        }

        // KILL SWITCH 3: Dynamic Countdown Complete
        if (currentRemainingMs <= 0) {
          console.log("--- Time is up! Executing deep-clean class removal ---");

          if (currentStepElement.classList.contains(variation_name)) {
            currentStepElement.classList.remove(variation_name);
            if (debug) console.log("Removed '" + variation_name + "' from main page element.");
          }

          if (doc) {
            var taggedElements = doc.querySelectorAll('[class*="cre-t-32-"]');
            taggedElements.forEach(function (element) {
              for (var i = element.classList.length - 1; i >= 0; i--) {
                var className = element.classList[i];
                if (className.indexOf("cre-t-32-") === 0) {
                  element.classList.remove(className);
                  if (debug) console.log("Removed matching internal class '" + className + "' from iframe element.");
                }
              }
            });

            removeStyles(doc);
          }

          if (debug) console.log("Lock window complete. Clearing interval loop permanently.");
          clearInterval(liveTimerInterval); // Stops the loop completely
          return;
        }

        if (doc) {
          var trackingApplied = processElements();
          if (trackingApplied) {
            injectStyles(doc);
          }
        }
      }, 250);
    }

    waitForElement(config.stepSelector, init, 50, 15000);
  } catch (e) {
    console.log(e, "error in Test");
  }
})();