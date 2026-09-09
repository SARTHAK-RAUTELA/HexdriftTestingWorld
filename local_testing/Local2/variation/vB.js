(function () {
  try {
    var debug = 0;
    var variation_name = "cre-t-157";
    var imageBase = "https://v2.crocdn.com/PetInsurance/";

    // V1: new design, single quote, no carousel (V5 from SWF145)
    var quote = {
      text: "“Several times the insurance has made the difference between treatment and euthanasia.”",
      author: "Dr. Diane Deresienski • Veterinarian, Bowman Animal Hospital",
      authorName: "Dr. Diane Deresienski",
      authorRole: "Veterinarian, Bowman Animal Hospital",
      authorImg: "diane.png",
      sourceImg: "nyt_new.png",
      sourceAlt: "The New York Times"
    };

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

    var quoteMarkSVG = '<svg xmlns="http://www.w3.org/2000/svg" width="51" height="36" viewBox="0 0 51 36" fill="none"><path d="M5.1 36L12 24C8.7 24 5.875 22.825 3.525 20.475C1.175 18.125 0 15.3 0 12C0 8.7 1.175 5.875 3.525 3.525C5.875 1.175 8.7 0 12 0C15.3 0 18.125 1.175 20.475 3.525C22.825 5.875 24 8.7 24 12C24 13.15 23.8625 14.2125 23.5875 15.1875C23.3125 16.1625 22.9 17.1 22.35 18L12 36H5.1ZM32.1 36L39 24C35.7 24 32.875 22.825 30.525 20.475C28.175 18.125 27 15.3 27 12C27 8.7 28.175 5.875 30.525 3.525C32.875 1.175 35.7 0 39 0C42.3 0 45.125 1.175 47.475 3.525C49.825 5.875 51 8.7 51 12C51 13.15 50.8625 14.2125 50.5875 15.1875C50.3125 16.1625 49.9 17.1 49.35 18L39 36H32.1Z" fill="#8C8EA0" fill-opacity="0.07"/></svg>';

    var sectionHTML = `<section id="cre-t-157-section" class="cre-t-157-section">
  <div class="cre-t-157-quote-box">
    <img class="cre-t-157-author-photo" src="${imageBase}${quote.authorImg}" alt="${quote.author}">
    <div class="cre-t-157-quote-content">
      <p class="cre-t-157-quote-text">${quote.text}</p>
      <p class="cre-t-157-quote-author"><span class="cre-t-157-author-name">${quote.authorName}</span> • ${quote.authorRole}</p>
    </div>
    <img class="cre-t-157-quote-source" src="${imageBase}${quote.sourceImg}" alt="${quote.sourceAlt}">
    <span class="cre-t-157-quote-mark" aria-hidden="true">${quoteMarkSVG}</span>
  </div>
</section>`;

    function init() {
      if (document.querySelector('#cre-t-157-section')) return;

      var comparisonSection = document.querySelector('#comparison-section');
      if (!comparisonSection) return;

      comparisonSection.insertAdjacentHTML('beforebegin', sectionHTML);

      // Convert Experiments conversion tracking - any click/engagement on quote element
      var quoteSection = document.querySelector('#cre-t-157-section');
      if (quoteSection) {
        quoteSection.addEventListener('click', function () {
          window._conv_q = window._conv_q || [];
          _conv_q.push(["triggerConversion", "100038194"]);
        });
      }
    }

    waitForElement('#comparison-section', init);
  } catch (e) {
    if (debug) console.log(e, 'error in Test ' + variation_name);
  }
})();