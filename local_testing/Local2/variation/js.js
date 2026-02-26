// The code added for the Convert manual and custom trigger of the tests.
(function () {
    try {
        //console.log("Under the global code")
        var debug = 1;
        /**
         * setup Team
         */
        // LIBRARY FUNCTIONS
        var lib = {
            waitForElement(selector, trigger, delayInterval, delayTimeout) {
                var interval = setInterval(function () {
                    if (document && document.querySelector(selector) && document.querySelectorAll(selector).length > 0) {
                        clearInterval(interval);
                        trigger();
                    }
                }, delayInterval);
                setTimeout(function () {
                    clearInterval(interval);
                }, delayTimeout);
            },
        };
        lib.waitForElement(
            "body",
            function () {
                // The following code will help in developing the test.
                if (document && document.querySelector && document.querySelector("body")) {
                    document.querySelector("body").dataset.path = window.location.pathname;
                    document.querySelector("body").dataset.url = window.location.href;

                    // Wait for 1 second before executing the code
                    setTimeout(() => {
                        // Define the page type from _conv_page_type
                        let pageType = _conv_page_type; // Assuming _conv_page_type is already defined

                        // Remove the class if pageType is not "list"
                        if (pageType !== "list") {
                            // Check if the classes exist on the body and remove them
                            if (document.body.classList.contains("cre-t-35")) {
                                document.body.classList.remove("cre-t-35");
                            }
                            if (document.body.classList.contains("cre-t-35-redirection")) {
                                document.body.classList.remove("cre-t-35-redirection");
                            }
                        }
                    }, 1000); // 1 second delay
                }
            },
            50,
            15000
        );
    } catch (e) {
        if (debug) console.log(e, "Error in Global JavaScript");
    }
})();
// CRO Mode (QA Test cookie)
(function () {
    // Utility Functions
    function setCookie(cname, cvalue, exdays) {
        const d = new Date();
        d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000); // Convert days to milliseconds
        let expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

    function getCookie(cname) {
        let name = cname + "=";
        let decodedCookie = decodeURIComponent(document.cookie);
        let cookies = decodedCookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
            let c = cookies[i].trim();
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return null;
    }
    // Enable or disable QA mode
    function enableQAMode(mode) {
        if (mode === "qa") {
            // console.log(`CRO Mode enabled: ${mode}`);
            setCookie("cro_mode", mode, 1); // Set cookie for 1 day
        } else {
            // console.log('CRO Mode disabled');
            setCookie("cro_mode", "", -1); // Clear cookie
        }
    }
    // Initialize CRO Mode
    function initCROMode() {
        const urlParams = new URLSearchParams(window.location.search);
        let mode = urlParams.get("cro_mode") || getCookie("cro_mode");
        if (mode === "qa") {
            enableQAMode(mode);
            // console.log("QA Mode Active");
            // Place any QA mode-specific logic here
        } else {
            console.log("QA Mode Inactive");
        }
    }
    // Run the initialization function
    initCROMode();
})();

