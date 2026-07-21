/* Optimizely "Experiment JS" (shared, runs before per-variation JS).
   Provides device-conditional trigger gating for CRE-T-08:
   Desktop -> exit intent, Mobile -> 20s timer. Cookie guard prevents re-fire. */
function trigger(activate, options) {
  (function () {
    try {
      var MOBILE_DELAY_SECONDS = 20;
      var variation_name = "cre-t-08";
      // Cookie & Session Helper Functions
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
      function setSessionCookie() {
        document.cookie = variation_name + "=modal-triggered; path=/";
      }
      function getSession(key) {
        return sessionStorage.getItem(key);
      }
      function setSession(key, value) {
        sessionStorage.setItem(key, value);
      }
      // Wait for Element
      function waitForElement(selector, trigger, delayInterval, delayTimeout) {
        var interval = setInterval(function () {
          if (document && document.querySelector(selector) && document.querySelectorAll(selector).length > 0) {
            clearInterval(interval);
            trigger();
          }
        }, 50);
        setTimeout(function () {
          clearInterval(interval);
        }, 15000);
      }
      function executeActivation() {
        if (getCookie(variation_name) === "modal-triggered") {
          return;
        }
        if (!window.isOptimizelyExpTriggered_cre_t_08) {
          window.isOptimizelyExpTriggered_cre_t_08 = true;
          // Optimizely Activate auto
          activate();
          setSessionCookie();
        }
      }
      var pageURL = window.location.pathname;
      var page = window.location.href;
      function activateCurrentExp() {
        if (getCookie(variation_name) === "modal-triggered") {
          return;
        }
        var isMobile = window.innerWidth < 768;
        if (isMobile) {
          // Mobile: 20 sec
          var sessionKey = variation_name + "-target-time";
          var sessionValue = getSession(sessionKey);
          if (!sessionValue) {
            var triggerTime = new Date().getTime() + MOBILE_DELAY_SECONDS * 1000;
            setSession(sessionKey, triggerTime);
          }
          var mobileInterval = setInterval(function () {
            var currentTime = new Date().getTime();
            var targetTime = parseInt(getSession(sessionKey), 10);
            if (currentTime >= targetTime) {
              clearInterval(mobileInterval);
              executeActivation();
            }
          }, 1000);
        } else {
          // Desktop: Handle Exit Intent
          var exitIntentHandler = function (e) {
            if (!e.toElement && !e.relatedTarget && e.clientY <= 10) {
              executeActivation();
            }
          };
          document.addEventListener("mouseout", exitIntentHandler);
        }
      }
      waitForElement("body", activateCurrentExp, 50, 15000);
    } catch (e) {
      console.log(e, "VariationCreT08TriggerError");
    }
  })();
}
