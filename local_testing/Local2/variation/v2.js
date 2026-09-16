(function() {
  try {
    var debug=1;
    var variation_name="cre-t-266";
    /* ============================================================
       HELPERS
    ============================================================ */
    function waitForElement(selector,trigger,delayInterval,delayTimeout) {
      delayInterval=delayInterval||50;
      delayTimeout=delayTimeout||15000;
      var interval=setInterval(function() {
        if(document.querySelector(selector)&&document.querySelectorAll(selector).length>0) {
          clearInterval(interval);
          trigger();
        }
      },delayInterval);
      setTimeout(function() {
        clearInterval(interval);
      },delayTimeout);
    }



    function live(selector,event,callback,context) {
      if(typeof callback!=="function") return;
      (context||document).addEventListener(event,function(e) {
        var el=e.target.closest(selector);
        if(el) callback.call(el,e);
      });
    }
    /* ============================================================
       STATE
    ============================================================ */
    var lastSubtotal=null;
    var lastStrikeTotal=null;
    var lastItemCount=null;
    var subtotalEl=null;
    var priceSymbol=null;
    /* ============================================================
       PRICE UTILITIES
    ============================================================ */
    function getElText(sel) {
      var el=document.querySelector(sel);
      return el? el.textContent:"";
    }

    function extractNum(text) {
      var m=text.replace(/,/g,"").match(/\$([0-9]+(\.[0-9]+)?)/);
      return m? parseFloat(m[1]):0;
    }

    function getPriceSymbol() {
      if(priceSymbol) return priceSymbol;
      var m=getElText(".price-row__pay-option-price").trim().match(/[^0-9\s.,]/);
      priceSymbol=m? m[0]:"$";
      return priceSymbol;
    }

    function formatPrice(n) {
      return getPriceSymbol()+n.toLocaleString("en-US",{
        minimumFractionDigits: 0
        ,maximumFractionDigits: 0
      });
    }
    /* ============================================================
       PRICE CALCULATORS
    ============================================================ */
    function getBasePrice() {
      return extractNum(getElText(".price-row__pay-option-price"));
    }

    function getSetupPrice() {
      var btn=document.querySelector(".order-form__loadup-button");
      var plus=btn&&btn.querySelector(".order-form__loadup-button-icon-plus");
      if(!plus||!plus.classList.contains("hide")) return 0;
      var priceEl=btn.querySelector(".order-form__loadup-button-price");
      return priceEl? extractNum(priceEl.textContent):0;
    }

    function getAccessoriesTotal() {
      var total=0;
      document.querySelectorAll(".accessory-tray_item").forEach(function(item) {
        var cb=item.querySelector(".add-to-accessory-cart");
        var titleEl=item.querySelector(".accessory-item-title");
        var isActive=cb&&cb.checked;
        if(isActive&&titleEl) total+=extractNum(titleEl.textContent);
      });
      return total;
    }

    function getSelectedItemCount() {
      var count=1;
      var setupBtn=document.querySelector(".order-form__loadup-button");
      var setupPlus=setupBtn&&setupBtn.querySelector(".order-form__loadup-button-icon-plus");

      if(setupPlus&&setupPlus.classList.contains("hide")) count++;

      document.querySelectorAll(".accessory-tray_item .add-to-accessory-cart").forEach(function(cb) {
        if(cb.checked) count++;
      });

      return count;
    }

    function calculateSubtotal() {
      return getBasePrice()+getSetupPrice()+getAccessoriesTotal();
    }

    function strikeTotal() {
      var selectors=[
        ".order-form__loadup-button-compare-price",
        ".cre-t-202-box-strike-price"
      ];

      var total=selectors.reduce(function(total,selector) {
        return total+extractNum(getElText(selector));
      },0);

      // Accessories have no strike price, so they should not reduce the saving.
      return total+getAccessoriesTotal();
    }
    /* ============================================================
       DOM
    ============================================================ */
    function getSubtotalEl() {
      if(subtotalEl&&subtotalEl.parentNode) return subtotalEl;
      return (subtotalEl=document.querySelector(".cre-t-266-subtotal-line"));
    }

    function syncControlButtonCount(itemCount) {
      var btn=document.querySelector(".order-form__add.button");
      if(!btn) return;

      if(itemCount===1) {
        btn.textContent="ADD TO CART";
      } else {
        btn.textContent="ADD "+itemCount+" ITEMS TO CART";
      }
    }

    function updateSubtotal() {
      var el=getSubtotalEl();
      var total=calculateSubtotal();
      var strikePriceTotal=strikeTotal();
      var itemCount=getSelectedItemCount();
      syncControlButtonCount(itemCount);
      if(!el||(total===lastSubtotal&&strikePriceTotal===lastStrikeTotal&&itemCount===lastItemCount)) return;
      lastSubtotal=total;
      lastStrikeTotal=strikePriceTotal;
      lastItemCount=itemCount;
      el.innerHTML="<strong>"+itemCount+" "+(itemCount===1? "item":"items")+" selected</strong> &middot; <strong>"+
        formatPrice(total)+" total</strong> &middot; <span>Saving <strong>"+
        formatPrice(Math.max(0,strikePriceTotal-total))+"</strong></span>";
    }

    function injectSubtotalLine() {
      if(getSubtotalEl()) {
        updateSubtotal();
        return;
      }
      var btn=document.querySelector(".order-form__add.button");
      if(!btn) return;
      var total=calculateSubtotal();
      var strikePriceTotal=strikeTotal();
      var itemCount=getSelectedItemCount();
      syncControlButtonCount(itemCount);
      btn.insertAdjacentHTML("beforebegin",'<div class="cre-t-266-subtotal-line"><strong>'+itemCount+" "+(itemCount===1? "item":"items")+
        " selected</strong> &middot; <strong>"+formatPrice(total)+" total</strong> &middot; <span>Saving <strong>"+
        formatPrice(Math.max(0,strikePriceTotal-total))+"</strong></span></div>");
      subtotalEl=btn.previousElementSibling;
      lastSubtotal=total;
      lastStrikeTotal=strikePriceTotal;
      lastItemCount=itemCount;
    }




    var subtotalUpdateInterval=null;

    function scheduleSubtotalRefresh() {
      if(subtotalUpdateInterval) {
        clearInterval(subtotalUpdateInterval);
        subtotalUpdateInterval=null;
      }

      var currentInterval=setInterval(function() {
        updateSubtotal();
      },500);

      subtotalUpdateInterval=currentInterval;

      setTimeout(function() {
        clearInterval(currentInterval);
        if(subtotalUpdateInterval===currentInterval) {
          subtotalUpdateInterval=null;
        }
      },3000);
    }

    /* ============================================================
       EVENTS
    ============================================================ */
    function eventHandler() {
      live("#coolingCoverSelect","change",scheduleSubtotalRefresh);
      live("#size-select","change",scheduleSubtotalRefresh);
      live("#firmness-select","change",scheduleSubtotalRefresh);
      live(".order-form__loadup-button, .pop-loadup__service-button, .order-form__loadup-button-price,#orderForm .order-form__add","click",scheduleSubtotalRefresh);
      document.addEventListener("click",function(e) {
        var isAccessory=e.target.closest(".add-to-accessory-cart")||e.target.closest(".accessory-item-title");
        if(isAccessory) scheduleSubtotalRefresh();
      });


    }

    /* ============================================================
       INIT
    ============================================================ */
    function init() {
      document.body.classList.add(variation_name);

      injectSubtotalLine()

      waitForElement(".cre-t-266-subtotal-line",function() {
        var forceInsertion=setInterval(function() {
          scheduleSubtotalRefresh()
        },250);
        setTimeout(function() {
          clearInterval(forceInsertion);
        },3000);

      },50,15000);

    }
    if(!window.variation_name_266) {
      window.variation_name_266=true;
      eventHandler();
    }
    waitForElement("#orderForm.loaded .order-form__add.button",init,50,15000);
  } catch(e) {
    if(debug) console.log(e,"error in Test "+variation_name);
  }
}());