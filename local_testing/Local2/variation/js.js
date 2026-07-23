(function () {
  try {
    /* Main Variables */
    var debug = 1;
    var variation_name = "cre-t-139";

    /* Helper Library */
    var _$;
    !(function (factory) {
      _$ = factory();
    })(function () {
      var bm = function (s) {
        if (typeof s === "string") {
          this.value = Array.prototype.slice.call(document.querySelectorAll(s));
        }
        if (typeof s === "object") {
          this.value = [s];
        }
      };
      bm.prototype = {
        eq: function (n) {
          this.value = [this.value[n]];
          return this;
        },
        each: function (fn) {
          [].forEach.call(this.value, fn);
          return this;
        },
        log: function () {
          var items = [];
          for (let index = 0; index < arguments.length; index++) {
            items.push(arguments[index]);
          }
          console && console.log(variation_name, items);
        },
        addClass: function (v) {
          var a = v.split(" ");
          return this.each(function (i) {
            for (var x = 0; x < a.length; x++) {
              if (i.classList) {
                i.classList.add(a[x]);
              } else {
                i.className += " " + a[x];
              }
            }
          });
        },
        waitForElement: function (selector, trigger, delayInterval, delayTimeout) {
          var interval = setInterval(function () {
            if (_$(selector).value.length) {
              clearInterval(interval);
              trigger();
            }
          }, delayInterval);
          setTimeout(function () {
            clearInterval(interval);
          }, delayTimeout);
        },
      };
      return function (selector) {
        return new bm(selector);
      };
    });
    var helper = _$();

    /* Live Event Listener */
    function live(selector, event, callback, context) {
      function addEvent(el, type, handler) {
        if (el.attachEvent) el.attachEvent("on" + type, handler);
        else el.addEventListener(type, handler);
      }
      this &&
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
          while (el && el.matches && el !== context && !(found = el.matches(selector))) el = el.parentElement;
          if (found) callback.call(el, e);
        });
      }
      live(selector, event, callback, context);
    }

    var crossIcon = `
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path d="M1.05375 13.3075L0 12.2538L5.6 6.65375L0 1.05375L1.05375 0L6.65375 5.6L12.2537 0L13.3075 1.05375L7.7075 6.65375L13.3075 12.2538L12.2537 13.3075L6.65375 7.7075L1.05375 13.3075Z" fill="white" fill-opacity="0.6" />
      </svg>
    `;

    /*Insurance Partners Data */
    var insurancePartners = [
      {
        dataLabel: "outbound-partner-clicks-Lemonade-Listing-Only",
        partner: "Lemonade",
        classification: "Exceptional",
        total: "9.6",
        popularity: "10.0",
        valueForMoney: "9.8",
        reviews: "9.0",
        popularityPercentage: "100%",
        valueForMoneyPercentage: "98%",
        reviewsPercentage: "90%",
      },
      {
        dataLabel: "outbound-partner-clicks-Pumpkin-Listing-Only",
        partner: "Pumpkin",
        classification: "Very Good",
        total: "8.1",
        popularity: "7.9",
        valueForMoney: "8.0",
        reviews: "8.3",
        popularityPercentage: "79%",
        valueForMoneyPercentage: "80%",
        reviewsPercentage: "83%",
      },
      {
        dataLabel: "outbound-partner-clicks-Fetch-Listing-Only",
        partner: "Fetch",
        classification: "Excellent",
        total: "8.4",
        popularity: "8.6",
        valueForMoney: "8.3",
        reviews: "8.5",
        popularityPercentage: "86%",
        valueForMoneyPercentage: "83%",
        reviewsPercentage: "85%",
      },
      {
        dataLabel: "outbound-partner-clicks-ASPCA-Listing-Only",
        partner: "ASPCA",
        classification: "Excellent",
        total: "8.7",
        popularity: "8.5",
        valueForMoney: "8.4",
        reviews: "8.7",
        popularityPercentage: "85%",
        valueForMoneyPercentage: "84%",
        reviewsPercentage: "87%",
      },
      {
        dataLabel: "outbound-partner-clicks-Embrace-Listing-Only",
        partner: "Embrace",
        classification: "Excellent",
        total: "8.5",
        popularity: "8.4",
        valueForMoney: "8.7",
        reviews: "8.3",
        popularityPercentage: "84%",
        valueForMoneyPercentage: "87%",
        reviewsPercentage: "83%",
      },
      {
        dataLabel: "outbound-partner-clicks-Figo-Listing-Only",
        partner: "Figo",
        classification: "Very Good",
        total: "7.4",
        popularity: "7.1",
        valueForMoney: "7.7",
        reviews: "7.5",
        popularityPercentage: "71%",
        valueForMoneyPercentage: "77%",
        reviewsPercentage: "75%",
      },
      {
        dataLabel: "outbound-partner-clicks-Trupanion-Listing-Only",
        partner: "Trupanion",
        classification: "Good",
        total: "6.9",
        popularity: "6.7",
        valueForMoney: "7.6",
        reviews: "6.5",
        popularityPercentage: "67%",
        valueForMoneyPercentage: "76%",
        reviewsPercentage: "65%",
      },
      {
        dataLabel: "outbound-partner-clicks-AKC-Listing-Only",
        partner: "AKC Pet Insurance",
        classification: "Average",
        total: "4.3",
        popularity: "4.2",
        valueForMoney: "4.2",
        reviews: "4.5",
        popularityPercentage: "42%",
        valueForMoneyPercentage: "42%",
        reviewsPercentage: "45%",
      },
      {
        dataLabel: "outbound-partner-clicks-MetLife-Listing-Only",
        partner: "MetLife",
        classification: "Good",
        total: "6.6",
        popularity: "7.9",
        valueForMoney: "9.0",
        reviews: "2.8",
        popularityPercentage: "79%",
        valueForMoneyPercentage: "90%",
        reviewsPercentage: "28%",
      },
      {
        dataLabel: "outbound-partner-clicks-Odie-Listing-Only",
        partner: "Odie",
        classification: "Average",
        total: "4.8",
        popularity: "4.1",
        valueForMoney: "4.5",
        reviews: "5.7",
        popularityPercentage: "41%",
        valueForMoneyPercentage: "45%",
        reviewsPercentage: "57%",
      },
    ];

    var iIconSvg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M4.60526 7.5H5.39474V4.47368H4.60526V7.5ZM5.30158 3.45066C5.38395 3.36917 5.42513 3.2682 5.42513 3.14776C5.42513 3.02732 5.38439 2.92636 5.30289 2.84487C5.2214 2.76347 5.12044 2.72276 5 2.72276C4.87956 2.72276 4.7786 2.76347 4.69711 2.84487C4.61561 2.92636 4.57487 3.02732 4.57487 3.14776C4.57487 3.2682 4.61605 3.36917 4.69842 3.45066C4.7807 3.53215 4.88123 3.57289 5 3.57289C5.11877 3.57289 5.2193 3.53215 5.30158 3.45066ZM5.00092 10C4.30934 10 3.6593 9.86877 3.05079 9.60632C2.44228 9.34386 1.91298 8.98768 1.46289 8.53776C1.01281 8.08785 0.656447 7.55877 0.393816 6.95053C0.131272 6.34228 0 5.69241 0 5.00092C0 4.30934 0.131228 3.6593 0.393684 3.05079C0.65614 2.44228 1.01232 1.91298 1.46224 1.46289C1.91215 1.01281 2.44123 0.656447 3.04947 0.393816C3.65772 0.131272 4.30759 0 4.99908 0C5.69066 0 6.3407 0.131228 6.94921 0.393684C7.55772 0.65614 8.08702 1.01232 8.53711 1.46224C8.98719 1.91215 9.34355 2.44123 9.60618 3.04947C9.86873 3.65772 10 4.30759 10 4.99908C10 5.69066 9.86877 6.3407 9.60632 6.94921C9.34386 7.55772 8.98768 8.08702 8.53776 8.53711C8.08785 8.98719 7.55877 9.34355 6.95053 9.60618C6.34228 9.86873 5.69241 10 5.00092 10ZM5 9.21053C6.17544 9.21053 7.17105 8.80263 7.98684 7.98684C8.80263 7.17105 9.21053 6.17544 9.21053 5C9.21053 3.82456 8.80263 2.82895 7.98684 2.01316C7.17105 1.19737 6.17544 0.789474 5 0.789474C3.82456 0.789474 2.82895 1.19737 2.01316 2.01316C1.19737 2.82895 0.789474 3.82456 0.789474 5C0.789474 6.17544 1.19737 7.17105 2.01316 7.98684C2.82895 8.80263 3.82456 9.21053 5 9.21053Z"
          fill="#8C8EA0"/>
      </svg>
    `;

    /* REUSABLE HTML GENERATOR FUNCTION */
    function getInsuranceHtml(data) {
      return `
        <div class="cre-t-139-container" croDataLabel="${data.dataLabel}">
          <div class="cre-t-139-wrapper">
            <div class="cre-t-139-reviews">
              <div class="cre-t-139-review-top">
                <div class="cre-t-139-top-content1">
                  <div class="cre-t-139-top-content1-text">
                    <span class="cre-t-139-total">${data.total}</span>
                    <span class="cre-t-139-star">
                      <svg xmlns="http://www.w3.org/2000/svg" width="17" height="16" viewBox="0 0 17 16" fill="none">
                        <path d="M3.25125 16L4.6325 10.0842L0 6.10526L6.12 5.57895L8.5 0L10.88 5.57895L17 6.10526L12.3675 10.0842L13.7487 16L8.5 12.8632L3.25125 16Z" fill="#00C481" />
                      </svg>
                    </span>
                    <span class="cre-t-139-classification-wrap">
                      <span class="cre-t-139-classification"> ${data.classification}</span>
                      <span class="cre-t-139-info-icon">${iIconSvg}</span>
                    </span>
                  </div>
                  <div class="cre-t-139-top-content1-mobile">
                    <div class="cre-t-139-classification">${data.classification}</div>
                    <div class="cre-t-139-top-content2-icon">
                      <svg xmlns="http://www.w3.org/2000/svg" width="7" height="4" viewBox="0 0 7 4" fill="none">
                        <path d="M3.5 4L0 0.756757L0.816667 0L3.5 2.48649L6.18333 0L7 0.756757L3.5 4Z" fill="black" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div class="cre-t-139-top-content2">
                  <div class="cre-t-139-top-content2-text-wrap">
                    <span class="cre-t-139-top-content2-text">Pet Insurance Gurus Score</span>
                    <span class="cre-t-139-info-icon">${iIconSvg}</span>
                  </div>
                  <div class="cre-t-139-top-content2-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="7" height="4" viewBox="0 0 7 4" fill="none">
                      <path d="M3.5 4L0 0.756757L0.816667 0L3.5 2.48649L6.18333 0L7 0.756757L3.5 4Z" fill="black" />
                    </svg>
                  </div>
                </div>
              </div>
              <div class="cre-t-139-review-dropdown">
                <div class="cre-t-139-dropdown-wrapper">
                  <div class="cre-t-139-cross">${crossIcon}</div>
                  <div class="cre-t-139-dropdown-top">
                    <div class="cre-t-139-dropdown-content cre-t-139-dropdown-content1">
                      <div class="cre-t-139-dropdown-info1">
                        <div class="cre-t-139-dropdown-info1-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="13" viewBox="0 0 14 13" fill="none">
                            <path d="M0 13V4.33333H3.85V13H0ZM5.075 13V0H8.925V13H5.075ZM10.15 13V5.77778H14V13H10.15Z" fill="#EEA650" />
                          </svg>
                        </div>
                        <div class="cre-t-139-dropdown-info1-text">Popularity</div>
                      </div>
                      <div class="cre-t-139-dropdown-info2">
                        <div class="cre-t-139-dropdown-info2-bar"><div class="cre-t-139-dropdown-bar" style="width:${data.popularityPercentage}"></div></div>
                        <div class="cre-t-139-dropdown-info2-score">${data.popularity}</div>
                      </div>
                      <div class="cre-t-139-dropdown-info3">Based on sales in the last 7 days</div>
                    </div>

                    <div class="cre-t-139-dropdown-content cre-t-139-dropdown-content2">
                      <div class="cre-t-139-dropdown-info1">
                        <div class="cre-t-139-dropdown-info1-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="13" viewBox="0 0 14 13" fill="none">
                            <path d="M9.8 6.15789C9.99833 6.15789 10.1646 6.09232 10.2987 5.96118C10.4329 5.83004 10.5 5.66754 10.5 5.47368C10.5 5.27982 10.4329 5.11732 10.2987 4.98618C10.1646 4.85504 9.99833 4.78947 9.8 4.78947C9.60167 4.78947 9.43542 4.85504 9.30125 4.98618C9.16708 5.11732 9.1 5.27982 9.1 5.47368C9.1 5.66754 9.16708 5.83004 9.30125 5.96118C9.43542 6.09232 9.60167 6.15789 9.8 6.15789ZM4.2 4.78947H7.7V3.42105H4.2V4.78947ZM1.75 13C1.35333 11.7 0.9625 10.4029 0.5775 9.10855C0.1925 7.81425 0 6.4886 0 5.13158C0 4.08246 0.373333 3.19298 1.12 2.46316C1.86667 1.73333 2.77667 1.36842 3.85 1.36842H7.35C7.68833 0.935088 8.09958 0.598684 8.58375 0.359211C9.06792 0.119737 9.59 0 10.15 0C10.4417 0 10.6896 0.0997807 10.8938 0.299342C11.0979 0.498904 11.2 0.741228 11.2 1.02632C11.2 1.08333 11.1708 1.21447 11.1125 1.41974C11.0658 1.54518 11.0221 1.67346 10.9812 1.80461C10.9404 1.93575 10.9083 2.06974 10.885 2.20658L12.4775 3.76316H14V8.53553L12.0225 9.16842L10.85 13H7V11.6316H5.6V13H1.75Z" fill="#5DC087" />
                          </svg>
                        </div>
                        <div class="cre-t-139-dropdown-info1-text">Value for Money</div>
                      </div>
                      <div class="cre-t-139-dropdown-info2">
                        <div class="cre-t-139-dropdown-info2-bar"><div class="cre-t-139-dropdown-bar" style="width:${data.valueForMoneyPercentage}"></div></div>
                        <div class="cre-t-139-dropdown-info2-score">${data.valueForMoney}</div>
                      </div>
                      <div class="cre-t-139-dropdown-info3">Based on features & benefits for the price</div>
                    </div>
                    <div class="cre-t-139-dropdown-content cre-t-139-dropdown-content3">
                      <div class="cre-t-139-dropdown-info1">
                        <div class="cre-t-139-dropdown-info1-icon">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path d="M0 14V1.4C0 1.015 0.137083 0.685417 0.41125 0.41125C0.685417 0.137083 1.015 0 1.4 0H12.6C12.985 0 13.3146 0.137083 13.5887 0.41125C13.8629 0.685417 14 1.015 14 1.4V9.8C14 10.185 13.8629 10.5146 13.5887 10.7887C13.3146 11.0629 12.985 11.2 12.6 11.2H2.8L0 14ZM4.9525 8.575L7 7.3325L9.0475 8.575L8.505 6.2475L10.325 4.6725L7.9275 4.48L7 2.275L6.0725 4.48L3.675 4.6725L5.495 6.2475L4.9525 8.575Z" fill="#5AACF5" />
                          </svg>
                        </div>
                        <div class="cre-t-139-dropdown-info1-text">Reviews</div>
                      </div>
                      <div class="cre-t-139-dropdown-info2">
                        <div class="cre-t-139-dropdown-info2-bar"><div class="cre-t-139-dropdown-bar" style="width:${data.reviewsPercentage}"></div></div>
                        <div class="cre-t-139-dropdown-info2-score">${data.reviews}</div>
                      </div>
                      <div class="cre-t-139-dropdown-info3">Based on third-party ratings like Trustpilot</div>
                    </div>
                  </div>
                  <div class="cre-t-139-dropdown-bottom">For more details see our <span class="cre-t-139-dropdown-bottom-link">ranking methodology</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    function updateInsuranceData(data, item) {
      const container = item && item.querySelector(".cre-t-139-container");
      if (!container) return;

      // Top score & classification
      container.querySelector(".cre-t-139-total").textContent = data.total;
      container.querySelectorAll(".cre-t-139-classification").forEach((el) => {
        el.textContent = data.classification;
      });

      // Popularity
      container.querySelector(".cre-t-139-dropdown-content1 .cre-t-139-dropdown-bar").style.width = data.popularityPercentage;

      container.querySelector(".cre-t-139-dropdown-content1 .cre-t-139-dropdown-info2-score").textContent = data.popularity;

      // Value for money
      container.querySelector(".cre-t-139-dropdown-content2 .cre-t-139-dropdown-bar").style.width = data.valueForMoneyPercentage;

      container.querySelector(".cre-t-139-dropdown-content2 .cre-t-139-dropdown-info2-score").textContent = data.valueForMoney;

      // Reviews
      container.querySelector(".cre-t-139-dropdown-content3 .cre-t-139-dropdown-bar").style.width = data.reviewsPercentage;

      container.querySelector(".cre-t-139-dropdown-content3 .cre-t-139-dropdown-info2-score").textContent = data.reviews;
    }

    function insurancePartnersFunctionality() {
      var listItemsSection = document.querySelectorAll("#comparison-section .oxy-dynamic-list > [data-unique]");

      listItemsSection.forEach(function (item) {
        var listItemLabel = item.getAttribute("data-unique");
        if (!listItemLabel) return;

        var matchedData = insurancePartners.find(function (data) {
          return data.dataLabel === listItemLabel;
        });

        if (!matchedData) return;

        var existingContainer = item.querySelector(".cre-t-139-container");

        // If container already exists → update data
        if (existingContainer) {
          updateInsuranceData(matchedData, item);
          return;
        }

        // Otherwise → insert HTML
        var trustpilotImage = item.querySelector(".ct-image.trustpilot-image");
        if (!trustpilotImage) return;

        trustpilotImage.parentElement?.classList.add("cre-t-139-container-parent");

        var insuranceHtml = getInsuranceHtml(matchedData);
        trustpilotImage.insertAdjacentHTML("afterend", insuranceHtml);
      });
    }

    /* Function 2: Handle Specific Liberty Mutual Logic */
    // we are separating this function because ***Liberty Mutual*** has different data-unique and we want to make sure it is handled correctly
    /* Specific Liberty Mutual Data */
    var libertyData = {
      dataLabel: "outbound-partner-clicks-Liberty-Mutual-Listing-Only",
      partner: "Liberty Mutual",
      classification: "Average",
      total: "5.1",
      popularity: "5.2",
      valueForMoney: "4.7",
      reviews: "5.3",
      popularityPercentage: "52%",
      valueForMoneyPercentage: "47%",
      reviewsPercentage: "53%",
    };

    function renderLibertyMutual() {
      helper.waitForElement(
        '[data-unique*="Liberty"][data-unique*="Mutual"]',
        function () {
          var item = document.querySelector('[data-unique*="Liberty"][data-unique*="Mutual"]');
          if (item) {
            var existingContainer = item.querySelector(".cre-t-139-container");
            var uniqueClass = "cre-t-139-liberty-mutual";
            if (existingContainer) {
              updateInsuranceData(libertyData);
              return;
            }
            var trustpilotImage = item.querySelector(".ct-image.trustpilot-image");
            if (trustpilotImage) {
              var insuranceHtml = getInsuranceHtml(libertyData);
              trustpilotImage.parentElement?.classList.add("cre-t-139-container-parent");
              trustpilotImage.insertAdjacentHTML("afterend", insuranceHtml);
            }
          }
        },
        25,
        25000,
      );
    }

    function creScroll(bmContentId) {
      var bmContent = document.querySelector(bmContentId);
      if (bmContent) {
        var scrollTop = bmContent.getBoundingClientRect().top + window.pageYOffset;

        window.scrollTo({
          top: scrollTop,
          behavior: "smooth",
        });
      }
    }

    function eventHandler() {
      function dropdownActiveClass() {
        document.querySelectorAll(".cre-t-139-container").forEach(function (item) {
          if (item.classList.contains("cre-t-139-dropdown-active")) {
            item.classList.remove("cre-t-139-dropdown-active");
          }
        });
      }

      live(".cre-t-139-dropdown-bottom span", "click", function () {
        creScroll("#content-section");
        dropdownActiveClass();
      });

      live(".cre-t-139-review-top", "click", function () {
        if (window.innerWidth < 992) {
          var parent = this.closest(".cre-t-139-container");

          if (parent) {
            if (parent.classList.contains("cre-t-139-dropdown-active")) {
              parent.classList.remove("cre-t-139-dropdown-active");
            } else {
              dropdownActiveClass();
              parent.classList.add("cre-t-139-dropdown-active");
            }
          }
        }
      });

      live(".cre-t-139-cross", "click", function () {
        dropdownActiveClass();
      });

      live("body", "click", function (e) {
        if (window.innerWidth < 992) {
          if (!e.target.closest(".cre-t-139-review-top") && !e.target.closest(".cre-t-139-cross") && !e.target.closest(".cre-t-139-container")) {
            dropdownActiveClass();
          }
        }
      });
      live("html body .oxy-read-more-link", "click", function () {
        insurancePartnersFunctionality();
        renderLibertyMutual();
      });

      // Scroll to Ranking Methodology
      live(".cre-t-139-info-icon, .cre-t-139-top-content2 .cre-t-139-top-content2-text", "click", function () {
        creScroll("#content-section");
      });
    }

    /**
     * Monitors network activity to detect dynamic content updates (AJAX/Fetch).
     * Specifically looks for '/v1/quotes' API calls. When a fetch is detected:
     * It removes any previously injected custom review containers to prevent duplicates.
     * (insurancePartnersFunctionality & renderLibertyMutual) as the new data loads into the DOM with second time force insertion.
     */
    function fetchDetect() {
      var performanceObserver = new PerformanceObserver((list) => {
        var entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === "resource" && entry.initiatorType === "fetch") {
            if (entry.name.includes("/v1/quotes")) {
              var forceInsertion2 = setInterval(function () {
                insurancePartnersFunctionality();
                renderLibertyMutual();
              }, 250);

              setTimeout(function () {
                clearInterval(forceInsertion2);
              }, 5000);
            }
          }
        });
      });
      performanceObserver.observe({ entryTypes: ["resource"] });
    }

    /* Initialize Variation */
    function init() {
      _$("body").addClass(variation_name);
      if (!window.cre_t_139_EventHandler) {
        fetchDetect();
        var forceInsertion = setInterval(function () {
          insurancePartnersFunctionality();
          renderLibertyMutual();
        }, 250);
        setTimeout(function () {
          clearInterval(forceInsertion);
        }, 10000);

        eventHandler();
        window.cre_t_139_EventHandler = true;
      }
    }

    /* Wait for Element to Load and Initialize */
    helper.waitForElement("#comparison-section", init, 25, 25000);
  } catch (e) {
    if (debug) console.log(e, "Error in Test " + variation_name);
  }
})();