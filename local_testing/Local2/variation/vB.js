(function () {
  try {
    var debug = 1;
    var variation_name = "Availability_Badge";
    /* ---------------- HELPER ---------------- */
    var _$;
    (function (factory) {
      _$ = factory();
    })(function () {
      var bm = function (s) {
        if (typeof s === "string") {
          this.value = Array.prototype.slice.call(document.querySelectorAll(s));
        }
        if (typeof s === "object") {
          this.value = [s];
        }
      };
      bm.prototype = {
        each: function (fn) {
          [].forEach.call(this.value, fn);
          return this;
        },
        waitForElement: function (selector, trigger, delayInterval, delayTimeout) {
          var interval = setInterval(function () {
            if (_$(selector).value.length) {
              clearInterval(interval);
              trigger();
            }
          }, delayInterval);
          setTimeout(function () {
            clearInterval(interval);
          }, delayTimeout);
        },
        live: function (selector, event, callback, context) {
          function addEvent(el, type, handler) {
            if (el.attachEvent) el.attachEvent("on" + type, handler);
            else el.addEventListener(type, handler);
          }
          Element.prototype.matches =
            Element.prototype.matches ||
            Element.prototype.webkitMatchesSelector ||
            Element.prototype.msMatchesSelector;
          addEvent(context || document, event, function (e) {
            var el = e.target;
            while (el && el !== document) {
              if (el.matches(selector)) {
                callback.call(el, e);
                break;
              }
              el = el.parentElement;
            }
          });
        }
      };
      return function (selector) {
        return new bm(selector);
      };
    });
    var helper = _$();
   
    /* ---------------- TIME LOGIC ---------------- */
    function shouldShowBadge() {
      var now = new Date();
      var hour = now.getHours();
      var day = now.getDay();
      if (day >= 1 && day <= 5) {
        return !(hour >= 8 && hour < 17);
      }
      if (day === 6) {
        return !(hour >= 8 && hour < 12);
      }
      return true;
    }
    function isBadgeEligibleTime() {
      var now = new Date();
      var hour = now.getHours();
      var day = now.getDay();
      if (day >= 1 && day <= 5) {
        return hour >= 8 && hour < 17;
      }
      if (day === 6) {
        return hour >= 8 && hour < 12;
      }
      return false;
    }
    /* ---------------- INIT ---------------- */
    function init() {
      document.body.classList.add(variation_name);
    
     /* ---------------- CONVERT GOALS TRACKING ---------------- */
      helper.live(".availability-badge", "click", function () {
        window._conv_q = window._conv_q || [];
        _conv_q.push(["triggerConversion", "100037484"]); 
      });
      // Book Telehealth
      helper.live('#hero .elementor-widget-button [href="https://app.13sick.com.au/request-consult?isTelehealth=true"]', "click", function () {
        window._conv_q = window._conv_q || [];
        if (isBadgeEligibleTime()) {
          // Eligible Time
          _conv_q.push(["triggerConversion", "100037480"]);
        } else {
          // NOT Eligible Time
          _conv_q.push(["triggerConversion", "100037481"]);
        }
      });
      // Request Home Visit
      helper.live('#hero .elementor-widget-button [href="https://app.13sick.com.au/request-consult/?isHomeVisit=true"]', "click", function () {
        window._conv_q = window._conv_q || [];
        if (isBadgeEligibleTime()) {
          // Eligible Time
          _conv_q.push(["triggerConversion", "100037482"]);
        } else {
          // NOT Eligible Time
          _conv_q.push(["triggerConversion", "100037483"]);
        }
      });
    }
    /* ---------------- RUN ---------------- */
    helper.waitForElement(
      "body",
      init,
      50,
      15000
    );
  } catch (e) {
    console.log(e, "error in Test cre-t-2-Availability_Badge");
  }