/* =====================================================================
   Site scripts
   Safe to load on every page: each module checks that its elements and
   libraries exist, and one module failing never stops the others.
   ===================================================================== */
(() => {
  "use strict";

  // ──======================================= Safeguards ======================================== ──
  const hasGSAP = typeof gsap !== "undefined";
  const hasST = hasGSAP && typeof ScrollTrigger !== "undefined";
  const hasSplitText = hasGSAP && typeof SplitText !== "undefined";
  const hasSplide = typeof Splide !== "undefined";
  const hasLenis = typeof Lenis !== "undefined";

  // register only the plugins that actually loaded
  if (hasGSAP) {
    const plugins = [];
    if (hasST) plugins.push(ScrollTrigger);
    if (hasSplitText) plugins.push(SplitText);
    if (plugins.length) gsap.registerPlugin(...plugins);
  }

  const $ = (selector, root = document) => root.querySelector(selector);

  const prefersReducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // run once the DOM is ready (also works if the script loads late)
  const onReady = (fn) => {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn, { once: true });
    } else {
      fn();
    }
  };

  // run once the page has fully loaded (also works if it already has)
  const onLoad = (fn) => {
    if (document.readyState === "complete") {
      fn();
    } else {
      window.addEventListener("load", fn, { once: true });
    }
  };

  const fontsReady = () =>
    document.fonts && document.fonts.ready
      ? document.fonts.ready
      : Promise.resolve();

  // wrap a function so an unexpected error is logged instead of thrown
  const guard =
    (name, fn) =>
    (...args) => {
      try {
        return fn(...args);
      } catch (err) {
        console.warn(`[site] "${name}" stopped:`, err);
      }
    };

  // run a module when the DOM is ready, isolated from every other module
  const run = (name, fn) => onReady(guard(name, fn));

  // video.play() returns undefined in very old browsers, and may reject
  const safePlay = (video) => {
    try {
      const result = video.play();
      return result && typeof result.then === "function"
        ? result
        : Promise.resolve();
    } catch (err) {
      return Promise.reject(err);
    }
  };

  // show elements that are hidden by CSS until an animation starts
  const reveal = (els) =>
    els.filter(Boolean).forEach((el) => {
      el.style.visibility = "visible";
      el.style.opacity = "1";
    });

  const splideExtensions = () =>
    (window.splide && window.splide.Extensions) || {};

  // ──======================================= Smooth scroll (Lenis)======================================== ──
  if (hasLenis && hasGSAP) {
    guard("Smooth scroll", () => {
      const lenis = new Lenis({
        duration: 1.4,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: "vertical",
        gestureDirection: "vertical",
        smoothWheel: true,
        wheelMultiplier: 1.3,
        infinite: false,
      });

      if (hasST) {
        lenis.on("scroll", ScrollTrigger.update);
      }

      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });

      gsap.ticker.lagSmoothing(0);
    })();
  }

  // ──======================================= Navbar ======================================== ──
  run("Navbar", () => {
    const navbar = $(".navbar");
    const toggle = $(".menu-toggle");
    const line2 = $(".line-2");
    const menu = $(".navbar-menu");
    const backdrop = $(".navbar-backdrop");

    if (!hasGSAP || !navbar || !toggle || !line2 || !menu) return;

    const CLOSED_WIDTH = 700;
    const OPEN_WIDTH = 1300;
    const LINE_GAP = 12;

    let isOpen = false;
    let menuTimeline = null;

    const getOpenWidth = () => Math.min(OPEN_WIDTH, window.innerWidth - 32);
    const getClosedWidth = () => Math.min(CLOSED_WIDTH, window.innerWidth - 32);

    /* ---------- Hover animation ---------- */
    toggle.addEventListener("mouseenter", () => {
      if (isOpen) return;

      gsap.to(line2, {
        width: "100%",
        duration: 0.35,
        ease: "power2.out",
        overwrite: "auto",
      });
    });

    toggle.addEventListener("mouseleave", () => {
      if (isOpen) return;

      gsap.to(line2, {
        width: "70%",
        duration: 0.35,
        ease: "power2.out",
        overwrite: "auto",
      });
    });

    /* ---------- Menu timeline ---------- */
    const buildTimeline = () => {
      if (menuTimeline) menuTimeline.kill();

      const openWidth = getOpenWidth();

      gsap.set(navbar, { width: openWidth });
      gsap.set(menu, { height: "auto" });

      const menuHeight = menu.offsetHeight;

      gsap.set(menu, { height: 0 });
      gsap.set(navbar, { width: getClosedWidth() });

      menuTimeline = gsap.timeline({
        paused: true,
        defaults: { ease: "power2.inOut" },
        onReverseComplete: () => {
          menu.setAttribute("aria-hidden", "true");
        },
      });

      menuTimeline
        .to(navbar, { width: openWidth, duration: 0.6 }, 0)
        .fromTo(
          menu,
          { height: 0 },
          { height: menuHeight, duration: 0.6 },
          0.6,
        );

      if (backdrop) {
        menuTimeline.to(backdrop, { opacity: 1, duration: 0.5 }, 0);
      }

      menuTimeline
        .to(line2, { width: "100%", y: -LINE_GAP, duration: 0.4 }, 0)
        .to(line2, { autoAlpha: 0, duration: 0.1 }, 0.35)
        .to(toggle, { backgroundColor: "#ffffff", duration: 0.3 }, 0);
    };

    buildTimeline();

    /* ---------- Open menu ---------- */
    const openMenu = () => {
      isOpen = true;

      toggle.setAttribute("aria-expanded", "true");
      menu.setAttribute("aria-hidden", "false");

      if (backdrop) backdrop.classList.remove("pointer-events-none");

      menuTimeline.timeScale(1).play();
    };

    /* ---------- Close menu ---------- */
    const closeMenu = () => {
      isOpen = false;

      toggle.setAttribute("aria-expanded", "false");

      if (backdrop) backdrop.classList.add("pointer-events-none");

      menuTimeline.timeScale(0.8).reverse();
      gsap.set(line2, { clearProps: "visibility" });
    };

    /* ---------- Click events ---------- */
    toggle.addEventListener("click", () => {
      isOpen ? closeMenu() : openMenu();
    });

    if (backdrop) backdrop.addEventListener("click", closeMenu);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && isOpen) {
        closeMenu();
      }
    });

    /* ---------- Resize ---------- */
    window.addEventListener("resize", () => {
      buildTimeline();

      if (isOpen) {
        menuTimeline.progress(1);
      }
    });
  });

  // ──======================================= Hero marquee slider ======================================== ──
  run("Hero slider", () => {
    const sliderEl = $(".hero-slider");
    if (!sliderEl || !hasSplide) return;

    const reduceMotion = prefersReducedMotion();

    const heroSlider = new Splide(sliderEl, {
      type: "loop",
      autoWidth: true,
      gap: "10px",
      arrows: false,
      pagination: false,

      // Disable mouse dragging and touch swiping
      drag: false,
      swipe: false,

      // Auto scroll
      autoScroll: reduceMotion
        ? false
        : {
            speed: 0.6,
            pauseOnHover: false,
            pauseOnFocus: false,
          },
    });

    /* ---------- Video play / pause (synced across Splide clones) ---------- */

    const pausedVideos = new Set();

    const syncVideos = () => {
      heroSlider.root.querySelectorAll("video[data-video]").forEach((video) => {
        video.muted = true;

        if (pausedVideos.has(video.dataset.video) || reduceMotion) {
          video.pause();
        } else {
          safePlay(video).catch(() => {});
        }
      });

      heroSlider.root
        .querySelectorAll("[data-video-toggle]")
        .forEach((button) => {
          const isPaused =
            pausedVideos.has(button.dataset.videoToggle) || reduceMotion;

          button.classList.toggle("is-paused", isPaused);

          button.setAttribute(
            "aria-label",
            isPaused ? "Play video" : "Pause video",
          );
        });
    };

    /* ---------- Reduced motion ---------- */

    if (reduceMotion) {
      heroSlider.root.querySelectorAll("video[data-video]").forEach((video) => {
        pausedVideos.add(video.dataset.video);
      });
    }

    /* ---------- Video toggle (works with cloned slides) ---------- */

    heroSlider.root.addEventListener("click", (event) => {
      const button = event.target.closest("[data-video-toggle]");

      if (!button) return;

      const id = button.dataset.videoToggle;

      if (pausedVideos.has(id)) {
        pausedVideos.delete(id);
      } else {
        pausedVideos.add(id);
      }

      syncVideos();
    });

    /* ---------- Splide events ---------- */

    heroSlider.on("refresh", syncVideos);

    /* ---------- Mount slider ---------- */

    heroSlider.mount(splideExtensions());

    syncVideos();
  });

  // ──======================================= Hero intro animation ======================================== ──
  run("Hero intro", () => {
    const logo = $(".hero__logo img");
    const tagline = $(".hero__tagline");
    const slider = $(".hero-slider");

    if (!logo || !tagline || !slider) return;

    // without GSAP (or with reduced motion) just show everything, no animation
    if (!hasGSAP || prefersReducedMotion()) {
      reveal([logo, tagline, slider]);
      return;
    }

    const show = () =>
      gsap.set([logo, tagline, slider], { visibility: "visible" });

    // Wait for logo and first slides to load
    const loaded = (img) =>
      img.complete && img.naturalWidth
        ? Promise.resolve()
        : new Promise((res) => {
            img.addEventListener("load", res, { once: true });
            img.addEventListener("error", res, { once: true });
          });

    const imagesReady = Promise.all(
      [logo, ...[...slider.querySelectorAll("img")].slice(0, 8)].map(loaded),
    );

    // Never block forever
    const timeout = new Promise((res) => setTimeout(res, 2500));

    Promise.race([Promise.all([fontsReady(), imagesReady]), timeout]).then(
      () => {
        try {
          // Split tagline into characters
          let chars = [tagline];

          if (hasSplitText) {
            chars = SplitText.create(tagline, {
              type: "words,chars",
            }).chars;
          }

          // Initial states
          gsap.set(logo, {
            yPercent: 30,
            force3D: true,
          });

          gsap.set(chars, {
            opacity: 0,
            filter: "blur(10px)",
          });

          gsap.set(slider, {
            y: 60,
            opacity: 0,
            force3D: true,
          });

          show();

          // Animation timeline
          gsap
            .timeline({
              onComplete: () => {
                gsap.set(chars, { clearProps: "filter" });
              },
            })

            .to(
              logo,
              {
                yPercent: 0,
                duration: 1.2,
                ease: "power4.out",
                force3D: true,
              },
              0,
            )

            .to(
              chars,
              {
                opacity: 1,
                filter: "blur(0px)",
                duration: 0.8,
                stagger: 0.03,
                ease: "power2.out",
              },
              0.4,
            )

            .to(
              slider,
              {
                y: 0,
                opacity: 1,
                duration: 1.2,
                ease: "power3.out",
                force3D: true,
              },
              0.5,
            );
        } catch (err) {
          // never leave the hero hidden if the animation fails
          reveal([logo, tagline, slider]);
          console.warn('[site] "Hero intro" stopped:', err);
        }
      },
    );
  });

  // ──======================================= About logo marquee ======================================== ──
  run("About logo marquee", () => {
    const marqueeEl = $(".about-logo-marquee");
    if (!marqueeEl || !hasSplide) return;

    const reduceMotion = prefersReducedMotion();

    const aboutLogoMarquee = new Splide(marqueeEl, {
      type: "loop",
      autoWidth: true, // each slide is as wide as its logo
      gap: "80px",
      arrows: false,
      pagination: false,
      drag: false,
      autoScroll: reduceMotion
        ? false
        : { speed: 0.6, pauseOnHover: false, pauseOnFocus: false },
      breakpoints: {
        767: { gap: "56px" },
      },
    });

    aboutLogoMarquee.mount(splideExtensions());

    // autoWidth measures the slides, so re-measure once the logo images have loaded
    onLoad(() => aboutLogoMarquee.refresh());
  });

  // ──======================================= About heading color change on scroll ======================================== ──
  run("Heading text scrub", () => {
    const headings = document.querySelectorAll(".heading-text-scrub");
    if (!headings.length || !hasST || !hasSplitText) return;

    headings.forEach((heading) => {
      // Split heading into words
      const split = SplitText.create(heading, {
        type: "words",
      });

      if (!split.words.length) return; // empty heading, nothing to animate

      // Animate word colors on scroll
      gsap.to(split.words, {
        color: "#1E1E1E",
        stagger: 0.1,
        scrollTrigger: {
          trigger: heading,
          start: "top 80%",
          end: "bottom 40%",
          scrub: true,
        },
      });
    });
  });

  // ──======================================= Common button animation ======================================== ──
  run("Buttons", () => {
    const buttons = document.querySelectorAll(".cubic-btn");
    if (!buttons.length || !hasSplitText) return;

    // ---- tweak these ----
    const DURATION = 0.7;
    const STAGGER = 0.03;
    const EASE = "power4.inOut";
    // ---------------------

    const setup = guard("Buttons", () => {
      buttons.forEach((button) => {
        const originalEl = button.querySelector(".original");
        const cloneEl = button.querySelector(".clone");
        if (!originalEl || !cloneEl) return;

        const originalSplit = new SplitText(originalEl, { type: "chars" });
        const cloneSplit = new SplitText(cloneEl, { type: "chars" });

        gsap.set(cloneSplit.chars, { yPercent: 110 });

        const tl = gsap.timeline({ paused: true });

        tl.to(
          originalSplit.chars,
          {
            yPercent: -110,
            duration: DURATION,
            stagger: STAGGER,
            ease: EASE,
          },
          0,
        ).to(
          cloneSplit.chars,
          {
            yPercent: 0,
            duration: DURATION,
            stagger: STAGGER,
            ease: EASE,
          },
          0,
        );

        button.addEventListener("mouseenter", () => tl.play());
        button.addEventListener("mouseleave", () => tl.reverse());
      });
    });

    // wait for fonts so the split measures the real character widths
    fontsReady().then(setup);
  });

  // ──======================================= Heading reveal animation ======================================== ──
  run("Heading reveal", () => {
    const headings = document.querySelectorAll(".heading-reveal");
    if (!headings.length) return;

    // no animation libraries: just make sure the headings are visible
    if (!hasST || !hasSplitText) {
      reveal([...headings]);
      return;
    }

    // ---- tweak these ----
    const FROM_Y = 100; // % of line height words start below their line
    const DURATION = 1.2;
    const STAGGER = 0.05;
    const START = "top 85%";
    // ---------------------

    const reduceMotion = prefersReducedMotion();

    const setup = guard("Heading reveal", () => {
      headings.forEach((heading) => {
        if (reduceMotion) {
          gsap.set(heading, { visibility: "visible", opacity: 1 });
          return;
        }

        let played = false;
        let tween = null;

        SplitText.create(heading, {
          type: "lines,words",
          mask: "lines", // each line clips its words so they rise from behind it
          linesClass: "split-line",
          wordsClass: "split-word",
          autoSplit: true, // re-splits automatically on resize / font load
          onSplit(self) {
            gsap.set(heading, { visibility: "visible", opacity: 1 });

            // already revealed (e.g. window resized afterwards): keep the final state
            if (played) return;

            tween = gsap.from(self.words, {
              yPercent: FROM_Y,
              opacity: 0,
              duration: DURATION,
              ease: "power4.out",
              stagger: STAGGER,
              paused: true,
              onComplete: () => {
                played = true;
                gsap.set(self.words, { clearProps: "willChange" });
              },
            });

            // returning the tween lets SplitText rebuild it on resize
            // and keep the same progress, so a mid-animation resize is safe
            return tween;
          },
        });

        // one ScrollTrigger per heading (created once, outside onSplit)
        ScrollTrigger.create({
          trigger: heading,
          start: START,
          once: true,
          onEnter: () => tween && tween.play(),
        });
      });
    });

    // wait for fonts so the first split measures the real line breaks
    fontsReady().then(setup);
  });

  // ──======================================= Project card stagger ======================================== ──
  run("Project cards", () => {
    if (!hasST) return;

    const cards = gsap.utils.toArray(".project-card");
    if (!cards.length) return;

    // ---- tweak these ----
    const FROM_Y = 60; // px the cards start below their final position
    const DURATION = 1;
    const STAGGER = 0.15;
    const EASE = "power3.out";
    const START = "top 88%";
    // ---------------------

    if (prefersReducedMotion()) return;

    gsap.set(cards, { opacity: 0, y: FROM_Y });

    ScrollTrigger.batch(cards, {
      start: START,
      once: true,
      onEnter: (batch) => {
        gsap.to(batch, {
          opacity: 1,
          y: 0,
          duration: DURATION,
          ease: EASE,
          stagger: STAGGER,
          overwrite: true,
          clearProps: "opacity,transform", // hands control back to your hover styles
        });
      },
    });
  });

  // ──======================================= Service slider ======================================== ──
  run("Service slider", () => {
    const section = $("#services");
    const wrap = section && $(".service-collaction-wrap", section);
    const liner = section && $(".service-liner", section);
    if (!section || !wrap || !liner || !wrap.children.length) return;
    if (!hasST) return;

    const prevBtn = $('[data-slider="prev"]', section);
    const nextBtn = $('[data-slider="next"]', section);

    // ---- tweak these ----
    const SCROLL_SPEED = 1; // desktop: 1 = 1px scroll per 1px of travel, higher = slower
    const START = "top top";
    const SLIDE_DURATION = 0.7; // mobile: seconds per slide
    const SWIPE_THRESHOLD = 40; // mobile: px of horizontal drag to change slide
    // ---------------------

    // desktop: distance so the last card's right edge lands on the container's right content edge
    const getDistance = () => {
      const last = wrap.lastElementChild;
      if (!last) return 1;
      return Math.max(1, last.offsetLeft + last.offsetWidth - wrap.clientWidth);
    };

    const mm = gsap.matchMedia();

    mm.add(
      {
        isDesktop: "(min-width: 768px)",
        isMobile: "(max-width: 767px)",
        reduceMotion: "(prefers-reduced-motion: reduce)",
      },
      guard("Service slider", (context) => {
        const { isDesktop, reduceMotion } = context.conditions;

        // ================= DESKTOP: pinned horizontal scroll =================
        if (isDesktop) {
          // reduced motion: no pin, native horizontal scroll, line stays full
          if (reduceMotion) {
            wrap.style.overflowX = "auto";
            gsap.set(liner, { scaleX: 1 });
            return () => {
              wrap.style.overflowX = "";
            };
          }

          const tl = gsap.timeline({
            defaults: { ease: "none" },
            scrollTrigger: {
              trigger: section,
              start: START,
              end: () => "+=" + getDistance() * SCROLL_SPEED,
              pin: true,
              scrub: 1,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          });

          tl.to(wrap, { x: () => -getDistance() }, 0).to(
            liner,
            { scaleX: 1 },
            0,
          );
          return;
        }

        // ================= MOBILE: no pin, infinite arrow slider =================
        const container = wrap.closest(".container") || wrap.parentElement;
        const originals = Array.from(wrap.children);
        const n = originals.length;
        const duration = reduceMotion ? 0 : SLIDE_DURATION;

        // one extra set of cards before and after, so the loop never runs out
        const makeClones = () =>
          originals.map((card) => {
            const clone = card.cloneNode(true);
            clone.setAttribute("aria-hidden", "true");
            clone.setAttribute("data-clone", "");
            clone
              .querySelectorAll("a, button")
              .forEach((el) => el.setAttribute("tabindex", "-1"));
            return clone;
          });
        const before = makeClones();
        const after = makeClones();
        before.forEach((c) => wrap.insertBefore(c, originals[0]));
        after.forEach((c) => wrap.appendChild(c));

        const cards = [...before, ...originals, ...after];
        let index = 0; // virtual index: 0..n-1 are the real cards, -n..-1 / n..2n-1 are clones
        let blockClick = false;

        const mod = (i) => ((i % n) + n) % n;
        const setWidth = () => cards[n].offsetLeft - cards[0].offsetLeft;
        const getX = (i) => cards[n + i].offsetLeft;

        // hide the sliver of the previous card that would peek in on the left
        const clipLeft = () => {
          const pl = parseFloat(getComputedStyle(container).paddingLeft) || 0;
          container.style.clipPath = `inset(0 -100vw 0 ${pl}px)`;
        };

        // if we landed on a clone, jump to the identical real card (no visible change)
        const normalize = () => {
          if (index >= 0 && index < n) return;
          const shift = index < 0 ? -setWidth() : setWidth();
          gsap.set(wrap, { x: gsap.getProperty(wrap, "x") + shift });
          index = mod(index);
        };

        const goTo = (i, d = duration) => {
          index = i;
          gsap.to(wrap, {
            x: -getX(i),
            duration: d,
            ease: "power3.out",
            overwrite: true,
            onComplete: normalize,
          });
          // line fills from the center, one step per slide
          gsap.to(liner, {
            scaleX: (mod(i) + 1) / n,
            duration: d,
            ease: "power3.out",
            overwrite: true,
          });
        };

        const step = (dir) => {
          normalize();
          goTo(index + dir);
        };

        const onPrev = () => step(-1);
        const onNext = () => step(1);

        // swipe support
        let startX = null;
        const onDown = (e) => {
          startX = e.clientX;
          blockClick = false;
        };
        const onUp = (e) => {
          if (startX === null) return;
          const dx = e.clientX - startX;
          startX = null;
          if (Math.abs(dx) > SWIPE_THRESHOLD) {
            blockClick = true; // don't follow a card link after a swipe
            step(dx < 0 ? 1 : -1);
          }
        };
        const onCancel = () => (startX = null);
        const onClickCapture = (e) => {
          if (blockClick) {
            e.preventDefault();
            e.stopPropagation();
            blockClick = false;
          }
        };
        const onResize = () => {
          clipLeft();
          goTo(mod(index), 0);
        };

        prevBtn && prevBtn.addEventListener("click", onPrev);
        nextBtn && nextBtn.addEventListener("click", onNext);
        wrap.addEventListener("pointerdown", onDown);
        wrap.addEventListener("pointerup", onUp);
        wrap.addEventListener("pointercancel", onCancel);
        wrap.addEventListener("click", onClickCapture, true);
        window.addEventListener("resize", onResize);

        clipLeft();
        goTo(0, 0);

        // cleanup when switching to desktop width
        return () => {
          prevBtn && prevBtn.removeEventListener("click", onPrev);
          nextBtn && nextBtn.removeEventListener("click", onNext);
          wrap.removeEventListener("pointerdown", onDown);
          wrap.removeEventListener("pointerup", onUp);
          wrap.removeEventListener("pointercancel", onCancel);
          wrap.removeEventListener("click", onClickCapture, true);
          window.removeEventListener("resize", onResize);
          gsap.killTweensOf([wrap, liner]);
          [...before, ...after].forEach((c) => c.remove());
          container.style.clipPath = "";
          gsap.set([wrap, liner], { clearProps: "transform" });
        };
      }),
    );

    // re-measure once images and fonts settle
    onLoad(() => ScrollTrigger.refresh());
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }
  });

  // ──======================================= Impact section video player ======================================== ──
  run("Impact video", () => {
    const section = $("#impact");
    const video = section && $(".impact-video video", section);
    const btn = section && $("[data-video-toggle]", section);
    if (!video || !btn) return;

    const iconPlay = $('[data-icon="play"]', btn);
    const iconPause = $('[data-icon="pause"]', btn);

    // keep the button in sync with the real video state
    const sync = () => {
      const playing = !video.paused;
      if (iconPlay) iconPlay.classList.toggle("hidden", playing);
      if (iconPause) iconPause.classList.toggle("hidden", !playing);
      btn.setAttribute("aria-label", playing ? "Pause video" : "Play video");
    };

    btn.addEventListener("click", () => {
      if (video.paused) {
        safePlay(video).catch(() => {});
      } else {
        video.pause();
      }
    });

    video.addEventListener("play", sync);
    video.addEventListener("pause", sync);

    // reduced motion: don't autoplay, let the person press play
    if (prefersReducedMotion()) {
      video.pause();
    }

    sync();
  });

  // ──======================================= Heading blur reveal animation ======================================== ──
  run("Heading blur reveal", () => {
    const headings = document.querySelectorAll(".heading-blur-reveal");
    if (!headings.length) return;

    // no animation libraries: just make sure the headings are visible
    if (!hasST || !hasSplitText) {
      reveal([...headings]);
      return;
    }

    // ---- tweak these ----
    const BLUR = 14; // starting blur in px
    const DURATION = 1;
    const STAGGER = 0.08; // delay between each word, left to right
    const EASE = "power2.out";
    const START = "top 85%";
    // ---------------------

    const reduceMotion = prefersReducedMotion();

    const setup = guard("Heading blur reveal", () => {
      headings.forEach((heading) => {
        if (reduceMotion) {
          gsap.set(heading, { visibility: "visible", opacity: 1 });
          return;
        }

        let played = false;
        let tween = null;

        SplitText.create(heading, {
          type: "words",
          wordsClass: "split-word",
          autoSplit: true, // re-splits on resize / font load, no reload needed
          onSplit(self) {
            gsap.set(heading, { visibility: "visible", opacity: 1 });

            // already revealed (e.g. window resized afterwards): keep the final state
            if (played) return;

            tween = gsap.from(self.words, {
              opacity: 0,
              filter: `blur(${BLUR}px)`,
              duration: DURATION,
              ease: EASE,
              stagger: { each: STAGGER, from: "start" }, // left to right
              paused: true,
              onComplete: () => {
                played = true;
                gsap.set(self.words, {
                  clearProps: "filter,opacity,willChange",
                });
              },
            });

            // returning the tween lets SplitText rebuild it on resize
            // and keep the same progress, so a mid-animation resize is safe
            return tween;
          },
        });

        // one ScrollTrigger per heading (created once, outside onSplit)
        ScrollTrigger.create({
          trigger: heading,
          start: START,
          once: true,
          onEnter: () => tween && tween.play(),
        });
      });
    });

    // wait for fonts so the first split measures the real line breaks
    fontsReady().then(setup);
  });

  // ──======================================= Counter animation ======================================== ──
  run("Counters", () => {
    const counters = document.querySelectorAll(".counter-item");
    if (!counters.length || !hasST) return; // checked first, so the numbers are never wiped without an animation

    counters.forEach((counter) => {
      const rawVal =
        counter.getAttribute("data-value") || counter.textContent.trim();

      const prefix = counter.getAttribute("data-prefix") || "";
      const suffix = counter.getAttribute("data-suffix") || "";

      const cleanVal = rawVal.replace(/[^\d.]/g, "");
      if (!cleanVal) return; // nothing numeric to animate, leave the element as it is

      const chars = cleanVal.split("");
      const isSingleDigit = cleanVal.replace(".", "").length === 1;

      counter.innerHTML = "";

      if (prefix) {
        const pSpan = document.createElement("span");
        pSpan.innerHTML = prefix;
        counter.appendChild(pSpan);
      }

      chars.forEach((char, index) => {
        if (char === ".") {
          const dot = document.createElement("span");
          dot.textContent = ".";
          counter.appendChild(dot);
          return;
        }

        const col = document.createElement("span");
        col.className = "counter-digit-col";

        const list = document.createElement("span");
        list.className = "counter-digit-list";

        const finalNum = parseInt(char, 10);

        // Standardize the roll: 0 through 9, ending with the specific finalNum
        const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, finalNum];

        numbers.forEach((num) => {
          const numSpan = document.createElement("span");
          numSpan.textContent = num;
          list.appendChild(numSpan);
        });

        col.appendChild(list);
        counter.appendChild(col);

        // Ensure first digit (index 0) starts cleanly from top
        let startY = 0;

        if (index === 0) {
          startY = 0;
        } else if (!isSingleDigit && index % 2 !== 0) {
          startY = 100;
        } else {
          startY = -100;
        }

        ScrollTrigger.create({
          trigger: counter,
          start: "top bottom",
          once: true,
          onEnter: () => {
            gsap.fromTo(
              list,
              {
                yPercent: startY,
              },
              {
                yPercent: -((numbers.length - 1) * (100 / numbers.length)),
                duration: 2.8,
                ease: "expo.out",
                delay: index * 0.1,
              },
            );
          },
        });
      });

      if (suffix) {
        const sSpan = document.createElement("span");
        sSpan.innerHTML = suffix;
        counter.appendChild(sSpan);
      }
    });
  });

  // ──======================================= Testimonial slider (desktop: stacked cards, mobile: infinite slider) ======================================== ──
  run("Testimonials", () => {
    const section = $("#testimonials");
    if (!section || !hasST) return;

    const slider = $(".testimonial-slider", section);
    const viewport = $(".testimonial-viewport", section);
    const track = $(".testimonial-stack", section);

    const cards = gsap.utils.toArray(
      section.querySelectorAll(".testimonial-card"),
    );

    if (!slider || !viewport || !track || cards.length < 2) return;

    // ================= SETTINGS =================

    const TOP_DESKTOP = 96;
    const GAP = 14;
    const SCALE_STEP = 0.03;

    const SPLIDE_OPTIONS = {
      type: "loop",
      perPage: 1,
      perMove: 1,
      gap: 0,
      speed: 700,
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      pagination: false,
      arrows: false,
      drag: true,
      waitForTransition: true,
      updateOnMove: true,
      autoWidth: false,
      focus: 0,
      trimSpace: false,
      breakpoints: {
        767: {
          perPage: 1,
          gap: 0,
        },
      },
    };

    // =============================================

    const mm = gsap.matchMedia();

    mm.add(
      {
        desktop: "(min-width: 1024px)",
        mobile: "(max-width: 1023px)",
        reduceMotion: "(prefers-reduced-motion: reduce)",
      },
      guard("Testimonials", (context) => {
        const { desktop, reduceMotion } = context.conditions;
        const n = cards.length;

        // =============================================
        // DESKTOP: GSAP STACKING CARDS
        // =============================================

        if (desktop) {
          if (reduceMotion) return;

          const last = cards[n - 1];

          const endAt = `top top+=${TOP_DESKTOP + (n - 1) * GAP}`;

          cards.forEach((card, i) => {
            if (i === n - 1) return;

            ScrollTrigger.create({
              trigger: card,
              start: `top top+=${TOP_DESKTOP + i * GAP}`,
              endTrigger: last,
              end: endAt,
              pin: true,
              pinSpacing: false,
              invalidateOnRefresh: true,
            });

            const inner = card.querySelector(".testimonial-inner");
            if (!inner) return;

            gsap.to(inner, {
              scale: 1 - (n - 1 - i) * SCALE_STEP,
              transformOrigin: "top center",
              ease: "none",
              scrollTrigger: {
                trigger: cards[i + 1],
                start: "top bottom",
                endTrigger: last,
                end: endAt,
                scrub: true,
                invalidateOnRefresh: true,
              },
            });
          });

          return;
        }

        // =============================================
        // MOBILE / TABLET: SPLIDE INFINITE SLIDER
        // =============================================

        if (!hasSplide) {
          console.warn(
            "[site] Splide is not loaded, testimonial slider skipped.",
          );
          return;
        }

        // Add Splide classes
        slider.classList.add("splide");
        viewport.classList.add("splide__track");
        track.classList.add("splide__list");

        cards.forEach((card) => {
          card.classList.add("splide__slide");
        });

        // Initialize Splide
        const splide = new Splide(slider, SPLIDE_OPTIONS);

        // Custom navigation
        const prevBtn = $('[data-slider="prev"]', section);
        const nextBtn = $('[data-slider="next"]', section);

        const goPrev = () => splide.go("<");
        const goNext = () => splide.go(">");

        // Infinite loop: keep both arrows enabled
        const updateArrows = () => {
          if (prevBtn) prevBtn.disabled = false;
          if (nextBtn) nextBtn.disabled = false;
        };

        if (prevBtn) {
          prevBtn.addEventListener("click", goPrev);
        }

        if (nextBtn) {
          nextBtn.addEventListener("click", goNext);
        }

        splide.on("mounted", () => {
          updateArrows();
          splide.refresh();
        });

        splide.on("move", updateArrows);

        // Mount slider
        splide.mount();

        // Recalculate dimensions after images load
        const refreshSlider = () => {
          if (splide.state.is(Splide.STATES.DESTROYED)) return;

          splide.refresh();
        };

        cards.forEach((card) => {
          card.querySelectorAll("img").forEach((img) => {
            if (!img.complete) {
              img.addEventListener("load", refreshSlider, { once: true });
            }
          });
        });

        // Cleanup when switching back to desktop
        return () => {
          if (prevBtn) {
            prevBtn.removeEventListener("click", goPrev);
          }

          if (nextBtn) {
            nextBtn.removeEventListener("click", goNext);
          }

          splide.destroy(true);

          slider.classList.remove("splide");
          viewport.classList.remove("splide__track");
          track.classList.remove("splide__list");

          cards.forEach((card) => {
            card.classList.remove("splide__slide");
          });
        };
      }),
    );

    // =============================================
    // REFRESH AFTER IMAGES AND FONTS LOAD
    // =============================================

    onLoad(() => {
      ScrollTrigger.refresh();
    });

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        ScrollTrigger.refresh();
      });
    }
  });

  // ──======================================= FAQ accordion (one open at a time) ======================================== ──
  run("FAQ", () => {
    const faq = $(".home-faq");
    if (!faq || !hasGSAP) return;

    // only items that have both a button and a panel
    const items = Array.from(faq.querySelectorAll(".faq-item")).filter(
      (item) => $(".faq-trigger", item) && $(".faq-panel", item),
    );
    if (!items.length) return;

    // ---- tweak these ----
    const DURATION = 0.6;
    const EASE = "power3.inOut";
    // ---------------------

    const reduceMotion = prefersReducedMotion();

    const setItem = (item, open) => {
      const trigger = $(".faq-trigger", item);
      const panel = $(".faq-panel", item);
      const icon = $(".faq-icon", item);
      const duration = reduceMotion ? 0 : DURATION;

      trigger.setAttribute("aria-expanded", String(open));
      item.classList.toggle("is-open", open);

      // closed panels carry Tailwind's `invisible`; take over visibility from here
      if (open) panel.style.visibility = "visible";

      gsap.to(panel, {
        height: open ? "auto" : 0,
        duration,
        ease: EASE,
        overwrite: true,
        onComplete: () => {
          if (!open) panel.style.visibility = "hidden";
          // heights changed, so re-measure any ScrollTrigger below this section
          if (hasST) ScrollTrigger.refresh();
        },
      });

      if (icon) {
        gsap.to(icon, {
          rotation: open ? 180 : 0,
          duration,
          ease: EASE,
          overwrite: true,
        });
      }
    };

    items.forEach((item) => {
      const trigger = $(".faq-trigger", item);
      trigger.addEventListener("click", () => {
        const isOpen = item.classList.contains("is-open");

        if (isOpen) {
          setItem(item, false);
          return;
        }

        items.forEach((other) => {
          if (other !== item && other.classList.contains("is-open"))
            setItem(other, false);
        });
        setItem(item, true);
      });
    });
  });

  // ──======================================= About page: video player ======================================== ──
  run("About video", () => {
    const banner = $(".about-video-banner");
    if (!banner) return;

    const video = $(".about-video-element", banner);
    const toggle = $(".about-video-toggle", banner);
    if (!video || !toggle) return;

    const reduceMotion = prefersReducedMotion();
    let userPaused = reduceMotion; // reduced motion starts paused

    video.muted = true;

    const render = () => {
      const paused = video.paused;
      toggle.classList.toggle("is-paused", paused);
      toggle.setAttribute("aria-label", paused ? "Play video" : "Pause video");
    };

    const play = () => {
      safePlay(video)
        .then(() => {
          render();
        })
        .catch(() => {
          // Autoplay was prevented by browser policy
          userPaused = true;
          render();
        });
    };

    // Handle initial state based on motion preference
    if (userPaused) {
      video.pause();
      render();
    } else {
      play();
    }

    toggle.addEventListener("click", () => {
      if (video.paused) {
        userPaused = false;
        play();
      } else {
        userPaused = true;
        video.pause();
        render();
      }
    });

    video.addEventListener("play", render);
    video.addEventListener("pause", render);

    // Save battery: pause while off screen, resume when back (unless visitor paused it)
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            if (!userPaused) play();
          } else {
            video.pause();
            render();
          }
        },
        { threshold: 0.2 },
      ).observe(video);
    }
  });
})();

