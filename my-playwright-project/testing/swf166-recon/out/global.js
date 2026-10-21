function(convertContext){ 
// Cro Mode (QA Test cookie)
(function() {
    // Utility Functions
    function setCookie(name, value, options = {}) {
        let {
            duration,
            domain,
            sameSite = 'Lax'
        } = options;
        domain = domain || window.location.hostname.split('.').slice(-2).join('.');
        let expires = '';
        if (duration) {
            let date = new Date();
            date.setTime(date.getTime() + (duration * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = `${name}=${value}; Path=/; Domain=${domain}; SameSite=${sameSite}${expires}`;
    }

    function getCookie(name) {
        let nameEQ = name + "=";
        let ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) == ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }
    // Extract QA mode logic
    function enableQAMode(mode) {
        if (mode === 'qa') {
            console.log(`CRO Mode enabled: ${mode}`);
            setCookie('cro_mode', mode, {
                duration: 1
            });
        } else {
            // console.log('CRO Mode disabled');
            setCookie('cro_mode', '', {
                duration: -1
            });
        }
    }
    // Initialize CRO Mode
    function initCROMode() {
        const urlParams = new URLSearchParams(window.location.search);
        let mode = urlParams.get('cro_mode') || getCookie('cro_mode');
        if (mode === 'qa') {
            enableQAMode(mode);
            // console.log("QA Mode Active");
            // Place any QA mode specific logic here
        } else {
            enableQAMode('');
        }
    }
    initCROMode();
})();

//The following code has been added to the site for custom activities of the test, setting data attributes on the page body for developer events and A/B testing
(function() {
    try {
        var debug = 1;

        /**
         * setup Team
         */
        // LIBRARY FUNCTIONS
        var lib = {
            waitForElement(selector, trigger, delayInterval, delayTimeout) {
                var interval = setInterval(function() {
                    if (document && document.querySelector(selector) && document.querySelectorAll(selector).length > 0) {
                        clearInterval(interval);
                        trigger();
                    }
                }, delayInterval);
                setTimeout(function() {
                    clearInterval(interval);
                }, delayTimeout);
            },
        };

        lib.waitForElement(
            "body",
            function() {
                // The following code will help in developing the test.
                if (document && document.querySelector && document.querySelector("body")) {
                    document.querySelector("body").dataset.path = window.location.pathname;
                }
            },
            50,
            15000
        );
    } catch (e) {
        if (debug) console.log(e, "Error in Global JavaScript");
    }
})();

//The code below added for the custom events setup

(function() {
    try {
        /* main variables */
        var debug = 1;
        var variation_name = "swiftGoals";

        function live(selector, event, callback, context) {
            /****Helper Functions****/
            // helper for enabling IE 8 event bindings
            function addEvent(el, type, handler) {
                if (el.attachEvent) el.attachEvent("on" + type, handler);
                else el.addEventListener(type, handler);
            }
            // matches polyfill
            this &&
                this.Element &&
                (function(ElementPrototype) {
                    ElementPrototype.matches =
                        ElementPrototype.matches ||
                        ElementPrototype.matchesSelector ||
                        ElementPrototype.webkitMatchesSelector ||
                        ElementPrototype.msMatchesSelector ||
                        function(selector) {
                            var node = this,
                                nodes = (node.parentNode || node.document).querySelectorAll(selector),
                                i = -1;
                            while (nodes[++i] && nodes[i] != node);
                            return !!nodes[i];
                        };
                })(Element.prototype);
            // live binding helper using matchesSelector
            function live(selector, event, callback, context) {
                addEvent(context || document, event, function(e) {
                    var found,
                        el = e.target || e.srcElement;
                    while (el && el.matches && el !== context && !(found = el.matches(selector))) el = el.parentElement;
                    if (found) callback.call(el, e);
                });
            }
            live(selector, event, callback, context);
        }

        function waitForElement(selector, trigger) {
            var interval = setInterval(function() {
                if (document && document.querySelector(selector) && document.querySelectorAll(selector).length > 0) {
                    clearInterval(interval);
                    trigger();
                }
            }, 50);
            setTimeout(function() {
                clearInterval(interval);
            }, 15000);
        }

        function pushConvertGoal(goalId) {
            window._conv_q = window._conv_q || [];
            _conv_q.push(["triggerConversion", goalId]);
        }

        function CustomGoals() {
            // Outbound Partner Clicks (all outbound clicks on all partners)
            live("body .rt-aff-link", "mousedown", function() {
                console.log("Outbound Partner Clicks (all outbound clicks on all partners)  ");
                pushConvertGoal("100036136");
            });

            // Outbound Partner Clicks - Liberty Mutual - Both Listings
            live('[data-unique="outbound-partner-clicks-Liberty-Mutual-Listing-Only"] a.rt-aff-link', "mousedown", function() {
                console.log("Outbound Partner Clicks - Liberty Mutual - Both Listings");
                pushConvertGoal("100036137");
            });

            // Outbound Partner Clicks - Liberty Mutual - Top Listing Only
            live('[data-unique="comparison-table"] [data-unique="outbound-partner-clicks-Liberty-Mutual-Listing-Only"] a.rt-aff-link', "mousedown", function() {
                console.log("Outbound Partner Clicks - Liberty Mutual - Top Listing Only");
                pushConvertGoal("100036138");
            });

            // Outbound Partner Clicks - Liberty Mutual - Bottom Listing Only
            live('[data-unique="best-overall"] [data-unique="outbound-partner-clicks-Liberty-Mutual-Listing-Only"] a.rt-aff-link', "mousedown", function() {
                console.log("Outbound Partner Clicks - Liberty Mutual - Bottom Listing Only");
                pushConvertGoal("100036139");
            });

            // Outbound Partner Clicks  - Lemonade
            live('[data-unique="outbound-partner-clicks-Lemonade-Listing-Only"] a.rt-aff-link', "mousedown", function() {
                console.log("Outbound Partner Clicks  Lemonade");
                pushConvertGoal("100036140");
            });


            // Outbound Partner Clicks - State Farm
            live('[data-unique="outbound-partner-clicks-State-Farm-Listing-Only"] a.rt-aff-link', "mousedown", function() {
                console.log("Outbound Partner Clicks - State Farm");
                pushConvertGoal("100036141");
            });

            // Outbound Partner Clicks - USAA
            live('[data-unique="outbound-partner-clicks-USAA-Listing-Only"] a.rt-aff-link', "mousedown", function() {
                console.log("Outbound Partner Clicks - USAA");
                pushConvertGoal("100036142");
            });

            // Outbound Partner Clicks - Farmers Rental Insurance
            live('[data-unique="outbound-partner-clicks-Farmers-Listing-Only"] a.rt-aff-link', "mousedown", function() {
                console.log("Outbound Partner Clicks - Farmers Rental Insurance");
                pushConvertGoal("100036143");
            });

            // Outbound Partner Clicks - Progressive

            live('[data-unique="outbound-partner-clicks-Progressive-Listing-Only"] a.rt-aff-link', "mousedown", function() {
                console.log("Outbound Partner Clicks - Progressive");
                pushConvertGoal("100036144");
            });

            // Outbound Partner Clicks - Allstate

            live('[data-unique="outbound-partner-clicks-Allstate-Listing-Only"] a.rt-aff-link', "mousedown", function() {
                console.log("Outbound Partner Clicks - Allstate");
                pushConvertGoal("100036145");
            });

        


        }

        waitForElement("body", function() {
            console.log("body found goals added");
            if (!window.TheSwiftestGoalsAdded) {
                CustomGoals();
                window.TheSwiftestGoalsAdded = true;
            }
        });
    } catch (e) {
        if (debug) console.log(e, "error in Test" + variation_name);
    }
})();
}