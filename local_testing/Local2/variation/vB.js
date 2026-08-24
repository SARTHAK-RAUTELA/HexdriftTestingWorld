(function () {
    try {
        var debug = 0;
        var variation_name = "UKRadiators-18";

        function waitForElement(selector, trigger) {
            var interval = setInterval(function () {
                if (
                    document &&
                    document.querySelector(selector) &&
                    document.querySelectorAll(selector).length > 0
                ) {
                    clearInterval(interval);
                    trigger();
                }
            }, 50);
            setTimeout(function () {
                clearInterval(interval);
            }, 15000);
        }


        function init() {
            document.querySelector('body').classList.add(variation_name);
        }

        waitForElement('body', init)

    } catch (e) {
        if (debug) console.log(e, "error in Test " + variation_name);
    }
})();