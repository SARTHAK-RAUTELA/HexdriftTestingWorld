(function () {
  try {
    /* Main Variables */
    var debug = 0;
    var variation_name = "cre-t-99-custom-goals";

    /* Helper Library */
    var _$;
    !(function (factory) {
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
        eq: function (n) {
          this.value = [this.value[n]];
          return this;
        },
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
      };
      return function (selector) {
        return new bm(selector);
      };
    });
    var helper = _$();

    /* Live Event Listener */
    function live(selector, event, callback, context) {
      function addEvent(el, type, handler) {
        if (el.attachEvent) el.attachEvent("on" + type, handler);
        else el.addEventListener(type, handler);
      }
      this &&
        this.Element &&
        (function (ElementPrototype) {
          ElementPrototype.matches =
            ElementPrototype.matches ||
            ElementPrototype.matchesSelector ||
            ElementPrototype.webkitMatchesSelector ||
            ElementPrototype.msMatchesSelector ||
            function (selector) {
              var node = this,
                nodes = (node.parentNode || node.document).querySelectorAll(selector),
                i = -1;
              while (nodes[++i] && nodes[i] != node);
              return !!nodes[i];
            };
        })(Element.prototype);
      function live(selector, event, callback, context) {
        addEvent(context || document, event, function (e) {
          var found,
            el = e.target || e.srcElement;
          while (el && el.matches && el !== context && !(found = el.matches(selector))) el = el.parentElement;
          if (found) callback.call(el, e);
        });
      }
      live(selector, event, callback, context);
    }

    function init() {
      // SWF99 - Clicks on Review Badge (control)
      live(".cre-t-76-review-top", "click", function () {
        //GOAL CODE HERE
        window._conv_q = window._conv_q || [];
        _conv_q.push(["triggerConversion", "100037376"]);
      });

      // SWF99 - hover on Review Badge (control)
      live(".cre-t-76-review-top", "mouseover", function () {
        //GOAL CODE HERE
        window._conv_q = window._conv_q || [];
        _conv_q.push(["triggerConversion", "100037376"]);
      });

      // _________________________________________________________
      // _________________________________________________________
      // _________________________________________________________
      // SWF99 - Clicks on Review Badge (variation)
      live(".cre-t-99-review-top", "click", function () {
        //GOAL CODE HERE
        window._conv_q = window._conv_q || [];
        _conv_q.push(["triggerConversion", "100037376"]);
      });

      // SWF99 - hover on Review Badge (variation)
      live(".cre-t-99-review-top", "mouseover", function () {
        //GOAL CODE HERE
        window._conv_q = window._conv_q || [];
        _conv_q.push(["triggerConversion", "100037376"]);
      });

      // SWF99 - Review Summary Overlay Opens (variation Mobile)
      live(".cre-t-99-review-top", "click", function () {
        if (window.innerWidth < 992) {
          var parent = this.closest(".cre-t-99-container");
          setTimeout(() => {
            if (parent && parent.classList.contains("cre-t-99-dropdown-active")) {
              //GOAL CODE HERE
              window._conv_q = window._conv_q || [];
              _conv_q.push(["triggerConversion", "100037377"]);
            }
          }, 300);
        }
      });

      // SWF99 - Review Summary Overlay Opens (variation Desktop)
      live(".cre-t-99-review-top", "mouseover", function () {
        if (window.innerWidth > 991) {
          //GOAL CODE HERE
          window._conv_q = window._conv_q || [];
          _conv_q.push(["triggerConversion", "100037377"]);
        }
      });

      // SWF99 - SWF99 - Clicks on “Ranking Methodology” Link in Overlay (variation)
      live(".cre-t-99-dropdown-bottom-link", "click", function () {
        //GOAL CODE HERE
        window._conv_q = window._conv_q || [];
        _conv_q.push(["triggerConversion", "100037378"]);
      });
    }

    helper.waitForElement(
      "#comparison-section",
      function () {
        if (!window.Goal_99_added) {
          init();
          window.Goal_99_added = true;
        }
      },
      25,
      25000,
    );

    /* Wait for Element to Load and Initialize */
  } catch (e) {
    if (debug) console.log(e, "Error in Test " + variation_name);
  }
})();