// Logic for who lands on the homepage
window.addEventListener("load", function () {
    try {
        // Get the current URL
        const currentUrl = window.location.origin + window.location.pathname;
        // Define the homepage URL
        const homepageUrl = window.location.origin + "/";
        // Check if the user is on the homepage
        const isHomepage = currentUrl === homepageUrl || currentUrl === homepageUrl + "index.html";
        // Function to get a cookie by name
        function getCookie(cname) {
            var name = cname + "=";
            var ca = document.cookie.split(";");
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i].trim();
                if (c.indexOf(name) === 0) return c.substring(name.length, c.length);
            }
            return "";
        }
        // Function to set a session cookie
        function setBmCookie(cname, cvalue) {
            document.cookie = `${cname}=${cvalue}; path=/;`;
        }
        // Check if this is the user's first visit in this session
        const isFirstVisit = getCookie("homepageVisited") === "";
        // If the user lands on the homepage for the first time in the session
        if (isHomepage && isFirstVisit) {
            // Mark the homepage as visited using a session cookie
            setBmCookie("homepageVisited", "true");
            if (!window.AlreadyTriggeredTestName_FST21) {
                window.AlreadyTriggeredTestName_FST21 = true;
                // Run your custom logic here (no redirect, no modal)
                window.creT21TestActivated = 1;
                window._conv_q = window._conv_q || [];
                window._conv_q.push(["executeExperiment", "100046812"]);
                // console.log(
                //     "User landed on the homepage for the first time in this session."
                // );
            }
            // You can trigger tracking, analytics, or any custom event here
        }
    } catch (error) {
        // Log the error to the console for debugging
        console.error("An error occurred in the homepage visit script:", error);
    }
});
// The following code has been added for the custom trigger of the experiments
(function () {
    // Use a global object to persist experiment state
    window.activatedExperiments = window.activatedExperiments || new Map();
    /**
     * Checks if the current user matches the specified user type condition.
     * @param {string} userType - The user type to check against. Valid values are "logged-out-user" and "logged-in-user".
     * @returns {boolean} True if the current user matches the specified user type, otherwise false.
     */
    function debounce(func, timeout = 300) {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => {
                func.apply(this, args);
            }, timeout);
        };
    }

    function observeSelector(selector, callback, options = {}) {
        const document = options.document || window.document;
        const processed = new Map();
        if (options.timeout || options.onTimeout) {
            throw `observeSelector options \`timeout\` and \`onTimeout\` are not yet implemented.`;
        }
        let obs;
        let isDone = false;
        const done = () => {
            if (obs) obs.disconnect();
            isDone = true;
        };
        const processElement = (el) => {
            if (!processed.has(el)) {
                processed.set(el, true);
                callback(el);
                if (options.once) {
                    done();
                    return true;
                }
            }
            return false;
        };
        const lookForSelector = () => {
            const elParent = document.documentElement;
            if (elParent.matches(selector) || elParent.querySelector(selector)) {
                const elements = elParent.querySelectorAll(selector);
                elements.forEach((el) => processElement(el));
            }
        };
        const debouncedLookForSelector = debounce(() => {
            lookForSelector();
        }, 100);
        // Initial check for the selector on page load
        lookForSelector();
        if (!isDone) {
            obs = new MutationObserver(() => {
                debouncedLookForSelector();
            });
            obs.observe(document, {
                attributes: false,
                childList: true,
                subtree: true,
            });
        }
        return done;
    }


    function observeTextChange(target, callback, delay = 250) {
        const element = typeof target === "string" ? document.querySelector(target) : target;

        if (!element) {
            return null;
        }

        let lastText = element.textContent;
        let debounceTimer = null;

        const observer = new MutationObserver(() => {
            const newText = element.textContent;

            if (newText === lastText) return;

            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                callback(newText, lastText);
                lastText = newText;
            }, delay);
        });

        observer.observe(element, {
            childList: true,
            characterData: true,
            subtree: true,
        });

        return observer;
    }



    function checkUserCondition(userType) {
        // Retrieve the current user type from global variable or body attribute
        const currentUserType = window._conv_customer_id || document.querySelector("body")?.getAttribute("users_type");
        if (!userType) return true;
        return currentUserType === userType;
    }
    // Check page type condition
    function checkPageType(pageType) {
        return new Promise((resolve, reject) => {
            if (!pageType) return resolve(true);
            var interval = setInterval(() => {
                if (typeof window._conv_page_type !== "undefined") {
                    clearInterval(interval);
                    resolve(window._conv_page_type === pageType);
                }
            }, 50);
            setTimeout(() => {
                clearInterval(interval);
                resolve(false);
            }, 5000);
        });
    }
    // Experiment class
    class Experiment {
        /**
         * Constructs an Experiment instance with the given parameters.
         * @param {Object} params - The parameters for the experiment.
         * @param {string} params.name - The name of the experiment.
         * @param {Function} params.callBack - The callback function to execute when the experiment is activated.
         * @param {Function} params.conditionToTriggerExperiment - The function that checks if the experiment should be triggered.
         * @param {string} params.userType - The user type for which the experiment is applicable.
         * @param {string} [params.pageType=""] - The page type for which the experiment is applicable.
         */
        constructor(params) {
            const {
                name,
                callBack,
                conditionToTriggerExperiment = null,
                userType = "",
                pageType = ""
            } = params;
            // Initialize instance variables
            this.name = name;
            this.callBack = callBack;
            this.conditionToTriggerExperiment = conditionToTriggerExperiment;
            this.userType = userType;
            this.pageType = pageType;
            // Initialize the experiment
            this.initialize();
        }
        // Initialize the experiment
        initialize() {
            // Check if the experiment is already active
            if (window.activatedExperiments.has(this.name)) {
                return;
            }
            // Store this instance in the global map
            window.activatedExperiments.set(this.name, this);
            // Initial check
            this.evaluateConditions();
        }
        /**
         * Evaluates the conditions of the experiment and activates it if all conditions are met.
         */
        async evaluateConditions() {
            // console.log("global evelvate code FirstTable---")
            const root = document.querySelector("html");
            // Check conditions
            const userCondition = checkUserCondition(this.userType);
            const pageCondition = await checkPageType(this.pageType);
            const triggerCondition = this.conditionToTriggerExperiment == null ? true : this.conditionToTriggerExperiment();
            // If all conditions are met, activate the experiment
            if (userCondition && pageCondition && triggerCondition) {
                if (!root.hasAttribute(this.name)) {
                    root.setAttribute(this.name, true);
                    this.callBack();
                }
            } else {
                // If conditions are not met, remove the experiment attribute
                root.removeAttribute(this.name);
            }
        }
    }
    /**
     * userType: guest, member, empty To check logged in and logged out user. Not user this if test need to run for all user
     * pageType: list => window._conv_page_type
     * conditionToTriggerExperiment: @function
     */
    // Add all experiment here
    var experiments = [{
        name: "test-03-LogOut",
        userType: "guest",
        pageType: "list",
        callBack: () => {
            // Execute experiment
            window.AlreadyTriggeredTestName_FST03_loggedout = 1;
            window._conv_q = window._conv_q || [];
            window._conv_q.push(["executeExperiment", "100046182"]);
            //console.log("Test03Found_loggedout_user");
        },
        conditionToTriggerExperiment: () => {
            return window.location.href.includes("www.firsttable.co");
        },
    },
    {
        name: "test-03-LogIn",
        userType: "member",
        pageType: "list",
        callBack: () => {
            // Execute experiment
            window.AlreadyTriggeredTestName_FST03_loggedin = 1;
            window._conv_q = window._conv_q || [];
            window._conv_q.push(["executeExperiment", "100046311"]);
            // console.log("Test03Found_loggedin_user");
        },
        conditionToTriggerExperiment: () => {
            return window.location.href.includes("www.firsttable.co");
        },
    },
    {
        name: "test-10",
        pageType: "list",
        callBack: () => {
            // Execute experiment
            window.AlreadyTriggeredTestName_FST10 = 1;
            window._conv_q = window._conv_q || [];
            window._conv_q.push(["executeExperiment", "100046388"]);
            //  console.log("Test10Found");
        },
        conditionToTriggerExperiment: () => {
            return window.location.href.includes("https://www.firsttable.co.nz/") && !(window.location.href.includes("https://www.firsttable.co.nz/christchurch") || window.location.href.includes("https://www.firsttable.co.nz/queenstown-lakes"));
        },
    },
    {
        name: "test-04",
        pageType: "list",
        callBack: () => {
            // Execute experiment
            window.AlreadyTriggeredTestName_FST04 = 1;
            window._conv_q = window._conv_q || [];
            window._conv_q.push(["executeExperiment", "100046433"]);
            // console.log("Test04Found");
        },
        conditionToTriggerExperiment: () => {
            return window.location.href.includes("www.firsttable.co") && (window.location.href.includes("https://www.firsttable.co.nz/christchurch") || window.location.href.includes("https://www.firsttable.co.nz/queenstown-lakes")) && !(window.location.href.includes("?regular-table-only=true") || window.location.href.includes("&regular-table-only=true"));
        },
    },
    {
        name: "test-07",
        pageType: "list",
        callBack: () => {
            // Execute experiment
            window.AlreadyTriggeredTestName_FST07 = 1;
            window._conv_q = window._conv_q || [];
            window._conv_q.push(["executeExperiment", "100046604"]);
            // console.log("Test07Found");
        },
        conditionToTriggerExperiment: () => {
            return window.location.href.includes("www.firsttable.co") && !(window.location.href.includes("/christchurch") || window.location.href.includes("/queenstown-lakes") || window.location.href.includes("/wanaka") || window.location.href.includes("/southland") || window.location.href.includes("/northland"));
        },
    },
    {
        name: "test-12",
        pageType: "list",
        callBack: () => {
            // Execute experiment
            window.AlreadyTriggeredTestName_FST12 = 1;
            window._conv_q = window._conv_q || [];
            window._conv_q.push(["executeExperiment", "100046637"]);
            // console.log("Test12Found");
        },
        conditionToTriggerExperiment: () => {
            return window.location.href.includes("www.firsttable.co") && !(window.location.href.includes("/christchurch") || window.location.href.includes("/queenstown-lakes"));
        },
    },
    {
        name: "test-20",
        pageType: "list",
        callBack: () => {
            // Execute experiment
            window.AlreadyTriggeredTestName_FST20 = 1;
            window._conv_q = window._conv_q || [];
            window._conv_q.push(["executeExperiment", "100046730"]);
            window._conv_q.push(["executeExperiment", "100047009"]);
            //  console.log("Test20Found");
        },
        conditionToTriggerExperiment: () => {
            return window.location.href.includes("www.firsttable.co") && !window.location.href.includes("regular-table-only=true");
        },
    },
    {
        name: "test-33",
        pageType: "list",
        callBack: () => {
            // Execute experiment
            window.AlreadyTriggeredTestName_FST33 = 1;
            window._conv_q = window._conv_q || [];
            window._conv_q.push(["executeExperiment", "100047600"]);
            //   console.log("Test33Found");
        },
        conditionToTriggerExperiment: () => {
            return window.location.href.includes("www.firsttable.co");
        },
    },

    {
        name: "test-35-personalize",
        pageType: "list",
        callBack: () => {
            // Execute experiment
            window.AlreadyTriggeredTestName_FST35Personalize = 1;
            window._conv_q = window._conv_q || [];
            window._conv_q.push(["executeExperiment", "100047742"]);
            console.log("Test35PersonalizeFound");
        },
        conditionToTriggerExperiment: () => {
            return window.location.href.includes("www.firsttable.co");
        },
    },

    {
        name: "test-14",
        pageType: "restaurant",
        callBack: () => {
            // Execute experiment
            window.AlreadyTriggeredTestName_FST14 = 1;
            window._conv_q = window._conv_q || [];
            window._conv_q.push(["executeExperiment", "100047014"]);
            //  console.log("Test14Found");
        },
        conditionToTriggerExperiment: () => {
            return window.location.href.includes("www.firsttable.co");
        },
    },
    {
        name: "Test-19",
        callBack: () => {
            // Execute experiment
            // console.log("test 19 activated")
            window.AlreadyTriggeredTestName_FST19 = 1;
            window._conv_q = window._conv_q || [];
            window._conv_q.push(["executeExperiment", "100046699"]);
            //  console.log("test 19 activated")
        },
        conditionToTriggerExperiment: () => {
            return window.localStorage.getItem("city") != null && window.location.pathname == "/" && window.location.href.includes("https://www.firsttable.co");
        },
    },
    {
        name: "test-22-control",
        pageType: "list",
        callBack: () => {
            // Execute experiment only if window.newUITest is "control"
            if (window.newUITest && window.newUITest === "control") {
                window.AlreadyTriggeredTestName_FST022_control = 1;
                window._conv_q = window._conv_q || [];
                window._conv_q.push(["executeExperiment", "100047004"]);
                // console.log("Test22-control executed");
            }
        },
        conditionToTriggerExperiment: () => {
            return window.location.href.includes("www.firsttable.co");
        },
    },
    {
        name: "test-22-variation",
        pageType: "list",
        callBack: () => {
            // Execute experiment only if window.newUITest is "variation"
            if (window.newUITest && window.newUITest === "variation") {
                window.AlreadyTriggeredTestName_FST022_variation = 1;
                window._conv_q = window._conv_q || [];
                window._conv_q.push(["executeExperiment", "100047005"]);
                // console.log("Test22-variation executed");
            }
        },
        conditionToTriggerExperiment: () => {
            return window.location.href.includes("www.firsttable.co");
        },
    },
    {
        name: "test-18-LogOut",
        userType: "guest",
        callBack: () => {
            const currentUrl = window.location.href;
            const currentPath = window.location.pathname;
            const checkForNZCondition = currentUrl.includes("https://www.firsttable.co.nz") && (currentPath.includes("/join/29") || currentPath.includes("/join/40") || currentPath.includes("/join/38"));
            const checkForAUCondition = currentUrl.includes("https://www.firsttable.com.au") && (currentPath.includes("/join/193") || currentPath.includes("/join/426"));
            // const checkForUKCondition = (currentUrl.includes("https://www.firsttable.co.uk") && (currentPath.includes("/join/1057") || currentPath.includes("/join/1695") || currentPath.includes("/join/1836") || currentPath.includes("/join/1532")))
            if (checkForNZCondition || checkForAUCondition) {
                //console.log("custom activation done test18 without observer")
                if (!window.AlreadyTriggeredTestName_FST18_loggedout) {
                    window.AlreadyTriggeredTestName_FST18_loggedout = 1;
                    window._conv_q = window._conv_q || [];
                    window._conv_q.push(["executeExperiment", "100048562"]);
                }
            } else {
                //console.log("custom activation done test18 with observer")
                observeSelector('[data-attribute="sign-up-page-modal"][data-attribute-social="true"]', function () {
                    // Execute experiment
                    if (!window.AlreadyTriggeredTestName_FST18_loggedout) {
                        window.AlreadyTriggeredTestName_FST18_loggedout = 1;
                        window._conv_q = window._conv_q || [];
                        window._conv_q.push(["executeExperiment", "100048562"]);
                    }
                });
            }
        },
        conditionToTriggerExperiment: () => {
            return window.location.href.includes("www.firsttable.co");
        },
    },
    {
        name: "test-25-LogOut",
        userType: "guest",
        callBack: () => {
            // console.log("custom activation done test18 with observer")
            observeSelector('[data-attribute="sign-up-modal"]', function () {
                if (document.querySelector('body[users_type="guest"]') && (window._conv_page_type == "list" || window._conv_page_type == "restaurant") && !window.AlreadyTriggeredTestName_FST25_loggedout) {
                    // console.log("test 25 activated")
                    window.AlreadyTriggeredTestName_FST25_loggedout = 1;
                    window._conv_q = window._conv_q || [];
                    window._conv_q.push(["executeExperiment", "100047193"]);
                }
            });
        },

        conditionToTriggerExperiment: () => {
            return window.location.href.includes("www.firsttable.co");
        },
    },
    {
        name: "test-45-LogOut",
        userType: "guest",
        callBack: () => {
            // console.log("custom activation done test18 with observer")
            observeSelector('[data-attribute="sign-up-modal"]', function () {
                if (document.querySelector('body[users_type="guest"]') && (window._conv_page_type == "list" || window._conv_page_type == "restaurant") && !window.AlreadyTriggeredTestName_FST45_loggedout) {
                    // console.log("test 45 activated")
                    window.AlreadyTriggeredTestName_FST45_loggedout = 1;
                    window._conv_q = window._conv_q || [];
                    window._conv_q.push(["executeExperiment", "100047827"]);
                }
            });
        },

        conditionToTriggerExperiment: () => {
            return window.location.href.includes("www.firsttable.co");
        },
    },
    {
        name: "test-39",
        pageType: "list",
        callBack: () => {
            // Execute experiment
            window.AlreadyTriggeredTestName_FST39 = 1;
            window._conv_q = window._conv_q || [];
            //   window._conv_q.push(["executeExperiment", "100047669"]);
            window._conv_q.push(["executeExperiment", "100048184"]);
            //    console.log("Test39Found");
        },
        conditionToTriggerExperiment: () => {
            return window.location.href.includes("www.firsttable.co");
        },
    },
    {
        name: "test-36-LogOut",
        userType: "guest",
        callBack: () => {
            // Execute experiment
            window.AlreadyTriggeredTestName_FST36_loggedout = 1;
            window._conv_q = window._conv_q || [];
            window._conv_q.push(["executeExperiment", "100047886"]);
            //console.log("Test36Found_loggedout_user");
        },
        conditionToTriggerExperiment: () => {
            return window.location.href.includes("www.firsttable.co");
        },
    },
    {
        name: "test-34",
        pageType: "list",
        callBack: () => {
            // Execute experiment
            window.AlreadyTriggeredTestName_FST34 = 1;
            window._conv_q = window._conv_q || [];
            window._conv_q.push(["executeExperiment", "100048183"]);
            //    console.log("Test34Found");
        },
        conditionToTriggerExperiment: () => {
            return window.location.href.includes("www.firsttable.co");
        },
    },
    {
        name: "test-37",
        pageType: "list",
        callBack: () => {
            // Execute experiment
            window.AlreadyTriggeredTestName_FST37_list = 1;
            window._conv_q = window._conv_q || [];
            window._conv_q.push(["executeExperiment", "100047731"]);
            //    console.log("Test37Found");
        },
        conditionToTriggerExperiment: () => {
            return window.location.href.includes("www.firsttable.co");
        },
    },
    {
        name: "test-37a",
        pageType: "restaurant",
        callBack: () => {
            // Execute experiment
            window.AlreadyTriggeredTestName_FST37_restaurant = 1;
            window._conv_q = window._conv_q || [];
            window._conv_q.push(["executeExperiment", "100047731"]);
            //    console.log("Test37Found");
        },
        conditionToTriggerExperiment: () => {
            return window.location.href.includes("www.firsttable.co");
        },
    },
    {
        name: "test-40",
        pageType: "list",
        callBack: () => {
            // Execute experiment
            window.AlreadyTriggeredTestName_FST40 = 1;
            window._conv_q = window._conv_q || [];
            window._conv_q.push(["executeExperiment", "100047779"]);
            //    console.log("Test40Found");
        },
        conditionToTriggerExperiment: () => {
            return window.location.href.includes("www.firsttable.co");
        },
    },
    {
        pageType: "list",
        name: "list-page",
        callBack: () => {
            console.log("adding list page attribute");
        },
        conditionToTriggerExperiment: () => {
            return window.location.href.includes("www.firsttable.co");
        },
    },
    {
        name: "test-29",
        pageType: "list",
        callBack: () => {
            // Execute experiment
            window.AlreadyTriggeredTestName_FST29 = 1;
            window._conv_q = window._conv_q || [];
            window._conv_q.push(["executeExperiment", "100047999"]);
            //    console.log("Test40Found");
        },
        conditionToTriggerExperiment: () => {
            return window.location.href.includes("www.firsttable.co");
        },
    },
    {
        name: "test-29-new",
        pageType: "list",
        callBack: () => {
            // Execute experiment
            window.AlreadyTriggeredTestName_FST29_new = 1;
            window._conv_q = window._conv_q || [];
            window._conv_q.push(["executeExperiment", "100048758"]);
            //    console.log("Test40Found");
        },
        conditionToTriggerExperiment: () => {
            return window.location.href.includes("www.firsttable.co");
        },
    },
    {
        name: "test-55-LogOut",
        userType: "guest",
        callBack: () => {
            // Execute experiment
            window.AlreadyTriggeredTestName_FST55_loggedout = 1;
            window._conv_q = window._conv_q || [];
            window._conv_q.push(["executeExperiment", "100048242"]);
            //console.log("Test55Found_loggedout_user");
        },
        conditionToTriggerExperiment: () => {
            return window.location.href.includes("www.firsttable.co");
        },
    },
    {
        name: "test-32",
        userType: "member",
        callBack: () => {
            // console.log("custom activation done test18 with observer")
            observeSelector('[data-attribute="Hide Red Text"]', function () {
                if (document.querySelector('body[users_type="member"]') && !window.AlreadyTriggeredTestName_FST32_loggedout) {
                    // console.log("test_32 activated")
                    window.AlreadyTriggeredTestName_FST32_loggedout = 1;
                    window._conv_q = window._conv_q || [];
                    window._conv_q.push(["executeExperiment", "100047872"]);
                }
            });
        },

        conditionToTriggerExperiment: () => {
            return window.location.href.includes("https://www.firsttable.co") && window.location.href.includes("/booking/details");
        },
    },
    {
        name: "test-50_1",
        pageType: "list",

        callBack: () => {
            // Execute experiment
            window.AlreadyTriggeredTestName_FST50_loggedout = 1;
            window._conv_q = window._conv_q || [];
            window._conv_q.push(["executeExperiment", "100048232"]);
            //console.log("Test55Found_loggedout_user");
        },

        conditionToTriggerExperiment: () => {
            return window.location.href.includes("https://www.firsttable.co.nz/");
        },
    },
    {
        name: "test-50_2",

        pageType: "restaurant",
        callBack: () => {
            // Execute experiment
            window.AlreadyTriggeredTestName_FST50_loggedout = 1;
            window._conv_q = window._conv_q || [];
            window._conv_q.push(["executeExperiment", "100048232"]);
            //console.log("Test55Found_loggedout_user");
        },

        conditionToTriggerExperiment: () => {
            return window.location.href.includes("https://www.firsttable.co.nz/");
        },
    },

    {
        name: "FST44_1",
        pageType: "list",

        callBack: () => {
            // Execute experiment
            console.log("test 44 activated");
            window.AlreadyTriggeredTestName_FST44_loggedout = 1;
            window._conv_q = window._conv_q || [];
            window._conv_q.push(["executeExperiment", "100048630"]);
            //console.log("Test55Found_loggedout_user");
        },

        conditionToTriggerExperiment: () => {
            return window.location.href.includes("https://www.firsttable.co");
        },
    },
    {
        name: "FST44_2",

        pageType: "restaurant",
        callBack: () => {
            // Execute experiment
            console.log("test 44 activated");
            window.AlreadyTriggeredTestName_FST44_loggedout = 1;
            window._conv_q = window._conv_q || [];
            window._conv_q.push(["executeExperiment", "100048630"]);
            //console.log("Test55Found_loggedout_user");
        },

        conditionToTriggerExperiment: () => {
            return window.location.href.includes("https://www.firsttable.co");
        },
    },
    {
        name: "test-74",
        pageType: "list",
        callBack: () => {
            // Execute experiment
            window.AlreadyTriggeredTestName_FST74_list = 1;
            window._conv_q = window._conv_q || [];
            window._conv_q.push(["executeExperiment", "100049278"]);
            //    console.log("Test74Found");
        },
        conditionToTriggerExperiment: () => {
            return window.location.href.includes("www.firsttable.co");
        },
    },
    {
        name: "test-74a",
        pageType: "restaurant",
        callBack: () => {
            // Execute experiment
            window.AlreadyTriggeredTestName_FST74_restaurant = 1;
            window._conv_q = window._conv_q || [];
            window._conv_q.push(["executeExperiment", "100049278"]);
            //    console.log("Test74Found");
        },
        conditionToTriggerExperiment: () => {
            return window.location.href.includes("www.firsttable.co");
        },
    },

    {
        name: "FST85",
        pageType: "list",
        callBack: () => {
            // Execute experiment
            window.AlreadyTriggeredTestName_FST85_restaurant = 1;
            window._conv_q = window._conv_q || [];
            window._conv_q.push(["executeExperiment", "100049375"]);
            //    console.log("Test74Found");
        },
        conditionToTriggerExperiment: () => {
            return window.location.href.includes("www.firsttable.co");
        },
    },

    {
        name: "test-86",
        pageType: "list",
        callBack: () => {
            // Execute experiment
            window.AlreadyTriggeredTestName_FST86_list = 1;
            window._conv_q = window._conv_q || [];
            window._conv_q.push(["executeExperiment", "100049119"]);
            //    console.log("Test86Found");
        },
        conditionToTriggerExperiment: () => {
            return window.location.href.includes("www.firsttable.co");
        },
    },
    {
        name: "test-86a",
        pageType: "restaurant",
        callBack: () => {
            // Execute experiment
            window.AlreadyTriggeredTestName_FST86_restaurant = 1;
            window._conv_q = window._conv_q || [];
            window._conv_q.push(["executeExperiment", "100049119"]);
            //    console.log("Test86Found");
        },
        conditionToTriggerExperiment: () => {
            return window.location.href.includes("www.firsttable.co");
        },
    },
    {
        name: "test-79",
        pageType: "restaurant",
        callBack: () => {
            // Execute experiment after a 0.5 second delay
            //  setTimeout(() => {
            window.AlreadyTriggeredTestName_FST79_restaurant = 1;
            window._conv_q = window._conv_q || [];
            window._conv_q.push(["executeExperiment", "100049552"]);
            // console.log("Test86Found");
            // }, 500); // 500ms delay (0.5 second)
        },
        conditionToTriggerExperiment: () => {
            return window.location.href.includes("www.firsttable.co") || window.location.href.includes("preview.firsttable.com") || window.location.href.includes("local.firsttable.com");
        },
    },

    {
        name: "test_79",
        pageType: "list",
        callBack: () => {
            // Execute experiment
            window.AlreadyTriggeredTestName_FST91_list = 1;
            window._conv_q = window._conv_q || [];
            window._conv_q.push(["executeExperiment", "100049126"]);
            //    console.log("Test86Found");
        },
        conditionToTriggerExperiment: () => {
            return window.location.href.includes("www.firsttable.co");
        },
    },

    {
        name: "test_91",
        pageType: "list",
        callBack: () => {
            // Execute experiment
            window.AlreadyTriggeredTestName_FST91_list = 1;
            window._conv_q = window._conv_q || [];
            window._conv_q.push(["executeExperiment", "100049423"]);
            //    console.log("Test91Found");
        },
        conditionToTriggerExperiment: () => {
            return window.location.href.includes("www.firsttable.co");
        },
    },

    {
        name: "test_89",
        pageType: "list",
        callBack: () => {
            // Execute experiment

            observeSelector('[data-mobile-filter="row-2"] [data-filter-label=suburb] span', function () {
                if (
                    document.querySelector('[data-mobile-filter="row-2"] [data-filter-label=suburb] span').textContent !== "Any suburb" &&
                    document.querySelector('[data-mobile-filter="row-2"] [data-filter-label=suburb] span').textContent !== "North London" &&
                    document.querySelector('[data-mobile-filter="row-2"] [data-filter-label=suburb] span').textContent !== "South East London" &&
                    document.querySelector('[data-mobile-filter="row-2"] [data-filter-label=suburb] span').textContent !== "West London" &&
                    document.querySelector('[data-mobile-filter="row-2"] [data-filter-label=suburb] span').textContent !== "North West London" &&
                    document.querySelector('[data-mobile-filter="row-2"] [data-filter-label=suburb] span').textContent !== "South West London" &&
                    document.querySelector('[data-mobile-filter="row-2"] [data-filter-label=suburb] span').textContent !== "East London" &&
                    document.querySelector('[data-mobile-filter="row-2"] [data-filter-label=suburb] span').textContent !== "South London" &&
                    document.querySelector('[data-mobile-filter="row-2"] [data-filter-label=suburb] span').textContent !== "Central London" &&
                    document.querySelector('[data-mobile-filter="row-2"] [data-filter-label=suburb] span').textContent !== "Dunedin" &&
                    document.querySelector('[data-mobile-filter="row-2"] [data-filter-label=suburb] span').textContent !== "Invercargill" &&
                    document.querySelector('[data-mobile-filter="row-2"] [data-filter-label=suburb] span').textContent !== "Arrowtown"
                ) {
                    console.log("remove 89");
                } else {
                    //push convert id
                    window.AlreadyTriggeredTestName_FST89_list = 1;
                    window._conv_q = window._conv_q || [];
                    window._conv_q.push(["executeExperiment", "100049592"]);
                }
            });
        },
        conditionToTriggerExperiment: () => {
            return window.location.href.includes("www.firsttable.co");
        },
    },

    {
        name: "test_111",
        pageType: "list",
        callBack: () => {
            function addLuxonScript(callback) {
                const script = document.createElement("script");
                script.src = "https://cdn.jsdelivr.net/npm/luxon@3/build/global/luxon.min.js";
                script.onload = callback;
                document.head.appendChild(script);
            }

            addLuxonScript(() => {
                const {
                    DateTime
                } = window.luxon;

                // --- Region-specific timezone mapping ---
                const regionMap = {
                    "https://www.firsttable.co.nz": "Pacific/Auckland",
                    "https://www.firsttable.com.au": "Australia/Sydney",
                    "https://www.firsttable.co.uk": "Europe/London",
                };

                const currentOrigin = window.location.origin;
                const userZone = regionMap[currentOrigin];

                if (!userZone) return; // If not one of the target sites, do nothing

                const nowInRegion = DateTime.now().setZone(userZone);
                window.Cre_t_111 = nowInRegion.toFormat("yyyy-MM-dd");

                // Check if before 6pm in that region
                const isBefore6pm = nowInRegion.hour < 18;

                if (isBefore6pm) {
                    // ✅ Execute your original exit intent / inactivity / rapid scroll code
                    runTriggerCode();
                }
            });

            function runTriggerCode() {
                if (window.innerWidth > 1023) {
                    if (!window.creT111) {
                        document.addEventListener("mouseout", (e) => {
                            if (e.clientY < 10) {
                                const suburbSpan = document.querySelector('[data-mobile-filter="row-2"] [data-filter-label=suburb] span');
                                if (suburbSpan) {
                                    const validSuburbs = ["Any suburb", "North London", "South East London", "West London", "North West London", "South West London", "East London", "South London", "Central London", "Dunedin", "Invercargill", "Arrowtown"];
                                    if (validSuburbs.includes(suburbSpan.textContent)) {
                                        console.log("test is triggering");
                                        window.AlreadyTriggeredTestName_FST111_list = 1;
                                        window._conv_q = window._conv_q || [];
                                        window._conv_q.push(["executeExperiment", "100050235"]);
                                    }
                                }
                            }
                        });
                        window.creT111 = true;
                    }
                } else {
                    let timer;
                    let inactive = false;

                    function resetTimer() {
                        if (inactive) inactive = false;
                        clearTimeout(timer);
                        timer = setTimeout(() => {
                            if (!inactive) {
                                inactive = true;
                                checkAndExecute();
                            }
                        }, 15000);
                    }

                    function checkAndExecute() {
                        const suburbSpan = document.querySelector('[data-mobile-filter="row-2"] [data-filter-label=suburb] span');
                        if (suburbSpan) {
                            const validSuburbs = ["Any suburb", "North London", "South East London", "West London", "North West London", "South West London", "East London", "South London", "Central London", "Dunedin", "Invercargill", "Arrowtown"];
                            if (validSuburbs.includes(suburbSpan.textContent)) {
                                window.AlreadyTriggeredTestName_FST111_list = 1;
                                window._conv_q = window._conv_q || [];
                                window._conv_q.push(["executeExperiment", "100049929"]);
                            }
                        }
                    }

                    let lastScroll = 0;
                    let lastTime = Date.now();
                    let isThrottled = false;

                    function detectRapidScroll() {
                        if (isThrottled) return; // Skip if throttled

                        const now = Date.now();
                        const currentScroll = window.scrollY;
                        const deltaScroll = lastScroll - currentScroll; // Positive for upscroll
                        const deltaTime = now - lastTime;
                        const speed = deltaScroll / (deltaTime || 1);

                        // Trigger only on rapid upscroll (positive deltaScroll, moving toward top)
                        if (deltaScroll > 200 && speed > 3.5) {
                            clearTimeout(window._scrollTriggerTimer);
                            window._scrollTriggerTimer = setTimeout(() => {
                                checkAndExecute();
                            }, 1200); // Increased to 2.5 seconds
                        }

                        lastScroll = currentScroll;
                        lastTime = now;
                        resetTimer();

                        // Throttle to limit processing to once every 100ms
                        isThrottled = true;
                        setTimeout(() => {
                            isThrottled = false;
                        }, 100);
                    }

                    ["mousemove", "keydown", "click", "touchstart"].forEach((evt) => {
                        document.addEventListener(evt, resetTimer, {
                            passive: true,
                        });
                    });
                    document.addEventListener("scroll", detectRapidScroll, {
                        passive: true,
                    });
                    resetTimer();
                }
            }
        },
        conditionToTriggerExperiment: () => {
            return window.location.href.includes("www.firsttable.co");
        },
    },

    {
        name: "test_95",
        pageType: "list",
        callBack: () => {
            // Execute experiment
            window.AlreadyTriggeredTestName_FST95_list = 1;
            window._conv_q = window._conv_q || [];
            window._conv_q.push(["executeExperiment", "100049980"]);
            //    console.log("Test95Found");
        },
        conditionToTriggerExperiment: () => {
            return window.location.href.includes("www.firsttable.co");
        },
    },

    {
        name: "test_100",
        pageType: "list",
        callBack: () => {
            // Execute experiment
            window.AlreadyTriggeredTestName_FST100_list = 1;
            window._conv_q = window._conv_q || [];
            window._conv_q.push(["executeExperiment", "100049779"]);
            //    console.log("Test100Found");
        },
        conditionToTriggerExperiment: () => {
            return window.location.href.includes("www.firsttable.co");
        },
    },
    {
        name: "test_104",
        pageType: "list",
        callBack: () => {
            // Execute experiment
            window.AlreadyTriggeredTestName_FST104_list = 1;
            window._conv_q = window._conv_q || [];
            window._conv_q.push(["executeExperiment", "100050229"]);
            //    console.log("Test104Found");
        },
        conditionToTriggerExperiment: () => {
            return window.location.href.includes("www.firsttable.co");
        },
    },
    {
        name: "test_116",
        pageType: "list",
        callBack: () => {
            // Execute experiment
            window.AlreadyTriggeredTestName_FST116_list = 1;
            window._conv_q = window._conv_q || [];
            window._conv_q.push(["executeExperiment", "100049994"]);
            // console.log("Test116Found");
        },
        conditionToTriggerExperiment: () => {
            return window.location.href.includes("www.firsttable.co");
        },
    },
    {
        name: "test_118",
        userType: "member",
        pageType: "list",

        callBack: () => {
            // console.log("custom activation done test18 with observer")
            observeSelector("body[users_loyalty_tier]", function () {
                window.AlreadyTriggeredTestName_FST118_list = 1;
                window._conv_q = window._conv_q || [];
                window._conv_q.push(["executeExperiment", "100049995"]);
            });
        },
        conditionToTriggerExperiment: () => {
            return window.location.href.includes("https://www.firsttable.co.nz/");
        },
    },
    {
        name: "test_119",
        pageType: "list",
        callBack: () => {
            // Execute experiment
            window.AlreadyTriggeredTestName_FST119_list = 1;
            window._conv_q = window._conv_q || [];
            window._conv_q.push(["executeExperiment", "100049961"]);
            // console.log("Test119Found");
        },
        conditionToTriggerExperiment: () => {
            return window.location.href.includes("www.firsttable.co");
        },
    },

    {
        name: "test_108",
        pageType: "list",
        callBack: () => {
            var country = ["/auckland", "/christchurch", "/wellington", "/queenstown-lakes", "/waikato", "/otago", "/bay-of-plenty", "/taupo", "/rotorua", "/nelson-and-tasman-district", "/melbourne", "/hobart", "/sydney", "/cairns", "/sunshine-coast", "/brisbane", "/gold-coast", "/london", "/bristol", "/brighton", "/london/west", "/birmingham", "/manchester"];

            if (country.includes(window.location.pathname)) {
                // Execute experiment
                window.AlreadyTriggeredTestName_FST108_list = 1;
                window._conv_q = window._conv_q || [];
                window._conv_q.push(["executeExperiment", "100050234"]);
            }
        },
        conditionToTriggerExperiment: () => {
            return window.location.href.includes("www.firsttable.co");
        },
    },
    {
        name: "test_121",
        pageType: "list",
        callBack: () => {
            // Execute experiment
            window.AlreadyTriggeredTestName_FST121_list = 1;
            window._conv_q = window._conv_q || [];
            window._conv_q.push(["executeExperiment", "100050341"]);
            // console.log("Test121Found");
        },
        conditionToTriggerExperiment: () => {
            return window.location.href.includes("www.firsttable.co");
        },
    },
    {
        name: "test_123",
        pageType: "list",
        callBack: () => {
            // Execute experiment
            window.AlreadyTriggeredTestName_FST123_list = 1;
            window._conv_q = window._conv_q || [];
            window._conv_q.push(["executeExperiment", "100050089"]);
            // console.log("Test123Found");
        },
        conditionToTriggerExperiment: () => {
            return window.location.href.includes("firsttable.co.nz/queenstown") || window.location.href.includes("firsttable.co.nz/auckland");
        },
    },
    {
        name: "test_123_ai_review",
        pageType: "list",
        callBack: () => {
            // Execute experiment
            window.AlreadyTriggeredTestName_FST123_list_ai_review = 1;
            window._conv_q = window._conv_q || [];
            window._conv_q.push(["executeExperiment", "100050754"]);
            // console.log("Test123_ai_reviewFound");
        },
        conditionToTriggerExperiment: () => {
            return window.location.href.includes("www.firsttable.co");
        },
    },
    {
        name: "test_125",
        pageType: "list",
        callBack: () => {
            // Execute experiment
            window.AlreadyTriggeredTestName_FST125_list = 1;
            window._conv_q = window._conv_q || [];
            window._conv_q.push(["executeExperiment", "100050338"]);
            // console.log("Test125Found");
        },
        conditionToTriggerExperiment: () => {
            return window.location.href.includes("www.firsttable.co");
        },
    },

    {
        name: "test-125a",
        pageType: "restaurant",
        callBack: () => {
            // Execute experiment
            window.AlreadyTriggeredTestName_FST125_restaurant = 1;
            window._conv_q = window._conv_q || [];
            window._conv_q.push(["executeExperiment", "100050338"]);
            //    console.log("Test125Found");
        },
        conditionToTriggerExperiment: () => {
            return window.location.href.includes("www.firsttable.co");
        },
    },

    //   {
    //     name: "test_138",
    //     pageType: "list",
    //     callBack: () => {
    //       var country = [
    //         '/auckland',
    //         '/christchurch',
    //         '/wellington',
    //         '/queenstown-lakes',
    //         '/waikato',
    //         '/otago',
    //         '/bay-of-plenty',
    //         '/taupo',
    //         '/rotorua',
    //         '/nelson-and-tasman-district',
    //         '/melbourne',
    //         '/hobart',
    //         '/sydney',
    //         '/cairns',
    //         '/sunshine-coast',
    //         '/brisbane',
    //         '/gold-coast',
    //         '/london',
    //         '/bristol',
    //         '/brighton',
    //         '/london/west',
    //         '/birmingham',
    //         '/manchester'
    //       ];

    //       if (country.includes(window.location.pathname)) {

    //         // Execute experiment
    //         window.AlreadyTriggeredTestName_FST138_list = 1;
    //         window._conv_q = window._conv_q || [];
    //         window._conv_q.push(["executeExperiment", "100050418"]);
    //       };

    //     },
    //     conditionToTriggerExperiment: () => {
    //       return window.location.href.includes("www.firsttable.co");
    //     },
    //   },
    {
        name: "test-141",
        pageType: "restaurant",
        callBack: () => {
            if (document.querySelector("[data-food-rating]") && !document.querySelector(".cre-t-141-test-triggered")) {
                // Execute experiment
                window.AlreadyTriggeredTestName_FST141_restaurant = 1;
                window._conv_q = window._conv_q || [];
                window._conv_q.push(["executeExperiment", "100051144"]);
                console.log("Test141Found");
                document.body.classList.add("cre-t-141-test-triggered");
            } else {
                if (!window.test141ScrollEvent) {
                    window.test141ScrollEvent = true;
                    window.addEventListener("scroll", () => {
                        if (document.querySelector("[data-food-rating]") && !document.querySelector(".cre-t-141-test-triggered")) {
                            // Execute experiment
                            window.AlreadyTriggeredTestName_FST141_restaurant = 1;
                            window._conv_q = window._conv_q || [];
                            window._conv_q.push(["executeExperiment", "100051144"]);
                            console.log("Test141Found");
                            document.body.classList.add("cre-t-141-test-triggered");
                        }
                    });
                }
            }
        },
        conditionToTriggerExperiment: () => {
            return window.location.href.includes("www.firsttable.co");
        },
    },
    {
        name: "test_139",
        pageType: "list",
        callBack: () => {
            // Execute experiment
            window.AlreadyTriggeredTestName_FST139_list = 1;
            window._conv_q = window._conv_q || [];
            window._conv_q.push(["executeExperiment", "100050430"]);
            // console.log("Test139Found");
        },
        conditionToTriggerExperiment: () => {
            return window.location.href.includes("www.firsttable.co");
        },
    },

    {
        name: "test-145",
        pageType: "list",
        callBack: () => {
            // Execute experiment
            if (document.querySelector('body[users_type="guest"]') && !window.AlreadyTriggeredTestName_FST145) {
                window.AlreadyTriggeredTestName_FST145 = 1;
                window._conv_q = window._conv_q || [];
                window._conv_q.push(["executeExperiment", "100050432"]);
                // console.log("test 25 activated")
            }
        },
        conditionToTriggerExperiment: () => {
            // Check if the user is on the "list" page
            return window.location.href.includes("www.firsttable.co");
        },
    },
    {
        name: "test-145-restaurant",
        pageType: "restaurant",
        callBack: () => {
            // Execute experiment
            if (document.querySelector('body[users_type="guest"]') && !window.AlreadyTriggeredTestName_FST145) {
                window.AlreadyTriggeredTestName_FST145 = 1;
                window._conv_q = window._conv_q || [];
                window._conv_q.push(["executeExperiment", "100050432"]);
                // console.log("test 25 activated")
            }
        },
        conditionToTriggerExperiment: () => {
            // Check if the user is on the "restaurant" page
            return window.location.href.includes("www.firsttable.co");
        },
    },
    {
        name: "test-126",
        pageType: "restaurant",
        callBack: () => {
            // Execute experiment
            window.AlreadyTriggeredTestName_FST126_restaurant = 1;
            window._conv_q = window._conv_q || [];
            window._conv_q.push(["executeExperiment", "100050540"]);
            console.log("Test126Found");
        },
        conditionToTriggerExperiment: () => {
            return window.location.href.includes("www.firsttable.co");
        },
    },

    {
        name: "test-173",
        pageType: "restaurant",
        callBack: () => {
            // Execute experiment
            window.AlreadyTriggeredTestName_FST173_restaurant = 1;
            window._conv_q = window._conv_q || [];
            window._conv_q.push(["executeExperiment", "100051210"]);
            // console.log("Test173Found");
        },
        conditionToTriggerExperiment: () => {
            return window.location.href.includes("www.firsttable.co");
        },
    },

    {
        name: "test-149",
        pageType: "list",
        callBack: () => {
            // Execute experiment
            window.AlreadyTriggeredTestName_FST149_list = 1;
            window._conv_q = window._conv_q || [];
            window._conv_q.push(["executeExperiment", "100050675"]);
            // console.log("Test149Found");
        },
        conditionToTriggerExperiment: () => {
            return window.location.href.includes("www.firsttable.co");
        },
    },

    {
        name: "test-148",
        pageType: "list",
        callBack: () => {
            // Execute experiment
            window.AlreadyTriggeredTestName_FST148_list = 1;
            window._conv_q = window._conv_q || [];
            window._conv_q.push(["executeExperiment", "100050581"]);
            // console.log("Test148Found");
        },
        conditionToTriggerExperiment: () => {
            return window.location.href.includes("www.firsttable.co");
        },
    },

    {
        name: "test-154",
        pageType: "list",
        callBack: () => {
            // Execute experiment
            window.AlreadyTriggeredTestName_FST154_list = 1;
            window._conv_q = window._conv_q || [];
            window._conv_q.push(["executeExperiment", "100050804"]);
            // console.log("Test154Found");
        },
        conditionToTriggerExperiment: () => {
            return window.location.href.includes("www.firsttable.co");
        },
    },

    {
        name: "test-129",
        pageType: "list",
        callBack: () => {
            // Execute experiment
            window.AlreadyTriggeredTestName_FST129_list = 1;
            window._conv_q = window._conv_q || [];
            window._conv_q.push(["executeExperiment", "100051139"]);
            window._conv_q.push(["executeExperiment", "100051170"]);
            // console.log("Test129Found");
        },
        conditionToTriggerExperiment: () => {
            return window.location.href.includes("www.firsttable.co");
        },
    },

    {
        name: "test-171",
        pageType: "list",
        callBack: () => {
            // Execute experiment
            window.AlreadyTriggeredTestName_FST171_list = 1;
            window._conv_q = window._conv_q || [];
            window._conv_q.push(["executeExperiment", "100051291"]);
            // console.log("Test171Found");
        },
        conditionToTriggerExperiment: () => {
            return window.location.href.includes("www.firsttable.co");
        },
    },


    {
        name: "test-147",
        pageType: "list",
        callBack: () => {
            // Execute experiment
            window.AlreadyTriggeredTestName_FST147_list = 1;
            window._conv_q = window._conv_q || [];
            window._conv_q.push(["executeExperiment", "100050984"]);
            // console.log("Test147Found");
        },
        conditionToTriggerExperiment: () => {
            return window.location.href.includes("www.firsttable.co");
        },
    },

    {
        name: "test-165",
        pageType: "list",
        callBack: () => {
            // Execute experiment
            window.AlreadyTriggeredTestName_FST165_list = 1;
            window._conv_q = window._conv_q || [];
            window._conv_q.push(["executeExperiment", "100051158"]);
            // console.log("Test165Found");
        },
        conditionToTriggerExperiment: () => {
            return window.location.href.includes("www.firsttable.co");
        },
    },

    {
        name: "test-151",
        pageType: "list",
        callBack: () => {
            // Execute experiment
            window.AlreadyTriggeredTestName_FST151_list = 1;
            window._conv_q = window._conv_q || [];
            window._conv_q.push(["executeExperiment", "100050987"]);
            // console.log("Test151Found");
        },
        conditionToTriggerExperiment: () => {
            return window.location.href.includes("www.firsttable.co");
        },
    },


    {
        name: "test-146",
        userType: "guest",
        pageType: "",
        callBack: () => {
            function startExitIntentObserver(options = {}) {
                const defaultOptions = {
                    idleTime: 8000,
                    mouseLeaveDelay: 1000,
                    tabChange: true,
                    eventName: "exit-intent",
                    debug: false,
                    scrollUpThreshold: {
                        mobile: 200,
                        desktop: 400,
                    },
                    mobileBreakpoint: 768,
                    scrollUpInterval: 100,
                    scrollInitDelay: 500,
                    enableOn: {
                        idleTime: ["mobile", "desktop"],
                        tabChange: ["mobile", "desktop"],
                        mouseLeave: ["desktop"],
                        scrollUp: ["mobile"],
                    },
                    ...options,
                };

                const t = defaultOptions;
                let timeoutIds = [];
                let eventListeners = [];
                let mouseLeaveTimeout = null;
                let scrollCheckInterval = null;

                function logDebug(message) {
                    t.debug && console.log(`exit-intent: ${message}`);
                }

                function isMobileDevice(breakpoint) {
                    return window.innerWidth <= breakpoint;
                }

                function getScrollThreshold(thresholdConfig, mobileBreakpoint) {
                    if (typeof thresholdConfig === "number") return thresholdConfig;
                    if (typeof thresholdConfig === "object" && thresholdConfig !== null) {
                        return isMobileDevice(mobileBreakpoint) ? thresholdConfig.mobile || 0 : thresholdConfig.desktop || 0;
                    }
                    return 0;
                }

                function isEnabledFor(triggerName) {
                    const device = isMobileDevice(t.mobileBreakpoint) ? "mobile" : "desktop";
                    const allowed = t.enableOn?.[triggerName] || ["mobile", "desktop"];
                    return allowed.includes(device);
                }

                function triggerEvent(reason) {
                    logDebug("triggered with reason: " + reason);
                    const event = new CustomEvent(t.eventName, {
                        detail: reason,
                    });
                    window.dispatchEvent(event);
                }

                // --- 1. Idle Time Trigger ---
                if (t.idleTime > 0 && isEnabledFor("idleTime")) {
                    let idleTimeoutId;

                    function resetIdleTimer() {
                        if (idleTimeoutId) clearTimeout(idleTimeoutId);

                        idleTimeoutId = setTimeout(() => triggerEvent("idleTime"), t.idleTime);

                        const index = timeoutIds.indexOf(idleTimeoutId);
                        if (index > -1) timeoutIds.splice(index, 1);
                        timeoutIds.push(idleTimeoutId);
                    }

                    const interactionEvents = ["mousemove", "keydown", "mousedown", "touchstart"];
                    interactionEvents.forEach((eventType) => {
                        window.addEventListener(eventType, resetIdleTimer);
                        eventListeners.push({
                            el: window,
                            type: eventType,
                            fn: resetIdleTimer,
                        });
                    });

                    resetIdleTimer();
                }

                // --- 2. Tab Change Trigger ---
                if (t.tabChange && isEnabledFor("tabChange")) {
                    function handleVisibilityChange() {
                        if (document.visibilityState === "hidden") triggerEvent("tabChange");
                    }

                    document.addEventListener("visibilitychange", handleVisibilityChange);
                    eventListeners.push({
                        el: document,
                        type: "visibilitychange",
                        fn: handleVisibilityChange,
                    });
                }

                // --- 3. Mouse Leave Trigger ---
                if (t.mouseLeaveDelay > 0 && isEnabledFor("mouseLeave")) {
                    function handleMouseOut(e) {
                        if (!e.relatedTarget && !e.toElement) {
                            mouseLeaveTimeout = setTimeout(() => triggerEvent("mouseLeave"), t.mouseLeaveDelay);
                        }
                    }

                    function handleMouseOver() {
                        if (mouseLeaveTimeout) clearTimeout(mouseLeaveTimeout);
                    }

                    window.addEventListener("mouseout", handleMouseOut);
                    window.addEventListener("mouseover", handleMouseOver);

                    eventListeners.push({
                        el: window,
                        type: "mouseout",
                        fn: handleMouseOut,
                    });
                    eventListeners.push({
                        el: window,
                        type: "mouseover",
                        fn: handleMouseOver,
                    });
                }

                // --- 4. Scroll Up Trigger ---
                const scrollThreshold = getScrollThreshold(t.scrollUpThreshold, t.mobileBreakpoint);
                if (scrollThreshold > 0 && isEnabledFor("scrollUp")) {
                    let previousScrollY = null;
                    const deviceType = isMobileDevice(t.mobileBreakpoint) ? "mobile" : "desktop";

                    function checkScrollPosition() {
                        const currentScrollY = window.scrollY;

                        if (previousScrollY !== null) {
                            const scrollDistance = previousScrollY - currentScrollY;
                            if (scrollDistance >= scrollThreshold) {
                                logDebug(`Fast upward scroll detected: ${scrollDistance}px in ${t.scrollUpInterval}ms`);
                                triggerEvent("scrollUp");
                            }
                        }

                        previousScrollY = currentScrollY;
                    }

                    const scrollDelayTimeoutId = setTimeout(() => {
                        logDebug(`Scroll detection initialized for ${deviceType} device (threshold: ${scrollThreshold}px) after ${t.scrollInitDelay}ms delay`);
                        previousScrollY = window.scrollY;
                        scrollCheckInterval = setInterval(checkScrollPosition, t.scrollUpInterval);
                    }, t.scrollInitDelay);

                    timeoutIds.push(scrollDelayTimeoutId);
                }

                function destroy() {
                    logDebug("Observer destroyed. Cleaning up listeners and timers.");

                    timeoutIds.forEach(clearTimeout);
                    timeoutIds = [];

                    eventListeners.forEach(({
                        el,
                        type,
                        fn
                    }) => el.removeEventListener(type, fn));
                    eventListeners = [];

                    if (mouseLeaveTimeout) clearTimeout(mouseLeaveTimeout);
                    if (scrollCheckInterval) clearInterval(scrollCheckInterval);
                }

                return {
                    destroy,
                };
            }

            if (!window.cre_exit_intent_test_146) {
                window.cre_exit_intent_test_146 = true;
                startExitIntentObserver({
                    eventName: "cre-t-146-exit-intent",
                    idleTime: 20000,
                    tabChange: true,
                    mouseLeaveDelay: 50,
                    debug: true,
                    scrollUpThreshold: {
                        mobile: 200,
                        desktop: 400,
                    },
                    mobileBreakpoint: 768,
                    scrollUpInterval: 50,
                });
            }

            window.addEventListener("cre-t-146-exit-intent", (e) => {
                // Execute experiment
                if (window.AlreadyTriggeredTestName_FST146 === 1) return;
                // Page detection
                var isHome = window.location.pathname === "/";
                var isList = window._conv_page_type === "list";
                var isRestaurant = window._conv_page_type === "restaurant";

                if (isHome || isList || isRestaurant) {
                    window.AlreadyTriggeredTestName_FST146 = 1;
                    window._conv_q = window._conv_q || [];
                    window._conv_q.push(["executeExperiment", "100050607"]);
                    console.log("test 146 test fired", e.detail);
                }
            });
        },
        conditionToTriggerExperiment: () => {
            return window.location.href.includes("firsttable");
        },
    },

    {
        name: "test-152",
        pageType: "list",
        callBack: () => {
            // Execute experiment
            window.AlreadyTriggeredTestName_FST152_list = 1;
            window._conv_q = window._conv_q || [];
            window._conv_q.push(["executeExperiment", "100050640"]);
            // console.log("Test152Found");
        },
        conditionToTriggerExperiment: () => {
            return window.location.href.includes("www.firsttable.co");
        },
    },

    {
        name: "test-153",
        pageType: "",
        callBack: () => {
            const LUXON_URL = "https://cdn.jsdelivr.net/npm/luxon@3/build/global/luxon.min.js";

            function loadLuxon(callback) {
                if (window.luxon && window.luxon.DateTime) {
                    callback();
                    return;
                }

                const script = document.createElement("script");
                script.src = LUXON_URL;
                script.onload = callback;
                document.head.appendChild(script);
            }

            loadLuxon(() => {
                const {
                    DateTime
                } = window.luxon;

                const regionMap = {
                    "https://www.firsttable.co.nz": "Pacific/Auckland",
                    "https://www.firsttable.com.au": "Australia/Sydney",
                    "https://www.firsttable.co.uk": "Europe/London",
                };

                const currentOrigin = window.location.origin;
                const currentPath = window.location.pathname;

                const zones = {
                    NZ: regionMap["https://www.firsttable.co.nz"],
                    AU: regionMap["https://www.firsttable.com.au"],
                    UK: regionMap["https://www.firsttable.co.uk"],
                };

                const regionTimes = {
                    NZ: DateTime.now().setZone(zones.NZ),
                    AU: DateTime.now().setZone(zones.AU),
                    UK: DateTime.now().setZone(zones.UK),
                };

                function isWithin28Nov(dt) {
                    const start = dt.set({
                        year: dt.year,
                        month: 11,
                        day: 28,
                        hour: 0,
                        minute: 0,
                        second: 0,
                    });
                    const end = start.plus({
                        days: 1,
                    });
                    return dt >= start && dt < end;
                }

                // NZ check
                if (isWithin28Nov(regionTimes.NZ) && currentOrigin === "https://www.firsttable.co.nz" && (currentPath === "/" || window._conv_page_type === "list" || window._conv_page_type === "restaurant")) {
                    window.creT153TestActivated = 1;
                    window._conv_q = window._conv_q || [];
                    window._conv_q.push(["executeExperiment", "100050711"]);

                    console.log("NZ Modal Test 153 Fired");
                }

                // AU check
                if (isWithin28Nov(regionTimes.AU) && currentOrigin === "https://www.firsttable.com.au" && (currentPath === "/" || window._conv_page_type === "list" || window._conv_page_type === "restaurant")) {
                    window.creT153TestActivated = 1;
                    window._conv_q = window._conv_q || [];
                    window._conv_q.push(["executeExperiment", "100050711"]);

                    console.log("AU Modal Test 153 fired");
                }

                // UK check
                if (isWithin28Nov(regionTimes.UK) && currentOrigin === "https://www.firsttable.co.uk" && (currentPath === "/" || window._conv_page_type === "list" || window._conv_page_type === "restaurant")) {
                    window.creT153TestActivated = 1;
                    window._conv_q = window._conv_q || [];
                    window._conv_q.push(["executeExperiment", "100050711"]);

                    console.log("UK Modal Test 153 Test");
                }
            });
        },
        conditionToTriggerExperiment: () => {
            return window.location.href.includes("www.firsttable.co");
        },
    },

    {

        name: "test-150",

        pageType: "list",

        callBack: () => {

            if (window._conv_page_type === 'list' && (!window.location.pathname.includes('auckland') && !window.location.pathname.includes('queenstown-lakes'))) {

                // Execute experiment

                window.AlreadyTriggeredTestName_FST150_list = 1;

                window._conv_q = window._conv_q || [];

                window._conv_q.push(["executeExperiment", "100051023"]);


            } else {

                if (document.body.classList.contains("cre-t-150")) {

                    document.body.classList.remove("cre-t-150");

                }
                window.AlreadyTriggeredTestName_FST150_list = 0;

            }

        },

        conditionToTriggerExperiment: () => {

            return window.location.href.includes("www.firsttable.co");

        },

    },

    {

        name: "test-160",

        pageType: "list",

        callBack: () => {
            console.log('test 160 callback called  new');
            if (window._conv_page_type === 'list' && (!window.location.pathname.includes('auckland') && !window.location.pathname.includes('queenstown-lakes'))) {

                // Execute experiment

                window.AlreadyTriggeredTestName_FST160_list = 1;

                window._conv_q = window._conv_q || [];

                window._conv_q.push(["executeExperiment", "100051140"]);


            } else {

                if (document.body.classList.contains("cre-t-160")) {

                    document.body.classList.remove("cre-t-160");

                }
                window.AlreadyTriggeredTestName_FST160_list = 0;

            }

        },

        conditionToTriggerExperiment: () => {

            // return window.location.href.includes("www.firsttable.co");
            return (window.location.href.includes("www.firsttable.co") && window._conv_page_type === 'list' && (!window.location.pathname.includes('auckland') && !window.location.pathname.includes('queenstown-lakes')));

        },

    },


    {
        name: "test-161",
        pageType: "list",
        callBack: () => {
            // Execute experiment
            window.AlreadyTriggeredTestName_FST161_list = 1;
            window._conv_q = window._conv_q || [];
            window._conv_q.push(["executeExperiment", "100051186"]);
            console.log("Test161Found");
        },
        conditionToTriggerExperiment: () => {
            return window.location.href.includes("www.firsttable.co");
        },
    },


    {
        name: "test-164-LogOut",
        userType: "guest",
        callBack: () => {
            // Execute experiment
            window.AlreadyTriggeredTestName_FST164_loggedout = 1;
            window._conv_q = window._conv_q || [];
            window._conv_q.push(["executeExperiment", "100051169"]);
            console.log("Test164Found_loggedout_user");
        },
        conditionToTriggerExperiment: () => {
            return window.location.href.includes("www.firsttable.co.nz") && window.location.href.includes("www.firsttable.co.nz/book?");
        },
    },

    {
        name: "test-162",
        userType: "member",
        callBack: () => {


            observeSelector(`form > .flex >  button[type="submit"]`, () => {
                if (window.AlreadyTriggeredTestName_FST162) return;
                var formCta = document.querySelector('form > .flex >  button[type="submit"]');
                if (formCta && formCta.textContent.includes("Book and save 50%")) {
                    window.AlreadyTriggeredTestName_FST162 = 1;
                    window._conv_q = window._conv_q || [];
                    window._conv_q.push(["executeExperiment", "100051211"]);
                }
                else {
                    window.AlreadyTriggeredTestName_FST162 = 0;
                }

                observeTextChange('form > .flex >  button[type="submit"]', function (e) {
                    if (window.AlreadyTriggeredTestName_FST162) return;
                    var formCta = document.querySelector('form > .flex >  button[type="submit"]');
                    if (formCta && formCta.textContent.includes("Book and save 50%")) {
                        window.AlreadyTriggeredTestName_FST162 = 1;
                        window._conv_q = window._conv_q || [];
                        window._conv_q.push(["executeExperiment", "100051211"]);
                    }
                    else {
                        window.AlreadyTriggeredTestName_FST162 = 0;
                    }
                });

            })



        },
        conditionToTriggerExperiment: () => {
            return window.location.href.includes("www.firsttable.co.nz") && window.location.href.includes("www.firsttable.co.nz/book?");
        },
    },



    ];
    /**
     * Example activation of experiments.
     * Iterates through the list of experiments and checks if the experiment is not active.
     * If the experiment is not active, it creates a new instance of the experiment.
     */
    function activateExperiments() {
        experiments.forEach((experiment) => {
            let currentExperiment = window.activatedExperiments.get(experiment.name);
            if (!window.activatedExperiments.has(experiment.name)) {
                // Create a new instance of the experiment
                new Experiment(experiment);
            } else if (!!currentExperiment) {
                currentExperiment.evaluateConditions();
            }
        });
    }
    // Add mutation to check user condtion
    if (!window.convObserverAdded) {
        window.convObserverAdded = true;
        // Monitor changes in user type dynamically
        const observer = new MutationObserver((mutationsList) => {
            for (const mutation of mutationsList) {
                if (mutation.attributeName === "users_type") {
                    window.activatedExperiments.forEach((experiment) => {
                        experiment.evaluateConditions(); // Reevaluate conditions for all experiments
                    });
                }
            }
        });
        // Attach the observer to the body element
        observer.observe(document.querySelector("body"), {
            attributes: true,
        });
    }

    // Initial activation
    activateExperiments();
})();

