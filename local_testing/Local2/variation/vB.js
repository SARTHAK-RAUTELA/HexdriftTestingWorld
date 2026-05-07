(function () {
  try {
    var debug = 0;
    var variation_name = "cre-t-111";

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

    var insurancePartners = [
      { partner: "Lemonade", dataLabel: "outbound-partner-clicks-Lemonade-Listing-Only", discount: 28 },
      { partner: "Figo", dataLabel: "outbound-partner-clicks-Figo-Listing-Only", discount: 18 },
      { partner: "Odie", dataLabel: "outbound-partner-clicks-Odie-Listing-Only", discount: 0 },
      { partner: "Fetch", dataLabel: "outbound-partner-clicks-Fetch-Listing-Only", discount: 11 },
      { partner: "Embrace", dataLabel: "outbound-partner-clicks-Embrace-Listing-Only", discount: 17 },
      { partner: "Trupanion", dataLabel: "outbound-partner-clicks-Trupanion-Listing-Only", discount: 43 },
      { partner: "Pumpkin", dataLabel: "outbound-partner-clicks-Pumpkin-Listing-Only", discount: 31 },
      { partner: "ASPCA", dataLabel: "outbound-partner-clicks-ASPCA-Listing-Only", discount: 0 },
      { partner: "AKC", dataLabel: "outbound-partner-clicks-AKC-Listing-Only", discount: 28 },
    ];

    var libertyData = {
      dataLabel: "outbound-partner-clicks-Liberty-Mutual-Listing-Only",
      discount: 30,
    };


    function applyDiscount(priceEl, discountPercent) {
      waitForElement(
        ".plan-detail-content",
        function () {
          if (!priceEl) return;

          var currentDOMText = priceEl.textContent.trim();
          if (!currentDOMText) return;

          var targetContainer = priceEl.closest(".plan-detail-content");

          // If our injected span was removed by a DOM re-render, clear the stale
          // data-last-applied so the discount is always re-applied correctly
          if (targetContainer && !targetContainer.querySelector(".cre-t-111-price-update")) {
            priceEl.removeAttribute("data-last-applied");
          }

          if (priceEl.getAttribute("data-last-applied") !== currentDOMText) {
            var priceMatch = currentDOMText.match(/\d+(\.\d+)?/);
            if (priceMatch) {
              var oldPrice = parseFloat(priceMatch[0]);
              var newPrice = Math.ceil(oldPrice * (1 - (discountPercent || 0) / 100) * 100) / 100;
              var newPriceText = currentDOMText.replace(priceMatch[0], newPrice.toFixed(2));

              if (targetContainer) {
                var existingUpdate = targetContainer.querySelector(".cre-t-111-price-update");
                if (!existingUpdate) {
                  targetContainer.insertAdjacentHTML("beforeend", `<span class="cre-t-111-price-update" style="display:none;">${newPriceText}.</span>`);
                } else {
                  existingUpdate.textContent = `${newPriceText}.`;
                }
              }
              priceEl.setAttribute("data-last-applied", currentDOMText);
            }
          }
        },
        25,
        25000,
      );
    }

    function renderLibertyMutual() {
      var libertyItems = document.querySelectorAll('#comparison-section .oxy-dynamic-list > [data-unique*="Liberty"][data-unique*="Mutual"]');
      libertyItems.forEach(function (item) {
        var priceElements = item.querySelector(".plan-detail-column .tooltip-container + .plan-detail-content > span:not(.cre-t-111-price-update)");
        applyDiscount(priceElements, libertyData.discount);
      });
    }

    function insuranceListingDescription() {
      document.querySelectorAll(".cre-t-111-price-update").forEach((el) => (el.style.display = "flex"));
      document.querySelectorAll(".plan-detail-content span.ct-span[data-last-applied]").forEach((el) => (el.style.display = "none"));
      var listItemsSection = document.querySelectorAll("#comparison-section .oxy-dynamic-list > [data-unique]");
      listItemsSection.forEach(function (item) {
        var listItemLabel = item.getAttribute("data-unique");
        if (listItemLabel === libertyData.dataLabel) return;

        var matchedData = insurancePartners.find((data) => data.dataLabel === listItemLabel);
        if (!matchedData) return;
        var priceElements = item.querySelectorAll(".plan-detail-column .tooltip-container + .plan-detail-content > span:not(.cre-t-111-price-update)");
        priceElements.forEach(function (priceEl) {
          applyDiscount(priceEl, matchedData.discount);
        });
      });
    }

    function removeMyElements() {
      if (debug) console.log("Removing test elements...");

      // Clear interval using window variable
      if (window.creT111ForceInsert) clearInterval(window.creT111ForceInsert);

      setTimeout(() => {
        document.querySelectorAll(".cre-t-111-price-update").forEach(function (el) {
          el.remove();
        });
        document.querySelectorAll(".plan-detail-content span.ct-span").forEach((el) => (el.style.display = "flex"));
      }, 200);

      document.querySelectorAll("[data-last-applied]").forEach(function (el) {
        el.removeAttribute("data-last-applied");
      });
    }
    // // Use window variable for forceInsert
    // window.creT111ForceInsert;
    function fireMyTest() {
      if (debug) console.log("Variation Showing 111>>>>>>>.");
      // Clear previous interval using window variable
      if (window.creT111ForceInsert) clearInterval(window.creT111ForceInsert);

      window.creT111ForceInsert = setInterval(() => {
        insuranceListingDescription();
        renderLibertyMutual();
      }, 300);

      setTimeout(() => {
        clearInterval(window.creT111ForceInsert);
      }, 10000);
    }

    function checkAndRunTest() {
      if (window.test_111_Experiment !== 1) {
        return;
      }

      var breedValue = document.querySelector("#breed-select") ? document.querySelector("#breed-select").textContent.trim() : "";
      var zipInput = document.querySelector(".zip-textinput input.MuiInputBase-input");
      var zipValue = zipInput ? zipInput.value.trim() : "";

      var isBreedApplied = breedValue && breedValue.toLowerCase() !== "all breeds";
      var isZipApplied = zipValue.length >= 5;

      if (isBreedApplied || isZipApplied) {
        console.log("Condition matched! Vairaiton Running...");
        document.body.classList.add("cre-t-111-toolTipContentChange");
        fireMyTest();
      } else {
        console.log("Condition failed! Calling removeMyElements...");
        removeMyElements();
        document.body.classList.remove("cre-t-111-toolTipContentChange");
      }
    }

    function setupEvents() {
      live("html body .oxy-read-more-link", "click", function () {
        setTimeout(() => {
          checkAndRunTest();
        }, 500);
      });

      live('[role="listbox"] li', "click", function () {
        setTimeout(function () {
          checkAndRunTest();
        }, 100);
      });

      live(".zip-textinput input.MuiInputBase-input", "input", function () {
        checkAndRunTest();
      });

      live(".zip-textinput input.MuiInputBase-input", "change", function () {
        checkAndRunTest();
      });
    }

    /* Variation Init */
    function init() {
      checkAndRunTest();
      if (debug) console.log(variation_name + " initialized");
      if (!window.SWF_111_EVENT_FIRE) {
        window.SWF_111_EVENT_FIRE = true;
        setupEvents();
      }
    }


    /* Initialise variation */
    waitForElement("#breed-select", init, 50, 15000);
  } catch (e) {
    if (debug) console.log(e, "error in Test " + variation_name);
  }
})();
