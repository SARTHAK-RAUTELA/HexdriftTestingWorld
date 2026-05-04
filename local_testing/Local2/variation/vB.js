(function () {
  try {
    /* main variables */
    var debug = 0;
    var variation_name = "cre-t-117";

    var redirectUrl = "https://rentersinsurancegurus.com/comparison/";

    /* Hide page immediately to prevent flicker before redirect */
    document.documentElement.style.visibility = "hidden";

    window.location.replace(redirectUrl);

  } catch (e) {
    document.documentElement.style.visibility = "";
    if (debug) console.log(e, "error in Test " + variation_name);
  }
})();