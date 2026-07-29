
// 252 actiavtion

(function () {
    try {
        /* main variables */
        var debug = 1;
        var variation_name = "custom-trigger-252";
        let options = {
            isActive: false, // Initial state
        };
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
        function isMobileDevice() {
            return window.innerWidth <= 768;
        }
        function initTest() {
            if (options.isActive) return;
            // Wait for element helper
            function activate() {
                if (!window.experiment252AlreadyActivated) {
                    window.experiment252AlreadyActivated = true;
                    window.test_252_Experiment = 1;
                    window._conv_q = window._conv_q || [];
                    window._conv_q.push(["executeExperiment", "100350099"]);
                    console.log("Test creT252 Activated");
                    console.log("Test creT252 Activated");
                }
            }
            // Define your callback activation function
            function activateTest() {
                options.isActive = true;
                activate();
            }

            // Binds Swiper's native "slideChange" event, but only once `.swiper` is actually
            // attached to the element - on first sight of the DOM node the Swiper instance may not
            // have been constructed yet, so a single immediate check (as before) could silently miss
            // the binding forever. Polls up to ~5s for the instance to show up.
            function bindSwiperSlideChangeActivation(swiperEl) {
                if (!swiperEl || swiperEl.dataset.creT252SlideChangeBound) return;
                swiperEl.dataset.creT252SlideChangeBound = "1";
                var attemptsLeft = 50;
                (function tryBind() {
                    if (swiperEl.swiper && typeof swiperEl.swiper.on === "function") {
                        swiperEl.swiper.on("slideChange", activateTest);
                        return;
                    }
                    if (--attemptsLeft <= 0) return;
                    setTimeout(tryBind, 100);
                })();
            }

            // Direct drag-gesture detection: fires as soon as a click-and-hold (mouse) or touch
            // press moves past a small threshold, independent of whether/when Swiper's own
            // "slideChange" event fires. This is what actually covers "click and hold and slide"
            // for both mouse (desktop) and touch (mobile) in one listener, since PointerEvent
            // unifies both input types.
            function bindDragActivation(el) {
                if (!el || el.dataset.creT252DragBound) return;
                el.dataset.creT252DragBound = "1";
                var DRAG_THRESHOLD = 10; // px
                var startX = 0, startY = 0, tracking = false, firedForThisPress = false;

                function point(e) {
                    return e.touches && e.touches.length ? e.touches[0] : e;
                }
                function onStart(e) {
                    tracking = true;
                    firedForThisPress = false;
                    var p = point(e);
                    startX = p.clientX;
                    startY = p.clientY;
                }
                function onMove(e) {
                    if (!tracking || firedForThisPress) return;
                    var p = point(e);
                    if (Math.abs(p.clientX - startX) > DRAG_THRESHOLD || Math.abs(p.clientY - startY) > DRAG_THRESHOLD) {
                        firedForThisPress = true;
                        activateTest();
                    }
                }
                function onEnd() {
                    tracking = false;
                }

                el.addEventListener("pointerdown", onStart, { passive: true });
                el.addEventListener("pointermove", onMove, { passive: true });
                el.addEventListener("pointerup", onEnd, { passive: true });
                el.addEventListener("pointercancel", onEnd, { passive: true });
                // Touch fallback for browsers/webviews where Pointer Events don't behave as expected.
                el.addEventListener("touchstart", onStart, { passive: true });
                el.addEventListener("touchmove", onMove, { passive: true });
                el.addEventListener("touchend", onEnd, { passive: true });
            }

            function bindAllCarouselTriggers(swiperEl) {
                bindSwiperSlideChangeActivation(swiperEl);
                bindDragActivation(swiperEl);
            }

            // On-page main carousel (#gallery-top-images) is shared by desktop + mobile.
            function bindGalleryTopSlideChangeActivation() {
                waitForElement(".gallery-top", bindAllCarouselTriggers);
            }

            // The zoom icon opens a lightbox/modal that contains its own image slider, built fresh
            // into the DOM at click time. Watch for any swiper container appearing after that click
            // and wire up the same drag + slideChange triggers on it too.
            function observeForModalSwipers() {
                if (!window.MutationObserver) return;
                function startObserving(targetNode) {
                    var observer = new MutationObserver(function (mutations) {
                        mutations.forEach(function (mutation) {
                            mutation.addedNodes && mutation.addedNodes.forEach(function (node) {
                                if (!(node instanceof HTMLElement)) return;
                                if (node.classList && node.classList.contains("swiper-container")) {
                                    bindAllCarouselTriggers(node);
                                }
                                if (node.querySelectorAll) {
                                    node.querySelectorAll(".swiper-container").forEach(bindAllCarouselTriggers);
                                }
                            });
                        });
                    });
                    observer.observe(targetNode, { childList: true, subtree: true });
                }
                // document.body can still be null if this script runs while <head> is being parsed,
                // before earlier injections crashed the whole trigger-setup block: observer.observe(null, ...)
                // throws, and that exception used to propagate out of initTest() entirely, aborting every
                // trigger below it - including the ones that previously worked fine.
                if (document.body) {
                    startObserving(document.body);
                } else {
                    waitForElement("body", startObserving);
                }
            }

            // Zoom icon click: opens the lightbox carousel on both desktop and mobile - clicking it
            // should activate immediately, and dragging the slider inside the modal it opens should
            // activate too (handled by observeForModalSwipers()).
            function bindZoomIconActivation() {
                waitForElement(".cre-lightbox-icon.img-zoom.prod-detail__imgs__zoom", function (element) {
                    element.addEventListener("click", activateTest, { once: true });
                });
            }

            // Each trigger is set up independently, in its own try/catch: one selector/DOM surprise
            // on a live third-party page must never be able to take the other triggers down with it,
            // the way a single uncaught throw above used to abort the rest of initTest().
            function safeSetup(fn) {
                try {
                    fn();
                } catch (setupError) {
                    if (debug) console.log(setupError, "error setting up a trigger in " + variation_name);
                }
            }

            safeSetup(observeForModalSwipers);
            safeSetup(bindZoomIconActivation);

            if (isMobileDevice()) {
                // Mobile trigger 1: dragging/sliding the on-page carousel image
                safeSetup(bindGalleryTopSlideChangeActivation);

                // Mobile trigger 2: tapping a thumbnail (including thumbnails injected later by vB.js)
                safeSetup(function () {
                    document.addEventListener("click", function (e) {
                        if (e.target.closest(".gallery-thumbs .swiper-slide")) {
                            activateTest();
                        }
                    });
                });
            } else {
                // Desktop trigger 1: a grid item is clicked to open the lightbox carousel
                safeSetup(function () {
                    waitForElement(".cre-t-251-grid-main .cre-t-251-grid-item ", function () {
                        document.querySelectorAll(".cre-t-251-grid-main .cre-t-251-grid-item").forEach(function (item) {

                            item.addEventListener("click", activateTest, { once: true });

                        });
                    });
                });

                // Desktop trigger 2: dragging/sliding the on-page carousel image
                safeSetup(bindGalleryTopSlideChangeActivation);

                // Desktop trigger 3: clicking the on-page carousel's next/prev arrow
                safeSetup(function () {
                    document.addEventListener("click", function (e) {
                        if (e.target.closest(".cre-t-251-scroller-next, .cre-t-251-scroller-prev")) {
                            activateTest();
                        }
                    });
                });
            }
        }
        if (!window.testcreT252_observer) {
            window.testcreT252_observer = true;
            initTest();
        }
    } catch (e) {
        if (debug) console.log(e, "error in Test" + variation_name);
    }

})();