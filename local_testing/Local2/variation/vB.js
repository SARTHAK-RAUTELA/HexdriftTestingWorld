(function () {
    try {
        /* main variables */
        var debug = 1;
        var variation_name = "Try_Free_Cta_Hide";

        function waitForElement(selector, trigger, delayInterval, delayTimeout) {
            var interval = setInterval(function () {
                if (
                    document &&
                    document.querySelector(selector) &&
                    document.querySelectorAll(selector).length > 0
                ) {
                    clearInterval(interval);
                    trigger();
                }
            }, delayInterval);

            setTimeout(function () {
                clearInterval(interval);
            }, delayTimeout);
        }

        var efxPlusHTML = `
        <section class="salary-section">
            <div class="salary-inner">
                <div class="salary-left">

                    <h1>
                        How does your <span class="highlight">finance<br>salary compare</span> in 2026?
                    </h1>

                    <p class="salary-desc">
                        See what 5,000+ finance and treasury professionals are actually earning in 2026. Download your free highlights from AFP’s 2026 Compensation & Benefits Survey Report (valued at $295).
                    </p>

                    <ul class="salary-bullets">
                        <li>
                            <span class="check-icon">
                                <svg viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3"/></svg>
                            </span>
                            Find out if your salary kept up with peers — or fell behind
                        </li>
                        <li>
                            <span class="check-icon">
                                <svg viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3"/></svg>
                            </span>
                            See how compensation and bonuses differ across finance roles
                        </li>
                        <li>
                            <span class="check-icon">
                                <svg viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3"/></svg>
                            </span>
                            Discover which certifications are linked to real salary premiums
                        </li>
                    </ul>

                </div>

                <div class="salary-right">
                    <div class="doc-image-wrap">
                        <img src="https://www.financialprofessionals.org/images/default-source/2025-fp-a-forum-recap/inside-page-of-the-afp-comepnsation-report.png?sfvrsn=433bf36b_1" alt="AFP Compensation Report Sample Page" />
                    </div>
                </div>

            </div>
        </section>`;

        function init() {
            document.body.classList.add(variation_name);

            // Section ko pehle save kar lo
            var sectionToMove = document.querySelector("#site-main > .section");

            // New HTML inject karo
            document.querySelector(".finance-wrap").innerHTML = efxPlusHTML;

            // Bullets ke baad section insert karo
            var bullets = document.querySelector(".salary-left .salary-bullets");

            if (sectionToMove && bullets) {
                bullets.insertAdjacentElement("afterend", sectionToMove);
            }
        }

        waitForElement(".finance-wrap", init, 50, 5000);

    } catch (e) {
        if (debug) console.log(e, "error in Test " + variation_name);
    }
})();