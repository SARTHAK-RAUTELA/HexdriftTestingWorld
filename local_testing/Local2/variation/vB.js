(function () {
  try {
    var debug = 1;
    var variation_name = "cre-t-3";

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
      };

      return function (selector) {
        return new bm(selector);
      };
    });

    var helper = _$();

    /* ---------------- INIT ---------------- */
    function init() {
      document.body.classList.add(variation_name);

      document.querySelectorAll('#hero > .e-con-inner [data-id="66f5f73"] .elementor-button-text')
        .forEach(function (el) {
          el.innerHTML = el.innerHTML.replace('Book Telehealth', 'Speak to a doctor now');
        });

      document.querySelectorAll('#hero > .e-con-inner [data-id="51ac959"] .elementor-button-text')
        .forEach(function (el) {
          el.innerHTML = el.innerHTML.replace('Request Home Visit', 'Request Home Visit now');
        });
    }

    /* ---------------- RUN ---------------- */
    helper.waitForElement(
      ".elementor-button-text",
      init,
      50,
      15000
    );

  } catch (e) {
    console.log(e, "error in Test cre-t-3");
  }
})();