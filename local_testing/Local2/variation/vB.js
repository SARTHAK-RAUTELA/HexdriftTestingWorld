(function () {
    try {
        /* ─── Main variables ─────────────────────────────────────────────── */
        var debug = 0;
        var variation_name = "Antonio_Roofing";

        /* ─── Helper: waitForElement ─────────────────────────────────────── */
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

        /* ─── Helper: live event delegation ─────────────────────────────── */
        function live(selector, event, callback, context) {
            function addEvent(el, type, handler) {
                if (el.attachEvent) el.attachEvent("on" + type, handler);
                else el.addEventListener(type, handler);
            }
            this &&
                this.Element &&
                (function (ElementPrototype) {
                    ElementPrototype.matches =
                        ElementPrototype.matches ||
                        ElementPrototype.matchesSelector ||
                        ElementPrototype.webkitMatchesSelector ||
                        ElementPrototype.msMatchesSelector ||
                        function (selector) {
                            var node = this,
                                nodes = (node.parentNode || node.document).querySelectorAll(selector),
                                i = -1;
                            while (nodes[++i] && nodes[i] != node);
                            return !!nodes[i];
                        };
                })(Element.prototype);
            function live(selector, event, callback, context) {
                addEvent(context || document, event, function (e) {
                    var found,
                        el = e.target || e.srcElement;
                    while (el && el.matches && el !== context && !(found = el.matches(selector)))
                        el = el.parentElement;
                    if (found) callback.call(el, e);
                });
            }
            live(selector, event, callback, context);
        }

     
        /* ═══════════════════════════════════════════════════════════════════
           DATA
        ═══════════════════════════════════════════════════════════════════ */
        var sectionData = {
           relatedServices: [
  {
    title: "Commercial Roofing",
    link: "/tx/san-antonio/commercial-roofing"
  },
  {
    title: "Gutters",
    link: "/tx/san-antonio/gutters"
  },
  {
    title: "Roof Coating",
    link: "/tx/san-antonio/roof-coating-companies"
  },
  {
    title: "Roof Inspections",
    link: "/tx/san-antonio/roof-inspection-services"
  },
  {
    title: "Roof Installation",
    link: "/tx/san-antonio/roof-installation"
  },
  {
    title: "Roof Repairs",
    link: "/tx/san-antonio/roof-repair"
  },
  {
    title: "Roof Sealing",
    link: "/tx/san-antonio/roof-sealers"
  },
  {
    title: "Roof Vents",
    link: "/tx/san-antonio/roof-vent-installers"
  },
  {
    title: "Rubber Roofs",
    link: "/tx/san-antonio/rubber-roofing-contractors"
  },
  {
    title: "Soffit & Fascia",
    link: "/tx/san-antonio/soffit-and-fascia"
  },
  {
    title: "TPO Roofs",
    link: "/tx/san-antonio/tpo-roofing"
  },
  {
    title: "Tile Roofs",
    link: "/tx/san-antonio/clay-tile-roofing-contractors"
  }
],

            pricingTitle: "How much does roofing cost in San Antonio?",
            pricingDesc: "Roofing costs in San Antonio are driven by local factors: intense hail seasons, high post-storm demand, and Texas-specific building codes. Prices below reflect San Antonio market rates — not national averages.",
            pricingCards: [
                { title: "Roof Inspection (post-storm)",   price: "$150 – $350",      note: "Insurance-grade documentation included" },
                { title: "Minor Repair / Patch",           price: "$300 – $900",      note: "Single section, storm or wear damage" },
                { title: "Partial Replacement",            price: "$2,500 – $6,000",  note: "1–2 roof sections, architectural shingles" },
                { title: "Full Roof Replacement",          price: "$8,500 – $16,000", note: "Average San Antonio home, Class 3 shingles" },
                { title: "Emergency Tarp / Boarding",      price: "$200 – $600",      note: "Immediate storm response" },
                { title: "Gutter Replacement (with roof)", price: "$600 – $2,000",    note: "Often bundled after hail events" }
            ],
            pricingFooter: "Prices are estimates for San Antonio, TX as of 2026. Actual quotes may vary based on home size, roof pitch, materials, and storm season demand. Always get 2–3 quotes before hiring.",

            neighborhoodsTitle: "Neighborhoods and areas served",
            neighborhoodsSubtitle: "Thumbtack pros serve homeowners across the greater San Antonio metro — from the city core to surrounding suburbs and Hill Country communities.",
            neighborhoods: [
                "Alamo Heights","Stone Oak","The Dominion","Helotes",
                "Leon Valley","Shavano Park","Terrell Hills","Castle Hills",
                "Converse","Live Oak","Schertz","New Braunfels",
                "Boerne","Selma","Universal City","Windcrest","Lackland AFB","Pleasanton Rd area","Southside SA","Northside SA",
            ],

            reviewsTitle: "Reviews for San Antonio roofing professionals on Thumbtack",
            reviews: [
                { name: "Ashley B.", company: "Lone Star Roofing Solutions", stars: 5, date: "March 2026",    avatar: "https://fastly.picsum.photos/id/64/48/48.jpg?hmac=uVydLcT-BCqbwY70bLRQZCEbJD5-N4XVHGH1HjLk5Dc", text: "After the April hailstorm I had no idea where to start. Found Lone Star on Thumbtack and within 24 hours they were at my house. They handled the insurance claim, did the full replacement, and cleaned up perfectly. Couldn’t recommend more highly." },
                { name: "Marcus T.", company: "J. Stevens Roofing Co.",       stars: 4, date: "February 2026", avatar: " https://fastly.picsum.photos/id/458/48/48.jpg?hmac=kXwHutV-RrPnlJUkY4U_6Vgy3D9Qwz19bu67STYxiOI", text: "The storm chasers were everywhere in my neighborhood after the hailstorm — knocking on doors, pressuring homeowners. J. Stevens was the only local company I could find. They were honest, professional, and actually based here in SA." },
                { name: "Linda R.",  company: "Legacy Home Improvements",     stars: 5, date: "January 2026",  avatar: " https://fastly.picsum.photos/id/174/48/48.jpg?hmac=PefeAm5oiSJkl6KK7Z0jAnmkUwluJRDQuFX85OYGrcs", text: "Legacy caught hail damage from a storm two years ago that my previous roofer missed. Their documentation was so thorough that my insurance approved the full replacement with no pushback. Incredibly professional." },
                { name: "David K.",  company: "Fast Storm Pro-Roofing",       stars: 5, date: "March 2026",    avatar: "https://fastly.picsum.photos/id/108/48/48.jpg?hmac=xXbvlwgU70zLRiR2JsbuUV7ip8KWHD7Iygaa3j6fEl8",  text: "Emergency call at 10pm — they tarped my roof within 2 hours of calling. Had me fully repaired by the end of the next day. These guys are the real deal for emergency storm response in San Antonio." }
            ],

            whyTitle: "Why hire professionals on Thumbtack?",
            whyItems: [
                { icon: "🔍", heading: "Get to a hire faster.",            desc: "Describe your roofing project in your own words — we match you with the best-fit local pros so you’re not starting from scratch." },
                { icon: "📍", heading: "Only see local, trusted pros.",    desc: "Every pro is identity-verified and background-checked. We only show you San Antonio roofers — not out-of-town contractors looking for storm work." },
                { icon: "🛡️", heading: "A job done right — guaranteed.", desc: "If the job isn’t done as agreed, you could get up to $2,500 back. Terms apply." }
            ],

            faqTitle: "FAQs",
            faqSubtitle: "Answers to commonly asked questions from our community.",
            faqs: [
                { q: "Does homeowners insurance in Texas cover roof damage?",      a: "Yes — Texas homeowners insurance typically covers roof damage caused by hail, wind, and storms (sudden/accidental events). Most policies exclude wear and tear or pre-existing damage. After a major storm, document damage with photos and file a claim promptly. Thumbtack pros are experienced with the Texas insurance process and can provide documentation your adjuster will accept." },
                { q: "Do I need a permit for roof work in San Antonio?",              a: "Yes, the City of San Antonio requires a permit for most roofing work including full replacements. Minor repairs (patching under 100 sq ft) may not require one. Thumbtack pros handle the permitting process as part of the job — always confirm this during your initial quote." },
                { q: "How do I verify a local roofing contractor in San Antonio?",   a: "Check for a valid Texas contractor license, general liability insurance (minimum $300k), and workers' comp if they have employees. Be especially cautious after storms — out-of-town storm chasers often disappear after taking a deposit. Every pro on Thumbtack is identity-verified and screened before being listed." },
                { q: "How much does roof repair cost in San Antonio?",               a: "Minor storm repairs in San Antonio typically range from $300–$900. Partial replacements run $2,500–$6,000. Full roof replacements for a standard San Antonio home average $8,500–$16,000 depending on size, material (3-tab vs. architectural shingles), and accessibility. These are higher than national averages due to demand spikes after hail seasons." },
                { q: "How long does a roof replacement take in San Antonio?",        a: "Most San Antonio homes can be re-roofed in 1–2 days. Larger homes or complex rooflines may take 3–4 days. Post-storm demand can extend scheduling lead times — booking early after a hail event is recommended." },
                { q: "What is the best roofing material for San Antonio’s climate?", a: "Architectural (dimensional) asphalt shingles rated for Class 3 or Class 4 hail resistance are the most popular choice in San Antonio. They offer better protection against the frequent hail storms in the area and may qualify you for an insurance discount. Metal roofing is increasingly popular for its longevity and heat reflection in South Texas summers." }
            ],

            footerCols: [
                {
                    heading: "Related cost information",
                    links: [
                        { label: "Roof cleaning cost",                  href: "/p/roof-cleaning-cost" },
                        { label: "Power washing prices",                href: "/p/power-washing-prices" },
                        { label: "Home inspection cost",                href: "/p/home-inspection-cost" },
                        { label: "Gutter cleaning prices",              href: "/p/gutter-cleaning-prices" },
                        { label: "Roof replacement cost",               href: "/p/roof-replacement-cost" },
                        { label: "Dryer vent installation cost",        href: "/p/dryer-vent-installation-cost" },
                        { label: "How much general contractors charge", href: "/p/how-much-general-contractors-charge" },
                        { label: "Art installation cost",               href: "/p/art-installation-cost" },
                        { label: "Sink repair cost",                    href: "/p/sink-repair-cost" },
                        { label: "Furniture assembly cost",             href: "/p/furniture-assembly-cost" },
                        { label: "Christmas light installation prices", href: "/p/christmas-light-installation-prices" },
                        { label: "AC service cost",                     href: "/p/ac-service-cost" },
                        { label: "Patio cost",                          href: "/p/patio-cost" },
                        { label: "Bed frame assembly cost",             href: "/p/bed-frame-assembly-cost" },
                        { label: "Handyman prices",                     href: "/p/handyman-prices" }
                    ]
                },
                {
                    heading: "Popular in San Antonio",
                    links: [
                        { label: "Electricians San Antonio",                 href: "/tx/san-antonio/electricians" },
                        { label: "Movers San Antonio",                       href: "/tx/san-antonio/movers" },
                        { label: "Cheap lawn care services San Antonio",     href: "/tx/san-antonio/cheap-lawn-care-services" },
                        { label: "Duct cleaning San Antonio",                href: "/tx/san-antonio/duct-cleaning" },
                        { label: "Window air conditioner repair San Antonio",href: "/tx/san-antonio/window-air-conditioner-repair" },
                        { label: "Private investigators San Antonio",        href: "/tx/san-antonio/private-investigators" },
                        { label: "Appliance repair San Antonio",             href: "/tx/san-antonio/appliance-repair" },
                        { label: "House cleaning San Antonio",               href: "/tx/san-antonio/house-cleaning" },
                        { label: "Fitness equipment assembly San Antonio",   href: "/tx/san-antonio/fitness-equipment-assembly" },
                        { label: "Appliance installers San Antonio",         href: "/tx/san-antonio/appliance-installers" },
                        { label: "Affordable photographers San Antonio",     href: "/tx/san-antonio/affordable-photographers" },
                        { label: "Packing services San Antonio",             href: "/tx/san-antonio/packing-services" },
                        { label: "Water softener installation San Antonio",  href: "/tx/san-antonio/water-softener-installation" },
                        { label: "Frigidaire repair San Antonio",            href: "/tx/san-antonio/frigidaire-repair" },
                        { label: "Shrub trimming San Antonio",               href: "/tx/san-antonio/shrub-trimming" }
                    ]
                },
                {
                    heading: "You might also like",
                    links: [
                        { label: "Roofing near me",                     href: "/k/roofing/near-me" },
                        { label: "Roof repair near me",                 href: "/k/roof-repair/near-me" },
                        { label: "Soffit and fascia near me",           href: "/k/soffit-and-fascia/near-me" },
                        { label: "Roof cleaning near me",               href: "/k/roof-cleaning/near-me" },
                        { label: "Metal roof contractors near me",      href: "/k/metal-roof-contractors/near-me" },
                        { label: "General contractors near me",         href: "/k/general-contractors/near-me" },
                        { label: "Rain gutter installers near me",      href: "/k/rain-gutter-installers/near-me" },
                        { label: "Gutter cleaning near me",             href: "/k/gutter-cleaning/near-me" },
                        { label: "Commercial roofing near me",          href: "/k/commercial-roofing/near-me" },
                        { label: "Appraisers near me",                  href: "/k/appraisers/near-me" },
                        { label: "Seamless gutter installation near me",href: "/k/seamless-gutter-installation/near-me" },
                        { label: "Gutters near me",                     href: "/k/gutters/near-me" },
                        { label: "Home inspection near me",             href: "/k/home-inspection/near-me" },
                        { label: "Pressure washing near me",            href: "/k/pressure-washing/near-me" },
                        { label: "Gutter repair near me",               href: "/k/gutter-repair/near-me" }
                    ]
                },
                {
                    heading: "In other nearby areas",
                    links: [
                        { label: "Schertz roofing",        href: "/tx/schertz/roofing" },
                        { label: "New Braunfels roofing",  href: "/tx/new-braunfels/roofing" },
                        { label: "Seguin roofing",         href: "/tx/seguin/roofing" },
                        { label: "San Marcos roofing",     href: "/tx/san-marcos/roofing" },
                        { label: "Kerrville roofing",      href: "/tx/kerrville/roofing" },
                        { label: "Circle C Ranch roofing", href: "/tx/circle-c-ranch/roofing" },
                        { label: "Austin roofing",         href: "/tx/austin/roofing" },
                        { label: "Uvalde roofing",         href: "/tx/uvalde/roofing" },
                        { label: "Cedar Park roofing",     href: "/tx/cedar-park/roofing" },
                        { label: "Pflugerville roofing",   href: "/tx/pflugerville/roofing" },
                        { label: "Round Rock roofing",     href: "/tx/round-rock/roofing" },
                        { label: "Georgetown roofing",     href: "/tx/georgetown/roofing" },
                        { label: "Victoria roofing",       href: "/tx/victoria/roofing" }
                    ]
                }
            ]
        };

        /* ═══════════════════════════════════════════════════════════════════
           HTML BUILDERS  (string concat — no nested template literal issues)
        ═══════════════════════════════════════════════════════════════════ */

        function checkSVG() {
            return '<svg viewBox="0 0 10 8" xmlns="http://www.w3.org/2000/svg"><polyline points="1,4 4,7 9,1"/></svg>';
        }
        function chevronSVG() {
            return '<svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><polyline points="3,5 8,11 13,5"/></svg>';
        }
        function buildStars(n) {
            var html = "";
            for (var i = 0; i < 5; i++) {
                html += '<span class="tt-cr-star">' + (i < n ? "★" : "☆") + "</span>";
            }
            return html;
        }

        /* 1 ── Related Services */
      function buildRelatedServices() {
    var pills = sectionData.relatedServices.map(function (s) {
        return `
            <a href="${s.link}" class="tt-cr-service-pill">
                ${s.title}
                <span class="tt-cr-arrow">
                    <svg height="18" width="18" fill="currentColor" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                        <path d="M6.764 14.646L13 9 6.725 3.311a1 1 0 00-1.482 1.342L10 9l-4.699 4.285c-.187.2-.301.435-.301.715a1 1 0 001 1c.306 0 .537-.151.764-.354z"></path>
                    </svg>
                </span>
            </a>
        `;
    }).join("");

    return `
        <div class="tt-cr-services">
            <div class="tt_container">
                <div class="tt-cr-section-title">Check out some related services</div>
                <div class="tt-cr-section-subtitle">
                    These highly-rated pros offer services related to what you need. You might need help from a few of them for your project.
                </div>
                <div class="tt-cr-services-scroll">${pills}</div>
            </div>
        </div>
    `;
}

        /* 2 ── Pricing */
        function buildPricing() {
            var cards = sectionData.pricingCards.map(function (c) {
                return '<div class="tt-cr-pricing-card">' +
                    '<div class="tt-cr-card-title">' + c.title + '</div>' +
                    '<div class="tt-cr-price">' + c.price + '</div>' +
                    '<div class="tt-cr-card-note">' + c.note + '</div>' +
                    '</div>';
            }).join("");
            return '<div class="tt-cr-pricing-section">' +
                '<div class="tt_container">'+
                '<div class="tt-cr-section-title">' + sectionData.pricingTitle + '</div>' +
                '<p class="tt-cr-pricing-desc">' + sectionData.pricingDesc + '</p>' +
                '<div class="tt-cr-pricing-grid">' + cards + '</div>' +
                '<p class="tt-cr-pricing-footer">' + sectionData.pricingFooter + '</p>' +
                ' </div>'+
                '</div>';
        }

        /* 3 ── Neighborhoods */
        function buildNeighborhoods() {
            var tags = sectionData.neighborhoods.map(function (n) {
                return '<span class="tt-cr-neighborhood-tag"><span class="tt-cr-check-icon">' + checkSVG() + '</span>' + n + '</span>';
            }).join("");
            return '<div class="tt-cr-section">' +
             '<div class="tt_container">'+
                '<div class="tt-cr-section-title">' + sectionData.neighborhoodsTitle + '</div>' +
                '<div class="tt-cr-section-subtitle">' + sectionData.neighborhoodsSubtitle + '</div>' +
                '<div class="tt-cr-neighborhoods-scroll">' + tags + '</div>' +
                '</div>'+
                '</div>';
        }

        /* 4 ── Reviews */
        function buildReviews() {
            var cards = sectionData.reviews.map(function (r) {
                return '<div class="tt-cr-review-card">' +
                    '<div class="tt-cr-review-header">' +
                    '<div class="tt-cr-review-avatar"><img src="' + r.avatar + '" alt="' + r.name + '" /></div>' +
                    '<div class="tt-cr-review-meta">' +
                    '<span class="tt-cr-review-name">' + r.name + '</span>' +
                    '<span class="tt-cr-review-company">' + r.company + '</span>' +
                    '<div class="tt-cr-review-stars">' + buildStars(r.stars) + '</div>' +
                    '</div></div>' +
                    '<p class="tt-cr-review-text">' + r.text + '</p>' +
                    '<span class="tt-cr-review-date">' + r.date + '</span>' +
                    '</div>';
            }).join("");
            return '<div class="tt-cr-section">' +
                '<div class="tt_container">'+
                '<div class="tt-cr-section-title">' + sectionData.reviewsTitle + '</div>' +
                '<div class="tt-cr-reviews-grid">' + cards + '</div>' +
                '</div>'+
                '</div>';
        }

        /* 5 ── Why Thumbtack */
        function buildWhy() {
            var items = sectionData.whyItems.map(function (w) {
                return '<div class="tt-cr-why-item">' +
                    '<div class="tt-cr-why-icon">' + w.icon + '</div>' +
                    '<div class="tt-cr-why-heading">' + w.heading + '</div>' +
                    '<p class="tt-cr-why-desc">' + w.desc + '</p>' +
                    '</div>';
            }).join("");
            return '<div class="tt-cr-why-section">' +
               '<div class="tt_container">'+
                '<div class="tt-cr-section-title">' + sectionData.whyTitle + '</div>' +
                '<div class="tt-cr-why-grid">' + items + '</div>' +
                '</div>'+
                '</div>';
        }

        /* 6 ── FAQ */
        function buildFAQ() {
            var items = sectionData.faqs.map(function (f, i) {
                return '<div class="tt-cr-faq-item' + (f.open ? ' open' : '') + '" data-tt-faq="' + i + '">' +
                    '<div class="tt-cr-faq-question">' +
                    '<span class="tt-cr-faq-question-text">' + f.q + '</span>' +
                    '<span class="tt-cr-faq-chevron">' + chevronSVG() + '</span>' +
                    '</div>' +
                    '<div class="tt-cr-faq-answer">' + f.a + '</div>' +
                    '</div>';
            }).join("");
            return '<div class="tt-cr-faq-section">' +
                '<div class="tt_container">'+
                '<div class="tt-cr-section-title">' + sectionData.faqTitle + '</div>' +
                '<div class="tt-cr-section-subtitle">' + sectionData.faqSubtitle + '</div>' +
                '<div class="tt-cr-faq-list" id="tt-cr-faq-list">' + items + '</div>' +
                '</div>'+
                '</div>';
        }

        /* 7 ── Footer link columns */
        var FOOTER_SHOW = 5;
        function buildFooterCols() {
            var cols = sectionData.footerCols.map(function (col, ci) {
                var lis = col.links.map(function (lnk, li) {
                    var hidden = li >= FOOTER_SHOW ? ' class="tt-cr-hidden"' : '';
                    return '<li' + hidden + '><a href="' + lnk.href + '">' + lnk.label + '</a></li>';
                }).join("");
                return '<div class="tt-cr-footer-col">' +
                    '<h3>' + col.heading + '</h3>' +
                    '<ul data-tt-fcol="' + ci + '">' + lis + '</ul>' +
                    '<button class="tt-cr-toggle-cta" data-tt-fcol="' + ci + '" data-tt-fexp="false">Show more</button>' +
                    '</div>';
            }).join("");
            return '<div class="tt-cr-footer">' +
                '<div class="tt_container">'+
                '<div class="tt-cr-footer-grid">' + cols + '</div>' +
                '</div>'+
                '</div>';
        }

        /* ── Combined wrapper ── */
        function buildAllSections() {
            return '<div class="tt-cr-injected">' +
                buildRelatedServices() +
                buildPricing() +
                buildNeighborhoods() +
                buildReviews() +
                buildWhy() +
                buildFAQ() +
                buildFooterCols() +
                '</div>';
        }

        /* ─── Init FAQ toggles ───────────────────────────────────────────── */
        function initFAQ() {
            var list = document.getElementById("tt-cr-faq-list");
            if (!list) return;
            list.addEventListener("click", function (e) {
                var question = e.target.closest ? e.target.closest(".tt-cr-faq-question") : null;
                if (!question) return;
                var item = question.parentElement;
                var isOpen = item.classList.contains("open");
                var allItems = list.querySelectorAll(".tt-cr-faq-item");
                for (var i = 0; i < allItems.length; i++) allItems[i].classList.remove("open");
                if (!isOpen) item.classList.add("open");
            });
        }

        /* ─── Init footer show more/less ─────────────────────────────────── */
        function initFooterToggles() {
            var footer = document.querySelector(".tt-cr-footer");
            if (!footer) return;
            footer.addEventListener("click", function (e) {
                var btn = e.target.closest ? e.target.closest(".tt-cr-toggle-cta") : null;
                if (!btn) return;
                var ci = btn.getAttribute("data-tt-fcol");
                var expanded = btn.getAttribute("data-tt-fexp") === "true";
                var ul = footer.querySelector('ul[data-tt-fcol="' + ci + '"]');
                if (!ul) return;
                var hiddenItems = ul.querySelectorAll(".tt-cr-hidden");
                for (var i = 0; i < hiddenItems.length; i++) {
                    if (expanded) hiddenItems[i].classList.remove("tt-cr-visible");
                    else hiddenItems[i].classList.add("tt-cr-visible");
                }
                btn.setAttribute("data-tt-fexp", String(!expanded));
                btn.textContent = expanded ? "Show more" : "Show less";
            });
        }

        /* ═══════════════════════════════════════════════════════════════════
           EXISTING CONSTS FROM TEMPLATE
        ═══════════════════════════════════════════════════════════════════ */

        const bannersection = `<div class="w-100 z-1 relative Cre_banner">
  <div class="Cre_banner_wrap">
    <picture class="Cre_banner_pic">
      <source type="image/webp" srcset="https://cdn.optimizely.com/img/20611073899/e412d165347240b2ab5d35c59a6ea78a.jpg" sizes="100vw">
      <img sizes="100vw" src="https://production-next-images-cdn.thumbtack.com/i/302056149247590580/width/1600.jpeg" alt="Find a roofing professional in your area" class="Cre_banner_img" fetchpriority="high">
    </picture>
    <div class="Cre_banner_overlay"></div>
    <div class="tt_container Cre_banner_content">
      <h2 class="Cre_banner_heading">Find a roofing professional in your area</h2>
      <p class="Cre_banner_sub">San Antonio pros ready for hail damage, storm repair, and full replacements. Get matched with verified local roofers — not out-of-town storm chasers.</p>
      <div class="Cre_banner_row">
        <form id="uniqueId2" class="Cre_banner_form">
          <label for="zip-code" class="visually-hidden">Zip code</label>
          <div class="Cre_zip_wrap">
            <svg class="Cre_zip_icon" height="20" width="20" fill="currentColor" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg"><path d="M5 11.25c0 5.244 7.389 12.813 8.231 13.825L14 26l.77-.925C15.612 24.063 23 16.512 23 11.25 23 5.988 19.909 2 14 2c-5.908 0-9 4.006-9 9.25zm2 0C7 7.758 9.191 4 14 4c4.81 0 7 3.758 7 7.25 0 3.217-4.51 8.46-7 11.598-2.489-3.137-7-8.224-7-11.598zM14 7c-2.206 0-4 1.794-4 4s1.794 4 4 4 4-1.794 4-4-1.794-4-4-4zm0 6c-1.103 0-2-.897-2-2s.897-2 2-2 2 .897 2 2-.897 2-2 2z"></path></svg>
            <input class="Cre_zip_input" placeholder="Enter your zip code" name="zip_code" type="text" id="zip-code" inputmode="numeric" pattern="[0-9]*" maxlength="5" autocomplete="postal-code" value="78201">
          </div>
        </form>
        <div class="mt3">
          <button class="Cre_cta_btn" data-test="hero-filters-cta" type="button">Find me a pro</button>
        </div>
      </div>
    </div>
  </div>
</div>`;


 const roofingsection = `<section class="roofing-section">
    <div class="tt_container">

    <!-- Left: Text -->
    <div class="roofing-content">
    <div class="flex-roofing-content">
      <h2>Roofing professionals near San Antonio, TX</h2>
      <p>
        San Antonio homeowners face some of the most demanding roofing conditions in the
        country. The region averages <strong>over 5 significant hail events per year</strong>,
        with summer heat regularly exceeding 100°F accelerating shingle wear. When storms hit,
        demand for qualified local roofers spikes quickly — and so do the out-of-town
        contractors looking for quick work.
      </p>
      <p>
        Thumbtack connects you with <strong>verified San Antonio roofing professionals</strong>
        who live and work in the area, understand Texas insurance requirements, and stand behind
        their work. Whether you need an emergency tarp after a storm, an insurance-grade
        inspection, or a full replacement — you'll find pros here who specialize in exactly that.
      </p>
    </div>

    <!-- Right: Card -->
    <div class="roofing-card">

      <div class="card-item">
        <div class="icon">
          <svg viewBox="0 0 12 10" xmlns="http://www.w3.org/2000/svg">
            <polyline points="1,5 4.5,8.5 11,1" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <p><strong>200+</strong> verified roofers in San Antonio</p>
      </div>

      <div class="card-item">
        <div class="icon">
          <svg viewBox="0 0 12 10" xmlns="http://www.w3.org/2000/svg">
            <polyline points="1,5 4.5,8.5 11,1" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <p>All pros are <strong>local to the area</strong> — not storm chasers</p>
      </div>

      <div class="card-item">
        <div class="icon">
          <svg viewBox="0 0 12 10" xmlns="http://www.w3.org/2000/svg">
            <polyline points="1,5 4.5,8.5 11,1" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <p>Background checked &amp; identity verified</p>
      </div>

      <div class="card-item">
        <div class="icon">
          <svg viewBox="0 0 12 10" xmlns="http://www.w3.org/2000/svg">
            <polyline points="1,5 4.5,8.5 11,1" stroke="#fff" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <p>Thumbtack Guarantee — up to $2,500 back if something goes wrong</p>
      </div>

    </div>
     </div>
      </div>
  </section>`;

        /* ─── Shared URL builder ─────────────────────────────────────────── */
        function buildInstantResultsUrl(zip) {
            var cta = window.__NEXT_DATA__.props.pageProps.frontDoorPage.heroSection.filterSubsection.cta;
            var keyword_pk = cta.keywordPk;
            var project_pk = cta.projectPk || cta.project_pk || '';
            return 'https://www.thumbtack.com/instant-results/?keyword_pk=' + keyword_pk +
                '&zip_code=' + (zip || '') +
                '&ir_referrer=FRONT_DOOR_SEARCH' +
                '&encoded_answers=' +
                (project_pk ? '&project_pk=' + project_pk : '');
        }

        /* ═══════════════════════════════════════════════════════════════════
           VARIATION INIT
        ═══════════════════════════════════════════════════════════════════ */
        function init() {
            document.querySelector("body").classList.add(variation_name);

           

            /* ── 2. Inject hero banner ── */
            waitForElement('div[class*="composable-customer-header"]', function () {
                if (!document.querySelector('.Cre_banner')) {
                    document.querySelector('div[class*="composable-customer-header"]')
                        .insertAdjacentHTML("afterend", bannersection);
                }
            }, 100, 15000);

             waitForElement('[aria-label="Breadcrumb"]', function () {
                if (!document.querySelector('.roofing-section')) {
                    document.querySelector('[aria-label="Breadcrumb"]')
                        .insertAdjacentHTML("afterend", roofingsection);
                }
            }, 100, 15000);

            

            /* ── 3. Inject all custom sections before .global-footer ── */
            waitForElement('.global-footer', function () {
                if (!document.querySelector('.tt-cr-injected')) {
                    var globalFooter = document.querySelector('.global-footer');
                    globalFooter.insertAdjacentHTML('beforebegin', buildAllSections());
                    initFAQ();
                    initFooterToggles();
                }
            }, 100, 15000);

            /* ── ZIP: clear error when valid input ── */
            document.addEventListener('input', function (e) {
                if (e.target && e.target.getAttribute('autocomplete') === 'postal-code') {
                    if (e.target.value.trim().length >= 5) {
                        var errorEl = document.getElementById('tt-zip-error');
                        if (errorEl) errorEl.remove();
                        document.body.classList.remove('disable');
                    }
                }
            });

            /* ── ZIP: mark as touched on focus ── */
            document.addEventListener('focus', function (e) {
                if (e.target && e.target.getAttribute('autocomplete') === 'postal-code') {
                    e.target.setAttribute('data-tt-touched', '1');
                }
            }, true);

            /* ── ZIP: show error on blur if < 5 digits ── */
            document.addEventListener('blur', function (e) {
                if (e.target && e.target.getAttribute('autocomplete') === 'postal-code') {
                    var val = e.target.value.trim();
                    if (e.target.getAttribute('data-tt-touched') && val.length < 5) {
                        var errorEl = document.getElementById('tt-zip-error');
                        if (!errorEl) {
                            errorEl = document.createElement('div');
                            errorEl.id = 'tt-zip-error';
                            errorEl.style.cssText = 'color:#d9232d;font-size:13px;margin-top:6px;font-weight:500;';
                            errorEl.textContent = 'Please enter a valid 5-digit ZIP code.';
                            if (e.target.parentNode) {
                                e.target.parentNode.insertAdjacentElement('afterend', errorEl);
                            }
                        }
                        document.body.classList.add('disable');
                    }
                }
            }, true);

            /* ── Hero CTA: ZIP validation + redirect ── */
            live('[data-test="hero-filters-cta"]', 'click', function (e) {
                if (!this.closest('.mt3')) return;
                if (!this.closest('.Cre_banner')) return;
                e.preventDefault();
                e.stopPropagation();

                var zipInput = document.querySelector('#uniqueId2 [autocomplete="postal-code"]');
                var zip = zipInput ? zipInput.value.trim() : '';
                var errorEl = document.getElementById('tt-zip-error');

                if (zip.length < 5) {
                    if (!errorEl) {
                        errorEl = document.createElement('div');
                        errorEl.id = 'tt-zip-error';
                        errorEl.style.cssText = 'color:#d9232d;font-size:13px;margin-top:6px;font-weight:500;';
                        errorEl.textContent = 'Please enter a valid 5-digit ZIP code.';
                        if (zipInput) zipInput.parentNode.insertAdjacentElement('afterend', errorEl);
                    }
                    return;
                }

                if (errorEl) errorEl.remove();

                try {
                    var url = buildInstantResultsUrl(zip);
                    if (debug) console.log('TT URL:', url);
                    window.location.href = url;
                } catch (err) {
                    console.info('TT: could not build URL', err);
                }
            });
        }

        /* ═══════════════════════════════════════════════════════════════════
           HYDRATION GUARD + KICK-OFF
        ═══════════════════════════════════════════════════════════════════ */
        function thumbtackTest144(list, observer) {
            list.getEntries().forEach(function (entry) {
                if (entry.entryType === "mark" && entry.name === "afterHydrate") {
                    observer.disconnect();
                    clearInterval(testsignals);
                    waitForElement("body", init, 50, 15000);
                    window.isHydrated = true;
                }
            });
        }

        var testsignals;
        if (!window.isHydrated) {
            testsignals = setInterval(function () {
                waitForElement("body", init, 50, 15000);
            }, 50);
            setTimeout(function () {
                clearInterval(testsignals);
            }, 3000);
            var observer = new PerformanceObserver(thumbtackTest144);
            observer.observe({ entryTypes: ["mark"] });
        } else {
            waitForElement("body", init, 50, 15000);
        }

    } catch (e) {
        if (debug) console.log(e, "error in Test" + variation_name);
    }
})();