(function () {
  try {
    /* main variables */
    var debug = false;
    var variation_name = 'cre-t-17';

  
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

    function addClass(selector, className) {
      var element = typeof selector === 'string' ? document.querySelector(selector) : selector;
      if (!element) return;

      if (element.classList) {
        element.classList.add(className);
      } else if (!element.className.match(new RegExp('\\b' + className + '\\b'))) {
        element.className += ' ' + className;
      }
    }

    function removeClass(selector, className) {
      var element = typeof selector === 'string' ? document.querySelector(selector) : selector;
      if (!element) return;

      if (element.classList) {
        element.classList.remove(className);
      } else {
        element.className = element.className.replace(new RegExp('\\b' + className + '\\b', 'g'), '');
      }
    }

   

    var basketSummaryMoved = false;
    var basketSummaryOriginalParent = null;
    var basketSummaryOriginalNextSibling = null;

    function findContinueShoppingLink(cartProduct) {
      var links = cartProduct.querySelectorAll('a[href="/collections/"]');
      for (var i = 0; i < links.length; i++) {
        if (links[i].textContent.indexOf('Continue Shopping') !== -1) {
          return links[i];
        }
      }
      return null;
    }

    function moveBasketSummaryAboveContinueShopping(cartProduct, cartSidebar) {
      if (basketSummaryMoved) return;

      var continueShoppingLink = findContinueShoppingLink(cartProduct);
      if (!continueShoppingLink) return;

      basketSummaryOriginalParent = cartSidebar.parentNode;
      basketSummaryOriginalNextSibling = cartSidebar.nextSibling;

      cartProduct.insertBefore(cartSidebar, continueShoppingLink);
      addClass(cartSidebar, variation_name + '-summary-inline');
      basketSummaryMoved = true;
    }

    function restoreBasketSummaryPosition(cartSidebar) {
      if (!basketSummaryMoved) return;
      if (!basketSummaryOriginalParent) return;

      basketSummaryOriginalParent.insertBefore(cartSidebar, basketSummaryOriginalNextSibling);
      removeClass(cartSidebar, variation_name + '-summary-inline');
      basketSummaryMoved = false;
    }

    function handleMediaQueryChange(mobileMediaQuery, cartProduct, cartSidebar) {
      if (mobileMediaQuery.matches) {
        moveBasketSummaryAboveContinueShopping(cartProduct, cartSidebar);
      } else {
        restoreBasketSummaryPosition(cartSidebar);
      }
    }

    function bindMediaQueryListener(mobileMediaQuery, cartProduct, cartSidebar) {
      if (window.cre_t_17_media_listener_bound) return;
      window.cre_t_17_media_listener_bound = true;

      if (mobileMediaQuery.addEventListener) {
        mobileMediaQuery.addEventListener('change', function () {
          handleMediaQueryChange(mobileMediaQuery, cartProduct, cartSidebar);
        });
      } else if (mobileMediaQuery.addListener) {
        mobileMediaQuery.addListener(function () {
          handleMediaQueryChange(mobileMediaQuery, cartProduct, cartSidebar);
        });
      }
    }

    function setupBasketSummaryOrder(cartProduct, cartSidebar) {
      if (document.querySelector('.cre-t-17-outer')) return;

      var marker = document.createElement('span');
      marker.className = variation_name + '-outer';
      marker.style.display = 'none';
      cartProduct.appendChild(marker);

      var mobileMediaQuery = window.matchMedia('(max-width: 768px)');
      handleMediaQueryChange(mobileMediaQuery, cartProduct, cartSidebar);
      bindMediaQueryListener(mobileMediaQuery, cartProduct, cartSidebar);
    }

    function waitForCartSidebar(cartProduct) {
      waitForElement('.cart-sidebar', function () {
        var cartSidebar = document.querySelector('.cart-sidebar');
        if (!cartSidebar) return;

        setupBasketSummaryOrder(cartProduct, cartSidebar);
      });
    }

    function init() {
      var cartProduct = document.querySelector('.cart-product');
      if (!cartProduct) return;

      waitForCartSidebar(cartProduct);
    }
    
    waitForElement('.cart-product', init);
  } catch (e) {
    if (debug) console.log(e, 'error in Test ' + variation_name);
  }
})();