(function () {
    try {
        /* main variables */
        var debug = 1;
        var variation_name = "";

        if (!window.location.pathname.includes("/booking") && window.cre_27_timerInterval) {
            clearInterval(window.cre_27_timerInterval);
            window.cre_27_timerInterval = null;
        }
    } catch (e) {
        if (debug) console.log(e, "error in Test" + variation_name);
    }
})();

(function () {
    try {

        function getCookie(cname) {
            var name = cname + "=";
            var ca = document.cookie.split(";");
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == " ") c = c.substring(1);
                if (c.indexOf(name) != -1) return c.substring(name.length, c.length);
            }
            return "";
        }

        function waitForElement(selector, trigger, delayInterval, delayTimeout) {
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

        function init() {
            if (window.location.href.includes('sign-up') || window.location.href.includes('sign-in')) {
                return;
            }
            window.creT109TestActivated = 0;
            window.creT135TestActivated = 0;
            window.creT142TestActivated = 0;
            window.creT143TestActivated = 0;

            var region = ["/adelaide", "/brisbane", "/cairns", "/canberra", "/central-coast", "/geelong", "/gold-coast", "/hobart", "/melbourne", "/northern-new-south-wales", "/perth", "/sunshine-coast", "/sydney", "/toowoomba", "/auckland", "/bay-of-plenty", "/canterbury", "/christchurch", "/hawkes-bay", "/kapiti-coast", "/manawatu", "/nelson-and-tasman-district", "/northland", "/otago", "/queenstown", "/rotorua", "/southland", "/taranaki", "/taupo", "/waikato", "/wairarapa", "/wanaka", "/wellington", "/bath", "/belfast", "/birmingham", "/brighton", "/bristol", "/edinburgh", "/glasgow", "/leeds", "/liverpool", "/london", "/manchester", "/newcastle-upon-tyne", "/nottingham", "/oxford", "/southampton"];

            if (window.location.pathname !== "/") {
                return;
            }

            var windowDomain = window.location.hostname;
            var city = decodeURIComponent(getCookie("city"));

            if (city && city !== "no-location") {

                if (windowDomain.indexOf("firsttable") !== -1 && region.indexOf(city) !== -1) {
                    waitForElement('#city [class*="singleValue"]', function () {
                        window.creT109TestActivated = 1;
                        window._conv_q = window._conv_q || [];
                        window._conv_q.push(["executeExperiment", "100050657"]);

                        console.log("trigger 109");
                    }, 50, 2500);
                }
                else {

                    setTimeout(function () {
                        if (document.querySelector('#city div[class*="placeholder"]') && document.querySelector('#city div[class*="placeholder"]').textContent.includes('Select')) {
                            window._conv_q = window._conv_q || [];
                            if (windowDomain === "www.firsttable.co.nz") {

                                window.creT142TestActivated = 1;
                                window._conv_q.push(["executeExperiment", "100050500"]);
                                console.log("trigger 142");
                            } else if (windowDomain === "www.firsttable.com.au") {
                                window.creT143TestActivated = 1;
                                window._conv_q.push(["executeExperiment", "100050502"]);
                                console.log("trigger 143");
                            } else if (windowDomain === "www.firsttable.co.uk") {
                                window.creT135TestActivated = 1;
                                console.log("trigger 135");
                                window._conv_q.push(["executeExperiment", "100050501"]);
                            }
                        }
                    }, 1000);

                }
            } else {
                window._conv_q = window._conv_q || [];
                if (windowDomain === "www.firsttable.co.nz") {
                    window.creT142TestActivated = 1;
                    window._conv_q.push(["executeExperiment", "100050500"]);
                    console.log("trigger 142");
                } else if (windowDomain === "www.firsttable.com.au") {
                    window.creT143TestActivated = 1;
                    window._conv_q.push(["executeExperiment", "100050502"]);
                    console.log("trigger 143");
                } else if (windowDomain === "www.firsttable.co.uk") {
                    window.creT135TestActivated = 1;
                    console.log("trigger 135");
                    window._conv_q.push(["executeExperiment", "100050501"]);
                }
            }
        }

        init();

    } catch (e) {
        console.log(e, "error in Test");
    }
})();

