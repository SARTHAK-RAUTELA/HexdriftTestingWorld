(function () {
    try {
        var debug = 1;
        var variation_name = "cre-t-2-Availability_Badge_Control";

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

        /* ---------------- GA FUNCTION ---------------- */
        function trackGAEvent(eventCategory, eventAction, eventLabel) {
            if ("ga" in window && "getAll" in window.ga) {
                ga.getAll()[0].send("event", {
                    eventCategory: eventCategory,
                    eventAction: eventAction,
                    eventLabel: eventLabel
                });
            }
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



            // / Button 1: Telehealth
            helper.live('#hero .elementor-widget-button [href="https://app.13sick.com.au/request-consult?isTelehealth=true"]', "click", function () {
                window._conv_q = window._conv_q || [];
                if (isBadgeEligibleTime()) {
                    _conv_q.push(["triggerConversion", "100037480"]);
                    console.log("Convert Goal Fired: Telehealth Eligible Time");
                } else {
                    _conv_q.push(["triggerConversion", "100037481"]);
                    console.log("Convert Goal Fired: Telehealth NOT Eligible Time");
                }
            });

            // Button 2: Home Visit
            helper.live('#hero .elementor-widget-button [href="https://app.13sick.com.au/request-consult/?isHomeVisit=true"]', "click", function () {
                window._conv_q = window._conv_q || [];
                if (isBadgeEligibleTime()) {
                    _conv_q.push(["triggerConversion", "100037482"]);
                    console.log("Convert Goal Fired: Home Visit Eligible Time");
                } else {
                    _conv_q.push(["triggerConversion", "100037483"]);
                    console.log("Convert Goal Fired: Home Visit NOT Eligible Time");
                }
            });
        }

        /* ---------------- RUN ---------------- */
        helper.waitForElement(
            "#hero > .e-con-inner .e-child > div:nth-child(2) p",
            init,
            50,
            15000
        );

    } catch (e) {
        console.log(e, "error in Test cre-t-2-Availability_Badge");
    }
})();