(function () {
    try {
        var debug = 1;
        var variation_name = "cre-t-276-deployment";
        var ONE_HOUR_MS = 60 * 60 * 1000;
        var ACTIVITY_THROTTLE_MS = 5000;
        var COOKIE_EXPIRY_DAYS = 30;

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

        function setSessionCookie(name, value) {
            document.cookie = `${name}=${value}; path=/;`;
        }

        function setPersistentCookie(name, value, days) {
            var expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
            document.cookie = `${name}=${value}; expires=${expires}; path=/;`;
        }

        function clearCookie(name) {
            document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        }

        function getCookie(name) {
            const value = `; ${document.cookie}`;
            const parts = value.split(`; ${name}=`);
            if (parts.length === 2) return parts.pop().split(';').shift();
        }

        function live(selector, event, callback, context) {
            if (typeof callback !== "function") return;
            context = context || document;
            context.addEventListener(event, function (e) {
                var el = e.target.closest(selector);
                if (el && context.contains(el)) {
                    callback.call(el, e);
                }
            });
        }

        // ---- Cohort 1 signal: checkout link/button click ----
        function trackCheckoutClick() {
            live('a[href="/checkout"]', 'mousedown', function () {
                setSessionCookie('cre_276_checkout_visited', 'true');
                setPersistentCookie('cre276_checkout_reached_ever', 'true', COOKIE_EXPIRY_DAYS);
            });
        }

        // ---- Shared cart eligibility check: exactly one WinkBed, no Frost Cooling Cover ----
        async function cartMeetsMattressCondition() {
            try {
                const cart = await fetch('/cart.js').then(res => res.json());
                if (!cart || !cart.items || !cart.items.length) return false;

                const winkbedItems = cart.items.filter(item =>
                    item.title.toLowerCase().includes('winkbed')
                );
                if (winkbedItems.length !== 1) return false;

                const item = winkbedItems[0];
                if (item.quantity !== 1) return false;

                const hasFrostCooling = /frost\s*cooling\s*cover/i.test(item.variant_title);
                return !hasFrostCooling;
            } catch (e) {
                if (debug) console.log(e, 'error checking cart in ' + variation_name);
                return false;
            }
        }

        // ---- Session timestamp: seeded and refreshed only by activity, once tracking is armed ----
        function getSessionTs() {
            var ts = getCookie('cre276_session_ts');
            return ts ? parseInt(ts, 10) : null;
        }

        function setSessionTs(ts) {
            setPersistentCookie('cre276_session_ts', ts.toString(), COOKIE_EXPIRY_DAYS);
        }

        function isNewSession() {
            var ts = getSessionTs();
            if (!ts) return false;
            return (Date.now() - ts) >= ONE_HOUR_MS;
        }

        // ---- Cohort 2 dedupe: don't show twice within the same qualifying event ----
        function cohort2AlreadyShown() {
            return getCookie('cre276_cohort2_shown') === 'true';
        }

        function markCohort2Shown() {
            setPersistentCookie('cre276_cohort2_shown', 'true', COOKIE_EXPIRY_DAYS);
        }

        // ---- Resets all Cohort 2 tracking state — called whenever the cart becomes
        // freshly eligible, so a new qualifying event starts clean ----
        function armCohort2Tracking() {
            setPersistentCookie('cre276_cart_added_ts', Date.now().toString(), COOKIE_EXPIRY_DAYS);
            setSessionTs(Date.now());
            clearCookie('cre276_cohort2_shown');
            attachActivityListeners();
        }

        // ---- Clears Cohort 2 tracking state — called whenever the cart becomes
        // ineligible (0 eligible mattresses, 2+, or cover added). Listeners stay
        // attached (cheap, throttled, harmless) but no-op once cart_added_ts is gone,
        // since every downstream check bails on its absence. ----
        function disarmCohort2Tracking() {
            clearCookie('cre276_cart_added_ts');
            clearCookie('cre276_session_ts');
            clearCookie('cre276_cohort2_shown');
        }

        function getCartAddedTs() {
            var ts = getCookie('cre276_cart_added_ts');
            return ts ? parseInt(ts, 10) : null;
        }


        function attachActivityListeners() {
            if (window.cre276ActivityAttached) return;
            window.cre276ActivityAttached = true;

            var lastTick = 0;

            function handleActivity() {
                var now = Date.now();
                if (now - lastTick < ACTIVITY_THROTTLE_MS) return;
                lastTick = now;

                if (!getCartAddedTs()) return; // no qualifying add has ever happened

                var ts = getSessionTs();
                if (!ts) {
                    setSessionTs(now);
                    return;
                }

                if ((now - ts) < ONE_HOUR_MS) {
                    setSessionTs(now);
                    return;
                }

                (async function () {
                    if (window.CRE276_helpers && typeof window.CRE276_helpers.recheckNow === 'function') {
                        await window.CRE276_helpers.recheckNow();
                    }
                    setSessionTs(now);
                })();
            }

            ['mousemove', 'keydown', 'scroll'].forEach(function (evt) {
                window.addEventListener(evt, handleActivity, { passive: true });
            });
        }

        // ---- Cohort 2 signal: eligible mattress added to cart ----
        // Only ever WRITES cart_added_ts, at the moment of a real add. Never reads
        // or clears it — eligibility is always re-checked fresh downstream instead.
        function trackCartAdd() {
            var CART_ENDPOINTS = ['/cart/add.js', '/cart/add', '/cart/change.js', '/cart/update.js'];
            var origFetch = window.fetch;
            window.fetch = function (...args) {
                var url = typeof args[0] === 'string' ? args[0] : (args[0] && args[0].url) || '';
                var isCartMutation = CART_ENDPOINTS.some(function (e) { return url.indexOf(e) !== -1; });
                var promise = origFetch.apply(this, args);

                if (isCartMutation) {
                    promise.then(function (res) {
                        if (res && res.ok) {
                            cartMeetsMattressCondition().then(function (eligible) {
                                if (eligible && !getCartAddedTs()) {
                                    setPersistentCookie('cre276_cart_added_ts', Date.now().toString(), COOKIE_EXPIRY_DAYS);
                                    setSessionTs(Date.now());
                                    clearCookie('cre276_cohort2_shown');
                                    attachActivityListeners();
                                }
                            });
                        }
                    }).catch(function () { });
                }
                return promise;
            };
        }

        // ---- Single shared cohort evaluation — everything except cart_added_ts is
        // re-derived live, every time this runs ----
        async function getQualifyingCohort() {
            var checkoutSignal = cameFromCheckout();
            var cartAddedTs = getCartAddedTs();

            if (!checkoutSignal && !cartAddedTs) return null;

            var cartOk = await cartMeetsMattressCondition(); // always live, never assumed

            if (checkoutSignal && cartOk) return 1;

            if (cartAddedTs && !hasReachedCheckoutEver() && isNewSession() && cartOk && !cohort2AlreadyShown()) {
                return 2;
            }

            return null;
        }

        // ---- Shared read-only helpers ----
        function cameFromCheckout() {
            return getCookie('cre_276_checkout_visited') === 'true';
        }

        function hasReachedCheckoutEver() {
            return getCookie('cre276_checkout_reached_ever') === 'true';
        }

        function removeCheckoutCookie() {
            clearCookie('cre_276_checkout_visited');
        }

        function getActiveCohort() {
            return getCookie('cre276_active_cohort') || null;
        }

        function setActiveCohort(cohort) {
            setSessionCookie('cre276_active_cohort', String(cohort));
        }

        function init() {
            if (!window.cre_276_deployment_event) {
                window.cre_276_deployment_event = true;
                trackCheckoutClick();
                trackCartAdd();

                if (getCartAddedTs()) {
                    attachActivityListeners();
                }

                window.CRE276_helpers = {
                    cameFromCheckout: cameFromCheckout,
                    hasReachedCheckoutEver: hasReachedCheckoutEver,
                    getCartAddedTs: getCartAddedTs,
                    isNewSession: isNewSession,
                    cartMeetsMattressCondition: cartMeetsMattressCondition,
                    removeCheckoutCookie: removeCheckoutCookie,
                    getQualifyingCohort: getQualifyingCohort,
                    getActiveCohort: getActiveCohort,
                    setActiveCohort: setActiveCohort,
                    markCohort2Shown: markCohort2Shown,
                    recheckNow: null // populated by activation.js once it initializes
                };
            }
            if (debug) console.log(variation_name + " initialized");
        }

        waitForElement("body", init, 50, 15000);
    } catch (e) {
        if (debug) console.log(e, "error in Test " + variation_name);
    }
})();