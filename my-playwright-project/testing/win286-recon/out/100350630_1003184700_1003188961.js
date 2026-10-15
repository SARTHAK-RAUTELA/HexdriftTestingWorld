function(convertContext){ 
// 276 ACTIVATION
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

        function activate(cohort) {
            if (!window.experiment276AlreadyActivated) {
                window.experiment276AlreadyActivated = true;
                window.test_276_Experiment = 1;
                window.CRE276_helpers.setActiveCohort(cohort);
                if (cohort === 2) window.CRE276_helpers.markCohort2Shown();
                window._conv_q = window._conv_q || [];
                window._conv_q.push(["executeExperiment", "100350628"]);
                if (debug) console.log("Test " + variation_name + " Activated — Cohort " + cohort);
            }
        }

        async function checkAllConditionsAndActivate() {
            var cohort = await window.CRE276_helpers.getQualifyingCohort();
            if (cohort) activate(cohort);
        }

        function init() {
            waitForHelpers(function () {
                // Register the bridge deployment's real-time activity check pings.
                window.CRE276_helpers.recheckNow = checkAllConditionsAndActivate;

                setTimeout(checkAllConditionsAndActivate, 3000);

                // Catches a tab that's been idle 1h+ without a reload, once it regains focus.
                document.addEventListener('visibilitychange', function () {
                    if (!document.hidden && !window.experiment276AlreadyActivated) {
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
}