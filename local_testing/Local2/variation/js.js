(function () {
    try {
        /* Main variables */
        var debug = 0;
        var variation_name = "tt-williams-partner-lp"; // Variation name for tracking
        /* All Pure helper functions */
        // Function to wait for an element to appear in the DOM
        function waitForElement(selector, trigger, delayInterval, delayTimeout) {
            var interval = setInterval(function () {
                // Check if the element exists and trigger callback
                if (document && document.querySelector(selector) && document.querySelectorAll(selector).length > 0) {
                    clearInterval(interval);
                    trigger(); // Call the trigger function once the element is found
                }
            }, delayInterval); // Check every delayInterval milliseconds
            setTimeout(function () {
                clearInterval(interval); // Stop checking after delayTimeout
            }, delayTimeout);
        }
        // Function to add event listeners that work across all browsers (including IE 8)
        function live(selector, event, callback, context) {
            // Helper function to add event listeners for IE 8 and other browsers
            function addEvent(el, type, handler) {
                if (el.attachEvent) el.attachEvent("on" + type, handler); // IE 8
                else el.addEventListener(type, handler); // Other browsers
            }
            // Polyfill for matches method to ensure it works across browsers
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
            // Live binding helper using matchesSelector
            function live(selector, event, callback, context) {
                addEvent(context || document, event, function (e) {
                    var found,
                        el = e.target || e.srcElement;
                    // Loop through parent elements to find a match
                    while (el && el.matches && el !== context && !(found = el.matches(selector))) el = el.parentElement;
                    if (found) callback.call(el, e); // Call the callback if a match is found
                });
            }
            live(selector, event, callback, context); // Bind the event
        }
const itemsection = `
 <section class="thumbtack-section thumbtack-section-variation">

  <!-- Testimonials -->
  <div class="testimonials">
    <h2>Real results from real painters.</h2>
    <div class="testimonial-cards">
      <div class="card">
        <img src="https://cdn.optimizely.com/img/20611073899/ddcb9bf943e44ce698bdbc45101727a8.png " alt="Alex">
        
        <p>"I've tried many platforms, but Thumbtack is the only one I've consistently used for the past seven years because our goals are aligned—they succeed when I do."</p>
        <span>Juliano Da Cruz, Paint Lab Painting</span>
      </div>
      <div class="card">
       <img src="https://cdn.optimizely.com/img/20611073899/4cb900ee0360411baa4c157bdac32dee.png" alt="Beth">
      
      <p>"Thumbtack has helped me expand from a part time business to full time."</p>
        <span>Shaqueal Thomas, Courteney's Paints</span>
      </div>
      <div class="card">
        <img src="https://cdn.optimizely.com/img/20611073899/e15f8076b4cd4899bf86ec6141504773.png" alt="Mehdi">
        <p>"We invest our marketing budgets in
different streams, but the best return we get is from Thumbtack."</p>
        <span>Rafael Rodriguez, Dambrak Painting</span>
      </div>
    </div>
    <div class="testimonial-line"></div>
  </div>
  <!-- Calculator -->
  <div class="calculator">
    <h2>See your earning potential.</h2>
    <p>Use our Growth Calculator* to explore how your business could grow on Thumbtack. Enter your info into the calculator below to gain a clear view of what's possible. 
</p>
    <form>
      <h6> Tell us about your business. </h6>
       <p>How much do you typically charge per job? </p>
      <input type="text" placeholder="Enter $ amount">
      <p>How many jobs do you expect to complete each month?<p>
      <input type="text" placeholder="Enter number">
      <div class="earnings">
        <h5>Potential earnings.* </h5>
        <div class="item_secotion_price">
        <div>Projected monthly revenue: <br> <span class="monthly_revenue">$0</span></div>
        <div>Projected annual revenue: <br><span class="year_revanu">$0</span></div>
        </div>
      </div>
    </form>
    <div class="subhead_cta">
    <p>*This tool is for informational purposes only. Actual earnings depend on various factors, including job demand, competition, and business operations and are subject to applicable Platform Fees and/or discounts. Thumbtack does not guarantee any specific earnings outcome.</p>
    <a href="">Grow with Thumbtack</a>
    </div>
  </div>
  <!-- Community -->
  <div class="community">
    <h2>Get tips for success on Thumbtack. </h2>
    <p>Find out how to successfully complete jobs on Thumbtack and best practices.  </p>
     <a href="https://info.thumbtack.com/scale-with-confidence?utm_source=partner&utm_medium=partnerships&utm_campaign=sherwinwilliams">Get success tips</a>
  </div>
  <div class="TT_updatetext">
    <div class="Wrap_root__YXWM_">
      <p>**Total maximum value of free or discounted leads equivalent to $400. In order to receive $150 in free leads, Pro must activate Thumbtack services, set up targeting preferences including a form of payment, and add a review to their account. After receiving 2-requests, Pro will receive 25%-off their leads until they hit the next $250 in discounted leads. Free and discounted leads are not refundable. Your Thumbtack balance doesn't expire, has no cash value, and is subject to Thumbtack's <a href="https://www.thumbtack.com/terms">Terms of Use.</a> </p>
    </div>
  </div>
</section>`; 

const thumbtackHTML = `
  <section class="thumbtack-section">
    <div class="container">
      <h2 class="title Type_title1__CjAkY mb5 tl m_tc">How Thumbtack works:</h2>
      <div class="feature-row">
        <!-- Feature 1 -->
        <div class="feature-item">
          <img src="https://cdn.optimizely.com/img/20611073899/ee7b1498544c4c46a2fc362bc871c1b4.png" alt="Painting by Kay">
          <h3 class="Type_title6__pMyYO black">No subscription cost.</h3>
          <p class="ServiceCard_description__JpHs6">There's no charge to join, no annual fees and no membership fees.</p>
        </div>
        <!-- Feature 2 -->
        <div class="feature-item">
          <img src="https://cdn.optimizely.com/img/20611073899/7495f58f7cdb43ba81f08028f1955d53.png" alt="Steve B. chat">
          <h3 class="Type_title6__pMyYO black">High intent customers.</h3>
          <p class="ServiceCard_description__JpHs6">You'll receive leads from customers that choose you, with high intent to hire.</p>
        </div>
        <!-- Feature 3 -->
        <div class="feature-item">
          <img src="https://cdn.optimizely.com/img/20611073899/cda0bf5fa0e34284b5f2aeba92160196.png" alt="Insights dashboard">
          <h3 class="Type_title6__pMyYO black">Control and flexibility.</h3>
          <p class="ServiceCard_description__JpHs6">You control your pricing and budget for leads, which determines how many leads you get.</p>
        </div>
      </div>
       
    </div>
   </section>
`;
const itemsection1 = `
  <h2 class="title Type_title1__CjAkY mb5 tl m_tc Thumbtack_different ">How Thumbtack is different:</h2>
<tbody class="see-how-different_featureComparisonChart__20mnw shadow-400 pv3 m_pv5">
   <tr class="see-how-different_chartBorderGray__wlJS2 grid grid-flush bb tl items-end pb2 mh3 m_mh6">
      <th class="col-4">
         <p class="Type_text3__wyjTq black-300 ttu b">Features</p>
      </th>
      <th class="col-4 tc">
         <div class="see-how-different_ttLogo__c39ls">
            <svg aria-label="Thumbtack logo" width="120" height="17" viewBox="0 0 156 21" fill="currentColor">
               <path fill-rule="evenodd" d="M115.67 17.929c-1.403 0-2.089-.873-2.087-1.777 0-1.183.88-1.775 1.99-1.93l3.781-.54v.685c-.001 2.71-1.858 3.562-3.685 3.562zm.76-12.358c4.344 0 7.108 2.157 7.108 6.395v8.613h-3.996l.016-1.702c-.8 1.202-2.517 2.124-4.642 2.123-3.425-.001-5.511-2.214-5.51-4.612 0-2.741 2.121-4.267 4.796-4.64 0 0 4.393-.52 5.017-.605 0-1.809-1.687-2.219-3.368-2.219-1.722 0-3.091.601-4.15 1.31l-1.567-2.727c1.643-1.162 3.802-1.936 6.296-1.936zm-92.81 1.99c1.09-1.449 2.716-1.962 4.39-1.962 3.475 0 5.954 2.308 5.954 5.702v9.306h-4.122v-8.04c0-2.11-1.105-3.272-2.985-3.272-1.769 0-3.237 1.1-3.237 3.303v8.01h-4.123V0h4.123v7.56zM78.18 11.3v9.306h-4.106v-8.04c0-2.11-1.121-3.272-2.985-3.272-1.769 0-3.238 1.1-3.238 3.303v8.01H63.73v-8.04c0-2.112-1.105-3.273-2.985-3.273-1.768 0-3.237 1.1-3.237 3.303v8.01h-4.122V5.991h4.011V7.71c1.09-1.553 2.764-2.112 4.502-2.112 2.21 0 4.027.95 5.053 2.504 1.185-1.855 3.19-2.504 5.196-2.504 3.6 0 6.033 2.308 6.033 5.702zm18.46 1.99c0 4.39-3.191 7.693-7.408 7.693-2.116 0-3.585-.814-4.58-1.99v1.613h-4.027V.015h4.106v7.5c.995-1.146 2.432-1.916 4.485-1.916 4.233 0 7.423 3.304 7.423 7.693zm-12.028 0c0 2.309 1.596 4.028 3.933 4.028 2.432 0 3.948-1.795 3.948-4.027 0-2.233-1.516-4.027-3.948-4.027-2.337 0-3.933 1.72-3.933 4.027zm54.715-4.931l-2.97 2.368c-.93-.95-1.926-1.463-3.268-1.463-2.132 0-3.838 1.599-3.838 4.027 0 2.443 1.69 4.027 3.822 4.027 1.326 0 2.464-.573 3.332-1.478l2.938 2.398c-1.437 1.765-3.586 2.745-6.143 2.745-4.881 0-8.15-3.258-8.15-7.692 0-4.42 3.269-7.693 8.15-7.693 2.557 0 4.72.996 6.127 2.76zm15.828-2.368l-5.544 5.463L156 20.607h-5.015l-4.264-6.617-1.864 1.84v4.777h-4.122V.015h4.122v11.41l5.338-5.433h4.961zM46.632 19.038C45.542 20.486 43.916 21 42.242 21c-3.475 0-5.954-2.307-5.954-5.701V5.992h4.122v8.039c0 2.111 1.105 3.273 2.985 3.273 1.769 0 3.237-1.101 3.237-3.303V5.99h4.122v14.616h-4.122v-1.569zM97.184 5.992h2.243V1.648h4.107v4.344h4.568v3.5h-4.568v6.183c0 1.023.741 1.644 1.553 1.644.855 0 1.967-.514 1.967-.514l1.328 3.131s-1.411 1.032-4.564 1.032c-2.085 0-4.391-1.507-4.391-4.434V9.49h-2.243v-3.5zm-85.924-.4v9.284c0 1.6-.44 3.173-1.277 4.56l-.926 1.532-.925-1.533a8.815 8.815 0 0 1-1.278-4.56V7.56c1.094-1.453 2.727-1.968 4.406-1.968zM0 3.937V0h18.115v3.937H0z"></path>
            </svg>
         </div>
      </th>
      <th class="col-4 tc">
         <div class="Type_title3___voqu dn m_db black-300">Other Services</div>
         <div class="Type_title6__pMyYO db m_dn black-300">Others</div>
      </th>
   </tr>
   <tr class="see-how-different_featureComparisonChartRow__4ctV6 grid grid-flush">
      <td class="see-how-different_chartBorderGray__wlJS2 col-4 tl pv4 br pl3 pr3 m_pl6 items-center itemheading">
         <div class="Type_title5__9a0XV dn m_db">Customers choose pros directly</div>
         <div class="Type_title7__9t_vN db m_dn">Customers choose pros directly</div>
      </td>
      <td class="col-4 tc pv4 items-center crethumbimag">
        <img src="https://cdn.optimizely.com/img/20611073899/43aa1e79bf8d4c6bbf35482fa60f64d7.svgz">
      </td>
      <td class="col-4 tc pv4 pr3 m_pr6 items-center crethumbimag">
         <img src="https://cdn.optimizely.com/img/20611073899/0faa22d35df54eb8ac543c5a6b374f2e.svgz">
      </td>
   </tr>
   <tr class="see-how-different_featureComparisonChartRow__4ctV6 grid grid-flush itemheading">
      <td class="see-how-different_chartBorderGray__wlJS2 col-4 tl pv4 br pl3 pr3 m_pl6 items-center">
         <div class="Type_title5__9a0XV dn m_db">Pros control their pricing</div>
         <div class="Type_title7__9t_vN db m_dn">Pros control their pricing</div>
      </td>
      <td class="col-4 tc pv4 items-center crethumbimag">
        <img src="https://cdn.optimizely.com/img/20611073899/43aa1e79bf8d4c6bbf35482fa60f64d7.svgz">
      </td> 
      <td class="col-4 tc pv4 pr3 m_pr6 items-center crethumbimag">
         <img src="https://cdn.optimizely.com/img/20611073899/0faa22d35df54eb8ac543c5a6b374f2e.svgz">
      </td>
   </tr>
   <tr class="see-how-different_featureComparisonChartRow__4ctV6 grid grid-flush itemheading">
      <td class="see-how-different_chartBorderGray__wlJS2 col-4 tl pv4 br pl3 pr3 m_pl6 items-center">
         <div class="Type_title5__9a0XV dn m_db">Direct customer communication</div>
         <div class="Type_title7__9t_vN db m_dn">Direct customer communication</div>
      </td>
      <td class="col-4 tc pv4 items-center crethumbimag">
        <img src="https://cdn.optimizely.com/img/20611073899/43aa1e79bf8d4c6bbf35482fa60f64d7.svgz">
      </td>
      <td class="col-4 tc pv4 pr3 m_pr6 items-center crethumbimag">
         <img src="https://cdn.optimizely.com/img/20611073899/0faa22d35df54eb8ac543c5a6b374f2e.svgz">
      </td>
   </tr>
   <tr class="see-how-different_featureComparisonChartRow__4ctV6 grid grid-flush itemheading">
      <td class="see-how-different_chartBorderGray__wlJS2 col-4 tl pv4 br pl3 pr3 m_pl6 items-center">
         <div class="Type_title5__9a0XV dn m_db">Limited competition per lead</div>
         <div class="Type_title7__9t_vN db m_dn">Limited competition per lead</div>
      </td>
      <td class="col-4 tc pv4 items-center crethumbimag">
        <img src="https://cdn.optimizely.com/img/20611073899/43aa1e79bf8d4c6bbf35482fa60f64d7.svgz">
      </td>
      <td class="col-4 tc pv4 pr3 m_pr6 items-center crethumbimag">
         <img src="https://cdn.optimizely.com/img/20611073899/0faa22d35df54eb8ac543c5a6b374f2e.svgz">
      </td>
   </tr>
   <tr class="see-how-different_featureComparisonChartRow__4ctV6 grid grid-flush itemheading">
      <td class="see-how-different_chartBorderGray__wlJS2 col-4 tl pv4 br pl3 pr3 m_pl6 items-center">
         <div class="Type_title5__9a0XV dn m_db">No hidden fees or contracts</div>
         <div class="Type_title7__9t_vN db m_dn">No hidden fees or contracts</div>
      </td>
      <td class="col-4 tc pv4 items-center crethumbimag">
        <img src="https://cdn.optimizely.com/img/20611073899/43aa1e79bf8d4c6bbf35482fa60f64d7.svgz">
      </td>
      <td class="col-4 tc pv4 pr3 m_pr6 items-center crethumbimag">
         <img src="https://cdn.optimizely.com/img/20611073899/0faa22d35df54eb8ac543c5a6b374f2e.svgz">
      </td>
   </tr>
   <tr class="see-how-different_featureComparisonChartRow__4ctV6 grid grid-flush itemheading">
      <td class="see-how-different_chartBorderGray__wlJS2 col-4 tl pv4 br pl3 pr3 m_pl6 items-center">
         <div class="Type_title5__9a0XV dn m_db">Free pro community</div>
         <div class="Type_title7__9t_vN db m_dn">Free pro community</div>
      </td>
      <td class="col-4 tc pv4 items-center crethumbimag">
        <img src="https://cdn.optimizely.com/img/20611073899/43aa1e79bf8d4c6bbf35482fa60f64d7.svgz">
      </td>
      <td class="col-4 tc pv4 pr3 m_pr6 items-center crethumbimag">
         
         <img src="https://cdn.optimizely.com/img/20611073899/0faa22d35df54eb8ac543c5a6b374f2e.svgz">
      
      </td>
   </tr>
 
   
</tbody>` 
;

        /* Variation Init */
        function init() {
           
          document.querySelector("body").classList.add(variation_name);

          // CHANGE 1: Update page title for browser tab / link preview
          document.title = "Sherwin-Williams-Thumbtack";

          var h1 = document.querySelector('[class*="hero_heroInnerOffsetRight"] [class*="hero_heroTitle"]');
          if (h1) {
            var parts = h1.innerHTML.split('<br>');
            if (parts.length === 2) {
              parts[0] = 'Grow your business in ';
              h1.innerHTML = parts.join('<br>');
            }
          }
          var target = document.querySelector('html body [class*="hero_heroInnerOffsetRight"] [class*="hero_heroTitle"]');
          var alreadyExists = document.querySelector('.section_topimage');
      
          if (target && !alreadyExists) {
              target.insertAdjacentHTML('beforebegin', `
                  <div class="section_topimage">
                      <img class="desktop_image" src="https://cdn.optimizely.com/img/20611073899/41b8f28eaf21412d9eb8cbcb042ecf90.png">
                      <img class="mobile_image" src="https://cdn.optimizely.com/img/20611073899/19900e74574e4c778c65af6e48721caf.png">
                  </div>
              `);
          }
          const target1 = document.querySelector('[class*="see-how-different_seeHowDifferentSection"] [class*="Wrap_root"] .grid.grid-wide');
           if (target1 && !document.querySelector('.thumbtack-section')) {
           target1.insertAdjacentHTML('afterend', thumbtackHTML);
           }
           const inputField = document.querySelector('[placeholder="e.g. House cleaning"]');
           if (inputField) {
             inputField.setAttribute('placeholder', 'Enter the service you provide to get started.');
           }
           const targetTableBody = document.querySelector('[class*="see-how-different_featureComparisonTable"] > tbody');
const existingHeading = document.querySelector('.ttheading');
if (targetTableBody && !existingHeading) {
 targetTableBody.insertAdjacentHTML(
   'beforebegin',
   '<h2 class="title Type_title1__CjAkY mb5 tl m_tc ttheading">How Thumbtack is different:</h2>'
 );
}
waitForElement('[class*="see-how-different_featureComparisonTable"]', function() {
              
   document.querySelector('[class*="see-how-different_featureComparisonTable"]').innerHTML = itemsection1;
}, 100, 15000);

waitForElement(
  '[class*="hero_heroInnerContainer"] [class*="hero_heroInnerOffsetRight"] .br-pill [class*="Type_text1"]',
  function() {
    var el = document.querySelector('[class*="hero_heroInnerContainer"] [class*="hero_heroInnerOffsetRight"] .br-pill [class*="Type_text1"]');
    
    if (el) {
      el.innerHTML = 'In partnership with Sherwin-Williams. <a href="https://www.thumbtack.com/sales?utm_source=partner&utm_medium=partnerships&utm_campaign=sherwinwilliams">Book a call with our team.</a>';
    }
  },
  100,
  15000
);

 

waitForElement('[class*="hero_heroTitle"] + p', function() {
              
document.querySelector('[class*="hero_heroTitle"] + p').innerText = 'Receive up to $400 in free or discounted leads when  you set up your profile as a Sherwin-Williams pro.**';
}, 100, 15000);


 
waitForElement('[class*="see-how-different_seeHowDifferentSection"] > div', function () {
   const target = document.querySelector('[class*="see-how-different_seeHowDifferentSection"] > div');
 
   // Check if target exists and button not already added
   if (target && !document.querySelector('#ttsearch-location-input')) {
     target.insertAdjacentHTML('afterend', '<div id="ttsearch-location-input">Sign up for free</div>');
 
     // Add scroll to top on click
     const cta = document.querySelector('#ttsearch-location-input');
     if (cta) {
       cta.addEventListener('click', function () {
         window.scrollTo({ top: 0, behavior: 'smooth' });
       });
     }
   }
 }, 100, 15000);

 waitForElement('[data-testid="get-started-button-mobile"] span', function () {
     document.querySelector('[data-testid="get-started-button-mobile"] span').innerHTML = "Sign up for free"
 }, 100, 15000);
 if (window.innerWidth < 768) {
   waitForElement('#new-pro-lp-cs', function () {
     document.querySelector('#new-pro-lp-cs').setAttribute("placeholder", "Enter the service you provide.");
   }, 100, 15000);
 }

// Add the new section after the "See how Thumbtack is different" section

          
          waitForElement('[data-testid="get-started-button-mobile"] span', function () {
            
            if(!document.querySelector('.thumbtack-section-variation')){
              document.querySelector('[class*="see-how-different_seeHowDifferentSection"]').insertAdjacentHTML("afterend", itemsection);
             }
        
          }, 100, 15000);

        //   document.querySelector('.tt_clicksignup').addEventListener('click', function () {
        //     document.querySelector('[class*="get-started_titlePadding"] button').click(); // Trigger the click on the "Get Started" button
        //   });

         

          const perJobInput = document.querySelector('input[placeholder="Enter $ amount"]');
          const jobsPerMonthInput = document.querySelector('input[placeholder="Enter number"]');
          const monthlyRevenueEl = document.querySelector('.monthly_revenue');
          const yearlyRevenueEl = document.querySelector('.year_revanu');
          const ctaButton = document.querySelector('.subhead_cta a');
          
          // Create error message elements (but don't show them initially)
          function createErrorElement(input) {
              let errorEl = input.nextElementSibling;
              if (!errorEl || !errorEl.classList.contains('input-error')) {
                  errorEl = document.createElement('div');
                  errorEl.className = 'input-error';
                  errorEl.style.color = 'red';
                  errorEl.style.fontSize = '14px';
                  errorEl.style.marginTop = '5px';
                  errorEl.style.display = 'none'; // Hide initially
                  input.insertAdjacentElement('afterend', errorEl);
              }
              return errorEl;
          }
          
          const perJobErrorEl = createErrorElement(perJobInput);
          const jobsErrorEl = createErrorElement(jobsPerMonthInput);
          
          function cleanCurrencyInput(value) {
              return parseFloat(value.replace(/[^0-9.]/g, ''));
          }
          
          function calculateEarnings() {
              const perJobValue = perJobInput.value.trim();
              const jobsValue = jobsPerMonthInput.value.trim();
          
              let hasError = false;
          
              // Show error if per job is empty
              if (perJobValue === '') {
                  perJobErrorEl.textContent = 'Please add value';
                  perJobErrorEl.style.display = 'block';
                  hasError = true;
              } else {
                  perJobErrorEl.textContent = '';
                  perJobErrorEl.style.display = 'none';
              }
          
              // Show error if jobs/month is empty
              if (jobsValue === '') {
                  jobsErrorEl.textContent = 'Please add value';
                  jobsErrorEl.style.display = 'block';
                  hasError = true;
              } else {
                  jobsErrorEl.textContent = '';
                  jobsErrorEl.style.display = 'none';
              }
          
              if (!hasError) {
                  const perJobCost = cleanCurrencyInput(perJobValue);
                  const jobsPerMonth = parseFloat(jobsValue);
          
                  if (!isNaN(perJobCost) && !isNaN(jobsPerMonth)) {
                      const monthlyRevenue = perJobCost * jobsPerMonth;
                      const yearlyRevenue = monthlyRevenue * 12;
          
                      monthlyRevenueEl.textContent = "$" + monthlyRevenue.toLocaleString();
                      yearlyRevenueEl.textContent = "$" + yearlyRevenue.toLocaleString();
                  } else {
                      monthlyRevenueEl.textContent = "$0";
                      yearlyRevenueEl.textContent = "$0";
                  }
              } else {
                  monthlyRevenueEl.textContent = "$0";
                  yearlyRevenueEl.textContent = "$0";
              }
          }
          
          // Reset revenue only — no error shown here
          function resetRevenueOnEmpty() {
              if (perJobInput.value.trim() === '' || jobsPerMonthInput.value.trim() === '') {
                  monthlyRevenueEl.textContent = "$0";
                  yearlyRevenueEl.textContent = "$0";
              }
          }
          
          // CTA click triggers validation and calculation
          ctaButton.addEventListener('click', function (e) {
              e.preventDefault();
              calculateEarnings();
          });
          
          // Input events only clear revenue (no errors)
          perJobInput.addEventListener('input', resetRevenueOnEmpty);
          jobsPerMonthInput.addEventListener('input', resetRevenueOnEmpty);
          

          

      
 
         
        
          }
        
    var initInterval = setInterval(function () {
            if (document.body) {
                init(); 
            }
        }, 50); 
        
        /* Failsafe timeout after 10 seconds (10,000 milliseconds) */
        setTimeout(function () {
            clearInterval(initInterval);
        }, 10000);
        
    } catch (e) {
        if (debug) console.log(e, "error in Test" + variation_name); // Log errors if debug is enabled
    }
})();