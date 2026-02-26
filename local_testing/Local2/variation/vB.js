(function () {
  try {
    var debug = 1;
    var variation_name = "cre-t-160";

    /* helper library */
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

    function insertCSS(css) {
      var style = document.createElement("style");
      style.type = "text/css";
      style.innerHTML = css;
      document.getElementsByTagName("head")[0].appendChild(style);
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
      const document = options.document || window.document;
      const processed = new Map();

      if (options.timeout || options.onTimeout) {
        throw `observeSelector options \`timeout\` and \`onTimeout\` are not yet implemented.`;
      }

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

    /* Live event binding function */
    function live(selector, event, callback, context) {
      /****Helper Functions****/
      // helper for enabling IE 8 event bindings
      function addEvent(el, type, handler) {
        if (el.attachEvent) el.attachEvent("on" + type, handler);
        else el.addEventListener(type, handler);
      }
      // matches polyfill
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
      // live binding helper using matchesSelector
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

    function updateAndCopyText() {
      const containers = document.querySelectorAll('[data-attribute="restaurant-list-location"]');
      const copiedTexts = [];

      containers.forEach((container) => {
        const aEl = container.querySelector("a");
        const spanEl = container.querySelector("span");

        if (!aEl) return;
        if (aEl.dataset.updated) return;

        const aText = aEl.textContent.trim();
        const spanText = spanEl ? spanEl.textContent.trim() : "";

        let fullText = spanText ? `${aText} · ${spanText}` : aText;

        // Measure width
        const containerWidth = container.offsetWidth;
        const measureEl = document.createElement("div");
        measureEl.style.cssText = `
          position: absolute;
          visibility: hidden;
          white-space: nowrap;
          padding: ${getComputedStyle(container).padding};
          margin: ${getComputedStyle(container).margin};
          font: ${getComputedStyle(container).font};
          border: ${getComputedStyle(container).border};
          box-sizing: border-box;
          width: auto;
        `;
        measureEl.textContent = fullText;
        document.body.appendChild(measureEl);

        let finalText = fullText;
        if (measureEl.scrollWidth > containerWidth) {
          let left = 0;
          let right = fullText.length;
          while (left < right) {
            const mid = Math.ceil((left + right) / 2);
            measureEl.textContent = fullText.substring(0, mid) + "...";
            if (measureEl.scrollWidth <= containerWidth) {
              left = mid;
            } else {
              right = mid - 1;
            }
          }
          finalText = left < fullText.length ? fullText.substring(0, left) + "..." : fullText;
        }
        document.body.removeChild(measureEl);

        const children = Array.from(aEl.childNodes);
        children.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE) {
            aEl.removeChild(node);
          }
        });

        aEl.appendChild(document.createTextNode(finalText));

        aEl.dataset.updated = "true";

        if (spanEl) spanEl.remove();

        copiedTexts.push(finalText);
      });

      // const targetElement = document.querySelectorAll('[data-attribute="restaurant-list-item"] .col-span-2 > .relative > .items-center');
      // const wherePlace = document.querySelectorAll('[data-attribute="restaurant-list-item"] [data-attribute="restaurant-list-location"]');

      // if (targetElement && wherePlace) {
      //   wherePlace.insertAdjacentElement("afterend", targetElement);
      // }
      return copiedTexts;
    }

    function addTags() {
      // 1. Select only the wrappers we haven't processed yet
      const peopleCountWrappers = document.querySelectorAll('[data-attribute="booking-fee-element"]:not(.cre-t-160-processed)');

      peopleCountWrappers.forEach(function (item) {
        item.classList.add("cre-t-160-processed");

        // 2. Find the Service Fee RELATIVE to this specific 'item'
        const serFeeElement = item.querySelector('[data-attribute="booking-fee-element"] > span span') || item.parentElement.querySelector('[data-attribute="booking-fee-element"] span');

        const serFee = serFeeElement ? serFeeElement.textContent.trim() : "";

        // 3. Find Points RELATIVE to this card
        const cardContainer = item.closest('[data-attribute="restaurant-list-item"] [data-times-available="true"]');
        const pointsAnchor = cardContainer ? cardContainer.querySelector('a[href="/frequent-foodies"]') : null;
        const pointsValue = pointsAnchor?.textContent.match(/(\d+(?:[.,]\d+)?)/)?.[1] || "";

        const newTagHtml = `
          <div class="cre-t-160-tag-wrapper">
            <div class="cre-t-160-container">
              ${
                pointsValue
                  ? `
              <div class="cre-t-160-box-wrapper points-wrapper tag-1">
                <div class="cre-t-160-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="9" height="12" viewBox="0 0 9 12" fill="none">
                <path d="M6.95157 2.03571C6.44758 2.03571 6.02097 2.1044 5.66682 2.23906C5.36854 2.35248 5.2194 2.40919 5.16673 2.42314C5.09327 2.44259 5.09975 2.44135 5.02429 2.45042C4.97019 2.45691 4.90788 2.45785 4.78326 2.45973C4.66247 2.46156 4.5364 2.46262 4.40423 2.46262H3.44134L3.52038 1.97444C3.64561 1.20265 3.9308 0.88583 4.16778 0.753002C4.21362 0.727312 4.23653 0.714467 4.29528 0.710568C4.33501 0.707932 4.40901 0.725271 4.44344 0.74528C4.49434 0.774869 4.51942 0.811562 4.56959 0.884946L4.90458 1.37497C5.00511 1.52203 5.05538 1.59556 5.16945 1.65578C5.24232 1.69425 5.41512 1.7225 5.49645 1.70925C5.62376 1.6885 5.65789 1.66272 5.72615 1.61115C5.83007 1.53264 5.92259 1.43549 6.00305 1.31827C6.0984 1.18552 6.16997 1.05233 6.21999 0.92014C6.24314 0.858964 6.25472 0.828376 6.24169 0.705135C6.2344 0.63613 6.15866 0.465023 6.11248 0.413227C6.03002 0.320722 5.98931 0.304667 5.90788 0.272556C5.51369 0.117107 4.97511 0 4.44555 0C3.69823 0 3.11798 0.146255 2.69402 0.440741C2.28084 0.733251 1.9988 1.26095 1.8497 2.03373L1.83343 2.12483C1.81727 2.21526 1.8092 2.26047 1.78996 2.29664C1.77199 2.33043 1.75099 2.35552 1.7209 2.37916C1.68867 2.40447 1.64149 2.4219 1.54711 2.45676C1.42373 2.50234 1.30899 2.55178 1.20465 2.60527C1.17723 2.61933 1.16353 2.62635 1.14603 2.63941C1.09668 2.67622 1.05519 2.74412 1.04494 2.80483C1.04131 2.82636 1.04131 2.84611 1.04131 2.88561C1.04131 2.95945 1.04131 2.99637 1.04874 3.02681C1.0718 3.12127 1.14555 3.19502 1.24001 3.21808C1.27045 3.22551 1.30737 3.22551 1.38121 3.22551H1.63952L1.11137 7.11708C0.99373 7.91489 0.66938 8.49323 0.147393 8.85068C0.122529 8.8677 0.110097 8.87622 0.105562 8.87962C0.0165971 8.94641 -0.0163104 9.03503 0.00750589 9.1437C0.00872002 9.14924 0.0112096 9.15862 0.0161888 9.17739C0.0196819 9.19056 0.0214284 9.19715 0.0235969 9.20384C0.0621424 9.32282 0.189412 9.40063 0.31288 9.38072C0.319827 9.3796 0.324548 9.37857 0.333991 9.37652C0.626039 9.31307 0.915045 9.22069 1.30538 9.01444C1.56048 8.88795 1.78144 8.73971 1.97365 8.56381C2.35989 8.22189 2.70301 7.6349 2.78205 6.93129L3.28915 3.3732C3.2966 3.32097 3.30032 3.29486 3.31302 3.27546C3.3242 3.25836 3.34017 3.24494 3.35892 3.23685C3.38021 3.22766 3.40658 3.22847 3.45931 3.23009L4.59824 3.26504C4.49764 3.49628 4.41501 3.7631 4.35572 4.06944L4.33945 4.16054C4.3233 4.25096 4.31522 4.29618 4.29598 4.33235C4.27801 4.36614 4.25701 4.39123 4.22692 4.41487C4.1947 4.44018 4.14751 4.45761 4.05313 4.49247C3.92975 4.53805 3.81502 4.58749 3.71067 4.64098C3.68326 4.65504 3.66955 4.66206 3.65205 4.67512C3.6027 4.71193 3.56121 4.77983 3.55096 4.84054C3.54733 4.86207 3.54733 4.88182 3.54733 4.92132C3.54733 4.99516 3.54733 5.03208 3.55476 5.06252C3.57782 5.15698 3.65157 5.23073 3.74603 5.25379C3.77648 5.26122 3.81339 5.26122 3.88723 5.26122H4.14554L3.61739 9.15279C3.49975 9.9506 3.1754 10.5289 2.65342 10.8864C2.62855 10.9034 2.61612 10.9119 2.61159 10.9153C2.52262 10.9821 2.48971 11.0707 2.51353 11.1794C2.51474 11.1849 2.51723 11.1943 2.52221 11.2131C2.5257 11.2262 2.52744 11.2328 2.52961 11.2395C2.56816 11.3585 2.69551 11.4363 2.81898 11.4164C2.82592 11.4153 2.83062 11.4142 2.84001 11.4122C3.13157 11.3487 3.41976 11.2564 3.81141 11.0501C4.0665 10.9237 4.28746 10.7754 4.47968 10.5995C4.86591 10.2576 5.20903 9.67061 5.28807 8.967L5.81622 5.26122H6.35959C6.43397 5.26122 6.47115 5.26122 6.50181 5.25368C6.59591 5.23053 6.66938 5.15706 6.69253 5.06296C6.70007 5.03231 6.70007 4.99512 6.70007 4.92074C6.70007 4.88127 6.70007 4.86154 6.69638 4.83986C6.68614 4.77961 6.64457 4.71158 6.59564 4.67496C6.57804 4.66179 6.5645 4.65484 6.53742 4.64095C6.40656 4.57383 6.25941 4.51369 6.10016 4.45976C6.04967 4.44266 6.02442 4.43411 6.0081 4.41897C5.99338 4.40533 5.98349 4.38892 5.97829 4.36954C5.97253 4.34804 5.9766 4.32262 5.98476 4.27177L6.02641 4.01213C6.15163 3.24033 6.43682 2.92352 6.6738 2.79069C6.71964 2.765 6.74256 2.75215 6.80131 2.74825C6.84103 2.74562 6.91504 2.76296 6.94946 2.78297C7.00036 2.81256 7.02545 2.84925 7.07561 2.92263L7.4106 3.41266C7.51114 3.55972 7.5614 3.63325 7.67548 3.69346C7.74835 3.73193 7.92114 3.76019 8.00247 3.74693C8.12979 3.72619 8.16392 3.7004 8.23217 3.64884C8.3361 3.57033 8.42861 3.47317 8.50908 3.35596C8.60442 3.2232 8.67599 3.09002 8.72602 2.95783C8.74917 2.89665 8.76074 2.86606 8.74771 2.74282C8.74042 2.67382 8.66468 2.50271 8.61851 2.45091C8.53604 2.35841 8.49533 2.34235 8.4139 2.31024C8.01971 2.15479 7.48113 2.03769 6.95157 2.03769V2.03571Z" fill="#717982"/>
              </svg>
                </div>
                <div class="cre-t-160-text">${pointsValue} points</div>
              </div>`
                  : ""
              }
              <div class="cre-t-160-box-wrapper service-wrapper tag-2">
                <div class="cre-t-160-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="9" viewBox="0 0 12 9" fill="none">
                <path d="M10.8333 3.08333H0.5M0.5 2.15333L0.5 6.08C0.5 6.65872 0.5 6.94808 0.612627 7.16912C0.711696 7.36356 0.869776 7.52164 1.06421 7.62071C1.28525 7.73333 1.57461 7.73333 2.15333 7.73333L9.18 7.73333C9.75872 7.73333 10.0481 7.73333 10.2691 7.62071C10.4636 7.52164 10.6216 7.36356 10.7207 7.16912C10.8333 6.94808 10.8333 6.65872 10.8333 6.08V2.15333C10.8333 1.57461 10.8333 1.28525 10.7207 1.06421C10.6216 0.869776 10.4636 0.711697 10.2691 0.612627C10.0481 0.500001 9.75872 0.500001 9.18 0.500001L2.15333 0.5C1.57461 0.5 1.28525 0.5 1.06421 0.612627C0.869776 0.711696 0.711696 0.869776 0.612627 1.06421C0.5 1.28525 0.5 1.57461 0.5 2.15333Z" stroke="#717982" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
                </div>
                <div class="cre-t-160-text">
                  <span class="cre-t-160-serviceFee">${serFee}</span> 
                  <span class="cre-t-160-serviceText"> service fee</span>
                </div>
              </div>
            </div>
          </div>`;

        // 4. Target the specific card we are currently looking at
        if (cardContainer) {
          const targetInsertionPoint = cardContainer.querySelector("div.col-span-2");
          if (targetInsertionPoint && !targetInsertionPoint.querySelector(".cre-t-160-tag-wrapper")) {
            targetInsertionPoint.insertAdjacentHTML("afterbegin", newTagHtml);
          }
        }
      });
    }

    function hrTextSeparate() {
      // Process TIME buttons
      const timeButtons = document.querySelectorAll('[data-attribute="restaurant-list-item"] button[data-attribute="New_booking-time-button"]');
      timeButtons.forEach((button) => {
        if (button.dataset.processedTime) return;

        const textContent = button.textContent.trim();
        const matches = textContent.match(/(\d{1,2}(:\d{2})?)(\s?[APap][Mm])/);

        if (!matches) {
          return;
        }

        const time = matches[1];
        const ampm = matches[3].trim();

        // Create spans for time and am/pm
        const timeSpan = document.createElement("span");
        timeSpan.textContent = time;
        timeSpan.classList.add("time-span");

        const ampmSpan = document.createElement("span");
        ampmSpan.textContent = ampm;
        ampmSpan.classList.add("ampm-span");

        // Clear previous content and append new spans
        button.textContent = "";
        button.appendChild(timeSpan);
        button.appendChild(ampmSpan);

        button.dataset.processedTime = "true";
      });

      // Process DATE bold spans
      const dateSpans = document.querySelectorAll('[data-attribute="New_booking-date-button"] span.font-bold');
      dateSpans.forEach((span) => {
        if (span.dataset.processedDate) return;

        const originalText = span.textContent.trim();
        const parts = originalText.split(/\s+/); // Split on any whitespace
        let dayPart = "";
        let monthPart = "";

        if (parts.length === 2) {
          const [part1, part2] = parts.map((p) => p.trim());

          if (/^\d+$/.test(part1)) {
            dayPart = part1;
            monthPart = part2;
          } else if (/^\d+$/.test(part2)) {
            dayPart = part2;
            monthPart = part1;
          }
        } else if (parts.length === 1) {
          // Attempt to match mixed formats like "11DEC" or "DEC11"
          const match = originalText.match(/^(\d+)([A-Za-z]+)|^([A-Za-z]+)(\d+)$/);
          if (match) {
            dayPart = match[1] || match[4];
            monthPart = match[2] || match[3];
          } else {
            // Can't split — fallback to treating as day
            dayPart = originalText;
            monthPart = "";
          }
        }

        // Create spans for day and month
        const daySpan = document.createElement("span");
        daySpan.textContent = dayPart;
        daySpan.classList.add("date-day-span");

        const monthSpan = document.createElement("span");
        monthSpan.textContent = monthPart;
        monthSpan.classList.add("date-month-span");

        // Clear previous content and append new spans
        span.textContent = "";
        span.appendChild(daySpan);
        if (monthPart) span.appendChild(monthSpan);

        span.dataset.processedDate = "true";
      });
    }

    function buttonFunctionMoreThanThree() {
      // 1. Define the selector for the "row" containers
      const rowSelector = '[data-attribute="restaurant-list-item"] .group.relative div.items-stretch';

      // 2. Define the selector for the "button" inside those containers
      const buttonSelector = '[data-attribute="restaurant-list-item"] .group.relative div.items-stretch button:not([data-attribute="New_booking-date-button"])';

      // 3. Define the classes and attributes to be added
      const targetClass = "has-more-than-three-buttons";
      const buttonClassToAdd = "cre-t-160-remove-class";
      const attributeToAdd = "data-more-than-three-buttons";
      const attributeValue = "true";

      // 4. Get all elements matching the row selector (NodeList)
      const rowElements = document.querySelectorAll(rowSelector);

      // 5. Check if any row elements were found
      if (rowElements.length > 0) {
        rowElements.forEach(function (row) {
          const buttons = row.querySelectorAll(buttonSelector);

          if (buttons.length > 3) {
            row.classList.add(targetClass);

            const parentDiv = row.closest('[data-attribute="restaurant-list-item"] .group.relative');

            if (parentDiv) {
              if (!parentDiv.hasAttribute(attributeToAdd)) {
                parentDiv.insertAdjacentHTML(
                  "beforeend",
                  `<div class="cre-t-160-more-times-container">
                <div class="cre-t-160-more-time-text">More times</div>
                <div class="cre-t-160-more-time-text-icon">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="size-3.5 text-gray-300">
                    <path d="m3 6 5 5 5-5" stroke="currentColor" stroke-width="2"></path>
                  </svg>
                </div>
              </div>`,
                );

                // 12. Add the attribute with the value 'true'
                parentDiv.setAttribute(attributeToAdd, attributeValue);
              }
            }

            // 13. Add the button class to all buttons except the first 3
            buttons.forEach(function (button, index) {
              if (index >= 3) {
                button.classList.add(buttonClassToAdd);
              }
            });
          }
        });
      }
    }
    function buttonFunctionMoreTime() {
      // Define selectors and attributes
      const rowSelector = '[data-attribute="restaurant-list-item"] .group.relative div.items-stretch';
      const buttonSelector = 'button:not([data-attribute="New_booking-date-button"])';
      const targetClass = "has-more-than-three-buttons";
      const buttonClassToAdd = "cre-t-160-remove-class";
      const attributeToAdd = "data-more-than-three-buttons";
      const attributeValue = "true";

      const rowElements = document.querySelectorAll(rowSelector);

      if (rowElements.length === 0) {
        return;
      }

      rowElements.forEach(function (row) {
        const buttons = row.querySelectorAll(buttonSelector);

        // First, check if there is a "more times" button and add the attribute if it exists
        let moreTimesButtonFound = false;
        buttons.forEach(function (button) {
          if (button.textContent.trim().toLowerCase() === "more times") {
            // If the button text is "more times", add the attribute
            button.setAttribute("data-more-time", "true");
            moreTimesButtonFound = true;
          }
        });

        // If a "more times" button is found, proceed with the rest of the logic
        if (moreTimesButtonFound) {
          // Add class to the row if not already added
          if (!row.classList.contains(targetClass)) {
            row.classList.add(targetClass);
          }

          const parentDiv = row.closest('[data-attribute="restaurant-list-item"] .group.relative');
          if (!parentDiv) return;

          // Check if "more time" element already exists
          let moreTimeDiv = parentDiv.querySelector(".cre-t-160-more-time-button");

          if (!moreTimeDiv) {
            // Create and insert "more time" div if it doesn't exist
            moreTimeDiv = document.createElement("div");
            moreTimeDiv.textContent = "More times";
            moreTimeDiv.classList.add("cre-t-160-more-time-button");

            // Create the SVG icon
            const moreTimeIconDiv = document.createElement("div");
            moreTimeIconDiv.classList.add("cre-t-160-more-time-text-icon");

            const svgIcon = `
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" class="size-3.5 text-gray-300">
                <path d="m3 6 5 5 5-5" stroke="currentColor" stroke-width="2"></path>
              </svg>
            `;

            moreTimeIconDiv.innerHTML = svgIcon;

            // Append the icon to the moreTimeDiv
            moreTimeDiv.appendChild(moreTimeIconDiv);

            // Insert the "more time" div after the parentDiv
            parentDiv.appendChild(moreTimeDiv);
          }

          // Ensure the attribute is set on parentDiv
          if (!parentDiv.hasAttribute(attributeToAdd)) {
            parentDiv.setAttribute(attributeToAdd, attributeValue);
          }

          // Add class to buttons beyond the first 3
          buttons.forEach(function (button, index) {
            // Check if button is beyond the first 3 and doesn't already have the class
            if (index >= 3 && !button.classList.contains(buttonClassToAdd)) {
              button.classList.add(buttonClassToAdd);
            }
          });
        }
      });
    }

    function eventListenerButton() {
      live(".cre-t-160-more-time-button", "click", function () {
        const btnParentDiv = this.closest('[data-attribute="restaurant-list-item"] .group.relative');
        // Find the button inside the row that contains data-more-time="true"
        const buttonWithMoreTime = btnParentDiv.querySelector('button[data-more-time="true"]');

        // Check if a button with data-more-time="true" exists
        if (buttonWithMoreTime) {
          // Proceed to add the class to the parent div only if it isn't already present
          if (!btnParentDiv.classList.contains("cre-t-160-remove-class-button")) {
            buttonWithMoreTime.click();
            btnParentDiv.classList.add("cre-t-160-remove-class-button");
          }
        } else {
          // If no such button exists, just add the class
          if (!btnParentDiv.classList.contains("cre-t-160-remove-class-button")) {
            btnParentDiv.classList.add("cre-t-160-remove-class-button");
          }
        }
      });

      live(".cre-t-160-more-times-container", "click", function () {
        const parentDiv = this.closest('[data-attribute="restaurant-list-item"] .group.relative');
        parentDiv.classList.add("cre-t-160-remove-class-button");
      });
    }

    function getOriginId() {
      const origin = window.location.origin.trim();
      if (origin === "https://www.firsttable.co.nz") return 1;
      if (origin === "https://www.firsttable.com.au") return 2;
      if (origin === "https://www.firsttable.co.uk") return 8;
      return 1;
    }

    function addScript() {
      if (document.getElementById("cre-swiper-js")) return;
      const script = document.createElement("script");
      script.id = "cre-swiper-js";
      script.src = "https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js";
      document.head.appendChild(script);

      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css";
      document.head.appendChild(link);
    }

    function waitForSwiper(cb) {
      const check = () => {
        if (window.Swiper) cb();
        else setTimeout(check, 50);
      };
      setTimeout(() => {}, 15000); // safety
      check();
    }

    /* === MODAL RENDERING (shared) === */
    function showMenuModal(menuImages, hasThumbnails = true) {
      const closeModal = () => {
        const modal = document.querySelector(`.${variation_name}-overlay-and-modal`);
        document.body.classList.remove("cre-t-160-trigger");
        if (modal) modal.remove();
      };

      closeModal();

      let mainSlides = menuImages
        .map(
          (img, i) =>
            `<div class="swiper-slide" data-swiper-slide-index="${i}">
          <img src="${img.url}" alt="Image" style="display:block;width:100%;height:auto;object-fit:contain;">
        </div>`,
        )
        .join("");

      let modalHTML;

      if (hasThumbnails) {
        let thumbs = menuImages
          .map(
            (img, i) =>
              `<div class="swiper-slide" data-swiper-slide-index="${i}">
            <img src="${img.url}" alt="Thumb">
          </div>`,
          )
          .join("");

        modalHTML = `
          <div class="${variation_name}-overlay-and-modal">
            <div class="${variation_name}-modal-overlay"></div>
            <div class="${variation_name}-modal-section-container">
              <div class="swiper-pagination-fraction"></div>
              <div class="${variation_name}-modal-close">
                <div class="${variation_name}-close-icon">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" color="#265682">
                    <path fill="currentColor" d="m2.343 3.757 1.414-1.414 9.9 9.9-1.415 1.414z"/>
                    <path fill="currentColor" d="m12.243 2.343 1.414 1.414-9.9 9.9-1.413-1.414z"/>
                  </svg>
                </div>
              </div>
              <div class="${variation_name}-modal-section">
                <div class="${variation_name}-modal-wrapper">
                  <div class="${variation_name}-modal-main">
                    <div class="${variation_name}-modal-swiper swiper">
                      <div class="${variation_name}-modal-main-swiper swiper-wrapper">${mainSlides}</div>
                      <div class="swiper-button-next">
                        <svg width="60" height="15" viewBox="0 0 60 15" fill="none" xmlns="http://www.w3.org/2000/svg" color="#265682">
                          <path d="M0 1h60M59 1 46 14" stroke="currentColor" stroke-width="2"/>
                        </svg>
                      </div>
                      <div class="swiper-button-prev">
                        <svg width="60" height="15" viewBox="0 0 60 15" fill="none" xmlns="http://www.w3.org/2000/svg" color="#265682">
                          <path d="M60 14H0M1 14 14 1" stroke="currentColor" stroke-width="2"/>
                        </svg>
                      </div>
                    </div>
                    <div class="cre-t-160-thumbnails-wrapper">
                      <div class="${variation_name}-modal-thumbnails swiper">
                        <div class="swiper-wrapper">${thumbs}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>`;
      } else {
        modalHTML = `
          <div class="${variation_name}-overlay-and-modal">
            <div class="${variation_name}-modal-overlay"></div>
            <div class="${variation_name}-modal-section-container">
              <div class="${variation_name}-modal-close">
                <div class="${variation_name}-close-icon">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" color="#C9CACB">
                    <path fill="currentColor" d="m2.343 3.757 1.414-1.414 9.9 9.9-1.415 1.414z"/>
                    <path fill="currentColor" d="m12.243 2.343 1.414 1.414-9.9 9.9-1.413-1.414z"/>
                  </svg>
                </div>
              </div>
              <div class="${variation_name}-modal-section">
                <div class="${variation_name}-modal-wrapper">
                  <div class="${variation_name}-modal-main">
                    <div class="${variation_name}-modal-swiper swiper">
                      <div class="${variation_name}-modal-main-swiper swiper-wrapper">${mainSlides}</div>
                      <div class="swiper-button-next">
                        <svg width="60" height="15" viewBox="0 0 60 15" fill="none" xmlns="http://www.w3.org/2000/svg" color="#C9CACB">
                          <path d="M0 1h60M59 1 46 14" stroke="currentColor" stroke-width="2"/>
                        </svg>
                      </div>
                      <div class="swiper-button-prev">
                        <svg width="60" height="15" viewBox="0 0 60 15" fill="none" xmlns="http://www.w3.org/2000/svg" color="#C9CACB">
                          <path d="M60 14H0M1 14 14 1" stroke="currentColor" stroke-width="2"/>
                        </svg>
                      </div>
                      <div class="swiper-pagination"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>`;
      }

      document.body.insertAdjacentHTML("beforeend", modalHTML);
      document.body.classList.add("cre-t-160-trigger");

      document.querySelector(`.${variation_name}-modal-close`).addEventListener("click", function () {
        closeModal();

        // 5. Restore body scroll and exact position
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.overflowY = "";

        // 6. Jump back to where user was
        window.scrollTo(0, window.cre171ScrollPosition);
      });
      document.querySelector(`.${variation_name}-close-icon`).addEventListener("click", function () {
        closeModal();

        // 5. Restore body scroll and exact position
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.overflowY = "";

        // 6. Jump back to where user was
        window.scrollTo(0, window.cre171ScrollPosition);
      });
      document.querySelector(`.${variation_name}-close-icon svg`).addEventListener("click", function () {
        closeModal();

        // 5. Restore body scroll and exact position
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.overflowY = "";

        // 6. Jump back to where user was
        window.scrollTo(0, window.cre171ScrollPosition);
      });
      document.querySelector(`.${variation_name}-modal-overlay`).addEventListener("click", function () {
        closeModal();

        // 5. Restore body scroll and exact position
        document.body.style.position = "";
        document.body.style.top = "";
        document.body.style.left = "";
        document.body.style.right = "";
        document.body.style.overflowY = "";

        // 6. Jump back to where user was
        window.scrollTo(0, window.cre171ScrollPosition);
      });
      // live(`.${variation_name}-modal-close, .${variation_name}-close-icon, .${variation_name}-close-icon svg, .${variation_name}-modal-overlay`, "click", closeModal);

      function loadPinchZoom(cb) {
        // If already available
        if (window.PinchZoom) return cb();

        // Prevent double-inject
        if (document.getElementById("cre-pinchzoom-js")) {
          const t = setInterval(() => {
            if (window.PinchZoom) {
              clearInterval(t);
              cb();
            }
          }, 50);
          setTimeout(() => clearInterval(t), 8000);
          return;
        }

        const s = document.createElement("script");
        s.id = "cre-pinchzoom-js";
        // UMD build exposes PinchZoom as a global (safest for in-page experiments)
        s.src = "https://unpkg.com/pinch-zoom-js@2.3.5/dist/pinch-zoom.umd.min.js";
        s.onload = cb;
        document.head.appendChild(s);
      }

      function enablePinchAndTapZoom(mainSlider) {
        loadPinchZoom(() => {
          const PinchZoomCtor = window.PinchZoom?.default || window.PinchZoom;
          if (!PinchZoomCtor || !mainSlider) return;

          const instances = new WeakMap();

          function ensureHost(slide) {
            const img = slide.querySelector("img");
            if (!img) return null;

            let host = slide.querySelector(".cre-t-160-pz-host");
            if (host) return host;

            host = document.createElement("div");
            host.className = "cre-t-160-pz-host";
            host.style.cssText = `
        width: 100%;
        height: 100%;
        position: relative;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        touch-action: none;
      `;

            img.parentNode.insertBefore(host, img);
            host.appendChild(img);

            img.style.maxWidth = "100%";
            img.style.maxHeight = "100%";
            img.style.width = "auto";
            img.style.height = "auto";
            img.style.objectFit = "contain";
            img.style.display = "block";
            img.draggable = false;

            return host;
          }

          function getInstance(slide) {
            const host = ensureHost(slide);
            if (!host) return null;

            let inst = instances.get(host);
            if (!inst) {
              inst = new PinchZoomCtor(host, {
                maxZoom: 4,
                minZoom: 1,
                tapZoomFactor: 4,
                draggableUnzoomed: false,

                onZoomUpdate: (pz) => {
                  mainSlider.allowTouchMove = pz.zoomFactor <= 1.01;
                },
                onZoomEnd: (pz) => {
                  mainSlider.allowTouchMove = pz.zoomFactor <= 1.01;
                },
                onDragEnd: (pz) => {
                  mainSlider.allowTouchMove = pz.zoomFactor <= 1.01;
                },
              });

              inst.enable();
              instances.set(host, inst);
            }

            return inst;
          }

          function resetAll() {
            mainSlider.slides.forEach((slide) => {
              const host = slide.querySelector(".cre-t-160-pz-host");
              if (!host) return;

              const inst = instances.get(host);
              if (!inst) return;

              try {
                inst.stopAnimation?.();
                inst.zoomFactor = 1;
                inst.setupOffsets?.();
                inst.update?.();
              } catch (e) {}
            });

            mainSlider.allowTouchMove = true;
          }

          function onSlideChange() {
            resetAll();

            const activeSlide = mainSlider.slides[mainSlider.activeIndex];
            getInstance(activeSlide);

            requestAnimationFrame(() => {
              const active = mainSlider.slides[mainSlider.activeIndex];
              const host = active?.querySelector(".cre-t-160-pz-host");
              const inst = host ? instances.get(host) : null;
              inst?.update?.();
            });
          }

          mainSlider.on("init", onSlideChange);
          mainSlider.on("slideChangeTransitionStart", onSlideChange);
          mainSlider.on("resize", onSlideChange);

          if (mainSlider.initialized) onSlideChange();
        });
      }
      helper.waitForElement(
        `.${variation_name}-overlay-and-modal`,
        () => {
          waitForSwiper(() => {
            if (hasThumbnails) {
              const thumbnailSlider = new Swiper(`.${variation_name}-modal-thumbnails.swiper`, {
                slidesPerView: 3,
                spaceBetween: 10,
                watchSlidesProgress: true,
                centeredSlides: true,
                slideToClickedSlide: true,
                a11y: false,
              });

              const mainSlider = new Swiper(`.${variation_name}-modal-swiper.swiper`, {
                loop: true,
                slidesPerView: 1,
                spaceBetween: 20,
                navigation: {
                  nextEl: ".swiper-button-next",
                  prevEl: ".swiper-button-prev",
                },
                pagination: {
                  el: ".swiper-pagination-fraction",
                  type: "fraction",
                },
                thumbs: {
                  swiper: thumbnailSlider,
                },
                preloadImages: true,
                a11y: false,
              });

              enablePinchAndTapZoom(mainSlider);
            } else {
              new Swiper(`.${variation_name}-modal-swiper.swiper`, {
                loop: true,
                slidesPerView: 1,
                spaceBetween: 20,
                navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
                pagination: { el: ".swiper-pagination", type: "bullets", clickable: true },
                a11y: false,
              });
            }
          });
        },
        50,
        5000,
      );
    }

    /* === GRAPHQL FETCHERS === */
    function fetchRestaurantPhotos(slug, siteId) {
      const query = `
      query Restaurant($slug: String, $siteId: Int) {
        Restaurant(slug: $slug, siteId: $siteId) {
            images {
              nodes {
                url
              }
          }
        }
      }
    `;

      const variables = {
        slug: slug,
        siteId: siteId,
      };

      fetch("https://stellate.firsttable.net/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query,
          variables: variables,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          const restaurant = data.data ? data.data.Restaurant : data.Restaurant;

          if (restaurant && restaurant.images && restaurant.images.nodes.length > 0) {
            const menuImages = [];
            restaurant.images.nodes.forEach((image) => {
              const fullImageUrl = `https://images.firsttable.net/${image.url}`;
              menuImages.push({ url: fullImageUrl });
            });

            if (menuImages.length > 0) {
              // This is the fix to enable pagination for photos
              showMenuModal(menuImages, false);
            } else {
              helper.log("No menu images found");
            }
          } else {
            helper.log("No menu data found in response");
          }
        })
        .catch((error) => {
          console.error("Error fetching restaurant photos:", error);
        });
    }

    function fetchRestaurantMenu(slug, siteId) {
      const query = `
          query Restaurant($slug: String, $siteId: Int, $menuImagesWidth2: Int, $menuImagesHeight2: Int) {
            Restaurant(slug: $slug, siteId: $siteId) {
              menus {
                nodes {
                  menuImages(width: $menuImagesWidth2, height: $menuImagesHeight2) {
                    nodes {
                      url
                    }
                  }
                }
              }
            }
          }
        `;

      const variables = {
        slug: slug,
        siteId: siteId,
        menuImagesWidth2: 800,
        menuImagesHeight2: 600,
      };

      fetch("https://stellate.firsttable.net/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: query,
          variables: variables,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          const restaurant = data.data ? data.data.Restaurant : data.Restaurant;

          if (restaurant && restaurant.menus && restaurant.menus.nodes.length > 0) {
            const menuImages = [];
            restaurant.menus.nodes.forEach((menu) => {
              if (menu.menuImages && menu.menuImages.nodes) {
                menu.menuImages.nodes.forEach((image) => {
                  const fullImageUrl = `https://images.firsttable.net/${image.url}`;
                  menuImages.push({ url: fullImageUrl });
                });
              }
            });

            if (menuImages.length > 0) {
              showMenuModal(menuImages, true);
            } else {
              helper.log("No menu images found");
            }
          } else {
            helper.log("No menu data found in response");
          }
        })
        .catch((error) => {
          console.error("Error fetching restaurant menu:", error);
        });
    }

    /* === UI TEMPLATES === */
    // REVISED: This function now creates the combined wrapper for both items.
    function createActionsHTML() {
      return `
      <div class="cre-t-160-menu-and-photos">
      <div class="cre-t-160-photos-item">
      <div class="cre-t-160-photos-text">Photos</div>
        <div class="cre-t-160-menu-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path d="M1.11111 10C0.805556 10 0.543981 9.8912 0.326389 9.67361C0.108796 9.45602 0 9.19444 0 8.88889V1.11111C0 0.805556 0.108796 0.543981 0.326389 0.326389C0.543981 0.108796 0.805556 0 1.11111 0H8.88889C9.19444 0 9.45602 0.108796 9.67361 0.326389C9.8912 0.543981 10 0.805556 10 1.11111V8.88889C10 9.19444 9.8912 9.45602 9.67361 9.67361C9.45602 9.8912 9.19444 10 8.88889 10H1.11111ZM1.11111 8.88889H8.88889V1.11111H1.11111V8.88889ZM1.66667 7.77778H8.33333L6.25 5L4.58333 7.22222L3.33333 5.55556L1.66667 7.77778ZM3.64583 3.64583C3.80787 3.4838 3.88889 3.28704 3.88889 3.05556C3.88889 2.82407 3.80787 2.62731 3.64583 2.46528C3.4838 2.30324 3.28704 2.22222 3.05556 2.22222C2.82407 2.22222 2.62731 2.30324 2.46528 2.46528C2.30324 2.62731 2.22222 2.82407 2.22222 3.05556C2.22222 3.28704 2.30324 3.4838 2.46528 3.64583C2.62731 3.80787 2.82407 3.88889 3.05556 3.88889C3.28704 3.88889 3.4838 3.80787 3.64583 3.64583Z" fill="#717982"/>
      </svg>
        </div>

      </div>
      <div class="cre-t-160-menu-item">
      <div class="cre-t-160-menu-text">Menu</div>
        <div class="cre-t-160-menu-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="10" viewBox="0 0 14 10" fill="none">
        <path d="M3.43753 7.50008C3.92712 7.50008 4.40369 7.55476 4.86724 7.66414C5.33078 7.77352 5.79172 7.93758 6.25006 8.15633V2.00002C5.82298 1.75002 5.36985 1.56252 4.89067 1.43751C4.4115 1.31251 3.92712 1.25001 3.43753 1.25001C3.06253 1.25001 2.69013 1.28647 2.32034 1.35939C1.95054 1.43231 1.59377 1.54168 1.25001 1.68752V7.87508C1.6146 7.75008 1.97658 7.65633 2.33596 7.59383C2.69534 7.53133 3.06253 7.50008 3.43753 7.50008ZM7.50008 8.15633C7.95841 7.93758 8.41936 7.77352 8.8829 7.66414C9.34645 7.55476 9.82302 7.50008 10.3126 7.50008C10.6876 7.50008 11.0548 7.53133 11.4142 7.59383C11.7736 7.65633 12.1355 7.75008 12.5001 7.87508V1.68752C12.1564 1.54168 11.7996 1.43231 11.4298 1.35939C11.06 1.28647 10.6876 1.25001 10.3126 1.25001C9.82302 1.25001 9.33864 1.31251 8.85946 1.43751C8.38029 1.56252 7.92716 1.75002 7.50008 2.00002V8.15633ZM6.87507 10.0001C6.37506 9.60426 5.83339 9.29697 5.25005 9.07822C4.66671 8.85946 4.06254 8.75009 3.43753 8.75009C3.00003 8.75009 2.57034 8.80738 2.14846 8.92196C1.72658 9.03655 1.32293 9.19801 0.937509 9.40634C0.718757 9.52093 0.507818 9.51572 0.304691 9.39072C0.101564 9.26572 0 9.08342 0 8.84384V1.31251C0 1.19793 0.0286461 1.08855 0.0859384 0.984385C0.143231 0.880217 0.229169 0.802091 0.343753 0.750008C0.822925 0.500005 1.32293 0.312503 1.84377 0.187502C2.36461 0.0625006 2.89586 0 3.43753 0C4.04171 0 4.63286 0.0781258 5.21099 0.234377C5.78912 0.390629 6.34381 0.625006 6.87507 0.937509C7.40632 0.625006 7.96102 0.390629 8.53915 0.234377C9.11728 0.0781258 9.70843 0 10.3126 0C10.8543 0 11.3855 0.0625006 11.9064 0.187502C12.4272 0.312503 12.9272 0.500005 13.4064 0.750008C13.521 0.802091 13.6069 0.880217 13.6642 0.984385C13.7215 1.08855 13.7501 1.19793 13.7501 1.31251V8.84384C13.7501 9.08342 13.6486 9.26572 13.4454 9.39072C13.2423 9.51572 13.0314 9.52093 12.8126 9.40634C12.4272 9.19801 12.0236 9.03655 11.6017 8.92196C11.1798 8.80738 10.7501 8.75009 10.3126 8.75009C9.6876 8.75009 9.08342 8.85946 8.50008 9.07822C7.91675 9.29697 7.37507 9.60426 6.87507 10.0001Z" fill="#717982"/>
      </svg>
        </div>
        
      </div>
    </div>
    
      `;
    }
    function insertCSS(css) {
      var style = document.createElement("style");
      style.type = "text/css";
      style.innerHTML = css;
      document.getElementsByTagName("head")[0].appendChild(style);
    }

    // Your CSS as a string
    var cssContent = `
    
      html body.cre-t-160   .pinch-zoom-container {
    width: 100%;
}

html body.cre-t-160 .cre-t-160-pz {
    display: flex;
    align-items: center;
    justify-content: center;
}
 html body.cre-t-160    .cre-t-160-pz img {
  display: block;
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
}
  
.cre-t-160-menu-and-photos{
      display: none;
  }
  
  @media screen and (max-width: 600px) {
  
  html body.cre-t-160 [data-attribute="restaurant-list-location"] {
      display: flex;
      flex-direction: column;
      flex: none;
      gap: 5px;
    }
    
    html body.cre-t-160 a + [data-attribute="restaurant-list-location"]{
      justify-content: center;
    }
  
  
    html body.cre-t-160 [data-attribute="restaurant-list-location"] a{
      gap: 9px !important;
    }
  
  html body.cre-t-160 [data-attribute="restaurant-title-row"]+div {
  font-size: 14px !important;
  }
  
  html body.cre-t-160 [data-attribute="restaurant-title-row"]+div svg {
  width: 14px !important;
  height: 14px !important;
  margin-top: 0px !important;
  align-self: center;
  }
  
  .cre-t-160-menu-icon {
  cursor: pointer;
  }
  
  
  .cre-t-160-modal-section-container .swiper-pagination-fraction.swiper-pagination-horizontal {
  position: fixed;
  width: 100px;
  z-index: 99999999;
  top: 16px;
  left: 16px;
  height: 100px;
  }
  
  .cre-t-160-menu-main {
  display: flex;
  gap: 8px;
  align-items: center;
  }
  
  /* Modal section */
  
  html body.cre-t-160 .cre-t-160-overlay-and-modal {
  display: none;
  position: fixed;
  z-index: 99999998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  }
  
  html body.cre-t-160.cre-t-160-trigger .cre-t-160-overlay-and-modal {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  }
  
  html body.cre-t-160 .cre-t-160-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(86, 100, 110, 0.5);
  z-index: 99999998;
  }
  
  html body.cre-t-160 .cre-t-160-modal-section-container {
  /* max-width: 1140px;
        width: calc(100% - 30px); */
  position: relative;
  z-index: 99999999;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  }
  
  html body.cre-t-160 .cre-t-160-modal-wrapper {
  width: 100%;
  height: 100%;
  /* z-index: 99999998; */
  }
  
  html body.cre-t-160 .cre-t-160-modal-section {
  position: relative;
  width: 100%;
  height: 100%;
  background: #fff;
  /* max-width: 1140px; */
  display: flex;
  justify-content: center;
  align-items: flex-start;
  /* padding: 50px 80px; */
  overflow-y: auto;
  z-index: 99999998;
  }
  
  html body.cre-t-160 .cre-t-160-modal-main {
  width: 100%;
  height: 100%;
  aspect-ratio: 1.65;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  flex-direction: column;
  }
  
  html body.cre-t-160 .cre-t-160-modal-wrapper iframe {
  width: 100%;
  height: 100%;
  }
  
  html body.cre-t-160 .cre-t-160-modal-container {
  /* padding: 68px 79px 84px 78px; */
  position: relative;
  }
  
  html body.cre-t-160 .cre-t-160-modal-close {
  position: fixed;
  right: 18px;
  top: 18px;
  cursor: pointer;
  width: 27px;
  height: 27px;
  color: #808285;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 99999999 !important;
  }
  
  html body.cre-t-160 .cre-t-160-modal-close img {
  width: 100%;
  height: 100%;
  -o-object-fit: contain;
  object-fit: contain;
  }
  
  html body.cre-t-160 .cre-t-160-overlay-and-modal {
  display: none;
  }
  
  html body.cre-t-160 .cre-t-160-overlay-and-modal.is-visible {
  display: block;
  }
  
  .cre-t-160-overlay-and-modal {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
  }
  
  
  body.cre-t-160-trigger .cre-t-160-overlay-and-modal {
  display: flex;
  align-items: center;
  justify-content: center;
  }
  
  
  .cre-t-160-modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  }
  
  .cre-t-160-menu-icon {
  width: 14px;
  height: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  }
  html body.cre-t-160 .cre-t-123-review-container span,
  html body.cre-t-160 [data-attribute="restaurant-list-location"] a{
    font-size: 14.5px !important;
  }
  html body.cre-t-160 [data-attribute="restaurant-list-item"] > div > div > div.flex{
    gap: 5px !important;
  }
  
  html body.cre-t-160 [data-attribute="restaurant-title-row"]+div .cre-t-160-menu-icon svg {
  width: 100% !important;
  height: 100% !important;
  }
  
  /* Swiper Css */
  
  .swiper-slide img {
  display: block;
  width: 100%;
  height: auto;
  object-fit: contain;
  }
  
  .cre-t-160-thumbnails-wrapper .swiper-slide img {
  height: 100%;
  }
  
  .cre-t-160-modal-swiper.swiper {
  width: 100%;
  height: 100%;
  flex: 1;
  }
  
  .cre-t-160-modal-swiper .swiper-slide {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 100%;
  }
  
  .cre-t-160-modal-swiper .swiper-slide img {
  /* position: absolute;
    top: 0;
    left: 0; */
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  padding: 20px 0px;
  }
  
  
  .swiper-wrapper {
  display: flex;
  }
  
  .swiper-slide {
  display: block;
  width: 100%;
  height: auto;
  object-fit: contain;
  }
  
  .cre-t-160-modal-thumbnails .swiper-slide {
  width: 80px !important;
  height: 80px !important;
  opacity: 0.5;
  transition: opacity 0.3s ease;
  margin-right: 0px !important;
  }
  
  .cre-t-160-modal-thumbnails .swiper-slide-thumb-active {
  opacity: 1;
  }
  
  /* NEW CSS for the thumbnails wrapper */
  .cre-t-160-thumbnails-wrapper {
  display: flex;
  justify-content: center;
  width: 100%;
  margin: 10px 0px;
  background: rgba(39, 43, 46, 0.5);
  padding: 10px 0;
  }
  
  html body.cre-t-160 .cre-t-160-modal-thumbnails {
  /* max-width: 500px; */
  width: 70%;
  overflow: visible;
  margin: 0 !important;
  height: 100%;
  }
  
  html body.cre-t-160 .cre-t-160-modal-thumbnails .swiper-wrapper {
  display: flex;
  align-items: center;
  
  }
  
  html body.cre-t-160 .swiper-button-next,
  html body.cre-t-160 .swiper-button-prev {
  background-image: none !important;
  width: auto !important;
  height: auto !important;
  
  }
  
  
  html body.cre-t-160 .swiper-button-next svg,
  html body.cre-t-160 .swiper-button-prev svg {
  display: block;
  width: 54px !important;
  height: 54px !important;
  color: #265682;
  }
  
  html body.cre-t-160 .swiper-button-prev:after,
  html body.cre-t-160 .swiper-button-next:after {
  display: none !important;
  }
  
  
  html body.cre-t-160 [data-attribute="restaurant-title-row"]+div {
  font-size: 14px !important;
  }
  
  html body.cre-t-160 [data-attribute="restaurant-title-row"]+div svg {
  width: 14px !important;
  height: 14px !important;
  margin-top: 0px !important;
  align-self: center;
  }
  
  html body.cre-t-160 .cre-t-160-photos-text,
  html body.cre-t-160 .cre-t-160-menu-text {
  cursor: pointer;
  color: #272B2E;
  font-family: inherit;
  font-size: 10px;
  font-style: normal;
  font-weight: 600;
  line-height: var(--line-height-14, 14px);
  }
  
  .cre-t-160-menu-main {
  display: flex;
  gap: 3px;
  align-items: center;
  }


  
  html body.cre-t-160 [data-attribute="restaurant-title-row"]+div .cre-t-160-menu-icon svg {
  width: 100% !important;
  height: 100% !important;
  }
  
  /* Modal section */
  html body.cre-t-160 .cre-t-160-overlay-and-modal {
  display: none;
  position: fixed;
  z-index: 99999998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  }
  
  html body.cre-t-160.cre-t-160-trigger .cre-t-160-overlay-and-modal {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  }
  
  html body.cre-t-160 .cre-t-160-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.85);
  z-index: 99999998;
  }
  
  html body.cre-t-160 .cre-t-160-modal-section-container {
  position: relative;
  z-index: 99999999;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  }
  
  html body.cre-t-160 .cre-t-160-modal-wrapper {
  width: 100%;
  height: 100%;
  }
  
  html body.cre-t-160 .cre-t-160-modal-section {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  overflow-y: auto;
  z-index: 99999998;
  }
  
  html body.cre-t-160 .cre-t-160-modal-main {
  width: 100%;
  height: 100%;
  aspect-ratio: 1.65;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  }
  
  
  html body.cre-t-160 .cre-t-160-modal-close img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  }
  
  .swiper-slide img {
  display: block;
  width: 100%;
  height: auto;
  object-fit: contain;
  }
  
  html body.cre-t-160 .cre-t-160-overlay-and-modal {
  display: none;
  }
  
  html body.cre-t-160 .cre-t-160-overlay-and-modal.is-visible {
  display: block;
  }
  
  .cre-t-160-overlay-and-modal {
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
  }
  
  body.cre-t-160-trigger .cre-t-160-overlay-and-modal {
  display: flex;
  align-items: center;
  justify-content: center;
  }
  
  .cre-t-160-modal-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  }
  
  .cre-t-160-modal-swiper.swiper {
  width: 100%;
  height: 100%;
  flex: 1;
  }
  
  .cre-t-160-modal-swiper .swiper-slide {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  height: 100%;
  }
  
  .cre-t-160-modal-swiper .swiper-slide img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  padding: 20px 5px;
  }
  
  /* Removed thumbnail styles */
  /* .cre-t-160-modal-thumbnails .swiper-slide, etc. */
  
  .swiper-wrapper {
  display: flex;
  }
  
  .swiper-slide {
  display: block;
  width: 100%;
  height: auto;
  object-fit: contain;
  }
  
  /* Custom button styles to override Swiper defaults */
  .swiper-button-next,
  .swiper-button-prev {
  background-image: none !important;
  /* This is the key change */
  width: auto !important;
  /* Allow width to be determined by SVG */
  height: auto !important;
  /* Allow height to be determined by SVG */
  /* Re-position the buttons */
  top: 50%;
  transform: translateY(-50%);
  margin: 0 10px;
  }
  
  .swiper-button-next {
  right: 0;
  }
  
  .swiper-button-prev {
  left: 0;
  }
  
  html body.cre-t-160 .swiper-button-next,
  html body.cre-t-160 .swiper-button-prev {
  background-image: none !important;
  width: auto !important;
  height: auto !important;
  
  }
  
  
  html body.cre-t-160 .swiper-button-next svg,
  html body.cre-t-160 .swiper-button-prev svg {
  display: block;
  width: 54px !important;
  height: 54px !important;
  color: #d7dbde;
  }
  
  /* Hide Swiper's default pseudo-elements */
  .swiper-button-prev:after,
  .swiper-button-next:after {
  display: none !important;
  }
  
  
  /* Custom pagination styles */
  .swiper-pagination {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 999999;
  }
  
  /* Style for all dots (inactive) */
  .swiper-pagination-bullet {
  width: 8px;
  /* Set the size of the dot */
  height: 8px;
  /* Set the size of the dot */
  background: rgba(255, 255, 255, 0.4);
  /* Semi-transparent white for inactive dots */
  opacity: 1;
  /* Override default opacity if needed */
  margin: 0 4px;
  /* Add spacing between dots */
  transition: background-color 0.3s ease;
  }
  
  /* Style for the active dot */
  .swiper-pagination-bullet-active {
  background: #ffffff;
  /* Solid white for the active dot */
  }
  
  /* Hide Swiper's default fraction pagination */
  .swiper-pagination-fraction {
  display: none !important;
  }
  
  
  /* Your existing button and modal CSS can remain as is. */
  .swiper-button-next,
  .swiper-button-prev {
  background-image: none !important;
  width: auto !important;
  height: auto !important;
  top: 50%;
  transform: translateY(-50%);
  margin: 0 10px;
  }
  
  .swiper-button-next {
  right: 0;
  }
  
  .swiper-button-prev {
  left: 0;
  }
  
  .swiper-button-next svg,
  .swiper-button-prev svg {
  display: block;
  width: 40px;
  height: 40px;
  color: #fff;
  }
  
  .swiper-button-prev:after,
  .swiper-button-next:after {
  display: none !important;
  }
  
  html body.cre-t-160 .swiper-pagination-bullet {
  background: rgba(255, 255, 255, 0.4) !important;
  }
  
  html body.cre-t-160 .swiper-pagination-bullet-active {
  background: #fff !important;
  }
  
  .cre-t-160-img-wrapper {
  width: 800px;
  height: auto;
  padding: 10px;
  }
  
  html body.cre-t-160.cre-t-160-trigger {
  overflow: hidden;
  }
  
  
  
  html body.cre-t-160 .cre-t-160-modal-swiper .swiper-pagination {
  display: flex;
  justify-content: center;
  left: 50% !important;
  bottom: 15px !important;
  }
  
  html body.cre-t-160.cre-t-160-trigger-photos .cre-t-160-modal-section {
  background: none;
  }
  
  html body.cre-t-160 .cre-t-160-menu-and-photos {
  display: flex !important;
  gap: 10px;
  }
  

  .cre-t-160-photos-item, .cre-t-160-menu-item {
    display: inline-flex;
    padding: 8px 17px;
    justify-content: center;
    align-items: center;
    gap: 3px;
    border-radius: 8px;
    background: #F2F4F4;
  }
  
  html body.cre-t-160 .cre-t-160-close-icon{
  width: 100%;
  height: 100%;
  display: flex;
  }
  html body.cre-t-160 .cre-t-160-close-icon svg{
  width: 100%;
  height: 100%;
  }
  
  
  
  }
  /* This is the most important rule for pinch-zoom to work */
.cre-t-160-modal-swiper .swiper-slide img {
  touch-action: none; 
  transform-origin: center center; 
  transition: transform 0.15s ease; 
  display: block;
  object-fit: contain;
  
  max-width: 100%;
  max-height: 100%;
  width: auto;
  height: auto;
  padding: 20px 0px;
}
  
    `

    function init() {
      console.log("variation160")
      _$("body").addClass(variation_name);
      addScript();
      if (!window.observer160Li) {
        eventListenerButton();
        observeSelector(`[data-attribute="restaurant-list-item"] button`, (listItem) => {
          if (window.location.pathname.includes("/auckland") || window.location.pathname.includes("/queenstown-lakes")) {
            document.body.classList.remove(variation_name);
            return;
          }

          helper.waitForElement(
            '[data-attribute="restaurant-list-location"]',
            function () {
              updateAndCopyText();
              addTags();
              // Need to force a reflow
              const interval = setInterval(() => {
                hrTextSeparate();
                buttonFunctionMoreTime();
                buttonFunctionMoreThanThree();
              }, 100);
              setTimeout(() => {
                clearInterval(interval);
              }, 2000);
            },
            100,
            8000,
          );
        });

        observeSelector(`ol li[data-attribute="restaurant-list-item"]`, (item) => {
          const loc = item.querySelector('[data-attribute="restaurant-list-location"]');
          if (!loc) return;

          // REVISED: Check for the new wrapper and insert the combined HTML.
          if (!item.querySelector(".cre-t-160-menu-and-photos")) {
            loc.insertAdjacentHTML("afterend", createActionsHTML());
          }

          // updateAndCopyText();
          insertCSS(cssContent);
        });

        live(".cre-t-160-menu-item", "click", function (e) {
          e.preventDefault();
          const link = this.closest('[data-attribute="restaurant-list-item"]').querySelector('[data-attribute="restaurant-title-row"] h3 a').href;
          const slug = new URL(link).pathname.split("/").pop();
          fetchRestaurantMenu(slug, getOriginId());

          window.cre171ScrollPosition = 0;
          window.cre171ScrollPosition = window.pageYOffset;

          document.body.style.position = "fixed";
          document.body.style.top = `-${window.cre171ScrollPosition}px`;
          document.body.style.left = "0";
          document.body.style.right = "0";
          document.body.style.overflowY = "scroll";
        });

        live(".cre-t-160-photos-item", "click", function (e) {
          e.preventDefault();
          document.body.classList.add("cre-t-160-trigger-photos");
          const link = this.closest('[data-attribute="restaurant-list-item"]').querySelector('[data-attribute="restaurant-title-row"] h3 a').href;
          const slug = new URL(link).pathname.split("/").pop();
          fetchRestaurantPhotos(slug, getOriginId());

          window.cre171ScrollPosition = 0;
          window.cre171ScrollPosition = window.pageYOffset;

          document.body.style.position = "fixed";
          document.body.style.top = `-${window.cre171ScrollPosition}px`;
          document.body.style.left = "0";
          document.body.style.right = "0";
          document.body.style.overflowY = "scroll";
        });

        window.observer160Li = true;
      }
    }
    helper.waitForElement("body", init, 50, 5000);
  } catch (e) {
    if (debug) console.log(e, "error in Test" + variation_name);
  }
})();