function(convertContext){ 
(function () {
    try {
        var debug = 0;
        var variation_name = "cre-t-270-GoalCode";

        function waitForElement(selector, trigger, delayInterval = 50, delayTimeout = 15000) {
            var interval = setInterval(function () {
                if (document && document.querySelector(selector) && document.querySelectorAll(selector).length > 0) {
                    clearInterval(interval);
                    trigger(document.querySelector(selector));
                }
            }, delayInterval);
            setTimeout(function () {
                clearInterval(interval);
            }, delayTimeout);
        }

        function live(selector, event, callback, context = document) {
            const addEvent = (el, type, handler) => {
                el.addEventListener(type, handler);
            };

            const liveHandler = e => {
                const el = e.target && e.target.closest ? e.target.closest(selector) : null;

                if (el && el !== context) {
                    callback.call(el, e);
                }
            };

            addEvent(context, event, liveHandler);
        }

        function init() {
            // WIN270 - Clicks on Firmness Level Drop-Down (control) or Change Firmness Link (Variation)
            live('#firmness-select', 'change', function () {
                console.log('firmness option selected')
                window._conv_q = window._conv_q || [];
                window._conv_q.push(["triggerConversion", "100334728"]);

                // WIN270 - Softer, Firmer or Plus Firmness Level Selected
                if (this.value == 'Plus' || this.value == 'Softer' || this.value == 'Firmer') {
                    console.log('plus, softer, firmer is selected')
                    window._conv_q = window._conv_q || [];
                    window._conv_q.push(["triggerConversion", "100334729"]);
                }
            })

            live('.cre-t-270-firm-change-text', 'click', function () {
                console.log('firmness selected')
                window._conv_q = window._conv_q || [];
                window._conv_q.push(["triggerConversion", "100334728"]);
            })

        }

        /* Initialize variation */
        if (!window.Test270GoalCodeAdded) {
            window.Test270GoalCodeAdded = true;
            waitForElement("body", init);
        }

    } catch (e) {
        if (debug) console.log(e, "error in Test " + variation_name);
    }
})();
}