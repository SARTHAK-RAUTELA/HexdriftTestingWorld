function trigger(activate, options) {
  (function () {
    try {
      var variation_name = "cre-t-13";

      // Cookie Helper Functions
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

      function executeActivation(reason) {
        if (getCookie(variation_name) === "modal-triggered") {
          return;
        }

        if (!window.isOptimizelyExpTriggered_cre_t_13) {
          window.isOptimizelyExpTriggered_cre_t_13 = true;
          window.optimizely_trigger_reason_cre_t_13 = reason;

          // Optimizely Activate auto
          activate();
          setSessionCookie();
        }
      }

      function activateCurrentExp() {
        if (getCookie(variation_name) === "modal-triggered") {
          return;
        }

        var isMobile = window.innerWidth < 768;

        if (isMobile) {
          return;
        } else {

          // Exit Intent Logic only — no timer
          var exitIntentHandler = function (e) {
            if (!e.toElement && !e.relatedTarget && e.clientY <= 10) {
              executeActivation("exit_intent"); // Reason: exit_intent
              document.removeEventListener("mouseout", exitIntentHandler);
            }
          };
          document.addEventListener("mouseout", exitIntentHandler);
        }
      }

      waitForElement("body", activateCurrentExp, 50, 15000);
    } catch (e) {
      console.log(e, "ControlCreT13TriggerError");
    }
  })();
}