// content rise when scrolled into view (e.g. project cards, about logos, etc.)
document.addEventListener("DOMContentLoaded", () => {
  gsap.registerPlugin(ScrollTrigger);

  const mm = gsap.matchMedia();

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    const cards = gsap.utils.toArray(".rise-item-anim");
    if (!cards.length) return;

    gsap.set(cards, { y: 40, autoAlpha: 0 });

    ScrollTrigger.batch(cards, {
      start: "top 85%",
      once: true,
      onEnter: (batch) =>
        gsap.to(batch, {
          y: 0,
          autoAlpha: 1,
          duration: 0.8,
          ease: "power3.out",
          stagger: 0.12,
          overwrite: true,
          clearProps: "transform",
        }),
    });
  });

  // Recalculate trigger positions once images have loaded
  window.addEventListener("load", () => ScrollTrigger.refresh());
});


// service pinning: heading stays pinned while the cards scroll up and cover each other
(function () {
  gsap.registerPlugin(ScrollTrigger);
 
  const section = document.querySelector("#services-list");
  if (!section) return;
 
  const heading = section.querySelector(".service-page-pin");
  const grid = section.querySelector(".grid.grid-cols-1");
  if (!heading || !grid) return;
 
  // The block holding "Provided services" label + h1
  const headBlock = heading.parentElement;
  const cards = gsap.utils.toArray(grid.children);
  if (cards.length < 2) return;
 
  const NAV_OFFSET = 100;  // gap from top of viewport (your header height)
  const GAP = 40;          // space between pinned heading and first card
  const STEP = 0;          // 0 = each card fully covers the previous one (use e.g. 14 to peek)
 
  // Where the first card sticks: below the pinned heading
  const stackTop = () => NAV_OFFSET + headBlock.offsetHeight + GAP;
  const lastTop = () => stackTop() + (cards.length - 1) * STEP;
 
  const mm = gsap.matchMedia();
 
  mm.add("(min-width: 0px)", () => {
    const last = cards[cards.length - 1];
 
    // Heading stays above the cards, so cards never cover it
    headBlock.style.position = "relative";
    headBlock.style.zIndex = cards.length + 5;
 
    // Pin the heading block until the last card has arrived
    ScrollTrigger.create({
      trigger: headBlock,
      start: `top top+=${NAV_OFFSET}`,
      endTrigger: last,
      end: () => `top top+=${lastTop()}`,
      pin: true,
      pinSpacing: false,
      invalidateOnRefresh: true,
    });
 
    cards.forEach((card, i) => {
      card.style.transformOrigin = "50% 0%";
      card.style.zIndex = i + 1;
 
      if (i < cards.length - 1) {
        // Hold this card until the last card arrives
        ScrollTrigger.create({
          trigger: card,
          start: () => `top top+=${stackTop() + i * STEP}`,
          endTrigger: last,
          end: () => `top top+=${lastTop()}`,
          pin: true,
          pinSpacing: false,
          invalidateOnRefresh: true,
        });
      }
    });
 
    return () => {
      gsap.set(cards, { clearProps: "transform,transformOrigin,zIndex" });
      headBlock.style.position = "";
      headBlock.style.zIndex = "";
    };
  });
 
  window.addEventListener("load", () => ScrollTrigger.refresh());
})();