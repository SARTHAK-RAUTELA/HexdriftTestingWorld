(function () {
  const DEBUG = 0; 
  const VARIATION_NAME = "afp-26";
  const PLACEHOLDER_CERTIFICATIONS_URL = "#TODO-CERTIFICATIONS-URL";
  const HERO_TITLE = "Advance Your Career with AFP Membership";
  const HERO_TEXT =
    "Practitioner-driven. Peer-informed. Grounded in real-world experience. " +
    "AFP connects you with treasury and finance professionals, practical " +
    "tools and learning to grow your expertise and move your career forward.";
  // The 3 hero "cta-list__item" boxes, in DOM order.
  const CTA_BOXES = [
    {
      subheading: "Questions About Membership?",
      heading: "AFP Power Hour",
      text:
        "Meet the AFP team, see what membership includes and get your " +
        "questions answered live before you decide to join.",
      buttonText: "Register For Power Hour"
    },
    {
      subheading: "Certification",
      heading: "Earn the CTP® or FPAC®",
      text:
        "Progress your career and validate your experience with the " +
        "globally recognized CTP and FPAC® certifications.",
      buttonText: "Explore Certifications",
      href: PLACEHOLDER_CERTIFICATIONS_URL
    },
    {
      subheading: "Connect & Learn",
      heading: "AFP Events",
      text:
        "Join 7,000+ treasury and finance professionals at AFP 2026, the " +
        "premier global event for treasury and finance, plus year-round " +
        "events and meet-ups.",
      buttonText: "Explore AFP Events"
    }
  ];
  const OLD_TAB_LABEL = "Maintaining Your Credential";
  const NEW_TAB_LABEL = "Maintain Your Credential";
  const CONTROL_INTRO_MATCH = "for details on maintaining your credential";
  const VARIATION_INTRO_TEXT =
    "Earn recertification credits while staying current through AFP " +
    "learning, including live webinars that are complimentary for members.";
  const FALLBACK_RECERT_HREF = "/certification/already-certified/maintaining-your-credential";
  // Polls for `selector` and runs `callback` once; self-clears on success or timeout.
  function waitForElement(selector, trigger) {
        var interval = setInterval(function () {
          if (
            document &&
            document.querySelector(selector) &&
            document.querySelectorAll(selector).length > 0
          ) {
            clearInterval(interval);
            trigger();
          }
        }, 50);
        setTimeout(function () {
          clearInterval(interval);
        }, 15000);
      }
  // DOM query shortcuts.
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }
  function qsa(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }
  function setText(el, text) {
    if (el) el.textContent = text;
  }
  // True if `root` already contains something matching `selector` (idempotency guard).
  function exists(root, selector) {
    return !!(root && root.querySelector(selector));
  }
  // Wraps a paragraph's leading text (before its first real link)
  function wrapLeadingTextBeforeLink(p) {
    const link = p.querySelector("a");
    if (!link || !link.textContent.trim()) return;
    if (link.previousElementSibling && link.previousElementSibling.classList.contains("variation-date-prefix")) return;
    const leadingNodes = [];
    let node = p.firstChild;
    while (node && node !== link) {
      leadingNodes.push(node);
      node = node.nextSibling;
    }
    if (!leadingNodes.length) return;
    const span = document.createElement("span");
    span.className = "variation-date-prefix";
    p.insertBefore(span, leadingNodes[0]);
    leadingNodes.forEach(function (n) {
      span.appendChild(n);
    });
    span.textContent = span.textContent.replace(/\|/g, "").replace(/\s+/g, " ");
  }
  // Moves the OLD_TAB_LABEL tab to index 2 (3rd position) within a nav/accordion list.
  function reorderList(section, listSelector, itemSelector, textSelector) {
    const list = qs(listSelector, section);
    if (!list) return;
    const itemNodes = qsa(itemSelector, list);
    const target = itemNodes.find(function (li) {
      const label = qs(textSelector, li);
      return label && label.textContent.trim().indexOf(OLD_TAB_LABEL) !== -1;
    });
    if (!target || itemNodes.indexOf(target) === 2) return;
    const remaining = itemNodes.filter(function (li) {
      return li !== target;
    });
    if (remaining[2]) {
      list.insertBefore(target, remaining[2]);
    } else {
      list.appendChild(target);
    }
  }
  // Equalizes .cta-list__item heights so the buttons land on a shared bottom
  // baseline (CSS align-items:stretch alone isn't reliably taking effect here).
  // Bottom-anchors each card's button on a shared baseline by measuring the
  // tallest card's natural height, then absolute-positioning every button at
  // that card's own bottom/left padding (avoids nested-flex + margin:auto
  // interactions, which produced inconsistent extra growth in this markup).
  function equalizeCardHeights() {
    const items = qsa(".cta-list__item");
    if (items.length < 2) return;
    items.forEach(function (item) {
      item.style.minHeight = "";
      const btn = qs(".cta-list__btn", item);
      if (btn) {
        btn.style.position = "";
        btn.style.bottom = "";
        btn.style.left = "";
      }
    });
    const maxHeight = items.reduce(function (max, item) {
      return Math.max(max, item.getBoundingClientRect().height);
    }, 0);
    if (maxHeight <= 0) return;
    items.forEach(function (item) {
      const cs = window.getComputedStyle(item);
      const padBottom = parseFloat(cs.paddingBottom) || 0;
      const padLeft = parseFloat(cs.paddingLeft) || 0;
      item.style.minHeight = maxHeight + "px";
      const btn = qs(".cta-list__btn", item);
      if (btn) {
        btn.style.position = "absolute";
        btn.style.bottom = padBottom + "px";
        btn.style.left = padLeft + "px";
      }
    });
  }
  // Updates hero headline + the 3 CTA boxes.
  function updateHero() {
    setText(qs(".card--hero__title"), HERO_TITLE);
    setText(qs(".card--hero__text"), HERO_TEXT);
    qsa(".cta-list__item").forEach(function (item, i) {
      const box = CTA_BOXES[i];
      if (!box) return;
      const subheadingEl = qs(".cta-list__subheading", item);
      const headingEl = qs(".cta-list__heading", item);
      const textEl = qs(".cta-list__text", item);
      const buttonEl = qs(".cta-list__btn", item);
      setText(subheadingEl, box.subheading);
      setText(headingEl, box.heading);
      setText(textEl, box.text);
      setText(buttonEl, box.buttonText);
      if (box.href && buttonEl) buttonEl.setAttribute("href", box.href);
    });
    equalizeCardHeights();
  }
  // Updates the "AFP Certifications" tab section: headline, tab order,
  function updateCertTabSection() {
    const section = qs(".tab-section");
    if (!section) return;
    const titleEl = qs(".tab-section__title", section);
    if (titleEl && !exists(section, ".variation-section2-headline")) {
      setText(titleEl, "AFP Certifications");
      titleEl.classList.add("variation-eyebrow-cert");
      const headline = document.createElement("h2");
      headline.className = "variation-section2-headline";
      headline.textContent = "Stand Out with the CTP® or FPAC®";
      titleEl.insertAdjacentElement("afterend", headline);
    }
    reorderList(section, ".tab-section__nav", ".tab-section__nav-item", ".tab-section__nav-btn");
    reorderList(section, ".tab-section__list", ".tab-section__item", ".tab-section__heading");
    qsa(".tab-section__nav-btn, .tab-section__heading, .tab-section__content-title", section).forEach(function (el) {
      if (el.textContent.trim() === OLD_TAB_LABEL) setText(el, NEW_TAB_LABEL);
    });
    qsa(".tab-section__content-title", section)
      .filter(function (el) {
        return el.textContent.trim() === NEW_TAB_LABEL;
      })
      .forEach(function (contentTitle) {
        const prev = contentTitle.previousElementSibling;
        if (prev && prev.classList.contains("variation-eyebrow-already-certified")) return;
        const eyebrow = document.createElement("span");
        eyebrow.className = "variation-eyebrow-already-certified";
        eyebrow.textContent = "Already Certified";
        contentTitle.insertAdjacentElement("beforebegin", eyebrow);
      });
    qsa(".sf-Long-text", section).forEach(function (longText) {
      const firstP = longText.children[0];
      if (!firstP) return;
      if (firstP.textContent.trim().toLowerCase().indexOf(CONTROL_INTRO_MATCH) === -1) return;
      const existingLink = firstP.querySelector("a");
      const recertHref = existingLink ? existingLink.getAttribute("href") : FALLBACK_RECERT_HREF;
      setText(firstP, VARIATION_INTRO_TEXT);
      if (!exists(longText, ".variation-explore-recert")) {
        const p = document.createElement("p");
        p.className = "variation-explore-recert";
        const a = document.createElement("a");
        a.setAttribute("href", recertHref);
        a.textContent = "Explore Recertification →";
        p.appendChild(a);
        longText.appendChild(p);
      }
      qsa("p", longText).forEach(wrapLeadingTextBeforeLink);
    });
  }
  // Entry point: add the variation class, then apply the hero + tab changes.
  function init() {
    document.body.classList.add(VARIATION_NAME);
    updateHero();
    updateCertTabSection();
    if (DEBUG) console.log(VARIATION_NAME + " initialized");
  }
  try {
    waitForElement("body", init, 50, 15000);
  } catch (e) {
    console.error(VARIATION_NAME + ": error running variation", e);
  }
})();
