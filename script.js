// ── Smooth scroll ──
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
});
// ── Animasi entrance (marginTop bukan translateY supaya mix-blend-mode tetap jalan) ──
anime.timeline({ easing: 'easeOutExpo' })
    .add({ targets: 'nav',           marginTop: [-20, 0], opacity: [0, 1], duration: 800 })
    .add({ targets: 'header h1',     marginTop: [30, 0],  opacity: [0, 1], duration: 800 }, '-=600')
    .add({ targets: 'header p',      marginTop: [30, 0],  opacity: [0, 1], duration: 800 }, '-=600')
    .add({ targets: 'header button', marginTop: [30, 0],  opacity: [0, 1], duration: 800 }, '-=600');
// ── Material cards hover effect ──
document.querySelectorAll('.material-card').forEach(card => {
    let timeout;
    const desc = card.querySelector('.material-desc');
    card.addEventListener('mouseenter', () => {
        timeout = setTimeout(() => {
            card.style.borderRadius  = '12px 12px 0 0';
            desc.style.maxHeight     = desc.scrollHeight + 32 + 'px';
            desc.style.opacity       = '1';
            desc.style.padding       = '0.75rem 1rem';
            desc.style.pointerEvents = 'auto';
        }, 800);
    });
    card.addEventListener('mouseleave', () => {
        clearTimeout(timeout);
        desc.style.maxHeight     = '0';
        desc.style.opacity       = '0';
        desc.style.padding       = '0 1rem';
        desc.style.pointerEvents = 'none';
        desc.addEventListener('transitionend', () => {
            card.style.borderRadius = '12px';
        }, { once: true });
    });
});
// ── Section fade in waktu scroll ──
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            anime({
                targets: entry.target,
                marginTop: [40, 0],
                opacity: [0, 1],
                duration: 800,
                easing: 'easeOutExpo'
            });
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });
document.querySelectorAll('main section').forEach(section => {
    section.style.opacity = 0;
    observer.observe(section);
});
// ── Custom cursor ──
(function () {
    const dot  = document.getElementById('mag-dot');
    const ring = document.getElementById('mag-ring');
    // posisi mouse & ring (pakai offset langsung, bukan transform)
    let mx = -200, my = -200;
    let rx = -200, ry = -200;
    let isSnapped = false;
    let activeEl  = null;
    const thresholdPx = 14;
    // update posisi dot & ring pakai offset langsung
    // CSS sudah set transform: translate(-50%,-50%) sekali,
    // tapi kita override left/top supaya center pas di cursor
    function setDotPos(x, y) {
        dot.style.left = x + 'px';
        dot.style.top  = y + 'px';
    }
    function setRingPos(x, y) {
        ring.style.left = x + 'px';
        ring.style.top  = y + 'px';
    }
    window.addEventListener('scroll', () => checkMagnetic());
    document.addEventListener('mousemove', e => {
        mx = e.clientX;
        my = e.clientY;
        setDotPos(mx, my);
        checkMagnetic();
        checkHover();
    });
    document.addEventListener('mouseleave', () => {
        dot.classList.add('is-hidden');
        ring.classList.add('is-hidden');
        releaseSnap();
    });
    document.addEventListener('mouseenter', () => {
        dot.classList.remove('is-hidden');
        ring.classList.remove('is-hidden');
    });
    function checkMagnetic() {
        const mags = document.querySelectorAll('.mag');
        let found  = null;
        mags.forEach(el => {
            const r   = el.getBoundingClientRect();
            const pad = thresholdPx;
            if (
                mx >= r.left   - pad &&
                mx <= r.right  + pad &&
                my >= r.top    - pad &&
                my <= r.bottom + pad
            ) {
                found = {
                    el,
                    cx: r.left + r.width  / 2,
                    cy: r.top  + r.height / 2,
                    w:  r.width,
                    h:  r.height,
                };
            }
        document.querySelectorAll('.mag-sm').forEach(el => {
            const r   = el.getBoundingClientRect();
            const pad = 2; // ← threshold kecil buat dropdown
            const parentDropdown = el.closest('.dropdown');
            if (parentDropdown && !parentDropdown.matches(':hover')) return;
            if (
                mx >= r.left - pad &&
                mx <= r.right + pad &&
                my >= r.top  - pad &&
                my <= r.bottom + pad
            ) {
                found = {
                    el,
                    cx: r.left + r.width/2,
                    cy: r.top + r.height/2,
                    w: r.width,
                    h: r.height
                };
            }
    });   
        });
        if (found) snapTo(found);
        else releaseSnap();
    }
    function snapTo({ el, cx, cy, w, h }) {
        const br = getComputedStyle(el).borderRadius;
        ring.style.width        = w + 'px';
        ring.style.height       = h + 'px';
        ring.style.borderRadius = br;
        setRingPos(cx, cy);
        ring.classList.add('is-snapped');
        dot.classList.add('is-snapped');

        // reset efek hover yg data-cursor
        dot.style.opacity       = '1';
        dot.style.zIndex        = '99999';
        dot.style.background    = '#fff';
        dot.style.mixBlendMode  = 'difference';
        ring.style.zIndex       = '99998';
        ring.style.mixBlendMode = 'difference';
        ring.style.background   = '#fff';
        ring.style.boxShadow    = '0 0 0 1.5px #111';

        if (activeEl !== el) {
            if (activeEl) activeEl.style.pointerEvents = '';
            // el.style.pointerEvents = 'none';
            activeEl = el;
        }
        isSnapped = true;
    }
    function releaseSnap() {
        if (activeEl) {
            // activeEl.style.pointerEvents = '';
            activeEl = null;
        }
        ring.style.width        = 'var(--ring-size)';
        ring.style.height       = 'var(--ring-size)';
        ring.style.borderRadius = '50%';
        ring.classList.remove('is-snapped');
        dot.classList.remove('is-snapped');
        isSnapped = false;
    }
    // ── Click animation ──
    document.addEventListener('mousedown', () => {
        dot.style.transform = 'translate(-50%, -50%) scale(0.5)';
        if (isSnapped && activeEl) {
            const r = activeEl.getBoundingClientRect();
            ring.style.width  = (r.width  * 0.92) + 'px';
            ring.style.height = (r.height * 0.92) + 'px';
        } else {
            ring.style.width  = 'calc(var(--ring-size) * 1.25)';
            ring.style.height = 'calc(var(--ring-size) * 1.25)';
        }
    });
    document.addEventListener('mouseup', () => {
        dot.style.transform = 'translate(-50%, -50%) scale(1)';
        if (!isSnapped) {
            ring.style.width  = 'var(--ring-size)';
            ring.style.height = 'var(--ring-size)';
        } else if (activeEl) {
            const r = activeEl.getBoundingClientRect();
            ring.style.width  = r.width  + 'px';
            ring.style.height = r.height + 'px';
        }
    });
    function lerp(a, b, t) { return a + (b - a) * t; }
    function tick() {
        if (!isSnapped) {
            rx = lerp(rx, mx, 0.13);
            ry = lerp(ry, my, 0.13);
            setRingPos(rx, ry);
        }
        // merge detection
        const dx   = mx - rx;
        const dy   = my - ry;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (!isSnapped && dist < 28) {
            ring.classList.add('is-merging');
        } else {
            ring.classList.remove('is-merging');
        }
        requestAnimationFrame(tick);
    }
    tick();

    // ── Video iframe overlay (fix cursor freeze) ── ← TARUH DI SINI
    document.querySelectorAll('.video-wrapper, .video-container').forEach(wrapper => {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: absolute;
            inset: 0;
            z-index: 2;
            pointer-events: none;
        `;
        wrapper.style.position = 'relative';
        wrapper.appendChild(overlay);

        wrapper.addEventListener('mouseenter', () => {
            overlay.style.pointerEvents = 'auto';
            ring.style.zIndex = '-1';
            ring.style.opacity = '0';
            setTimeout(() => {
                ring.classList.add('video-hover');
                ring.style.zIndex = '-1';
                ring.style.opacity = '1';
            }, 150);
        });

        overlay.addEventListener('mousemove', e => {
            mx = e.clientX;
            my = e.clientY;
            setDotPos(mx, my);
        });

        overlay.addEventListener('click', () => {
            overlay.style.pointerEvents = 'none';
            setTimeout(() => {
                overlay.style.pointerEvents = 'auto';
            }, 1500);
        });

        wrapper.addEventListener('mouseleave', () => {
            overlay.style.pointerEvents = 'none';
            ring.style.zIndex = '99998';
            ring.style.opacity = '0';
            setTimeout(() => {
                ring.classList.remove('video-hover');
                ring.style.zIndex = '-1';
                ring.style.opacity = '1';
            }, 150);
        });
    });

    // ── Hover non-mag detection ──
    function checkHover() {
        if (isSnapped) return; // kalau lagi snap, skip
    
        const el = document.elementFromPoint(mx, my);
        const isHoverable = el && el.closest('[data-cursor]');
    
        if (isHoverable) {
            const mode    = isHoverable.closest('[data-cursor]').dataset.cursor;
            applyHover(mode);
        } else {
            resetHover();
        }
    }
    function applyHover(mode) {
        const presets = {
            // format: { ringSize, blendMode, dotZ, ringZ, dotOpacity }
            'expand': {
                ringW: '6rem', ringH: '6rem',
                blendMode: 'difference',
                dotOpacity: '0',
                dotZ: '1',
                ringZ: '99998',
            },
            'text': {
                ringW: '8px', ringH: '10px',
                blendMode: 'difference',
                dotOpacity: '1',
                dotZ: '99999',
                ringZ: '99998',
            },
            'hidden': {
                ringW: '0px', ringH: '0px',
                blendMode: 'difference',
                dotOpacity: '0',
                dotZ: '1',
                ringZ: '1',
            },
        };
    
        const p = presets[mode] ?? presets['expand'];
        ring.style.width        = p.ringW;
        ring.style.height       = p.ringH;
        ring.style.mixBlendMode = p.blendMode;
        ring.style.zIndex       = p.ringZ;
        dot.style.opacity       = p.dotOpacity;
        dot.style.zIndex        = p.dotZ;
    }
    function resetHover() {
        ring.style.width        = 'var(--ring-size)';
        ring.style.height       = 'var(--ring-size)';
        ring.style.mixBlendMode = 'difference';
        ring.style.zIndex       = '99998';
        dot.style.opacity       = '1';
        dot.style.zIndex        = '99999';
        dot.style.background    = '#fff';
    }
})();
// ── Unsur warta scroll dot ──
const unsurDot  = document.getElementById('unsur-dot');
const unsurLine = document.getElementById('unsur-center');

// sembunyiin semua list item dulu
const leftItems  = document.querySelectorAll('#unsur-left  .list-container-unsur');
const rightItems = document.querySelectorAll('#unsur-right .list-container-unsur');

// total ada 6 item (3 kiri, 3 kanan), tiap item muncul di progress tertentu
const allItems = [
    { el: rightItems[0], threshold: 0.05 },  // What   — paling atas kanan
    { el: leftItems[0],  threshold: 0.20 },  // Who    — kiri kedua
    { el: rightItems[1], threshold: 0.38 },  // When   — kanan kedua
    { el: leftItems[1],  threshold: 0.55 },  // Where  — kiri keempat
    { el: rightItems[2], threshold: 0.72 },  // Why    — kanan ketiga
    { el: leftItems[2],  threshold: 0.88 },  // How    — kiri keenam
];

// style awal: semua tersembunyi
allItems.forEach(({ el }) => {
    if (!el) return;
    el.style.opacity   = '0';
    el.style.transform = 'translateY(8px)';
    el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
});

window.addEventListener('scroll', () => {
    if (!unsurDot || !unsurLine) return;

    const rect     = unsurLine.getBoundingClientRect();
    const lineH    = unsurLine.getBoundingClientRect().height;
    const viewH    = window.innerHeight;
    const triggerStart = viewH * 0.8;
    const progress     = (triggerStart - rect.top) / lineH;
    const clamped  = Math.min(Math.max(progress, 0), 1);

    unsurDot.style.top = (clamped * lineH) + 'px';

    allItems.forEach(({ el, threshold }) => {
        if (!el) return;
        if (clamped >= threshold) {
            el.style.opacity   = '1';
            el.style.transform = 'translateY(0)';
        } else {
            el.style.opacity   = '0';
            el.style.transform = 'translateY(8px)';
        }
    });
});

// ── Carousel Foto Catatan ──
(function () {
    const track      = document.querySelector('.carousel-track');
    const slides     = document.querySelectorAll('.carousel-slide');
    const prevBtn    = document.getElementById('carouselPrev');
    const nextBtn    = document.getElementById('carouselNext');
    const dotsEl     = document.getElementById('carouselDots');
    const progressEl = document.getElementById('carouselProgress');
    const wrapper    = document.getElementById('carouselTrack');

    if (!track || slides.length === 0) return;

    const total = slides.length;
    const DELAY = 4000;
    let current   = 0;
    let isPaused  = false;
    let autoTimer = null;
    let progStart = null;
    let progRemaining = DELAY;

    // ── Buat dots ──
    slides.forEach((_, i) => {
        const d = document.createElement('div');
        d.className = 'carousel-dot' + (i === 0 ? ' active' : '');
        d.addEventListener('click', () => goTo(i));
        dotsEl.appendChild(d);
    });

    function updateDots() {
        dotsEl.querySelectorAll('.carousel-dot').forEach((d, i) => {
            d.classList.toggle('active', i === current);
        });
    }

    function goTo(idx) {
        current = (idx + total) % total;
        const wrapper = document.getElementById('carouselTrack');
        wrapper.scrollTo({
            left: current * wrapper.offsetWidth,
            behavior: 'smooth'
        });
        updateDots();
        if (!isPaused) startCycle();
    }

    // ── Progress bar ──
    function startProgress(duration) {
        progressEl.classList.remove('running');
        progressEl.style.transition = 'none';
        progressEl.style.setProperty('--prog-w', '0%');
        void progressEl.offsetWidth;
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                progressEl.style.transition = `width ${duration}ms linear`;
                progressEl.classList.add('running');
                progStart = Date.now();
                progRemaining = duration;
            });
        });
    }

    function pauseProgress() {
        const elapsed = Date.now() - progStart;
        progRemaining = Math.max(0, progRemaining - elapsed);
        progressEl.style.transition = 'none';
        // freeze progress bar di posisi sekarang
        const pct = ((DELAY - progRemaining) / DELAY) * 100;
        progressEl.style.setProperty('--frozen-w', pct + '%');
        progressEl.classList.remove('running');
        progressEl.classList.add('paused');
    }

    function resumeProgress() {
        progressEl.classList.remove('paused');
        void progressEl.offsetWidth;
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                progressEl.style.transition = `width ${progRemaining}ms linear`;
                progressEl.classList.add('running');
                progStart = Date.now();
            });
        });
    }

    function startCycle(duration = DELAY) {
        clearTimeout(autoTimer);
        startProgress(duration);
        autoTimer = setTimeout(() => {
            if (!isPaused) goTo(current + 1);
        }, duration);
    }

    // ── Pause / Resume ──
    function pause() {
        if (isPaused) return;
        isPaused = true;
        clearTimeout(autoTimer);
        pauseProgress();
    }

    function resume() {
        if (!isPaused) return;
        isPaused = false;
        resumeProgress();
        autoTimer = setTimeout(() => {
            goTo(current + 1);
        }, progRemaining);
    }

    // hover pause
    // wrapper.addEventListener('mouseenter', pause);
    // wrapper.addEventListener('mouseleave', resume);

    // ── Tombol navigasi ──
    prevBtn.addEventListener('click', () => goTo(current - 1));
    nextBtn.addEventListener('click', () => goTo(current + 1));
    
    const pauseBtn   = document.getElementById('carouselPause');
    const pauseIcon  = document.getElementById('pauseIcon');
    const playIcon   = document.getElementById('playIcon');

    pauseBtn.addEventListener('click', () => {
        if (isPaused) {
            resume();
            pauseIcon.style.display = '';
            playIcon.style.display  = 'none';
        } else {
            pause();
            pauseIcon.style.display = 'none';
            playIcon.style.display  = '';
        }
    });

    // ── Swipe / drag ──
    let startX = 0, isDragging = false;

    wrapper.addEventListener('mousedown', e => {
        startX = e.clientX;
        isDragging = true;
        pause();
    });
    window.addEventListener('mouseup', e => {
        if (!isDragging) return;
        isDragging = false;
        const diff = e.clientX - startX;
        if (Math.abs(diff) > 50) {
            goTo(diff < 0 ? current + 1 : current - 1);
        } else {
            resume();
        }
    });

    wrapper.addEventListener('touchstart', e => {
        startX = e.touches[0].clientX;
        pause();
    }, { passive: true });
    wrapper.addEventListener('touchend', e => {
        const diff = e.changedTouches[0].clientX - startX;
        if (Math.abs(diff) > 50) {
            goTo(diff < 0 ? current + 1 : current - 1);
        } else {
            resume();
        }
    }, { passive: true });

    // ── Mulai ──
    startCycle();
})();