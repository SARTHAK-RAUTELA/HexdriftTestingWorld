if(!window.location.href.includes("https://eweb.afponline.org")) {
  // Code to execute if the URL does NOT contain "https://eweb.afponline.org"
  (function() {
    try {
      /* main variables */
      var debug=0;
      var variation_name="cre-t-10";

      /* all Pure helper functions */
      function addClass(selector,className) {
        var element=typeof selector==="string"? document.querySelector(selector):selector;
        if(!element) return;
        if(element.classList) element.classList.add(className);
        else if(!element.className.match(new RegExp("\b"+className+"\b"))) {
          element.className+=" "+className;
        }
      }
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
      function addButton() {
        var buttonHtml=`<a class="cre-t-10-reg global-login__link" href="https://conference.financialprofessionals.org/">
        <span class="global-login__link-text cre-t-10-reg-text1 ">REGISTER FOR AFP 2026 </span>
        <span class="global-login__link-text cre-t-10-reg-text2 ">Early pricing ends June 26</span>
      </a>`;

        // Target elements for insertion
        const targetSelectors=["#global-login .global-login__link--join","#global-logout .global-login__link"];

        // Loop through each target and insert the button if it doesn't already exist at that specific target
        for(let i=0;i<targetSelectors.length;i++) {
          const targetButton=document.querySelector(targetSelectors[i]);

          // Ensure the target button exists and check if the button hasn't been inserted at that location
          if(targetButton&&!targetButton.closest(".cre-t-10-reg")) {
            targetButton.insertAdjacentHTML("beforebegin",buttonHtml);
          }
        }
      }

      function changeText() {
        var changeText=document.querySelector("#global-login .global-login__link--join .global-login__link-text");
        if(changeText) {
          changeText.textContent="JOIN AFP";
        }
      }

      /* Variation Init */
      function init() {
        if(document.body.classList.contains("cre-t-10")) return;
        addClass("body",variation_name);
        addButton();

        waitForElement("#global-login .global-login__link--join",changeText,50,25000);
      }

      /* Init variation */
      waitForElement("#global-login .global-login__link--join",init,50,25000);
    } catch(e) {
      if(debug) console.log(e,"error in Test "+variation_name);
    }
  })();
}
