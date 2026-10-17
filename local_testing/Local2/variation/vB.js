(function () {
  try {
    /* main variables */
    var debug = 0;
    var variation_name = "lotus_test_15_B";
    var HERO_MODE = "image"; // "video" | "image"

    /* hero media config – replace with final assets */
    var HERO_VIDEO = "https://lotuscarrental.cdn.prismic.io/lotuscarrental/aju5j1bRV8_Qfzxy_1779385618252556_compressed.mp4";
    var HERO_IMAGE_DESKTOP = "https://v2.crocdn.com/Lotus_Car/test15/1.jpg";
    var HERO_IMAGE_MOBILE = "https://images.prismic.io/lotuscarrental/afxmOcBOoF08xtoI_defender-lava-field-lake-aerial.jpg?auto=format%2Ccompress&fit=max&w=1080";

    var GOOGLE_URL = "https://maps.app.goo.gl/VhjHXXLShHtgsbEN7";
    var BLOG_URL = "/blog";
    var BLOG_CACHE_KEY = "lotus_test_15_B_blog_posts";
    var BLOG_LIMIT = 4;

    var SEL = {
      wrap: "main [data-section-name=hero]",
      hero: "[data-section-name=hero]",
      fleet: "[data-section-name=fleet]",
      heroBg: "[data-hero-element=background]",
      heroHeading: "[data-hero-element=heading]",
      heroDesc: "[data-hero-element=description]",
      heroBookingDesktop: "[data-hero-element=booking-box-desktop]"
    };

    /* value = inline SVG markup OR image URL (URLs are rendered as <img> by icon()) */
    var ICONS = {
      google: "https://v2.crocdn.com/Lotus_Car/test15/Link%20-%20Read%20our%20reviews%20on%20Google%20Maps.svg",
      star: '<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1l1.796 3.64 4.017.584-2.907 2.833.687 3.999L8 10.01l-3.593 1.896.687-3.999L2.187 5.224l4.017-.584L8 1z" fill="#FBBC05"/></svg>',
      home: 'https://v2.crocdn.com/Lotus_Car/test15/Vector.svg',
      wifi: 'https://v2.crocdn.com/Lotus_Car/test15/Group%20(1).svg',
      support: "https://v2.crocdn.com/Lotus_Car/test15/streamline_customer-support-1-solid.svg",
      shield: "https://v2.crocdn.com/Lotus_Car/test15/Group%20(2).svg",
      prev: '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>',
      next: '<svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>'
    };

    /* Google wordmark SVG – used ONLY inside review cards (69 x 22) */
    var REVIEW_GOOGLE_SVG =
      '<svg class="lotus_test_15_B-icon lotus_test_15_B-icon--google lotus_test_15_B-review__google" aria-label="Google" role="img" viewBox="0 0 272 92" width="69" height="22" xmlns="http://www.w3.org/2000/svg" style="display:inline-block;vertical-align:middle;flex-shrink:0;width:69px;height:22px;max-width:none;">' +
      '<path d="M31.32 70.33c17.65.17 29.67-11.68 29.67-29.92q.01-2.29-.43-5.08H31.2v8.76h20.6c-1.1 11.47-9.18 17.44-20.27 17.44-12.44 0-21.96-9.35-21.96-22.94 0-13.41 9.1-22.77 21.96-22.77 6.48 0 11.26 2 16.04 6.9l6.14-6.43c-5.38-6.3-13.16-9.31-22.3-9.31C13.7 6.98 0 20.27 0 38.46c0 17.4 13.25 31.7 31.32 31.87" fill="#3186FF"></path>' +
      '<path d="M88.2 70.33c13.2 0 22.77-9.69 22.77-23.15 0-13.2-9.35-22.98-22.77-22.98-12.7 0-22.68 9.02-22.68 22.98 0 13.33 9.43 23.15 22.68 23.15m0-8.04c-8.04 0-13.67-6.6-13.67-15.1s5.93-14.95 13.67-14.95c8.17 0 13.67 6.6 13.67 14.94 0 8.64-5.63 15.11-13.67 15.11" fill="#FC413D"></path>' +
      '<path d="M137.42 70.33c13.29 0 22.77-9.73 22.77-23.15 0-13.2-9.35-22.98-22.77-22.98-12.7 0-22.68 9.02-22.68 22.98 0 13.33 9.43 23.15 22.68 23.15m0-8.04c-8.04 0-13.67-6.6-13.67-15.1s5.93-14.95 13.67-14.95c8.17 0 13.67 6.6 13.67 14.94 0 8.64-5.63 15.11-13.67 15.11" fill="#FFBE00"></path>' +
      '<path d="M185.37 88.57q21.51 0 21.5-24.63V25.77h-8.8v5.37h-.17c-2.75-4.27-7.96-6.68-13.84-6.68-12.7 0-20.44 9.69-20.44 22.6 0 12.86 7.53 22.34 20.78 22.34 6.52 0 11.34-3.72 13.37-6.77h.3v3.94c0 8.67-4.49 13.8-12.82 13.8-5.46 0-9.1-3.01-11.77-8.05l-7.96 3.52c4.2 8.84 10.16 12.73 19.85 12.73m0-27.55c-7.74 0-12.7-5.71-12.7-14.22 0-8.2 4.92-14.13 12.75-14.13s12.65 5.5 12.65 14.09c0 8.68-5.08 14.26-12.7 14.26" fill="#3186FF"></path>' +
      '<path d="M222.91 8.33h-9.22v60.6h9.22z" fill="#00AF57"></path>' +
      '<path d="M250.17 70.25a22.1 22.1 0 0 0 19-10.54l-6.86-4.49c-3 4.2-7.1 6.6-11.72 6.6a13.6 13.6 0 0 1-11.93-7.23l30.93-13.12a20 20 0 0 0-.84-3.22c-3.69-9.48-10.12-13.8-18.8-13.8-13.24 0-22.25 9.66-22.25 23.03 0 13.67 9.47 22.77 22.47 22.77m-13.5-22.81v-.51c0-8.76 5.03-14.64 12.95-14.64 3.76 0 7.15 1.69 9.44 5.67z" fill="#FC413D"></path>' +
      '</svg>';

    /* size/colour per placement – applied inline so site CSS (img { height:auto; max-width:100% }) can't blow them up */
    var ICON_STYLE = {
      usp: "width:16px;height:16px;filter:brightness(0) invert(1);" /* white, same as the inline SVG icons */
    };

    var AVATAR_COLORS = ["#f97316", "#a855f7", "#0d9488", "#2563eb", "#db2777", "#65a30d", "#0891b2", "#ea580c"];

    /* reviews – source: Best_Reviews_Google.docx */
    var REVIEWS = [
      { name: "Syed Ullah", time: "2 months ago", text: "Get the platinum insurance and you will have the best experience ever. Pre check in and pick up the car without being in the line and also quick drop off." },
      { name: "Harald Schleifer", time: "5 weeks ago", text: "Simply check in via your mobile phone, hassle-free pick-up. Hassle-free return and friendly staff." },
      { name: "Nina", time: "2 weeks ago", text: "We rented from Lotus Car based on the recommendation of a frequent Iceland traveler and everything went very smoothly. We took the free shuttle from KEF airport to the rental office and we hardly had to wait. Anita was very friendly, clear and professional and gave us a lot of useful information about driving and parking in Iceland. I thought this was standard but realized when talking to other friends who rented from other companies that they didn't get any of those insightful tips. We will definitely rent from Lotus Car next time we go to Iceland." },
      { name: "Jadon Gibson", time: "4 weeks ago", text: "This truly was a great experience. Lotus sent helpful instructions to find the airport shuttle and the pickup process was quick and seamless. The in-car WIFI worked well except in remote areas which is expected. I purchased the platinum insurance which provided very comprehensive coverage. I would highly recommend it for anyone seeking to adventure on Iceland's F-roads. The coverage gave us peace of mind when we were off-roading. The car drop-off went smoothly and the airport shuttle returned in a reasonable amount of time. The car was clean and ran well for the duration of our trip. I would use Lotus again if renting in Iceland." },
      { name: "Frost Bite Photography", time: "3 weeks ago", text: "Best car rental company I've ever used. I had a flat tire on the second day but was able to change it myself quickly. I then got an appointment at a garage and a new tire right on my route, so I didn't waste any time. On the second-to-last day, I had bad luck again. I got stuck while crossing a river, and the engine sucked in water. Total loss. The tow, which arrived within an hour, was seamless. Communication was via email, and replies were prompt. Sharing my coordinates was easy. The insurance covered everything, and I was quickly provided with a replacement car—a Toyota RAV4, which I highly recommend for the Icelandic Highlands. Absolutely top-notch service. Pick-up and drop-off with self-check-in and check-out were super easy. The shuttle also worked perfectly. I will definitely choose this rental company again in February. You are such a great and friendly team. You simply feel safe and very comfortable. Definitely choose the Platinum insurance, especially in the Highlands. It truly covers everything." },
      { name: "Francisco Forero", time: "a month ago", text: "The best car rental experience I've ever had\n\nI've rented cars in many countries over the years, and Lotus Car Rental is, without question, the best rental company I've ever used.\n\nThe vehicle was in excellent condition, the pickup process was efficient, and the customer service throughout the trip was exceptional.\n\nWhat impressed me the most happened after the rental. I noticed that the fuel level at pickup was slightly below full (around 95%). I contacted their support expecting at most an explanation. Instead, they immediately reviewed the case, trusted my observation, and processed a refund without any argument or unnecessary back-and-forth.\n\nIt wasn't about the money—it was about integrity and customer care. Companies that choose to do the right thing, even for a small amount, earn lifelong customers.\n\nIf you're planning a trip to Iceland, I can recommend Lotus Car Rental without any hesitation. They truly set the standard for customer service." },
      { name: "Danny Benishay", time: "5 weeks ago", text: "In one word - AWESOME\nSuperb car (Toyota landcruzer) for 2.5 weeks. Runs smoothly.\nThe support we got when we return the car by ANITA, the Lotus rep in KEF airport was great. It's important to get a smile and helpful support when you are in a hurry to return the car - perfectly, then get a transportation to the airport. She did it with a big smile and in the future - I will clearly use Lotus for car rental." },
      { name: "George Mata", time: "a month ago", text: "Excellent customer service when it mattered most\n\nI rented a car from Lotus for 10 days with Platinum Insurance. The airport shuttle, as well as the pick-up and drop-off process, were quick and hassle-free. During the trip, I experienced two issues with the car—a clutch problem and a dashboard warning—which definitely made the adventure a little more exciting! However, the Lotus team resolved both issues much faster than I expected, without affecting my travel plans. Their customer service was on point from start to finish, and they even made a thoughtful goodwill gesture at the end, which I truly appreciated. I'll definitely rent from Lotus again on my next trip to Iceland and highly recommend them to anyone.\n\nI also highly recommend getting full insurance when driving in Iceland. The roads and weather can be unpredictable, and it gives you real peace of mind." },
      { name: "Hyagreev Rethinavel", time: "2 months ago", text: "Excellent cars with great customer service! My car got damaged due to a reindeer with the entire left headlight and door damaged. I was around 700km KEF airport in a remote town on the east coast but still Betty was able to arrange me a replacement car and told me not to worry about the damages because I have the Platinum Insurance, drop off was also extremely smooth no questions asked even when the car was extremely muddy from the gravel roads. Would definitely recommend the platinum insurance for peace of mind." },
      { name: "Jason W.", time: "a month ago", text: "I can't say enough good things about the entire rental process at Lotus. Usually when I rent a car I feel like it's a hostage exchange and the company is looking for ways to gouge me for non-existent damages. Not Lotus.\nThe office is very clean, with coffee (which was awesome after an all-night flight), and looks/smells new/updated. Plenty of email communication prior to my rental dates too.\nThe staff were awesome. Each one took their time with me, explaining very clearly and kindly, what to look out for around Iceland; how to get gas; how to use the wifi box; how paid parking lots work; how to access the IS weather map; tunnel tolls; etc.\nHighly recommend." },
      { name: "R J", time: "2 months ago", text: "We use this company every time we visit.\nWe find them to be the most professional and have excellent customer service.\nWe arrived really late, called the number, and was promptly picked up in a small van.\nVehicle collection was then simple.\nWe were even given advice about apps that assist parking, and fuel stations.\nWe decided to change the car the next day due to it being too small, and yet, again this was without disruption and the transition over to the new bigger vehicle was a smooth one..\nOn dropping it off we used the bus to then get back to the airport, which runs from lotus around every 20 minutes.\nThe waiting room is warm, has a toilet and warm coffee.\n\nI highly recommend this company." },
      { name: "Brianna H", time: "a month ago", text: "Lotus is the gold standard for car rentals, honestly.\n\nI've now rented from here twice, and wish every car rental experience could be like it is here. It's quick, efficient, and the staff are lovely. Also appreciate the online video demonstrating where to get on the shuttle from the airport exit for us directionally-challenged people haha.\n\nMy last rental in May 2024 was so smooth. I was in and out in no time, but not in a way that felt rushed. They also explain the various safety requirements really well, and are extremely quick to answer should you need anything.\n\nI also highly recommend their platinum insurance given the terrain and unpredictability of the weather, etc. It is a little expensive, but worth the peace of mind!\n\nThis is my go-to rental spot for Iceland always, see you again!!" },
      { name: "Laurette Z", time: "2 months ago", text: "Rent A Rav 4 from them for my 9 days trip. They provided detailed instruction how to get to the shuttle but still took me a while to figure it out. It turned out the shuttle bus is for all the rental companies, including Lotus. It was quick and no waiting time once arriving their facility, about 10 minutes drive from airport. Staff was helpful and patient to explain details. I got their platinum insurance, and I am glad I did, even I didn't drive on F road or did river crossing. The full insurance just gave me peace of mind. And their free portable WiFi was A plus for the trip, never had coverage problems. Drop off car was easy, no need to wash or clean the car, no inspection required. Great experience with Lotus. Highly recommended." },
      { name: "Michael Dunn", time: "2 months ago", text: "Day three of our Icelandic adventure and we're absolutely loving every minute of it!\n\nNone of this would have been possible without Otto and the incredible team at Lotus. After a disaster with our original rental car booking at another company, we were worried our dream road trip around Iceland was about to become a very expensive walking tour.\n\nEnter Otto.\n\nHe came in clutch, shuffled things around behind the scenes, and managed to get us sorted and on the road in no time. The whole process was smooth, stress-free, and handled with genuine care and professionalism.\n\nIf you're planning a trip to Iceland and need a rental car, stop looking - Lotus is the one." }
    ];

    /* ---------- helpers ---------- */
    function log(m) { if (debug) console.log("[" + variation_name + "]", m); }

    function waitForElement(selector, trigger, delayInterval, delayTimeout) {
      var interval = setInterval(function () {
        if (document && document.querySelector(selector) && document.querySelectorAll(selector).length > 0) {
          clearInterval(interval);
          trigger();
        }
      }, delayInterval);
      setTimeout(function () { clearInterval(interval); }, delayTimeout);
      return interval;
    }

    function debounce(fn, wait) {
      var t;
      return function () {
        var ctx = this, args = arguments;
        clearTimeout(t);
        t = setTimeout(function () { fn.apply(ctx, args); }, wait);
      };
    }

    /* delegated listener; selector "window" binds window-level events (resize/load) */
    function live(selector, event, callback, capture) {
      if (selector === "window") {
        window.addEventListener(event, callback, !!capture);
        return;
      }
      document.addEventListener(event, function (e) {
        var target = e.target && e.target.closest ? e.target.closest(selector) : null;
        if (target) callback.call(target, e);
      }, !!capture);
    }

    function esc(str) {
      return String(str == null ? "" : str).replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
      });
    }

    function insertOnce(id, ref, position, html) {
      if (!ref || document.getElementById(id)) return document.getElementById(id);
      ref.insertAdjacentHTML(position, html);
      return document.getElementById(id);
    }

    function removeEl(el) { if (el && el.parentNode) el.parentNode.removeChild(el); }

    /* returns inline SVG as-is, or an <img> tag when the icon is an image URL */
    function icon(key, alt, place) {
      var v = ICONS[key] || "";
      if (!/^https?:\/\//i.test(v)) return v;
      var style = "display:block;flex-shrink:0;max-width:none;object-fit:contain;" + (ICON_STYLE[place] || "");
      return '<img class="lotus_test_15_B-icon lotus_test_15_B-icon--' + key + '" src="' + esc(v) + '" alt="' + esc(alt || "") + '"' +
        (alt ? "" : ' aria-hidden="true"') + ' style="' + style + '" decoding="async">';
    }

    function stars(n) {
      var s = "";
      for (var i = 0; i < n; i++) s += ICONS.star;
      return s;
    }

    /* autoplay helper – muted inline video; if browser blocks it, poster image stays visible */
    function playVideo(video) {
      if (!video || !video.paused) return;
      var p = video.play && video.play();
      if (p && p.catch) p.catch(function (e) { log(e); });
    }

    /* ---------- hero ---------- */
    var mediaFailed = false; /* set when image/video fails to load – stops it being re-added on every update */
    function buildHeroMedia(hero) {
      if (mediaFailed) return;
      var bg = hero.querySelector(SEL.heroBg);
      if (!bg || bg.querySelector(".lotus_test_15_B-hero-media")) return;
      var origImg = bg.querySelector("img");
      var poster = origImg ? origImg.currentSrc || origImg.src : "";

      if (HERO_MODE === "video" && !(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)) {
        bg.insertAdjacentHTML("beforeend",
          '<video class="lotus_test_15_B-hero-media lotus_test_15_B-hero-video" autoplay muted loop playsinline preload="auto" poster="' + esc(poster) + '" aria-hidden="true">' +
          '<source src="' + esc(HERO_VIDEO) + '" type="video/mp4"></video>');
        var video = bg.querySelector(".lotus_test_15_B-hero-video");
        video.muted = true;
        video.defaultMuted = true;
        video.setAttribute("muted", "");
        playVideo(video);
      } else if (HERO_MODE === "image") {
        bg.insertAdjacentHTML("beforeend",
          '<picture class="lotus_test_15_B-hero-media lotus_test_15_B-hero-picture">' +
          '<source media="(max-width: 1023px)" srcset="' + esc(HERO_IMAGE_MOBILE) + '">' +
          '<img src="' + esc(HERO_IMAGE_DESKTOP) + '" alt="" fetchpriority="high"></picture>');
      }
      if (!bg.querySelector(".lotus_test_15_B-hero-overlay")) bg.insertAdjacentHTML("beforeend", '<div class="lotus_test_15_B-hero-overlay"></div>');
    }

    function buildHero() {
      var hero = document.querySelector(SEL.hero);
      if (!hero) return;
      var heading = hero.querySelector(SEL.heroHeading);
      var desc = hero.querySelector(SEL.heroDesc);
      var booking = hero.querySelector(SEL.heroBookingDesktop);
      if (!heading || !desc) return;

      buildHeroMedia(hero);

      insertOnce("lotus_test_15_B-hero-heading", heading, "afterend",
        '<div id="lotus_test_15_B-hero-heading" class="lotus_test_15_B-hero-heading"><h1>Your Iceland Adventure Starts Here</h1></div>');

      insertOnce("lotus_test_15_B-hero-desc", desc, "afterend",
        '<div id="lotus_test_15_B-hero-desc" class="lotus_test_15_B-hero-desc"><p>Whether you\'re driving the Ring Road, exploring the Highlands, or camping under the midnight sun, we\'ll help you choose the right rental car to explore all that Iceland has to offer.</p></div>');

      insertOnce("lotus_test_15_B-hero-usps", document.getElementById("lotus_test_15_B-hero-desc"), "afterend",
        '<ul id="lotus_test_15_B-hero-usps" class="lotus_test_15_B-hero-usps">' +
        '<li>' + icon("home", "", "usp") + '<span>Locally Owned</span></li>' +
        '<li>' + icon("wifi", "", "usp") + '<span>Free Wifi</span></li>' +
        '<li>' + icon("support", "", "usp") + '<span>24/7 Support</span></li>' +
        '<li>' + icon("shield", "", "usp") + '<span>No Hidden Fees</span></li></ul>');

      var ratingRef = booking || document.getElementById("lotus_test_15_B-hero-usps");
      /* hero rating keeps the original Google image icon */
      insertOnce("lotus_test_15_B-hero-rating", ratingRef, "afterend",
        '<a id="lotus_test_15_B-hero-rating" class="lotus_test_15_B-hero-rating" href="' + GOOGLE_URL + '" target="_blank" rel="noopener noreferrer" aria-label="Read our reviews on Google">' +
        '<span class="lotus_test_15_B-hero-rating__icons">' + icon("google", "Google") +
        '<span class="lotus_test_15_B-hero-rating__text">Rated 4.7 with 3,864 reviews</span></a>');

      /* old trust/rating block – hidden only when the new rating is in place */
      var oldRating = hero.querySelector('a[href*="maps.app.goo.gl"]:not(#lotus_test_15_B-hero-rating)');
      var oldTrust = oldRating ? oldRating.parentElement : null;
      if (oldTrust && document.getElementById("lotus_test_15_B-hero-rating") && oldTrust.getAttribute("data-hero-element") !== "content-wrapper") {
        oldTrust.classList.add("lotus_test_15_B-hide");
      }

      if (document.getElementById("lotus_test_15_B-hero-heading") && document.getElementById("lotus_test_15_B-hero-desc")) {
        hero.classList.add("lotus_test_15_B-hero-done");
      }
    }

    /* ---------- reviews ---------- */
    function reviewCard(r, i) {
      var initial = esc(r.name.charAt(0).toUpperCase());
      var long = r.text.length > 170;
      return '<article class="lotus_test_15_B-review">' +
        '<div class="lotus_test_15_B-review__head">' +
        '<span class="lotus_test_15_B-review__avatar" style="background:' + AVATAR_COLORS[i % AVATAR_COLORS.length] + '">' + initial + '</span>' +
        '<div class="lotus_test_15_B-review__who"><p class="lotus_test_15_B-review__name">' + esc(r.name) + '</p>' +
        '<p class="lotus_test_15_B-review__time">' + esc(r.time) + ' on ' + REVIEW_GOOGLE_SVG + '</p></div></div>' +
        '<div class="lotus_test_15_B-review__stars">' + stars(5) + '</div>' +
        '<p class="lotus_test_15_B-review__text' + (long ? " is-clamped" : "") + '">' + esc(r.text) + '</p>' +
        (long ? '<button type="button" class="lotus_test_15_B-review__more" aria-expanded="false">Read more</button>' : '') +
        '</article>';
    }

    function buildReviews() {
      var hero = document.querySelector(SEL.hero);
      var old = document.getElementById("lotus_test_15_B-reviews");
      if (old && old.previousElementSibling !== hero) { old.parentNode.removeChild(old); old = null; } /* left behind by a React re-render */
      if (!hero || old) return;
      var cards = "";
      for (var i = 0; i < REVIEWS.length; i++) cards += reviewCard(REVIEWS[i], i);

      insertOnce("lotus_test_15_B-reviews", hero, "afterend",
        '<section id="lotus_test_15_B-reviews" class="lotus_test_15_B-reviews">' +
        '<div class="lotus_test_15_B-container">' +
        '<h2 class="lotus_test_15_B-reviews__title">Our customers love our friendly staff, easy process, and reliable cars.</h2>' +
        '<div class="lotus_test_15_B-reviews__slider">' +
        '<button type="button" class="lotus_test_15_B-reviews__arrow lotus_test_15_B-reviews__arrow--prev" aria-label="Previous reviews" data-dir="-1">' + ICONS.prev + '</button>' +
        '<div class="lotus_test_15_B-reviews__track" tabindex="0">' + cards + '</div>' +
        '<button type="button" class="lotus_test_15_B-reviews__arrow lotus_test_15_B-reviews__arrow--next" aria-label="Next reviews" data-dir="1">' + ICONS.next + '</button>' +
        '</div>' +
        '<div class="lotus_test_15_B-reviews__dots"></div>' +
        '<a class="lotus_test_15_B-reviews__all" href="' + GOOGLE_URL + '" target="_blank" rel="noopener noreferrer">See all reviews</a>' +
        '</div></section>');

      refreshReviews(false);
      setTimeout(function () { refreshReviews(false); }, 500); /* re-measure once variation CSS/fonts are applied */
      hideSection("Why Lotus?", "lotus_test_15_B-reviews");
    }

    /* card width + gap, cards per view */
    function getMetrics(track) {
      var card = track.querySelector(".lotus_test_15_B-review");
      var gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      var step = card ? card.offsetWidth + gap : track.clientWidth;
      var perView = card ? Math.max(1, Math.round((track.clientWidth + gap) / step)) : 1;
      return { step: step || 1, perView: perView };
    }

    /* card counts as "in view" when at least half of it is inside the track viewport */
    function isInView(card, trackRect) {
      var r = card.getBoundingClientRect();
      var overlap = Math.min(r.right, trackRect.right) - Math.max(r.left, trackRect.left);
      return r.width > 0 && overlap >= r.width * 0.5;
    }

    function collapseCard(card) {
      var text = card.querySelector(".lotus_test_15_B-review__text.is-open");
      if (!text) return;
      text.classList.remove("is-open");
      var btn = card.querySelector(".lotus_test_15_B-review__more");
      if (btn) {
        btn.setAttribute("aria-expanded", "false");
        btn.textContent = "Read more";
      }
    }

    /*
     * Height logic:
     *  - base height  = tallest card in its normal (clamped) state -> applied to every card
     *  - cards in view = stretched to the tallest visible card (so an expanded card grows its visible siblings only)
     *  - collapseHidden = true (after a scroll) -> expanded cards that left the viewport are closed,
     *    so the new cards coming into view keep the normal height
     */
    function syncReviewHeights(collapseHidden) {
      var track = document.querySelector(".lotus_test_15_B-reviews__track");
      if (!track) return;
      var cards = track.querySelectorAll(".lotus_test_15_B-review");
      if (!cards.length) return;
      var trackRect = track.getBoundingClientRect();
      var inView = [], heights = [], base = 0, visibleMax = 0, i;

      for (i = 0; i < cards.length; i++) {
        inView[i] = isInView(cards[i], trackRect);
        if (collapseHidden && !inView[i]) collapseCard(cards[i]);
        cards[i].style.minHeight = "";
      }
      for (i = 0; i < cards.length; i++) {
        heights[i] = cards[i].offsetHeight;
        if (!cards[i].querySelector(".lotus_test_15_B-review__text.is-open")) base = Math.max(base, heights[i]);
        if (inView[i]) visibleMax = Math.max(visibleMax, heights[i]);
      }
      for (i = 0; i < cards.length; i++) {
        var h = inView[i] ? Math.max(base, visibleMax) : base;
        if (h) cards[i].style.minHeight = h + "px";
      }
    }

    function refreshReviews(collapseHidden) {
      syncReviewHeights(collapseHidden);
      updateDots();
    }

    function setActiveDot(dotsWrap, active) {
      for (var j = 0; j < dotsWrap.children.length; j++) {
        dotsWrap.children[j].classList.toggle("is-active", j === active);
        dotsWrap.children[j].setAttribute("aria-current", j === active ? "true" : "false");
      }
    }

    function updateDots() {
      var section = document.getElementById("lotus_test_15_B-reviews");
      if (!section) return;
      var track = section.querySelector(".lotus_test_15_B-reviews__track");
      var dotsWrap = section.querySelector(".lotus_test_15_B-reviews__dots");
      if (!track || !dotsWrap) return;
      var m = getMetrics(track);
      var pages = Math.max(1, Math.ceil(REVIEWS.length / m.perView));
      if (dotsWrap.children.length !== pages) {
        var html = "";
        for (var i = 0; i < pages; i++) {
          html += '<button type="button" class="lotus_test_15_B-reviews__dot" data-page="' + i + '" aria-label="Go to reviews page ' + (i + 1) + '"></button>';
        }
        dotsWrap.innerHTML = html;
      }
      var maxScroll = track.scrollWidth - track.clientWidth;
      var active = track.scrollLeft >= maxScroll - 2 ? pages - 1 : Math.round(track.scrollLeft / (m.step * m.perView));
      setActiveDot(dotsWrap, Math.min(pages - 1, Math.max(0, active)));
      var prev = section.querySelector(".lotus_test_15_B-reviews__arrow--prev");
      var next = section.querySelector(".lotus_test_15_B-reviews__arrow--next");
      if (prev) prev.disabled = track.scrollLeft <= 2;
      if (next) next.disabled = maxScroll <= 0 || track.scrollLeft >= maxScroll - 2;
    }

    /* ---------- fleet ---------- */
    function updateFleet() {
      var fleet = document.querySelector(SEL.fleet);
      if (!fleet) return;
      fleet.classList.add("lotus_test_15_B-fleet");
      /* site renders two headings (mobile/desktop) – show the "Locally-owned…" one on all devices */
      var heads = fleet.querySelectorAll("h2");
      var show = null, hide = null;
      for (var i = 0; i < heads.length; i++) {
        var t = heads[i].textContent.trim();
        if (/^Locally-owned fleet/i.test(t)) show = heads[i].parentElement;
        else if (/^Fleet built/i.test(t)) hide = heads[i].parentElement;
      }
      if (show && hide) {
        show.classList.add("lotus_test_15_B-fleet-title-show");
        hide.classList.add("lotus_test_15_B-fleet-title-hide");
      } else if (hide && !show) {
        /* fallback: mobile heading missing – update desktop heading text directly */
        /* original h2 is hidden (not edited) so React can still update it on a language switch */
        var h = hide.querySelector("h2");
        if (h && !document.getElementById("lotus_test_15_B-fleet-title")) {
          h.style.display = "none";
          h.setAttribute("data-lotus_test_15_B-hidden", "1");
          h.insertAdjacentHTML("afterend", '<h2 id="lotus_test_15_B-fleet-title" class="' + h.className + '">Locally-owned fleet, built for the Icelandic road</h2>');
        }
      }
    }

    /* ---------- plan your trip (blog) ---------- */
    function parseBlog(html) {
      var doc = new DOMParser().parseFromString(html, "text/html");
      var links = doc.querySelectorAll('a[href^="/blog/"]');
      var seen = {}, posts = [];
      for (var i = 0; i < links.length && posts.length < BLOG_LIMIT; i++) {
        var a = links[i];
        var href = a.getAttribute("href");
        var img = a.querySelector("img");
        var title = a.querySelector("p.text-lg") || a.querySelectorAll("p")[1];
        if (seen[href] || !img || !title) continue;
        seen[href] = 1;
        var read = a.querySelector("p.text-xs");
        var tags = [];
        var badges = a.querySelectorAll('[data-slot="badge"]');
        for (var b = 0; b < badges.length; b++) tags.push(badges[b].textContent.trim());
        posts.push({
          href: href,
          img: img.getAttribute("src"),
          alt: img.getAttribute("alt") || "",
          tags: tags,
          read: read ? read.textContent.replace(/\s+/g, " ").trim() : "",
          title: title.textContent.trim()
        });
      }
      return posts;
    }

    function getBlogPosts(callback) {
      try {
        var cached = sessionStorage.getItem(BLOG_CACHE_KEY);
        if (cached) {
          var data = JSON.parse(cached);
          if (data && data.length) return callback(data);
        }
      } catch (e) { log(e); }

      fetch(BLOG_URL, { credentials: "same-origin" })
        .then(function (res) { if (!res.ok) throw new Error(res.status); return res.text(); })
        .then(function (html) {
          var posts = parseBlog(html);
          if (posts.length) {
            try { sessionStorage.setItem(BLOG_CACHE_KEY, JSON.stringify(posts)); } catch (e) { log(e); }
          }
          callback(posts);
        })
        .catch(function (e) { log(e); callback([]); });
    }

    function blogCard(p) {
      var tags = "";
      for (var i = 0; i < p.tags.length; i++) tags += '<span class="lotus_test_15_B-plan__tag">' + esc(p.tags[i]) + "</span>";
      return '<a class="lotus_test_15_B-plan__card" href="' + esc(p.href) + '">' +
        '<div class="lotus_test_15_B-plan__media"><img src="' + esc(p.img) + '" alt="' + esc(p.alt) + '" loading="lazy">' +
        '<div class="lotus_test_15_B-plan__tags">' + tags + "</div></div>" +
        '<p class="lotus_test_15_B-plan__read">' + esc(p.read) + "</p>" +
        '<p class="lotus_test_15_B-plan__title">' + esc(p.title) + "</p></a>";
    }

    var blogRequested = false, blogFailed = false;
    function buildPlanTrip() {
      if (document.getElementById("lotus_test_15_B-plan") || blogRequested || blogFailed) return;
      blogRequested = true;
      getBlogPosts(function (posts) {
        blogRequested = false;
        if (!posts.length) { blogFailed = true; return; } // fallback: original "Before your trip" stays visible
        if (!isActive()) return; // user changed page/language while fetching (listener builds it on return)
        var fleet = document.querySelector(SEL.fleet);
        if (!fleet || document.getElementById("lotus_test_15_B-plan")) return;
        var cards = "";
        for (var i = 0; i < posts.length; i++) cards += blogCard(posts[i]);
        insertOnce("lotus_test_15_B-plan", fleet, "afterend",
          '<section id="lotus_test_15_B-plan" class="lotus_test_15_B-plan"><div class="lotus_test_15_B-container">' +
          '<h2 class="lotus_test_15_B-plan__heading">Plan your trip</h2>' +
          '<p class="lotus_test_15_B-plan__desc">Everything you need to make the most of Iceland — from route ideas and F-road know-how to the best stops along the Ring Road, straight from a team that actually lives here.</p>' +
          '<div class="lotus_test_15_B-plan__grid">' + cards + "</div></div></section>");
        hideSection("Before your trip", "lotus_test_15_B-plan");
      });
    }

    /* hide original section only after its replacement exists (fallback: original stays visible) */
    function hideSection(headingText, replacementId) {
      if (!document.getElementById(replacementId)) return;
      var heads = document.querySelectorAll("main section h2");
      for (var i = 0; i < heads.length; i++) {
        if (heads[i].textContent.trim() === headingText) {
          var sec = heads[i].closest("section");
          if (sec && !sec.id) sec.classList.add("lotus_test_15_B-hide");
        }
      }
    }

    /* ---------- events (bound once) ---------- */
    function eventHandlers() {
      if (window.lotus_test_15_B_events) return;
      window.lotus_test_15_B_events = true;

      live(".lotus_test_15_B-reviews__arrow", "click", function () {
        var track = document.querySelector(".lotus_test_15_B-reviews__track");
        if (!track) return;
        var dir = parseInt(this.getAttribute("data-dir"), 10) || 1;
        var m = getMetrics(track);
        track.scrollBy({ left: dir * m.step * m.perView, behavior: "smooth" });
      });

      live(".lotus_test_15_B-reviews__dot", "click", function () {
        var track = document.querySelector(".lotus_test_15_B-reviews__track");
        if (!track) return;
        var page = parseInt(this.getAttribute("data-page"), 10) || 0;
        var m = getMetrics(track);
        track.scrollTo({ left: page * m.step * m.perView, behavior: "smooth" });
        setActiveDot(this.parentNode, page);
      });

      live(".lotus_test_15_B-review__more", "click", function () {
        var text = this.previousElementSibling;
        if (!text) return;
        var open = text.classList.toggle("is-open");
        this.setAttribute("aria-expanded", open ? "true" : "false");
        this.textContent = open ? "Show less" : "Read more";
        syncReviewHeights(false); /* grow / shrink only the cards currently in view */
      });

      /* after scroll settles: close expanded cards that left the view, re-sync heights + dots */
      live(".lotus_test_15_B-reviews__track", "scroll", debounce(function () { refreshReviews(true); }, 120), true);

      /* media load failure -> remove injected media, original site image shows (error doesn't bubble, so capture) */
      live(".lotus_test_15_B-hero-video source, .lotus_test_15_B-hero-video, .lotus_test_15_B-hero-picture img", "error", function () {
        mediaFailed = true;
        var media = this.closest(".lotus_test_15_B-hero-media");
        if (media && media.parentNode) media.parentNode.removeChild(media);
      }, true);
      /* icon image failed -> hide it instead of showing a broken image */
      live("img.lotus_test_15_B-icon", "error", function () { this.style.display = "none"; }, true);
      live(".lotus_test_15_B-hero-video", "loadeddata", function () { playVideo(this); }, true);
      live("window", "visibilitychange", function () {
        if (!document.hidden) playVideo(document.querySelector(".lotus_test_15_B-hero-video"));
      });
      live("window", "resize", debounce(function () { refreshReviews(false); }, 200));
      live("window", "load", function () { refreshReviews(false); });

      /* SPA navigation (incl. browser back/forward) */
      live("window", "locationchange", onPageChange);
      live("window", "popstate", function () { window.dispatchEvent(new Event("locationchange")); });
    }

    /* ---------- apply / remove ---------- */
    function apply() {
      try { buildHero(); } catch (e) { log(e); }
      try { buildReviews(); } catch (e) { log(e); }
      try { updateFleet(); } catch (e) { log(e); }
      try { buildPlanTrip(); } catch (e) { log(e); }
    }

    /* undo everything – used on other pages and other languages
       (the site re-uses the same hero DOM when the language is switched) */
    function removeVariation() {
      var ids = ["hero-heading", "hero-desc", "hero-usps", "hero-rating", "reviews", "plan", "fleet-title"];
      for (var i = 0; i < ids.length; i++) removeEl(document.getElementById("lotus_test_15_B-" + ids[i]));
      var media = document.querySelectorAll(".lotus_test_15_B-hero-media, .lotus_test_15_B-hero-overlay");
      for (var m = 0; m < media.length; m++) removeEl(media[m]);
      var classes = ["lotus_test_15_B-hide", "lotus_test_15_B-hero-done", "lotus_test_15_B-fleet", "lotus_test_15_B-fleet-title-show", "lotus_test_15_B-fleet-title-hide"];
      for (var c = 0; c < classes.length; c++) {
        var els = document.querySelectorAll("." + classes[c]);
        for (var e = 0; e < els.length; e++) els[e].classList.remove(classes[c]);
      }
      var hiddenH = document.querySelectorAll("[data-lotus_test_15_B-hidden]");
      for (var k = 0; k < hiddenH.length; k++) {
        hiddenH[k].style.display = "";
        hiddenH[k].removeAttribute("data-lotus_test_15_B-hidden");
      }
      document.body.classList.remove(variation_name);
    }

    /* test runs only on the English homepage */
    /* booking box exists only on the homepage hero (also in the DOM on mobile, just hidden) */
    var HERO_SELECTOR = "html[lang='en-us'] " + SEL.wrap + " " + SEL.heroBookingDesktop;
    function isActive() {
      return location.pathname.replace(/\/+$/, "") === "" && !!document.querySelector(HERO_SELECTOR);
    }

    var applied = false;
    function update() {
      if (!isActive()) {
        if (applied) removeVariation();
        applied = false;
        return;
      }
      applied = true;
      document.body.classList.add(variation_name);
      apply(); /* every builder skips what already exists */
    }

    /* re-run update once the new page renders; only one wait runs at a time */
    var pageWait;
    function onPageChange() {
      clearInterval(pageWait);
      update(); /* removes the variation right away when leaving the homepage */
      if (location.pathname.replace(/\/+$/, "") === "") pageWait = waitForElement(HERO_SELECTOR, update, 50, 15000);
    }

    /* pushState / replaceState fire "locationchange" (patched once) */
    function listener() {
      if (window.lotus_test_15_B_history) return;
      window.lotus_test_15_B_history = true;
      history.pushState = (function (f) {
        return function pushState() {
          var ret = f.apply(this, arguments);
          window.dispatchEvent(new Event("locationchange"));
          return ret;
        };
      })(history.pushState);
      history.replaceState = (function (f) {
        return function replaceState() {
          var ret = f.apply(this, arguments);
          window.dispatchEvent(new Event("locationchange"));
          return ret;
        };
      })(history.replaceState);
    }

    function init() {
      if (window.lotus_test_15_B_init) return;
      window.lotus_test_15_B_init = true;
      eventHandlers();
      listener();
      onPageChange();
    }

    /* Initialize variation (on every page, so SPA navigation to the homepage is caught too) */
    waitForElement("body", init, 50, 15000);
  } catch (e) {
    if (typeof debug !== "undefined" && debug) console.log(e, "error in Test lotus_test_15_B");
  }
})();