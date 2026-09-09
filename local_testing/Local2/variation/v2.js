(function () {
  try {
    var debug = 0;
    var variation_name = "cre-t-157";
    var imageBase = "https://v2.crocdn.com/PetInsurance/";


      var quotes = [
      {
        text: "“Several times the insurance has made the difference between treatment and euthanasia.”",
        author: "Dr. Diane Deresienski • Veterinarian, Bowman Animal Hospital",
        authorName: "Dr. Diane Deresienski",
        authorRole: "Veterinarian, Bowman Animal Hospital",
        authorImg: "diane.png",
        sourceImg: "nyt_new.png",
        sourceAlt: "The New York Times"
      },
      {
        text: "“Pet insurance is practically a no-brainer and can be literally life-saving for some pets.”",
        author: "Dr. Rebecca Greenstein • Veterinary Medical Advisor, Rover",
        authorName: "Dr. Rebecca Greenstein",
        authorRole: "Veterinary Medical Advisor, Rover",
        authorImg: "rebecca.png",
        sourceImg: "nyp_new.png",
        sourceAlt: "New York Post"
      },
      {
        text: "“After 22 years of practicing veterinary medicine, I’ve never had a single pet parent say they regretted having insurance.”",
        author: "Dr. Katy Nelson • Senior Veterinarian, Chewy",
        authorName: "Dr. Katy Nelson",
        authorRole: "Senior Veterinarian, Chewy",
        authorImg: "katy.png",
        sourceImg: "cbs_new.png",
        sourceAlt: "CBS News"
      },
      {
        text: "“It’s about protecting yourself from one unexpected $8,000 emergency that could force you to choose between your finances and your best friend.”",
        author: "Dr. Karen Halligan • Chief Veterinary Officer",
        authorName: "Dr. Karen Halligan",
        authorRole: "Chief Veterinary Officer",
        authorImg: "karen.png",
        sourceImg: "nyp_new.png",
        sourceAlt: "New York Post"
      }
    ];

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

    function waitForSwiper(trigger) {
      var interval = setInterval(function () {
        if (typeof window.Swiper !== "undefined") {
          clearInterval(interval);
          trigger();
        }
      }, 50);
      setTimeout(function () {
        clearInterval(interval);
      }, 15000);
    }

    function addSwiperLibrary() {
      if (!document.querySelector('link[href*="swiper-bundle"]')) {
        var styleTag = document.createElement("link");
        styleTag.rel = "stylesheet";
        styleTag.href = "https://cdnjs.cloudflare.com/ajax/libs/Swiper/8.3.2/swiper-bundle.min.css";
        document.querySelector("head").appendChild(styleTag);
      }

      if (typeof window.Swiper === "undefined" && !document.querySelector('script[src*="swiper-bundle"]')) {
        var scriptTag = document.createElement("script");
        scriptTag.src = "https://cdnjs.cloudflare.com/ajax/libs/Swiper/8.3.2/swiper-bundle.min.js";
        document.querySelector("head").appendChild(scriptTag);
      }
    }


    var quoteMarkSVG = '<svg xmlns="http://www.w3.org/2000/svg" width="51" height="36" viewBox="0 0 51 36" fill="none"><path d="M5.1 36L12 24C8.7 24 5.875 22.825 3.525 20.475C1.175 18.125 0 15.3 0 12C0 8.7 1.175 5.875 3.525 3.525C5.875 1.175 8.7 0 12 0C15.3 0 18.125 1.175 20.475 3.525C22.825 5.875 24 8.7 24 12C24 13.15 23.8625 14.2125 23.5875 15.1875C23.3125 16.1625 22.9 17.1 22.35 18L12 36H5.1ZM32.1 36L39 24C35.7 24 32.875 22.825 30.525 20.475C28.175 18.125 27 15.3 27 12C27 8.7 28.175 5.875 30.525 3.525C32.875 1.175 35.7 0 39 0C42.3 0 45.125 1.175 47.475 3.525C49.825 5.875 51 8.7 51 12C51 13.15 50.8625 14.2125 50.5875 15.1875C50.3125 16.1625 49.9 17.1 49.35 18L39 36H32.1Z" fill="#8C8EA0" fill-opacity="0.07"/></svg>';

  
  

    function buildSlidesHTML() {
      var slidesHtml = "";
      quotes.forEach(function (quote) {
        slidesHtml += `<div class="swiper-slide">
    <div class="cre-t-157-quote-box">
      <img class="cre-t-157-author-photo" src="${imageBase}${quote.authorImg}" alt="${quote.author}">
      <div class="cre-t-157-quote-content">
        <p class="cre-t-157-quote-text">${quote.text}</p>
        <p class="cre-t-157-quote-author"><span class="cre-t-157-author-name">${quote.authorName}</span> • ${quote.authorRole}</p>
      </div>
      <img class="cre-t-157-quote-source" src="${imageBase}${quote.sourceImg}" alt="${quote.sourceAlt}">
      <span class="cre-t-157-quote-mark" aria-hidden="true">${quoteMarkSVG}</span>
    </div>
  </div>`;
      });
      return slidesHtml;
    }

    function init() {
      if (document.querySelector('#cre-t-157-section')) return;

      var comparisonSection = document.querySelector('#comparison-section');
      if (!comparisonSection) return;

      var sectionHTML = `<section id="cre-t-157-section" class="cre-t-157-section">
  <div class="swiper cre-t-157-swiper">
    <div class="swiper-wrapper">${buildSlidesHTML()}</div>
    <div class="swiper-pagination"></div>
  </div>
</section>`;

      comparisonSection.insertAdjacentHTML('beforebegin', sectionHTML);

      // Convert Experiments conversion tracking - any click/engagement on quote element
      var quoteSection = document.querySelector('#cre-t-157-section');
      function fireQuoteGoal() {
        window._conv_q = window._conv_q || [];
        _conv_q.push(["triggerConversion", "100038194"]);
      }
      if (quoteSection) {
        quoteSection.addEventListener('click', fireQuoteGoal);
      }

      // Convert Experiments conversion tracking - manually scroll carousel (V1 only)
      function fireManualScrollGoal() {
        window._conv_q = window._conv_q || [];
        _conv_q.push(["triggerConversion", "100038191"]);
      }

      waitForSwiper(function () {
        var swiper = new Swiper('.cre-t-157-swiper', {
          slidesPerView: 1,
          loop: true,
          autoHeight: true,
          threshold: 15,
          preventClicks: true,
          preventClicksPropagation: true,
          pagination: {
            el: '.swiper-pagination',
            clickable: true
          }
        });

        let isAutoplay = false;

        swiper.on('autoplay', () => {
          isAutoplay = true;
        });

        swiper.on('slideChangeTransitionEnd', () => {
          if (isAutoplay) {
            isAutoplay = false;
          } else {
            fireQuoteGoal();
            fireManualScrollGoal();
          }
        });
      });
    }

    waitForElement('#comparison-section', init);
    addSwiperLibrary();
  } catch (e) {
    if (debug) console.log(e, 'error in Test ' + variation_name);
  }
})();