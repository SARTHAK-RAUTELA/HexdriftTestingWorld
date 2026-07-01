(function () {
  try {
    var debug = 0;
    var variation_name = "cre-t-137";

    let NewFAQ = {
      "Question": "Vets love pet insurance",
      "Answer": "Pet insurance helps veterinarians recommend the best treatment for your pet without cost becoming the deciding factor. It gives pet owners more options during emergencies and can help avoid heartbreaking financial decisions. Every pet insurance provider featured on Pet Insurance Gurus is accepted by licensed veterinarians across the U.S., so you can choose with confidence."
    }

    function scrollToEl(el) {
      var scrollHeight = document.querySelector(el).getBoundingClientRect().top;
      var top = scrollHeight - 100;
      scrollTo({ top: top, behavior: 'smooth' })
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

    function generateAccordianItem() {
      let Question = NewFAQ.Question;
      let Answer = NewFAQ.Answer;

      return `<div class="cre-t-137-accordion_item oxy-pro-accordion_item">
    <button class="cre-t-137-accordion_header" aria-expanded="false">
        <span class="cre-t-137-accordion_title-area oxy-pro-accordion_title-area">
            <h4 class="cre-t-137-accordion_title oxy-pro-accordion_title">${Question}</h4>
            <span class="cre-t-137-accordion_subtitle"></span>
        </span>
        <span class="cre-t-137-accordion_icon cre-t-137-accordion_icon-animate oxy-pro-accordion_icon oxy-pro-accordion_icon-animate">
            <svg class="cre-t-137-accordion_toggle-icon oxy-pro-accordion_toggle-icon">
                <use xlink:href="#Bootstrapbootstrap-icon-plus"></use>
            </svg>
        </span>
    </button>
    <div class="cre-t-137-accordion_body oxy-pro-accordion_body">
        <div class="cre-t-137-accordion_content">
            <p>${Answer}</p>
        </div>
    </div>
</div>`
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

    function live(selector, event, callback, context = document) {
      const addEvent = (el, type, handler) => {
        el.addEventListener(type, handler);
      };

      const liveHandler = e => {
        const el = e.target && e.target.closest ? e.target.closest(selector) : null;

        if (el && el !== context) {
          callback.call(el, e);
        }
      };

      addEvent(context, event, liveHandler);
    }

    function addVetApprovedLink() {
      waitForElement('.oxy-site-navigation.header-nav ul li.menu-item', function () {
        let listItem = document.querySelector('.oxy-site-navigation.header-nav ul li.menu-item');
        if (!document.querySelector('.cre-t-137-vetApprovedLink')) {
          listItem.insertAdjacentHTML('beforebegin', `<li class='cre-t-137-vetApprovedLink'> Vet Approved </li>`)
        }
      })
    }

    function eventHandler() {
      live('.cre-t-137-vetApprovedLink', 'click', function () {
        scrollToEl('.cre-t-137-accordion_header');
        let NewAccordain = document.querySelector('.cre-t-137-accordion_item');
        if (NewAccordain && !NewAccordain.classList.contains('active')) {
          NewAccordain.querySelector('.cre-t-137-accordion_header').click();
        }
      })

      live('.cre-t-137-accordion_item button', 'click', function (e) {
        e.preventDefault();
        e.stopImmediatePropagation()
        var $button = jQuery(this);
        var $item = $button.closest('.cre-t-137-accordion_item');
        var $body = $item.find('.oxy-pro-accordion_body');
        var speed = 300;

        // Close any open accordion items (existing and new), excluding the current one
        jQuery('.oxy-pro-accordion_item.active').not($item[0]).each(function () {
          var $active = jQuery(this);
          if ($active.hasClass('cre-t-137-accordion_item')) {
            // New item — close directly since it has no jQuery handler
            $active.find('.oxy-pro-accordion_body').slideUp(speed);
            $active.find('.oxy-pro-accordion_header').attr('aria-expanded', 'false');
            $active.removeClass('active');
          } else {
            // Existing item — trigger its jQuery handler to close it properly
            $active.find('.oxy-pro-accordion_header').trigger('click');
          }
        });

        // Toggle current item open/closed
        $item.toggleClass('active');
        $body.slideToggle(speed);
        $button.attr('aria-expanded', function (i, val) {
          return val === 'true' ? 'false' : 'true';
        });
      })
    }

    function init() {

      document.querySelector('body').classList.add(variation_name);

      let Accordian = generateAccordianItem();
      // Insert new FAQ and add eventhandler to it
      if (!document.querySelector('.cre-t-137-accordion_item')) {
        document.querySelector('.faq-container .oxy-pro-accordion .oxy-pro-accordion_item:last-child').insertAdjacentHTML('afterend', Accordian)
      }

      addVetApprovedLink()

      if (!window.EventHandlerAddedTest137) {
        eventHandler()
        window.EventHandlerAddedTest137 = true;
      }

    }

    /* Initialize variation */
    waitForjQuery(function () {
      waitForElement(".faq-container .oxy-pro-accordion .oxy-pro-accordion_item:last-child", init);
    })

  } catch (e) {
    if (debug) console.log(e, "error in Test " + variation_name);
  }
})();