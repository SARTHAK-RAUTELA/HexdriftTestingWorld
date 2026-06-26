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
            relatedServices: ["Gutter Cleaning", "Siding", "Roof Painting", "Storm Damage", "Handyman"],

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
                { name: "Marcus T.", company: "J. Stevens Roofing Co.",       stars: 5, date: "February 2026", avatar: "https://fastly.picsum.photos/id/458/48/48.jpg?hmac=kXwHutV-RrPnlJUkY4U_6Vgy3D9Qwz19bu67STYxiOI", text: "The storm chasers were everywhere in my neighborhood after the hailstorm — knocking on doors, pressuring homeowners. J. Stevens was the only local company I could find. They were honest, professional, and actually based here in SA." },
                { name: "Linda R.",  company: "Legacy Home Improvements",     stars: 5, date: "January 2026",  avatar: "https://fastly.picsum.photos/id/174/48/48.jpg?hmac=PefeAm5oiSJkl6KK7Z0jAnmkUwluJRDQuFX85OYGrcs", text: "Legacy caught hail damage from a storm two years ago that my previous roofer missed. Their documentation was so thorough that my insurance approved the full replacement with no pushback. Incredibly professional." },
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
                { q: "Does homeowners insurance in Texas cover roof damage?",         open: true, a: "Yes — Texas homeowners insurance typically covers roof damage caused by hail, wind, and storms (sudden/accidental events). Most policies exclude wear and tear or pre-existing damage. After a major storm, document damage with photos and file a claim promptly. Thumbtack pros are experienced with the Texas insurance process and can provide documentation your adjuster will accept." },
                { q: "Do I need a permit for roof work in San Antonio?",              a: "Yes, the City of San Antonio requires a permit for most roofing work including full replacements. Minor repairs (patching under 100 sq ft) may not require one. Thumbtack pros handle the permitting process as part of the job — always confirm this during your initial quote." },
                { q: "How do I verify a local roofing contractor in San Antonio?",   a: "Check for a valid Texas contractor license, general liability insurance (minimum $300k), and workers' comp if they have employees. Be especially cautious after storms — out-of-town storm chasers often disappear after taking a deposit. Every pro on Thumbtack is identity-verified and screened before being listed." },
                { q: "How much does roof repair cost in San Antonio?",               a: "Minor storm repairs in San Antonio typically range from $300–$900. Partial replacements run $2,500–$6,000. Full roof replacements for a standard San Antonio home average $8,500–$16,000 depending on size, material (3-tab vs. architectural shingles), and accessibility. These are higher than national averages due to demand spikes after hail seasons." },
                { q: "How long does a roof replacement take in San Antonio?",        a: "Most San Antonio homes can be re-roofed in 1–2 days. Larger homes or complex rooflines may take 3–4 days. Post-storm demand can extend scheduling lead times — booking early after a hail event is recommended." },
                { q: "What is the best roofing material for San Antonio’s climate?", a: "Architectural (dimensional) asphalt shingles rated for Class 3 or Class 4 hail resistance are the most popular choice in San Antonio. They offer better protection against the frequent hail storms in the area and may qualify you for an insurance discount. Metal roofing is increasingly popular for its longevity and heat reflection in South Texas summers." }
            ],

            footerCols: [
                {
                    heading: "Roofing in Texas",
                    links: [
                        { label: "Houston",    href: "/tx/houston/roofing" },
                        { label: "Dallas",     href: "/tx/dallas/roofing" },
                        { label: "Austin",     href: "/tx/austin/roofing" },
                        { label: "Fort Worth", href: "/tx/fort-worth/roofing" },
                        { label: "El Paso",    href: "/tx/el-paso/roofing" },
                        { label: "Arlington",  href: "/tx/arlington/roofing" }
                    ]
                },
                {
                    heading: "Services in San Antonio",
                    links: [
                        { label: "House Cleaning", href: "/tx/san-antonio/house-cleaning" },
                        { label: "HVAC",           href: "/tx/san-antonio/hvac" },
                        { label: "Lawn Care",      href: "/tx/san-antonio/lawn-care" },
                        { label: "Painting",       href: "/tx/san-antonio/painting" },
                        { label: "Handyman",       href: "/tx/san-antonio/handyman" },
                        { label: "Plumbing",       href: "/tx/san-antonio/plumbing" }
                    ]
                },
                {
                    heading: "Thumbtack",
                    links: [
                        { label: "About us", href: "/about" },
                        { label: "Careers",  href: "/careers" },
                        { label: "Press",    href: "/press" },
                        { label: "Blog",     href: "/blog" }
                    ]
                },
                {
                    heading: "Support",
                    links: [
                        { label: "Help center",        href: "/help" },
                        { label: "Terms of use",       href: "/tos" },
                        { label: "Privacy policy",     href: "/privacy-policy" },
                        { label: "Do not sell my info",href: "/do-not-sell" }
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
            var filledStar = '<svg height="16" width="16" fill="#f5a623" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg"><path d="M9 1l2.12 5.28L17 7.24l-4 3.89.94 5.5L9 14.1l-4.94 2.53.94-5.5-4-3.89 5.88-.96z"/></svg>';
            var emptyStar  = '<svg height="16" width="16" fill="#ddd" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg"><path d="M9 1l2.12 5.28L17 7.24l-4 3.89.94 5.5L9 14.1l-4.94 2.53.94-5.5-4-3.89 5.88-.96z"/></svg>';
            var html = "";
            for (var i = 0; i < 5; i++) {
                html += '<span class="tt-cr-star">' + (i < n ? filledStar : emptyStar) + "</span>";
            }
            return html;
        }

        /* 1 ── Related Services */
        function buildRelatedServices() {
            var pillChevron = '<svg class="tt-cr-pill-chevron" height="16" width="16" fill="currentColor" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg"><path d="M6.764 14.646L13 9 6.725 3.311a1 1 0 00-1.482 1.342L10 9l-4.699 4.285c-.187.2-.301.435-.301.715a1 1 0 001 1c.306 0 .537-.151.764-.354z"/></svg>';
            var serviceLinks = {
                "Gutter Cleaning": "/tx/san-antonio/gutter-cleaning",
                "Siding": "/tx/san-antonio/siding",
                "Roof Painting": "/tx/san-antonio/roof-painting",
                "Storm Damage": "/tx/san-antonio/roof-damage-repair",
                "Handyman": "/tx/san-antonio/handyman"
            };
            var pills = sectionData.relatedServices.map(function (s) {
                var href = serviceLinks[s] || '#';
                return '<a href="' + href + '" class="tt-cr-service-pill">' + s + pillChevron + '</a>';
            }).join("");
            return '<div class="tt-cr-section">' +
                '<div class="tt-cr-section-title">Check out some related services</div>' +
                '<div class="tt-cr-section-subtitle">These highly-rated pros offer services related to what you need. You might need help from a few of them for your project.</div>' +
                '<div class="tt-cr-services-scroll">' + pills + '</div>' +
                '</div>';
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
                '<div class="tt-cr-section-title">' + sectionData.pricingTitle + '</div>' +
                '<p class="tt-cr-pricing-desc">' + sectionData.pricingDesc + '</p>' +
                '<div class="tt-cr-pricing-grid">' + cards + '</div>' +
                '<p class="tt-cr-pricing-footer">' + sectionData.pricingFooter + '</p>' +
                '</div>';
        }

        /* 3 ── Neighborhoods */
        function buildNeighborhoods() {
            var tags = sectionData.neighborhoods.map(function (n) {
                return '<span class="tt-cr-neighborhood-tag"><span class="tt-cr-check-icon">' + checkSVG() + '</span>' + n + '</span>';
            }).join("");
            return '<div class="tt-cr-section">' +
                '<div class="tt-cr-section-title">' + sectionData.neighborhoodsTitle + '</div>' +
                '<div class="tt-cr-section-subtitle">' + sectionData.neighborhoodsSubtitle + '</div>' +
                '<div class="tt-cr-neighborhoods-scroll">' + tags + '</div>' +
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
                '<div class="tt-cr-section-title">' + sectionData.reviewsTitle + '</div>' +
                '<div class="tt-cr-reviews-grid">' + cards + '</div>' +
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
                '<div class="tt-cr-section-title">' + sectionData.whyTitle + '</div>' +
                '<div class="tt-cr-why-grid">' + items + '</div>' +
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
                '<div class="tt-cr-section-title">' + sectionData.faqTitle + '</div>' +
                '<div class="tt-cr-section-subtitle">' + sectionData.faqSubtitle + '</div>' +
                '<div class="tt-cr-faq-list" id="tt-cr-faq-list">' + items + '</div>' +
                '</div>';
        }

        /* 7 ── Footer link columns */
        function buildFooterCols() {
            var cols = sectionData.footerCols.map(function (col) {
                var lis = col.links.map(function (lnk) {
                    return '<li><a href="' + lnk.href + '">' + lnk.label + '</a></li>';
                }).join("");
                return '<div class="tt-cr-footer-col">' +
                    '<h3>' + col.heading + '</h3>' +
                    '<ul>' + lis + '</ul>' +
                    '</div>';
            }).join("");
            return '<div class="tt-cr-footer">' +
                '<div class="tt-cr-footer-grid">' + cols + '</div>' +
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


        /* ═══════════════════════════════════════════════════════════════════
           EXISTING CONSTS FROM TEMPLATE
        ═══════════════════════════════════════════════════════════════════ */

        const bannersection = `<div class="w-100 z-1 relative hero-header_root__qfw8c Cre_banner ">
   <div class="relative m_absolute hero-header_heroHeaderHeight__nr0jz hero-header_heroContainer__WLxGu">
     <picture class="Image_picture__9nTha">
         <source type="image/webp" srcset="https://cdn.optimizely.com/img/20611073899/e412d165347240b2ab5d35c59a6ea78a.jpg" sizes="100vw">
         <img sizes="100vw" srcset="https://cdn.optimizely.com/img/20611073899/e412d165347240b2ab5d35c59a6ea78a.jpg" src="https://production-next-images-cdn.thumbtack.com/i/302056149247590580/width/1600.jpeg" height="500" alt="Find a roofing professional in your area" style="object-fit:cover;object-position:center" fetchpriority="high" class="Image_imageStart__rFoNE Image_imageEnd__P5092" data-first-enter-image="true">
      </picture>
      <div class="absolute top-0 bottom-0 w-100">
         <div class="hero_section absolute w-100 hero-header_imageOverlayGradient__mvRlA hero-header_heroHeaderHeight__nr0jz"></div>
         <div class="Wrap_root__YXWM_">
            <div class="pv3 relative z-1 m_dn white hero_header_parent_mobile flex flex-column items-start justify-center hero-header_heroHeaderHeight__nr0jz">
               <h2 class="Type_title2__gGlGa mb3 hero_header_mobile pre-line">Find a roofing professional in your area</h2>
               <p class="tt-hero-sub mb3">San Antonio pros ready for hail damage, storm repair, and full replacements. Get matched with verified local roofers — not out-of-town storm chasers.</p>
               <div class="b dib nowrap white bg-indigo  br-pill pv2 ph3 mv2"><button class="plain_plain__uVCE8 plain_plainThemeInherit__ruRRY plain_plainWidthAuto__gL9F8" data-test="hero-filters-cta" type="button">17 near you</button></div>
            </div>
         </div>
      </div>
   </div>
   <div class="hero_section m_relative left0 w-100">
      <div class="hero-header-filters_wrap__XsAmU">
         <div class="m_pb4 m_pr4 m_mw7 bg-white m_pl4" style="padding-top:24px">
            <div class="pb2 dn m_flex items-center justify-between hero_header_parent">
               <h2 class="Type_title2__gGlGa pr3 hero_header pre-line">Find a roofing professional in your area</h2>
               <div class="flex-none nowrap bg-indigo pv2 ph3 br-left br-pill -mr4 b white"><button class="plain_plain__uVCE8 plain_plainThemeInherit__ruRRY plain_plainWidthAuto__gL9F8" data-test="hero-filters-cta" type="button">17 near you</button></div>
            </div>
            <p class="Type_text1__634gq mb2 tt-hero-sub-desktop">San Antonio pros ready for hail damage, storm repair, and full replacements. Get matched with verified local roofers — not out-of-town storm chasers.</p>
            <p class="Type_text1__634gq mb3 black-300">Confirm your location to see quality pros near you.</p>
            <div class="compact-filters_wrapper__3Lt1_">
               <div>
                  <form id="uniqueId2">
                     <label for="zip-code" class="visually-hidden">Zip code</label>
                     <div class="TextInput_root__P9LZ5 TextInput_rootUiStateDefault___kfA0">
                        <div class="TextInput_inputInnerElement___hAVm">
                           <div class="TextInput_inputIconContainer__cQemg TextInput_inputIconContainerPositionLeftSizeLarge__4yzfk" style="color:inherit">
                              <svg height="28" width="28" fill="currentColor" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg"><path d="M5 11.25c0 5.244 7.389 12.813 8.231 13.825L14 26l.77-.925C15.612 24.063 23 16.512 23 11.25 23 5.988 19.909 2 14 2c-5.908 0-9 4.006-9 9.25zm2 0C7 7.758 9.191 4 14 4c4.81 0 7 3.758 7 7.25 0 3.217-4.51 8.46-7 11.598-2.489-3.137-7-8.224-7-11.598zM14 7c-2.206 0-4 1.794-4 4s1.794 4 4 4 4-1.794 4-4-1.794-4-4-4zm0 6c-1.103 0-2-.897-2-2s.897-2 2-2 2 .897 2 2-.897 2-2 2z"></path></svg>
                              <div class="b zipcode-filter_inputDescription__pxGHd">Zip code</div>
                           </div>
                        </div>
                        <input class="TextInput_input__piJRN TextInput_inputSizeLarge__c6G4v TextInput_inputInnerLeft__CREPe" placeholder="Zip code" name="zip_code" type="text" id="zip-code" inputmode="numeric" pattern="[0-9]*" maxlength="5" autocomplete="postal-code" value="78201">
                        <div class="TextInput_inputStyles__cwEPs TextInput_inputStylesRoundedBordersLeft__iSTcm TextInput_inputStylesRoundedBordersRight__DKtzE TextInput_inputStylesUiStateDefault__BJDOJ"></div>
                     </div>
                  </form>
               </div>
            </div>
            <div class="mt3"><button class="themed_themedButton__UKQVj themed_themedButtonRoundedBordersLeft___blLq themed_themedButtonRoundedBordersRight__d0G5C themed_themedButtonThemePrimary__pd6_C themed_themedButtonWidthFull__vvqNZ" data-test="hero-filters-cta" type="button"><span class="themed_flexWrapper__MQCSr themed_flexWrapperSizeLarge__fZ1Jn">Find me a pro</span></button></div>
         </div>
      </div>
   </div>
</div>`;


 const roofingsection = `<section class="roofing-section">

    <!-- Left: Text -->
    <div class="roofing-content">
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

            /* ── Hero CTA: "Find me a pro" (ZIP validation) + "17 near you" (direct redirect) ── */
            live('[data-test="hero-filters-cta"]', 'click', function (e) {
                if (!this.closest('.Cre_banner')) return;
                e.preventDefault();
                e.stopPropagation();

                /* "Find me a pro" button — inside .mt3, requires valid ZIP */
                if (this.closest('.mt3')) {
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
                        if (debug) console.log('TT URL (Find me a pro):', buildInstantResultsUrl(zip));
                        window.location.href = buildInstantResultsUrl(zip);
                    } catch (err) {
                        console.info('TT: could not build URL', err);
                    }
                    return;
                }

                /* "17 near you" button — redirect using filled ZIP or SA default */
                try {
                    var zipInput = document.querySelector('#uniqueId2 [autocomplete="postal-code"]');
                    var zip = (zipInput && zipInput.value.trim().length >= 5) ? zipInput.value.trim() : '78201';
                    if (debug) console.log('TT URL (17 near you):', buildInstantResultsUrl(zip));
                    window.location.href = buildInstantResultsUrl(zip);
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