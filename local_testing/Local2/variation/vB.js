(function () {
  try {
    var debug = 0;
    var variation_name = "cre-t-162";

    // Placeholder content — edit these values to update the quote
    var config = {
      quoteText: "“Several times the insurance has made the difference between treatment and euthanasia.”",
      quoteAuthor: "Dr. Diane Deresienski • Veterinarian, Bowman Animal Hospital",
      quoteSource: "Source: The New York Times",
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

    // Variation 5
    var sectionHTML = `<section id="cre-t-162-section" class="cre-t-162-section">
  <div class="cre-t-162-quote-box">
    <p class="cre-t-162-quote-text">${config.quoteText}</p>
    <p class="cre-t-162-quote-author">${config.quoteAuthor}</p>
    <p class="cre-t-162-quote-source">${config.quoteSource}</p>
  </div>
</section>`;

    function init() {
      if (document.querySelector('#cre-t-162-section')) return;

      var comparisonSection = document.querySelector('#comparison-section');
      if (!comparisonSection) return;

      comparisonSection.insertAdjacentHTML('beforebegin', sectionHTML);
    }

    waitForElement('#comparison-section', init);
  } catch (e) {
    if (debug) console.log(e, 'error in Test ' + variation_name);
  }
})();