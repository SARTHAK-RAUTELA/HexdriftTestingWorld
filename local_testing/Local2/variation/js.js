// Request cancellation goal on waiting room page For test 24
if (window.location.href.includes('/waiting-room')) {
  (function () {
    try {
      var debug = 0;
      var variation_name = "test-24-cancellation-goal";

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

      function waitForElementInDoc(doc, selector, callback, delayInterval = 50, delayTimeout = 15000) {
        var interval = setInterval(function () {
          var el = doc.querySelector(selector);
          if (el) {
            clearInterval(interval);
            callback(el);
          }
        }, delayInterval);

        setTimeout(function () {
          clearInterval(interval);
        }, delayTimeout);
      }

      function triggerGoal(conversionId) {
        if (conversionId) {
          window._conv_q = window._conv_q || [];
          window._conv_q.push(["triggerConversion", conversionId]);
        }
      }

      function addGoalOnCancellation() {

        let body = document.querySelector('body');
        if (body.getAttribute('data-telehealth') === "step_8_Waiting_Room") {
          console.log('step_8_Waiting_Room detected --------- test24 cancellation goal')
          waitForElement('iframe#mobile-viewport', function () {
            let iframe = document.querySelector('iframe#mobile-viewport')
            let iframeDoc = iframe?.contentDocument || iframe?.contentWindow?.document;
            if (!iframeDoc) return;
            console.log('iframe is available --------- test24 cancellation goal')
            waitForElementInDoc(iframeDoc, '[data-testid="consult-requested__cancel-button"]', (el) => {
              console.log('cancel button available on the DOM ---- test24 cancellation goal')
              el.addEventListener('mousedown', function () {
                //console.log('click on the cancel button detected --- test 24 cancellation goal')
                triggerGoal('100037737');
              });
            });
            //Variation SIC24 - Clicks on the “Cancel Request / Leave Queue” Button
            waitForElementInDoc(iframeDoc, '#cqm-leave', (el) => {
              console.log('cancel variation button ---- test24 cancellation goal')
              el.addEventListener('mousedown', function () {
                //console.log('click on the cancel button detected --- test 24 cancellation goal')
                triggerGoal('100037746');
              });
            });
            // Control SIC24 - Clicks on the “Cancel Request / Leave Queue” Button
            waitForElementInDoc(iframeDoc, '[data-testid="consult-requested__cancel-button"]', (el) => {
              console.log('cancel variation button ---- test24 cancellation goal')
              el.addEventListener('mousedown', function () {
                //console.log('click on the cancel button detected --- test 24 cancellation goal')
                triggerGoal('100037746');
              });
            });


            // Variation SIC24 - Visits Next Step of the Cancellation Process
            waitForElementInDoc(iframeDoc, '#cqb-open-modal', (el) => {
              console.log('Visits Next Step of the Cancellation Process')
              el.addEventListener('mousedown', function () {
                //console.log('click on the cancel button detected --- test 24 cancellation goal')
                triggerGoal('100037747');
              });
            });

            // Control SIC24 - Visits Next Step of the Cancellation Process
            waitForElementInDoc(iframeDoc, '[data-testid="consult-requested__cancel-button"]', (el) => {
              console.log('Visits Next Step of the Cancellation Process')
              el.addEventListener('mousedown', function () {
                //console.log('click on the cancel button detected --- test 24 cancellation goal')
                triggerGoal('100037747');
              });
            });

            // Control Variation SIC24 - Completed Cancellations
            waitForElementInDoc(iframeDoc, '.MuiDialogContent-root .MuiDialogActions-spacing  button:nth-child(2)', (el) => {
              console.log('Completed Cancellations --- test24 cancellation goal')
              el.addEventListener('mousedown', function () {
                //console.log('click on the cancel button detected --- test 24 cancellation goal')
                triggerGoal('100037745');
              });
            });

          })
        }
      }

      waitForElement('[data-telehealth="step_8_Waiting_Room"]', addGoalOnCancellation);

    } catch (e) {
      if (debug) console.log(e, "error in Test " + variation_name);
    }
  })();
}