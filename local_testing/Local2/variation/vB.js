(function () {
  try {
    var debug = 0;
    var variation_name = "cre-t-133";

    /* helpers */

    function setNativeValue(element, value) {
      var lastValue = element.value;
      element.value = value;
      var event = new Event("input", { bubbles: true });
      var tracker = element._valueTracker;
      if (tracker) tracker.setValue(lastValue);
      element.dispatchEvent(event);
    }

    function waitForElement(selector, trigger, delayInterval, delayTimeout) {
      delayInterval = delayInterval || 50;
      delayTimeout = delayTimeout || 15000;
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

    function setCookie(name, value) {
      document.cookie = name + "=" + encodeURIComponent(value) + "; path=/";
    }

    function getCookie(name) {
      var match = document.cookie.match(new RegExp("(?:^|; )" + name.replace(/([.$?*|{}()[\]\\/+^])/g, "\\$1") + "=([^;]*)"));
      return match ? decodeURIComponent(match[1]) : null;
    }

    function live(selector, event, callback, context) {
      function addEvent(el, type, handler) {
        if (el.attachEvent) el.attachEvent("on" + type, handler);
        else el.addEventListener(type, handler);
      }
      this.Element &&
        (function (ElementPrototype) {
          ElementPrototype.matches =
            ElementPrototype.matches ||
            ElementPrototype.matchesSelector ||
            ElementPrototype.webkitMatchesSelector ||
            ElementPrototype.msMatchesSelector ||
            function (selector) {
              var node = this,
                nodes = (node.parentNode || node.document).querySelectorAll(selector),
                i = -1;
              while (nodes[++i] && nodes[i] != node);
              return !!nodes[i];
            };
        })(Element.prototype);

      function live(selector, event, callback, context) {
        addEvent(context || document, event, function (e) {
          var found,
            el = e.target || e.srcElement;
          while (el && el.matches && el !== context && !(found = el.matches(selector)))
            el = el.parentElement;
          if (found) callback.call(el, e);
        });
      }
      live(selector, event, callback, context);
    }

    function track(goalId) {
      window._conv_q = window._conv_q || [];
      window._conv_q.push(["triggerConversion", goalId]);
    }

    /* modal markup */

    var modalHTML = `
      <div class="cre-t-133-overlay" role="dialog" aria-modal="true" aria-labelledby="cre-t-133-heading">
        <div class="cre-t-133-card">
          <button type="button" class="cre-t-133-close" aria-label="Close">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 5L19 19M19 5L5 19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
          <img class="cre-t-133-hero"
               src="https://v2.crocdn.com/SwiftTest/swf133/dogs.png"
               alt="A cat and a dog" />
          <h2 class="cre-t-133-heading" id="cre-t-133-heading">Enter your ZIP for <br>pet insurance prices in your area</h2>
          <p class="cre-t-133-subtext">We'll show prices and rankings based on your location</p>
          <form class="cre-t-133-form" novalidate>
            <div class="cre-t-133-field">
              <span class="cre-t-133-field-pin" aria-hidden="true">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="20" viewBox="0 0 16 20" fill="none">
                  <path d="M8 10C8.55 10 9.02083 9.80415 9.4125 9.41255C9.80417 9.02083 10 8.55 10 8C10 7.45 9.80417 6.97917 9.4125 6.5875C9.02083 6.19583 8.55 6 8 6C7.45 6 6.97917 6.19583 6.5875 6.5875C6.19583 6.97917 6 7.45 6 8C6 8.55 6.19583 9.02083 6.5875 9.41255C6.97917 9.80415 7.45 10 8 10ZM8 17.35C10.0333 15.4833 11.5417 13.7875 12.525 12.2625C13.5083 10.7376 14 9.38335 14 8.2C14 6.38333 13.4208 4.89583 12.2625 3.7375C11.1042 2.57917 9.68333 2 8 2C6.31667 2 4.89583 2.57917 3.7375 3.7375C2.57917 4.89583 2 6.38333 2 8.2C2 9.38335 2.49167 10.7376 3.475 12.2625C4.45833 13.7875 5.96667 15.4833 8 17.35ZM8 20C5.31667 17.7167 3.3125 15.5958 1.9875 13.6375C0.6625 11.6792 0 9.86665 0 8.2C0 5.7 0.804167 3.70833 2.4125 2.225C4.02083 0.74167 5.88333 0 8 0C10.1167 0 11.9792 0.74167 13.5875 2.225C15.1958 3.70833 16 5.7 16 8.2C16 9.86665 15.3375 11.6792 14.0125 13.6375C12.6875 15.5958 10.6833 17.7167 8 20Z" fill="#13162F"/>
                </svg>
              </span>
              <input class="cre-t-133-input" name="zip" type="text"
                     inputmode="numeric" autocomplete="postal-code" maxlength="5"
                     placeholder="Enter ZIP Code" aria-label="Enter ZIP Code" />
            </div>
            <button type="submit" class="cre-t-133-submit">
              <span class="cre-t-133-submit-label">Show my prices</span>
              <span class="cre-t-133-submit-arrow" aria-hidden="true">
                <svg viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2 7H12M12 7L7.5 2.5M12 7L7.5 11.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
            </button>
          </form>
          <div class="cre-t-133-logos" aria-label="Compared insurers">
            <span class="cre-t-133-logo cre-t-133-logo--fetch">
              <img src="https://v2.crocdn.com/SwiftTest/swf133/Fetch.png" alt="Fetch" />
            </span>
            <span class="cre-t-133-logo cre-t-133-logo--aspca">
              <img src="https://v2.crocdn.com/SwiftTest/swf133/ASPCA.png" alt="ASPCA Pet Health Insurance" />
            </span>
            <span class="cre-t-133-logo cre-t-133-logo--lemonade">
              <img src="https://v2.crocdn.com/SwiftTest/swf133/Lemonade.png" alt="Lemonade" />
            </span>
            <span class="cre-t-133-logo cre-t-133-logo--embrace">
              <img src="https://v2.crocdn.com/SwiftTest/swf133/embrace.png" alt="Embrace" />
            </span>
            <span class="cre-t-133-logo cre-t-133-logo--trupanion">
              <img src="https://v2.crocdn.com/SwiftTest/swf133/trupanion.png" alt="Trupanion" />
            </span>
          </div>
          <p class="cre-t-133-more">...and many more</p>
        </div>
      </div>`;

    /* variation functions */

    function closeModal(overlay) {
      track("100037880");
      track("100037881");
      if (!document.querySelector(".exit-modal")) {
        document.body.classList.remove("cre-t-133-modal-active");
      }
      overlay.setAttribute("hidden", "");
      setCookie("cre-t-133-seen", "1");
    }

    function init() {
      if (getCookie("cre-t-133-seen")) { track("100037881"); return; }
      if (document.querySelector(".cre-t-133-overlay")) return;
       document.body.classList.add("cre-t-133");

      setTimeout(function () {
        if (window.location.href.toLowerCase().indexOf("zip") !== -1) return;
        document.body.insertAdjacentHTML("beforeend", modalHTML);
        track("100037876");
        document.body.classList.add("cre-t-133-modal-active");

        var overlay  = document.querySelector(".cre-t-133-overlay");
        var card     = overlay.querySelector(".cre-t-133-card");
        var form     = overlay.querySelector(".cre-t-133-form");
        var borderError = false;
        var zipEngaged = false;
        var submitClicked = false;

        live(".cre-t-133-close", "click", function () {
          closeModal(overlay);
        });

        live(".cre-t-133-overlay", "mousedown", function (e) {
          if (!card.contains(e.target)) closeModal(overlay);
        });

        live(".cre-t-133-input", "input", function () {
          if (!zipEngaged) { zipEngaged = true; track("100037877"); }
          var cleaned = this.value.replace(/\D/g, "").slice(0, 5);
          if (cleaned !== this.value) this.value = cleaned;
          if (borderError) {
            this.style.borderColor = "";
            borderError = false;
          }
        });

        form.addEventListener("submit", function (e) {
          e.preventDefault();
          if (!submitClicked) { submitClicked = true; track("100037878"); }
          var zipInput = overlay.querySelector(".cre-t-133-input");
          var value = zipInput.value.trim();
          if (!/^\d{5}$/.test(value)) {
            zipInput.style.borderColor = "#e02424";
            zipInput.focus();
            borderError = true;
            return;
          }

          track("100037879");
          track("100037881");
          setCookie("cre-t-133-seen", "1");

          var pageZip = document.querySelector('[placeholder="Enter Zip Code"]');
          if (pageZip) {
            setNativeValue(pageZip, value);
            var pageForm = pageZip.closest("form");
            if (pageForm) {
              var pageSubmit = pageForm.querySelector('[type="submit"]');
              if (pageSubmit) {
                pageSubmit.click();
              } else {
                pageForm.submit();
              }
            }
          }

          closeModal(overlay);
        });
      }, 1000);
    }

    /* init */
    waitForElement("body", init, 50, 15000);
  } catch (e) {
    if (debug) console.log(e, "error in Test " + variation_name);
  }
})();