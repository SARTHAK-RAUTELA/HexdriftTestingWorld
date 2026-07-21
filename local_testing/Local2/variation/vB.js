(function () {
    try {
        /* Main variables */
        var debug = 0;
        var variation_name = "cre-t-253";

        var ATC_SELECTOR = '#orderForm .order-form__add, .order-form .order-form__add';
        var MATTRESS_PRICE_SELECTORS = ['.price-row__pay-option-price', '.cre-t-202-box-main-price'];
        var REMOVAL_PRICE_SELECTOR = '.order-form__loadup-button-price';
        var ACCESSORY_CHECKBOX_SELECTOR = 'input.add-to-accessory-cart';
        var SUBTOTAL_CLASS = 'cro-subtotal-line';

        function parsePrice(text) {
            if (!text) return 0;
            var match = text.match(/\$[\d,]+(?:\.\d+)?/);
            if (!match) return 0;
            return parseFloat(match[0].replace(/[^0-9.]/g, '')) || 0;
        }

        function getMattressPrice() {
            for (var i = 0; i < MATTRESS_PRICE_SELECTORS.length; i++) {
                var el = document.querySelector(MATTRESS_PRICE_SELECTORS[i]);
                if (el) {
                    var value = parsePrice(el.textContent);
                    if (value > 0) return value;
                }
            }
            return 0;
        }

        function getRemovalPrice() {
            var el = document.querySelector(REMOVAL_PRICE_SELECTOR);
            if (!el || /\boptional\b/.test(el.className)) return 0;
            return parsePrice(el.textContent);
        }

        function getAccessoriesTotal() {
            var total = 0;
            var boxes = document.querySelectorAll(ACCESSORY_CHECKBOX_SELECTOR);
            for (var i = 0; i < boxes.length; i++) {
                if (!boxes[i].checked) continue;
                var li = boxes[i].closest('li.accessory-tray_item') || boxes[i].closest('li');
                if (!li) continue;
                var titleEl = li.querySelector('.accessory-item-title') || li;
                total += parsePrice(titleEl.textContent);
            }
            return total;
        }

        function formatUSD(amount) {
            return '$' + Math.round(amount).toLocaleString('en-US');
        }

        function ensureSubtotalLine() {
            var atc = document.querySelector(ATC_SELECTOR);
            if (!atc) return null;
            var line = document.querySelector('.' + SUBTOTAL_CLASS);
            if (!line) {
                line = document.createElement('div');
                line.className = SUBTOTAL_CLASS;
                atc.insertAdjacentElement('beforebegin', line);
            } else if (atc.previousElementSibling !== line) {
                atc.insertAdjacentElement('beforebegin', line);
            }
            return line;
        }

        function renderSubtotal(line) {
            var total = getMattressPrice() + getRemovalPrice() + getAccessoriesTotal();
            var text = 'Your sub-total is ' + formatUSD(total);
            if (line.textContent !== text) line.textContent = text;
        }

        function init() {
            document.body.classList.add(variation_name);

            // Buy Box selections (firmness/size/fabric/removal/upsells) can change at any
            // point in the session, and this page runs several concurrent CRO tests that
            // re-render pieces of the Buy Box - so keep recomputing for the whole session
            // instead of stopping after a fixed failsafe window.
            setInterval(function () {
                var line = ensureSubtotalLine();
                if (line) renderSubtotal(line);
            }, 300);
        }

        var initInterval = setInterval(function () {
            if (document.body && document.querySelector(ATC_SELECTOR)) {
                clearInterval(initInterval);
                init();
            }
        }, 50);

        /* Failsafe: stop waiting for the Buy Box to appear after 15 seconds. */
        setTimeout(function () {
            clearInterval(initInterval);
        }, 15000);

    } catch (e) {
        if (debug) console.log(e, "error in Test " + variation_name);
    }
})();
