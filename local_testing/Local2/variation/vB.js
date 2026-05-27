(function () {
  try {
    /* main variables */
    var debug = 1;
    var variation_name = "cre-t-07";
    var config = {
      bannerLeft: "http://v2.crocdn.com/AFP/test7/cre-07-banner-left.jpg",
      bannerRight: "http://v2.crocdn.com/AFP/test7/cre-07-banner-right.jpeg",
      bannerBottom: "http://v2.crocdn.com/AFP/test7/cre-07-banner-bottom.jpeg",
      fireIcon: "http://v2.crocdn.com/AFP/test7/cre-07-fire-icon.svg",
      checkCircle: "http://v2.crocdn.com/AFP/test7/cre-07-check-circle.svg"
    };

    /* all Pure helper functions */

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

    function addClass(selector, className) {
      var element = typeof selector === "string" ? document.querySelector(selector) : selector;
      if (!element) return;
      if (element.classList) element.classList.add(className);
      else if (!element.className.match(new RegExp("\b" + className + "\b"))) {
        element.className += " " + className;
      }
    }

    function insertAfter(selector, html) {
      var element = typeof selector === "string" ? document.querySelector(selector) : selector;
      if (!element) return;
      if (typeof html === "string") {
        element.insertAdjacentHTML("afterend", html);
      } else if (html && html.nodeType === 1) {
        element.insertAdjacentElement("afterend", html);
      }
    }

    /* Variation functions */
    var newDescription = `
    <div class="cre-t-07-description">
      <div class="cre-t-07-description-container">
        <div class="cre-t-07-subheadline">
          Join 7,000+ treasury and finance professionals to step outside your day-to-day, reconnect with peers, and see how others are tackling the same challenges.
        </div>

        <div class="cre-t-07-bullet-list">
          <div class="cre-t-07-bullet">
            <img src="${config.checkCircle}" alt="check-circle">
            <div class="cre-t-07-bullet-text">140+ practitioner-led sessions and networking opportunities</div>
          </div>
          <div class="cre-t-07-bullet">
            <img src="${config.checkCircle}" alt="check-circle">
            <div class="cre-t-07-bullet-text">Ask other teams what worked and what didn’t</div>
          </div>
          <div class="cre-t-07-bullet">
            <img src="${config.checkCircle}" alt="check-circle">
            <div class="cre-t-07-bullet-text">Bring back ideas you can actually use</div>
          </div>
        </div>
      </div>
    </div>
    `;

    var newTimer = `
    <div class="cre-t-07-timer" style="max-height: 0; opacity: 0">
      <div class="cre-t-07-timer-inner">
        <img src="${config.fireIcon}" alt="fire-icon">
        <div class="cre-t-07-timer-text">
          <span class="cre-t-07-timer-savings">Save $675</span> · Ends in <span class="cre-t-07-timer-countdown"></span>
        </div>
      </div>
    </div>
    `;

    var newCTA = `
    <div class="cre-t-07-ctas">
      <div class="cre-t-07-cta-container">
        <a class="cre-t-07-cta-1" href="https://conference.financialprofessionals.org/registration">
          <span class="cre-t-07-cta-text">Register Now</span>
        </a>
        <a class="cre-t-07-cta-2" href="https://conference.financialprofessionals.org/program/overview/schedule">
          <span class="cre-t-07-cta-text">View Schedule</span>
        </a>
      </div>
      <div class="cre-t-07-cta-after-text">
        Need approval? <a class="cre-t-07-cta-after-link" href="https://conference.financialprofessionals.org/general-information/experience/convince">Make the case</a>
      </div>
    </div>
    `;

    var newBannerImages = `
    <div class="cre-t-07-banner-images">
      <div class="cre-t-07-banner-images-container">
        <div class="cre-t-07-banner-images-top">
          <div class="cre-t-07-banner-images-left">
            <img src="${config.bannerLeft}" alt="banner-left" fetchpriority="high">
          </div>

          <div class="cre-t-07-banner-images-right">
            <img src="${config.bannerRight}" alt="banner-right" fetchpriority="high">
          </div>
        </div>

        <div class="cre-t-07-banner-images-bottom">
          <img src="${config.bannerBottom}" alt="banner-bottom" fetchpriority="high">
          <div class="cre-t-07-banner-image-quote">
            <div class="cre-t-07-banner-image-quote-inner">
              <span class="cre-t-07-quote-text">“My day at work is busy. It's nonstop. This is the only opportunity where I get to learn, grow and develop.”</span>
              <span class="cre-t-07-quote-author">— Lora Burton, CTP, Managing Director, Treasury</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    `;

    function changeHeadline() {
      var headlineElement = document.querySelector(".banner .banner_contentCopy h1");
      if (headlineElement) {
        headlineElement.textContent = "The biggest event in treasury & finance";
      }
    }

    function changeDescription() {
      var targetPosition = document.querySelector('.banner .banner_contentCopy');
      var existingDescription = document.querySelector(".cre-t-07-description");
      if (!existingDescription && targetPosition) {
        insertAfter(targetPosition, newDescription);
      }
    }

    function changeCTA() {
      var timerElement = document.querySelector(".cre-t-07-timer");
      var targetPosition = document.querySelector('.banner .banner_buttonArea');
      var existingCTA = document.querySelector(".cre-t-07-ctas");
      
      if (timerElement) {
        targetPosition = timerElement;
      }
      
      if (!existingCTA && targetPosition) {
        insertAfter(targetPosition, newCTA);
      }
    }

    function changeBannerImage() {
      var existingBannerImages = document.querySelector(".cre-t-07-banner-images");
      var targetPosition = document.querySelector('.banner .banner_media');
      if (!existingBannerImages && targetPosition) {
        insertAfter(targetPosition, newBannerImages);
      }
    }

    function updateCountdown() {
      var countdownParent = document.querySelector(".cre-t-07-timer");
      var countdown = document.querySelector(".cre-t-07-timer-countdown");
      if (!countdownParent || !countdown) return;

      // Midnight at the end of 26 June 2026 in New York.
      // June is EDT, so the offset is -04:00.
      var target = new Date("2026-06-27T00:00:00-04:00").getTime();

      var now = Date.now();
      var diff = target - now;

      if (diff <= 0) {
        countdownParent.remove();
        clearInterval(window.cre_07_timer);
        return;
      }

      var totalMinutes = Math.floor(diff / 1000 / 60);

      var days = Math.floor(totalMinutes / (60 * 24));
      var hours = Math.floor((totalMinutes % (60 * 24)) / 60);
      var minutes = totalMinutes % 60;

      countdown.textContent = `${days}d ${hours}h ${minutes}m`;
      countdownParent.classList.add("cre-t-07-timer-active");
    }

    function addTimer() {
      var ctaContainer = document.querySelector(".banner .banner_buttonArea");
      var existingTimer = document.querySelector(".cre-t-07-timer");
      if (ctaContainer && !existingTimer) {
        insertAfter(ctaContainer, newTimer);
      }

      if (!window.cre_07_timer) {
        window.cre_07_timer = setInterval(updateCountdown, 1000);
      }
    }

    /* Variation Init */
    function init() {
      /* start your code here */
      // Your logic here
      if (debug) console.log(variation_name + " initialized");
      addClass("body", "cre-t-07");
      
      // Change Headline
      waitForElement(".banner .banner_contentCopy h1", changeHeadline);

      // Add description
      waitForElement(".banner .banner_contentCopy p", changeDescription);

      // Add timer 
      waitForElement(".banner .banner_buttonArea", addTimer);

      // Change CTA
      waitForElement(".banner .banner_buttonArea", changeCTA);

      // Change banner image
      waitForElement(".banner .banner_media", changeBannerImage);
    }

    /* Initialise variation */
    waitForElement(".banner .banner_container", init, 50, 15000);
  } catch (e) {
    if (debug) console.log(e, "error in Test " + variation_name);
  }
})();
