(function () {
  try {
    var debug = 1;
    var variation_name = "cre-t-19";

    var config = {
      stepSelector: '[data-telehealth="step_3_Symptoms"]',
      iframeSelector: "#mobile-viewport",
      targetSelector: ".MuiInputBase-formControl.MuiInputBase-fullWidth",
      targetSelectorForPlaceholder: '[name="conditionDescription"]',
      addRecommendation: '.MuiFormControlLabel-labelPlacementEnd [value="Video"]',
      symptomsAdded: ".MuiStack-root p",
      intervalDelay: 400,
      timeout: 30000,
      styleId: "cre-t-19-style",
      clickGoalButtonPhoneCall: ".cre-t-19-recommendation-section .cre-t-19-recommendation + label > span",
    };

    var headHTML = `
      <div class="cre-t-19-container">
        <div class="cre-t-19-wrapper">
          <h3 class="cre-t-19-text cre-t-19-text-1"><strong>Tell us about your symptoms</strong></h3>
          <p class="cre-t-19-text cre-t-19-text-2">Describe your symptoms so your doctor can prepare.</p>
        </div>
      </div>
    `;

    var bottomHtml = `<div class="cre-t-19-bottom-container">
        <div class="cre-t-19-bottom-wrapper">
          <h3 class="cre-t-19-text cre-t-19-bottom-text-1"><strong>How would you like to speak to your doctor?</strong></h3>
          <p class="cre-t-19-text cre-t-19-bottom-text-2">We’ll aim for your preference. Keep your phone nearby—your doctor will text or call when ready.</p>
        </div>
      </div>`;

    var styleCSS = `
[name="conditionDescription"]{
height: 84px !important;
}

    h3.cre-t-19-text{
    padding-bottom: 11px;
    }
    .cre-t-19-bottom-text-2{
      padding-bottom: 16px;
    }
      .cre-t-19-wrapper p {
        padding-bottom: 15px;
        margin: 0;
      }
        .cre-t-19-recommendation-section > p,
        p.cre-t-19-recommendation-symptoms,
        p.cre-t-19-recommendation-symptoms + p,
        p.cre-t-19-recommendation-symptoms + p + div > div label,
        [aria-label="breadcrumb"] + div > div:nth-child(2){
        display: none;
        }

        [aria-label="breadcrumb"] + div .cre-t-19-recommendation-section{
        display: block !important;
        }

      .cre-t-19-container,
      button.MuiButton-colorPrimary {
          margin-top: 6px;
      }      
          @media screen and (max-width:767px) {
          .cre-t-19-wrapper {
              padding: 0 10px;
          }
      }
    `;

    function waitForElement(selector, callback, interval, timeout) {
      interval = interval || 50;
      timeout = timeout || 15000;

      var start = Date.now();

      var timer = setInterval(function () {
        var el = document.querySelector(selector);

        if (el) {
          clearInterval(timer);
          callback(el);
          return;
        }

        if (Date.now() - start > timeout) {
          clearInterval(timer);
        }
      }, interval);
    }

    function getIframe() {
      var step = document.querySelector(config.stepSelector);
      var iframe = null;

      if (step) {
        iframe = step.querySelector(config.iframeSelector);
      }

      if (!iframe) {
        iframe = document.querySelector(config.iframeSelector);
      }
      console.log(iframe);

      return iframe;
    }

    function getIframeDoc(iframe) {
      try {
        if (!iframe) {
          return null;
        }

        var doc = iframe.contentDocument || (iframe.contentWindow && iframe.contentWindow.document) || null;

        if (!doc) {
          return null;
        }
        return doc;
      } catch (e) {
        return null;
      }
    }

    function injectStyles(doc) {
      if (!doc || !document.querySelector(config.stepSelector)) {
        return;
      }

      // Proceed with injecting styles if the stepSelector is found
      var head = doc.head || doc.getElementsByTagName("head")[0];

      if (!head) {
        return;
      }

      var existingStyle = doc.getElementById(config.styleId);
      if (existingStyle) {
        return;
      }

      var style = doc.createElement("style");
      style.id = config.styleId;
      style.type = "text/css";
      style.textContent = styleCSS;

      head.appendChild(style);
    }

    function insertHeadMessage(doc) {
      if (!doc) return;

      var target = doc.querySelector(config.targetSelector);

      if (!target) {
        return;
      }

      if (doc.querySelector(".cre-t-19-container")) {
        return;
      }

      target.insertAdjacentHTML("beforebegin", headHTML);
    }

    function changePlaceholder(doc) {
      if (!doc) {
        return;
      }

      var textButton = doc.querySelector(config.targetSelectorForPlaceholder);
      if (textButton) {
        textButton.placeholder = "e.g. Sore throat and fever for 3 days, getting worse, moderate pain, tried paracetamol";
      }
    }

    function addRecommendationAndAddClass(doc) {
      if (!doc) {
        return;
      }

      // Check if the specific text content exists for added new content
      var addClassForParticularRecommendation = doc.querySelector("nav + div p strong").textContent.includes("Available Telehealth Options:");

      if (addClassForParticularRecommendation) {
        var targetElementForAddCLass = doc.querySelector("nav + div p strong").closest("div");

        if (targetElementForAddCLass) {
          targetElementForAddCLass.classList.add("cre-t-19-recommendation-section");
        }

        // Check if the bottom container exists, and if not, insert the bottomHtml
        if (!doc.querySelector(".cre-t-19-bottom-container")) {
          targetElementForAddCLass.insertAdjacentHTML("afterbegin", bottomHtml);
        }
      }

      // Handle the recommendation part changes (video call text)
      var recommendation = doc.querySelector(config.addRecommendation);

      if (recommendation) {
        var label = recommendation.closest("label");

        // Add the class to the label
        label.classList.add("cre-t-19-recommendation");

        // Update the text content
        var labelText = label.querySelector(".MuiFormControlLabel-label");

        if (labelText) {
          labelText.textContent = "Video call (recommended)";
        }
      }

      // Handle the recommendation part changes (symptoms text)
      doc.querySelectorAll(".MuiStack-root p").forEach((element) => {
        console.log(element);

        if (element.textContent.trim() === "Please describe your symptoms, including:") {
          element.classList.add("cre-t-19-recommendation-symptoms");
        }
      });
    }

    function clickAndGoal(iframe) {
      var doc = getIframeDoc(iframe);
      if (!doc) return;

      // Goal for the phone call
      var phoneCallLabel = doc.querySelector(config.clickGoalButtonPhoneCall);

      if (phoneCallLabel) {
        phoneCallLabel.addEventListener("click", function (e) {
          if (e.detail === 0) return;

          window._conv_q = window._conv_q || [];
          window._conv_q.push(["triggerConversion", "100037718"]);
        });
      }

      // goal for the symptoms part changes
      var symptomsGoal = doc.querySelector(config.targetSelectorForPlaceholder);
      if (symptomsGoal) {
        symptomsGoal.addEventListener("click", function () {
          window._conv_q = window._conv_q || [];
          _conv_q.push(["triggerConversion", "100037719"]);
        });
      }
    }

    function init() {
      if (document.querySelector('[data-telehealth="step_3_Symptoms"]').classList.contains(variation_name)) {
        return;
      }

      document.querySelector('[data-telehealth="step_3_Symptoms"]').classList.add(variation_name);

      const checkInterval = setInterval(function () {
        var iframe = getIframe();
        var doc = getIframeDoc(iframe);

        if (!doc) {
          return;
        }

        injectStyles(doc);
        insertHeadMessage(doc);
        changePlaceholder(doc);
        addRecommendationAndAddClass(doc);
        if (!window.creT19Goal) {
          clickAndGoal(iframe);
          window.creT19Goal = true;
        }

        clearInterval(checkInterval);
      }, 50);
      setTimeout(function () {
        clearInterval(checkInterval);
      }, 15000);
    }

    // init();

    waitForElement('[data-telehealth="step_3_Symptoms"]', init, 50, 15000);
  } catch (e) {
    console.log(e, "error in Test");
  }
})();