(function () {
    try {
        /* main variables */
        var debug = 1;
        var variation_name = "";

        /* helper library */
        var _$;
        !(function (factory) {
            _$ = factory();
        })(function () {
            var bm = function (s) {
                if (typeof s === "string") {
                    this.value = Array.prototype.slice.call(document.querySelectorAll(s));
                }
                if (typeof s === "object") {
                    this.value = [s];
                }
            };
            bm.prototype = {
                eq: function (n) {
                    this.value = [this.value[n]];
                    return this;
                },
                each: function (fn) {
                    [].forEach.call(this.value, fn);
                    return this;
                },
                log: function () {
                    var items = [];
                    for (let index = 0; index < arguments.length; index++) {
                        items.push(arguments[index]);
                    }
                    console && console.log(variation_name, items);
                },
                addClass: function (v) {
                    var a = v.split(" ");
                    return this.each(function (i) {
                        for (var x = 0; x < a.length; x++) {
                            if (i.classList) {
                                i.classList.add(a[x]);
                            } else {
                                i.className += " " + a[x];
                            }
                        }
                    });
                },
                waitForElement: function (selector, trigger, delayInterval, delayTimeout) {
                    var interval = setInterval(function () {
                        if (_$(selector).value.length) {
                            clearInterval(interval);
                            trigger();
                        }
                    }, delayInterval);
                    setTimeout(function () {
                        clearInterval(interval);
                    }, delayTimeout);
                },
            };
            return function (selector) {
                return new bm(selector);
            };
        });

        var helper = _$();

        /* Variation Init */
        function init() {
            //   helper.log('Log inside from init');
            //   _$('body').addClass(variation_name)

            var country = ["/auckland", "/christchurch", "/wellington", "/queenstown-lakes", "/waikato", "/otago", "/bay-of-plenty", "/taupo", "/rotorua", "/nelson-and-tasman-district", "/melbourne", "/hobart", "/sydney", "/cairns", "/sunshine-coast", "/brisbane", "/gold-coast", "/london", "/bristol", "/brighton", "/london/west", "/birmingham", "/manchester"];

            if (country.includes(window.location.pathname)) {
                // Execute experiment
                window.AlreadyTriggeredTestName_FST138_list = 1;
                window._conv_q = window._conv_q || [];
                window._conv_q.push(["executeExperiment", "100051153"]);
            }
        }

        /* Initialise variation */
        helper.waitForElement("body", init, 50, 5000);
    } catch (e) {
        if (debug) console.log(e, "error in Test" + variation_name);
    }
})();






