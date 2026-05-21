// Diagnostic: Navigate to Verify step, fill ALL fields, click Next, see what happens
const { test } = require('@playwright/test');
const fs   = require('fs');
const path = require('path');

const VARIATION_URL = 'https://stg-patient.doctordoctor.com.au/request-consult?utm_campaign=Cre_qa&_conv_eforce=100052082.1000255518&isTelehealth=true';
const SS_DIR = path.join(__dirname, '../sic24-screenshots');
fs.mkdirSync(SS_DIR, { recursive: true });

const MOBILE   = '0499999999';
const DOB_DD   = '20';
const DOB_MM   = '04';
const DOB_YYYY = '1969';
const OTP      = '12312';

test('diag-04: full funnel through OTP to queue page', async ({ page }) => {
  test.setTimeout(300000);
  await page.goto(VARIATION_URL, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(3000);

  const iframeEl = await page.waitForSelector('iframe#mobile-viewport', { timeout: 30000 });
  const f = await iframeEl.contentFrame();

  // Step 1: Emergency Warning
  const cb = await f.$('input[type="checkbox"]');
  if (cb) {
    if (!(await cb.isChecked().catch(() => false))) await cb.click();
    await page.waitForTimeout(400);
    const btns = await f.$$('button');
    for (const b of btns) {
      const t = (await b.innerText().catch(() => '')).trim();
      if (t === 'Continue') { await b.click(); console.log('[Step1] Clicked Continue'); break; }
    }
  }
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(SS_DIR, 'diag04-01-after-emergency.png') });
  console.log('[Step1] bodyText includes Medical Certificate Only:', (await f.evaluate(() => document.body.innerText)).includes('Medical Certificate Only'));

  // Step 2: Reasons — click first visible role=button
  const roleButtons = await f.$$('[role="button"]');
  console.log(`[Step2] Found ${roleButtons.length} role=button elements`);
  for (const btn of roleButtons) {
    if (await btn.isVisible().catch(() => false)) {
      const t = await btn.innerText().catch(() => '');
      console.log(`[Step2] Clicking reason: "${t.substring(0, 50)}"`);
      await btn.click();
      break;
    }
  }
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(SS_DIR, 'diag04-02-after-reason.png') });
  const bodyAfterReason = await f.evaluate(() => document.body.innerText);
  console.log('[Step2] Has textarea:', (await f.$('textarea')) !== null);
  console.log('[Step2] bodyText includes Mobile Number:', bodyAfterReason.includes('Mobile Number'));

  // Step 3: Details — fill textarea + click Next
  const textarea = await f.$('textarea');
  if (textarea && await textarea.isVisible().catch(() => false)) {
    await textarea.fill('General consultation needed');
    console.log('[Step3] Filled textarea');
  }
  const btns3 = await f.$$('button');
  for (const b of btns3) {
    const t = (await b.innerText().catch(() => '')).trim();
    const en = await b.isEnabled().catch(() => false);
    console.log(`[Step3] button="${t}" enabled=${en}`);
    if (t === 'Next' && en) { await b.click(); console.log('[Step3] Clicked Next (Details)'); break; }
  }
  await page.waitForTimeout(2500);
  await page.screenshot({ path: path.join(SS_DIR, 'diag04-03-after-details.png') });

  const bodyVerify = await f.evaluate(() => document.body.innerText);
  console.log('[Step4] Has Mobile Number:', bodyVerify.includes('Mobile Number'));
  console.log('[Step4] Has Date of Birth:', bodyVerify.includes('Date of Birth'));

  // Step 4: Verify — fill Mobile + DOB + checkboxes + click Next
  // 4a. Mobile
  const mobileInp = await f.$('input[name="userName"]');
  if (mobileInp) {
    console.log('[Step4] Found mobile input, filling...');
    await mobileInp.click({ clickCount: 3 });
    await mobileInp.fill(MOBILE);
    await page.waitForTimeout(300);
    const val = await mobileInp.evaluate(el => el.value);
    console.log(`[Step4] Mobile value after fill: "${val}"`);
  } else {
    console.log('[Step4] Mobile input NOT found (name=userName)');
    // Try by position
    const allInputs = await f.$$('input[type="text"]');
    console.log(`[Step4] text inputs count: ${allInputs.length}`);
    for (const inp of allInputs) {
      const vis = await inp.isVisible().catch(() => false);
      const ph = await inp.getAttribute('placeholder');
      const name = await inp.getAttribute('name');
      console.log(`  text input vis=${vis} ph="${ph}" name="${name}"`);
    }
  }

  // 4b. DOB — try type() approach
  const dobInp = await f.$('#secondaryUserName');
  if (dobInp) {
    console.log('[Step4] Found DOB input (#secondaryUserName), trying type()...');
    await dobInp.click({ clickCount: 3 });
    await dobInp.type(`${DOB_DD}${DOB_MM}${DOB_YYYY}`, { delay: 60 });
    await page.waitForTimeout(500);
    const dobVal = await dobInp.evaluate(el => el.value);
    console.log(`[Step4] DOB value after type(): "${dobVal}"`);
  } else {
    console.log('[Step4] DOB #secondaryUserName NOT found, trying placeholder...');
    const dobAlt = await f.$('input[placeholder="DD/MM/YYYY"]');
    if (dobAlt) {
      await dobAlt.click({ clickCount: 3 });
      await dobAlt.type(`${DOB_DD}${DOB_MM}${DOB_YYYY}`, { delay: 60 });
      const dobVal = await dobAlt.evaluate(el => el.value);
      console.log(`[Step4] DOB value via placeholder: "${dobVal}"`);
    } else {
      console.log('[Step4] DOB input not found at all!');
      // Log all inputs
      const allInps = await f.$$('input');
      for (const inp of allInps) {
        const ph = await inp.getAttribute('placeholder');
        const id = await inp.getAttribute('id');
        const type = await inp.getAttribute('type');
        const vis = await inp.isVisible().catch(() => false);
        console.log(`  inp type=${type} id="${id}" ph="${ph}" vis=${vis}`);
      }
    }
  }

  // 4c. Checkboxes
  const checkboxes = await f.$$('input[type="checkbox"]');
  console.log(`[Step4] Found ${checkboxes.length} checkboxes`);
  for (const cb of checkboxes) {
    if (await cb.isVisible().catch(() => false)) {
      const checked = await cb.isChecked().catch(() => false);
      const name = await cb.getAttribute('name');
      console.log(`  checkbox name="${name}" checked=${checked}`);
      if (!checked) {
        await cb.click();
        await page.waitForTimeout(200);
        console.log(`  → clicked to check`);
      }
    }
  }

  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(SS_DIR, 'diag04-04-verify-filled.png') });

  // Check button states
  const btns4 = await f.$$('button');
  console.log('[Step4] Buttons:');
  for (const b of btns4) {
    const t = (await b.innerText().catch(() => '')).trim();
    const en = await b.isEnabled().catch(() => false);
    const vis = await b.isVisible().catch(() => false);
    if (t) console.log(`  button="${t}" enabled=${en} visible=${vis}`);
  }

  // Click Next
  let nextClicked = false;
  for (const b of btns4) {
    const t = (await b.innerText().catch(() => '')).trim();
    if (t === 'Next' && await b.isEnabled().catch(() => false)) {
      await b.click();
      nextClicked = true;
      console.log('[Step4] Clicked Next (Verify)');
      break;
    }
  }
  if (!nextClicked) console.log('[Step4] Next button NOT clicked (disabled or not found)');

  await page.waitForTimeout(3000);
  await page.screenshot({ path: path.join(SS_DIR, 'diag04-05-after-verify.png') });

  const bodyOTP = await f.evaluate(() => document.body.innerText);
  console.log('[Step5] Has OTP/verify code:', bodyOTP.toLowerCase().includes('otp') || bodyOTP.includes('verification code') || bodyOTP.includes('Enter your code'));
  console.log('[Step5] Body snippet:', bodyOTP.substring(0, 200));

  // Step 5: OTP — look for digit inputs
  const digitInputs = await f.$$('input[inputmode="numeric"], input[maxlength="1"], input[type="tel"]');
  console.log(`[Step5] Digit-like inputs: ${digitInputs.length}`);
  for (const di of digitInputs) {
    const ph = await di.getAttribute('placeholder');
    const ml = await di.getAttribute('maxlength');
    const im = await di.getAttribute('inputmode');
    const vis = await di.isVisible().catch(() => false);
    console.log(`  type=tel/numeric ph="${ph}" maxlength=${ml} inputmode="${im}" vis=${vis}`);
  }

  // Try OTP
  const otpInputs = await f.$$('input[maxlength="1"]');
  if (otpInputs.length >= 4) {
    console.log(`[Step5] Filling OTP with ${otpInputs.length} single-char inputs...`);
    for (let i = 0; i < Math.min(OTP.length, otpInputs.length); i++) {
      await otpInputs[i].click();
      await otpInputs[i].type(OTP[i]);
      await page.waitForTimeout(100);
    }
    await page.waitForTimeout(500);
    const btnsOTP = await f.$$('button');
    for (const b of btnsOTP) {
      const t = (await b.innerText().catch(() => '')).trim();
      const en = await b.isEnabled().catch(() => false);
      if (['Verify', 'Submit', 'Continue', 'Login', 'Sign in'].includes(t) && en) {
        console.log(`[Step5] Clicking OTP submit: "${t}"`);
        await b.click(); break;
      }
    }
    await page.waitForTimeout(3000);
    await page.screenshot({ path: path.join(SS_DIR, 'diag04-06-after-otp.png') });
  }

  // Check final state
  const finalBody = await f.evaluate(() => document.body.innerText);
  const cancelBtn = await f.$('[data-testid="consult-requested__cancel-button"]');
  console.log('[Final] Cancel button present:', cancelBtn !== null);
  console.log('[Final] Body snippet:', finalBody.substring(0, 300));
  await page.screenshot({ path: path.join(SS_DIR, 'diag04-07-final.png') });
});
