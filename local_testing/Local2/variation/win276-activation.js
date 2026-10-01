(function () {
    try {
        var debug = 1;
        var variation_name = "creT276Activation";

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

        function waitForHelpers(trigger, delayInterval = 50, delayTimeout = 10000) {
            var interval = setInterval(function () {
                if (window.CRE276_helpers) {
                    clearInterval(interval);
                    trigger();
                }
            }, delayInterval);
            setTimeout(function () {
                clearInterval(interval);
            }, delayTimeout);
        }

        var COHORT2_SHOWN_COOKIE = 'cre276_c2_shown';

        function getCookie(name) {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
        }

        function setPersistentCookie(name, value, days) {
            var expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
            document.cookie = `${name}=${value}; expires=${expires}; path=/;`;
        }

        // Shopify's own localStorage marker that a checkout session exists (same check as WIN257) — BUG-07
        function hasCheckoutSessionIdentifier() {
            try {
                const ui = JSON.parse(localStorage.getItem('__ui') || '{}');
                return !!(ui && ui[2] && ui[2][0] && ui[2][0].checkoutSessionIdentifier);
            } catch (e) {
                if (debug) console.log(e, 'error parsing __ui in ' + variation_name);
                return false;
            }
        }

        function qualifiesForCohort1(cartOk) {
            return window.CRE276_helpers.cameFromCheckout() && hasCheckoutSessionIdentifier() && cartOk;
        }

        // Excludes on hasReachedCheckoutEver() (persistent) rather than the consumable
        // session cookie, so a user who already saw the Cohort 1 modal — or whose
        // browser session ended — can't fall through into Cohort 2.
        function qualifiesForCohort2(cartOk) {
            if (!window.CRE276_helpers.getCartAddedTs()) return false;
            if (window.CRE276_helpers.hasReachedCheckoutEver()) return false;
            if (getCookie(COHORT2_SHOWN_COOKIE) === 'true') return false; // one showing per 30 days — BUG-04
            if (!window.CRE276_helpers.isNewSession()) return false;

            return cartOk;
        }

        function activate() {
            if (!window.experiment276AlreadyActivated) {
                window.experiment276AlreadyActivated = true;
                window.test_276_Experiment = 1;
                window._conv_q = window._conv_q || [];
                window._conv_q.push(["executeExperiment", "100350628"]);
                if (debug) console.log("Test " + variation_name + " Activated");
            }
        }

        async function checkAllConditionsAndActivate() {
            var cameFromCheckout = window.CRE276_helpers.cameFromCheckout();
            var cartAddedTs = window.CRE276_helpers.getCartAddedTs();

            if (!cameFromCheckout && !cartAddedTs) return;

            var cartOk = await window.CRE276_helpers.cartMeetsMattressCondition();

            var cohort1 = qualifiesForCohort1(cartOk);
            var cohort2 = cohort1 ? false : qualifiesForCohort2(cartOk);

            if (!cohort1 && !cohort2) return;
            // Marked at bucketing time in both arms, so Control and Variation Cohort 2 users are capped alike.
            if (cohort2) setPersistentCookie(COHORT2_SHOWN_COOKIE, 'true', 30);
            activate();
        }

        function init() {
            // The Variation times the Cohort 2 modal 5s from this moment (page load, or the return to the tab) — BUG-03
            window.CRE276_triggerAt = 0;

            waitForHelpers(function () {
                setTimeout(checkAllConditionsAndActivate, 3000);

                //re-evaluate if the tab regains focus without a
                // full reload (e.g. user backgrounds the tab for 1h+, then switches back
                // to it rather than navigating). Only matters if not already activated.
                document.addEventListener('visibilitychange', function () {
                    if (!document.hidden && !window.experiment276AlreadyActivated) {
                        window.CRE276_triggerAt = performance.now();
                        checkAllConditionsAndActivate();
                    }
                });
            });

            if (!window.testcreT276_event) {
                window.testcreT276_event = true;
                window.addEventListener('pageshow', function (event) {
                    if (event.persisted) {
                        waitForElement('.pop-cart__close', function () {
                            document.querySelector('.pop-cart__close').click();
                        });
                        window.CRE276_triggerAt = performance.now();
                        waitForHelpers(function () {
                            setTimeout(checkAllConditionsAndActivate, 3000);
                        });
                    }
                });
            }
        }

        waitForElement('body', init, 25, 10000);

    } catch (e) {
        if (debug) console.log(e, "error in Test " + variation_name);
    }
})();