//helper js for test 168


(function () {
    try {
        const SESSION_KEY = "cre_t_168_restaurant_data";

        function debounce(func, timeout = 300) {
            let timer;
            return (...args) => {
                clearTimeout(timer);
                timer = setTimeout(() => {
                    func.apply(this, args);
                }, timeout);
            };
        }

        function observeSelector(selector, callback, options = {}) {
            const document = options.document || window.document;
            const processed = new Map();

            if (options.timeout || options.onTimeout) {
                throw `observeSelector options \`timeout\` and \`onTimeout\` are not yet implemented.`;
            }

            let obs;
            let isDone = false;

            const done = () => {
                if (obs) obs.disconnect();
                isDone = true;
            };

            const processElement = (el) => {
                if (!processed.has(el)) {
                    processed.set(el, true);
                    callback(el);
                    if (options.once) {
                        done();
                        return true;
                    }
                }
                return false;
            };

            const lookForSelector = () => {
                const elParent = document.documentElement;
                if (elParent.matches(selector) || elParent.querySelector(selector)) {
                    const elements = elParent.querySelectorAll(selector);
                    elements.forEach((el) => processElement(el));
                }
            };

            const debouncedLookForSelector = debounce(() => {
                lookForSelector();
            }, 100);

            // Initial check for the selector on page load
            lookForSelector();

            if (!isDone) {
                obs = new MutationObserver(() => {
                    debouncedLookForSelector();
                });

                obs.observe(document, {
                    attributes: false,
                    childList: true,
                    subtree: true,
                });
            }

            return done;
        }

        function waitForElement(selector, trigger, delayInterval = 50, delayTimeout = 15000) {
            var interval = setInterval(function () {
                if (document && document.querySelector(selector)) {
                    clearInterval(interval);
                    trigger();
                }
            }, delayInterval);

            setTimeout(function () {
                clearInterval(interval);
            }, delayTimeout);
        }

        async function fetchTheData(restaurantId) {
            try {
                const response = await fetch("https://stellate.firsttable.net/graphql", {
                    method: "POST",
                    headers: {
                        "content-type": "application/json",
                        "x-graphql-client-name": "Website",
                    },
                    body: JSON.stringify({
                        operationName: "RestaurantPaginatedReviewQuery",
                        variables: {
                            restaurantId: parseInt(restaurantId),
                            offset: 0,
                        },
                        query: `query RestaurantPaginatedReviewQuery($restaurantId: Int, $favourite: Boolean, $offset: Int) {
              paginatedReviews(restaurantId: $restaurantId, favourite: $favourite, offset: $offset) {
                edges {
                  node {
                    id
                    date
                    dinedDate
                    name
                    comment
                    foodRating
                    serviceRating
                    userAvatar
                    restaurant {
                      title
                    }
                  }
                }
              }
            }`,
                    }),
                });

                if (!response.ok) throw new Error(`HTTP error! ${response.status}`);
                const result = await response.json();
                return result?.data?.paginatedReviews?.edges || [];
            } catch (error) {
                console.error("Fetch error:", error);
                return [];
            }
        }

        async function initLogic(restaurantId) {
            const allReviews = await fetchTheData(restaurantId);
            const totalReviewsCount = allReviews.length;

            // Filter for reviews that have an average of 4 stars or higher
            const highRatedReviews = allReviews.filter((edge) => {
                const node = edge.node || edge;
                const food = parseFloat(node.foodRating) || 0;
                const service = parseFloat(node.serviceRating) || 0;
                const avg = (food + service) / 2;
                return avg >= 4;
            });

            // Logic Check
            const isInsufficient = totalReviewsCount < 5 && highRatedReviews.length < 5;

            const storageData = {
                restaurantId: restaurantId,
                insufficient: isInsufficient,
                totalCount: totalReviewsCount,
                highRatedCount: highRatedReviews.length,
                // If not insufficient, we store the high-rated reviews for your rendering script
                reviews: isInsufficient ? [] : highRatedReviews,
            };

            sessionStorage.setItem(SESSION_KEY, JSON.stringify(storageData));
        }

        function init() {
            const element = document.querySelector('[data-attribute="booking-fee-element"][detail-restaurant-id]');
            if (element) {
                const restaurantId = element.getAttribute("detail-restaurant-id");
                if (restaurantId) {
                    initLogic(restaurantId);
                }
            }
        }

        if (!window.cre_t_168_logic) {
            window.cre_t_168_logic = true;
            observeSelector('[data-attribute="booking-fee-element"][detail-restaurant-id]', init);

        }
    } catch (e) {
        console.log("Logic Script Error:", e);
    }
})();



