(function() {
  try {
    /* main variables */
    var debug=1;
    var variation_name="cre-t-02";

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


    function addClass(selector,className) {
      var element=typeof selector==="string"? document.querySelector(selector):selector;
      if(!element) return;
      if(element.classList) element.classList.add(className);
      else if(!element.className.match(new RegExp("\b"+className+"\b"))) {
        element.className+=" "+className;
      }
    }


    function insertAfter(selector,html) {
      var element=typeof selector==="string"? document.querySelector(selector):selector;
      if(!element) return;
      if(typeof html==="string") {
        element.insertAdjacentHTML("afterend",html);
      } else if(html&&html.nodeType===1) {
        element.insertAdjacentElement("afterend",html);
      }
    }

    /* Variation functions */

    function updateApplyButton() {
      document.querySelectorAll('a[href*="apply"]').forEach(function(button) {
        if(button.textContent.trim().toLowerCase().includes('apply')) {
          button.childNodes.forEach(function(node) {
            if(node.nodeType===1&&node.textContent.trim().toLowerCase()==='apply'&&!node.classList.contains('cre-t-02-hide')) {
              node.classList.add('cre-t-02-hide')
              insertAfter(node,'<div>Get started</div>')
            }
          });
        }
      });
    }



    /* Variation Init */
    function init() {
      addClass('body',variation_name)
      updateApplyButton();
    }

    /* Initialise variation */
    waitForElement('a[href*="apply"]',init,50,15000);
  } catch(e) {
    if(debug) console.log(e,"error in Test "+variation_name);
  }
})();