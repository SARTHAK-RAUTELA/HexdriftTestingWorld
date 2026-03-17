(function () {
  try {
    var debug = 1;
    var variation_name = "cre-t-100";

    var config = [
      {
        animal: "Dog",
        breed: "French Bulldog",
        url: "https://petinsurancegurus.com/home/?petType=dog&breed=French+Bulldog",
        imgUrl: "https://v2.crocdn.com/SwiftTest/French%20Bulldog.jpg",
        mobImgUrl: "https://v2.crocdn.com/PetInsurance/French-Bulldog.jpg",
      },
      {
        animal: "Dog",
        breed: "Golden Retriever",
        url: "https://petinsurancegurus.com/home/?petType=dog&breed=Golden+Retriever",
        imgUrl: "https://v2.crocdn.com/SwiftTest/Golden%20Retriever.jpg",
        mobImgUrl: "https://v2.crocdn.com/PetInsurance/Golden-Retriever.jpg",
      },
      {
        animal: "Dog",
        breed: "Dachshund",
        url: "https://petinsurancegurus.com/home/?petType=dog&breed=Dachshund",
        imgUrl: "https://v2.crocdn.com/SwiftTest/Dachshund.jpg",
        mobImgUrl: "https://v2.crocdn.com/PetInsurance/Dachshund.jpg",
      },
      {
        animal: "Dog",
        breed: "German Shepherd",
        url: "https://petinsurancegurus.com/home/?petType=dog&breed=German+Shepherd",
        imgUrl: "https://v2.crocdn.com/SwiftTest/German%20Shepherd.jpg",
        mobImgUrl: "https://v2.crocdn.com/PetInsurance/German-Shepherd.jpg",
      },
      {
        animal: "Dog",
        breed: "Goldendoodle",
        url: "https://petinsurancegurus.com/home/?petType=dog&breed=Goldendoodle",
        imgUrl: "https://v2.crocdn.com/SwiftTest/Goldendoodle.jpg",
        mobImgUrl: "https://v2.crocdn.com/PetInsurance/Goldendoodle.jpg",
      },
      {
        animal: "Dog",
        breed: "Poodle",
        url: "https://petinsurancegurus.com/home/?petType=dog&breed=Poodle",
        imgUrl: "https://v2.crocdn.com/SwiftTest/Poodle.jpg",
        mobImgUrl: "https://v2.crocdn.com/PetInsurance/Poodle.jpg",
      },
      {
        animal: "Dog",
        breed: "English Bulldog",
        url: "https://petinsurancegurus.com/home/?petType=dog&breed=English+Bulldog",
        imgUrl: "https://v2.crocdn.com/SwiftTest/English%20Bulldog.jpg",
        mobImgUrl: "https://v2.crocdn.com/PetInsurance/English-Bulldog.jpg",
      },
      {
        animal: "Dog",
        breed: "Great Dane",
        url: "https://petinsurancegurus.com/home/?petType=dog&breed=Great+Dane",
        imgUrl: "https://v2.crocdn.com/SwiftTest/Great%20Dane.jpg",
        mobImgUrl: "https://v2.crocdn.com/PetInsurance/Great-Dane.jpg",
      },
      {
        animal: "Dog",
        breed: "Cane Corso",
        url: "https://petinsurancegurus.com/home/?petType=dog&breed=Cane+Corso",
        imgUrl: "https://v2.crocdn.com/SwiftTest/Cane%20Corso.jpg",
        mobImgUrl: "https://v2.crocdn.com/PetInsurance/Cane-Corso.jpg",
      },
      {
        animal: "Dog",
        breed: "Bernese Mountain Dog",
        url: "https://petinsurancegurus.com/home/?petType=dog&breed=Bernese+Mountain+Dog",
        imgUrl: "https://v2.crocdn.com/SwiftTest/Bernese%20Mountain%20Dog.jpg",
        mobImgUrl: "https://v2.crocdn.com/PetInsurance/Bernese-Mountain-Dog.jpg",
      },
      {
        animal: "Dog",
        breed: "Labradoodle",
        url: "https://petinsurancegurus.com/home/?petType=dog&breed=Labradoodle",
        imgUrl: "https://v2.crocdn.com/SwiftTest/Labradoodle.jpg",
        mobImgUrl: "https://v2.crocdn.com/PetInsurance/Labradoodle.jpg",
      },
      {
        animal: "Dog",
        breed: "Shih Tzu",
        url: "https://petinsurancegurus.com/home/?petType=dog&breed=Shih+Tzu",
        imgUrl: "https://v2.crocdn.com/SwiftTest/Shih%20Tzu.jpg",
        mobImgUrl: "https://v2.crocdn.com/PetInsurance/Shih-Tzu.jpg",
      },
      {
        animal: "Dog",
        breed: "Mixed Breed (21 to 50 lbs)",
        url: "https://petinsurancegurus.com/home/?petType=dog&breed=Mixed+Breed+%2821+to+50+lbs%29",
        imgUrl: "https://v2.crocdn.com/SwiftTest/Mixed%20Breed.jpg",
        mobImgUrl: "https://v2.crocdn.com/PetInsurance/Mixed-Breed.jpg",
      },
      {
        animal: "Cat",
        breed: "Siberian",
        url: "https://petinsurancegurus.com/home/?petType=cat&breed=Siberian",
        imgUrl: "https://v2.crocdn.com/SwiftTest/Siberian.jpg",
        mobImgUrl: "https://v2.crocdn.com/PetInsurance/Siberian.jpg",
      },
      {
        animal: "Dog",
        breed: "Pug",
        url: "https://petinsurancegurus.com/home/?petType=dog&breed=Pug",
        imgUrl: "https://v2.crocdn.com/SwiftTest/Pug.jpg",
        mobImgUrl: "https://v2.crocdn.com/PetInsurance/Pug.jpg",
      },
      {
        animal: "Dog",
        breed: "Rottweiler",
        url: "https://petinsurancegurus.com/home/?petType=dog&breed=Rottweiler",
        imgUrl: "https://v2.crocdn.com/SwiftTest/Rottweiler.jpg",
        mobImgUrl: "https://v2.crocdn.com/PetInsurance/Rottweiler.jpg",
      },
      {
        animal: "Cat",
        breed: "Sphynx",
        url: "https://petinsurancegurus.com/home/?petType=cat&breed=Sphynx",
        imgUrl: "https://v2.crocdn.com/SwiftTest/Sphynx.jpg",
        mobImgUrl: "https://v2.crocdn.com/PetInsurance/Sphynx.jpg",
      },
      {
        animal: "Dog",
        breed: "Cocker Spaniel",
        url: "https://petinsurancegurus.com/home/?petType=dog&breed=Cocker+Spaniel",
        imgUrl: "https://v2.crocdn.com/SwiftTest/Cocker%20Spaniel.jpg",
        mobImgUrl: "https://v2.crocdn.com/PetInsurance/Cocker-Spaniel.jpg",
      },
      {
        animal: "Dog",
        breed: "Pomeranian",
        url: "https://petinsurancegurus.com/home/?petType=dog&breed=Pomeranian",
        imgUrl: "https://v2.crocdn.com/SwiftTest/Pomeranian.jpg",
        mobImgUrl: "https://v2.crocdn.com/PetInsurance/Pomeranian.jpg",
      },
      {
        animal: "Dog",
        breed: "Maltese",
        url: "https://petinsurancegurus.com/home/?petType=dog&breed=Maltese",
        imgUrl: "https://v2.crocdn.com/SwiftTest/Maltese.jpg",
        mobImgUrl: "https://v2.crocdn.com/PetInsurance/Maltese.jpg",
      },
      {
        animal: "Dog",
        breed: "Boston Terrier",
        url: "https://petinsurancegurus.com/home/?petType=dog&breed=Boston+Terrier",
        imgUrl: "https://v2.crocdn.com/SwiftTest/Boston%20Terrier.jpg",
        mobImgUrl: "https://v2.crocdn.com/PetInsurance/Boston-Terrier.jpg",
      },
      {
        animal: "Dog",
        breed: "Shiba Inu",
        url: "https://petinsurancegurus.com/home/?petType=dog&breed=Shiba+Inu",
        imgUrl: "https://v2.crocdn.com/SwiftTest/Shiba%20Inu.jpg",
        mobImgUrl: "https://v2.crocdn.com/PetInsurance/Shiba-Inu.jpg",
      },
      {
        animal: "Dog",
        breed: "Havanese",
        url: "https://petinsurancegurus.com/home/?fecli=activate&petType=dog&breed=Havanese",
        imgUrl: "https://v2.crocdn.com/SwiftTest/Havanese.jpg",
        mobImgUrl: "https://v2.crocdn.com/PetInsurance/Havanese.jpg",
      },
      {
        animal: "Dog",
        breed: "Boxer",
        url: "https://petinsurancegurus.com/home/?fecli=activate&petType=dog&breed=Boxer",
        imgUrl: "https://v2.crocdn.com/SwiftTest/Boxer.jpg",
        mobImgUrl: "https://v2.crocdn.com/PetInsurance/Boxer.jpg",
      },
      {
        animal: "Cat",
        breed: "Ragdoll",
        url: "https://petinsurancegurus.com/home/?petType=cat&breed=Ragdoll",
        imgUrl: "https://v2.crocdn.com/SwiftTest/Ragdoll.jpg",
        mobImgUrl: "https://v2.crocdn.com/PetInsurance/Ragdoll.jpg",
      },
    ];

    /* --- Helper Library --- */
    var _$;
    !(function (factory) {
      _$ = factory();
    })(function () {
      var bm = function (s) {
        if (typeof s === "string") {
          this.value = Array.prototype.slice.call(document.querySelectorAll(s));
        }
        if (typeof s === "object") {
          this.value = [s];
        }
      };
      bm.prototype = {
        each: function (fn) {
          [].forEach.call(this.value, fn);
          return this;
        },
        addClass: function (v) {
          var a = v.split(" ");
          return this.each(function (i) {
            for (var x = 0; x < a.length; x++) {
              if (i.classList) i.classList.add(a[x]);
              else i.className += " " + a[x];
            }
          });
        },
        waitForElement: function (selector, trigger, delayInterval, delayTimeout) {
          var interval = setInterval(function () {
            if (document.querySelector(selector)) {
              clearInterval(interval);
              trigger();
            }
          }, delayInterval);
          setTimeout(function () {
            clearInterval(interval);
          }, delayTimeout);
        },
      };
      return function (selector) {
        return new bm(selector);
      };
    });

    var helper = _$();

    function debounce(func, timeout = 1000) {
      let timer;
      return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          func.apply(this, args);
        }, timeout);
      };
    }

    function observeTextContent(selector, callback, options = {}) {
      const document = options.document || window.document;
      const processed = new Map(); // Stores the internal observer for cleanup
      let mainObs;
      let isDone = false;

      const done = () => {
        if (mainObs) mainObs.disconnect();
        processed.forEach((obs) => obs.disconnect());
        processed.clear();
        isDone = true;
      };

      const watchElementText = (el) => {
        if (processed.has(el)) return;

        // Create an observer for this specific element's internal text
        const textObs = new MutationObserver((mutations) => {
          // Pass the current text and the mutations to the callback
          callback(el.textContent, el, mutations);
        });

        textObs.observe(el, {
          characterData: true,
          childList: true,
          subtree: true,
        });

        processed.set(el, textObs);

        // Optional: Trigger callback immediately with initial value
        callback(el.textContent, el, []);

        if (options.once) done();
      };

      const lookForSelector = () => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el) => watchElementText(el));
      };

      // Use a small delay to handle rapid DOM changes (like MUI transitions)
      const debouncedLook = debounce(() => lookForSelector(), 100);

      lookForSelector();

      if (!isDone) {
        mainObs = new MutationObserver(() => debouncedLook());
        mainObs.observe(document.documentElement, {
          childList: true,
          subtree: true,
        });
      }

      return done;
    }

    /* Live Event Listener */
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

    function handleTest83() {

      helper.waitForElement('body.cre-t-google-state .ct-headline.home-heading span', function () {
        document.querySelector('.ct-headline.home-heading span').childNodes.forEach(function (item) {
          if (item.nodeName === "#text" && item.textContent.includes('in ')) {
            sessionStorage.setItem("cre-t-100-geo-value", item.textContent);
            item.remove();
          }
        });
      }, 25, 25000);

      helper.waitForElement('.SWF_83_Hero_img', function () {
        const img83 = document.querySelector('.SWF_83_Hero_img');
        img83.classList.add('cre-t-100-hide-83-img')
      }, 25, 25000);
    }

    function revertTest83() {
      helper.waitForElement('body.cre-t-google-state .ct-headline.home-heading span', function () {
        const target = document.querySelector('.ct-headline.home-heading span');
        target.childNodes.forEach(function (item) {
          if (item.nodeName === "#text" && item.textContent.includes('in ')) {
            item.remove();
          }
        });
        const text = sessionStorage.getItem("cre-t-100-geo-value");
        if (!text) return;
        const newText = document.createTextNode(text);
        target.appendChild(newText);
      }, 25, 25000);

      helper.waitForElement('.SWF_83_Hero_img', function () {
        const img83 = document.querySelector('.SWF_83_Hero_img');
        img83.classList.remove('cre-t-100-hide-83-img')
      }, 25, 25000);
    }

    function getUrlAndUpdateHeaderAndImg() {
      const urlParams = new URL(window.location.href);
      const breedParam = urlParams.searchParams.get("breed");
      const petTypeParam = urlParams.searchParams.get("petType");

      // Exit early if breedParam is missing and not stored in session
      if (!breedParam) {
        revertToOriginal();
        return;
      }

      handleTest83();

      // If url has %20, replace it with space
      const cleanBreed = decodeURIComponent(breedParam.replace(/\+/g, " "));

      if (document.body.getAttribute("data-cre-100-last-breed") === cleanBreed) return;

      // Find the matched breed configuration
      const matchedConfig = config.find((item) => item.breed.toLowerCase() === cleanBreed.toLowerCase());
      if (matchedConfig) {
        if (!document.body.classList.contains(variation_name)) {
          document.body.classList.add(variation_name);
        }
        // If no petTypeParam, select the appropriate tab
        if (!petTypeParam) {
          setBreedInputValue(breedParam);
        }

        document.body.setAttribute("data-cre-100-last-breed", matchedConfig.breed);
        // Update UI (text and image)
        updateUI(matchedConfig);
      } else {
        // Fallback: revert UI to original state if no match found
        revertToOriginal();
      }
    }

    function setBreedInputValue(breedParam) {
      helper.waitForElement(
        ".breed-select input",
        function () {
          var getInput = document.querySelector(".breed-select input");
          setNativeValue(getInput, breedParam);
        },
        25,
        25000,
      );
    }

    function updateUI(matchedConfig) {
      var targetTextElement = document.querySelector(".home-heading .ct-span .underline .hide-mobile");
      var heroImage = document.querySelector("#image-5-63");

      if (targetTextElement) {
        if (!targetTextElement.getAttribute("data-original")) {
          targetTextElement.setAttribute("data-original", targetTextElement.textContent);
        }
        let breedText = matchedConfig.breed;
        // This is for mixed breed 21lbs to 50lbs

        if (breedText.includes("Mixed Breed")) {
          breedText = "Mixed Breed";
        }

        // Insert the breed text after the .hide-mobile span
        const breedElement = document.querySelector(".cre-t-100-bold-breed");
        if (!breedElement) {
          targetTextElement.insertAdjacentHTML("afterend", " <span class='cre-t-100-bold-breed' style='display: none;'>for " + breedText + "s</span>");
        } else {
          breedElement.textContent = "for " + breedText + "s";
        }
      }




      document.body.classList.add("cre-t-100-hide-original-hero-img");
      // For Desktop
      if (matchedConfig.imgUrl && heroImage) {

        const customImageSelector = ".cre-t-100-hero-img";
        const customImageExists = document.querySelector(customImageSelector);

        if (!customImageExists) {
          const cleanUrl = matchedConfig.imgUrl.trim();
          const altText = matchedConfig.breed || "Pet breed image";

          heroImage.insertAdjacentHTML("beforebegin", `<img src='${cleanUrl}' alt='${altText}' class='cre-t-100-hero-img' style='display: none;'>`);
        } else {
          // Update existing custom image src if breed changes
          document.querySelector(customImageSelector).src = matchedConfig.imgUrl.trim();
        }
      }
      // For mobile
      if (matchedConfig.mobImgUrl && heroImage) {
        const customImageSelector = ".cre-t-100-hero-img-mobile";
        const customImageExists = document.querySelector(customImageSelector);

        if (!customImageExists) {
          const cleanUrl = matchedConfig.mobImgUrl.trim();
          const altText = matchedConfig.breed || "Pet breed image";

          heroImage.insertAdjacentHTML("beforebegin", `<img src='${cleanUrl}' alt='${altText}' class='cre-t-100-hero-img-mobile' style='display: none;'>`);
        } else {
          // Update existing custom image src if breed changes
          document.querySelector(customImageSelector).src = matchedConfig.mobImgUrl.trim();
        }
      }
    }

    function revertToOriginal() {
      document.body.removeAttribute("data-cre-100-last-breed");
      if (document.querySelector(".cre-t-100-bold-breed")) {
        document.querySelector(".cre-t-100-bold-breed").remove();
      }

      document.body.classList.remove("cre-t-100-hide-original-hero-img");
      // Remove the Hero img custom element
      if (document.querySelector(".cre-t-100-hero-img") && document.querySelector(".cre-t-100-hero-img-mobile")) {
        document.querySelector(".cre-t-100-hero-img").remove();
        document.querySelector(".cre-t-100-hero-img-mobile").remove();
      }
      const targetTextElement = document.querySelector(".home-heading .ct-span .underline .hide-mobile");
      const heroImage = document.querySelector("#intro-section .ct-section-inner-wrap .hero-image-container img");

      if (targetTextElement && targetTextElement.getAttribute("data-original")) {
        targetTextElement.textContent = targetTextElement.getAttribute("data-original");
      }
      if (heroImage && heroImage.getAttribute("data-original-src")) {
        heroImage.src = heroImage.getAttribute("data-original-src");
        heroImage.setAttribute("srcset", heroImage.getAttribute("data-original-srcset") || "");
      }

      //for the css changes also remove variation class from body
      if (document.querySelector("body").classList.contains(variation_name)) {
        document.body.classList.remove(variation_name);
      }

      revertTest83();
    }

    function setNativeValue(element, value) {
      let lastValue = element.value;
      element.value = value;
      let event = new Event("input", { target: element, bubbles: true });

      let tracker = element._valueTracker;
      if (tracker) {
        tracker.setValue(lastValue);
      }
      element.dispatchEvent(event);
    }

    function addCustomElement() {
      helper.waitForElement(
        `.home-heading .ct-span .underline .hide-mobile`,
        function () {
          document.querySelectorAll(".underline").forEach((el) => {
            const firstText = el.childNodes[0];

            if (firstText && firstText.nodeType === Node.TEXT_NODE) {
              const newSpan = document.createElement("span");
              newSpan.className = "cre-t-100-first-part";
              newSpan.textContent = firstText.textContent;

              el.replaceChild(newSpan, firstText);
            }
          });
        },
        50,
        25000,
      );
    }

    function onPageLoad() {
      if (window.location.href.includes("breed=") && !window.location.href.includes("petType=")) {
        if (document.querySelector(`.breed-select #breed-select span`)) {
          if (document.querySelector(`.breed-select #breed-select span`).textContent.length > 1) return;
        }

        helper.waitForElement(
          ".breed-select input",
          function () {
            if (document.querySelector(`.breed-select #breed-select span`).textContent.length <= 1) {
              document.querySelector(`.breed-select #breed-select span`).textContent = "All Breeds";
            }
          },
          25,
          25000,
        );
      }
    }

    function init() {
      if (document.querySelector('.cre-t-81')) return;
      _$("body").addClass(variation_name);

      helper.waitForElement('body.cre-t-google-state .ct-headline.home-heading span', function () {
        document.querySelector('.ct-headline.home-heading span').childNodes.forEach(function (item) {
          if (item.nodeName === "#text" && item.textContent.includes('in ')) {
            sessionStorage.setItem("cre-t-100-geo-value", item.textContent);
          }
        });
      }, 25, 25000);

      if (!window.cre_100_events) {
        window.cre_100_events = true;

        observeTextContent("#breed-select", (text) => {
          getUrlAndUpdateHeaderAndImg();
        });
      }
      addCustomElement();
      onPageLoad();
    }
    helper.waitForElement(`.home-heading .ct-span .underline`, init, 50, 25000);
  } catch (e) {
    if (debug) console.log(e, "error in Test " + variation_name);
  }
})();