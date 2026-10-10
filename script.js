/* =========================================================
   INVITACIÓN DIGITAL — ILSE & JAN
   JavaScript principal
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTOS PRINCIPALES
       ===================================================== */

    const body = document.body;
    const loader = document.getElementById("premiumLoader");
    const music = document.getElementById("bgMusic");
    const playBtn = document.getElementById("playBtn");
    const scrollProgress = document.getElementById("scrollProgress");
    const floatingParticles = document.getElementById("floatingParticles");

    /* =====================================================
       CONFIGURACIÓN DE FECHA
       ===================================================== */

    /* 
     * Fecha de la boda: 9 de enero de 2027 a las 12:00 PM
     * Nota: Nayarit normalmente tiene el huso horario de la Montaña (UTC-7 en invierno).
     */
    const weddingDate = new Date("2027-01-09T12:00:00-07:00").getTime();


    /* =====================================================
       LOADER
       ===================================================== */

    function hideLoader() {
        body.classList.add("premium-loaded");

        /*
         * Después de ocultar el loader, permitimos que
         * las animaciones de entrada comiencen.
         */
        setTimeout(() => {
            if (loader) {
                loader.setAttribute("aria-hidden", "true");
            }
        }, 1000);
    }

    /*
     * Esperamos un poco para que las fuentes, imágenes y
     * estructura inicial tengan tiempo de renderizar.
     */
    window.addEventListener("load", () => {
        setTimeout(hideLoader, 700);
    });

    /*
     * Fallback por si alguna imagen externa tarda demasiado.
     */
    setTimeout(() => {
        if (!body.classList.contains("premium-loaded")) {
            hideLoader();
        }
    }, 4500);


    /* =====================================================
       CUENTA REGRESIVA
       ===================================================== */

    const daysElement = document.getElementById("days");
    const hoursElement = document.getElementById("hours");
    const minutesElement = document.getElementById("minutes");
    const secondsElement = document.getElementById("seconds");

    let previousValues = {
        days: null,
        hours: null,
        minutes: null,
        seconds: null
    };

    function pad(value) {
        return String(value).padStart(2, "0");
    }

    function updateCountdown() {

        const now = Date.now();
        const difference = weddingDate - now;

        if (difference <= 0) {

            if (daysElement) daysElement.textContent = "00";
            if (hoursElement) hoursElement.textContent = "00";
            if (minutesElement) minutesElement.textContent = "00";
            if (secondsElement) secondsElement.textContent = "00";

            return;
        }

        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        updateCountdownValue(daysElement, pad(days), "days");
        updateCountdownValue(hoursElement, pad(hours), "hours");
        updateCountdownValue(minutesElement, pad(minutes), "minutes");
        updateCountdownValue(secondsElement, pad(seconds), "seconds");
    }

    function updateCountdownValue(element, value, key) {

        if (!element) return;

        const changed = previousValues[key] !== value;

        element.textContent = value;

        if (changed && previousValues[key] !== null) {

            const box = element.closest(".count-box");

            if (box) {

                box.classList.remove("is-ticking");

                /*
                 * Forzamos reflow para reiniciar la animación.
                 */
                void box.offsetWidth;

                box.classList.add("is-ticking");

                setTimeout(() => {
                    box.classList.remove("is-ticking");
                }, 400);
            }
        }

        previousValues[key] = value;
    }

    updateCountdown();

    setInterval(updateCountdown, 1000);


    /* =====================================================
       MÚSICA
       ===================================================== */

    if (music && playBtn) {

        const icon = playBtn.querySelector("i");

        function updateMusicButton() {

            if (music.paused) {
                playBtn.classList.remove("is-playing");
                playBtn.setAttribute("aria-label", "Reproducir música");

                if (icon) {
                    icon.className = "fa-solid fa-music";
                }
            } else {
                playBtn.classList.add("is-playing");
                playBtn.setAttribute("aria-label", "Pausar música");

                if (icon) {
                    icon.className = "fa-solid fa-pause";
                }
            }
        }

        playBtn.addEventListener("click", async () => {
            try {
                if (music.paused) {
                    await music.play();
                } else {
                    music.pause();
                }
                updateMusicButton();
            } catch (error) {
                console.warn("No fue posible reproducir la música:", error);
            }
        });

        music.addEventListener("play", updateMusicButton);
        music.addEventListener("pause", updateMusicButton);
        music.addEventListener("ended", updateMusicButton);

        updateMusicButton();
    }


    /* =====================================================
       BARRA DE PROGRESO
       ===================================================== */

    function updateScrollProgress() {

        if (!scrollProgress) return;

        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const documentHeight = document.documentElement.scrollHeight - window.innerHeight;

        if (documentHeight <= 0) {
            scrollProgress.style.width = "0%";
            return;
        }

        const progress = (scrollTop / documentHeight) * 100;
        scrollProgress.style.width = `${Math.min(100, Math.max(0, progress))}%`;
    }

    window.addEventListener("scroll", updateScrollProgress, { passive: true });
    updateScrollProgress();


    /* =====================================================
       INTERSECTION OBSERVER (Animaciones Fade In)
       ===================================================== */

    const revealObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("visible");
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.02,
            rootMargin: "0px 0px -60px 0px"
        }
    );

    document.querySelectorAll(".fade-in, .premium-reveal").forEach(element => {
        revealObserver.observe(element);
    });


    /* =====================================================
       FOTOS — ENTRADA + PARALLAX
       ===================================================== */

    const photoSections = document.querySelectorAll(".photo-section");

    const photoObserver = new IntersectionObserver(
        (entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("in-view");
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.12,
            rootMargin: "0px 0px -80px 0px"
        }
    );

    photoSections.forEach(section => {
        photoObserver.observe(section);
    });

    let ticking = false;

    function updatePhotoParallax() {
        const viewportHeight = window.innerHeight;

        photoSections.forEach(section => {
            const rect = section.getBoundingClientRect();
            const sectionCenter = rect.top + rect.height / 2;
            const distance = sectionCenter - viewportHeight / 2;

            /* Limitamos el desplazamiento para evitar movimientos exagerados o bordes visibles */
            const movement = Math.max(-28, Math.min(28, distance * -0.045));

            const image = section.querySelector("img");
            section.style.setProperty("--section-parallax", `${movement * 0.22}px`);

            if (image) {
                image.style.setProperty("--photo-parallax", `${movement}px`);
                image.style.setProperty("--photo-motion-scale", "1.06");
            }
        });

        ticking = false;
    }

    function requestPhotoParallax() {
        if (!ticking) {
            window.requestAnimationFrame(updatePhotoParallax);
            ticking = true;
        }
    }

    window.addEventListener("scroll", requestPhotoParallax, { passive: true });
    window.addEventListener("resize", requestPhotoParallax);
    updatePhotoParallax();


    /* =====================================================
       PARTÍCULAS FLOTANTES
       ===================================================== */

    function createParticles() {
        if (!floatingParticles) return;

        floatingParticles.innerHTML = "";
        const isMobile = window.innerWidth <= 430;
        const particleCount = isMobile ? 18 : 28;
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement("span");
            const left = Math.random() * 100;
            const size = Math.random() * 4 + 2;
            const duration = Math.random() * 14 + 12;
            const delay = Math.random() * -20;
            const drift = (Math.random() * 120) - 60;

            particle.style.setProperty("--particle-left", `${left}%`);
            particle.style.setProperty("--particle-size", `${size}px`);
            particle.style.setProperty("--particle-duration", `${duration}s`);
            particle.style.setProperty("--particle-delay", `${delay}s`);
            particle.style.setProperty("--particle-drift", `${drift}px`);

            fragment.appendChild(particle);
        }

        floatingParticles.appendChild(fragment);
    }

    createParticles();


    /* =====================================================
       EFECTO TILT SUTIL EN TARJETAS
       ===================================================== */

    const interactiveCards = document.querySelectorAll(".event-card, .count-box");

    if (window.matchMedia("(hover: hover)").matches) {
        interactiveCards.forEach(card => {
            card.addEventListener("mousemove", event => {
                const rect = card.getBoundingClientRect();
                const x = event.clientX - rect.left;
                const y = event.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -2.5;
                const rotateY = ((x - centerX) / centerX) * 2.5;

                card.style.transform = `perspective(700px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
            });

            card.addEventListener("mouseleave", () => {
                card.style.transform = "";
            });
        });
    }


    /* =====================================================
       RIPPLE EFFECT EN BOTONES
       ===================================================== */

    const buttons = document.querySelectorAll(".primary-btn, .secondary-btn, .rsvp-btn, .brand-contact-btn, .music-btn-float");

    buttons.forEach(button => {
        const computedPosition = window.getComputedStyle(button).position;
        if (computedPosition === "static") {
            button.style.position = "relative";
        }
        button.style.overflow = "hidden";

        button.addEventListener("click", event => {
            const rect = button.getBoundingClientRect();
            const ripple = document.createElement("span");

            ripple.className = "button-ripple";
            ripple.style.left = `${event.clientX - rect.left}px`;
            ripple.style.top = `${event.clientY - rect.top}px`;

            button.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 750);
        });
    });


    /* =====================================================
       FALLBACK DE IMÁGENES
       ===================================================== */

    const images = document.querySelectorAll(".photo-section img");

    images.forEach(image => {
        image.addEventListener("error", () => {
            const photoSection = image.closest(".photo-section");
            if (photoSection) {
                photoSection.classList.add("photo-fallback");
                image.style.display = "none";
            }
        });
    });


    /* =====================================================
       DETECCIÓN DE REDUCED MOTION
       ===================================================== */

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    function handleReducedMotion() {
        if (reducedMotion.matches) {
            photoSections.forEach(section => {
                section.style.setProperty("--section-parallax", "0px");
                const image = section.querySelector("img");
                if (image) {
                    image.style.setProperty("--photo-parallax", "0px");
                }
            });
        }
    }

    reducedMotion.addEventListener("change", handleReducedMotion);
    handleReducedMotion();

    document.documentElement.style.setProperty("scroll-behavior", reducedMotion.matches ? "auto" : "smooth");


    /* =====================================================
       INICIALIZACIÓN FINAL
       ===================================================== */

    console.log("💍 Invitación digital Ilse & Jan inicializada correctamente.");

});