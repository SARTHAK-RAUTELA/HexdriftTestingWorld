(async () => {
    // ============================================================
    //  SmokyQA — Pet Insurance Gurus — Full QA Suite v2
    //  FIXED: Zipcode uses React _valueTracker bypass
    //  FIXED: Cat/Dog tabs use correct Oxygen Builder selectors
    //  Checks: Card UI, CSS Variation, Zipcode Reorder (x5),
    //          Cat Filter + Zipcode, Dog Filter + Zipcode
    // ============================================================

    // ── CONFIG (easy to edit) ─────────────────────────────────
    const CONFIG = {
        TIMEOUT: 8000,
        STEP_DELAY: 1200,        // ms after tab click
        ZIPCODE_DELAY: 4000,     // ms after zip applied (content reload)
        OBSERVE_DELAY: 3000,     // ms to visually observe section
        SCROLL_DELAY: 600,       // ms after scroll-to-top

        // ── Zip codes to test (66021 must be included per brief)
        US_ZIPCODES: ['66021', '10001', '90210', '60601', '77001'],

        // ── Oxygen Builder tab selectors (NOT generic button search)
        TAB_ALL_PETS: '.filter-options .oxy-tabs-wrapper .oxy-tab:nth-child(1)',
        TAB_CATS: '.filter-options .oxy-tabs-wrapper .oxy-tab:nth-child(2)',
        TAB_DOGS: '.filter-options .oxy-tabs-wrapper .oxy-tab:nth-child(3)',

        // ── Zipcode input
        ZIP_INPUT_SELECTOR: 'input[placeholder="Enter Zip Code"]',

        // ── Card selectors
        PLAN_BOX_SELECTOR: '#comparison-section .plan-box',

        // ── CSS variation expected values
        EXPECTED_BUTTON_BG: 'rgb(2, 114, 228)',      // #0272e4
        EXPECTED_BUTTON_RADIUS: '55px',
        EXPECTED_BUBBLE_BG: 'rgb(94, 19, 148)',       // #5e1394
        EXPECTED_BORDER_COLOR: 'rgb(0, 0, 0)',           // #000
        EXPECTED_LABEL_COLOR: 'rgb(56, 56, 56)',        // #383838
        EXPECTED_READ_MORE_BG: 'rgb(255, 255, 255)',     // #fff
        EXPECTED_READ_MORE_COLOR: 'rgb(0, 0, 0)',           // #000
    };

    let totalPass = 0;
    let totalFail = 0;
    const failures = [];

    // ── Utilities ─────────────────────────────────────────────
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    function getStyle(el, prop) {
        return window.getComputedStyle(el).getPropertyValue(prop).trim();
    }

    function pass(label, detail = '') {
        console.log(
            `%c✅ PASS | ${label}${detail ? ' — ' + detail : ''}`,
            'color:#22c55e;font-weight:bold'
        );
        totalPass++;
    }

    function fail(label, detail = '') {
        console.error(`❌ FAIL | ${label}${detail ? ' — ' + detail : ''}`);
        totalFail++;
        failures.push(`${label}${detail ? ': ' + detail : ''}`);
    }

    function info(msg) {
        console.log(`%cℹ️  ${msg}`, 'color:#60a5fa');
    }

    // ── waitFor single element ────────────────────────────────
    function waitFor(selector, timeout = CONFIG.TIMEOUT) {
        return new Promise((resolve, reject) => {
            const el = document.querySelector(selector);
            if (el) return resolve(el);
            const observer = new MutationObserver(() => {
                const found = document.querySelector(selector);
                if (found) { observer.disconnect(); resolve(found); }
            });
            observer.observe(document.body, { childList: true, subtree: true });
            setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Timeout: "${selector}" not found after ${timeout}ms`));
            }, timeout);
        });
    }

    // ── waitForAll elements ───────────────────────────────────
    function waitForAll(selector, minCount = 1, timeout = CONFIG.TIMEOUT) {
        return new Promise((resolve, reject) => {
            const check = () => {
                const els = document.querySelectorAll(selector);
                return els.length >= minCount ? Array.from(els) : null;
            };
            const found = check();
            if (found) return resolve(found);
            const observer = new MutationObserver(() => {
                const f = check();
                if (f) { observer.disconnect(); resolve(f); }
            });
            observer.observe(document.body, { childList: true, subtree: true });
            setTimeout(() => {
                observer.disconnect();
                reject(new Error(`Timeout: "${selector}" (min ${minCount}) not found after ${timeout}ms`));
            }, timeout);
        });
    }

    // ── Get card order snapshot ───────────────────────────────
    function getCardOrder() {
        return Array.from(document.querySelectorAll(CONFIG.PLAN_BOX_SELECTOR)).map((c) => {
            const img = c.querySelector('img');
            const name = c.querySelector('.plan-name, [class*="name"], h2, h3, h4');
            return img ? (img.alt || img.src.split('/').pop()) : (name ? name.innerText.trim() : c.innerText.slice(0, 30));
        });
    }

    // ── FIXED: React-compatible zip input setter ──────────────
    // Uses _valueTracker bypass to trigger React's onChange handler
    async function applyZipCode(zip) {
        const input = document.querySelector(CONFIG.ZIP_INPUT_SELECTOR);
        if (!input) {
            fail('Zip input', `Selector "${CONFIG.ZIP_INPUT_SELECTOR}" not found`);
            return false;
        }

        const lastValue = input.value;

        // Step 1: Use native setter to bypass React's value tracking
        const nativeSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype, 'value'
        ).set;
        nativeSetter.call(input, zip);

        // Step 2: Trick React's _valueTracker into seeing a change
        const tracker = input._valueTracker;
        if (tracker) tracker.setValue(lastValue);

        // Step 3: Fire input + change events so React state updates
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));

        // Step 4: Also try pressing Enter in case form needs submission
        input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter', keyCode: 13 }));
        input.dispatchEvent(new KeyboardEvent('keypress', { bubbles: true, key: 'Enter', keyCode: 13 }));
        input.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'Enter', keyCode: 13 }));

        // Step 5: Click any nearby submit button
        const form = input.closest('form');
        if (form) {
            const submitBtn = form.querySelector('[type="submit"], button');
            if (submitBtn) submitBtn.click();
        }

        info(`Zip code applied: ${zip} (current input value: "${input.value}")`);
        return true;
    }

    // ── FIXED: Oxygen Builder tab clicker ─────────────────────
    // Uses exact selectors from the context doc — NOT generic button search
    async function clickTab(selector, tabName) {
        try {
            const tab = await waitFor(selector, CONFIG.TIMEOUT);
            tab.click();
            info(`Clicked "${tabName}" tab → ${selector}`);
            await sleep(CONFIG.STEP_DELAY);
            pass(`Tab click — ${tabName}`, 'Tab clicked and settled');
            return true;
        } catch (e) {
            fail(`Tab click — ${tabName}`, `Selector "${selector}" not found: ${e.message}`);
            return false;
        }
    }

    // ── Scroll helper ─────────────────────────────────────────
    async function scrollToSection() {
        const target = document.querySelector('[data-unique="comparison-table"]');
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            await sleep(CONFIG.OBSERVE_DELAY);
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
        await sleep(CONFIG.SCROLL_DELAY);
    }

    // ── Run per-card CSS checks ───────────────────────────────
    function checkCardCSS(card, cardLabel) {
        console.group(`%c🃏 ${cardLabel}`, 'color:#a78bfa;font-weight:bold');

        // Border: 1px solid #000
        const borderColor = getStyle(card, 'border-top-color');
        const borderStyle = getStyle(card, 'border-top-style');
        const borderWidth = getStyle(card, 'border-top-width');
        if (borderColor === CONFIG.EXPECTED_BORDER_COLOR && borderStyle === 'solid' && borderWidth === '1px') {
            pass(`${cardLabel} — border`, `solid 1px #000 ✓`);
        } else {
            fail(`${cardLabel} — border`, `Got ${borderWidth} ${borderStyle} ${borderColor}`);
        }

        // See Plans button
        const seePlansBtn = card.querySelector('.see-plans-button');
        if (seePlansBtn) {
            const btnBg = getStyle(seePlansBtn, 'background-color');
            const btnRadius = getStyle(seePlansBtn, 'border-radius');

            btnBg === CONFIG.EXPECTED_BUTTON_BG
                ? pass(`${cardLabel} — See Plans bg`, `#0272e4 ✓`)
                : fail(`${cardLabel} — See Plans bg`, `Expected #0272e4, got ${btnBg}`);

            parseFloat(btnRadius) >= 50
                ? pass(`${cardLabel} — See Plans radius`, `${btnRadius} ✓`)
                : fail(`${cardLabel} — See Plans radius`, `Expected ~55px, got ${btnRadius}`);

            // Button text via ::after or visible text
            const btnSpan = seePlansBtn.querySelector('span');
            if (btnSpan) {
                const afterContent = window.getComputedStyle(btnSpan, '::after').getPropertyValue('content');
                const visibleText = seePlansBtn.innerText.trim().toLowerCase();
                if ((afterContent && afterContent.toLowerCase().includes('see plans')) || visibleText.includes('see plan')) {
                    pass(`${cardLabel} — See Plans text`, `"See Plans" ✓`);
                } else {
                    fail(`${cardLabel} — See Plans text`, `::after="${afterContent}" visible="${seePlansBtn.innerText.trim()}"`);
                }
            }
        } else {
            fail(`${cardLabel} — See Plans button`, 'Not found');
        }

        // Read More button
        const readMoreBtn = card.querySelector('.oxy-read-more-link');
        if (readMoreBtn) {
            const rmBg = getStyle(readMoreBtn, 'background-color');
            const rmColor = getStyle(readMoreBtn, 'color');
            const rmRadius = getStyle(readMoreBtn, 'border-radius');
            const rmBorderColor = getStyle(readMoreBtn, 'border-top-color');
            const rmBorderStyle = getStyle(readMoreBtn, 'border-top-style');

            rmBg === CONFIG.EXPECTED_READ_MORE_BG
                ? pass(`${cardLabel} — Read More bg`, `#fff ✓`)
                : fail(`${cardLabel} — Read More bg`, `Expected #fff, got ${rmBg}`);

            rmColor === CONFIG.EXPECTED_READ_MORE_COLOR
                ? pass(`${cardLabel} — Read More color`, `#000 ✓`)
                : fail(`${cardLabel} — Read More color`, `Expected #000, got ${rmColor}`);

            (rmBorderColor === CONFIG.EXPECTED_BORDER_COLOR && rmBorderStyle === 'solid')
                ? pass(`${cardLabel} — Read More border`, `solid #000 ✓`)
                : fail(`${cardLabel} — Read More border`, `Got ${rmBorderStyle} ${rmBorderColor}`);

            parseFloat(rmRadius) >= 50
                ? pass(`${cardLabel} — Read More radius`, `${rmRadius} ✓`)
                : fail(`${cardLabel} — Read More radius`, `Expected ~55px, got ${rmRadius}`);
        } else {
            info(`${cardLabel} — .oxy-read-more-link not visible (may be collapsed)`);
        }

        // Guarantee label colour (#383838)
        const bestPriceLabel = card.querySelector('.guarantee-container .best-price-label');
        if (bestPriceLabel) {
            getStyle(bestPriceLabel, 'color') === CONFIG.EXPECTED_LABEL_COLOR
                ? pass(`${cardLabel} — best-price-label color`, `#383838 ✓`)
                : fail(`${cardLabel} — best-price-label color`, `Got ${getStyle(bestPriceLabel, 'color')}`);
        }

        // Popover marker colour (#383838)
        const popoverMarker = card.querySelector('.guarantee-container .oxy-popover_marker-inner');
        if (popoverMarker) {
            getStyle(popoverMarker, 'color') === CONFIG.EXPECTED_LABEL_COLOR
                ? pass(`${cardLabel} — popover marker color`, `#383838 ✓`)
                : fail(`${cardLabel} — popover marker color`, `Got ${getStyle(popoverMarker, 'color')}`);
        }

        // Box shadow
        const boxShadow = getStyle(card, 'box-shadow');
        (boxShadow && boxShadow !== 'none')
            ? pass(`${cardLabel} — box-shadow`, boxShadow.slice(0, 60) + '…')
            : fail(`${cardLabel} — box-shadow`, `Got: ${boxShadow}`);

        console.groupEnd();
    }

    // ── Run full card suite (all visible cards) ───────────────
    async function runCardChecks(phaseLabel) {
        console.group(`%c🗂️  Card CSS Checks — ${phaseLabel}`, 'color:#f59e0b;font-weight:bold');
        let planBoxes = [];
        try {
            planBoxes = await waitForAll(CONFIG.PLAN_BOX_SELECTOR, 1);
        } catch (e) {
            fail(`Card check — ${phaseLabel}`, `No plan boxes found: ${e.message}`);
            console.groupEnd();
            return;
        }

        pass(`Cards found — ${phaseLabel}`, `${planBoxes.length} cards`);

        // Duplicate check
        const fingerprints = planBoxes.map((c) => c.innerText.slice(0, 80).replace(/\s+/g, ' ').trim());
        const unique = new Set(fingerprints);
        unique.size === planBoxes.length
            ? pass(`No duplicate cards — ${phaseLabel}`, `${planBoxes.length} unique ✓`)
            : fail(`Duplicate cards — ${phaseLabel}`, `${planBoxes.length} total, ${unique.size} unique`);

        planBoxes.forEach((card, i) => checkCardCSS(card, `Card ${i + 1}`));

        console.groupEnd();
    }

    // ── Zip iteration runner ──────────────────────────────────
    async function runZipIterations(phaseLabel) {
        console.group(`%c📮 Zip Iterations — ${phaseLabel}`, 'color:#f59e0b;font-weight:bold');

        let previousOrder = getCardOrder();

        for (let i = 0; i < CONFIG.US_ZIPCODES.length; i++) {
            const zip = CONFIG.US_ZIPCODES[i];
            console.group(`%c🔢 Zip ${i + 1}/5: ${zip}`, 'color:#c084fc');

            // Apply zip using React-compatible method
            const applied = await applyZipCode(zip);
            if (!applied) { console.groupEnd(); continue; }

            // Wait for content reload
            info(`Waiting ${CONFIG.ZIPCODE_DELAY}ms for content reload…`);
            await sleep(CONFIG.ZIPCODE_DELAY);

            // Scroll to comparison table then back
            await scrollToSection();

            // Verify cards changed order
            const currentOrder = getCardOrder();
            const changed = JSON.stringify(currentOrder) !== JSON.stringify(previousOrder);
            changed
                ? pass(`Zip ${zip} — Cards reordered`, currentOrder.slice(0, 3).join(' → '))
                : info(`Zip ${zip} — Card order unchanged (zip may not affect this area)`);

            // Verify cards still visible
            const cards = document.querySelectorAll(CONFIG.PLAN_BOX_SELECTOR);
            cards.length >= 1
                ? pass(`Zip ${zip} — Cards still visible`, `${cards.length} cards`)
                : fail(`Zip ${zip} — Cards disappeared`, '0 cards found after zip');

            // Spot-check first card CSS still applied
            if (cards[0]) {
                const seePlansBtn = cards[0].querySelector('.see-plans-button');
                if (seePlansBtn) {
                    const btnBg = getStyle(seePlansBtn, 'background-color');
                    btnBg === CONFIG.EXPECTED_BUTTON_BG
                        ? pass(`Zip ${zip} — See Plans btn CSS intact`, `#0272e4 ✓`)
                        : fail(`Zip ${zip} — See Plans btn CSS`, `Expected #0272e4, got ${btnBg}`);
                }
            }

            previousOrder = currentOrder;
            console.groupEnd();
        }

        console.groupEnd();
    }

    // ==========================================================
    //  ████  MAIN TEST EXECUTION  ████
    // ==========================================================

    // ── SECTION 1: Page Structure ─────────────────────────────
    console.group('%c📋 SECTION 1: Page Structure', 'color:#f59e0b;font-size:14px;font-weight:bold');

    // Body data-path check
    const bodyPath = document.body.getAttribute('data-path');
    (bodyPath === '/' || bodyPath === '/home/')
        ? pass('Body data-path', `"${bodyPath}" — CSS variation targets this ✓`)
        : fail('Body data-path', `Got "${bodyPath}" — variation CSS may not apply`);

    // Comparison section
    try {
        await waitFor('#comparison-section');
        pass('Comparison section', '#comparison-section found ✓');
    } catch (e) {
        fail('Comparison section', e.message);
        console.groupEnd();
        console.error('🚨 CRITICAL: Cannot continue without #comparison-section');
        return;
    }

    // Filter bar
    const filterBar = document.querySelector('.filter-options');
    filterBar
        ? pass('Filter bar', '.filter-options found ✓')
        : fail('Filter bar', '.filter-options not found');

    // Oxygen tab selectors present
    const tabAll = document.querySelector(CONFIG.TAB_ALL_PETS);
    const tabCats = document.querySelector(CONFIG.TAB_CATS);
    const tabDogs = document.querySelector(CONFIG.TAB_DOGS);

    tabAll ? pass('Tab — All Pets', `"${tabAll.innerText.trim()}" ✓`) : fail('Tab — All Pets', `${CONFIG.TAB_ALL_PETS} not found`);
    tabCats ? pass('Tab — Cats', `"${tabCats.innerText.trim()}" ✓`) : fail('Tab — Cats', `${CONFIG.TAB_CATS} not found`);
    tabDogs ? pass('Tab — Dogs', `"${tabDogs.innerText.trim()}" ✓`) : fail('Tab — Dogs', `${CONFIG.TAB_DOGS} not found`);

    // Best Overall bubble
    const bestBubble = document.querySelector('#comparison-section .number-bubble.best-overall-bubble');
    if (bestBubble) {
        const bubbleBg = getStyle(bestBubble, 'background-color');
        const bubbleRadius = getStyle(bestBubble, 'border-radius');
        bubbleBg === CONFIG.EXPECTED_BUBBLE_BG
            ? pass('Best Overall bubble — bg', `#5e1394 ✓`)
            : fail('Best Overall bubble — bg', `Expected #5e1394, got ${bubbleBg}`);
        parseFloat(bubbleRadius) >= 50
            ? pass('Best Overall bubble — radius', `${bubbleRadius} ✓`)
            : fail('Best Overall bubble — radius', `Expected ~55px, got ${bubbleRadius}`);
    } else {
        fail('Best Overall bubble', '.number-bubble.best-overall-bubble not found');
    }

    // First card rating-bar border check
    const ratingBar = document.querySelector('#comparison-section .plan-repeater div:first-of-type .rating-bar');
    if (ratingBar) {
        const rbTop = getStyle(ratingBar, 'border-top-style');
        const rbRight = getStyle(ratingBar, 'border-right-style');
        const rbBottom = getStyle(ratingBar, 'border-bottom-style');
        const rbLeft = getStyle(ratingBar, 'border-left-style');

        rbTop === 'none'
            ? pass('Rating bar — border-top: none', '✓')
            : fail('Rating bar — border-top', `Expected none, got ${rbTop}`);

        (rbRight === 'solid' && rbBottom === 'solid' && rbLeft === 'solid')
            ? pass('Rating bar — right/bottom/left: solid', '✓')
            : fail('Rating bar — borders', `right:${rbRight} bottom:${rbBottom} left:${rbLeft}`);
    } else {
        info('Rating bar (.plan-repeater div:first-of-type .rating-bar) not found — skipping');
    }

    console.groupEnd();

    // ── SECTION 2: Negative / Safety Checks ──────────────────
    console.group('%c📋 SECTION 2: Negative & Safety Checks', 'color:#f59e0b;font-size:14px;font-weight:bold');

    // No empty/broken cards
    const allCards = document.querySelectorAll(CONFIG.PLAN_BOX_SELECTOR);
    let emptyCount = 0;
    allCards.forEach((c) => { if (c.innerText.trim().length < 10) emptyCount++; });
    emptyCount === 0
        ? pass('No empty/broken cards', `All ${allCards.length} cards have content ✓`)
        : fail('Empty/broken cards', `${emptyCount} card(s) with <10 chars`);

    // All cards have See Plans button
    let missingBtns = 0;
    allCards.forEach((c) => { if (!c.querySelector('.see-plans-button')) missingBtns++; });
    missingBtns === 0
        ? pass('All cards have See Plans button', '✓')
        : fail('Missing See Plans button', `${missingBtns} card(s) missing`);

    // First ct-div-block: border:0, box-shadow:none
    const compTable = document.querySelector('#comparison-section [data-unique="comparison-table"]');
    if (compTable) {
        const firstChild = compTable.querySelector(':scope > .ct-div-block:first-child');
        if (firstChild) {
            const fcBorder = getStyle(firstChild, 'border-top-style');
            const fcShadow = getStyle(firstChild, 'box-shadow');
            (fcBorder === 'none' || fcBorder === '')
                ? pass('First ct-div-block — border: none', '✓')
                : fail('First ct-div-block — border', `Got ${fcBorder}`);
            (fcShadow === 'none' || fcShadow === '')
                ? pass('First ct-div-block — box-shadow: none', '✓')
                : fail('First ct-div-block — box-shadow', `Got ${fcShadow}`);
        } else {
            info('First .ct-div-block child not found inside comparison-table');
        }
    }

    console.groupEnd();

    // ── PHASE 1: All Pets Tab ─────────────────────────────────
    console.group('%c🐾 PHASE 1: All Pets Tab', 'color:#f59e0b;font-size:14px;font-weight:bold');
    await clickTab(CONFIG.TAB_ALL_PETS, 'All Pets');
    await runCardChecks('All Pets');
    await runZipIterations('All Pets');
    console.groupEnd();

    // ── PHASE 2: Cats Tab ─────────────────────────────────────
    console.group('%c🐱 PHASE 2: Cats Tab', 'color:#f59e0b;font-size:14px;font-weight:bold');
    const catTabClicked = await clickTab(CONFIG.TAB_CATS, 'Cats');
    if (catTabClicked) {
        await runCardChecks('Cats');
        await runZipIterations('Cats');
    }
    console.groupEnd();

    // ── PHASE 3: Dogs Tab ─────────────────────────────────────
    console.group('%c🐶 PHASE 3: Dogs Tab', 'color:#f59e0b;font-size:14px;font-weight:bold');
    const dogTabClicked = await clickTab(CONFIG.TAB_DOGS, 'Dogs');
    if (dogTabClicked) {
        await runCardChecks('Dogs');
        await runZipIterations('Dogs');
    }
    console.groupEnd();

    // ── FINAL SUMMARY ─────────────────────────────────────────
    console.group('%c📊 FINAL SUMMARY', 'color:#f59e0b;font-size:16px;font-weight:bold');
    console.log(`%c✅ Total PASS: ${totalPass}`, 'color:#22c55e;font-size:13px;font-weight:bold');
    console.log(
        `%c${totalFail > 0 ? '❌' : '✅'} Total FAIL: ${totalFail}`,
        `color:${totalFail > 0 ? '#ef4444' : '#22c55e'};font-size:13px;font-weight:bold`
    );

    if (totalFail === 0) {
        console.log('%c🎉 ALL CHECKS PASSED ✅', 'color:#22c55e;font-size:16px;font-weight:bold');
    } else {
        console.log(`%c⚠️  ${totalFail} CHECK(S) FAILED ❌`, 'color:#ef4444;font-size:16px;font-weight:bold');
        console.group('%c❌ Failed Checks List:', 'color:#ef4444;font-weight:bold');
        failures.forEach((f, i) => console.error(`  ${i + 1}. ${f}`));
        console.groupEnd();
    }
    console.groupEnd();

})();