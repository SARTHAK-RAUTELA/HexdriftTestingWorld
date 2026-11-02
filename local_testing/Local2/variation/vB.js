(function () {
  try {
    var debug = 0;
    var variation_name = "cre-t-37";
    var cookie_name = "cre-t-37-dismissed";

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

    function fireGoal(eventName) {
      window.VWO = window.VWO || [];
      VWO.event = VWO.event || function () { VWO.push(["event"].concat([].slice.call(arguments))) };
      VWO.event(eventName);
    }

    var copy = {
      title: "A new AFP login is coming soon",
      text: "AFP is updating the way you sign in to our website. Starting in the next few weeks, you’ll need to reset your password the first time you log in. We will have more information for you as we approach the launch date."
    };

    /* Sitewide modal (www.financialprofessionals.org) */
    var modalHTML = `
<div class="cre-t-37-modal" role="dialog" aria-modal="false" aria-labelledby="cre-t-37-modal-title" aria-describedby="cre-t-37-modal-text" aria-hidden="true">
  <button type="button" class="cre-t-37-modal-close" aria-label="Close">
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" focusable="false"><path d="M0.950216 12L0 11.0498L5.04978 6L0 0.950217L0.950216 0L6 5.04978L11.0498 0L12 0.950217L6.95022 6L12 11.0498L11.0498 12L6 6.95022L0.950216 12Z" fill="white"></path></svg>
  </button>
  <h2 class="cre-t-37-modal-title" id="cre-t-37-modal-title">${copy.title}</h2>
  <p class="cre-t-37-modal-text" id="cre-t-37-modal-text">${copy.text}</p>
  <button type="button" class="cre-t-37-modal-cta">Got it</button>
</div>`;

    /* eWeb login page alert */
    var alertHTML = `
<div class="cre-t-37-alert" role="status">
  <p class="cre-t-37-alert-title">${copy.title}</p>
  <p class="cre-t-37-alert-text">${copy.text}</p>
</div>`;

    function showModal() {
      var modal = document.querySelector(".cre-t-37-modal");
      if (!modal || getCookie(cookie_name)) return;
      modal.setAttribute("aria-hidden", "false");
      document.body.classList.add("cre-t-37-modal-open");
      fireGoal("afp37ModalShows");
    }

    function closeModal() {
      if (!document.body.classList.contains("cre-t-37-modal-open")) return;
      fireGoal("afp37ModalDismissed");
      var modal = document.querySelector(".cre-t-37-modal");
      if (modal) modal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("cre-t-37-modal-open");
      setCookie(cookie_name, "1", 7);
    }

    function eventHandler() {
      live(".cre-t-37-modal-close, .cre-t-37-modal-cta", "click", closeModal);
      live(".cre-t-37-modal", "keydown", function (e) {
        if (e.key === "Escape") closeModal();
      });
    }

    function initModal() {
      if (getCookie(cookie_name)) return;
      if (!document.querySelector(".cre-t-37-modal")) {
        document.body.insertAdjacentHTML("beforeend", modalHTML);
      }
      if (!window.cre_t_37_events) {
        eventHandler();
        window.cre_t_37_events = true;
      }
      setTimeout(showModal, 5000);
    }

    function initAlert() {
      waitForElement("#eWebFrameWorkMiddleRow h1", function () {
        if (document.querySelector(".cre-t-37-alert")) return;
        var heading = document.querySelector("#eWebFrameWorkMiddleRow h1");
        heading.insertAdjacentHTML("beforebegin", alertHTML);
      });
    }

    function init() {
      document.body.classList.add(variation_name);

      var host = window.location.hostname;
      if (host === "eweb.afponline.org") {
        initAlert();
      } else {
        initModal();
      }
    }

    /* Initialize variation */
    waitForElement("body", init);

  } catch (e) {
    if (debug) console.log(e, "error in Test " + variation_name);
  }
})();
