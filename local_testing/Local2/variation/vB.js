(function () {
  try {
    /* Main Variables */
    const debug = 1;
    const variation_name = "TT-184";
    function waitForElement(selector, trigger) {
      const interval = setInterval(function () {
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
    function debounce(func, timeout = 300) {
      let timer;
      return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          func.apply(this, args);
        }, timeout);
      };
    }
    function observeSelector(selector, callback, options = {}) {
      const processed = new Map();
      let obs;
      let isDone = false;
      const done = () => {
        if (obs) obs.disconnect();
        isDone = true;
      };
      const processElement = (el) => {
        if (!processed.has(el)) {
          processed.set(el, true);
          callback(el);
          if (options.once) {
            done();
            return true;
          }
        }
        return false;
      };
      const lookForSelector = () => {
        const elParent = document.documentElement;
        if (elParent.matches(selector) || elParent.querySelector(selector)) {
          const elements = elParent.querySelectorAll(selector);
          elements.forEach((el) => processElement(el));
        }
      };
      const debouncedLookForSelector = debounce(() => {
        lookForSelector();
      }, 100);
      lookForSelector();
      if (!isDone) {
        obs = new MutationObserver(() => {
          debouncedLookForSelector();
        });
        obs.observe(document, {
          attributes: false,
          childList: true,
          subtree: true,
        });
      }
      return done;
    }
    var svgitem = '<div class="dropdown-launcher_launcherItem__ImkfI"><div class="dropdown-launcher_downCaretContainer__PW51m"><svg height="28" width="28" fill="currentColor" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg"><path d="M6.354 10.764L14 19l7.689-8.275a1 1 0 00-1.342-1.482L14 16 7.715 9.301A1.026 1.026 0 007 9a1 1 0 00-1 1c0 .306.151.537.354.764z"></path></svg></div></div>';
    var subnave = '<div style="color: rgb(211, 212, 213);height: 28px;"><svg height="28" width="28" fill="currentColor" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg"><path d="M10.764 21.646L19 14l-8.275-7.689a1 1 0 00-1.482 1.342L16 14l-6.699 6.285c-.187.2-.301.435-.301.715a1 1 0 001 1c.306 0 .537-.151.764-.354z"></path></svg></div>';
    /*  NAV HTML */
    const topnav = `
<ul class="custom-nav TT-184-nav">
<!-- Interior -->
<li class="nav-item has-dropdown">
<span>Interior ${svgitem}</span>
<div class="dropdown mega-menu">
<div class="menu-left">
<div class="menu-link active" data-target="repairs">
Home Repairs & Maintenance ${subnave}
</div>
<div class="menu-link" data-target="cleaning">
Cleaning & Organization ${subnave}
</div>
<div class="menu-link" data-target="renovation">
Renovations & Upgrades ${subnave}
</div>
</div>
<div class="tt_menu-right">
<!-- Repairs -->
<div class="menu-content active" id="repairs">
<a href="/k/plumbing/near-me">Plumbing</a>
<a href="/k/locksmiths/near-me">Locksmiths</a>
<a href="/k/appliance-repair/near-me">Appliance Repairs</a>
<a href="/k/garage-door-repair/near-me">Garage Door Repairs</a>
<a href="/k/handyman/near-me">Handyman</a>
<a href="/k/furnace-repair/near-me">Furnace Repairs</a>
<a href="/k/hvac/near-me">HVAC</a>
<a href="/k/electrical/near-me">Electrical</a>
<a href="/k/window-and-door-companies/near-me">Windows & Doors</a>
</div>
<!-- Cleaning -->
<div class="menu-content" id="cleaning">
<a href="/k/house-cleaning/near-me">House Cleaning</a>
<a href="/k/carpet-cleaning/near-me">Carpet Cleaning</a>
<a href="/k/upholstery-cleaning/near-me">Upholstery Cleaning</a>
<a href="/k/home-organizers/near-me">Home Organization</a>
<a href="/k/deep-cleaning/near-me">Deep Cleaning</a>
<a href="/k/junk-removal/near-me">Junk Removal</a>
<a href="/k/duct-cleaning/near-me">Duct & Vent Cleaning</a>
<a href="/k/pool-cleaning/near-me">Pool Cleaning</a>
<a href="/k/office-cleaning/near-me">Commercial Cleaners</a>
</div>
<!-- Renovation -->
<div class="menu-content" id="renovation">
<a href="/k/general-contractors/near-me">General Contracting</a>
<a href="/k/carpenters/near-me">Carpenters</a>
<a href="/k/bathroom-remodeling/near-me">Bathroom Remodeling</a>
<a href="/k/kitchen-remodeling/near-me">Kitchen Remodeling</a>
<a href="/k/flooring-installation/near-me">Flooring Installation</a>
<a href="/k/interior-designers/near-me">Interior Design</a>
<a href="/k/carpet-installation/near-me">Carpet Installation</a>
<a href="/k/interior-painting/near-me">Interior Painting</a>
<a href="/k/basements/near-me">Basement Remodeling</a>
</div>
</div>
</div>
</li>
<li class="nav-item has-dropdown">
<span>Exterior ${svgitem}</span>
<div class="dropdown mega-menu">
<!-- LEFT SIDE -->
<div class="menu-left">
<div class="menu-link active" data-target="ext-home">
Exterior Home Care ${subnave}
</div>
<div class="menu-link" data-target="ext-landscape">
Landscaping & Outdoor Services ${subnave}
</div>
</div>
<!-- RIGHT SIDE -->
<div class="tt_menu-right">
<!-- Exterior Home Care -->
<div class="menu-content active" id="ext-home">
<a href="/k/roofing/near-me">Roofing</a>
<a href="/k/home-painters/near-me">House Painting</a>
<a href="/k/window-washing/near-me">Window Washing</a>
<a href="/k/chimney-sweep/near-me">Chimney Sweeps</a>
<a href="/k/pool-service-companies/near-me">Pools</a>
<a href="/k/gutter-cleaning/near-me">Gutter Cleaning</a>
<a href="/k/decks/near-me">Deck Contractors</a>
<a href="/k/siding-contractors/near-me">Siding</a>
<a href="/k/concrete-contractors/near-me">Concrete & Masonry</a>
</div>
<!-- Landscaping -->
<div class="menu-content" id="ext-landscape">
<a href="/k/lawn-care/near-me">Lawn Care</a>
<a href="/k/landscape-designers/near-me">Landscaping Design</a>
<a href="/k/gardening/near-me">Gardening</a>
<a href="/k/tree-services/near-me">Tree Trimming</a>
<a href="/k/sprinkler-systems-repair/near-me">Sprinkler System Repairs</a>
<a href="/k/turf-companies/near-me">Artificial Turf Installation</a>
<a href="/k/stump-grinding/near-me">Stump Grinding</a>
<a href="/k/sodding/near-me">Sod Installation</a>
<a href="/k/tree-arborists/near-me">Arborists</a>
</div>
</div>
</div>
</li>
<li class="nav-item has-dropdown">
<span>More Services ${svgitem}</span>
<div class="dropdown mega-menu">
<!-- LEFT SIDE -->
<div class="menu-left">
<div class="menu-link active" data-target="moving">
Moving  ${subnave}
</div>
<div class="menu-link" data-target="installation">
Installation & Assembly ${subnave}
</div>
<div class="menu-link" data-target="pest">
Pest Control ${subnave}
</div>
<div class="menu-link" data-target="trending">
Trending Services ${subnave}
</div>
<div class="menu-link" data-target="events">
Events ${subnave}
</div>
<div class="menu-link" data-target="wellness">
Health & Wellness ${subnave}
</div>
</div>
<!-- RIGHT SIDE -->
<div class="tt_menu-right">
<!-- Moving -->
<div class="menu-content active" id="moving">
<a href="/k/local-movers/near-me">Local Movers</a>
<a href="/k/long-distance-movers/near-me">Long Distance Movers</a>
<a href="/k/piano-movers/near-me">Piano Movers</a>
<a href="/k/packing-services/near-me">Packing & Unpacking</a>
<a href="/k/move-in-and-move-out-cleaning/near-me">Move In & Move Out Cleaning</a>
<a href="/k/moving-and-storage/near-me">Storage Companies</a>
<a href="/k/single-item-movers/near-me">Furniture Movers</a>
</div>
<!-- Installation -->
<div class="menu-content" id="installation">
<a href="/k/holiday-lighting-installation/near-me">Holiday Light Hanging</a>
<a href="/k/tv-wall-mount-install/near-me">TV Mounting</a>
<a href="/k/security-camera-install/near-me">Security Camera Installation</a>
<a href="/k/appliance-installers/near-me">Appliance Installation</a>
<a href="/k/furniture-assembly/near-me">Furniture Assembly</a>
<a href="/k/ceiling-fan-install/near-me">Ceiling Fan Installation</a>
<a href="/k/generator-installers/near-me">Generator Installation</a>
<a href="/k/picture-hanging/near-me">Art & Picture Hanging</a>
<a href="/k/fitness-equipment-assembly/near-me">Gym Equipment Assembly</a>
</div>
<!-- Pest Control -->
<div class="menu-content" id="pest">
<a href="/k/exterminators/near-me">Pest Control</a>
<a href="/k/mosquito-control-services/near-me">Mosquito Control</a>
<a href="/k/rodent-control/near-me">Rodent Control</a>
<a href="/k/bee-removal/near-me">Bee Removal</a>
<a href="/k/bed-bugs/near-me">Bed Bug Exterminators</a>
<a href="/k/wasp-removal-services/near-me">Wasp Nest Removal</a>
<a href="/k/termites/near-me">Termites</a>
<a href="/k/dead-animal-removal-services/near-me">Dead Animal Removal</a>
</div>
<!-- Trending -->
<div class="menu-content" id="trending">
<a href="/k/bankruptcy-attorneys/near-me">Bankruptcy attorneys</a>
<a href="/k/yard-cleaning-services/near-me">Yard cleaning services</a>
<a href="/k/day-of-wedding-coordinators/near-me">Day of wedding coordinators</a>
<a href="/k/doors/near-me">Doors</a>
<a href="/k/real-estate-lawyers/near-me">Real estate lawyers</a>
<a href="/k/hp-printer-repair/near-me">HP printer repair</a>
</div>
<!-- Events -->
<div class="menu-content" id="events">
<a href="/k/catering/near-me">Caterers</a>
<a href="/k/makeup-artists/near-me">Makeup Artists</a>
<a href="/k/djs/near-me">DJs</a>
<a href="/k/professional-photography/near-me">Photographers</a>
<a href="/k/wedding-planners/near-me">Wedding Planners</a>
<a href="/k/affordable-limousine-services/near-me">Limo Rentals</a>
</div>
<!-- Wellness -->
<div class="menu-content" id="wellness">
<a href="/k/personal-trainers/near-me">Personal Trainers</a>
<a href="/k/life-coach/near-me">Life Coaches</a>
<a href="/k/nutritionists/near-me">Nutritionists</a>
<a href="/k/private-yoga-instructors/near-me">Yoga</a>
</div>
</div>
</div>
</li>
<li class="nav-item has-dropdown">
<span>Additional Resources ${svgitem}</span>
<div class="dropdown mega-menu">
<!-- LEFT SIDE -->
<div class="menu-left">
<div class="menu-link active" data-target="project-guides">
Project Guides ${subnave}
</div>
<div class="menu-link" data-target="city-guides">
City Guides ${subnave}
</div>
</div>
<!-- RIGHT SIDE -->
<div class="tt_menu-right">
<!-- Project Guides -->
<div class="menu-content active" id="project-guides">
<a href="/prices">Cost Guides</a>
<a href="/home-resource-center">Home Resource Center</a>
<a href="/content/home-maintenance">Home Maintenance</a>
<a href="/content/weddings">Weddings</a>
</div>
<!-- City Guides -->
<div class="menu-content" id="city-guides">
<a href="/ga/atlanta">Atlanta</a>
<a href="/ma/boston">Boston</a>
<a href="/il/chicago">Chicago</a>
<a href="/co/denver">Denver</a>
<a href="/ca/los-angeles">Los Angeles</a>
<a href="/fl/miami">Miami</a>
<a href="/az/phoenix">Phoenix</a>
<a href="/ca/san-diego">San Diego</a>
<a href="/ca/san-francisco">San Francisco</a>
<a href="/dc/washington">Washington DC</a>
</div>
</div>
</div>
</li>
</ul>
`;

    /* Helper: reset all tt_menu-right inline display styles */
    function resetAllMenuRights() {
      document.querySelectorAll(".tt_menu-right").forEach(el => {
        el.style.display = "none";
      });
    }

    let isObserverRegistered = false;
    function init() {
      if (!variation_name || document.body.classList.contains(variation_name)) return;
      if (!document.querySelector('[class*="links_linksContainer"] [href="/login"]')) return;
      document.body.classList.add(variation_name);
      if (!isObserverRegistered) {
        observeSelector('[aria-label="Thumbtack Home"]', function (el) {
          if (document.querySelector('.TT-184-nav')) return;
          el.insertAdjacentHTML("afterend", topnav);
          isObserverRegistered = true;
        });
      }

      // CLICK EVENT
      document.addEventListener("click", function (e) {
        const navItem = e.target.closest(".nav-item.has-dropdown");
        const body = document.body;

        // NAV ITEM CLICK
        if (navItem) {
          const isAlreadyActive = navItem.classList.contains("active");
          const allNavItems = document.querySelectorAll(".nav-item.has-dropdown");

          // Close all first + reset ALL tt_menu-right inline styles
          allNavItems.forEach(item => item.classList.remove("active"));
          resetAllMenuRights(); // ✅ FIX: clear stale inline display:block from previous hover

          if (isAlreadyActive) {
            // Was active — toggle it closed
            document.querySelectorAll(".menu-link, .menu-content")
              .forEach(el => el.classList.remove("active"));
            const overlay = document.querySelector(".TT-184-overlay");
            if (overlay) overlay.remove();
            body.classList.remove("TT-184-menu-open");
            return;
          }

          // OPEN new nav item
          navItem.classList.add("active");
          const firstLink = navItem.querySelector(".menu-link");
          const firstContentId = firstLink ? firstLink.getAttribute("data-target") : null;

          navItem.querySelectorAll(".menu-link, .menu-content")
            .forEach(el => el.classList.remove("active"));

          if (firstLink) {
            firstLink.classList.add("active");
          }

          // Overlay add
          if (!document.querySelector(".TT-184-overlay")) {
            const overlay = document.createElement("div");
            overlay.className = "TT-184-overlay";
            document.body.appendChild(overlay);
          }

          body.classList.add("TT-184-menu-open");
        }

        // OVERLAY CLICK — CLOSE ALL
        if (e.target.classList.contains("TT-184-overlay")) {
          document.querySelectorAll(".nav-item.has-dropdown, .menu-link, .menu-content")
            .forEach(el => el.classList.remove("active"));
          e.target.remove();
          document.body.classList.remove("TT-184-menu-open");
          resetAllMenuRights(); // ✅ FIX: also reset on overlay close
        }
      });

      // MOUSEOVER — show sub-menu content on hover
      document.addEventListener("mouseover", function (e) {
        const menuLink = e.target.closest(".menu-link");
        if (!menuLink) return;

        const parent = menuLink.closest(".mega-menu");
        if (!parent) return;

        // Show the right panel on hover
        const menuRight = parent.querySelector(".tt_menu-right");
        if (menuRight) {
          menuRight.style.display = "block";
        }

        // Remove active from siblings
        parent.querySelectorAll(".menu-link, .menu-content").forEach(el => {
          el.classList.remove("active");
        });

        // Activate hovered link and its content
        menuLink.classList.add("active");

        const targetId = menuLink.getAttribute("data-target");
        const targetContent = parent.querySelector("#" + targetId);
        if (targetContent) {
          targetContent.classList.add("active");
        }
      });
    }

    waitForElement('[class*="links_linksContainer"] [href="/login"]', init);
  } catch (e) {
    if (debug) console.log(e, "error in Test " + variation_name);
  }
})();