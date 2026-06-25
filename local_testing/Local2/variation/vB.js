(function() {
    try {
        /* Main variables */
        var debug = 0;
        var variation_name = "Antonio_Roofing";

        /* All Pure helper functions */
        function waitForElement(selector, trigger, delayInterval, delayTimeout) {
            var interval = setInterval(function() {
                if (document && document.querySelector(selector) && document.querySelectorAll(selector).length > 0) {
                    clearInterval(interval);
                    trigger();
                }
            }, delayInterval);
            setTimeout(function() {
                clearInterval(interval);
            }, delayTimeout);
        }

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

        const footer = `
<div class="TT-global-footer">
   <div>
      <div class="bt b-gray-300 pt5">
         <div class="tt_footer_max_width">
            <div class="m_flex s_pt5 m_pt4 m_flex-grow-0">
               <div class="flex-1 m_flex-1 s_bn pb4">
                  <h3 class="tt_subhead_copy">Related cost information</h3>
                  <div class="tt_item_section">
                    <ul><li class="mb2 pb1"><a class="plain_plain__uVCE8 plain_plainThemeSecondary__5TVf_ plain_plainWidthAuto__gL9F8" href="/p/roof-cleaning-cost" target="_self">Roof cleaning cost</a></li><li class="mb2 pb1"><a class="plain_plain__uVCE8 plain_plainThemeSecondary__5TVf_ plain_plainWidthAuto__gL9F8" href="/p/power-washing-prices" target="_self">Power washing prices</a></li><li class="mb2 pb1"><a class="plain_plain__uVCE8 plain_plainThemeSecondary__5TVf_ plain_plainWidthAuto__gL9F8" href="/p/home-inspection-cost" target="_self">Home inspection cost</a></li><li class="mb2 pb1"><a class="plain_plain__uVCE8 plain_plainThemeSecondary__5TVf_ plain_plainWidthAuto__gL9F8" href="/p/gutter-cleaning-prices" target="_self">Gutter cleaning prices</a></li><li class="mb2 pb1"><a class="plain_plain__uVCE8 plain_plainThemeSecondary__5TVf_ plain_plainWidthAuto__gL9F8" href="/p/roof-replacement-cost" target="_self">Roof replacement cost</a></li><li class="mb2 pb1"><a class="plain_plain__uVCE8 plain_plainThemeSecondary__5TVf_ plain_plainWidthAuto__gL9F8" href="/p/dryer-vent-installation-cost" target="_self">Dryer vent installation cost</a></li><li class="mb2 pb1"><a class="plain_plain__uVCE8 plain_plainThemeSecondary__5TVf_ plain_plainWidthAuto__gL9F8" href="/p/how-much-general-contractors-charge" target="_self">How much general contractors charge</a></li><li class="mb2 pb1"><a class="plain_plain__uVCE8 plain_plainThemeSecondary__5TVf_ plain_plainWidthAuto__gL9F8" href="/p/art-installation-cost" target="_self">Art installation cost</a></li><li class="mb2 pb1"><a class="plain_plain__uVCE8 plain_plainThemeSecondary__5TVf_ plain_plainWidthAuto__gL9F8" href="/p/sink-repair-cost" target="_self">Sink repair cost</a></li><li class="mb2 pb1"><a class="plain_plain__uVCE8 plain_plainThemeSecondary__5TVf_ plain_plainWidthAuto__gL9F8" href="/p/furniture-assembly-cost" target="_self">Furniture assembly cost</a></li><li class="mb2 pb1"><a class="plain_plain__uVCE8 plain_plainThemeSecondary__5TVf_ plain_plainWidthAuto__gL9F8" href="/p/christmas-light-installation-prices" target="_self">Christmas light installation prices</a></li><li class="mb2 pb1"><a class="plain_plain__uVCE8 plain_plainThemeSecondary__5TVf_ plain_plainWidthAuto__gL9F8" href="/p/ac-service-cost" target="_self">AC service cost</a></li><li class="mb2 pb1"><a class="plain_plain__uVCE8 plain_plainThemeSecondary__5TVf_ plain_plainWidthAuto__gL9F8" href="/p/patio-cost" target="_self">Patio cost</a></li><li class="mb2 pb1"><a class="plain_plain__uVCE8 plain_plainThemeSecondary__5TVf_ plain_plainWidthAuto__gL9F8" href="/p/bed-frame-assembly-cost" target="_self">Bed frame assembly cost</a></li><li class="mb2 pb1"><a class="plain_plain__uVCE8 plain_plainThemeSecondary__5TVf_ plain_plainWidthAuto__gL9F8" href="/p/handyman-prices" target="_self">Handyman prices</a></li></ul>
                     <div class="Type_text2__2_pIm b mt2"><button class="tt_toggle_cta" type="button">Show less</button></div>
                  </div>
               </div>
               <div class="flex-1 m_flex-1 s_bn pb4">
                  <h3 class="tt_subhead_copy">Popular in San Antonio</h3>
                  <div class="tt_item_section">
                     <ul><li class="mb2 pb1"><a class="plain_plain__uVCE8 plain_plainThemeSecondary__5TVf_ plain_plainWidthAuto__gL9F8" href="/tx/san-antonio/electricians" target="_self">Electricians San Antonio</a></li><li class="mb2 pb1"><a class="plain_plain__uVCE8 plain_plainThemeSecondary__5TVf_ plain_plainWidthAuto__gL9F8" href="/tx/san-antonio/movers" target="_self">Movers San Antonio</a></li><li class="mb2 pb1"><a class="plain_plain__uVCE8 plain_plainThemeSecondary__5TVf_ plain_plainWidthAuto__gL9F8" href="/tx/san-antonio/cheap-lawn-care-services" target="_self">Cheap lawn care services San Antonio</a></li><li class="mb2 pb1"><a class="plain_plain__uVCE8 plain_plainThemeSecondary__5TVf_ plain_plainWidthAuto__gL9F8" href="/tx/san-antonio/duct-cleaning" target="_self">Duct cleaning San Antonio</a></li><li class="mb2 pb1"><a class="plain_plain__uVCE8 plain_plainThemeSecondary__5TVf_ plain_plainWidthAuto__gL9F8" href="/tx/san-antonio/window-air-conditioner-repair" target="_self">Window air conditioner repair San Antonio</a></li><li class="mb2 pb1"><a class="plain_plain__uVCE8 plain_plainThemeSecondary__5TVf_ plain_plainWidthAuto__gL9F8" href="/tx/san-antonio/private-investigators" target="_self">Private investigators San Antonio</a></li><li class="mb2 pb1"><a class="plain_plain__uVCE8 plain_plainThemeSecondary__5TVf_ plain_plainWidthAuto__gL9F8" href="/tx/san-antonio/appliance-repair" target="_self">Appliance repair San Antonio</a></li><li class="mb2 pb1"><a class="plain_plain__uVCE8 plain_plainThemeSecondary__5TVf_ plain_plainWidthAuto__gL9F8" href="/tx/san-antonio/house-cleaning" target="_self">House cleaning San Antonio</a></li><li class="mb2 pb1"><a class="plain_plain__uVCE8 plain_plainThemeSecondary__5TVf_ plain_plainWidthAuto__gL9F8" href="/tx/san-antonio/fitness-equipment-assembly" target="_self">Fitness equipment assembly San Antonio</a></li><li class="mb2 pb1"><a class="plain_plain__uVCE8 plain_plainThemeSecondary__5TVf_ plain_plainWidthAuto__gL9F8" href="/tx/san-antonio/appliance-installers" target="_self">Appliance installers San Antonio</a></li><li class="mb2 pb1"><a class="plain_plain__uVCE8 plain_plainThemeSecondary__5TVf_ plain_plainWidthAuto__gL9F8" href="/tx/san-antonio/affordable-photographers" target="_self">Affordable photographers San Antonio</a></li><li class="mb2 pb1"><a class="plain_plain__uVCE8 plain_plainThemeSecondary__5TVf_ plain_plainWidthAuto__gL9F8" href="/tx/san-antonio/packing-services" target="_self">Packing services San Antonio</a></li><li class="mb2 pb1"><a class="plain_plain__uVCE8 plain_plainThemeSecondary__5TVf_ plain_plainWidthAuto__gL9F8" href="/tx/san-antonio/water-softener-installation" target="_self">Water softener installation San Antonio</a></li><li class="mb2 pb1"><a class="plain_plain__uVCE8 plain_plainThemeSecondary__5TVf_ plain_plainWidthAuto__gL9F8" href="/tx/san-antonio/frigidaire-repair" target="_self">Frigidaire repair San Antonio</a></li><li class="mb2 pb1"><a class="plain_plain__uVCE8 plain_plainThemeSecondary__5TVf_ plain_plainWidthAuto__gL9F8" href="/tx/san-antonio/shrub-trimming" target="_self">Shrub trimming San Antonio</a></li></ul>
                     <div class="Type_text2__2_pIm b mt2"><button class="tt_toggle_cta" type="button">Show less</button></div>
                  </div>
               </div>
               <div class="flex-1 m_flex-1 s_bn pb4">
                  <h3 class="tt_subhead_copy">You might also like</h3>
                  <div class="tt_item_section">
                     <ul><li class="mb2 pb1"><a class="plain_plain__uVCE8 plain_plainThemeSecondary__5TVf_ plain_plainWidthAuto__gL9F8" href="/k/roofing/near-me" target="_self">Roofing near me</a></li><li class="mb2 pb1"><a class="plain_plain__uVCE8 plain_plainThemeSecondary__5TVf_ plain_plainWidthAuto__gL9F8" href="/k/roof-repair/near-me" target="_self">Roof repair near me</a></li><li class="mb2 pb1"><a class="plain_plain__uVCE8 plain_plainThemeSecondary__5TVf_ plain_plainWidthAuto__gL9F8" href="/k/soffit-and-fascia/near-me" target="_self">Soffit and fascia near me</a></li><li class="mb2 pb1"><a class="plain_plain__uVCE8 plain_plainThemeSecondary__5TVf_ plain_plainWidthAuto__gL9F8" href="/k/roof-cleaning/near-me" target="_self">Roof cleaning near me</a></li><li class="mb2 pb1"><a class="plain_plain__uVCE8 plain_plainThemeSecondary__5TVf_ plain_plainWidthAuto__gL9F8" href="/k/metal-roof-contractors/near-me" target="_self">Metal roof contractors near me</a></li><li class="mb2 pb1"><a class="plain_plain__uVCE8 plain_plainThemeSecondary__5TVf_ plain_plainWidthAuto__gL9F8" href="/k/general-contractors/near-me" target="_self">General contractors near me</a></li><li class="mb2 pb1"><a class="plain_plain__uVCE8 plain_plainThemeSecondary__5TVf_ plain_plainWidthAuto__gL9F8" href="/k/rain-gutter-installers/near-me" target="_self">Rain gutter installers near me</a></li><li class="mb2 pb1"><a class="plain_plain__uVCE8 plain_plainThemeSecondary__5TVf_ plain_plainWidthAuto__gL9F8" href="/k/gutter-cleaning/near-me" target="_self">Gutter cleaning near me</a></li><li class="mb2 pb1"><a class="plain_plain__uVCE8 plain_plainThemeSecondary__5TVf_ plain_plainWidthAuto__gL9F8" href="/k/commercial-roofing/near-me" target="_self">Commercial roofing near me</a></li><li class="mb2 pb1"><a class="plain_plain__uVCE8 plain_plainThemeSecondary__5TVf_ plain_plainWidthAuto__gL9F8" href="/k/appraisers/near-me" target="_self">Appraisers near me</a></li><li class="mb2 pb1"><a class="plain_plain__uVCE8 plain_plainThemeSecondary__5TVf_ plain_plainWidthAuto__gL9F8" href="/k/seamless-gutter-installation/near-me" target="_self">Seamless gutter installation near me</a></li><li class="mb2 pb1"><a class="plain_plain__uVCE8 plain_plainThemeSecondary__5TVf_ plain_plainWidthAuto__gL9F8" href="/k/gutters/near-me" target="_self">Gutters near me</a></li><li class="mb2 pb1"><a class="plain_plain__uVCE8 plain_plainThemeSecondary__5TVf_ plain_plainWidthAuto__gL9F8" href="/k/home-inspection/near-me" target="_self">Home inspection near me</a></li><li class="mb2 pb1"><a class="plain_plain__uVCE8 plain_plainThemeSecondary__5TVf_ plain_plainWidthAuto__gL9F8" href="/k/pressure-washing/near-me" target="_self">Pressure washing near me</a></li><li class="mb2 pb1"><a class="plain_plain__uVCE8 plain_plainThemeSecondary__5TVf_ plain_plainWidthAuto__gL9F8" href="/k/gutter-repair/near-me" target="_self">Gutter repair near me</a></li></ul>
                     <div class="Type_text2__2_pIm b mt2"><button class="tt_toggle_cta" type="button">Show less</button></div>
                  </div>
               </div>
               <div class="flex-1 m_flex-1 s_bn pb4">
                  <h3 class="tt_subhead_copy">In other nearby areas</h3>
                  <div class="tt_item_section">
                     <ul><li class="mb2 pb1"><a class="plain_plain__uVCE8 plain_plainThemeSecondary__5TVf_ plain_plainWidthAuto__gL9F8" href="/tx/schertz/roofing" target="_self">Schertz roofing</a></li><li class="mb2 pb1"><a class="plain_plain__uVCE8 plain_plainThemeSecondary__5TVf_ plain_plainWidthAuto__gL9F8" href="/tx/new-braunfels/roofing" target="_self">New Braunfels roofing</a></li><li class="mb2 pb1"><a class="plain_plain__uVCE8 plain_plainThemeSecondary__5TVf_ plain_plainWidthAuto__gL9F8" href="/tx/seguin/roofing" target="_self">Seguin roofing</a></li><li class="mb2 pb1"><a class="plain_plain__uVCE8 plain_plainThemeSecondary__5TVf_ plain_plainWidthAuto__gL9F8" href="/tx/san-marcos/roofing" target="_self">San Marcos roofing</a></li><li class="mb2 pb1"><a class="plain_plain__uVCE8 plain_plainThemeSecondary__5TVf_ plain_plainWidthAuto__gL9F8" href="/tx/kerrville/roofing" target="_self">Kerrville roofing</a></li><li class="mb2 pb1"><a class="plain_plain__uVCE8 plain_plainThemeSecondary__5TVf_ plain_plainWidthAuto__gL9F8" href="/tx/circle-c-ranch/roofing" target="_self">Circle C Ranch roofing</a></li><li class="mb2 pb1"><a class="plain_plain__uVCE8 plain_plainThemeSecondary__5TVf_ plain_plainWidthAuto__gL9F8" href="/tx/austin/roofing" target="_self">Austin roofing</a></li><li class="mb2 pb1"><a class="plain_plain__uVCE8 plain_plainThemeSecondary__5TVf_ plain_plainWidthAuto__gL9F8" href="/tx/uvalde/roofing" target="_self">Uvalde roofing</a></li><li class="mb2 pb1"><a class="plain_plain__uVCE8 plain_plainThemeSecondary__5TVf_ plain_plainWidthAuto__gL9F8" href="/tx/cedar-park/roofing" target="_self">Cedar Park roofing</a></li><li class="mb2 pb1"><a class="plain_plain__uVCE8 plain_plainThemeSecondary__5TVf_ plain_plainWidthAuto__gL9F8" href="/tx/pflugerville/roofing" target="_self">Pflugerville roofing</a></li><li class="mb2 pb1"><a class="plain_plain__uVCE8 plain_plainThemeSecondary__5TVf_ plain_plainWidthAuto__gL9F8" href="/tx/round-rock/roofing" target="_self">Round Rock roofing</a></li><li class="mb2 pb1"><a class="plain_plain__uVCE8 plain_plainThemeSecondary__5TVf_ plain_plainWidthAuto__gL9F8" href="/tx/georgetown/roofing" target="_self">Georgetown roofing</a></li><li class="mb2 pb1"><a class="plain_plain__uVCE8 plain_plainThemeSecondary__5TVf_ plain_plainWidthAuto__gL9F8" href="/tx/victoria/roofing" target="_self">Victoria roofing</a></li></ul>
                     <div class="Type_text2__2_pIm b mt2"><button class="tt_toggle_cta" type="button">Show less</button></div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   </div>
   
</div>
`;

        const bannersection = `<div class="w-100 z-1 relative hero-header_root__qfw8c Cre_banner ">
   <div class="relative m_absolute hero-header_heroHeaderHeight__nr0jz hero-header_heroContainer__WLxGu">
      <picture class="Image_picture__9nTha">
         <source type="image/webp" srcset="https://production-next-images-cdn.thumbtack.com/i/302056149247590580/width/120.webp 120w,https://production-next-images-cdn.thumbtack.com/i/302056149247590580/width/320.webp 320w,https://production-next-images-cdn.thumbtack.com/i/302056149247590580/width/400.webp 400w,https://production-next-images-cdn.thumbtack.com/i/302056149247590580/width/640.webp 640w,https://production-next-images-cdn.thumbtack.com/i/302056149247590580/width/768.webp 768w,https://production-next-images-cdn.thumbtack.com/i/302056149247590580/width/1024.webp 1024w,https://production-next-images-cdn.thumbtack.com/i/302056149247590580/width/1366.webp 1366w,https://production-next-images-cdn.thumbtack.com/i/302056149247590580/width/1600.webp 1600w,https://production-next-images-cdn.thumbtack.com/i/302056149247590580/width/1920.webp 1920w,https://production-next-images-cdn.thumbtack.com/i/302056149247590580/width/2200.webp 2200w,https://production-next-images-cdn.thumbtack.com/i/302056149247590580/width/2350.webp 2350w,https://production-next-images-cdn.thumbtack.com/i/302056149247590580/width/2560.webp 2560w" sizes="100vw">
         <img sizes="100vw" srcset="https://production-next-images-cdn.thumbtack.com/i/302056149247590580/width/120.jpeg 120w,https://production-next-images-cdn.thumbtack.com/i/302056149247590580/width/320.jpeg 320w,https://production-next-images-cdn.thumbtack.com/i/302056149247590580/width/400.jpeg 400w,https://production-next-images-cdn.thumbtack.com/i/302056149247590580/width/640.jpeg 640w,https://production-next-images-cdn.thumbtack.com/i/302056149247590580/width/768.jpeg 768w,https://production-next-images-cdn.thumbtack.com/i/302056149247590580/width/1024.jpeg 1024w,https://production-next-images-cdn.thumbtack.com/i/302056149247590580/width/1366.jpeg 1366w,https://production-next-images-cdn.thumbtack.com/i/302056149247590580/width/1600.jpeg 1600w,https://production-next-images-cdn.thumbtack.com/i/302056149247590580/width/1920.jpeg 1920w,https://production-next-images-cdn.thumbtack.com/i/302056149247590580/width/2200.jpeg 2200w,https://production-next-images-cdn.thumbtack.com/i/302056149247590580/width/2350.jpeg 2350w,https://production-next-images-cdn.thumbtack.com/i/302056149247590580/width/2560.jpeg 2560w" src="https://production-next-images-cdn.thumbtack.com/i/302056149247590580/width/1600.jpeg" height="500px" alt="Find a roofing professional in your area" style="object-fit:cover;object-position:center" fetchpriority="high" class="Image_imageStart__rFoNE Image_imageEnd__P5092" data-first-enter-image="true">
      </picture>
      <div class="absolute top-0 bottom-0 w-100">
         <div class="hero_section absolute w-100 hero-header_imageOverlayGradient__mvRlA hero-header_heroHeaderHeight__nr0jz"></div>
         <div class="Wrap_root__YXWM_">
            <div class="pv3 relative z-1 m_dn white hero_header_parent_mobile flex flex-column items-start justify-center hero-header_heroHeaderHeight__nr0jz">
               <h2 class="Type_title2__gGlGa mb3 hero_header_mobile pre-line">Find a roofing professional in your area</h2>
               <div class="b dib nowrap white bg-indigo  br-pill pv2 ph3 mv2"><button class="plain_plain__uVCE8 plain_plainThemeInherit__ruRRY plain_plainWidthAuto__gL9F8" type="button">17 near you</button></div>
            </div>
         </div>
      </div>
   </div>
   <div class="hero_section m_relative left0 w-100">
      <div class="hero-header-filters_wrap__XsAmU">
         <div class="m_pb4 m_pr4 m_mw7 bg-white m_pl4" style="padding-top:24px">
            <div class="pb2 dn m_flex items-center justify-between hero_header_parent">
               <h2 class="Type_title2__gGlGa pr3 hero_header pre-line">Find a roofing professional in your area</h2>
               <div class="flex-none nowrap bg-indigo pv2 ph3 br-left br-pill -mr4 b white"><button class="plain_plain__uVCE8 plain_plainThemeInherit__ruRRY plain_plainWidthAuto__gL9F8" data-test="hero-filters-cta" type="button">17 near you</button></div>
            </div>
            <p class="Type_text1__634gq mb3 black-300">Confirm your location to see quality pros near you.</p>
            <div class="compact-filters_wrapper__3Lt1_">
               <div>
                  <form id="uniqueId2">
                     <label for="zip-code" class="visually-hidden">Zip code</label>
                     <div class="TextInput_root__P9LZ5 TextInput_rootUiStateDefault___kfA0">
                        <div class="TextInput_inputInnerElement___hAVm">
                           <div class="TextInput_inputIconContainer__cQemg TextInput_inputIconContainerPositionLeftSizeLarge__4yzfk" style="color:inherit">
                              <svg height="28" width="28" fill="currentColor" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg"><path d="M5 11.25c0 5.244 7.389 12.813 8.231 13.825L14 26l.77-.925C15.612 24.063 23 16.512 23 11.25 23 5.988 19.909 2 14 2c-5.908 0-9 4.006-9 9.25zm2 0C7 7.758 9.191 4 14 4c4.81 0 7 3.758 7 7.25 0 3.217-4.51 8.46-7 11.598-2.489-3.137-7-8.224-7-11.598zM14 7c-2.206 0-4 1.794-4 4s1.794 4 4 4 4-1.794 4-4-1.794-4-4-4zm0 6c-1.103 0-2-.897-2-2s.897-2 2-2 2 .897 2 2-.897 2-2 2z"></path></svg>
                              <div class="b zipcode-filter_inputDescription__pxGHd">Zip code</div>
                           </div>
                        </div>
                        <input class="TextInput_input__piJRN TextInput_inputSizeLarge__c6G4v TextInput_inputInnerLeft__CREPe" placeholder="Zip code" name="zip_code" type="text" id="zip-code" inputmode="numeric" pattern="[0-9]*" maxlength="5" autocomplete="postal-code" value="78201">
                        <div class="TextInput_inputStyles__cwEPs TextInput_inputStylesRoundedBordersLeft__iSTcm TextInput_inputStylesRoundedBordersRight__DKtzE TextInput_inputStylesUiStateDefault__BJDOJ"></div>
                     </div>
                  </form>
               </div>
            </div>
            <div class="mt3"><button class="themed_themedButton__UKQVj themed_themedButtonRoundedBordersLeft___blLq themed_themedButtonRoundedBordersRight__d0G5C themed_themedButtonThemePrimary__pd6_C themed_themedButtonWidthFull__vvqNZ" data-test="hero-filters-cta" type="button"><span class="themed_flexWrapper__MQCSr themed_flexWrapperSizeLarge__fZ1Jn">Find a pro</span></button></div>
         </div>
      </div>
   </div>
</div>`;




        const faqs = [{
                id: "396134836893327372",
                question: "Is it worth it to hire a roofer?",
                answer: `<p>There are several reasons why it's worth it to <a href="https://www.thumbtack.com/k/roofing/near-me">hire a professional roofer</a> instead of attempting it yourself. The first is safety. Roofing is inherently dangerous, as a fall from a roof could seriously injure or kill you. Roofers have specialized equipment and training to help prevent accidents.&nbsp;&nbsp;</p><p>Next is experience. Roofers know how to spot problems (leaks, missing shingles, moss or mold growth, etc.)&nbsp; in your roof that could potentially save you from costly repairs down the road.&nbsp;</p><p>And finally, roofers save you time by getting the job done quickly and with a high degree of quality.</p>`
            },
            {
                id: "395686130054381573",
                question: "How do you know when you need a new roof?",
                answer: `<p>Some of the signs that indicate you need a new roof include cupping, warping and peeling asphalt shingles, as well as cracks on certain shingles. Other warning signs may include:</p><ul><li>Leakage</li><li>Exposed nails&nbsp;</li><li>Missing granules</li><li>Droopy, sagging roof</li><li>Moss, mold or fungi growth&nbsp;</li></ul><p>A metal roof may need to be replaced when it grows rusty and begins leaking. Tile roofs made of clay, slate or concrete need repairs when cracked. Cleaning and inspecting the roof regularly can help prevent major damage from occurring.&nbsp;</p><p>Contact the <a href="https://www.thumbtack.com/k/roofing/near-me">best roofers near you</a> to inspect, repair or replace your roof.</p>`
            },
            {
                id: "395685811052584961",
                question: "Do you tip roofers?",
                answer: `<p>It's not customary or required to tip roofers. This doesn't mean that you shouldn't tip, but it is generally not expected. If you do decide to tip, you can give the tip to the foreman or distribute it yourself.&nbsp;</p><p>Another idea to show your appreciation is to surprise the crew with coffee, water, snacks, breakfast or lunch when they arrive at the worksite.&nbsp;</p>`
            },
            {
                id: "395686033921032203",
                question: "How do I choose the best roofing contractor?",
                answer: `<p>Choosing a roofer starts by reading reviews online. Compare customer ratings of roofing contractors and companies to identify pros with a good track record of craftsmanship and customer relations. Some reviews may also have photos of completed roofing jobs.</p><p>Many states require a license for someone to do roofing work, so make sure the companies you're considered are licensed. Also, look for contractors and companies with several years of experience.&nbsp;</p><p>Before you make your final choice, <a href="https://www.thumbtack.com/k/roofing/near-me">contact several roofers near you</a> to get free estimates and quotes. Ultimately, choose the roofer that will do high-quality work for a reasonable price.&nbsp;</p>`
            },
            {
                id: "395685941063286789",
                question: "Does homeowners insurance cover roof replacement?",
                answer: `<p>Homeowners insurance generally covers roof replacement if the roof is damaged by a natural disaster or a sudden accident, according to <a href="https://www.investopedia.com/ask/answers/111815/does-homeowners-insurance-cover-roof-replacement.asp" target="_blank" rel="noopener">Investopedia</a>. However, insurance companies often won't cover roof replacement costs if the roof is older than 20 years. Read your insurance policy to find out what types of roof repairs or damages are covered.</p>`
            },
           {
    id: "395686521758277642",
    question: "What is the best roofing material?",
    answer: `<p>The best roofing material for your home will depend on your budget and what you're looking for. If you want a roof that has longevity, consider the following lifespans for different materials:&nbsp;</p><table><tbody><tr><td><strong>Roofing material</strong></td><td><strong>Lifespan</strong></td></tr><tr><td>Asphalt</td><td>20 years</td></tr><tr><td>Metal</td><td>40-80 years</td></tr><tr><td>Copper</td><td>70 years</td></tr><tr><td>Clay/Concrete</td><td>100+ years</td></tr><tr><td>Slate</td><td>60-250 years</td></tr><tr><td>Simulated Slate</td><td>10-35 years</td></tr></tbody></table>


<p>Source: <a href="https://www.nachi.org/life-expectancy.htm" target="_blank" rel="noopener">InterNACHI</a></p>

<p>There are a variety of roofing materials available and appropriate for residential applications. When choosing roofing materials, it's essential to consider the look you want, your budget and the climate in your area.</p>

<p><a href="https://www.thumbtack.com/guide/content/types-of-roof-shingles-tiles-469908924949307404" target="_blank" rel="noopener">Asphalt shingles</a> are one of the most popular types of roofing materials because they are affordable and relatively easy to install. They come in various colors and styles designed to last decades if properly maintained. Asphalt shingle roofs also have a higher fire resistance than other roofing materials (like wood shakes), making them an ideal choice for homes in areas prone to wildfires or other natural disasters.</p>

<p><a href="https://www.thumbtack.com/guide/content/metal-roof-vs-shingles-468958107803729933" target="_blank" rel="noopener">Metal roofs</a> are becoming increasingly popular because they offer superior durability, fire-resistance and energy efficiency compared to traditional asphalt shingle roofs. They are available in various colors and styles, making them a good option if you want more customization options. Metal roofs also require less maintenance than other types of roofing materials.</p>

<p><strong>Tile roofs</strong> are an excellent option for homeowners looking for long-term durability and multiple style options. Tile roofs can have great longevity with proper maintenance, making them an ideal choice for those who don't want to replace their roof too often. Tile roofs typically cost more than asphalt shingle or metal roofs, so if budget is an issue, this might not be the best option for you. Keep in mind that tile roofs are often made out of clay or concrete — both of which are durable.</p>

<p><a href="https://www.thumbtack.com/guide/content/slate-roof-tiles-costs-pros-cons-468961494713851915" target="_blank" rel="noopener">Slate roofs</a> are known for lasting a lifetime, which means you probably won't have to replace this type of roof. Slate is durable, a curb-appeal booster and a favorite among homeowners. Just keep in mind it can get a bit pricey.</p>

<p>No matter which type of material you choose, make sure that you hire a top-rated professional who knows how to properly install your home's new roof. Search Thumbtack for roofing contractors and companies in your area today.</p>

<p><strong>Related:</strong> <a href="https://www.thumbtack.com/guide/content/best-roof-shingles-468960003220799492" target="_blank" rel="noopener">Buying guide: How to choose the best roof shingles.</a></p>`
},
            {
                id: "395686222777098252",
                question: "How long does a roof last?",
                answer: `<p>A roof's lifespan depends on two major factors: the material and how well the roof was installed. Assuming that the roof is installed properly, here's how long different roofing materials should last:</p><ul><li>Asphalt shingle roof: 20 years</li><li>Metal roof: 50 years</li><li>Slate roof: 100+ years (lifetime)</li><li>Clay roof: Lifetime</li><li>Concrete roof: Lifetime</li><li>Copper roof: Lifetime</li></ul><p>Contact the<a href="https://www.thumbtack.com/k/roofing/near-me"> best roofers near you</a> to get free estimates and start planning your roofing project today.</p>`
            },
            {
                id: "475537461341724696",
                question: "When should I get my roof inspected?",
                answer: `<p>Experts typically recommend that you have your roof professionally inspected at least once a year. But you also may want a licensed professional to inspect your roof during these circumstances:&nbsp;</p><ul><li>You're buying or selling a home</li><li>You're filing an insurance claim</li><li>Before or after a contractor does major work on your roof</li></ul><p>Search the Thumbtack site for experienced roof inspectors near you. You can contact them directly to set up a time to conduct the inspection, and learn more about their pricing structure and services.</p>`
            },
           {
    id: "475536412816498712",
    question: "What happens during a roofing inspection?",
    answer: `<p>Roof inspectors are trained to look for signs of a failing roofing system that could lead to damage — especially water and structural damage. Your home's roofing materials may look great from the ground, but it's difficult to see potential damage unless you take a closer look. A roof inspector can do just that.</p><p>During an inspection, the professional will typically look for issues that may have occurred during installation and manufacturing. They'll also keep an eye out for damage caused by normal wear and tear, as well as extreme weather events. They might also access your attic to see if there are signs of a leak in your roof.</p><p>Here's a short list of common things a contractor will look out for during a roof inspection:&nbsp;</p><ul><li>Damage caused by hail, wind, snow and rain</li><li>Missing, broken, buckling, curling or cracked shingles&nbsp;</li><li>Roof decay, rot, moss, mildew and mold</li><li>Rust around the flashing</li><li>Damaged chimneys and vents</li><li>Holes, gaps and punctures that could cause a roof leak</li><li>Water stains and ventilation issues</li></ul><p>Hiring a roofing inspector prevents you from having to do the dangerous work of climbing onto your roof. Plus, inspectors know how to assess potential damage and determine the best way to repair your roof and prevent the need for more expensive repairs in the future. Start searching for a roof inspector on Thumbtack today.</p>`
},
           {
    id: "325640678255091809",
    question: "How much does it cost for a metal roof?",
    answer: `<p dir="ltr">Metal roofing installation is an attractive option thanks to metal's long lifespan, hardiness and fire-retardant properties. Nationally, the average cost for metal roofing installation ranges from <a href="https://www.thumbtack.com/p/metal-roof-cost">$6,000 to $20,000</a>.There are different types of metal roofs, each with their own installation needs and materials costs. Roof size also affects your metal roofing installation costs, as do regional labor rates. Roof size is measured in squares; one square equals 100 square feet. Here are some examples of the average cost for a metal roof:</p><ul><li dir="ltr">Standard metal roof: $120-$150 per square to start, including materials and labor<ul><li dir="ltr">A 30-square roof (a 3,000-square-foot roof) could cost between $3,600 and $4,500 for a typical three-bedroom home.</li></ul></li><li dir="ltr">Snap-Loc metal roof: $200-$225 per square to start, including materials and labor.<ul><li dir="ltr">A 30-square roof could cost $6,000-$6,750.</li></ul></li><li dir="ltr">Standing seam metal roof: $300 per square to start, including materials and labor.<ul><li dir="ltr">A 30-square roof could cost $9,000 or more.</li></ul></li><li dir="ltr">Tuff-Rib metal roof: $250-$350 per square to start, including materials and labor.<ul><li dir="ltr">A 30-square roof could cost $7,500-$10,500.</li></ul></li><li dir="ltr">Mid-range metal roof package, including all accessories: $300-$500 per square.<ul><li dir="ltr">A 30-square roof could cost $9,000-$15,000.</li></ul></li><li dir="ltr">High-end metal roof package — such as zinc or copper — and all accessories: $1,000-$1,500 per square.<ul><li dir="ltr">A 30-square roof could cost $30,000-$45,000.</li></ul></li></ul>`
}
        ];

        /* ─── Related Services Data ─── */
        const relatedServices = [{
                title: "Commercial Roofing",
                link: "/tx/san-antonio/commercial-roofing"
            },
            {
                title: "Gutters",
                link: "/tx/san-antonio/gutters"
            },
            {
                title: "Roof Coating",
                link: "/tx/san-antonio/roof-coating-companies"
            },
            {
                title: "Roof Inspections",
                link: "/tx/san-antonio/roof-inspection-services"
            },
            {
                title: "Roof Installation",
                link: "/tx/san-antonio/roof-installation"
            },
            {
                title: "Roof Repairs",
                link: "/tx/san-antonio/roof-repair"
            },
            {
                title: "Roof Sealing",
                link: "/tx/san-antonio/roof-sealers"
            },
            {
                title: "Roof Vents",
                link: "/tx/san-antonio/roof-vent-installers"
            },
            {
                title: "Rubber Roofs",
                link: "/tx/san-antonio/rubber-roofing-contractors"
            },
            {
                title: "Soffit & Fascia",
                link: "/tx/san-antonio/soffit-and-fascia"
            },
            {
                title: "TPO Roofs",
                link: "/tx/san-antonio/tpo-roofing"
            },
            {
                title: "Tile Roofs",
                link: "/tx/san-antonio/clay-tile-roofing-contractors"
            }
        ];

        /* ─── Related Services: Generate HTML ─── */
        /* FIX 1: Nav buttons moved OUTSIDE the swiper div (same pattern as reviews).
                  why_hire div removed — injected separately in init() for correct order. */
        function generateRelatedServicesHTML(services) {
            const slides = services.map(s => `
            <div class="swiper-slide">
              <a href="${s.link}" class="TT-service-card items-start ba on-page-navigation_card__EyA_z">
                <div class="Type_title6__pMyYO">${s.title}</div>
              </a>
            </div>
          `).join('');

            return `
            <div class="TT-services-section mb5">
              <div class="Wrap_root__YXWM_">
                <div class="on-page-navigation_section__PJmr4">
                  <div class="Type_title3___voqu">Check out some related services</div>

                  <p class="Type_text1__634gq mt2 black-300">
                    See what else pros on Thumbtack offer—these might help you find specialty services or related jobs.
                  </p>

                  <div class="swiper TT-services-swiper mt3">
                    <div class="swiper-wrapper">${slides}</div>
                  </div>
                  <div class="swiper-button-prev TT-swiper-btn"></div>
                  <div class="swiper-button-next TT-swiper-btn"></div>
                </div>
              </div>
            </div>
            <div class="why_hire">
            <p class="tc">There are 156 five star Roofing Professionals in San Antonio, TX on Thumbtack.</p>
      <div class="pv5 tc">
        <div class="Wrap_root__YXWM_">

          <div class="mb5">
            <div class="Type_title3___voqu">
              Why hire professionals on Thumbtack?
            </div>
          </div>

          <div class="grid mb5">

            <div class="l_col-4">
              <div class="mw7 center mb4 l_mb0">
                <div class="indigo mb3">
                  <svg height="28" width="28" fill="currentColor" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14 24C8.485 24 4 19.514 4 14S8.485 4 14 4c5.514 0 9.999 4.486 9.999 10S19.514 24 14 24zm0-22C7.383 2 2 7.383 2 14s5.383 12 12 12c6.616 0 11.999-5.383 11.999-12S20.616 2 14 2zm1 11h-2a1 1 0 110-2h3a1 1 0 100-2h-1V8a1 1 0 10-2 0v1c-1.654 0-3 1.346-3 3s1.346 3 3 3h2a1 1 0 010 2h-3.5c-.554 0-1 .447-1 1 0 .553.446 1 1 1H13v1a1 1 0 102 0v-1a3.003 3.003 0 002.999-3c0-1.654-1.346-3-2.999-3z"></path>
                  </svg>
                </div>

                <div class="b">Free to use</div>

                <div class="black-300">
                  <p class="Type_text2__2_pIm">
                    You never pay to use Thumbtack: Get cost estimates, contact pros,
                    and even book the job—all for no cost.
                  </p>
                </div>
              </div>
            </div>

            <div class="l_col-4">
              <div class="mw7 center mb4 l_mb0">
                <div class="indigo mb3">
                  <svg height="28" width="28" fill="currentColor" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 17a1 1 0 100 2c2.757 0 5 1.963 5 4.375V24a1 1 0 102 0v-.625C26 19.859 22.86 17 19 17zm-1-7c0-1.654 1.346-3 3-3s3 1.346 3 3-1.346 3-3 3-3-1.346-3-3zm8 0c0-2.757-2.243-5-5-5s-5 2.243-5 5 2.243 5 5 5 5-2.243 5-5zM9.5 5C11.43 5 13 6.57 13 8.5S11.43 12 9.5 12 6 10.43 6 8.5 7.57 5 9.5 5zm0 9c3.033 0 5.5-2.468 5.5-5.5S12.533 3 9.5 3A5.506 5.506 0 004 8.5C4 11.532 6.467 14 9.5 14zm0 2C5.364 16 2 18.859 2 22.375V24a1 1 0 102 0v-1.625C4 19.963 6.467 18 9.5 18s5.5 1.963 5.5 4.375V24a1 1 0 102 0v-1.625C17 18.859 13.636 16 9.5 16z"></path>
                  </svg>
                </div>

                <div class="b">Compare prices side-by-side</div>

                <div class="black-300">
                  <p class="Type_text2__2_pIm">
                    You’ll know how much your project costs even before booking a pro.
                  </p>
                </div>
              </div>
            </div>

            <div class="l_col-4">
              <div class="mw7 center">
                <div class="indigo mb3">
                  <svg height="28" width="28" fill="currentColor" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21.6 6.2a.998.998 0 00-1.399.2l-8.38 11.175-4.197-3.356a1.002 1.002 0 00-1.406.156 1.003 1.003 0 00.156 1.406l5.806 4.644L21.8 7.6a1 1 0 00-.2-1.4z"></path>
                  </svg>
                </div>

                <div class="b">Hire with confidence</div>

                <div class="black-300">
                  <p class="Type_text2__2_pIm">
                    With access to 1M+ customer reviews and the pros’ work history,
                    you’ll have all the info you need to make a hire.
                  </p>
                </div>
              </div>
            </div>

          </div>

          <button class="themed_themedButton__UKQVj themed_themedButtonRoundedBordersLeft___blLq themed_themedButtonRoundedBordersRight__d0G5C themed_themedButtonThemePrimary__pd6_C themed_themedButtonWidthAuto__NPxnl" type="button">
            <span class="themed_flexWrapper__MQCSr themed_flexWrapperSizeSmall__gGusi">
              Get started
            </span>
          </button>

        </div>
      </div>
    </div>
          `;
        }

        /* ─── Related Services: Init Swiper ─── */
        /* FIX 1: Scoped selectors so services arrows don't trigger reviews arrows */
        function initRelatedServicesSwiper() {
           new Swiper('.TT-services-swiper', {
    slidesPerView: 'auto',
    spaceBetween: 12,
    loop: false,

    freeMode: false, // ❌ important: disable free mode

    slidesPerGroup: 1, // default fallback

    navigation: {
        nextEl: '.TT-services-section .swiper-button-next',
        prevEl: '.TT-services-section .swiper-button-prev'
    },

    breakpoints: {
        0: {
            slidesPerGroup: 1
        },
        600: {
            slidesPerGroup: 2
        },
        900: {
            slidesPerGroup: 3
        }
    }
});
        }

        /* ─── Reviews Data ─── */
       const reviews = [
    {
        reviewer: "Michael R.",
        proName: "Valor Roofing & Restoration",
        proImg: "https://production-next-images-cdn.thumbtack.com/i/407498985369608196/width/120.jpeg",
        stars: 5,
        text: "Valor <b>Roofing</b> conducted an assessment of the <b>roof</b> of my patio cover.  The Valor <b>Roofing</b> representative was very professional and was spot on with the assessment.  They showed up on time as scheduled for the appointment.",
        link: "https://www.thumbtack.com/tx/san-antonio/roofing/valor-roofing-restoration/service/407086917170987017#ServicePageReviewsSection"
    },
    {
        reviewer: "Bonnita G.",
        proName: "Bluebonnet Roofing & Remodeling, LLC",
        proImg: "https://production-next-images-cdn.thumbtack.com/i/402799459667615748/width/120.jpeg",
        stars: 5,
        text: "Bluebonnet <b>Roofing</b> is a good company. They are friendly, their work is good and they are quick. Our <b>roof</b> was completed within a day.",
        link: "https://www.thumbtack.com/tx/schertz/roofing/bluebonnet-roofing-remodeling-llc/service/402797473143226377#ServicePageReviewsSection"
    },
    {
        reviewer: "Thumbtack Customer",
        proName: "Delta Exteriors LLC.",
        proImg: "https://production-next-images-cdn.thumbtack.com/i/344489977802670083/width/120.jpeg",
        stars: 5,
        text: "Delta Exteriors, LLC. is an outstanding <b>roofing</b> company who did an outstanding job replacing our <b>roof</b>.  We are thrilled!",
        link: "https://www.thumbtack.com/tx/san-antonio/roofing/delta-exteriors-llc/service/237964761872032907#ServicePageReviewsSection"
    },
    {
        reviewer: "Debra D.",
        proName: "Anderson Roofing & Repairs LLC",
        proImg: "https://production-next-images-cdn.thumbtack.com/i/514938558156382234/width/120.jpeg",
        stars: 5,
        text: "Anderson <b>Roofing</b> was very professional, and punctual in completing the requested <b>roof</b> repairs. The crew was professional and respectful of the property.  All debris was removed and they took extra time making sure all nails were recovered from the driveway and street area.  I would definitely recommend Anderson <b>Roofing</b> for your <b>roofing</b> project.  Job well done.",
        link: "https://www.thumbtack.com/tx/san-antonio/roofing/anderson-roofing-repairs-llc/service/303542723808772229#ServicePageReviewsSection"
    },
    {
        reviewer: "Thumbtack Customer",
        proName: "Patriot Roofing",
        proImg: "https://production-next-images-cdn.thumbtack.com/i/345064025176301569/width/1024.jpeg",
        stars: 1,
        text: "Patriot <b>roofing</b> was not able to repair my <b>roof</b> properly after repeated attempts.  Poor customer service and totally unreliable service technicians.  Unfortunately we had to hire another company to repair our <b>roof</b>.  Would not recommend.",
        link: "https://www.thumbtack.com/tx/san-antonio/roofing/patriot-roofing/service/247381375427388461#ServicePageReviewsSection"
    },
    {
        reviewer: "Monica R.",
        proName: "Anderson Roofing & Repairs LLC",
        proImg: "https://production-next-images-cdn.thumbtack.com/i/514938558156382234/width/120.jpeg",
        stars: 5,
        text: "After a few estimates, Anderson <b>Roofing</b> had the best price by far. My <b>roof</b> needed a complete replacement and they did an AMAZING JOB! They were friendly, professional and prompt. I love my <b>roof</b>. Will definitely be recommending to friends and family.",
        link: "https://www.thumbtack.com/tx/san-antonio/roofing/anderson-roofing-repairs-llc/service/303542723808772229#ServicePageReviewsSection"
    },
    {
        reviewer: "Joan H.",
        proName: "Velocity Roofing and Gutters",
        proImg: "https://production-next-images-cdn.thumbtack.com/i/333312897856790708/width/1024.jpeg",
        stars: 5,
        text: "They finished the <b>roof</b> in one day.",
        link: "https://www.thumbtack.com/tx/san-antonio/roofing/velocity-roofing-gutters/service/262971503063753811#ServicePageReviewsSection"
    },
    {
        reviewer: "Thumbtack Customer",
        proName: "HI-5 ROOFING LLC",
        proImg: "https://production-next-images-cdn.thumbtack.com/i/344766905238241283/width/1024.jpeg",
        stars: 4,
        text: "Replaced the <b>roof</b> on my house including new gutter. May have been a miscommunication between contractor crew and foreman but my neighbor's garage got a new <b>roof</b> when my adjoining <b>roof</b> was done. Overall I'd use them again.",
        link: "https://www.thumbtack.com/tx/san-antonio/roofing/hi-5-roofing-llc/service/262670528925680802#ServicePageReviewsSection"
    },
    {
        reviewer: "Alisha G.",
        proName: "Jesus Lucero/Basic Roofing",
        proImg: "https://production-next-images-cdn.thumbtack.com/i/543678993597341712/width/1024.jpeg",
        stars: 5,
        text: "Basic <b>Roofing</b> did a great job on our <b>roofing</b> repairs. Answered all of our questions and was very responsive. Highly recommend. Thank you!",
        link: "https://www.thumbtack.com/tx/kerrville/roofing/jesus-lucerobasic-roofing/service/316993279706382381#ServicePageReviewsSection"
    },
    {
        reviewer: "Doss V.",
        proName: "Monarque Roofing & Waterproofing, LLC.",
        proImg: "https://production-next-images-cdn.thumbtack.com/i/570464551322976270/width/1024.jpeg",
        stars: 5,
        text: "Provided professional service pfor my <b>roof</b> repair. Fair price for all the work that was required. Will use him for any <b>roof</b> work needed in future.",
        link: "https://www.thumbtack.com/tx/canyon-lake/roofing/monarque-roofing-waterproofing-llc/service/468367519293022220#ServicePageReviewsSection"
    },
    {
        reviewer: "Matt B.",
        proName: "Forthman Roofing, LLC",
        proImg: "https://production-next-images-cdn.thumbtack.com/i/344957742500749313/width/1024.jpeg",
        stars: 5,
        text: "Did an excellent job replacing the <b>roof</b>",
        link: "https://www.thumbtack.com/tx/san-antonio/roofing/forthman-roofing-llc/service/319925255293534410#ServicePageReviewsSection"
    },
    {
        reviewer: "Thumbtack Customer",
        proName: "Summit Roofing",
        proImg: "https://production-next-images-cdn.thumbtack.com/i/544906092341633025/width/1024.jpeg",
        stars: 5,
        text: "I highly recommend Summit <b>Roofing</b>! From the moment he arrived to inspect my <b>roof</b>, his professionalism and honesty were evident. He thoroughly assessed the situation, clearly explained his findings, and provided a transparent and fair estimate. It's refreshing to work with a company that prioritizes integrity and customer satisfaction. If you're looking for reliable and trustworthy <b>roofing</b> services, look no further than Summit <b>Roofing</b>!",
        link: "https://www.thumbtack.com/tx/round-rock/roofing/summit-roofing/service/538346176878714895#ServicePageReviewsSection"
    },
    {
        reviewer: "Bob G.",
        proName: "Relief Roofing & Restoration",
        proImg: "https://production-next-images-cdn.thumbtack.com/i/541988348001394695/width/1024.jpeg",
        stars: 5,
        text: "L-N-O <b>Roofing</b> did an excellent job in repairing our <b>roof</b>.  Great work and I would hire them for any future repairs in an instant!",
        link: "https://www.thumbtack.com/tx/san-antonio/roofing/relief-roofing-restoration/service/303151582987386974#ServicePageReviewsSection"
    },
    {
        reviewer: "Jared J.",
        proName: "Anderson Roofing & Repairs LLC",
        proImg: "https://production-next-images-cdn.thumbtack.com/i/514938558156382234/width/120.jpeg",
        stars: 5,
        text: "Brian fixed a vent that wasn't installed appropriately when my new <b>roof</b> was installed by a different contractor. Job was scheduled and completed within a day, and the new vent + new shingles were installed perfectly and match the existing <b>roof</b>. Great experience, would recommend to anyone that needs <b>roofing</b> repair.",
        link: "https://www.thumbtack.com/tx/san-antonio/roofing/anderson-roofing-repairs-llc/service/303542723808772229#ServicePageReviewsSection"
    },
    {
        reviewer: "April S.",
        proName: "Bluebonnet Roofing & Remodeling, LLC",
        proImg: "https://production-next-images-cdn.thumbtack.com/i/402799459667615748/width/120.jpeg",
        stars: 5,
        text: "Extremely reliable and professional.  Great group of guys to work with. Completed my <b>roof</b> and clean up in one day. Definitely recommend. Very happy with my new <b>roof</b>.",
        link: "https://www.thumbtack.com/tx/schertz/roofing/bluebonnet-roofing-remodeling-llc/service/402797473143226377#ServicePageReviewsSection"
    },
    {
        reviewer: "Jan B.",
        proName: "Relief Roofing & Restoration",
        proImg: "https://production-next-images-cdn.thumbtack.com/i/541988348001394695/width/1024.jpeg",
        stars: 5,
        text: "Great quality <b>roofing</b> at a reasonable price. We received videos from before and after the work was done.  They are a good way to see what is happening on your <b>roof</b>. Thanks.",
        link: "https://www.thumbtack.com/tx/san-antonio/roofing/relief-roofing-restoration/service/303151582987386974#ServicePageReviewsSection"
    },
    {
        reviewer: "William L.",
        proName: "A.B.M.S LLC",
        proImg: "https://production-next-images-cdn.thumbtack.com/i/345084047182020635/width/1024.jpeg",
        stars: 5,
        text: "Mr. Markos helped me out at every turn.  My <b>roofing</b> job was an insurance claim and his knowledge in this area was very reassuring and appreciated.  The <b>roof</b> looks great.",
        link: "https://www.thumbtack.com/tx/ingleside/roofing/bms-llc/service/274143160240112824#ServicePageReviewsSection"
    },
    {
        reviewer: "Makia H.",
        proName: "Monarque Roofing & Waterproofing, LLC.",
        proImg: "https://production-next-images-cdn.thumbtack.com/i/570464551322976270/width/1024.jpeg",
        stars: 5,
        text: "Would recommend Mike with Monarque <b>Roofing</b> to friends.",
        link: "https://www.thumbtack.com/tx/canyon-lake/roofing/monarque-roofing-waterproofing-llc/service/468367519293022220#ServicePageReviewsSection"
    },
    {
        reviewer: "Tobin B.",
        proName: "Rox Roofing & Exteriors",
        proImg: "https://production-next-images-cdn.thumbtack.com/i/482814352655966208/width/1024.jpeg",
        stars: 5,
        text: "Same day <b>roof</b> repair.  Great job.",
        link: "https://www.thumbtack.com/tx/san-antonio/roofing/rox-roofing-exteriors/service/222024264986862713#ServicePageReviewsSection"
    },
    {
        reviewer: "Thumbtack Customer",
        proName: "Extreme roofing & construction",
        proImg: "https://production-next-images-cdn.thumbtack.com/i/345041115477393412/width/1024.jpeg",
        stars: 5,
        text: "Complete <b>roof</b> replacement - Mac is very professional.",
        link: "https://www.thumbtack.com/fl/plant-city/roofing/extreme-roofing-construction/service/269115194932364500#ServicePageReviewsSection"
    },
    {
        reviewer: "Cindy D.",
        proName: "Relief Roofing & Restoration",
        proImg: "https://production-next-images-cdn.thumbtack.com/i/541988348001394695/width/1024.jpeg",
        stars: 5,
        text: "Relief <b>Roofing</b> did an excellent job on our <b>roof</b>! We needed the <b>roof</b> completed quickly and so they sent their crew out the next day. They were very thorough and shared pictures and videos of their progress along the way. This was extremely helpful as we were not there to supervise any of the work. I would definitely recommend them!",
        link: "https://www.thumbtack.com/tx/san-antonio/roofing/relief-roofing-restoration/service/303151582987386974#ServicePageReviewsSection"
    },
    {
        reviewer: "Chris N.",
        proName: "Relief Roofing & Restoration",
        proImg: "https://production-next-images-cdn.thumbtack.com/i/541988348001394695/width/1024.jpeg",
        stars: 5,
        text: "Last weekend I noticed some tiles on my <b>roof</b> had come loose.  Not knowing who to contact, I requested Thumbtack sent me a list of contractors.  I was really fortunate to have Relief <b>Roofing</b> & Restoration contact me.  Mr. Serna the owner, show up at the agreed upon time, discussed his plan with me, than went on my roof and recorded what he saw both positive and negative.  I really appreciated his professionalism to take the extra time to discuss what needed to be done with me and provide me with a fair quote to repair my roof.  I hope I don't have to replace my <b>roof</b> for another 20 years, but if I do Mr. Serna will be my contractor of choice to handle my <b>roofing</b> needs.",
        link: "https://www.thumbtack.com/tx/san-antonio/roofing/relief-roofing-restoration/service/303151582987386974#ServicePageReviewsSection"
    },
    {
        reviewer: "Karen S.",
        proName: "Anderson Roofing & Repairs LLC",
        proImg: "https://production-next-images-cdn.thumbtack.com/i/514938558156382234/width/120.jpeg",
        stars: 5,
        text: "Anderson <b>Roofing</b> provided Excellent, Courteous, and Professional Service!",
        link: "https://www.thumbtack.com/tx/san-antonio/roofing/anderson-roofing-repairs-llc/service/303542723808772229#ServicePageReviewsSection"
    },
    {
        reviewer: "Br R.",
        proName: "Rox Roofing & Exteriors",
        proImg: "https://production-next-images-cdn.thumbtack.com/i/482814352655966208/width/1024.jpeg",
        stars: 5,
        text: "Rox <b>Roofing</b> was very professional. He responded right away to my request.  The <b>roof</b> was leaking at the fireplace.  He knew what the problem was as a previous roofer did not know what they were doing.  I will use him again if there was ever another problem.  He guaranteed his work. I highly recommend Rox <b>Roofing</b>.",
        link: "https://www.thumbtack.com/tx/san-antonio/roofing/rox-roofing-exteriors/service/222024264986862713#ServicePageReviewsSection"
    },
    {
        reviewer: "Christine F.",
        proName: "Queta Construction Group, LLC",
        proImg: "https://production-next-images-cdn.thumbtack.com/i/395677793685184524/width/1024.jpeg",
        stars: 5,
        text: "This team set a date and worked quickly. The <b>roof</b> is beautiful. They took extra steps to improve the attached deck <b>roof</b>. They did an outstanding cleanup job. The price was reasonable. I will hire for any job.",
        link: "https://www.thumbtack.com/tx/san-antonio/roofing/queta-construction-group-llc/service/248712231858472128#ServicePageReviewsSection"
    }
];

        /* ─── Reviews: Swiper loader ─── */
        var _swiperCallbacks = [];
        var _swiperLoading = false;
        function loadSwiper(callback) {
            if (window.Swiper) {
                callback();
                return;
            }
            _swiperCallbacks.push(callback);
            if (_swiperLoading) return;
            _swiperLoading = true;

            var css = document.createElement('link');
            css.rel = 'stylesheet';
            css.href = 'https://cdnjs.cloudflare.com/ajax/libs/Swiper/11.0.5/swiper-bundle.min.css';
            document.head.appendChild(css);

            var js = document.createElement('script');
            js.src = 'https://cdnjs.cloudflare.com/ajax/libs/Swiper/11.0.5/swiper-bundle.min.js';
            js.onload = function() {
                _swiperCallbacks.forEach(function(cb) { cb(); });
                _swiperCallbacks = [];
            };
            document.head.appendChild(js);
        }

        /* ─── Reviews: Star SVG helper ─── */
        function buildStars(count) {
            var html = '';
            for (var i = 1; i <= 5; i++) {
                var filled = i <= count ? '#FBB500' : '#D3D3D3';
                html += '<svg width="16" height="16" viewBox="0 0 18 18" fill="' + filled + '" xmlns="http://www.w3.org/2000/svg" style="margin-right:2px"><path d="M9 1l2.47 5.01L17 6.91l-4 3.9.94 5.5L9 13.77l-4.94 2.54L5 10.81 1 6.91l5.53-.9L9 1z"/></svg>';
            }
            return html;
        }

        /* ─── Reviews: Generate HTML ─── */
        function generateReviewsHTML(reviewsData) {
            var slides = reviewsData.map(function(r) {
                return (
                    '<div class="swiper-slide">' +
                    '<a class="TT-review-card" href="' + r.link + '" rel="noopener" target="_blank">' +
                    '<p class="TT-review-from">From ' + r.reviewer + '</p>' +
                    '<div class="TT-review-pro">' +
                    '<img src="' + r.proImg + '" alt="' + r.proName + '" class="TT-review-pro-img" loading="lazy">' +
                    '<span class="TT-review-pro-name">' + r.proName + '</span>' +
                    '</div>' +
                    '<div class="TT-review-stars">' + buildStars(r.stars) + '</div>' +
                    '<p class="TT-review-text">' + r.text + '</p>' +
                    '</a>' +
                    '</div>'
                );
            }).join('');

            return (
                '<div class="TT-reviews-section mb5 pv6 bt bb b-gray-300">' +
                '<div class="Wrap_root__YXWM_">' +
                '<div class="Type_title3___voqu review-carousel_sectionTitle__gqjou" style="margin-bottom:24px">Reviews for San Antonio roofing professionals on Thumbtack</div>' +
                '<div class="swiper TT-reviews-swiper">' +
                '<div class="swiper-wrapper">' + slides + '</div>' +
                '</div>' +
                '<div class="swiper-button-prev TT-swiper-btn"></div>' +
                '<div class="swiper-button-next TT-swiper-btn"></div>' +
                '</div>' +
                '</div>'
            );
        }

        /* ─── Reviews: Init Swiper instance ─── */
        /* FIX 1: Scoped selectors so reviews arrows don't trigger services arrows */
        function initReviewsSwiper() {
            new Swiper('.TT-reviews-swiper', {
                slidesPerView: 1.2,
                spaceBetween: 16,
                loop: false,
                pagination: {
                    el: '.TT-swiper-pagination',
                    clickable: true
                },
                navigation: {
                    nextEl: '.TT-reviews-section .swiper-button-next',
                    prevEl: '.TT-reviews-section .swiper-button-prev'
                },
                breakpoints: {
                    600: {
                        slidesPerView: 2,
                        spaceBetween: 16,
                        slidesPerGroup: 2,
                    },
                    900: {
                        slidesPerView: 3,
                        slidesPerGroup: 3,
                        spaceBetween: 16
                    }
                }
            });
        }

        const SVG_CARET = `<svg class="question-and-answer_toggleCaret__t38Xc" aria-hidden="true" height="18" width="18" fill="currentColor" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg"><path d="M14.646 6.764L9 13 3.311 6.725a1 1 0 011.342-1.482L9 10l4.285-4.699c.2-.187.435-.301.715-.301a1 1 0 011 1c0 .306-.151.537-.354.764z"></path></svg>`;

        function generateFaqHTML(faqs) {
            const items = faqs.map(faq => `
    <article class="bb bt b-gray-300" itemscope="" itemprop="mainEntity" itemtype="https://schema.org/Question">
      <div class="pv1 pv3 cursor-pointer" role="button" tabindex="0" aria-label="Show answer" aria-expanded="false" aria-controls="answer-${faq.id}">
        <h3 class="Type_title6__pMyYO">
          ${SVG_CARET}
          <span id="question-${faq.id}" itemprop="name">${faq.question}</span>
        </h3>
      </div>
      <div id="answer-${faq.id}" class="question-and-answer_hidden__0gaPX mb3" data-test="qna-content" itemscope="" itemprop="acceptedAnswer" itemtype="https://schema.org/Answer" aria-labelledby="question-${faq.id}">
        <div class="Type_text2__2_pIm black-300 ">
          <div itemprop="text">
            <div class="formatted-content" data-testid="formatted-content">
              ${faq.answer}
            </div>
          </div>
        </div>
      </div>
    </article>
  `).join('');

            return `
    <div class="mb5">
      <div class="Wrap_root__YXWM_">
        <section class="center">
          <header class="mb5">
            <h2 class="Type_title3___voqu question-and-answer-section_tightTitle__rIATm" data-test="qna-section-title">FAQs</h2>
            <div class="Type_text1__634gq" data-test="qna-section-prologue">
              <p>Answers to commonly asked questions from the experts on Thumbtack.</p>
            </div>
          </header>
          <article itemscope="" itemtype="https://schema.org/FAQPage">
            ${items}
          </article>
        </section>
      </div>
    </div>
  `;
        }

        function initFaqToggle() {
            document.querySelectorAll('[aria-controls^="answer-"]').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var answerId = this.getAttribute('aria-controls');
                    var answerEl = document.getElementById(answerId);
                    var isExpanded = this.getAttribute('aria-expanded') === 'true';

                    if (isExpanded) {
                        answerEl.classList.add('question-and-answer_hidden__0gaPX');
                        this.setAttribute('aria-expanded', 'false');
                        this.setAttribute('aria-label', 'Show answer');
                    } else {
                        answerEl.classList.remove('question-and-answer_hidden__0gaPX');
                        this.setAttribute('aria-expanded', 'true');
                        this.setAttribute('aria-label', 'Hide answer');
                    }
                });
            });
        }

        /* ─── FIX: helper to init .tt_item_section show/hide ─── */
        function initItemSectionToggles() {
            document.querySelectorAll('.tt_item_section').forEach(function(section) {
                // Skip already-initialised sections
                if (section.dataset.ttToggleInit) return;
                section.dataset.ttToggleInit = '1';

                var items = section.querySelectorAll('ul li');
                var btn = section.querySelector('.tt_toggle_cta');
                var isExpanded = false;

                items.forEach(function(item, index) {
                    if (index > 4) item.style.display = 'none';
                });

                if (btn) {
                    btn.textContent = 'Show more';
                    btn.addEventListener('click', function() {
                        isExpanded = !isExpanded;
                        items.forEach(function(item, index) {
                            item.style.display = (isExpanded || index <= 4) ? 'list-item' : 'none';
                        });
                        btn.textContent = isExpanded ? 'Show less' : 'Show more';
                    });
                }
            });
        }

        /* ─── Shared URL builder (used by both CTA handlers) ─── */
        function buildInstantResultsUrl(zip) {
            var cta = window.__NEXT_DATA__.props.pageProps.frontDoorPage.heroSection.filterSubsection.cta;
            var keyword_pk = cta.keywordPk;
            var project_pk = cta.projectPk || cta.project_pk || '';
            return 'https://www.thumbtack.com/instant-results/?keyword_pk=' + keyword_pk +
                '&zip_code=' + (zip || '') +
                '&ir_referrer=FRONT_DOOR_SEARCH' +
                (project_pk ? '&project_pk=' + project_pk : '');
        }

        /* Variation Init */
        function init() {
            if (window.TT_INIT_DONE) return;
            window.TT_INIT_DONE = true;
            document.querySelector("body").classList.add(variation_name);

            /* 1. Footer injection */


            /* 2. Hero image swap */
            waitForElement('[class*="Landing_hero"] > img', function() {
                var heroImg = document.querySelector('[class*="Landing_hero"] > img');
                if (heroImg) {
                    heroImg.src = "https://production-next-images-cdn.thumbtack.com/i/302056149247590580/width/2560.webp";
                }
            }, 100, 15000);

            /* 3. Banner + all sections injection
               FIX 2: Correct order — Services → FAQs → Reviews → Why hire → Footer
            */
            waitForElement('div[class*="composable-customer-header"]', function() {
                if (!document.querySelector('.Cre_banner')) {
                    document.querySelector('div[class*="composable-customer-header"]')
                        .insertAdjacentHTML("afterend", bannersection);

                    waitForElement('.global-footer', function() {
                        var bannerEl = document.querySelector('.global-footer');

                        // ── 1. Services (first, immediately before footer) ──
                        if (!document.querySelector('.TT-services-section')) {
                            var servicesWrapper = document.createElement('div');
                            servicesWrapper.innerHTML = generateRelatedServicesHTML(relatedServices);
                            bannerEl.insertAdjacentElement('beforebegin', servicesWrapper);
                            loadSwiper(function() {
                                initRelatedServicesSwiper();
                            });
                        }

                        // ── 2. FAQ (after services) ──
                        if (!document.querySelector('.TT-faq-wrapper')) {
                            var servicesEl = document.querySelector('.TT-services-section');
                            var faqWrapper = document.createElement('div');
                            faqWrapper.className = 'TT-faq-wrapper';
                            faqWrapper.innerHTML = generateFaqHTML(faqs);
                            (servicesEl || bannerEl).insertAdjacentElement('afterend', faqWrapper);
                            initFaqToggle();
                        }

                        // ── 3. Reviews (after FAQ) ──
                        if (!document.querySelector('.TT-reviews-section')) {
                            var faqEl = document.querySelector('.TT-faq-wrapper');
                            var reviewsWrapper = document.createElement('div');
                            reviewsWrapper.innerHTML = generateReviewsHTML(reviews);
                            (faqEl || bannerEl).insertAdjacentElement('afterend', reviewsWrapper);
                            loadSwiper(function() {
                                initReviewsSwiper();
                            });
                        }

                        // ── 4. Why hire (after reviews, before footer) ──
                        if (!document.querySelector('.why_hire')) {
                            var reviewsEl = document.querySelector('.TT-reviews-section');
                            var whyHireWrapper = document.createElement('div');
                            whyHireWrapper.className = 'why_hire';
                            (reviewsEl || bannerEl).insertAdjacentElement('afterend', whyHireWrapper);
                        }
                    }, 100, 15000);
                }
            }, 100, 15000);

            waitForElement('.global-footer', function() {
                if (!document.querySelector('.TT-global-footer')) {
                    document.querySelector('.global-footer')
                        .insertAdjacentHTML("beforebegin", footer);
                    // FIX: init footer toggles AFTER footer is in the DOM
                    initItemSectionToggles();
                }
            }, 100, 15000);

           /* ─── ZIP input: live error clear when user types a valid 5-digit ZIP ─── */
            document.addEventListener('input', function(e) {
                if (e.target && e.target.getAttribute('autocomplete') === 'postal-code') {
                    if (e.target.value.trim().length >= 5) {
                        var errorEl = document.getElementById('tt-zip-error');
                        if (errorEl) errorEl.remove();
                        document.body.classList.remove('disable'); // ← ADD
                    }
                }
            });


            /* ─── ZIP input: mark as touched on focus ─── */
document.addEventListener('focus', function(e) {
    if (e.target && e.target.getAttribute('autocomplete') === 'postal-code') {
        e.target.setAttribute('data-tt-touched', '1');
    }
}, true);

/* ─── ZIP input: show error + disable body on blur if value < 5 ─── */
document.addEventListener('blur', function(e) {
    if (e.target && e.target.getAttribute('autocomplete') === 'postal-code') {
        var val = e.target.value.trim();
        if (e.target.getAttribute('data-tt-touched') && !/^\d{5}$/.test(val)) {
            var errorEl = document.getElementById('tt-zip-error');
            if (!errorEl) {
                errorEl = document.createElement('div');
                errorEl.id = 'tt-zip-error';
                errorEl.style.cssText = 'color:#d9232d;font-size:13px;margin-top:6px;font-weight:500;';
                errorEl.textContent = 'Please enter a valid 5-digit ZIP code.';
                if (e.target.parentNode) {
                    e.target.parentNode.insertAdjacentElement('afterend', errorEl);
                }
            }
            document.body.classList.add('disable');
        }
    }
}, true);
            /* 4. Delegated accordion for footer nav (safe to bind once on document) */
            live('.tt_secondnav_section > div', 'click', function() {
                var parent = this.parentElement;
                var isAlreadyActive = this.classList.contains('isactive');
                parent.querySelectorAll('div').forEach(function(el) {
                    el.classList.remove('isactive');
                });
                if (!isAlreadyActive) {
                    this.classList.add('isactive');
                }
            });

            /* ─── Hero banner CTA: ZIP validation + redirect ─── */
            live('[data-test="hero-filters-cta"]', 'click', function(e) {
                // "17 near you" button .hero_header_parent ke andar hai — use skip karo
                if (!this.closest('.mt3')) return;
                // Sirf hamare injected banner ka button handle karo
                if (!this.closest('.Cre_banner')) return;

                e.preventDefault();
                e.stopPropagation();

                var zipInput = document.querySelector('#uniqueId2 [autocomplete="postal-code"]');
                var zip = zipInput ? zipInput.value.trim() : '';

                /* ── ZIP validation ── */
                var errorEl = document.getElementById('tt-zip-error');

                if (!/^\d{5}$/.test(zip)) {
                    // Show error if not already visible
                    if (!errorEl) {
                        errorEl = document.createElement('div');
                        errorEl.id = 'tt-zip-error';
                        errorEl.style.cssText = 'color:#d9232d;font-size:13px;margin-top:6px;font-weight:500;';
                        errorEl.textContent = 'Please enter a valid 5-digit ZIP code.';
                        if (zipInput) {
                            zipInput.parentNode.insertAdjacentElement('afterend', errorEl);
                        }
                    }
                    document.body.classList.add('disable');
                    return; // Stop — do not redirect
                }

                // ZIP is valid — remove any existing error + disable state
                if (errorEl) errorEl.remove();
                document.body.classList.remove('disable');

                try {
                    var url = buildInstantResultsUrl(zip);
                    console.log('TT URL:', url);
                    window.location.href = url;
                } catch (err) {
                    console.info('TT: could not build URL', err);
                    var errEl = document.getElementById('tt-zip-error');
                    if (!errEl) {
                        errEl = document.createElement('div');
                        errEl.id = 'tt-zip-error';
                        errEl.style.cssText = 'color:#d9232d;font-size:13px;margin-top:6px;font-weight:500;';
                        errEl.textContent = 'Something went wrong — please try again.';
                        if (zipInput && zipInput.parentNode) {
                            zipInput.parentNode.insertAdjacentElement('afterend', errEl);
                        }
                    }
                }
            });

            /* ─── ZIP form: block Enter-key native submit (no action attr → navigates away) ─── */
            document.addEventListener('submit', function(e) {
                if (!e.target || e.target.id !== 'uniqueId2') return;
                e.preventDefault();
                e.stopPropagation();

                var zipInput = document.querySelector('#uniqueId2 [autocomplete="postal-code"]');
                var zip = zipInput ? zipInput.value.trim() : '';
                var errorEl = document.getElementById('tt-zip-error');

                if (!/^\d{5}$/.test(zip)) {
                    if (!errorEl) {
                        errorEl = document.createElement('div');
                        errorEl.id = 'tt-zip-error';
                        errorEl.style.cssText = 'color:#d9232d;font-size:13px;margin-top:6px;font-weight:500;';
                        errorEl.textContent = 'Please enter a valid 5-digit ZIP code.';
                        if (zipInput && zipInput.parentNode) {
                            zipInput.parentNode.insertAdjacentElement('afterend', errorEl);
                        }
                    }
                    document.body.classList.add('disable');
                    return;
                }

                if (errorEl) errorEl.remove();
                document.body.classList.remove('disable');

                try {
                    var url = buildInstantResultsUrl(zip);
                    window.location.href = url;
                } catch (err) {
                    console.info('TT: could not build URL', err);
                    var errEl = document.getElementById('tt-zip-error');
                    if (!errEl) {
                        errEl = document.createElement('div');
                        errEl.id = 'tt-zip-error';
                        errEl.style.cssText = 'color:#d9232d;font-size:13px;margin-top:6px;font-weight:500;';
                        errEl.textContent = 'Something went wrong — please try again.';
                        if (zipInput && zipInput.parentNode) {
                            zipInput.parentNode.insertAdjacentElement('afterend', errEl);
                        }
                    }
                }
            });

            /* ─── why_hire "Get started" button: redirect without zip input ─── */
            /* ─── why_hire "Get started" button: use hero ZIP if available ─── */
live('.why_hire button', 'click', function(e) {
    e.preventDefault();
    e.stopPropagation();

    try {
        var zipInput = document.querySelector('#uniqueId2 [autocomplete="postal-code"]');
        var zip = (zipInput && zipInput.value.trim().length >= 5) ? zipInput.value.trim() : '';
        var url = buildInstantResultsUrl(zip);
        console.log('TT why_hire URL:', url);
        window.location.href = url;
    } catch (err) {
        console.info('TT: could not build why_hire URL', err);
    }
});




            
        }

        /* FIX: clear interval immediately after first successful run — prevents init() firing ~100x */
      
        
        /* Initialise variation */
        function thumbtackTest144(list, observer) {
            list.getEntries().forEach((entry) => {
                if (entry.entryType === "mark" && entry.name === "afterHydrate") {
                    observer.disconnect(); // Stop observing
                    clearInterval(testsignals); // Clear interval
                    waitForElement("body", init, 50, 15000); // Initialize the variation after hydration
                    window.isHydrated = true;
                }
            });
        }

        // Check hydration status and initiate
        if (!window.isHydrated) {
            var testsignals = setInterval(function () {
                waitForElement("body", init, 50, 15000); // Wait for body to load
            }, 50);
            setTimeout(function () {
                clearInterval(testsignals); // Stop the interval after 3 seconds
            }, 3000);
            const observer = new PerformanceObserver(thumbtackTest144);
            observer.observe({ entryTypes: ["mark"] }); // Start observing performance marks
        } else {
            waitForElement("body", init, 50, 15000); // If already hydrated, initialize immediately
        }
    } catch (e) {
        if (debug) console.log(e, "error in Test" + variation_name); // Log errors if debug is enabled
    }
})();