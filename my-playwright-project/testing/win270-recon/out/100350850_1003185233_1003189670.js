function(convertContext){ 
(function () {
  try {
    var debug = 0;
    var variation_name = "cre-t-270";

    var config = {
      // Buy box
      defaultFirmness: "Luxury Firm",
      firmnessLabel: "Firmness",
      firmnessBullet: "Balanced comfort and support with our most popular Luxury Firm",
      firmnessCookie: "cre-t-270-firmness",
      // Firmness (construction) section
      constructionHeading: "Engineered for the <span>perfect</span> sleep",
      constructionSubheading: "Handcrafted in the U.S.A. with premium, carefully engineered layers to bring you lasting comfort, support and durability.",
      firmnessOptions: [
        { name: "Soft", score: "4.5/10" },
        { name: "Luxury Firm", score: "6.5/10" },
        { name: "Firm", score: "7.5/10" },
        { name: "Plus", score: "8.5/10" },
      ],
      // Sticky nav
      navLabel: "Comfort & Support",
      navTarget: "#shopify-section-winkbed-construction",
      navOffset: 160, // desktop: header + sticky nav (also used for the firmness content scroll)
      mobileScrollOffset: 100, // mobile: sticky header height
      // Video section
      videoHeading: "See how The WinkBed performs in independent testing",
      videoThumbnail: "https://v2.crocdn.com/Winkbed/test270/thumbnail-image.jpg",
      // WIN-255: Luxury Firm panel copy (desktop tab content + mobile accordion)
      luxuryFirmItems: ['[data-attribute="Luxury Firm"]', '[mobile-data-attribute="Luxury Firm"]'],
    };

    var luxuryFirmCopyHTML = `<div class="cre-t-255-wrapper">
      <div class="cre-t-255-main-subHeader">
        Our most popular model, designed to exceed the performance of the finest luxury hotel mattresses.
      </div>
      <div class="cre-t-255-customer-chosen-copy">
        Chosen by 74% of customers
      </div>
    </div>`;

    var checkIcon = `
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="10" fill="#22C55E"/>
        <path d="M5.5 10.2L8.5 13.2L14.5 7.2" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;

    var chevronIcon = `
      <svg class="${variation_name}-explore-chevron" xmlns="http://www.w3.org/2000/svg" width="10" height="6" viewBox="0 0 10 6" fill="none">
        <path d="M1 1L5 5L9 1" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `;

    /* ---------- Helpers (bm_ snippets) ---------- */

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

    /* =====================================================================
       1. BUY BOX - firmness panel, pill, "Change firmness", guide, bullet, cookie
       ===================================================================== */

    var lastFirmness = null;

    // "Select Firmness" -> "Firmness" (theme adds the ":" via label::after)
    function updateFirmnessLabel(option) {
      var labelRow = option.previousElementSibling;
      if (!labelRow || !labelRow.classList.contains("order-form__option-label")) return;
      labelRow.classList.add(variation_name + "-firm-label-row");
      var label = labelRow.querySelector("label");
      if (label) label.textContent = config.firmnessLabel;
    }

    // Our own select, mirroring the original's options - sits invisibly over "Change firmness"
    function getCustomSelectHTML(select) {
      var options = "";
      for (var i = 0; i < select.options.length; i++) {
        var opt = select.options[i];
        options += `<option value="${opt.value}"${opt.value === select.value ? " selected" : ""}${opt.disabled ? " disabled" : ""}>${opt.text.trim()}</option>`;
      }
      return `<select class="${variation_name}-firm-select" aria-label="Change firmness">${options}</select>`;
    }

    // Navy panel: check + firmness name + pill + "Change firmness"
    function addFirmnessPanel(option, select) {
      if (option.querySelector("." + variation_name + "-firm-panel")) return;
      option.insertAdjacentHTML(
        "afterbegin",
        `<div class="${variation_name}-firm-panel">
          <span class="${variation_name}-firm-check">${checkIcon}</span>
          <span class="${variation_name}-firm-name"></span>
          <span class="${variation_name}-firm-badge"></span>
          <span class="${variation_name}-firm-change">
            <span class="${variation_name}-firm-change-text">Change firmness</span>
            ${getCustomSelectHTML(select)}
          </span>
        </div>`
      );
    }

    // Marks the original "Four firmness options..." bullet so it can be swapped per firmness
    function tagFirmnessBullet() {
      if (document.querySelector("." + variation_name + "-firm-bullet")) return;
      var bullets = document.querySelectorAll(".buybox-tabs-panel li");
      for (var i = 0; i < bullets.length; i++) {
        if (/firmness options/i.test(bullets[i].textContent)) {
          bullets[i].classList.add(variation_name + "-firm-bullet");
          bullets[i].setAttribute("data-" + variation_name + "-original", bullets[i].textContent.trim());
          return;
        }
      }
    }

    function updateFirmnessBullet(name) {
      var bullet = document.querySelector("." + variation_name + "-firm-bullet");
      if (!bullet) return;
      bullet.textContent = name === config.defaultFirmness ? config.firmnessBullet : bullet.getAttribute("data-" + variation_name + "-original");
    }

    function getSelectedText(select) {
      var option = select.options[select.selectedIndex];
      return option ? option.text.trim() : select.value;
    }

    // Original select is the source of truth - mirror it into our panel + custom select
    function syncFirmnessPanel() {
      var select = document.querySelector("#firmness-select");
      var panelName = document.querySelector("." + variation_name + "-firm-name");
      var customSelect = document.querySelector("." + variation_name + "-firm-select");
      if (!select || !panelName) return;

      var value = select.value;
      if (customSelect && customSelect.value !== value) customSelect.value = value;
      if (value === lastFirmness) return;
      lastFirmness = value;

      // "Plus: Heavier People" -> name "Plus" + pill "Heavier People" (no ":")
      var parts = getSelectedText(select).split(":");
      var name = parts[0].trim();
      panelName.textContent = name;

      var badge = document.querySelector("." + variation_name + "-firm-badge");
      if (badge) badge.textContent = parts.slice(1).join(":").trim();

      updateFirmnessBullet(name);
    }

    // Pass our select's choice to the original so the theme's own handlers (variant, price, URL) run
    function selectOriginalFirmness(value) {
      var select = document.querySelector("#firmness-select");
      if (!select || select.value === value) return;
      select.value = value;
      // Native event also reaches jQuery-bound handlers
      select.dispatchEvent(new Event("change", { bubbles: true }));
      syncFirmnessPanel();
    }

    // Session cookie (no expiry) remembers a non-default pick; choosing Luxury Firm again clears it
    function saveFirmness(value) {
      if (value !== config.defaultFirmness) {
        setCookie(config.firmnessCookie, value);
      } else {
        setCookie(config.firmnessCookie, "", -1);
      }
    }

    // Non-default firmness picked earlier this session is restored on both selects
    function applySavedFirmness(select) {
      var saved = getCookie(config.firmnessCookie);
      if (!saved || saved === config.defaultFirmness) return;
      var exists = Array.prototype.some.call(select.options, function (opt) {
        return opt.value === saved;
      });
      if (exists) selectOriginalFirmness(saved);
    }

    // "Firmness guide" stays hidden until "Change firmness" is first used, then stays visible
    function revealFirmnessGuide() {
      document.body.classList.add(variation_name + "-guide-visible");
    }

    function initBuyBox(select) {
      var option = select.parentElement;
      option.classList.add(variation_name + "-firm-option");

      // Restore the saved firmness on the original select FIRST, so the theme (price/variant) and
      // the custom select we build from it below both start from the user's choice
      applySavedFirmness(select);

      updateFirmnessLabel(option);
      addFirmnessPanel(option, select);
      tagFirmnessBullet();
      syncFirmnessPanel();
      document.body.classList.add(variation_name + "-firm-ready");
    }

    /* =====================================================================
       2. FIRMNESS SECTION - new copy, Luxury Firm by default, explore toggle
       ===================================================================== */

    function updateConstructionCopy() {
      var header = document.querySelector(".winkbed-construction__header");
      var subheader = document.querySelector(".winkbed-construction__subheader");
      if (header) header.innerHTML = config.constructionHeading;
      if (subheader) subheader.textContent = config.constructionSubheading;
    }

    function getExploreHTML() {
      var buttons = config.firmnessOptions
        .map(function (item) {
          return `<button type="button" class="${variation_name}-explore-option${item.name === config.defaultFirmness ? " " + variation_name + "-active" : ""}" data-firmness="${item.name}">
            <span class="${variation_name}-explore-option-name">${item.name}</span>
            <span class="${variation_name}-explore-option-score">${item.score}</span>
          </button>`;
        })
        .join("");

      return `<div class="${variation_name}-explore">
        <p class="${variation_name}-explore-text">
          Prefer a different feel?
          <button type="button" class="${variation_name}-explore-toggle" aria-expanded="false">Explore other firmness options ${chevronIcon}</button>
        </p>
        <div class="${variation_name}-explore-options">${buttons}</div>
      </div>`;
    }

    // "Prefer a different feel?" block, below both the desktop and mobile layouts
    function addExploreOptions(mobileSection) {
      if (document.querySelector("." + variation_name + "-explore")) return;
      mobileSection.insertAdjacentHTML("afterend", getExploreHTML());
    }

    function toggleExploreOptions(toggle) {
      var wrapper = toggle.closest("." + variation_name + "-explore");
      var isOpen = wrapper.classList.toggle(variation_name + "-explore-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    }

    function setActiveExploreOption(button) {
      var active = document.querySelector("." + variation_name + "-explore-option." + variation_name + "-active");
      if (active) active.classList.remove(variation_name + "-active");
      button.classList.add(variation_name + "-active");
    }

    // Switch both the desktop tabs and the mobile accordion so they stay in sync across breakpoints
    function showFirmnessContent(name) {
      var tab = document.querySelector('.winkbed-construction__content-top-header-item[data-attribute="' + name + '"]');
      if (tab && !tab.classList.contains("active")) tab.click();

      // Mobile accordion: clicking the open item closes it, so only click a closed one
      var items = document.querySelectorAll(".winkbed-construction__accordion-item");
      for (var i = 0; i < items.length; i++) {
        var text = items[i].querySelector(".winkbed-construction__accordion-item-header-text");
        if (text && text.textContent.trim() === name) {
          if (!items[i].classList.contains("winkbed-construction__accordion-active")) {
            items[i].querySelector(".winkbed-construction__accordion-item-header").click();
          }
          break;
        }
      }
    }

    // After picking a firmness, bring its content into view. Desktop shows the tab content container;
    // below 1024px that container is hidden and the mobile accordion is shown instead.
    function scrollToFirmnessContent() {
      var isDesktop = window.innerWidth >= 1024;
      var target = document.querySelector(isDesktop ? ".winkbed-construction__content-bottom-main-container" : ".winkbed-construction__content-section-mobile");
      if (!target) return;
      setTimeout(function () {
        window.scrollTo({
          top: target.getBoundingClientRect().top + window.pageYOffset - (isDesktop ? config.navOffset : config.mobileScrollOffset),
          behavior: "smooth",
        });
      }, 200)
    }

    function initFirmnessSection(mobileSection) {
      updateConstructionCopy();
      addExploreOptions(mobileSection);
      // Tabs / accordion headers are hidden only once the explore block exists (R6)
      document.body.classList.add(variation_name + "-explore-ready");
    }

    /* =====================================================================
       3. STICKY NAV - "Firmness Options" -> "Comfort & Support"
       ===================================================================== */

    function updateDesktopNav(navText) {
      // navText.innerText = config.navLabel;
      // navText.classList.add(variation_name + "-nav-link");
    }

    // Mobile nav dropdowns scroll to the option's data-target via jQuery .data()
    function updateMobileNav() {
      var options = document.querySelectorAll('#mobilePdpNav option[data-target="#firmness"], #footerMobilePdpNav option[data-target="#firmness"]');
      for (var i = 0; i < options.length; i++) {
        options[i].textContent = config.navLabel;
        options[i].setAttribute("data-target", config.navTarget);
        if (window.jQuery) window.jQuery(options[i]).data("target", config.navTarget);
      }
    }

    // Theme handler matches nav links by text, so the renamed link needs its own scroll.
    // Active underline is left to the theme's scroll-spy ("Construction" shares this section).
    function scrollToComfortSection() {
      var target = document.querySelector(config.navTarget);
      if (!target) return;
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.pageYOffset - config.navOffset,
        behavior: "smooth",
      });
    }

    function initStickyNav(navText) {
      // updateDesktopNav(navText);
      updateMobileNav();
    }

    function updateImage() {
      let imageAlt = `The WinkBed is designed to feel medium firm, with a barely-there springiness and fluffy upper portion.`
      let imgSrc = `https://v2.crocdn.com/Winkbed/test270/cre-t-270-newImage.png`

      waitForElement('.pdp-gallery-grid button[data-slide="19"]', function () {
        let slide = document.querySelector('.pdp-gallery-grid button[data-slide="19"]');
        slide.dataset.slide = '4';
        slide.querySelector('img').setAttribute('src', imgSrc);
        slide.querySelector('img').setAttribute('alt', imageAlt);
      })
    }

    /* =====================================================================
       4. VIDEO SECTION - new copy, thumbnail
       ===================================================================== */

    function updateVideoCopy(heading) {
      heading.textContent = config.videoHeading;

      var subheading = document.querySelector(".winkbed-construction-video__subheading");
      if (!subheading || subheading.classList.contains(variation_name + "-updated")) return;
      var linkHTML = `<a class="winkbed-construction-video__heading-link" href="https://naplab.com/mattress-reviews/winkbed-review/" target="_blank">NapLab</a>`;
      subheading.innerHTML = "Watch " + linkHTML + "’s independent review of The WinkBed’s comfort, support, cooling and more.";
      subheading.classList.add(variation_name + "-updated");
    }

    function updateVideoThumbnail() {
      var thumbnail = document.querySelector(".winkbed-construction-video__video-inner .my-thumbnail-image");
      if (thumbnail) thumbnail.setAttribute("src", config.videoThumbnail);
    }

    function initVideoSection(heading) {
      updateVideoCopy(heading);
      updateVideoThumbnail();
    }

    /* =====================================================================
       5. LUXURY FIRM COPY (WIN-255) - new sub-header + "Chosen by 74% of customers"
       ===================================================================== */

    // Adds the new copy after the original sub-header (hidden via CSS once ours is in, R6)
    function addLuxuryFirmCopy(item) {
      if (!item || item.querySelector(".cre-t-255-wrapper")) return;
      var subHeader = item.querySelector("div.winkbed-construction__content-bottom-main-item-top-left-sub-header");
      if (!subHeader) return;
      subHeader.insertAdjacentHTML("afterend", luxuryFirmCopyHTML);
      item.classList.add(variation_name + "-lf-updated");
    }

    function initLuxuryFirmCopy() {
      config.luxuryFirmItems.forEach(function (itemSelector) {
        waitForElement(
          itemSelector + " div.winkbed-construction__content-bottom-main-item-top-left-sub-header",
          function (subHeader) {
            addLuxuryFirmCopy(subHeader.closest(itemSelector));
          },
          25,
          25000
        );
      });
    }

    /* =====================================================================
       EVENTS
       ===================================================================== */

    function onCustomFirmnessChange() {
      saveFirmness(this.value);
      selectOriginalFirmness(this.value);
    }

    function onExploreOptionClick() {
      let that = this;
      scrollToFirmnessContent();
      setTimeout(function () {
        setActiveExploreOption(that);
        showFirmnessContent(that.getAttribute("data-firmness"));
      }, 300)

    }

    function eventHandler() {
      // 1. Buy box
      live("#firmness-select", "change", syncFirmnessPanel);
      live("." + variation_name + "-firm-select", "change", onCustomFirmnessChange);
      live("." + variation_name + "-firm-select", "focusin", revealFirmnessGuide);
      live("." + variation_name + "-firm-select", "click", revealFirmnessGuide);

      // 2. Firmness section
      live("." + variation_name + "-explore-toggle", "click", function () {
        toggleExploreOptions(this);
      });
      live("." + variation_name + "-explore-option", "click", onExploreOptionClick);

      // 3. Sticky nav
      live("." + variation_name + "-nav-link", "click", scrollToComfortSection);
    }

    function init() {
      document.body.classList.add(variation_name);

      waitForElement(".order-form .size-firmness #firmness-select", initBuyBox);
      waitForElement(".winkbed-construction__content-section-mobile", initFirmnessSection);
      waitForElement(".cre37-navigation-link4 .cre37-navigation-link-text", initStickyNav);
      waitForElement(".winkbed-construction-video__heading", initVideoSection);
      waitForElement(".winkbed-construction__content-section", initLuxuryFirmCopy);
      updateImage()
      if (!window.cre_t_270_events) {
        eventHandler();
        window.cre_t_270_events = true;
      }
    }

    /* Initialize variation */
    waitForElement(".order-form.loaded", init);
  } catch (e) {
    if (debug) console.log(e, "error in Test " + variation_name);
  }
})();
}