(function() {
    try {
        /* main variables */
        var debug=0;
        var variation_name="cre-t-09";

        /* all Pure helper functions */

        function waitForElement(selector,trigger,delayInterval=50,delayTimeout=15000) {
            var interval=setInterval(function() {
                if(document&&document.querySelector(selector)&&document.querySelectorAll(selector).length>0) {
                    clearInterval(interval);
                    trigger();
                }
            },delayInterval);
            setTimeout(function() {
                clearInterval(interval);
            },delayTimeout);
        }

        /* Variation functions */

        /* Variation Init */
        function init() {

            document.body.classList.add(variation_name)

            waitForElement(".cre-t-05-how-it-works",function() {
                document.body.classList.add('cre-t-05')
            },50,15000);

        }

        /* Initialise variation */
        waitForElement(".pca-header .pay-new-nav .nav-actions .emp",init,50,15000);
    } catch(e) {
        if(debug) console.log(e,"error in Test "+variation_name);
    }
})();