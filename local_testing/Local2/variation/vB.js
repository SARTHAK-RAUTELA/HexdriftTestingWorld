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
          "We donate for every policy purchased through us, helping animals in need. Want to join us? Donate to the American Humane Society and forward your receipt to info@petinsurancegurus.com. We’ll match your donation up to $100, doubling your impact.",
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
      // Matches by class OR by href, so it still works if the nav re-renders and drops the class.
      live(
        ".cre-t-167-donations a, a[href='#faq-donations']",
        "click",
        function (e) {
          e.preventDefault();
          e.stopPropagation();
          if (debug) console.log("clicked donations");
          openFAQ("donations");
        },
        document,
        true,
      );

      // Accordion toggle for the new FAQ items
      live(".cre-t-167-accordion_item button", "click", function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        var $button = jQuery(this);
        var $item = $button.closest(".cre-t-167-accordion_item");
        var $body = $item.find(".oxy-pro-accordion_body");
        var speed = 300;

        // Close any open accordion items (existing and new), excluding the current one
        jQuery(".oxy-pro-accordion_item.active")
          .not($item[0])
          .each(function () {
            var $active = jQuery(this);
            if ($active.hasClass("cre-t-167-accordion_item")) {
              // New item — close directly since it has no jQuery handler
              $active.find(".oxy-pro-accordion_body").slideUp(speed);
              $active.find(".cre-t-167-accordion_header").attr("aria-expanded", "false");
              $active.removeClass("active");
            } else {
              // Existing item — trigger its jQuery handler to close it properly
              $active.find(".oxy-pro-accordion_header").trigger("click");
            }
          });

        // Toggle current item open/closed
        $item.toggleClass("active");
        $body.slideToggle(speed);
        $button.attr("aria-expanded", function (i, val) {
          return val === "true" ? "false" : "true";
        });
      });
    }

    function replaceContactWithDonations() {
      waitForElement('.oxy-site-navigation.header-nav ul li.menu-item a[href*="/contact-us"]', function () {
        document.querySelectorAll('.oxy-site-navigation.header-nav ul li.menu-item a[href*="/contact-us"]').forEach(function (link) {
          var item = link.closest("li");
          if (!item || item.classList.contains(variation_name + "-donations")) return;

          link.textContent = "Donations";
          link.setAttribute("href", "#faq-donations");
          item.classList.add(variation_name + "-donations");

          // Order: How We Rank, Donations, About
          var about = item.parentElement.querySelector('li.menu-item a[href*="/about-us"]');
          if (about && about.closest("li")) {
            about.closest("li").insertAdjacentElement("beforebegin", item);
          }
        });
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

      replaceContactWithDonations();

      // Bind handlers once
      if (!window.EventHandlerAddedTest167) {
        eventHandler();
        window.EventHandlerAddedTest167 = true;
      }
    }

    /* Initialize variation */
    waitForjQuery(function () {
      waitForElement(".faq-container .oxy-pro-accordion .oxy-pro-accordion_item:first-child", function () {
        // Wait for 144's FAQ only if test 144 is active on this page
        if (document.body.classList.contains("cre-t-144")) {
          waitFor144(init);
        } else {
          init();
        }
      });
    });
  } catch (e) {
    if (debug) console.log(e, "error in Test " + variation_name);
  }
})();