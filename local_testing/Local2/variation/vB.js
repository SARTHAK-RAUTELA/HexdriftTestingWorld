(function () {
  try {
    /* main variables */
    var debug = 0;
    var variation_name = "cre-t-21";

     var MOUNT_SELECTOR = "#site-main";

    /* all Pure helper functions */
    function waitForElement(selector, trigger, delayInterval, delayTimeout) {
      delayInterval = delayInterval || 50;
      delayTimeout = delayTimeout || 15000;
      var interval = setInterval(function () {
        if (document && document.querySelector(selector) && document.querySelectorAll(selector).length > 0) {
          clearInterval(interval);
          trigger();
        }
      }, delayInterval);
      setTimeout(function () {
        clearInterval(interval);
      }, delayTimeout);
    }




    //inject scripts
    const injectScripts = () => {
      return fetch(
        "https://cdnjs.cloudflare.com/ajax/libs/Swiper/8.3.2/swiper-bundle.min.js"
      )
        .then((res) => res.text())
        .then((code) => {
          new Function(code)();

          if (typeof window.Swiper !== "function") {
            throw new Error("Swiper failed to initialize");
          }
        });
    };
    const injectSwiperCSS = () => {
      if (document.querySelector("#cre-swiper-css")) return;

      const css = document.createElement("link");

      css.id = "cre-swiper-css";
      css.rel = "stylesheet";
      css.href =
        "https://cdnjs.cloudflare.com/ajax/libs/Swiper/8.3.2/swiper-bundle.css";

      document.head.appendChild(css);
    };


    /* =====================================================================
       image logo url .

       ===================================================================== */
     const logosData = [
      { name: "Pfizer", img: "https://v2.crocdn.com/AFP/test21/pfizer.png" },
      { name: "Sodexo", img: "https://v2.crocdn.com/AFP/test21/Sodexo.png" },
      { name: "Uline", img: "https://v2.crocdn.com/AFP/test21/Uline.png" },
      { name: "Verizon", img: "https://v2.crocdn.com/AFP/test21/Verizon.png" },
      { name: "Volkswagen", img: "https://v2.crocdn.com/AFP/test21/Volkswagen.png" },
      { name: "Nissan", img: "https://v2.crocdn.com/AFP/test21/Nissan.png" },
      { name: "New York", img: "https://v2.crocdn.com/AFP/test21/Newyouk.png" },
      { name: "Netflix", img: "https://v2.crocdn.com/AFP/test21/Netflix.png" },
      { name: "IBM", img: "https://v2.crocdn.com/AFP/test21/IBM.png" },
      { name: "Gamestop", img: "https://v2.crocdn.com/AFP/test21/Gamestop.png" },
      { name: "Fedex", img: "https://v2.crocdn.com/AFP/test21/Fedex.png" },
      { name: "Coca-Cola", img: "https://v2.crocdn.com/AFP/test21/Cocacola.png" },
      { name: "AMC", img: "https://v2.crocdn.com/AFP/test21/AMC.png" },
    ];

    var testimonialsData = [
      {
         img:
          "https://v2.crocdn.com/AFP/test21/img16.jpg",

        quote:
          "The value of AFP is not limited to what I learn. It is also found in the relationships I build, the ideas I contribute, and the opportunities I have to help advance the profession.",
        name: "Rosemary Linden",
        role: "President, Momentum CFO",
      },
       {
         img:
          "https://v2.crocdn.com/AFP/test21/img13.jpg",

        quote:
          "The network you can build through AFP is something you can&rsquo;t really put a price tag on. You never know when you&rsquo;ll want or need to tap into it, and that kind of access is something you just can&rsquo;t buy.",
        name: "Mario Vasquez",
        role: "Senior Director, Finance, E.W. Scripps",
      },
       {
         img:
          "https://v2.crocdn.com/AFP/test21/img3.jpg",


        quote:
          "It&rsquo;s very helpful to hear from others in the industry, their challenges, how to overcome those, what to do and not do. I have ideas that can implement in our organization.",
        name: "Cheyenne Brubaker",
        role: "Founder, Arcane Accounting",
      },
      {
         img:
          "https://v2.crocdn.com/AFP/test21/img15.jpg",


          quote:
          "My peers are a resource for finding solutions, excellence and a shortcut that it gives me the platform to succeed.",
        name: "Raquel Alvarez Mateos",
        role: "Director of Finance, Kearney",
      },


    ];

    var featuresData = [
      {
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44" fill="none">
  <circle cx="22" cy="22" r="22" fill="#027DB6"></circle>
  <path d="M21.8967 22.3458C21.49 22.3458 21.156 22.1947 20.8946 21.8925C20.6332 21.5902 20.5373 21.2376 20.6071 20.8345L20.881 19.1773C20.998 18.5414 21.3039 18.0195 21.7986 17.6118C22.2932 17.2039 22.8611 17 23.5024 17C24.1586 17 24.734 17.2039 25.2285 17.6118C25.7233 18.0195 26.0292 18.5414 26.1462 19.1773L26.4201 20.8345C26.4899 21.2376 26.394 21.5902 26.1326 21.8925C25.8712 22.1947 25.5371 22.3458 25.1304 22.3458H21.8967ZM22.2772 20.742H24.75L24.5326 19.4323C24.4964 19.1829 24.3786 18.9824 24.1793 18.8309C23.9801 18.6795 23.7536 18.6037 23.5 18.6037C23.2464 18.6037 23.0245 18.6795 22.8342 18.8309C22.644 18.9824 22.5308 19.1829 22.4946 19.4323L22.2772 20.742ZM14.1826 23.234C13.8279 23.2518 13.5207 23.1842 13.2611 23.0311C13.0015 22.878 12.8324 22.6407 12.7538 22.319C12.7176 22.1793 12.7102 22.0412 12.7318 21.9047C12.7534 21.7684 12.7935 21.6381 12.8522 21.5137C12.8522 21.5294 12.8431 21.4984 12.825 21.4207C12.7957 21.3851 12.7189 21.202 12.5948 20.8717C12.5657 20.6853 12.5896 20.5091 12.6666 20.3432C12.7436 20.1774 12.8437 20.0341 12.9671 19.9134C12.974 19.9134 12.9886 19.8991 13.0109 19.8704C13.0424 19.581 13.1642 19.3374 13.3764 19.1394C13.5885 18.9414 13.8478 18.8424 14.1543 18.8424C14.1877 18.8424 14.3354 18.8712 14.5976 18.9288L14.6685 18.9122C14.7451 18.8334 14.8447 18.7744 14.9674 18.735C15.09 18.6956 15.2204 18.6759 15.3584 18.6759C15.5302 18.6759 15.6825 18.7019 15.8155 18.7539C15.9483 18.806 16.0534 18.8884 16.131 19.0012C16.1464 19.0012 16.158 19.0052 16.1658 19.0132C16.1736 19.0212 16.1851 19.0252 16.2005 19.0252C16.4125 19.0431 16.6009 19.1087 16.7658 19.2222C16.9306 19.3357 17.0523 19.4908 17.1307 19.6873C17.1601 19.7983 17.1719 19.9015 17.1663 19.9968C17.1607 20.092 17.1398 20.1862 17.1035 20.2794C17.1035 20.2904 17.1126 20.3227 17.1307 20.3761C17.2437 20.4871 17.3295 20.6047 17.388 20.7287C17.4466 20.8527 17.4758 20.9847 17.4758 21.1245C17.4758 21.1753 17.4319 21.335 17.344 21.6035C17.333 21.6254 17.333 21.6577 17.344 21.7003C17.3511 21.7208 17.3658 21.8427 17.388 22.0662C17.388 22.3868 17.2518 22.6615 16.9793 22.8905C16.7071 23.1195 16.3764 23.234 15.9875 23.234H14.1826ZM31.9389 23.2917C31.4285 23.2917 30.9901 23.1121 30.6236 22.7529C30.2572 22.3936 30.0739 21.9618 30.0739 21.4573C30.0739 21.2738 30.101 21.1024 30.1552 20.9433C30.2091 20.784 30.2824 20.6285 30.375 20.4769L29.722 19.91C29.5666 19.789 29.5393 19.637 29.6402 19.454C29.7413 19.271 29.8851 19.1795 30.0715 19.1795H31.9364C32.4493 19.1795 32.8872 19.3583 33.2503 19.7159C33.6131 20.0734 33.7946 20.5032 33.7946 21.0053V21.4619C33.7946 21.9606 33.6129 22.3903 33.2495 22.751C32.8861 23.1115 32.4492 23.2917 31.9389 23.2917ZM11 28V26.6964C11 25.974 11.3789 25.3871 12.1367 24.9355C12.8945 24.4838 13.8779 24.258 15.087 24.258C15.3083 24.258 15.5207 24.2641 15.7242 24.2764C15.9276 24.2887 16.122 24.3127 16.3073 24.3483C16.1024 24.6637 15.947 24.9992 15.841 25.3549C15.7352 25.7108 15.6823 26.0898 15.6823 26.492V28H11ZM17.5217 28V26.5299C17.5217 25.5087 18.0742 24.6897 19.1791 24.073C20.284 23.4561 21.7253 23.1476 23.503 23.1476C25.2972 23.1476 26.7417 23.4561 27.8364 24.073C28.931 24.6897 29.4783 25.5087 29.4783 26.5299V28H17.5217ZM31.9239 24.258C33.1467 24.258 34.1318 24.4838 34.8791 24.9355C35.6264 25.3871 36 25.974 36 26.6964V28H31.3177V26.492C31.3177 26.0898 31.2693 25.7108 31.1726 25.3549C31.0756 24.9992 30.9303 24.6637 30.7367 24.3483C30.922 24.3127 31.1142 24.2887 31.3133 24.2764C31.5126 24.2641 31.7161 24.258 31.9239 24.258ZM23.4986 24.7514C22.3693 24.7514 21.3988 24.8987 20.5872 25.1935C19.7755 25.4882 19.325 25.8514 19.2359 26.2832V26.3963H27.781V26.2832C27.6806 25.8514 27.2291 25.4882 26.4264 25.1935C25.6238 24.8987 24.6479 24.7514 23.4986 24.7514Z" fill="white"></path>
</svg>`,
        title: "Community",
        desc: "Gain practical help and advice from peers who&rsquo;ve solved similar challenges.",
      },
      {
         svg: `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44" fill="none">
  <circle cx="22" cy="22" r="22" fill="#027DB6"></circle>
  <path d="M15.8077 31C15.3091 31 14.8831 30.8234 14.5298 30.4703C14.1766 30.1169 14 29.6909 14 29.1923V17.9943C13.7065 17.8429 13.4664 17.6278 13.2798 17.349C13.0933 17.0702 13 16.7487 13 16.3845V13.8077C13 13.3091 13.1766 12.8831 13.5298 12.5298C13.8831 12.1766 14.3091 12 14.8077 12H30.1923C30.6909 12 31.1169 12.1766 31.4703 12.5298C31.8234 12.8831 32 13.3091 32 13.8077V16.3845C32 16.7487 31.9067 17.0702 31.7203 17.349C31.5336 17.6278 31.2935 17.8429 31 17.9943V29.1923C31 29.6909 30.8234 30.1169 30.4703 30.4703C30.1169 30.8234 29.6909 31 29.1923 31H15.8077ZM15.5 18.1923V29.1443C15.5 29.2467 15.5368 29.3317 15.6105 29.399C15.6843 29.4663 15.7757 29.5 15.8848 29.5H29.1923C29.2821 29.5 29.3558 29.4712 29.4135 29.4135C29.4712 29.3558 29.5 29.2821 29.5 29.1923V18.1923H15.5ZM14.8077 16.6923H30.1923C30.2821 16.6923 30.3558 16.6634 30.4135 16.6057C30.4712 16.5481 30.5 16.4743 30.5 16.3845V13.8077C30.5 13.7179 30.4712 13.6442 30.4135 13.5865C30.3558 13.5288 30.2821 13.5 30.1923 13.5H14.8077C14.7179 13.5 14.6442 13.5288 14.5865 13.5865C14.5288 13.6442 14.5 13.7179 14.5 13.8077V16.3845C14.5 16.4743 14.5288 16.5481 14.5865 16.6057C14.6442 16.6634 14.7179 16.6923 14.8077 16.6923ZM19.6923 22.9327H25.3077V21.5H19.6923V22.9327Z" fill="white"></path>
</svg>`,
        title: "Practical Tools",
        desc: "Turn ideas into action with templates, benchmarks, tools and a deep knowledge base.",
      },
      {
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44" fill="none">
  <circle cx="22" cy="22" r="22" fill="#027DB6"></circle>
  <path d="M13.8077 30.3943C13.3106 30.3943 12.885 30.2173 12.531 29.8633C12.177 29.5093 12 29.0837 12 28.5865V13.25L13.425 14.675L15.075 13L16.75 14.675L18.425 13L20.075 14.675L21.75 13L23.425 14.675L25.075 13L26.75 14.675L28.425 13L30.075 14.675L31.5 13.25V28.5865C31.5 29.0837 31.323 29.5093 30.969 29.8633C30.615 30.2173 30.1894 30.3943 29.6923 30.3943H13.8077ZM13.8077 28.8943H21V22.3943H13.5V28.5865C13.5 28.6763 13.5288 28.7501 13.5865 28.8077C13.6442 28.8654 13.7179 28.8943 13.8077 28.8943ZM22.5 28.8943H29.6923C29.7821 28.8943 29.8558 28.8654 29.9135 28.8077C29.9712 28.7501 30 28.6763 30 28.5865V26.3943H22.5V28.8943ZM22.5 24.8943H30V22.3943H22.5V24.8943ZM13.5 20.8943H30V17.298H13.5V20.8943Z" fill="white"></path>
</svg>`,
        title: "Stay Current",
        desc: "Keep pace with change through reports, events, and the people actually living through it.",
      },
      {
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44" fill="none">
  <circle cx="22" cy="22" r="22" fill="#027DB6"></circle>
  <path d="M20.3 22.9885L21.127 20.273L18.952 18.5962H21.6578L22.5 15.8923L23.3422 18.5962H26.048L23.8577 20.273L24.6845 22.9885L22.5 21.3L20.3 22.9885ZM17 31.7307V24.573C16.3667 23.9115 15.875 23.1468 15.525 22.2788C15.175 21.4109 15 20.4847 15 19.5C15 17.4077 15.7269 15.6346 17.1808 14.1807C18.6346 12.7269 20.4077 12 22.5 12C24.5923 12 26.3654 12.7269 27.8193 14.1807C29.2731 15.6346 30 17.4077 30 19.5C30 20.4847 29.825 21.4109 29.475 22.2788C29.125 23.1468 28.6333 23.9115 28 24.573V31.7307L22.5 29.9807L17 31.7307ZM26.75 23.75C27.9167 22.5833 28.5 21.1667 28.5 19.5C28.5 17.8333 27.9167 16.4167 26.75 15.25C25.5833 14.0833 24.1667 13.5 22.5 13.5C20.8333 13.5 19.4167 14.0833 18.25 15.25C17.0833 16.4167 16.5 17.8333 16.5 19.5C16.5 21.1667 17.0833 22.5833 18.25 23.75C19.4167 24.9167 20.8333 25.5 22.5 25.5C24.1667 25.5 25.5833 24.9167 26.75 23.75ZM18.5 29.5345L22.5 28.4615L26.5 29.5345V25.8193C25.9295 26.1911 25.3052 26.4808 24.627 26.6885C23.9487 26.8962 23.2397 27 22.5 27C21.7603 27 21.0513 26.8962 20.373 26.6885C19.6948 26.4808 19.0705 26.1911 18.5 25.8193V29.5345Z" fill="white"></path>
</svg>`,
        title: "Certification",
        desc: "Earn credits towards CTP&reg; and FPAC&reg;, plus discounted exam rates and study resources.",
      },
      {
        svg: `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 44 44" fill="none">
  <circle cx="22" cy="22" r="22" fill="#027DB6"></circle>
  <path d="M25.0423 23.9578C24.6038 23.5192 24.3845 22.9885 24.3845 22.3655C24.3845 21.7423 24.6038 21.2115 25.0423 20.773C25.4808 20.3347 26.0115 20.1155 26.6345 20.1155C27.2577 20.1155 27.7884 20.3347 28.2268 20.773C28.6653 21.2115 28.8845 21.7423 28.8845 22.3655C28.8845 22.9885 28.6653 23.5192 28.2268 23.9578C27.7884 24.3962 27.2577 24.6155 26.6345 24.6155C26.0115 24.6155 25.4808 24.3962 25.0423 23.9578ZM21.8845 29.6155V28.4655C21.8845 28.1103 21.9753 27.7843 22.157 27.4873C22.3387 27.1903 22.5966 26.9766 22.9307 26.8463C23.5124 26.6026 24.1143 26.4198 24.7363 26.298C25.3583 26.1763 25.991 26.1155 26.6345 26.1155C27.2652 26.1155 27.8918 26.1763 28.5142 26.298C29.1368 26.4198 29.7448 26.6026 30.3385 26.8463C30.6727 26.9766 30.9305 27.1903 31.112 27.4873C31.2937 27.7843 31.3845 28.1103 31.3845 28.4655V29.6155H21.8845ZM17.026 20.974C16.342 20.2902 16 19.4655 16 18.5C16 17.5347 16.342 16.71 17.026 16.026C17.7098 15.342 18.5345 15 19.5 15C20.4653 15 21.29 15.342 21.974 16.026C22.658 16.71 23 17.5347 23 18.5C23 19.4655 22.658 20.2902 21.974 20.974C21.29 21.658 20.4653 22 19.5 22C18.5345 22 17.7098 21.658 17.026 20.974ZM12 29.6155V27.3923C12 26.8927 12.1304 26.4336 12.3913 26.0148C12.6523 25.5959 13.0102 25.2808 13.4653 25.0693C14.4076 24.5949 15.3857 24.234 16.3995 23.9865C17.4133 23.7392 18.4468 23.6155 19.5 23.6155C19.9935 23.6155 20.4871 23.6511 20.9808 23.7222C21.4743 23.7934 21.9678 23.8796 22.4615 23.9808C22.2487 24.1968 22.0358 24.4128 21.823 24.629L21.1845 25.277C20.9038 25.2097 20.6231 25.1659 20.3422 25.1458C20.0614 25.1256 19.7807 25.1155 19.5 25.1155C18.5653 25.1155 17.6467 25.2225 16.7442 25.4365C15.8416 25.6507 14.9781 25.9744 14.1538 26.4078C13.9614 26.5103 13.8043 26.6445 13.6825 26.8105C13.5608 26.9767 13.5 27.1706 13.5 27.3923V28.1155H19.5V29.6155H12ZM20.9125 19.9125C21.3042 19.5208 21.5 19.05 21.5 18.5C21.5 17.95 21.3042 17.4792 20.9125 17.0875C20.5208 16.6958 20.05 16.5 19.5 16.5C18.95 16.5 18.4792 16.6958 18.0875 17.0875C17.6958 17.4792 17.5 17.95 17.5 18.5C17.5 19.05 17.6958 19.5208 18.0875 19.9125C18.4792 20.3042 18.95 20.5 19.5 20.5C20.05 20.5 20.5208 20.3042 20.9125 19.9125Z" fill="white"></path>
</svg>`,
        title: "Leadership",
        desc: "Build your reputation, develop leadership skills and contribute back to the profession.",
      },
    ];

    var contentBlocksData = [
      {
        bigimg: "https://v2.crocdn.com/AFP/test21/img4.jpg",
        shortimg: "https://v2.crocdn.com/AFP/test21/image%2045.png",
        reverse: false,
        tag: "COMMUNITY",
        heading: "Learn From Experienced Practitioners",
        paragraph:
          "Some of the biggest treasury and finance decisions don&rsquo;t come with a clear answer. Whether you&rsquo;re solving an everyday challenge or navigating a career-defining moment, you can lean on experienced practitioners who&rsquo;ve been there before through AFP Collaborate, conferences, local events and professional communities.",
        quote:
          "I would not even have heard about the company we went with if it weren&rsquo;t for the AFP event. It&rsquo;s those kinds of connections that can be really powerful.",
        authorName: "Frank Chou",
        authorRole: ", CTP, FPAC, Chief Financial Officer",
      },
      {
          bigimg: "https://v2.crocdn.com/AFP/test21/img6.jpg",

        shortimg: "https://v2.crocdn.com/AFP/test21/Mario-Vasquez%202.png",
        reverse: true,
        tag: "PRACTICAL TOOLS",
        heading: "Put Ideas Into Practice",
        paragraph:
          "Access thousands of highly-practical resources, including tools, templates, guides, checklists and benchmarks. Built by practitioners, for practitioners, they help with everything from evaluating a new TMS to developing a liquidity policy, so you&rsquo;re never starting from scratch.",
        quote:
          "I&rsquo;m always thinking about ROI and how to maximize it, and the resources on AFP Learn are great.",
        authorName: "Mario Vasquez",
        authorRole: ", FPAC, Senior Director",
      },
      {
           bigimg: "https://v2.crocdn.com/AFP/test21/img1.jpg",

        shortimg: "https://v2.crocdn.com/AFP/test21/image%2048.png ",

        reverse: false,
        tag: "STAY CURRENT",
        heading: "Stay Up-To-Date",
        paragraph:
          "Treasury and finance never stand still. Regulations shift, technology evolves and markets move quickly. Through research, learning, events and a community of experienced professionals, AFP helps you stay ahead of the issues shaping the profession today.",
        quote: "Every time I engage with my peers, I learn something new.",
        authorName: "Lora Burton",
        authorRole: ", CTP, SVP Treasurer",
      },
      {
           bigimg: "https://v2.crocdn.com/AFP/test21/img5.jpg",

        shortimg: "https://v2.crocdn.com/AFP/test21/image%2050.png",

        reverse: true,
        tag: "CERTIFICATION",
        heading: "Maintain Your Certification",
        paragraph:
          "Whether you&rsquo;re pursuing CTP&reg;, working toward FPAC&reg;, or maintaining a credential you already hold, AFP membership provides the certification credits, exam discounts and study resources to help you get there.",
        quote:
          "What initially drew me was for the CTP, the exam prep platform was very valuable.",
        authorName: "Cheyenne Brubaker",
        authorRole: ", Founder",
      },
      {
           bigimg: "https://v2.crocdn.com/AFP/test21/img2.jpg",

        shortimg: "https://v2.crocdn.com/AFP/test21/image%2042.png",

        reverse: false,
        tag: "LEADERSHIP",
        heading: "Help Shape the Future",
        paragraph:
          "As your career progresses, AFP provides unrivalled opportunities to volunteer, mentor and contribute to the profession. Build leadership skills, expand your professional profile and help shape the future of treasury and finance.",
        quote:
          "AFP plays a really important role in advancing the profession, and I&rsquo;m incredibly grateful for how deeply I&rsquo;ve been able to get involved.",
        authorName: "Rosemary Linden",
        authorRole: ", President",
      },
    ];


    var DUMMY_TOOLTIP_TEXT = "Short placeholder tooltip text for this benefit.";

    var valueTableData = [
      {
        group: "Learn &amp; Develop",
        items: [
          { benefit: "AFP Learn Interactive Platform", nonMember: "Not Available", member: "Included", tooltip: DUMMY_TOOLTIP_TEXT },
          { benefit: "Live Webinars (24+ per year)", nonMember: "$50 per webinar", member: "Included", tooltip: DUMMY_TOOLTIP_TEXT },
          { benefit: "Live Virtual Workshops (4+ per year)", nonMember: "$295 per workshop", member: "Included", tooltip: DUMMY_TOOLTIP_TEXT },
          { benefit: "On-Demand Webinars &amp; Courses", nonMember: "Not Available", member: "Included", tooltip: DUMMY_TOOLTIP_TEXT },
          { benefit: "Digital Badges", nonMember: "$50 per badge", member: "Included", tooltip: DUMMY_TOOLTIP_TEXT },
        ],
      },
      {
        group: "Community &amp; Practitioner Insights",
        items: [
          { benefit: "AFP Collaborate Community", nonMember: "Not Available", member: "Included", tooltip: DUMMY_TOOLTIP_TEXT },
          { benefit: "Virtual Member Meet-Ups (6+ per year)", nonMember: "$50 per meet-up", member: "Included", tooltip: DUMMY_TOOLTIP_TEXT },
          { benefit: "Member Networking Opportunities", nonMember: "Limited Access", member: "Included", tooltip: DUMMY_TOOLTIP_TEXT },
        ],
      },
      {
        group: "Research &amp; Practical Resources",
        items: [
          { benefit: "Research Reports", nonMember: "$295 per report", member: "Included", tooltip: DUMMY_TOOLTIP_TEXT },
          { benefit: "Tools &amp; Templates", nonMember: "Not Available", member: "Included", tooltip: DUMMY_TOOLTIP_TEXT },
          { benefit: "Industry Benchmarking Resources", nonMember: "Limited Access", member: "Included", tooltip: DUMMY_TOOLTIP_TEXT },
          { benefit: "Practical Guides &amp; Checklists", nonMember: "Limited Access", member: "Included", tooltip: DUMMY_TOOLTIP_TEXT },
        ],
      },
      {
        group: "Certification &amp; Professional Savings",
        items: [
          { benefit: "Member Pricing for AFP Events", nonMember: "Standard Pricing", member: "Discounted", tooltip: DUMMY_TOOLTIP_TEXT },
          { benefit: "Member Pricing for Certification", nonMember: "Standard Pricing", member: "Discounted", tooltip: DUMMY_TOOLTIP_TEXT },
          { benefit: "Certification Credit Opportunities", nonMember: "Pay Per Activity", member: "Included", tooltip: DUMMY_TOOLTIP_TEXT },
          { benefit: "Professional Development Resources", nonMember: "Limited Access", member: "Included", tooltip: DUMMY_TOOLTIP_TEXT },
        ],
      },
    ];

    /* Tooltip icon shown next to each benefit row label — a simple info*/

    var TOOLTIP_ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="7.25" stroke="#9CA3AF" stroke-width="1.5"></circle><path d="M6.05 6.5C6.05 5.53 6.91 4.75 8 4.75C9.09 4.75 9.95 5.53 9.95 6.5C9.95 7.2 9.55 7.55 9.05 7.9C8.6 8.2 8.3 8.45 8.3 9" stroke="#9CA3AF" stroke-width="1.2" stroke-linecap="round"></path><circle cx="8" cy="11.25" r="0.75" fill="#9CA3AF"></circle></svg>`;

    var faqData = [
      {
        q: "What do I get with AFP membership?",
        a: "Membership includes learning, research, benchmarking, practical resources, certification credit opportunities, member pricing, peer networking and community benefits.",
      },
      {
        q: "Why join AFP instead of using free online resources or AI tools?",
        a: "Information is easy to find. Experience isn&rsquo;t. AFP helps members learn from practitioners who&rsquo;ve already solved similar challenges, alongside practical tools, research and professional development built specifically for treasury and finance professionals.",
      },
      {
        q: "How much does AFP membership cost?",
        a: "Individual AFP membership is $545 per year. Student, early-career and corporate membership options are also available.",
      },
      {
        q: "How long does AFP membership last?",
        a: "AFP membership lasts for 12 months from the month you join. For example, a membership beginning in April will expire on March 31 of the following year.",
      },
      { q: "Can I pay monthly?", a: "Yes. Eligible members can pay monthly through Affirm." },
      {
        q: "Can my employer pay for AFP membership?",
        a: "Yes. Many members receive employer support through professional development, certification, training or learning budgets.",
      },
      {
        q: "Do you offer corporate membership?",
        a: "Yes. AFP offers corporate membership options for organizations that want to support multiple finance professionals.",
      },
      {
        q: "How do I know if my company already has corporate membership?",
        a: "You can check whether your organization already has AFP corporate membership before joining individually.",
      },
      {
        q: "Is AFP membership useful if I am pursuing CTP or FPAC certification?",
        a: "Yes. AFP membership can support your certification journey through learning resources, professional development and credit opportunities.",
      },
      {
        q: "Can AFP membership help me earn and maintain certification credits?",
        a: "Yes. AFP members can access professional development opportunities that support certification maintenance.",
      },
      {
        q: "Is AFP membership only for senior finance professionals?",
        a: "No. AFP supports students, early-career professionals, managers, certified professionals and senior finance leaders.",
      },
      {
        q: "Is there a student or early-career membership option?",
        a: "Yes. AFP offers lower-cost options for students and professionals early in their finance careers.",
      },
      {
        q: "Is AFP membership different from attending AFP conference?",
        a: "Yes. Conference is one way to engage with AFP. Membership provides year-round access to learning, research, tools, community and professional development.",
      },
      {
        q: "What if I belong to a regional AFP association?",
        a: "Regional AFP associations and national AFP membership offer different benefits. AFP membership gives you access to national resources, learning, research, certification support and broader professional community benefits.",
      },
      {
        q: "Still have questions?",
        a: "Our membership team can help with membership options, corporate membership, employer reimbursement and account questions.",
      },
    ];

    /* =====================================================================
       HTML BUILDERS
       ===================================================================== */
    function buildLogosHTML() {
      var single = logosData
        .map(function (logo) {
          return '<div class="placeholder-box logo-placeholder" aria-hidden="true"> <img src="' + logo.img + '" alt="' + logo.name + '" loading="lazy"></div>';
        })
        .join("");
        return single + single;
    }

    function buildTestimonialsHTML() {
      return testimonialsData
        .map(function (t) {
          return (
            '<div class="swiper-slide">' +
            '<article class="testimonial-card">' +
            '<div class="placeholder-box testimonial-card__photo" aria-hidden="true"><img src="' + t.img + '" alt="" loading="lazy"></div>' +
            '<div class="testimonial-card__body">' +
            '<p class="testimonial-card__quote">&ldquo;' + t.quote + "&rdquo;</p>" +
            '<p class="testimonial-card__author">' + t.name + "<br><span>" + t.role + "</span></p>" +
            "</div>" +
            "</article>" +
            "</div>"
          );
        })
        .join("");
    }
    function buildFeaturesHTML() {
      return featuresData
        .map(function (f) {
          return (
            '<div class="feature-card">' +
            '<div class="feature-card__icon" aria-hidden="true">' + f.svg + "</div>" +
            "<h3>" + f.title + "</h3>" +
            "<p>" + f.desc + "</p>"+
            "</div>"
          );
        })
        .join("");
    }

    function buildContentBlocksHTML() {
      return contentBlocksData
        .map(function (b) {
          return (
            '<section class="content-block' + (b.reverse ? " content-block--reverse" : "") + '">' +
            '<div class="container content-block__grid">' +
            '<div class="content-block__text">' +
            '<span class="tag">' + b.tag + "</span>" +
            "<h2>" + b.heading + "</h2>" +
            "<p>" + b.paragraph + "</p>" +
            "</div>" +
            '<div class="content-block__media">' +
            '<div class="media-card">' +
            '<div class="placeholder-box media-card__photo" aria-hidden="true"> <img src="' + b.bigimg + '" alt="" loading="lazy"><div class="placeholder-box media-card__avatar" aria-hidden="true"><img src="' + b.shortimg + '" alt="" loading="lazy"></div></div>' +
           '<div class="media-card__body">' +
          '<p class="media-card__quote"><span>' + b.quote + ' </span>' +
          '<span class="parentheses"> ' +
            '<svg xmlns="http://www.w3.org/2000/svg" width="52" height="37" viewBox="0 0 52 37" fill="none">' +
                '<path d="M5.2 0L12.2353 12.3333C8.87059 12.3333 5.9902 13.541 3.59412 15.9562C1.19804 18.3715 0 21.275 0 24.6667C0 28.0583 1.19804 30.9618 3.59412 33.3771C5.9902 35.7924 8.87059 37 12.2353 37C15.6 37 18.4804 35.7924 20.8765 33.3771C23.2726 30.9618 24.4706 28.0583 24.4706 24.6667C24.4706 23.4847 24.3304 22.3927 24.05 21.3906C23.7696 20.3885 23.349 19.425 22.7882 18.5L12.2353 0H5.2ZM32.7294 0L39.7647 12.3333C36.4 12.3333 33.5196 13.541 31.1235 15.9562C28.7275 18.3715 27.5294 21.275 27.5294 24.6667C27.5294 28.0583 28.7275 30.9618 31.1235 33.3771C33.5196 35.7924 36.4 37 39.7647 37C43.1294 37 46.0098 35.7924 48.4059 33.3771C50.802 30.9618 52 28.0583 52 24.6667C52 23.4847 51.8598 22.3927 51.5794 21.3906C51.299 20.3885 50.8784 19.425 50.3176 18.5L39.7647 0H32.7294Z" fill="#EEF0F1"></path>' +
            '</svg>' +
        '</span>' +
    '</p>' +
    '<p class="media-card__author">' +
        b.authorName +
        '<span>' + b.authorRole + '</span>' +
    '</p>'+
            ' </div>'+
            "</div>" +
            "</div>" +
            "</div>" +
            "</section>"
          );
        })
        .join("");
    }

    function buildValueTableHTML() {
      var rows = "";
      valueTableData.forEach(function (group) {
        rows += `<tr class="table-group"><td colspan="3">${group.group}</td></tr>`;
        group.items.forEach(function (item) {
          rows += `<tr><td data-label="Benefit"><span class="benefit-label">${item.benefit}<span class="tooltip-wrap"><span class="tooltip-icon" tabindex="0" role="button" aria-label="More info about ${item.benefit}">${TOOLTIP_ICON_SVG}</span><span class="tooltip-content" role="tooltip">${item.tooltip}</span></span></span></td><td data-label="AFP Non-Member">${item.nonMember}</td><td data-label="AFP Member" class="is-included"><span class="check"><svg xmlns="http://www.w3.org/2000/svg" width="17" height="13" viewBox="0 0 17 13" fill="none"><path d="M5.7 12.025L0 6.325L1.425 4.9L5.7 9.175L14.875 0L16.3 1.425L5.7 12.025Z" fill="#0076A8"></path></svg></span> ${item.member}</td></tr>`;
        });
      });
      return rows;
    }

    function buildFaqHTML() {
      return faqData
        .map(function (f) {
          return (
            '<details class="faq-item">' +
            "<summary>" + f.q + "</summary>" +
            "<p>" + f.a + "</p>" +
            "</details>"
          );
        })
        .join("");
    }

    function buildPageHTML() {
      return (
        /* ===================== HERO ===================== */
        '<section class="Cre_explore-membership_redesing">' +
        '<section class="hero">' +
        '<div class="container">' +
        '<h1 class="hero__title">Advance Your Treasury and Finance Career with AFP Membership</h1>' +
        '<p class="hero__subtitle">Learn from experienced practitioners, access practical resources, support your professional development and certification, and make better decisions throughout your treasury and finance career.</p>' +
        '<div class="hero__actions">' +
        '<a href="#join" class="btn btn--primary">JOIN AFP</a>' +
        '<a href="https://www.financialprofessionals.org/events/meetings/afp-power-hour--discover-what\'s-possible" class="btn btn--outline" target="_blank" rel="noopener">FREE INFO SESSION</a>' +   "</div>" +
        '<div class="hero__stat">' +
        '<p class="hero__stat-line"><strong>90%</strong> of members are satisfied with their membership</p>' +
        '<span class="hero__stat-source">AFP 2025 Member Survey</span>' +
        "</div>" +
        "</div>" +
        "</section>" +
        '<section class="hero__logos_section">' +
        '<div class="container">' +
          '<p class="hero__trust-text">Join 10,000+ treasury and finance professionals from the world&rsquo;s leading organizations</p>' +

           '<div class="hero__logos">' + buildLogosHTML() + "</div>" +
           "</div>" +
        "</section>" +

        /* ===================== TESTIMONIALS (Swiper) ===================== */
        '<section class="testimonials">' +
        '<div class="container">' +
        '<div class="swiper testimonials-swiper">' +
        '<div class="swiper-wrapper">' + buildTestimonialsHTML() + "</div>" +

        "</div>" +
        '<div class="testimonials-nav">' +
        '<button type="button" class="testimonials-nav__prev" aria-label="Previous testimonial"><svg xmlns="http://www.w3.org/2000/svg" width="39" height="39" viewBox="0 0 39 39" fill="none">'+
 ' <path d="M17.3843 19.5L23.6961 25.8118L21.5526 28.0066L13.046 19.5L21.5526 10.9934L23.6961 13.1882L17.3843 19.5ZM19.4964 39C22.1936 39 24.7287 38.4882 27.1019 37.4646C29.4751 36.4411 31.5394 35.0519 33.2947 33.2973C35.0501 31.5426 36.4399 29.4792 37.4641 27.1071C38.488 24.7349 39 22.2004 39 19.5036C39 16.8064 38.4882 14.2713 37.4646 11.8981C36.4411 9.52489 35.0519 7.46063 33.2973 5.70529C31.5426 3.94995 29.4792 2.56014 27.1071 1.53588C24.7349 0.51196 22.2004 0 19.5036 0C16.8064 0 14.2713 0.511789 11.8981 1.53537C9.52489 2.55895 7.46063 3.94807 5.70529 5.70272C3.94995 7.45738 2.56015 9.52079 1.53588 11.8929C0.511963 14.2651 0 16.7996 0 19.4964C0 22.1936 0.511791 24.7287 1.53537 27.1019C2.55895 29.4751 3.94807 31.5394 5.70272 33.2947C7.45738 35.0501 9.52079 36.4399 11.8929 37.4641C14.2651 38.488 16.7996 39 19.4964 39Z" fill="#027DB6"></path>'+
'</svg></button>' +
   '<div class="swiper-pagination"></div>' +
        '<button type="button" class="testimonials-nav__next" aria-label="Next testimonial"><svg xmlns="http://www.w3.org/2000/svg" width="39" height="39" viewBox="0 0 39 39" fill="none">'+
  '<path d="M21.6157 19.5L15.3039 25.8118L17.4474 28.0066L25.954 19.5L17.4474 10.9934L15.3039 13.1882L21.6157 19.5ZM19.5036 39C16.8064 39 14.2713 38.4882 11.8981 37.4646C9.52489 36.4411 7.46063 35.0519 5.70529 33.2973C3.94995 31.5426 2.56014 29.4792 1.53588 27.1071C0.51196 24.7349 0 22.2004 0 19.5036C0 16.8064 0.511789 14.2713 1.53537 11.8981C2.55895 9.52489 3.94807 7.46063 5.70272 5.70529C7.45738 3.94995 9.52079 2.56014 11.8929 1.53588C14.2651 0.51196 16.7996 0 19.4964 0C22.1936 0 24.7287 0.511789 27.1019 1.53537C29.4751 2.55895 31.5394 3.94807 33.2947 5.70272C35.0501 7.45738 36.4399 9.52079 37.4641 11.8929C38.488 14.2651 39 16.7996 39 19.4964C39 22.1936 38.4882 24.7287 37.4646 27.1019C36.4411 29.4751 35.0519 31.5394 33.2973 33.2947C31.5426 35.0501 29.4792 36.4399 27.1071 37.4641C24.7349 38.488 22.2004 39 19.5036 39Z" fill="#027DB6"></path>'+
'</svg></button>' +

        "</div>" +
        "</div>" +
        "</section>" +

        /* ===================== FEATURES ===================== */
        '<section class="features">' +
        '<div class="container">' +
        '<h2 class="section-heading">Why Finance Professionals Join AFP</h2>' +
        '<div class="features__grid">' + buildFeaturesHTML() + "</div>" +
        "</div>" +
        "</section>" +

        /* ===================== CONTENT BLOCKS (5, alternating) ===================== */
        buildContentBlocksHTML() +

        /* ===================== VALUE TABLE ===================== */
        '<section class="value-table">' +
        '<div class="container">' +
        '<h2 class="section-heading">Over $4,000 in Member Value</h2>' +
        '<p class="value-table__intro">A single research report or workshop can cost hundreds of dollars. AFP membership includes a full year of learning, research, practical resources and community access for just $545.</p>' +
        '<div class="table-wrapper">' +
        "<table>" +
        "<thead><tr><th>Benefit</th><th>AFP Non-Member</th><th>AFP Member</th></tr></thead>" +
        "<tbody>" + buildValueTableHTML() + "</tbody>" +
        "</table>" +
        "</div>" +
        '<div class="value-table__cta"><a href="#join" class="btn btn--primary">JOIN AFP</a></div>' +
        "</div>" +
        "</section>" +

        /* ===================== START MEMBERSHIP ===================== */
        '<section class="start-membership" id="join">' +
        '<div class=" start-membership__grid">' +

        '<div class="start-membership__price">' +
        "<h2>Start Your AFP Membership</h2>" +
        '<p class="price"><span class="price__amount">$545 per year</span> </p>' +
        '<p class="price__sub">Individual Membership</p>' +
        '<p class="price__desc">Join more than 10,000 treasury and finance professionals who rely on AFP to make better decisions, stay current and advance their careers.</p>' +
        /* BUG-02 fix: this is the ONE JOIN AFP button that should actually
           navigate. It keeps the old URL only as a no-JS fallback — the
           click handler wired up in init()/wireStartMembershipJoinButton()
           mimics a click on the control page's own equivalent button
           instead, so GA's session-generated cross-domain _gl param and the
           real /eweb/DynamicPage.aspx destination survive. */
        '<a href="https://www.financialprofessionals.org/membership/benefits/join-now" id="start-membership-join-btn" class="btn btn--primary">JOIN AFP</a>' +
        '<p class="start-membership__note"><span class="check"><svg xmlns="http://www.w3.org/2000/svg" width="17" height="13" viewBox="0 0 17 13" fill="none">'+
  '<path d="M5.7 12.025L0 6.325L1.425 4.9L5.7 9.175L14.875 0L16.3 1.425L5.7 12.025Z" fill="#027DB6"></path>'+
'</svg></span>Immediate access to your member benefits</p>' +
        "</div>" +
        '<div class="start-membership__divider" aria-hidden="true"></div>' +
        '<div class="start-membership__options">' +
        '<div class="option"><h3><span><svg xmlns="http://www.w3.org/2000/svg" width="20" height="22" viewBox="0 0 20 22" fill="none">'+
        '<path d="M2.22222 22C1.61111 22 1.08796 21.7846 0.652778 21.3538C0.217593 20.9229 0 20.405 0 19.8V4.4C0 3.795 0.217593 3.27708 0.652778 2.84625C1.08796 2.41542 1.61111 2.2 2.22222 2.2H3.33333V0H5.55556V2.2H14.4444V0H16.6667V2.2H17.7778C18.3889 2.2 18.912 2.41542 19.3472 2.84625C19.7824 3.27708 20 3.795 20 4.4V19.8C20 20.405 19.7824 20.9229 19.3472 21.3538C18.912 21.7846 18.3889 22 17.7778 22H2.22222ZM2.22222 19.8H17.7778V8.8H2.22222V19.8ZM2.22222 6.6H17.7778V4.4H2.22222V6.6ZM10 13.2C9.68519 13.2 9.4213 13.0946 9.20833 12.8837C8.99537 12.6729 8.88889 12.4117 8.88889 12.1C8.88889 11.7883 8.99537 11.5271 9.20833 11.3162C9.4213 11.1054 9.68519 11 10 11C10.3148 11 10.5787 11.1054 10.7917 11.3162C11.0046 11.5271 11.1111 11.7883 11.1111 12.1C11.1111 12.4117 11.0046 12.6729 10.7917 12.8837C10.5787 13.0946 10.3148 13.2 10 13.2ZM4.76389 12.8837C4.55093 12.6729 4.44444 12.4117 4.44444 12.1C4.44444 11.7883 4.55093 11.5271 4.76389 11.3162C4.97685 11.1054 5.24074 11 5.55556 11C5.87037 11 6.13426 11.1054 6.34722 11.3162C6.56019 11.5271 6.66667 11.7883 6.66667 12.1C6.66667 12.4117 6.56019 12.6729 6.34722 12.8837C6.13426 13.0946 5.87037 13.2 5.55556 13.2C5.24074 13.2 4.97685 13.0946 4.76389 12.8837ZM14.4444 13.2C14.1296 13.2 13.8657 13.0946 13.6528 12.8837C13.4398 12.6729 13.3333 12.4117 13.3333 12.1C13.3333 11.7883 13.4398 11.5271 13.6528 11.3162C13.8657 11.1054 14.1296 11 14.4444 11C14.7593 11 15.0231 11.1054 15.2361 11.3162C15.4491 11.5271 15.5556 11.7883 15.5556 12.1C15.5556 12.4117 15.4491 12.6729 15.2361 12.8837C15.0231 13.0946 14.7593 13.2 14.4444 13.2ZM10 17.6C9.68519 17.6 9.4213 17.4946 9.20833 17.2838C8.99537 17.0729 8.88889 16.8117 8.88889 16.5C8.88889 16.1883 8.99537 15.9271 9.20833 15.7162C9.4213 15.5054 9.68519 15.4 10 15.4C10.3148 15.4 10.5787 15.5054 10.7917 15.7162C11.0046 15.9271 11.1111 16.1883 11.1111 16.5C11.1111 16.8117 11.0046 17.0729 10.7917 17.2838C10.5787 17.4946 10.3148 17.6 10 17.6ZM4.76389 17.2838C4.55093 17.0729 4.44444 16.8117 4.44444 16.5C4.44444 16.1883 4.55093 15.9271 4.76389 15.7162C4.97685 15.5054 5.24074 15.4 5.55556 15.4C5.87037 15.4 6.13426 15.5054 6.34722 15.7162C6.56019 15.9271 6.66667 16.1883 6.66667 16.5C6.66667 16.8117 6.56019 17.0729 6.34722 17.2838C6.13426 17.4946 5.87037 17.6 5.55556 17.6C5.24074 17.6 4.97685 17.4946 4.76389 17.2838ZM14.4444 17.6C14.1296 17.6 13.8657 17.4946 13.6528 17.2838C13.4398 17.0729 13.3333 16.8117 13.3333 16.5C13.3333 16.1883 13.4398 15.9271 13.6528 15.7162C13.8657 15.5054 14.1296 15.4 14.4444 15.4C14.7593 15.4 15.0231 15.5054 15.2361 15.7162C15.4491 15.9271 15.5556 16.1883 15.5556 16.5C15.5556 16.8117 15.4491 17.0729 15.2361 17.2838C15.0231 17.4946 14.7593 17.6 14.4444 17.6Z" fill="#027DB6"></path>'+
        '</svg></span>Pay monthly through Affirm</h3><p>Eligible U.S. members can spread payments over time.</p></div>' +
        '<div class="option"><h3><span><svg xmlns="http://www.w3.org/2000/svg" width="26" height="21" viewBox="0 0 26 21" fill="none">'+
        '<path d="M13 21L4.72727 16.5667V9.56667L0 7L13 0L26 7V16.3333H23.6364V8.28333L21.2727 9.56667V16.5667L13 21ZM13 11.3167L21.0955 7L13 2.68333L4.90455 7L13 11.3167ZM13 18.3458L18.9091 15.1958V10.7917L13 14L7.09091 10.7917V15.1958L13 18.3458Z" fill="#027DB6"></path>'+
        '</svg></span>Student &amp; Early Career Membership</h3><p>Reduced pricing for students and early-career professionals.</p></div>' +
        '<div class="option"><h3><span><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">'+
       '<path d="M0 20V4.44444H4.44444V0H15.5556V8.88889H20V20H11.1111V15.5556H8.88889V20H0ZM2.22222 17.7778H4.44444V15.5556H2.22222V17.7778ZM2.22222 13.3333H4.44444V11.1111H2.22222V13.3333ZM2.22222 8.88889H4.44444V6.66667H2.22222V8.88889ZM6.66667 13.3333H8.88889V11.1111H6.66667V13.3333ZM6.66667 8.88889H8.88889V6.66667H6.66667V8.88889ZM6.66667 4.44444H8.88889V2.22222H6.66667V4.44444ZM11.1111 13.3333H13.3333V11.1111H11.1111V13.3333ZM11.1111 8.88889H13.3333V6.66667H11.1111V8.88889ZM11.1111 4.44444H13.3333V2.22222H11.1111V4.44444ZM15.5556 17.7778H17.7778V15.5556H15.5556V17.7778ZM15.5556 13.3333H17.7778V11.1111H15.5556V13.3333Z" fill="#027DB6"></path>'+
        '</svg></span>Corporate Membership</h3><p>Team membership options are available. Check whether your organisation already offers AFP membership.</p></div>' +
        "</div>" +
        "</div>" +
        "</section>" +

        /* ===================== QUOTE BANNER ===================== */
        '<section class="quote-banner">' +
        '<div class="container quote-banner__grid">' +
        '<div class="quote-banner__media">' +
        '<div class="placeholder-box quote-banner__photo" aria-hidden="true"><img src="https://v2.crocdn.com/AFP/test21/Lee-Ann-Perkins.png" alt="Quote" loading="lazy"></div>' +
        '<div class="placeholder-box quote-banner__badge" aria-hidden="true"></div>' +
        "</div>" +
        '<div class="quote-banner__text">' +
        "<h3>&ldquo;I would not be in the professional position I am today&rdquo;</h3>" +
        "<p>AFP is absolutely the reason I entered into and remain so passionate about the treasury field. Without the association&rsquo;s support, guidance and opportunities provided to me I would not be in the professional position I am today.</p>" +
        '<p class="quote-banner__author">Lee Ann Perkins, CTP(CD)<br><span>Assistant Treasurer, Specialized Bicycle Components</span></p>' +
        "</div>" +
        "</div>" +
        "</section>" +

        /* ===================== FAQ ===================== */
        '<section class="faq">' +
        '<div class="container">' +
        '<h2 class="section-heading">Frequently Asked Questions</h2>' +
        '<div class="faq__list">' + buildFaqHTML() + "</div>" +
        "</div>" +
        "</section>" +

        /* ===================== FOOTER CTA ===================== */
        '<section class="footer-cta">' +
        '<div class="container">' +
        "<h2>Join AFP and Accelerate Your Career</h2>" +
        "<p>Everything you need to keep learning, growing and making better decisions.</p>" +
        '<a href="#join" class="btn btn--primary">JOIN AFP</a>' +
        "</div>" +
        "</section>"+
        "</div>"
      );
    }

    /* =====================================================================
       SWIPER INIT
       ===================================================================== */
    function initSwiper() {

      if (typeof Swiper === "undefined") return;
      var swiperInstance = new Swiper(".testimonials-swiper", {
        slidesPerView: 1.2,
        spaceBetween: 20,
        grabCursor: true,
        observer: true,
        observeParents: true,
        pagination: { el: ".swiper-pagination", clickable: true },
        navigation: {
          nextEl: ".testimonials-nav__next",
          prevEl: ".testimonials-nav__prev",
        },
        breakpoints: {
          768: { slidesPerView: 2, spaceBetween: 24 },
          992: { slidesPerView: 3, spaceBetween: 32 },
        },
      });

      function refresh() {
        swiperInstance.update();
      }
      window.addEventListener("load", refresh);
      window.addEventListener("resize", refresh);
      setTimeout(refresh, 300);
      setTimeout(refresh, 1000);
    }

      function findControlJoinAnchor(scopeEl) {
      if (!scopeEl) return null;
      var candidates = scopeEl.querySelectorAll(
        'a[href*="join-now" i], a[href*="DynamicPage.aspx" i]'
      );
      for (var i = 0; i < candidates.length; i++) {
        var a = candidates[i];
        if (a.target === "_blank") continue;
        if (/join/i.test(a.textContent || "")) return a;
      }
      return null;
    }

    function wireSmoothScrollLinks(scopeEl) {
      if (!scopeEl) return;
      var links = scopeEl.querySelectorAll('a[href^="#"]');
      for (var i = 0; i < links.length; i++) {
        links[i].addEventListener("click", function (e) {
          var targetId = this.getAttribute("href").slice(1);
          if (!targetId) return;
          var targetEl = document.getElementById(targetId);
          if (!targetEl) return;
          e.preventDefault();
          targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
        });
      }
    }

    /* Value-table tooltips: click-to-toggle, one open at a time, on both
       desktop and mobile. Positioned with getBoundingClientRect + fixed
       coords (see .tooltip-content in vB.css) so it can't get clipped by
       .table-wrapper's overflow:hidden on small screens. */
    function initTooltips(scopeEl) {
      if (!scopeEl) return;
      var wraps = scopeEl.querySelectorAll(".tooltip-wrap");
      var activeWrap = null;

      function closeTooltip(wrap) {
        wrap.classList.remove("is-active");
        var icon = wrap.querySelector(".tooltip-icon");
        if (icon) icon.setAttribute("aria-expanded", "false");
      }

      function positionTooltip(wrap) {
        var icon = wrap.querySelector(".tooltip-icon");
        var content = wrap.querySelector(".tooltip-content");
        if (!icon || !content) return;
        var margin = 10;
        var iconRect = icon.getBoundingClientRect();
        var contentRect = content.getBoundingClientRect();

        var left = iconRect.left + iconRect.width / 2 - contentRect.width / 2;
        var maxLeft = window.innerWidth - contentRect.width - margin;
        left = Math.max(margin, Math.min(left, maxLeft));

        var top = iconRect.top - contentRect.height - 10;
        if (top < margin) {
          top = iconRect.bottom + 10;
          content.classList.add("tooltip-content--below");
        } else {
          content.classList.remove("tooltip-content--below");
        }

        var arrowLeft = iconRect.left + iconRect.width / 2 - left;
        content.style.left = left + "px";
        content.style.top = top + "px";
        content.style.setProperty("--arrow-left", arrowLeft + "px");
      }

      function openTooltip(wrap) {
        if (activeWrap && activeWrap !== wrap) closeTooltip(activeWrap);
        wrap.classList.add("is-active");
        var icon = wrap.querySelector(".tooltip-icon");
        if (icon) icon.setAttribute("aria-expanded", "true");
        positionTooltip(wrap);
        activeWrap = wrap;
      }

      for (var i = 0; i < wraps.length; i++) {
        (function (wrap) {
          var icon = wrap.querySelector(".tooltip-icon");
          if (!icon) return;
          icon.setAttribute("aria-expanded", "false");

          icon.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();
            if (wrap.classList.contains("is-active")) {
              closeTooltip(wrap);
              activeWrap = null;
            } else {
              openTooltip(wrap);
            }
          });

          icon.addEventListener("keydown", function (e) {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              icon.click();
            } else if (e.key === "Escape" && wrap.classList.contains("is-active")) {
              closeTooltip(wrap);
              activeWrap = null;
            }
          });
        })(wraps[i]);
      }

      document.addEventListener("click", function (e) {
        if (activeWrap && !activeWrap.contains(e.target)) {
          closeTooltip(activeWrap);
          activeWrap = null;
        }
      });

      window.addEventListener("resize", function () {
        if (activeWrap) positionTooltip(activeWrap);
      });
      window.addEventListener(
        "scroll",
        function () {
          if (activeWrap) positionTooltip(activeWrap);
        },
        true
      );
    }

    function wireStartMembershipJoinButton(controlAnchor) {
      var btn = document.getElementById("start-membership-join-btn");
      if (!btn) return;
      btn.addEventListener("click", function (e) {
        if (controlAnchor && typeof controlAnchor.click === "function") {
          e.preventDefault();
          controlAnchor.click();
          return;
        }
        if (controlAnchor && controlAnchor.href) {
          e.preventDefault();
           window.location.href = controlAnchor.href;
        }
        });
    }

    /* Variation Init */
    function init() {
      document.body.classList.add(variation_name);

      var mountEl = document.querySelector(MOUNT_SELECTOR);
      if (!mountEl) return;

      var controlJoinAnchor = findControlJoinAnchor(mountEl);

      mountEl.innerHTML = buildPageHTML();

      wireStartMembershipJoinButton(controlJoinAnchor);
      wireSmoothScrollLinks(mountEl);
      initTooltips(mountEl);

          injectSwiperCSS();

          injectScripts()

          .then(() => {
            initSwiper();
          })
        


    }

    /* Initialise variation */
    waitForElement("#site-main", init, 50, 15000);
  } catch (e) {
    if (debug) console.log(e, "error in Test " + variation_name);
  }
})();
