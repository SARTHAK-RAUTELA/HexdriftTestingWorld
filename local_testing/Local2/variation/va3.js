(function () {
    var debug = false;
    var variation_name = "bm_preset_jobs_pro_lp";

    var HERO_SECTION = '[class*="pro-signup-hero_heroSection"]';
    var HERO_TITLE = '[class*="pro-signup-hero_heroTitle"]';
    var HERO_SUBHEAD = '[class*="pro-signup-hero_heroSubhead"]';
    var HOW_IT_WORKS = '[class*="how-tt-works_section"]';

    var NEW_TITLE_PREFIX = 'Grow your business in ';
    var NEW_SUBHEAD = '5M customers in the last 12 months on Thumbtack';

    var IMG_DIRECT = 'https://cdn.optimizely.com/img/20611073899/e633b72a9df34774998491e5d4f6934d.png';
    var IMG_PRESET = 'https://cdn.optimizely.com/img/20611073899/f9723f4c525749e8a6a135d0537c6b6e.png';

    var ARROW_SVG = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true"><path d="M7 1.5v10.5M2.5 7.5 7 12l4.5-4.5" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    var barHTML =
        '<div class="bm-hiw-bar">' +
            '<div class="bm-hiw-bar__btn">' +
                '<span class="bm-hiw-bar__text">Show up in search, or claim available jobs. </span>' +
                '<button type="button" class="bm-hiw-bar__cta">See how it works <span class="bm-hiw-bar__arrow">' + ARROW_SVG + '</span></button>' +
            '</div>' +
        '</div>';

    function cardHTML(img, alt, title, desc) {
        return '<div class="bm-two-ways__card">' +
            '<img class="bm-two-ways__img" src="' + img + '" alt="' + alt + '" loading="lazy">' +
            '<div class="bm-two-ways__copy">' +
                '<h3 class="bm-two-ways__card-title">' + title + '</h3>' +
                '<p class="bm-two-ways__card-desc">' + desc + '</p>' +
            '</div>' +
        '</div>';
    }

    var sectionHTML =
        '<section class="bm-two-ways" id="bm-two-ways">' +
            '<div class="bm-two-ways__head">' +
                '<h2 class="bm-two-ways__title">Two ways to get hired</h2>' +
                '<p class="bm-two-ways__sub">Stand out in search, or skip the back-and-forth with jobs you can claim right away.</p>' +
            '</div>' +
            '<div class="bm-two-ways__cards">' +
                cardHTML(IMG_DIRECT, 'Deck refinishing job with a quote request', 'Customers find you',
                    'They see your profile in search and message you about their project. You set your own prices and schedule.') +
                cardHTML(IMG_PRESET, 'TV mounting job available to claim', 'Claim available jobs',
                    'Some jobs come with the details and earnings already set. Pick the ones you want, with no bidding.') +
            '</div>' +
            '<div class="bm-two-ways__footer">' +
                '<button type="button" class="bm-two-ways__signup">Sign up for free</button>' +
                '<p class="bm-two-ways__note">Claimable jobs are available in select areas and services.</p>' +
            '</div>' +
        '</section>';

    // Smooth-scroll to an element, then keep correcting until it actually lands at the top.
    // The native page shifts while scrolling (sticky search bar / collapsing elements on mobile),
    // so a single scrollTo with a precomputed target overshoots. The selector is re-queried on
    // every check because React can re-mount the target mid-scroll.
    function scrollToEl(selector, done) {
        var el = document.querySelector(selector);
        if (!el) return;
        window.scrollTo({ top: el.getBoundingClientRect().top + window.pageYOffset, behavior: 'smooth' });

        var lastY = -1;
        var corrections = 0;
        var started = Date.now();
        var check = setInterval(function () {
            var y = window.pageYOffset;
            if (y !== lastY) {
                lastY = y; // still scrolling
                if (Date.now() - started < 3000) return;
            }
            var target = document.querySelector(selector);
            var offset = target ? target.getBoundingClientRect().top : 0;
            if (Math.abs(offset) > 2 && corrections < 3 && Date.now() - started < 3000) {
                corrections++;
                lastY = -1;
                window.scrollTo({ top: y + offset, behavior: 'smooth' });
                return;
            }
            clearInterval(check);
            if (done) done();
        }, 150);
    }

    // Keep the existing hero form/functionality; only swap the copy.
    // React can re-render the hero, so this is re-applied on an interval.
    function updateHeroCopy() {
        var h1 = document.querySelector(HERO_TITLE);
        if (h1 && h1.textContent.indexOf(NEW_TITLE_PREFIX) !== 0) {
            var match = h1.textContent.match(/\bin\s+(.+?)\.?\s*$/);
            if (match) h1.textContent = NEW_TITLE_PREFIX + match[1];
        }
        var sub = document.querySelector(HERO_SUBHEAD);
        if (sub && sub.textContent !== NEW_SUBHEAD) sub.textContent = NEW_SUBHEAD;
    }

    function addBar() {
        var hero = document.querySelector(HERO_SECTION);
        if (!hero || document.querySelector('.bm-hiw-bar')) return;
        hero.insertAdjacentHTML('afterend', barHTML);
    }

    function addTwoWaysSection() {
        var hiw = document.querySelector(HOW_IT_WORKS);
        if (!hiw || document.querySelector('.bm-two-ways')) return;
        hiw.insertAdjacentHTML('afterend', sectionHTML);
    }

    // Delegated event binding so handlers survive React re-renders of the injected markup.
    function live(selector, event, callback, context) {
        (context || document).addEventListener(event, function (e) {
            var el = e.target && e.target.closest ? e.target.closest(selector) : null;
            if (el) callback.call(el, e);
        });
    }

    function bindEvents() {
        // Guard so listeners are only attached once, even if the variation code runs again.
        if (window.bmPresetJobsProLpEvents) return;
        window.bmPresetJobsProLpEvents = true;

        live('.bm-hiw-bar__cta', 'click', function () {
            scrollToEl('.bm-two-ways');
        });

        // Bottom CTA reuses the existing hero signup flow: scroll up and click the hero "Sign up" button.
        // The hero has separate desktop/mobile buttons, so click the visible one. It is queried after the
        // scroll settles; the one present at click time may be detached by then.
        live('.bm-two-ways__signup', 'click', function () {
            scrollToEl(HERO_SECTION, function () {
                var buttons = document.querySelectorAll(HERO_SECTION + ' [class*="pro-signup-hero_searchFields"] button');
                for (var i = 0; i < buttons.length; i++) {
                    if (buttons[i].offsetParent !== null) {
                        buttons[i].click();
                        return;
                    }
                }
            });
        });
    }

    function init() {
        document.body.classList.add(variation_name);
        bindEvents();

        var interval = setInterval(function () {
            updateHeroCopy();
            addBar();
            addTwoWaysSection();
        }, 50);

        // Failsafe: stop checking after 10 seconds.
        setTimeout(function () {
            clearInterval(interval);
        }, 10000);
    }

    try {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
        } else {
            init();
        }
    } catch (e) {
        if (debug) console.log(e, "error in Test" + variation_name);
    }
})();