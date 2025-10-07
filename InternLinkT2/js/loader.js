// /// jasen add: polished circular loader with smooth progress, visual polish and nav/form hooks
(function () {
    // /// jasen add: cached DOM refs
    const loader = document.getElementById("app-loader"); // /// jasen add
    const ringFg = document.querySelector(".ring-fg"); // /// jasen add
    const ringSvg = document.querySelector(".ring-svg"); // /// jasen add
    const loaderCard = document.querySelector(".loader-card"); // /// jasen add
    const percentEl = document.getElementById("loader-percent"); // /// jasen add
    const logoImg = document.querySelector(".loader-logo img"); // /// jasen add

    if (!loader) {
        // /// jasen add: overlay is optional (pages without it will quietly skip)
        return;
    }

    // /// jasen add: circumference for r=44 (approx)
    const CIRC = 276.46;
    if (ringFg) {
        ringFg.style.strokeDasharray = String(CIRC);
        ringFg.style.strokeDashoffset = String(CIRC);
    }

    // animation state
    let rafId = null;
    let value = 0;
    let running = false;
    let stepTimer = null;
    const STEP_DELAY = 85; // steady smooth step
    const SAFETY_MS = 18000; // fallback to finish

    // /// jasen add: animated logo + subtle wobble on ring
    let t = 0;
    function animateLogo() {
        t += 0.038;
        if (logoImg) {
            const rotate = Math.sin(t) * 2.6 + Math.sin(t * 0.28) * 0.5;
            const scale = 1 + Math.sin(t * 0.92) * 0.016 + Math.sin(t * 0.18) * 0.002;
            logoImg.style.transform = `rotate(${rotate}deg) scale(${scale})`;
        }
        if (ringFg) {
            // tiny dynamic wobble is added on top of real offset for life
            const wobble = Math.sin(t * 1.6) * 4;
            const base = CIRC * (1 - value / 100);
            ringFg.style.strokeDashoffset = String(base + wobble);
        }
        rafId = requestAnimationFrame(animateLogo);
    }

    // /// jasen add: set progress display
    function setProgress(v) {
        const clamped = Math.max(0, Math.min(100, v));
        value = clamped; // keep internal state
        if (ringFg) {
            const offset = CIRC * (1 - clamped / 100);
            ringFg.style.strokeDashoffset = String(offset);
        }
        if (percentEl) percentEl.textContent = Math.round(clamped) + "%";
    }

    // /// jasen add: smoother eased stepping for organic feel
    function step() {
        if (!running) return;
        const remain = 100 - value;
        const easeFactor = Math.pow(remain / 100, 0.9);
        const stepSize = Math.max(0.2, remain * 0.013 * (1 + easeFactor)) + Math.random() * 0.6;
        value = Math.min(100, value + stepSize);
        setProgress(value);
        if (value < 100) {
            stepTimer = setTimeout(step, STEP_DELAY);
        } else {
            finish();
        }
    }

    // /// jasen add: start loader visuals & animation
    function startSimulation() {
        if (running) return;
        running = true;
        value = 0;
        setProgress(0);
        // CSS classes for richer visuals
        loader.classList.add("loader-active");
        if (ringSvg) ringSvg.classList.add("ring-rotate");
        if (loaderCard) loaderCard.classList.remove("finish-bounce");
        if (logoImg) {
            logoImg.classList.remove("logo-finish");
            logoImg.classList.add("logo-entrance");
            setTimeout(() => logoImg.classList.remove("logo-entrance"), 700);
        }
        rafId = requestAnimationFrame(animateLogo);
        stepTimer = setTimeout(step, 140);
        // safety fallback
        setTimeout(() => {
            if (running) {
                setProgress(100);
                finish();
            }
        }, SAFETY_MS);
    }

    // /// jasen add: finish with small bounce + fade
    function finish() {
        running = false;
        if (rafId) cancelAnimationFrame(rafId);
        if (stepTimer) clearTimeout(stepTimer);
        if (ringSvg) ringSvg.classList.remove("ring-rotate");
        if (loaderCard) loaderCard.classList.add("finish-bounce");
        if (logoImg) logoImg.classList.add("logo-finish");

        // show finish then dismiss
        setTimeout(() => {
            loader.style.transition = "opacity 420ms ease, transform 420ms ease";
            loader.style.opacity = "0";
            loader.style.transform = "translateY(-6px) scale(.995)";
            loader.setAttribute("aria-hidden", "true");
        }, 180);

        setTimeout(() => {
            try { loader.remove(); } catch (e) {}
        }, 760);
    }

    // /// jasen add: public API
    window.showLoader = function showLoader() {
        try {
            loader.style.display = "flex";
            loader.style.opacity = "1";
            loader.style.transform = "translateY(0) scale(1)";
            loader.setAttribute("aria-hidden", "false");
        } catch (e) {}
        startSimulation();
    };
    window.hideLoader = function hideLoader() {
        finish();
    };

    // /// jasen add: auto-start on first paint so users see motion immediately
    startSimulation();

    // /// jasen add: intercept clicks on [data-href] to show loader then navigate
    document.addEventListener(
        "click",
        function (ev) {
            const btn = ev.target.closest && ev.target.closest("[data-href]");
            if (!btn) return;
            const href = btn.getAttribute("data-href");
            if (!href) return;
            ev.preventDefault();
            window.showLoader();
            // small delay so loader is visible before navigating
            setTimeout(() => {
                window.location.href = href;
            }, 520);
        },
        true
    );

    // /// jasen add: show loader on form submit so users see feedback
    document.addEventListener(
        "submit",
        function () {
            window.showLoader();
            // allow submit to proceed
        },
        true
    );
})();