/* JavaScript */

document.addEventListener("DOMContentLoaded", () => {

    // 1. Dynamic Greeting based on Time of Day
    const heroTitle = document.querySelector(".hero h1");
    if (heroTitle) {
        const hour = new Date().getHours();
        let greeting = "Hello, I'm Ara!";
        if (hour < 12) greeting = "Good morning, I'm Ara!";
        else if (hour < 18) greeting = "Good afternoon, I'm Ara!";
        else greeting = "Good evening, I'm Ara!";
        heroTitle.textContent = greeting;
    }

    // 2. Active Navigation Link Highlighting
    const currentLocation = window.location.pathname.split("/").pop();
    const navLinks = document.querySelectorAll("header nav a");
    navLinks.forEach(link => {
        if (link.getAttribute("href") === currentLocation) {
            link.style.backgroundColor = "var(--soft-blue)";
            link.style.color = "var(--accent-blue)";
        }
    });

    // 3. Scroll-triggered Fade-In Animation for Sections & Cards
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = "1";
                entry.target.style.transform = "";
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll("section, .card, .cert-card").forEach(el => {
        el.style.opacity = "0";
        el.style.transform = "translateY(20px)";
        el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
        observer.observe(el);
    });

    // 4. Real-time Project Search & Filter (injects a clean search box if projects grid exists)
    const projectsGrid = document.querySelector("#projects .grid");
    if (projectsGrid) {
        const searchWrapper = document.createElement("div");
        searchWrapper.style.cssText = "margin-bottom: 1.5rem; text-align: center;";
        searchWrapper.innerHTML = `
            <input type="text" id="projectSearch" placeholder="🔍 Search projects by keyword (e.g. Java, Figma)..." 
            style="width: 100%; max-width: 400px; padding: 0.7rem 1.2rem; border-radius: 999px; border: 1.5px solid var(--soft-blue); font-family: 'Plus Jakarta Sans', sans-serif; outline: none; background: #fafcff; color: var(--deep-text);">
        `;
        projectsGrid.parentNode.insertBefore(searchWrapper, projectsGrid);

        document.getElementById("projectSearch").addEventListener("input", (e) => {
            const term = e.target.value.toLowerCase();
            const cards = projectsGrid.querySelectorAll(".card");
            cards.forEach(card => {
                const text = card.textContent.toLowerCase();
                card.style.display = text.includes(term) ? "flex" : "none";
            });
        });
    }

    // 5. Click a project or activity card photo area to pop up its picture (lightbox)
    const cardElements = document.querySelectorAll("#projects .card, .cert-card");
    cardElements.forEach(card => {
        // Cards without a picture carousel stay non-clickable for zoom
        if (!card.querySelector(".carousel-slide")) return;

        const carouselMedia = card.querySelector(".carousel");
        if (carouselMedia) {
            carouselMedia.style.cursor = "zoom-in";
            carouselMedia.title = "Click to view picture";
            carouselMedia.addEventListener("click", (e) => {
                // Ignore clicks on navigation arrows or dots
                if (e.target.closest('a, .carousel-btn, .carousel-dots')) return;

                const imgs = [...card.querySelectorAll(".carousel-slide")];
                if (!imgs.length) return;
                const start = Math.max(0, imgs.findIndex(img => img.classList.contains("active")));
                const title = card.querySelector("h3")?.textContent || "";
                openLightbox(imgs, start, title);
            });
        }
    });

    function openLightbox(imgs, startIndex, title) {
        let index = startIndex;
        const overlay = document.createElement("div");
        overlay.className = "lightbox";
        overlay.innerHTML = `
            <div class="lightbox-box">
                <button type="button" class="lightbox-close" aria-label="Close">&times;</button>
                <button type="button" class="lightbox-nav prev" aria-label="Previous image">&#8249;</button>
                <img class="lightbox-img" alt="">
                <button type="button" class="lightbox-nav next" aria-label="Next image">&#8250;</button>
                <p class="lightbox-caption"></p>
            </div>
        `;
        document.body.appendChild(overlay);

        const imgEl = overlay.querySelector(".lightbox-img");
        const caption = overlay.querySelector(".lightbox-caption");
        const prevBtn = overlay.querySelector(".prev");
        const nextBtn = overlay.querySelector(".next");

        function show() {
            imgEl.src = imgs[index].src;
            imgEl.alt = imgs[index].alt;
            caption.textContent = imgs.length > 1 ? `${title}  \u2022  ${index + 1} / ${imgs.length}` : title;
        }
        function step(n) { index = (index + n + imgs.length) % imgs.length; show(); }
        function close() {
            document.removeEventListener("keydown", onKey);
            overlay.remove();
        }
        function onKey(ev) {
            if (ev.key === "Escape") close();
            else if (imgs.length > 1 && ev.key === "ArrowLeft") step(-1);
            else if (imgs.length > 1 && ev.key === "ArrowRight") step(1);
        }

        if (imgs.length < 2) { prevBtn.hidden = true; nextBtn.hidden = true; }
        prevBtn.onclick = () => step(-1);
        nextBtn.onclick = () => step(1);
        overlay.querySelector(".lightbox-close").onclick = close;
        overlay.onclick = (ev) => { if (ev.target === overlay || ev.target.classList.contains("lightbox-box")) close(); };
        document.addEventListener("keydown", onKey);
        show();
    }

    // 6. Live Local Time / Status Indicator in Footer
    const footerBottom = document.querySelector(".footer-bottom");
    if (footerBottom) {
        const statusSpan = document.createElement("p");
        statusSpan.innerHTML = `📍 Bintulu, Sarawak &bull; <span id="localTime"></span>`;
        footerBottom.insertBefore(statusSpan, footerBottom.firstChild);

        setInterval(() => {
            const timeStr = new Date().toLocaleTimeString('en-MY', { timeZone: 'Asia/Kuala_Lumpur', hour: '2-digit', minute: '2-digit' });
            const timeEl = document.getElementById("localTime");
            if (timeEl) timeEl.textContent = `${timeStr} MYT`;
        }, 1000);
    }

    // 7. Contact Email/Phone Click-to-Copy with Toast Notification
    document.querySelectorAll("a[href^='mailto:'], a[href^='tel:']").forEach(contactLink => {
        contactLink.addEventListener("click", (e) => {
            const textToCopy = contactLink.textContent.trim();
            navigator.clipboard.writeText(textToCopy).then(() => {
                showToast(`Copied "${textToCopy}" to clipboard! 📋`);
            }).catch(() => { });
        });
    });

    function showToast(message) {
        const toast = document.createElement("div");
        toast.textContent = message;
        toast.style.cssText = "position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%); background: var(--deep-text); color: white; padding: 0.7rem 1.5rem; border-radius: 999px; font-size: 0.85rem; font-weight: 600; z-index: 2000; box-shadow: 0 4px 12px rgba(0,0,0,0.2); transition: opacity 0.3s ease;";
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = "0";
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    }

    /* 8. Dynamic Back-to-Top Floating Button */
    const topButton = document.createElement("button");
    topButton.innerHTML = "↑";
    topButton.style.cssText = "position: fixed; bottom: 30px; right: 30px; width: 42px; height: 42px; border-radius: 50%; background: var(--accent-blue); color: white; border: none; font-size: 1.2rem; cursor: pointer; display: none; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(91, 157, 217, 0.4); z-index: 99; transition: transform 0.2s;";
    topButton.onmouseover = () => topButton.style.transform = "translateY(-3px)";
    topButton.onmouseout = () => topButton.style.transform = "translateY(0)";
    topButton.onclick = () => window.scrollTo({ top: 0, behavior: 'smooth' });
    document.body.appendChild(topButton);

    window.addEventListener("scroll", () => {
        if (window.scrollY > 300) {
            topButton.style.display = "flex";
        } else {
            topButton.style.display = "none";
        }
    });

    /* 9. External Link Security Enhancements */
    document.querySelectorAll("a[href^='http']").forEach(extLink => {
        if (!extLink.getAttribute("target")) {
            extLink.setAttribute("target", "_blank");
            extLink.setAttribute("rel", "noopener");
        }
    });

    /* 10. Hide/Fade Header on Scroll Down, Show on Scroll Up */
    let lastScrollY = window.scrollY;
    const header = document.querySelector("header");

    window.addEventListener("scroll", () => {
        const currentScrollY = window.scrollY;

        if (currentScrollY > lastScrollY && currentScrollY > 50) {
            header.classList.add("header-hidden");
        } else {
            header.classList.remove("header-hidden");
        }

        lastScrollY = currentScrollY;
    });

    // 11. Image carousel (swap between multiple images on project and activity cards)
    document.querySelectorAll(".carousel").forEach(carousel => {
        const track = carousel.querySelector(".carousel-track");
        const prevBtn = carousel.querySelector(".carousel-btn.prev");
        const nextBtn = carousel.querySelector(".carousel-btn.next");
        const dots = carousel.querySelector(".carousel-dots");
        let index = 0;
        let startX = null;

        const getSlides = () => track ? [...track.querySelectorAll(".carousel-slide")] : [];

        function render() {
            const slides = getSlides();
            if (!slides.length) return;
            if (index >= slides.length) index = slides.length - 1;
            slides.forEach((el, i) => el.classList.toggle("active", i === index));

            if (dots) {
                dots.innerHTML = "";
                slides.forEach((_, i) => {
                    const dot = document.createElement("button");
                    dot.type = "button";
                    dot.className = "carousel-dot" + (i === index ? " active" : "");
                    dot.setAttribute("aria-label", `Show image ${i + 1}`);
                    dot.addEventListener("click", () => { index = i; render(); });
                    dots.appendChild(dot);
                });
            }

            const multiple = slides.length > 1;
            if (prevBtn) prevBtn.hidden = !multiple;
            if (nextBtn) nextBtn.hidden = !multiple;
            if (dots) dots.hidden = !multiple;
        }

        function go(step) {
            const slides = getSlides();
            const total = slides.length;
            if (total < 2) return;
            index = (index + step + total) % total;
            render();
        }

        if (prevBtn) prevBtn.addEventListener("click", (e) => { e.stopPropagation(); go(-1); });
        if (nextBtn) nextBtn.addEventListener("click", (e) => { e.stopPropagation(); go(1); });

        // Swipe on touch screens
        carousel.addEventListener("touchstart", e => { startX = e.touches[0].clientX; }, { passive: true });
        carousel.addEventListener("touchend", e => {
            if (startX === null) return;
            const diff = e.changedTouches[0].clientX - startX;
            if (Math.abs(diff) > 40) go(diff < 0 ? 1 : -1);
            startX = null;
        });

        // Handle missing images safely
        getSlides().forEach(img => {
            img.addEventListener("error", () => {
                img.remove();
                render();
            });
        });

        render();
    });

});