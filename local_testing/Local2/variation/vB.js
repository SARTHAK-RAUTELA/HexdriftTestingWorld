(function () {
  try {
    /* main variables */
    var debug = 0;
    var variation_name = "cre-t-01";
    var baseUrl = "https://www.financialprofessionals.org";
    var navData = [
      {
        title: "Membership",
        subGroups: [
          {
            groupTitle: "Membership",
            menuSubLinks: [
              { text: "Join AFP", url: "/membership/explore-membership/join" },
              { text: "Member Benefits", url: "/membership/explore-membership/benefits" },
              { text: "Pricing", url: "/membership/explore-membership/join#InteriorContent_C089_Col01" },
              { text: "Convince Your Boss", url: "/membership/explore-membership/convince-your-boss?utm_source=chatgpt.com" },
              { text: "Corporate Membership", url: "/membership/explore-membership/afp-corporate-membership" },
            ],
          },
        ],
      },
      {
        title: "Certification",
        subGroups: [
          {
            groupTitle: "Certification",
            menuSubLinks: [
              { text: "CTP Certification (Treasury)", url: "https://ctpcert.financialprofessionals.org/" },
              { text: "FPAC Certification (FP&A)", url: "https://fpacert.financialprofessionals.org/" },
              { text: "AI for Finance Certificate", url: "/training-resources/afp-learn/ai-for-finance-certificate", badge: "New" },
              { text: "Compare Certifications", url: "https://fpacert.financialprofessionals.org/certification/finance-certifications" },
              { text: "Benefits of Certification", url: "/certification/benefits-of-afp-certifications" },
              { text: "Maintain Your Certification", url: "/certification/already-certified/maintaining-your-credential" },
            ],
          },
        ],
      },
      {
        title: "Conferences",
        subGroups: [
          {
            groupTitle: "Conferences",
            menuSubLinks: [
              { text: "AFP 2026", url: "/events/conference/afp-2024" },
              { text: "FP&A Forum", url: "/events/meetings/afp-fpa-forum" },
            ],
          },
        ],
      },
      {
        title: "Learning",
        subGroups: [
          {
            groupTitle: "Topics",
            menuSubLinks: [
              { text: "Treasury", url: "/topics/treasury" },
              { text: "FP&A", url: "/topics/fp-a-topics/" },
              { text: "Payments", url: "/topics/payment-topics/" },
            ],
          },
          {
            groupTitle: "Insights",
            menuSubLinks: [
              { text: "Articles", url: "/training-resources/resources/articles" },
              { text: "Guides", url: "/training-resources/resources/guides" },
              { text: "Research", url: "/training-resources/resources/survey-research-economic-data" },
            ],
          },
          {
            groupTitle: "Training",
            menuSubLinks: [
              { text: "AFP Learn", url: "/training-resources/afp-learn" },
              { text: "Courses", url: "/training-resources/afp-learn/afp-learn-courses" },
              { text: "Webinars", url: "/training-resources/afp-learn/afp-learn-webinars" },
              { text: "Badges", url: "/training-resources/afp-learn/afp-learn-badges" },
              { text: "Events", url: "/training-resources/afp-learn/afp-learn-launch-event-sessions" },
            ],
          },
          {
            groupTitle: "Professional Tools",
            menuSubLinks: [
              { text: "AFP Service Codes", url: "/training-resources/resources/afp-service-codes" },
              { text: "Marketplace", url: "/training-resources/resources/afp-marketplace" },
              { text: "Glossary", url: "/glossary" },
            ],
          },
        ],
      },
      {
        title: "Member Hub",
        subGroups: [
          {
            groupTitle: "Getting Started",
            menuSubLinks: [{ text: "AFP Power Hour", url: "/events/meetings/afp-power-hour--discover-what%27s-possible" }],
          },
          {
            groupTitle: "Training",
            menuSubLinks: [
              { text: "AFP Learn", url: "/training-resources/afp-learn" },
              { text: "Conference Session Recordings", url: "https://conference.financialprofessionals.org/program/sessions/archives" },
            ],
          },
          {
            groupTitle: "Community",
            menuSubLinks: [
              { text: "AFP Collaborate", url: "https://collaborate.financialprofessionals.org/" },
              { text: "Member Meet-Ups", url: "/events/meetings/virtual-meet-ups" },
            ],
          },
          {
            groupTitle: "Membership",
            menuSubLinks: [
              { text: "Renew Membership", url: "/membership/member-resources/renew" },
              { text: "Member Tools", url: "/membership/member-resources/member-only-tools" },
              { text: "Earn Certification Credits", url: "/certification/already-certified/ways-to-earn-credits/more-than-membership" },
            ],
          },
        ],
      },
    ];

    function formatLink(url) {
      return url.startsWith("http") ? url : baseUrl + url;
    }
    function live(selector, event, callback, context) {
      if (typeof callback !== "function") return;
      context = context || document;

      context.addEventListener(event, function (e) {
        var el = e.target.closest(selector);
        if (el && context.contains(el)) {
          callback.call(el, e);
        }
      });
    }

    function addClass(selector, className) {
      var element = typeof selector === "string" ? document.querySelector(selector) : selector;
      if (!element) return;
      if (element.classdivst) element.classdivst.add(className);
      else if (!element.className.match(new RegExp("\b" + className + "\b"))) {
        element.className += " " + className;
      }
    }

    /* all Pure helper functions */
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

    var newNav = `
            <nav class="${variation_name}-afp-nav" aria-label="cre-t-01-Main-Navigation">
                <div class="${variation_name}-afp-nav-ulList"></div>
            </nav>`;

    function renderNav(data) {
      var navulList = document.querySelector(`.${variation_name}-afp-nav-ulList`);
      if (!navulList) return;

      var newNavhtml = data
        .map(
          (item, index) => `
                <div class="${variation_name}-afp-nav-item topLevel topLevel-list-item-${index + 1}">
                    <button type="button" class="${variation_name}-afp-nav-Link ${variation_name}-has-sub" aria-expanded="false">
                    ${item.title}
                    </button>
                    <div class="${variation_name}-afp-nav-sub-nav" cre-test-subMenuFor=${item.title.split(" ").join("-").toLowerCase()}>
                        ${item.subGroups
                          .map(
                            (group, groupIndex) => `
                            <div class="${variation_name}-afp-nav-item">
                                <div class="${variation_name}-afp-nav-Link ${variation_name}-afp-nav-sub-nav-title">
                                     ${group.groupTitle}
                                </div>
                                <div class="${variation_name}-afp-nav-sub-nav">
                                    ${group.menuSubLinks
                                      .map(
                                        (menuSubLink, linkIndex) => `
                                        <div class="${variation_name}-afp-nav-item subNavItem${linkIndex + 1}" cre-test-subLinkFor=${menuSubLink.text.split(" ").join("-").toLowerCase()}>
                                           <a href="${formatLink(menuSubLink.url)}" class="${variation_name}-afp-nav-Link">
                                             ${menuSubLink.text}
                                            ${menuSubLink.badge ? `<span class="${variation_name}-nav-badge">${menuSubLink.badge}</span>` : ""}
                                            </a>
                                        </div>
                                    `,
                                      )
                                      .join("")}
                                </div>
                            </div>
                        `,
                          )
                          .join("")}
                    </div>
                </div>`,
        )
        .join("");
      navulList.innerHTML = newNavhtml;
    }

    function newMenu() {
      var oldNav = document.querySelector(".afp-nav");
      var alreadyExist = document.querySelector(`.${variation_name}-afp-nav`);
      if (oldNav && !alreadyExist) {
        oldNav.insertAdjacentHTML("afterend", newNav);
        renderNav(navData);
      }
    }

    function eventHandler() {
      live(".cre-t-01-afp-nav-item", "click", function (e) {
        var btn = e.target.closest(".cre-t-01-afp-nav-Link");
        if (!btn) return;
        var subNav = btn.nextElementSibling;
        if (subNav && subNav.classList.contains("cre-t-01-afp-nav-sub-nav")) {
          var isOpen = subNav.classList.contains("open");
          document.querySelectorAll(".cre-t-01-afp-nav-sub-nav.open").forEach(function (openMenu) {
            if (openMenu !== subNav) {
              openMenu.classList.remove("open");
              var activeBtn = openMenu.previousElementSibling;
              if (activeBtn) {
                activeBtn.classList.remove("active");
                activeBtn.setAttribute("aria-expanded", "false");
              }
            }
          });

          if (!isOpen) {
            subNav.classList.add("open");
            btn.classList.add("active");
            btn.setAttribute("aria-expanded", "true");
          } else {
            subNav.classList.remove("open");
            btn.classList.remove("active");
            btn.setAttribute("aria-expanded", "false");
          }
        }
        e.stopPropagation();
      });
      live("body", "click", function (e) {
        var isClickInsideNav = e.target.closest("." + variation_name + "-afp-nav-item");
        if (!isClickInsideNav) {
          document.querySelectorAll("." + variation_name + "-afp-nav-sub-nav.open").forEach(function (openMenu) {
            openMenu.classList.remove("open");
            var activeBtn = openMenu.previousElementSibling;
            if (activeBtn) {
              activeBtn.classList.remove("active");
              activeBtn.setAttribute("aria-expanded", "false");
            }
          });
        }
      });
    }

    /* Variation Init */
    function init() {
      if (document.querySelector(".cre-t-01")) return;
      addClass("body", variation_name);
      newMenu();
      if (!window.evnetHandler01) {
        window.evnetHandler01 = true;
        eventHandler();
      }
      if (debug) console.log(variation_name + " initiadivzed");
    }

    /* Initiadivse variation */
    waitForElement(".afp-nav", init, 50, 15000);
  } catch (e) {
    if (debug) console.log(e, "error in Test " + variation_name);
  }
})();
