(function () {
  try {
    /* main variables */
    var debug = 1;
    var variation_name = "cre-t-88";

    function waitForElement(selector, trigger) {
      var interval = setInterval(function () {
        var element = document.querySelector(selector);
        if (element) {
          clearInterval(interval);
          trigger(element);
        }
      }, 50);

      setTimeout(function () {
        clearInterval(interval);
      }, 15000);
    }

    /* Insert Subheading */
    function addSubheading(heading) {
      if (!heading) return;

      // Prevent duplicate insertion
      if (!document.querySelector('.Cre_subheading')) {
        heading.insertAdjacentHTML(
          'afterend',
          '<p class="Cre_subheading">*Based on an independent review of 29 U.S. providers</p>'
        );
      }
    }

    /* Update Description Text */
    function updateDescription(desc) {
      if (!desc) return;

      desc.innerHTML =
        '500k+ pet owners have used our free comparison service to secure the lowest <span class="Cre_highlight">price—guaranteed.</span> We donate $15 for every policy purchased.';
    }

    /* Variation Init */
    function init() {
      if (document.body.classList.contains(variation_name)) return;

      document.body.classList.add(variation_name);

      waitForElement(".ct-headline.home-heading", addSubheading);
      waitForElement(".page-description .ct-span p:first-child", updateDescription);
    }

    waitForElement("body", init);

  } catch (e) {
    if (debug) console.log(e, "error in Test " + variation_name);
  }
})();