
// The code below has been added to check logged-in and logged-out users
try {
  // Function to wait for an element before executing a trigger function
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

  // Function to get a cookie value by name
  function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let cookies = decodedCookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      let c = cookies[i].trim();
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return null;
  }

  // Function to check and update body class
  function updateBodyClass() {
    let body = document.querySelector("body");
    if (body) {
      // Condition to check for logged-in users based on cookies
      // Checking ll_remember_me cookie
      if (getCookie("ll_remember_me")) {
        body.classList.add("logged_in_users");
      } else {
        body.classList.remove("logged_in_users");
      }

      // Checking remember_me cookie
      if (getCookie("remember_me")) {
        body.classList.add("logged_in_users");
      } else {
        body.classList.remove("logged_in_users");
      }

    }


  }

  // Wait for <body> and then execute updateBodyClass
  waitForElement("body", updateBodyClass);

} catch (e) {
  console.error("Error in script: checking user login status", e);
}

/*
    Here adding a cookie for the user who visits the pages except the service pages. 
*/

(function () {
  try {
    var debug = 0;
    var variation_name = "TT-Global-activationCode";

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

    function setCookie(name, value, days) {
      var expires = "";
      if (days) {
        var date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
      }
      document.cookie = name + "=" + (value || "") + expires + "; path=/";
    }

    function getCookie(name) {
      var nameEQ = name + "=";
      var ca = document.cookie.split(';');
      for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
      }
      return null;
    }

    function activateTest182() {
      window['optimizelyEdge'] = window['optimizelyEdge'] || [];
      window['optimizelyEdge'].push({
        type: "page",
        pageName: "21098500546_tt182__sp_cta_test"
      });
    }

    function init() {

      // For the pages except the service pages
      if (!window.location.href.includes('/service/')) {
        setCookie('TT-182-SettingCookieForNotTargetedURLs', 'true');
      } else if (window.location.href.includes('/service/')) {

        let otherPagesCookie = getCookie('TT-182-SettingCookieForNotTargetedURLs');
        let targetedPagesCookie = getCookie('TT-182-TestCookieServicePages');

        if (otherPagesCookie) {
          if (targetedPagesCookie) {
            activateTest182();
          }
        } else {
          activateTest182();
        }
      }

    }

    /* Initialize variation */
    waitForElement("body", init);
  } catch (e) {
    if (debug) console.log(e, "error in Test " + variation_name);
  }
})();