//manual for test 168
(function () {
    try {
        /* main variables */
        var debug = 0;
        var variation_name = "cre-t-168-global";

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

        function waitForResIDMatch(trigger, delayInterval = 50, delayTimeout = 10000) {
            const interval = setInterval(function () {
                const element = document.querySelector('[data-attribute="booking-fee-element"][detail-restaurant-id]');
                if (element) {
                    const restaurantId = element.getAttribute("detail-restaurant-id");
                    const sessionDataRaw = sessionStorage.getItem("cre_t_168_restaurant_data");
                    if (sessionDataRaw) {
                        try {
                            const sessionData = JSON.parse(sessionDataRaw);
                            if (sessionData.restaurantId == restaurantId && sessionData.reviews && !sessionData.insufficient) {
                                clearInterval(interval);
                                trigger();
                            }
                        } catch (e) {
                            if (debug) console.error("Session Data Error:", e);
                        }
                    }
                }
            }, delayInterval);
            setTimeout(function () {
                clearInterval(interval);
            }, delayTimeout);
        }



        function init() {
            //   if (!window.cre_t_168_global) {
            //     window.cre_t_168_global = true;
            //     window.addEventListener("scroll", function () {
            //       if (window._conv_page_type === "restaurant") {
            //         if (document.querySelector(`#RestaurantReviews`) && document.querySelector(`#RestaurantReviews + [data-attribute="review-container"] [data-food-rating]`)) {
            //           const el = document.querySelector(`#RestaurantReviews`);
            //           waitForResIDMatch(function () {
            //             if (!window.fst_Already_Trigger_168) {
            //               window.fst_Already_Trigger_168 = 1;
            //               console.log('test 168 activated');
            //               window._conv_q = window._conv_q || [];
            //               window._conv_q.push(["executeExperiment", "100051307"]);
            //               document.querySelector("body").classList.add("cre-t-168-change-added");
            //             }
            //           });
            //         }
            //       } else {
            //         if(document.body.classList.contains("cre-t-168-change-added")) {
            //             document.body.classList.remove("cre-t-168-change-added");
            //         }
            //         if(window.fst_Already_Trigger_168 == 0) return;
            //         window.fst_Already_Trigger_168 = 0;
            //       }
            //     });
            //   }

            window.fst_Already_Trigger_168 = 0;
            if (document.body.classList.contains("cre-t-168-change-added")) {
                document.body.classList.remove("cre-t-168-change-added");
            }

            if (window._conv_page_type === "restaurant") {
                waitForResIDMatch(function () {
                    waitForElement('#RestaurantReviews', function () {
                        if (!window.fst_Already_Trigger_168) {
                            window.fst_Already_Trigger_168 = 1;
                            console.log('test 168 activated');
                            window._conv_q = window._conv_q || [];
                            window._conv_q.push(["executeExperiment", "100051307"]);
                            document.querySelector("body").classList.add("cre-t-168-change-added");
                        }
                    }, 50, 15000);
                });

            } else {
                if (document.body.classList.contains("cre-t-168-change-added")) {
                    document.body.classList.remove("cre-t-168-change-added");
                }
                if (window.fst_Already_Trigger_168 == 0) return;
                window.fst_Already_Trigger_168 = 0;
            }

        }

        waitForElement("body", init, 50, 15000);
    } catch (e) {
        if (debug) console.log(e, "error in Test " + variation_name);
    }
})();