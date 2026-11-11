(function () {
  try {
    var debug = 0;
    var variation_name = "cre-t-167";
    // Rendered in this order, above the existing FAQs
    let NewFAQs = [
      {
        Key: "donations",
        Question: "We donate to animal welfare charities and match your gifts",
        Answer:
          'We donate for every policy purchased through us, helping animals in need. Want to join us? Donate to the <a href="https://www.americanhumane.org/" target="_blank" rel="noopener noreferrer">American Humane Society</a> and forward your receipt to info@petinsurancegurus.com. We’ll match your donation up to $100, doubling your impact.',
      },
    ];
    function scrollToEl(selector) {
      var el = document.querySelector(selector);
      if (!el) return;
      var top = el.getBoundingClientRect().top + window.pageYOffset - 100;
      window.scrollTo({ top: top, behavior: "smooth" });
    }
    function waitForjQuery(trigger, delayInterval, delayTimeout) {
      var interval = setInterval(function () {
        if (window.jQuery !== undefined) {
          clearInterval(interval);
          trigger(window.jQuery);
        }
      }, delayInterval);
      setTimeout(function () {
        clearInterval(interval);
      }, delayTimeout);
    }
    function generateAccordianItem(faq) {
      let Question = faq.Question;
      let Answer = faq.Answer;
      return `<div class="cre-t-167-accordion_item oxy-pro-accordion_item" data-faq="${faq.Key}">
    <button class="cre-t-167-accordion_header" aria-expanded="false">
        <span class="cre-t-167-accordion_title-area oxy-pro-accordion_title-area">
            <h4 class="cre-t-167-accordion_title oxy-pro-accordion_title">${Question}</h4>
            <span class="cre-t-167-accordion_subtitle"></span>
        </span>
        <span class="cre-t-167-accordion_icon cre-t-167-accordion_icon-animate oxy-pro-accordion_icon oxy-pro-accordion_icon-animate">
            <svg class="cre-t-167-accordion_toggle-icon oxy-pro-accordion_toggle-icon">
                <use xlink:href="#Bootstrapbootstrap-icon-plus"></use>
            </svg>
        </span>
    </button>
    <div class="cre-t-167-accordion_body oxy-pro-accordion_body">
        <div class="cre-t-167-accordion_content">
            <p>${Answer}</p>
        </div>
    </div>
</div>`;
    }
    function waitForElement(selector, trigger, delayInterval = 50, delayTimeout = 15000) {
      var interval = setInterval(function () {
        if (document && document.querySelector(selector) && document.querySelectorAll(selector).length > 0) {
          clearInterval(interval);
          trigger(document.querySelector(selector));
        }
      }, delayInterval);
      setTimeout(function () {
        clearInterval(interval);
      }, delayTimeout);
    }
    // Delegated listener. Pass capture = true to run before the theme's own handlers.
    function live(selector, event, callback, context = document, capture = false) {
      const liveHandler = (e) => {
        const el = e.target && e.target.closest ? e.target.closest(selector) : null;
        if (el && el !== context) {
          callback.call(el, e);
        }
      };
      context.addEventListener(event, liveHandler, capture);
    }
    // Open first, then scroll once the slide animation has finished
    function openFAQ(key) {
      if (debug) console.log("click on fAq item test 167 scroll");
      window._conv_q = window._conv_q || [];
      _conv_q.push(["triggerConversion", "100038337"]);
      let itemSelector = `.cre-t-167-accordion_item[data-faq="${key}"]`;
      let item = document.querySelector(itemSelector);
      if (!item) return;
      if (!item.classList.contains("active")) {
        item.querySelector(".cre-t-167-accordion_header").click();
      }
      // Slide speed is 300ms; wait slightly longer so layout has settled
      setTimeout(function () {
        scrollToEl(`${itemSelector} .cre-t-167-accordion_header`);
      }, 350);
    }
    function eventHandler() {
      // "Donations" nav link — capture phase so the theme's nav handler can't swallow it.
      live(
        ".cre-t-167-vetApprovedLink",
        "click",
        function (e) {
          if (debug) console.log("click on donations");
          window._conv_q = window._conv_q || [];
          _conv_q.push(["triggerConversion", "100038361"]);
          e.preventDefault();
          e.stopPropagation();
          openFAQ("donations");
        },
        document,
        true,
      );
      // Clicking an ORIGINAL (or 144) FAQ that is about to open -> close our 167 item.
      // Capture phase + direct DOM close, so it doesn't depend on the theme's own handler.
      live(
        ".oxy-pro-accordion_item:not(.cre-t-167-accordion_item) button",
        "click",
        function () {
          var item = this.closest(".oxy-pro-accordion_item");
          if (item && !item.classList.contains("active")) {
            closeItem(jQuery(".cre-t-167-accordion_item.active"), 300);
          }
        },
        document,
        true,
      );
      // Accordion toggle for the new (167) FAQ items
      live(".cre-t-167-accordion_item button", "click", function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        var $button = jQuery(this);
        var $item = $button.closest(".cre-t-167-accordion_item");
        var $body = $item.children(".oxy-pro-accordion_body");
        var speed = 300;
        // Opening this item -> close every other open item (original, 144 and 167)
        if (!$item.hasClass("active")) {
          closeItem(jQuery(".oxy-pro-accordion_item.active").not($item[0]), speed);
        }
        // Toggle current item open/closed
        $item.toggleClass("active");
        $body.stop(true, true).slideToggle(speed);
        $button.attr("aria-expanded", function (i, val) {
          return val === "true" ? "false" : "true";
        });
      });
      live(".cre-t-167-accordion_item button", "mousedown", function () {
        if (debug) console.log("click on fAq item test 167");
        window._conv_q = window._conv_q || [];
        _conv_q.push(["triggerConversion", "100038337"]);
      });
    }
    // Close accordion item(s) directly: class, body and aria-expanded
    function closeItem($items, speed) {
      $items.each(function () {
        var $it = jQuery(this);
        $it.removeClass("active");
        $it.children(".oxy-pro-accordion_body").stop(true, true).slideUp(speed);
        $it.children("button").attr("aria-expanded", "false");
      });
    }
    // Same way as test 144: add a new nav button after the Contact menu item
    function addDonationLink() {
      // Contact link is present once the nav has rendered
      waitForElement('.oxy-site-navigation.header-nav ul li.menu-item a[href*="/contact-us"]', function (link) {
        let contactItem = link.closest("li.menu-item");
        if (!contactItem) return;
        // Class on Contact so it can be hidden with CSS
        contactItem.classList.add("cre-t-167-contact");
        // Donations goes last, as a sibling after Contact (not inside it)
        if (!document.querySelector(".cre-t-167-vetApprovedLink")) {
          contactItem.insertAdjacentHTML("afterend", `<li class='cre-t-167-vetApprovedLink'> Donate </li>`);
        }
      });
    }
    // If test 144 is running, wait for its FAQ item to be inserted first.
    // If it never shows up (144 not active), continue after the timeout.
    function waitFor144(callback, delayInterval = 50, delayTimeout = 1500) {
      var done = false;
      function finish() {
        if (done) return;
        done = true;
        clearInterval(interval);
        clearTimeout(timer);
        callback();
      }
      var interval = setInterval(function () {
        if (document.querySelector(".cre-t-144-accordion_item")) finish();
      }, delayInterval);
      var timer = setTimeout(finish, delayTimeout);
    }
    function init() {
      document.querySelector("body").classList.add(variation_name);
      // Insert new FAQs at the very top (above test 144's item too, if present)
      if (!document.querySelector(".cre-t-167-accordion_item")) {
        let Accordian = NewFAQs.map(generateAccordianItem).join("");
        document.querySelector(".faq-container .oxy-pro-accordion .oxy-pro-accordion_item:first-child").insertAdjacentHTML("beforebegin", Accordian);
      }
      // Safety: if another test inserts later, keep 167 first (watch for 10s)
      var container = document.querySelector(".faq-container .oxy-pro-accordion_inner") || document.querySelector(".faq-container .oxy-pro-accordion");
      if (container) {
        var keep167OnTop = function () {
          var item167 = container.querySelector(".cre-t-167-accordion_item");
          if (item167 && item167 !== container.firstElementChild) {
            container.insertBefore(item167, container.firstElementChild);
          }
        };
        var observer = new MutationObserver(keep167OnTop);
        observer.observe(container, { childList: true });
        setTimeout(function () {
          observer.disconnect();
        }, 10000);
      }
      // Whenever any other FAQ becomes active (however the theme opens it), close the 167 FAQ.
      if (container) {
        var stateObserver = new MutationObserver(function (mutations) {
          mutations.forEach(function (m) {
            var t = m.target;
            if (!t.classList || !t.classList.contains("oxy-pro-accordion_item")) return;
            if (t.classList.contains("cre-t-167-accordion_item")) return;
            if (t.classList.contains("active")) {
              closeItem(jQuery(".cre-t-167-accordion_item.active"), 300);
            }
          });
        });
        stateObserver.observe(container, { attributes: true, attributeFilter: ["class"], subtree: true });
      }
      addDonationLink();
      // Bind handlers once
      if (!window.EventHandlerAddedTest167) {
        eventHandler();
        window.EventHandlerAddedTest167 = true;
      }
    }
    /* Initialize variation */
    // FIX 1: pass interval + timeout. Without them both were `undefined` (= 0ms), so jQuery was
    // checked once and the wait was cancelled immediately. On the WP Rocket cached homepage
    // (any URL without a query string, e.g. after clicking the logo) jQuery loads a moment later,
    // so init() never ran: no FAQ item, no click handler, Donate did nothing.
    waitForjQuery(function () {
      waitForElement(".faq-container .oxy-pro-accordion .oxy-pro-accordion_item:first-child", function () {
        // Wait for 144's FAQ only if test 144 is active on this page
        if (document.body.classList.contains("cre-t-144")) {
          waitFor144(init);
        } else {
          init();
        }
      });
    }, 50, 15000);
    // FIX 2: removed the standalone addDonationLink() call that used to sit here.
    // It inserted the Donate link even when init() hadn't run, leaving a link with no handler.
    // init() adds the link together with its click handler.
  } catch (e) {
    if (debug) console.log(e, "error in Test " + variation_name);
  }
})();
