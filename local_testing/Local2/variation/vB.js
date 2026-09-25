(function () {
    try {
        /* Main variables */
        var debug = 0;
        var variation_name = "tt-williams-partner-lp"; // Variation name for tracking

        /*
         * 2026-09 rebuild: thumbtack.com/pro was redesigned (pro-signup-hero_*, how-tt-works_*,
         * how-tt-different_*, pro-tools_*, pro-results_*, earnings-calculator_*, pro-community_*).
         * "How Thumbtack works", the comparison table, the testimonials, the Growth Calculator and the
         * community banner are now native, so this variation reuses them and only applies the
         * Sherwin-Williams changes instead of injecting duplicate sections.
         */
        var SEL = {
            heroImage: '[class*="pro-signup-hero_heroImage"]',
            heroTitle: '[class*="pro-signup-hero_heroTitle"]',
            heroSubhead: '[class*="pro-signup-hero_heroSubhead"]',
            heroFootnote: '[class*="pro-signup-hero_footnote"]',
            resultsSection: '[class*="pro-results_section"]',
            communitySection: '[class*="pro-community_section"]'
        };

        var HERO_IMAGE = "https://cdn.optimizely.com/img/20611073899/9b3ea47e17c04f96b2892b6a48a30e62.png";
        var SUBHEAD = "Receive up to $400 in free or discounted leads when you set up your profile as a Sherwin-Williams pro.**";
        var SUCCESS_TIPS_URL = "https://info.thumbtack.com/scale-with-confidence?utm_source=partner&utm_medium=partnerships&utm_campaign=sherwinwilliams";
        var BOOK_CALL_URL = "https://www.thumbtack.com/sales?utm_source=spa-sherwinwilliams&utm_medium=partnership&utm_campaign=sw-ycbm";

        var TESTIMONIALS = [
            {
                img: "https://cdn.optimizely.com/img/20611073899/ddcb9bf943e44ce698bdbc45101727a8.png",
                quote: "“I've tried many platforms, but Thumbtack is the only one I've consistently used for the past seven years because our goals are aligned—they succeed when I do.”",
                name: "— Juliano Da Cruz, Paint Lab Painting"
            },
            {
                img: "https://cdn.optimizely.com/img/20611073899/4cb900ee0360411baa4c157bdac32dee.png",
                quote: "“Thumbtack has helped me expand from a part time business to full time.”",
                name: "— Shaqueal Thomas, Courteney's Paints"
            },
            {
                img: "https://cdn.optimizely.com/img/20611073899/e15f8076b4cd4899bf86ec6141504773.png",
                quote: "“We invest our marketing budgets in different streams, but the best return we get is from Thumbtack.”",
                name: "— Rafael Rodriguez, Dambrak Painting"
            }
        ];

        var partnerLineHTML =
            '<p class="tt-sw-partner-line">In partnership with Sherwin-Williams. ' +
            '<a href="' + BOOK_CALL_URL + '">Book a call with our team.</a></p>';

        var afterCommunityHTML = `
  <div class="tt-sw-after-community">
    <div class="TT_updatetext">
      <p>**Total maximum value of free or discounted leads equivalent to $400. To be eligible, pros must (i) activate their Thumbtack account with targeting preferences set and a valid form of payment, and (ii) add at least one review to the Thumbtack pro profile. After receiving 2-requests, pro will receive 25% off their leads until they hit the next $250 in discounted leads. Lead credits are not refundable. Your Thumbtack balance doesn’t expire, has no cash value, and is subject to Thumbtack’s <a href="https://www.thumbtack.com/terms">Terms of Use.</a></p>
    </div>
    <div class="testimonial-line"></div>
    <section class="faq-section">
      <h2 class="faq-title">FAQs</h2>
      <div class="faq-list">
        <div class="faq-item">
          <p class="faq-question">What is the Sherwin-Williams lead credit benefit?</p>
          <p class="faq-answer">As a Sherwin-Williams pro, you can receive up to $400 in Thumbtack lead credits just for being part of the program — $150 the moment you sign up, plus additional credits as you spend on leads.</p>
        </div>
        <div class="faq-item">
          <p class="faq-question">Do I need to do anything to get my first $150?</p>
          <p class="faq-answer">No. Your $150 in lead credits is automatically added to your Thumbtack account as soon as you sign up through the Sherwin-Williams program. No code, no form, no minimum spend required.</p>
        </div>
        <div class="faq-item">
          <p class="faq-question">How do I earn the additional credits?</p>
          <p class="faq-answer">As you spend on leads, you'll receive up to $65 in bonus credits at each of the following milestones:</p>
          <div class="milestone-table-wrapper">
            <table class="milestone-table">
              <thead>
                <tr><th>Total lead spend</th><th>Bonus credits</th></tr>
              </thead>
              <tbody>
                <tr><td>$250 spent</td><td>+$65</td></tr>
                <tr><td>$500 spent</td><td>+$65</td></tr>
                <tr><td>$750 spent</td><td>+$65</td></tr>
                <tr><td>$1000 spent</td><td>+$55</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <div class="faq-item">
          <p class="faq-question">How much can I earn in total?</p>
          <p class="faq-answer">Up to <strong>$400 in lead credits</strong> — $150 upfront plus up to $250 in milestone credits as you spend.</p>
        </div>
        <div class="faq-item">
          <p class="faq-question">How long do I have to earn the milestone credits?</p>
          <p class="faq-answer">There's no expiration on hitting the milestones. As long as you're an active Thumbtack pro in the Sherwin-Williams program, your cumulative lead spend counts toward each threshold.</p>
        </div>
        <div class="faq-item">
          <p class="faq-question">Can I use credits on any lead?</p>
          <p class="faq-answer">Yes — your credits apply to any lead on Thumbtack.</p>
        </div>
      </div>
    </section>
  </div>`;

        /* All Pure helper functions */
        // Function to wait for an element to appear in the DOM
        function waitForElement(selector, trigger, delayInterval, delayTimeout) {
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

        // Rewrites an element's text without detaching React's text nodes: the first text node gets
        // the new value, any others are emptied. React keeps updating the same nodes, and the
        // observer below re-applies the copy if React writes its own text back (e.g. geo city update).
        function setText(el, text) {
            if (!el || el.textContent === text) return;
            var nodes = [];
            for (var i = 0; i < el.childNodes.length; i++) {
                if (el.childNodes[i].nodeType === 3) nodes.push(el.childNodes[i]);
            }
            if (!nodes.length || nodes.length !== el.childNodes.length) {
                el.textContent = text;
                return;
            }
            nodes[0].nodeValue = text;
            for (var j = 1; j < nodes.length; j++) nodes[j].nodeValue = "";
        }

        /* Variation changes (all idempotent, re-run on every DOM mutation) */
        function updateHero() {
            var imageWrap = document.querySelector(SEL.heroImage);
            if (imageWrap && !imageWrap.querySelector(".section_topimage")) {
                imageWrap.insertAdjacentHTML("afterbegin",
                    '<div class="section_topimage"><img src="' + HERO_IMAGE + '" alt="Painting supplies"></div>');
            }

            // Keep the geo-personalised city from the native H1: "Find more customers in New York."
            var title = document.querySelector(SEL.heroTitle);
            if (title) {
                var match = title.textContent.match(/\bin\s+(.+)$/);
                setText(title, match ? "Grow your business in " + match[1] : "Grow your business.");
            }

            setText(document.querySelector(SEL.heroSubhead), SUBHEAD);

            var footnote = document.querySelector(SEL.heroFootnote);
            if (footnote && !(footnote.nextElementSibling && footnote.nextElementSibling.classList.contains("tt-sw-partner-line"))) {
                var stale = document.querySelector(".tt-sw-partner-line");
                if (stale) stale.parentNode.removeChild(stale);
                footnote.insertAdjacentHTML("afterend", partnerLineHTML);
            }
        }

        function updateResults() {
            var section = document.querySelector(SEL.resultsSection);
            if (!section) return;
            setText(section.querySelector("h2"), "Real results from real painters.");
            var cards = section.querySelectorAll('[class*="pro-results_card"]:not(img)');
            for (var i = 0; i < cards.length && i < TESTIMONIALS.length; i++) {
                var t = TESTIMONIALS[i];
                var img = cards[i].querySelector("img");
                if (img && img.getAttribute("src") !== t.img) {
                    img.setAttribute("src", t.img);
                    img.removeAttribute("srcset");
                    img.setAttribute("alt", t.name.replace(/^—\s*/, ""));
                }
                var texts = cards[i].querySelectorAll("p");
                setText(texts[0], t.quote);
                setText(texts[1], t.name);
            }
        }

        function updateCommunity() {
            var section = document.querySelector(SEL.communitySection);
            if (!section) return;
            section.classList.add("tt-sw-community");
            setText(section.querySelector("h2"), "Get tips for success on Thumbtack.");
            setText(section.querySelector("p"), "Find out how to successfully complete jobs on Thumbtack.");
            var cta = section.querySelector("a");
            if (cta) {
                if (cta.getAttribute("href") !== SUCCESS_TIPS_URL) cta.setAttribute("href", SUCCESS_TIPS_URL);
                setText(cta.querySelector("span") || cta, "Get success tips");
            }
            if (!(section.nextElementSibling && section.nextElementSibling.classList.contains("tt-sw-after-community"))) {
                var stale = document.querySelector(".tt-sw-after-community");
                if (stale) stale.parentNode.removeChild(stale);
                section.insertAdjacentHTML("afterend", afterCommunityHTML);
            }
        }

        function applyChanges() {
            document.body.classList.add(variation_name);
            if (document.title !== "Sherwin-Williams-Thumbtack") document.title = "Sherwin-Williams-Thumbtack";
            updateHero();
            updateResults();
            updateCommunity();
        }

        /* Variation Init */
        function init() {
            applyChanges();

            // Next.js hydrates / re-renders after load (and geo-IP can update the city), which can
            // put native copy back. Re-apply on mutation; every step no-ops once already applied.
            var queued = false;
            var observer = new MutationObserver(function () {
                if (queued) return;
                queued = true;
                requestAnimationFrame(function () {
                    queued = false;
                    try { applyChanges(); } catch (e) { if (debug) console.log(e, "error in Test" + variation_name); }
                });
            });
            observer.observe(document.body, { childList: true, subtree: true, characterData: true });
        }

        waitForElement(SEL.heroTitle, function () {
            try { init(); } catch (e) { if (debug) console.log(e, "error in Test" + variation_name); }
        }, 50, 15000);
    } catch (e) {
        if (debug) console.log(e, "error in Test" + variation_name); // Log errors if debug is enabled
    }
})();
