(function () {
  try {
    /* main variables */
    var debug = 1;
    var variation_name = "cre-t-166";

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

    function insertAfter(selector, html) {
      var element = typeof selector === "string" ? document.querySelector(selector) : selector;
      if (!element) return;
      if (typeof html === "string") {
        element.insertAdjacentHTML("afterend", html);
      } else if (html && html.nodeType === 1) {
        element.insertAdjacentElement("afterend", html);
      }
    }

 
    function insertBefore(selector, html) {
      var element = typeof selector === "string" ? document.querySelector(selector) : selector;
      if (!element) return;
      if (typeof html === "string") {
        element.insertAdjacentHTML("beforeend", html);
      } else if (html && html.nodeType === 1) {
        element.insertAdjacentElement("beforeend", html);
      }
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

    function eventHandler() {
      console.log("eventHandler");
      // SWF166 - Outbound clicks on Lemonade
      // [data-unique="comparison-table"] > [data-unique="outbound-partner-clicks-Lemonade-Listing-Only"] [data-unique="outbound-partner-see-plans-button"]
      live('[data-unique="comparison-table"] > [data-unique="outbound-partner-clicks-Lemonade-Listing-Only"] > .plan-box, [data-unique="comparison-table"] > [data-unique="outbound-partner-clicks-Lemonade-Listing-Only"] .rating-bar, [data-unique="best-overall"] > [data-unique="outbound-partner-clicks-Lemonade-Listing-Only"] > .plan-box', "mousedown", function () {
        console.log("SWF166 - Outbound clicks on Lemonade");
        window._conv_q = window._conv_q || [];  
        _conv_q.push(["triggerConversion", "100038330"]);
      });

      // SWF166 - Outbound clicks on Liberty Mutual
      // [data-unique="comparison-table"] > [data-unique="outbound-partner-clicks-Liberty-Mutual-Listing-Only"] [data-unique="outbound-partner-see-plans-button"]
      live('[data-unique="comparison-table"] > [data-unique="outbound-partner-clicks-Liberty-Mutual-Listing-Only"] > .plan-box, [data-unique="comparison-table"] > [data-unique="outbound-partner-clicks-Liberty-Mutual-Listing-Only"] .rating-bar, [data-unique="best-overall"] > [data-unique="outbound-partner-clicks-Liberty-Mutual-Listing-Only"] > .plan-box','.button.Liberty_Mutual.rt-aff-link', "mousedown", function () {
        console.log("SWF166 - Outbound clicks on Liberty Mutual");
        window._conv_q = window._conv_q || [];  
        _conv_q.push(["triggerConversion", "100038331"]);
      });

    }

     function bestOverall() {
      setTimeout(function () {
        var mainElement = document.querySelector('[data-unique="comparison-table"] > [data-unique="outbound-partner-clicks-Liberty-Mutual-Listing-Only"]');
        var bestOverallElement = document.querySelector('[data-unique="best-overall"] > [data-unique="outbound-partner-clicks-Lemonade-Listing-Only"]');

        // Extract data from mainElement
        var mainElementLink = mainElement?.getAttribute("data-unique");
        var outBoundLink = mainElement.querySelector(".rt-aff-link.provider-link")?.getAttribute("href");
        var outBoundLink2 = mainElement.querySelector(".rt-aff-link.provider-link")?.getAttribute("data-unique");
        var outBoundCTALink = mainElement.querySelector(".plan-button-container .ct-link-button")?.getAttribute("href");
        var outBoundCTALink2 = mainElement.querySelector(".plan-button-container .ct-link-button")?.getAttribute("data-unique");
        var imageSrc = mainElement.querySelector(".rt-aff-link img")?.getAttribute("src");
        var imgSrcSet = mainElement.querySelector(".rt-aff-link img")?.getAttribute("srcset");
        var imgAlt = mainElement.querySelector(".rt-aff-link img")?.getAttribute("alt");
        var trustpilotSrc = mainElement.querySelector(".trustpilot-image")?.getAttribute("src");
        var productDescription = mainElement.querySelector(".plan-description-container ul")?.outerHTML;

        var newTest77Trustpilot = mainElement.querySelector('[crodatalabel="outbound-partner-clicks-Liberty-Mutual-Listing-Only"]')?.outerHTML;

        // Apply data to bestOverallElement (if it exists)
        if (bestOverallElement) {
          // Update the data-unique attribute
          bestOverallElement.setAttribute("data-unique", mainElementLink);

          // Update the outbound link
          var bestOutboundLink = bestOverallElement.querySelector(".rt-aff-link.provider-link");
          if (bestOutboundLink) {
            bestOutboundLink.setAttribute("href", outBoundLink);
            bestOutboundLink.setAttribute("data-unique", outBoundLink2);
          }

          // Update the CTA link
          var bestOutboundCTALink = bestOverallElement.querySelector(".plan-button-container .ct-link-button");
          if (bestOutboundCTALink) {
            bestOutboundCTALink.setAttribute("href", outBoundCTALink);
            bestOutboundCTALink.setAttribute("data-unique", outBoundCTALink2);
          }

          // Update the image source, srcset, and alt attributes
          var bestImage = bestOverallElement.querySelector(".rt-aff-link img");
          if (bestImage) {
            bestImage.setAttribute("src", imageSrc);
            bestImage.setAttribute("srcset", imgSrcSet);
            bestImage.setAttribute("alt", imgAlt);
          }

          // Update the trustpilot image source
          var bestTrustpilotImage = bestOverallElement.querySelector(".trustpilot-image");
          if (bestTrustpilotImage) {
            bestTrustpilotImage.setAttribute("src", trustpilotSrc);
          }

          // Apply the product description to bestOverallElement (if it exists)
          if (productDescription) {
            var bestProductDescriptionContainer = bestOverallElement.querySelector(".plan-description-container ul");
            if (bestProductDescriptionContainer) {
              bestProductDescriptionContainer.outerHTML = productDescription; // Replace the HTML of the bestOverallElement's plan description container
            }
          }

          // Apply the newTest77Trustpilot to bestOverallElement (if it exists)
          if (newTest77Trustpilot) {
            var bestNewTest77Trustpilot = bestOverallElement.querySelector("[crodatalabel]");
            if (bestNewTest77Trustpilot) {
              bestNewTest77Trustpilot.outerHTML = newTest77Trustpilot;
            }
          }
        }

        // Extract data from mainElement and populate planData and add the data to bestOverallElement
        var planData = {
          avg_cost_plan: null,
          property: null,
          liability: null,
          avg_cost_plan_control: null,
          show_control: false,
        };

        // Main Element Data Extraction and Population
        var planDetails = mainElement.querySelectorAll(".plan-detail-column");
        if (planDetails) {
          planDetails.forEach((detail) => {
            var heading = detail.querySelector(".plan-detail-heading")?.textContent.trim().toLowerCase() || "";
            var content = detail.querySelector(".plan-detail-content")?.textContent.trim() || "";

            if (heading.includes("property")) {
              planData.property = content;
            } else if (heading.includes("liability")) {
              planData.liability = content;
            } else if (heading.includes("average")) {
              if (detail.querySelector(".plan-detail-content .ct-span")) {
                planData.avg_cost_plan = detail.querySelector(".plan-detail-content .ct-span")?.textContent.trim();
              } else {
                planData.avg_cost_plan = detail.querySelector(".plan-detail-content span")?.textContent.trim();
              }
            }
          });
        }

        // Best Item Element Population (Only updates existing elements)
        var bestPlanDetails = bestOverallElement.querySelectorAll(".plan-detail-column");
        if (bestPlanDetails) {
          bestPlanDetails.forEach((detail) => {
            var heading = detail.querySelector(".plan-detail-heading")?.textContent.trim().toLowerCase() || "";
            var content = detail.querySelector(".plan-detail-content");

            if (heading.includes("property")) {
              content.textContent = planData.property || "";
            } else if (heading.includes("liability")) {
              content.textContent = planData.liability || "";
            } else if (heading.includes("average")) {
              var spanElement = content.querySelector(".plan-detail-content .ct-span");
              if (spanElement) {
                spanElement.textContent = planData.avg_cost_plan || "";
              }
            }
          });
        }
      }, 700);
    }

    function trustpilotContent() {
      var lemonadeImage = "https://rentersinsurancegurus.com/wp-content/uploads/2025/04/4.90-trustscore-800x368.png";
      var libertyImage = "https://rentersinsurancegurus.com/wp-content/uploads/2025/04/4.7-trustscore-800x368.png";

      // Check if the elements exist before changing their src attributes
      var trustpilotImgLiberty = document.querySelector('[data-unique="comparison-table"] > [data-unique="outbound-partner-clicks-Liberty-Mutual-Listing-Only"] .trustpilot-image');
      var trustpilotImgLemonade = document.querySelector('[data-unique="comparison-table"] > [data-unique="outbound-partner-clicks-Lemonade-Listing-Only"] .trustpilot-image');

      if (trustpilotImgLemonade && trustpilotImgLiberty) {
        trustpilotImgLemonade.src = libertyImage;
        trustpilotImgLiberty.src = lemonadeImage;
      }

      waitForElement(
        '[data-unique="comparison-table"] .cre-t-77-container[crodatalabel="outbound-partner-clicks-Liberty-Mutual-Listing-Only"]',
        function () {
          // Check if the new trustpilot containers exist before inserting
          var newTrustPilotLiberty = document.querySelector('[data-unique="comparison-table"] .cre-t-77-container[crodatalabel="outbound-partner-clicks-Liberty-Mutual-Listing-Only"]');
          var newTrustPilotLemonade = document.querySelector('[data-unique="comparison-table"] .cre-t-77-container[crodatalabel="outbound-partner-clicks-Lemonade-Listing-Only"]');

          if (newTrustPilotLiberty && newTrustPilotLemonade) {
            var trustPilotLemonadeParent = document.querySelector('[data-unique="comparison-table"] > [data-unique="outbound-partner-clicks-Lemonade-Listing-Only"] .cre-t-77-container-parent');
            var trustPilotLibertyParent = document.querySelector('[data-unique="comparison-table"] > [data-unique="outbound-partner-clicks-Liberty-Mutual-Listing-Only"] .cre-t-77-container-parent');

            if (trustPilotLemonadeParent && trustPilotLibertyParent) {
              trustPilotLemonadeParent.insertAdjacentElement("beforeend", newTrustPilotLiberty);
              trustPilotLibertyParent.insertAdjacentElement("beforeend", newTrustPilotLemonade);
            }
          }
        },
        50,
        5000,
      );
    }

    var modalImageHTML= `<div class="cre-t-166-image-wrapper">
    <img src="https://rentersinsurancegurus.com/wp-content/uploads/2025/03/liberty-mutual-logo.png" class="cre-t-166-image" alt="Liberty Mutual">
    </div>`

    var modalButtonHTML =`<div class="cre-t-166-button-container button-container"><a class="button Liberty_Mutual rt-aff-link" href="https://go.rentersinsurancegurus.com/9W598/41NTW2/?sub1=Guru">Visit Liberty Mutual</a></div>`

    function modalUpdate(){
      waitForElement('html .oxy-modal-backdrop', function(){
        var modalImage= document.querySelector('html .oxy-modal-backdrop  img');
        var alreadyExistImage=  document.querySelector('.cre-t-166-image-wrapper')
        if(!alreadyExistImage){
          insertAfter(modalImage, modalImageHTML)
        }
      },25,25000)


      //  var modalButton = document.querySelector('html .oxy-modal-backdrop .button.lemonade.rt-aff-link');
      //   var libertyMutualLink = document.querySelector('[data-unique="outbound-partner-clicks-Liberty-Mutual-Listing-Only"] a.provider-link');
      //   if (modalButton && libertyMutualLink) {
      //     modalButton.setAttribute('href', libertyMutualLink.getAttribute('href'));
      //     modalButton.textContent = modalButton.textContent.replace('Visit Lemonade', 'Visit Liberty Mutual');
      //   }

       waitForElement('html .oxy-modal-backdrop h2+p.large strong', function(){
        var modalStrong = document.querySelector('html .oxy-modal-backdrop h2+p.large strong');
          var alreadyExistStrongText= document.querySelector('cre-t-166-strong-text')
              
          if (!alreadyExistStrongText) {
              insertAfter(modalStrong, `<strong class="cre-t-166-strong-text">Liberty Mutual is an excellent option</strong>`)
              }
        })

        waitForElement('html .oxy-modal-backdrop p.button-container', function(){
          var buttonContainer= document.querySelector('html .oxy-modal-backdrop p.button-container')
          var alreadyExistButtonContainer= document.querySelector('.cre-t-166-button-container')
          if(!alreadyExistButtonContainer){
            insertAfter(buttonContainer, modalButtonHTML)
          }
        })

    }

var ratingBarHTml=`<div id="cre-t-166-div_block-218-63-1-1" class="cre-t-166-ct-div-block rating-bar cre-t-166-rating-bar" data-id="cre-t-166-div_block-218-63">
  <img id="cre-t-166-image-223-63-1-1" alt="" src="https://rentersinsurancegurus.com/wp-content/uploads/2025/01/5-stars.png" class="cre-t-166-ct-image rating-stars" data-id="cre-t-166-image-223-63">
  <div id="cre-t-166-text_block-249-63-1-1" class="cre-t-166-ct-text-block rating-text" data-id="cre-t-166-text_block-249-63">
    <span id="cre-t-166-span-253-63-1-1" class="cre-t-166-ct-span" data-id="cre-t-166-span-253-63">
      <p><strong>499,000</strong> people ranked Liberty Mutual as <strong>4.8</strong> on</p>
    </span>
  </div>
  <img id="cre-t-166-image-251-63-1-1" alt="" src="https://rentersinsurancegurus.com/wp-content/uploads/2025/01/apple-app-store.svg" class="cre-t-166-ct-image rating-logo" data-id="cre-t-166-image-251-63">
</div>`

//     var ratingBarHTml=`<div class="rating-bar cre-t-166-rating-bar"><img alt="fiveStar" src="https://rentersinsurancegurus.com/wp-content/uploads/2025/01/5-stars.png" class="rating-stars"><div class="rating-text"><span><p><strong>499,000</strong> people ranked Libery Mutual as <strong>4.8</strong> on</p>
// </span></div><img alt="ratingStar" src="https://rentersinsurancegurus.com/wp-content/uploads/2025/01/apple-app-store.svg" class="rating-logo"></div>`


    function updateListingRatingBar(){
      waitForElement('[data-unique="comparison-table"] [data-unique="outbound-partner-clicks-Liberty-Mutual-Listing-Only"] .plan-box+.oxy-dynamic-list', function(){
        var listCard= document.querySelector('[data-unique="comparison-table"] [data-unique="outbound-partner-clicks-Liberty-Mutual-Listing-Only"] .plan-box+.oxy-dynamic-list')
        var alreadyRatingHtml= document.querySelector('.cre-t-166-rating-bar');
        if(!alreadyRatingHtml){
          insertBefore(listCard, ratingBarHTml)
        }
        
      })

    }

    /* Variation functions */

    /* Variation Init */
    function init() {

      if (document.body.classList.contains("cre-t-166")) return;
      document.body.classList.add("cre-t-166");

      if (!window.cre166FEventHandler) {
        eventHandler();
        window.cre166FEventHandler = true;
      }

      waitForElement('[data-unique="best-overall"] > [data-unique="outbound-partner-clicks-Lemonade-Listing-Only"]', bestOverall, 50, 25000);
      waitForElement('[data-unique="comparison-table"] > [data-unique="outbound-partner-clicks-Liberty-Mutual-Listing-Only"] .trustpilot-image', trustpilotContent(), 50, 25000);
      /* start your code here */
      // Your logic here
      if (debug) console.log(variation_name + " initialized");

       modalUpdate()
       updateListingRatingBar();
    }

    /* Initialise variation */
    waitForElement("body", init, 50, 15000);
  } catch (e) {
    if (debug) console.log(e, "error in Test " + variation_name);
  }
})();