(function () {
  try {
    var debug = 1;
    function log() {
      if (debug) console.log.apply(console, arguments);
    }
    /* ---------- waitForElement ---------- */
    function waitForElement(selector, trigger, delayInterval, delayTimeout) {
      var interval = setInterval(function () {
        var el = document.querySelector(selector);
        if (el) {
          clearInterval(interval);
          trigger(el);
        }
      }, delayInterval);
      setTimeout(function () {
        clearInterval(interval);
        log("Timeout:", selector);
      }, delayTimeout);
    }
    /* ---------- debounce ---------- */
    function debounce(func, timeout = 200) {
      let timer;
      return function () {
        clearTimeout(timer);
        var args = arguments;
        timer = setTimeout(function () {
          func.apply(null, args);
        }, timeout);
      };
    }
    /* ---------- observeSelector ---------- */
    function observeSelector(selector, callback, options = {}) {
      const doc = options.document || document;
      const processed = new Map();
      function handle(el) {
        if (!processed.has(el)) {
          processed.set(el, true);
          callback(el);
        }
      }
      function scan() {
        doc.querySelectorAll(selector).forEach(handle);
      }
      const debouncedScan = debounce(scan, 100);
      scan();
      const observer = new MutationObserver(function () {
        debouncedScan();
      });
      observer.observe(doc, {
        childList: true,
        subtree: true,
      });
    }
    /* ---------- LIVE EVENT DELEGATION ---------- */
    function live(selector, event, callback, context) {
      var doc = context || document;
      function addEvent(el, type, handler) {
        if (el.attachEvent) el.attachEvent("on" + type, handler);
        else el.addEventListener(type, handler);
      }
      if (!Element.prototype.matches) {
        Element.prototype.matches =
          Element.prototype.matchesSelector ||
          Element.prototype.webkitMatchesSelector ||
          Element.prototype.msMatchesSelector ||
          function (selector) {
            var nodes = (this.parentNode || document).querySelectorAll(selector);
            var i = -1;
            while (nodes[++i] && nodes[i] !== this);
            return !!nodes[i];
          };
      }
      addEvent(doc, event, function (e) {
        var el = e.target || e.srcElement;
        while (el && el !== doc) {
          if (el.matches && el.matches(selector)) {
            callback.call(el, e);
            break;
          }
          el = el.parentElement;
        }
      });
    }
    /* ====================================================================
       QUEUE PAGE — NEW DESIGN INJECTION
       - Inject HTML after `.MuiAppBar-positionSticky`
    
    ==================================================================== */
    function ChangeFrom(iframeDoc) {
      if (!iframeDoc) return;
      /* ---------- CSS ---------- */
      var style = iframeDoc.createElement("style");
      style.id = "cqb-style";
      style.innerHTML = `
    [data-telehealth="step_8_Waiting_Room"] .cqb-card-body_inner {
    padding: 32px 26px 24px;
}
[data-telehealth="step_8_Waiting_Room"] #custom-queue-block {
    font-family: Roboto, Helvetica, Arial, sans-serif;
    padding: 16px;
    box-sizing: border-box;
    width: 100%;
    max-width: 450px;
    margin: 0 auto;
    height: calc(100% - 30px);
}
[data-telehealth="step_8_Waiting_Room"] #custom-queue-block * {
    box-sizing: border-box;
}
/* breadcrumb */
[data-telehealth="step_8_Waiting_Room"] #custom-queue-block .cqb-breadcrumb {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 6px;
    font-size: 10px;
    margin-bottom: 12px;
    padding: 4px 2px;
}
[data-telehealth="step_8_Waiting_Room"] #custom-queue-block .cqb-breadcrumb .cqb-crumb {
    color: rgb(97, 97, 97);
}
[data-telehealth="step_8_Waiting_Room"] #custom-queue-block .cqb-breadcrumb .cqb-crumb.active {
    color: rgb(60, 60, 60);
    font-family: Roboto, Helvetica, Arial, sans-serif;
    font-size: 10px;
    font-style: normal;
    font-weight: var(--font-weight-400, 400);
    line-height: var(--line-height-21, 21px);
    letter-spacing: var(--letter-spacing-0_13, 0.131px);
}
[data-telehealth="step_8_Waiting_Room"] #custom-queue-block .cqb-breadcrumb .cqb-sep {
    color: #c6cad0;
    font-size: 12px;
}
/* card */
[data-telehealth="step_8_Waiting_Room"] #custom-queue-block .cqb-card {
    background: #ffffff;
    border-radius: 6px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04), 0 1px 8px rgba(0, 0, 0, 0.04);
    overflow: hidden;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    border: 1px solid rgba(222, 222, 222, 1);
}
/* card header */
[data-telehealth="step_8_Waiting_Room"] #custom-queue-block .cqb-card-header {
    display: flex;
    align-items: center;
    gap: 0;
    padding: 14px 26px;
    font-size: 14px;
    color: #1a1a1a;
    border-radius: 6px 6px 0 0;
    background: #FAFBFA;
    border-bottom: 1px solid rgba(222, 222, 222, 1);
    width: 100%;
}
[data-telehealth="step_8_Waiting_Room"] #custom-queue-block .cqb-dot {
    width: 10px;
    height: 10px;
    background-color: #2ecc71;
    border-radius: 50%;
    display: inline-block;
    animation: pulse 1.5s infinite;
    margin-right: 10px;
}
[data-telehealth="step_8_Waiting_Room"] #custom-queue-block .cqb-status-title {
    color: var(--13-sick-com-au-black, var(--color-black-solid, #000));
    font-family: Roboto, Helvetica, Arial, sans-serif;
    font-size: var(--font-size-14, 14px);
    font-style: normal;
    font-weight: 700;
    line-height: var(--line-height-21, 21px);
    letter-spacing: var(--letter-spacing-0_13, 0.131px);
    margin-right: 5px;
}
[data-telehealth="step_8_Waiting_Room"] #custom-queue-block .cqb-status-sep {
    color: #949494;
    margin: 0 2px;
    font-weight: 900;
}
[data-telehealth="step_8_Waiting_Room"] #custom-queue-block .cqb-status-sub {
    color: #000;
    font-family: Roboto, Helvetica, Arial, sans-serif;
    font-size: var(--font-size-14, 14px);
    font-style: normal;
    font-weight: var(--font-weight-400, 400);
    line-height: var(--line-height-21, 21px);
    letter-spacing: var(--letter-spacing-0_13, 0.131px);
    margin-left: 5px;
}
/* card body */
[data-telehealth="step_8_Waiting_Room"] #custom-queue-block .cqb-card-body {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
}
[data-telehealth="step_8_Waiting_Room"] #custom-queue-block .cqb-check {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: rgba(13, 172, 49, 1);
    align-items: center;
    justify-content: center;
    margin-bottom: 9px;
    display: flex;
}
[data-telehealth="step_8_Waiting_Room"] #custom-queue-block .cqb-check svg {
    width: 18px;
    height: 18px;
    color: #fff;
}
[data-telehealth="step_8_Waiting_Room"] #custom-queue-block .cqb-title {
    color: var(--color-black-solid, #000);
    font-family: Roboto, Helvetica, Arial, sans-serif;
    font-size: var(--font-size-14, 14px);
    font-style: normal;
    font-weight: 400;
    line-height: var(--line-height-21, 21px);
    letter-spacing: var(--letter-spacing-0_13, 0.131px);
    margin-bottom: 15px;
}
[data-telehealth="step_8_Waiting_Room"] #custom-queue-block .cqb-p {
    color: var(--color-black-solid, #000);
    font-family: Roboto, Helvetica, Arial, sans-serif;
    font-size: var(--font-size-14, 14px);
    font-style: normal;
    font-weight: 400;
    line-height: var(--line-height-21, 21px);
    letter-spacing: var(--letter-spacing-0_13, 0.131px);
}
[data-telehealth="step_8_Waiting_Room"] #custom-queue-block .cqb-p:last-of-type {
    margin-bottom: 0;
    margin-top: 20px;
}
/* card footer / button */
[data-telehealth="step_8_Waiting_Room"] #custom-queue-block .cqb-card-footer {
    padding: 32px 26px 24px;
}
[data-telehealth="step_8_Waiting_Room"] #custom-queue-block .cqb-leave-btn {
    display: flex;
    width: 100%;
    height: 36px;
    padding: 10px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    border-radius: 4px;
    border: 1px solid #DEDEDE;
    background: transparent;
    color: #949494;
    font-family: Roboto, Helvetica, Arial, sans-serif;
    font-size: 13px;
    font-style: normal;
    font-weight: 400;
    line-height: var(--line-height-21, 21px);
    letter-spacing: var(--letter-spacing-0_13, 0.131px);
}
[data-telehealth="step_8_Waiting_Room"] #custom-queue-block .cqb-leave-btn:hover {
    background: #fafbfc;
    border-color: #c8ccd2;
}
/* ===== Modal ===== */
  [data-telehealth="step_8_Waiting_Room"] #custom-queue-modal {
    position: fixed;
    inset: 0;
    background: rgba(20, 22, 28, 0.45);
    display: none;
    align-items: center;
    justify-content: center;
    z-index: 2147483646;
    padding: 16px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}
[data-telehealth="step_8_Waiting_Room"] #custom-queue-modal.cqm-open {
    display: flex;
}
[data-telehealth="step_8_Waiting_Room"] #custom-queue-modal .cqm-dialog {
    width: 100%;
    max-width: 365px;
    padding: 34px 40px 26px 37px;
    position: relative;
    border-radius: 12px;
    background: #FFF;
    box-shadow: 0 8px 24px 0 rgba(16, 24, 40, 0.12);
    box-sizing: border-box;
    text-align: center;
}
[data-telehealth="step_8_Waiting_Room"] #custom-queue-modal .cqm-close {
    position: absolute;
    top: 14px;
    right: 11px;
    border: 0;
    background: transparent;
    color: rgba(148, 148, 148, 1);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
}
[data-telehealth="step_8_Waiting_Room"] #custom-queue-modal .cqm-close svg {
    width: 13px;
    height: 13px;
}
[data-telehealth="step_8_Waiting_Room"] #custom-queue-modal .cqm-title {
    color: #000;
    text-align: center;
    font-family: Roboto, Helvetica, Arial, sans-serif;
    font-size: 17px;
    font-style: normal;
    font-weight: 700;
    line-height: var(--line-height-21, 21px);
    letter-spacing: var(--letter-spacing-0_13, 0.131px);
}
[data-telehealth="step_8_Waiting_Room"] #custom-queue-modal .cqm-sub {
    color: #000;
    font-family: Roboto, Helvetica, Arial, sans-serif;
    font-size: 14px;
    font-style: normal;
    font-weight: var(--font-weight-400, 400);
    line-height: var(--line-height-21, 21px);
    letter-spacing: var(--letter-spacing-0_13, 0.131px);
    margin-top: 8px;
}
[data-telehealth="step_8_Waiting_Room"] #custom-queue-modal .cqm-stay {
    display: flex;
    width: 288px;
    height: 36px;
    padding: 10px;
    justify-content: center;
    align-items: center;
    gap: 10px;
    border-radius: 4px;
    background: #0081F9;
    margin: 15px 0 11px 0;
    color: #FFF;
    font-family: Roboto, Helvetica, Arial, sans-serif;
    font-size: 13px;
    font-style: normal;
    font-weight: 400;
    line-height: var(--line-height-21, 21px);
    letter-spacing: var(--letter-spacing-0_13, 0.131px);
}
[data-telehealth="step_8_Waiting_Room"] #custom-queue-modal .cqm-stay:hover {
    background: #0f57db;
}
[data-telehealth="step_8_Waiting_Room"] #custom-queue-modal .cqm-leave-link {
    color: #949494;
    font-family: Roboto, Helvetica, Arial, sans-serif;
    font-size: 13px;
    font-style: normal;
    font-weight: 400;
    line-height: var(--line-height-21, 21px);
    letter-spacing: var(--letter-spacing-0_13, 0.131px);
}
[data-telehealth="step_8_Waiting_Room"] #custom-queue-modal .cqm-leave-link:hover {
    color: #1a1a1a;
}
[data-telehealth="step_8_Waiting_Room"] #custom-queue-modal + div {
    display: none !important;
}
@keyframes pulse {
    0% {
        transform: scale(1);
        opacity: 1;
    }
    50% {
        transform: scale(1.4);
        opacity: 0.6;
    }
    100% {
        transform: scale(1);
        opacity: 1;
    }
}
[data-telehealth="step_8_Waiting_Room"] .sic24_test .MuiGrid2-container {
    background-color: #FAFBFA;
}
@media (max-width: 767px) {
    [data-telehealth="step_8_Waiting_Room"] #custom-queue-block .cqb-card-header,
    [data-telehealth="step_8_Waiting_Room"] #custom-queue-block .cqb-card-body_inner {
        padding: 14px 16px;
    }
    [data-telehealth="step_8_Waiting_Room"] #custom-queue-block .cqb-card-header {
        display: inline-block;
    }
    [data-telehealth="step_8_Waiting_Room"] #custom-queue-modal .cqm-dialog {
        padding: 38px 24px 24px 24px;
    }
}


}

      `;
      iframeDoc.head.appendChild(style);
      /* ---------- HTML markup ---------- */
      // NOTE: replace `.cancel` below with the real cancel-request CTA selector
      // from the underlying control once you have it.
      var REAL_CANCEL_SELECTOR = "[data-testid='consult-requested__cancel-button']";
  
      /* ---------- HTML markup ---------- */
// NOTE: replace `.cancel` below with the real cancel-request CTA selector
// from the underlying control once you have it.
var REAL_CANCEL_SELECTOR = "[data-testid='consult-requested__cancel-button']";

function getHTML(userName) {
  return `
    <div id="custom-queue-block">
      <nav class="cqb-breadcrumb" aria-label="Breadcrumb">
        <span class="cqb-crumb">Consult</span>
        <span class="cqb-sep">›</span>
        <span class="cqb-crumb">Reasons</span>
        <span class="cqb-sep">›</span>
        <span class="cqb-crumb">Details</span>
        <span class="cqb-sep">›</span>
        <span class="cqb-crumb">Verify</span>
        <span class="cqb-sep">›</span>
        <span class="cqb-crumb active">Queue</span>
      </nav>

      <div class="cqb-card">

        <div class="cqb-card-body">

          <div class="cqb-card-body_inner_parent">

            <div class="cqb-card-header">
              <span class="cqb-dot" aria-hidden="true"></span>
              <span class="cqb-status-title">In queue</span>
              <span class="cqb-status-sep">·</span>
              <span class="cqb-status-sub">
                Waiting for next available doctor
              </span>
            </div>

            <div class="cqb-card-body_inner">

              <div class="cqb-check" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M5 12.5l4.5 4.5L19 7.5"
                    stroke="currentColor"
                    stroke-width="2.4"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  />
                </svg>
              </div>

              <p class="cqb-title">
                ${userName}.
              </p>

              <p class="cqb-p">
                You&rsquo;re now in the queue to speak with a doctor.
                You&rsquo;ll be contacted by phone or SMS when your doctor
                is available, so keep your mobile nearby.
                You don&rsquo;t need to keep this page open.
              </p>

              <p class="cqb-p">
                Your doctor can help with prescriptions,
                medical certificates, referrals and
                general medical advice.
              </p>

            </div>

          </div>

          <div class="cqb-card-footer">
            <button
              type="button"
              class="cqb-leave-btn"
              id="cqb-open-modal"
            >
              Leave Queue
            </button>
          </div>

        </div>

      </div>
    </div>

    <div
      id="custom-queue-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cqm-title"
    >
      <div class="cqm-dialog">

        <button
          type="button"
          class="cqm-close"
          id="cqm-close"
          aria-label="Close"
        >
          <svg viewBox="0 0 24 24" fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            />
          </svg>
        </button>

        <h3 class="cqm-title" id="cqm-title">
          Are you sure you want to leave the queue?
        </h3>

        <p class="cqm-sub">
          Leaving now means you&rsquo;ll lose your place.
        </p>

        <button
          type="button"
          class="cqm-stay"
          id="cqm-stay"
        >
          Stay in Queue
        </button>

        <button
          type="button"
          class="cqm-leave-link"
          id="cqm-leave"
        >
          Leave Queue
        </button>

      </div>
    </div>
  `;
}
      /* ---------- REMOVE injected block + class ---------- */
      function removeBlock() {
        var existing = iframeDoc.getElementById("custom-queue-block");
        var existing_item = iframeDoc.getElementById("custom-queue-modal");
        
        if (existing) {
          existing.parentNode.removeChild(existing);
          log("[CQB] removed ✗ (cancel button gone)");
        }
         if (existing_item) {
          existing_item.parentNode.removeChild(existing_item);
          log("[CQB] removed ✗ (cancel button gone)");
        }


        if (iframeDoc.body && iframeDoc.body.classList.contains("sic24_test")) {
          iframeDoc.body.classList.remove("sic24_test");
        }
      }
      /* ---------- INJECTION (with conditions) ---------- */
      var modalBound = false;
     function injectBlock() {

  var cancelBtn = iframeDoc.querySelector(REAL_CANCEL_SELECTOR);

  // agar cancel button nahi hai to humara block remove kar do
  if (!cancelBtn) {
    log("[CQB] cancel button not found");
    removeBlock();
    return false;
  }

  var appBar = iframeDoc.querySelector(
    ".MuiAppBar-positionSticky + .MuiGrid2-container > .MuiBox-root"
  );

  if (!appBar) {
    log("[CQB] appBar not found yet");
    return false;
  }

  // 👇 Dynamic username
  var userName = "";

  var headingEl = iframeDoc.querySelector("h1.MuiTypography-h1");

  if (headingEl && headingEl.textContent.trim()) {
    userName = headingEl.textContent.trim();
  }

  // already injected
  if (iframeDoc.getElementById("custom-queue-block")) {
    return true;
  }

  // 👇 Inject dynamic HTML
  appBar.insertAdjacentHTML("beforebegin", getHTML(userName));

  iframeDoc.body.classList.add("sic24_test");

  log("[CQB] injected ");

  if (!modalBound) {
    bindModal();
    modalBound = true;
  }

  return true;
}
      /* ---------- KEEP-ALIVE: re-inject if React removes our block,---------- */
                                
      function startKeepAlive() {
        var keepAliveObserver = new MutationObserver(debounce(function () {
          var cancelBtn = iframeDoc.querySelector(REAL_CANCEL_SELECTOR);

          if (!cancelBtn) {
            removeBlock();
            return;
          }

          if (!iframeDoc.getElementById("custom-queue-block")) {
            injectBlock();
          }
        }, 150));
        keepAliveObserver.observe(iframeDoc.body || iframeDoc, {
          childList: true,
          subtree: true,
        });
      }
      /* ---------- Modal logic ---------- */
      function openModal() {
        var modal = iframeDoc.getElementById("custom-queue-modal");
        if (modal) modal.classList.add("cqm-open");
      }
      function closeModal() {
        var modal = iframeDoc.getElementById("custom-queue-modal");
        if (modal) modal.classList.remove("cqm-open");
      }
      function triggerCancel() {
        // Click the actual control's "Cancel Request" CTA
        var realBtn = iframeDoc.querySelector(REAL_CANCEL_SELECTOR);
        if (realBtn) {
          realBtn.click();
        } else {
          log("Cancel CTA not found for selector:", REAL_CANCEL_SELECTOR);
        }
      }
      function bindModal() {
        // Open
        live("#cqb-open-modal", "click", function (e) {
          e.preventDefault();
          openModal();
        }, iframeDoc);
        // Close via X
        live("#cqm-close", "click", function (e) {
          e.preventDefault();
          closeModal();
        }, iframeDoc);
        // Close via "Stay in Queue"
        live("#cqm-stay", "click", function (e) {
          e.preventDefault();
          closeModal();
        }, iframeDoc);
        // Click "Leave Queue" link -> trigger real cancel CTA + close modal
        live("#cqm-leave", "click", function (e) {
          
          e.preventDefault();
          closeModal();
          triggerCancel();
        }, iframeDoc);
        // Click outside dialog closes modal
        live("#custom-queue-modal", "click", function (e) {
          if (e.target && e.target.id === "custom-queue-modal") {
            closeModal();
          }
        }, iframeDoc);
      }
      /* Try once now, then watch DOM in case appbar mounts later */
      injectBlock();
      startKeepAlive();
    }
    /* ---------- INIT ---------- */
    function init() {
      setTimeout(function () {
        waitForElement(
          "iframe#mobile-viewport",
          function (iframe) {
            function run() {
              try {
                var iframeDoc =
                  iframe.contentDocument || iframe.contentWindow.document;
                ChangeFrom(iframeDoc);
              } catch (e) {
                log("iframe access error:", e);
              }
            }
            iframe.onload = run;
            if (
              iframe.contentDocument &&
              iframe.contentDocument.readyState === "complete"
            ) {
              run();
            }
          },
          50,
          15000
        );
      }, 200);
    }
    waitForElement("body", init, 50, 15000);
  } catch (e) {
    console.log("Main error:", e);
  }
})();