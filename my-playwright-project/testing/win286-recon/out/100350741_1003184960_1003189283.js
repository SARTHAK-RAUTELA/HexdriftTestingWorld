function(convertContext){ 
// 286 ACTIVATION
(function () {
    try {
        var debug = 1;
        var variation_name = "creT286Activation";

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
                if (window.CRE286_helpers) {
                    clearInterval(interval);
                    trigger();
                }
            }, delayInterval);
            setTimeout(function () {
                clearInterval(interval);
            }, delayTimeout);
        }

        function activate(cohort) {
            if (!window.experiment286AlreadyActivated) {
                window.experiment286AlreadyActivated = true;
                window.test_286_Experiment = 1;
                window.CRE286_helpers.setActiveCohort(cohort);
                if (cohort === 2) window.CRE286_helpers.markCohort2Shown();
                window._conv_q = window._conv_q || [];
                window._conv_q.push(["executeExperiment", "100350738"]); // need to add trigger id
                if (debug) console.log("Test " + variation_name + " Activated — Cohort " + cohort);
            }
        }

        async function checkAllConditionsAndActivate() {
            var cohort = await window.CRE286_helpers.getQualifyingCohort();
            if (cohort) activate(cohort);
        }

        function init() {
            waitForHelpers(function () {
                // Register the bridge deployment's real-time activity check pings.
                window.CRE286_helpers.recheckNow = checkAllConditionsAndActivate;

                setTimeout(checkAllConditionsAndActivate, 3000);

                // Catches a tab that's been idle 1h+ without a reload, once it regains focus.
                document.addEventListener('visibilitychange', function () {
                    if (!document.hidden && !window.experiment286AlreadyActivated) {
                        checkAllConditionsAndActivate();
                    }
                });
            });

            if (!window.testcreT286_event) {
                window.testcreT286_event = true;
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