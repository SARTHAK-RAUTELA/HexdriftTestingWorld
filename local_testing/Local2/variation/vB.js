(function () {
  try {
    /* main variables */
    var debug = 0;
    var variation_name = "cre-t-1-updatebanner";

 

    function init() {
      if (document.querySelector(`.${variation_name}`)) return;
      document.body.classList.add(variation_name);

      /* Initialise variation */
      waitForElement("body", init, 50, 15000);
    }

    /* Initialise variation */
    init();
  } catch (e) {
    if (debug) console.log(e, "error in Test " + variation_name);
  }
})();