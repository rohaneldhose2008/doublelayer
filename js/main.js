/* DoubleLayer Photography - Interactions & Luxury Engine */

// --- localStorage Reviews Persistence ---
const REVIEWS_STORAGE_KEY = "dl_reviews_v1";

function loadSavedReviews() {
  try {
    return JSON.parse(localStorage.getItem(REVIEWS_STORAGE_KEY)) || [];
  } catch (e) {
    return [];
  }
}

function saveReview(review) {
  const reviews = loadSavedReviews();
  reviews.push(review);
  try {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
  } catch (e) {}
}

function deleteReviewFromStorage(name, role, text, rating) {
  let reviews = loadSavedReviews();
  reviews = reviews.filter(r => !(r.name === name && r.role === role && r.text === text && r.rating === rating));
  try {
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
  } catch (e) {}
}

document.addEventListener("DOMContentLoaded", () => {
  
  // Initialize Lucide Icons
  if (window.lucide) {
    window.lucide.createIcons();
  }

  // --- INTERACTIVE LUXURY CURSOR SPOTLIGHT ---
  if (!('ontouchstart' in window) && window.innerWidth > 768) {
    const spotlight = document.createElement("div");
    spotlight.className = "cursor-spotlight";
    spotlight.id = "cursor-spotlight";
    document.body.appendChild(spotlight);

    let mouseX = 0, mouseY = 0;
    let spotX = 0, spotY = 0;

    window.addEventListener("mousemove", e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      spotlight.style.opacity = "1";
    });

    window.addEventListener("mouseleave", () => {
      spotlight.style.opacity = "0";
    });

    function updateSpotlight() {
      spotX += (mouseX - spotX) * 0.08;
      spotY += (mouseY - spotY) * 0.08;
      spotlight.style.transform = `translate3d(${spotX - 150}px, ${spotY - 150}px, 0)`;
      requestAnimationFrame(updateSpotlight);
    }
    updateSpotlight();
  }

  // Set current year in footer
  const yearEl = document.getElementById("current-year");
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }

  // --- 1. GLASS CARD SPOTLIGHT GLOW ---
  const cards = document.querySelectorAll(".philosophy-card, .testimonial-card");
  cards.forEach(card => {
    card.addEventListener("mousemove", e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty("--mouse-x", `${x}px`);
      card.style.setProperty("--mouse-y", `${y}px`);
    });
  });

  // --- 2. INTERACTIVE 3D HERO TILT ---
  const heroTiltCard = document.getElementById("hero-tilt-card");
  if (heroTiltCard) {
    heroTiltCard.addEventListener("mousemove", e => {
      const rect = heroTiltCard.getBoundingClientRect();
      const cardWidth = rect.width;
      const cardHeight = rect.height;
      const centerX = rect.left + cardWidth / 2;
      const centerY = rect.top + cardHeight / 2;
      const mouseX = e.clientX - centerX;
      const mouseY = e.clientY - centerY;
      
      // Calculate rotation angles (max 15 degrees tilt)
      const rotateX = -(mouseY / (cardHeight / 2)) * 15;
      const rotateY = (mouseX / (cardWidth / 2)) * 15;

      heroTiltCard.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    heroTiltCard.addEventListener("mouseleave", () => {
      heroTiltCard.style.transform = "rotateX(0deg) rotateY(0deg)";
      heroTiltCard.style.transition = "transform 0.5s ease";
    });

    heroTiltCard.addEventListener("mouseenter", () => {
      heroTiltCard.style.transition = "none";
    });
  }

  // --- 3. MOBILE MENU TOGGLE ---
  const mobileToggle = document.getElementById("mobile-toggle");
  const navMenu = document.getElementById("nav-menu");
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener("click", () => {
      const isOpen = navMenu.classList.toggle("open");
      if (isOpen) {
        mobileToggle.innerHTML = `<i data-lucide="x"></i>`;
      } else {
        mobileToggle.innerHTML = `<i data-lucide="menu"></i>`;
      }
      window.lucide.createIcons();
    });

    // Close mobile menu on clicking links
    const navLinks = navMenu.querySelectorAll(".nav-link");
    navLinks.forEach(link => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("open");
        mobileToggle.innerHTML = `<i data-lucide="menu"></i>`;
        window.lucide.createIcons();
      });
    });
  }

  // --- 4. 3D PAGE-TURNING NAVIGATION ENGINE ---
  const sections = Array.from(document.querySelectorAll("main.sections-container section"));
  let currentSectionIndex = 0;
  let isTransitioning = false;
  let lastWheelTime = 0;

  function updateActiveLink(targetHash) {
    document.querySelectorAll(".nav-link").forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("href") === targetHash) {
        link.classList.add("active");
      }
    });
  }

  function turnPageTo(index) {
    if (index < 0 || index >= sections.length || index === currentSectionIndex || isTransitioning) return;
    isTransitioning = true;

    const currentSection = sections[currentSectionIndex];
    const targetSection = sections[index];

    // Toggle background image visibility based on whether we are on Home page (index 0)
    const bgWrap = document.querySelector(".hero-bg-image-wrap");
    if (bgWrap) {
      if (index === 0) {
        bgWrap.style.opacity = "1";
      } else {
        bgWrap.style.opacity = "0";
      }
    }

    // Reset scroll of target section immediately
    targetSection.scrollTop = 0;

    // Distribute classes for the rotation flip direction
    sections.forEach((sec, idx) => {
      sec.classList.remove("active", "flipped-next", "flipped-prev");
      if (idx < index) {
        sec.classList.add("flipped-next");
      } else if (idx > index) {
        sec.classList.add("flipped-prev");
      }
    });

    targetSection.classList.add("active");
    currentSectionIndex = index;

    // Sync active nav links
    const sectionId = targetSection.getAttribute("id");
    updateActiveLink(`#${sectionId}`);

    // Wait for the transition time (900ms) to clear lock
    setTimeout(() => {
      isTransitioning = false;
    }, 900);
  }

  // Menu navigation links click handler
  document.querySelectorAll("header a[href^='#'], .logo, .hero-actions button").forEach(elem => {
    elem.addEventListener("click", e => {
      let targetHash = elem.getAttribute("href");
      // If triggered from button attributes or custom onclick
      if (!targetHash && elem.getAttribute("onclick")) {
        const match = elem.getAttribute("onclick").match(/#\w+/);
        if (match) targetHash = match[0];
      }
      if (!targetHash) return;

      const targetIndex = sections.findIndex(sec => `#${sec.getAttribute("id")}` === targetHash);
      if (targetIndex !== -1) {
        e.preventDefault();
        turnPageTo(targetIndex);
        history.pushState(null, null, targetHash);
      }
    });
  });

  // Browser Back/Forward buttons integration
  window.addEventListener("popstate", () => {
    const hash = window.location.hash || "#home";
    const idx = sections.findIndex(sec => `#${sec.getAttribute("id")}` === hash);
    if (idx !== -1 && idx !== currentSectionIndex) {
      turnPageTo(idx);
    }
  });

  // Detect if any lightbox, sub-gallery, or modal overlay is currently open
  function isModalOverlayActive() {
    const overlays = [
      document.getElementById("sub-gallery-overlay"),
      document.getElementById("image-lightbox"),
      document.getElementById("policy-modal"),
      document.getElementById("customizer-modal"),
      document.getElementById("reaction-modal")
    ];
    return overlays.some(overlay => overlay && overlay.classList.contains("open"));
  }

  // Mouse wheel scroll triggers page flip
  window.addEventListener("wheel", e => {
    if (isModalOverlayActive()) return;

    const now = Date.now();
    if (now - lastWheelTime < 1300) return; // cooldown to prevent quick skipping

    const activeSec = sections[currentSectionIndex];
    const isScrollable = activeSec.scrollHeight > activeSec.clientHeight;

    if (e.deltaY > 50) {
      // Scroll Down -> Flipping forward
      if (!isScrollable || (activeSec.scrollTop + activeSec.clientHeight >= activeSec.scrollHeight - 10)) {
        if (currentSectionIndex < sections.length - 1) {
          lastWheelTime = now;
          turnPageTo(currentSectionIndex + 1);
        }
      }
    } else if (e.deltaY < -50) {
      // Scroll Up -> Flipping backward
      if (!isScrollable || activeSec.scrollTop <= 10) {
        if (currentSectionIndex > 0) {
          lastWheelTime = now;
          turnPageTo(currentSectionIndex - 1);
        }
      }
    }
  }, { passive: true });

  // Swipe gesture support for mobile devices
  let touchStartY = 0;
  window.addEventListener("touchstart", e => {
    if (isModalOverlayActive()) return;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  window.addEventListener("touchend", e => {
    if (isModalOverlayActive()) return;
    const touchEndY = e.changedTouches[0].clientY;
    const deltaY = touchStartY - touchEndY;
    const activeSec = sections[currentSectionIndex];
    const isScrollable = activeSec.scrollHeight > activeSec.clientHeight;

    if (Math.abs(deltaY) < 60) return; // ignore minor swipe jitters

    if (deltaY > 0) {
      // Swiped Up -> Scroll Down
      if (!isScrollable || (activeSec.scrollTop + activeSec.clientHeight >= activeSec.scrollHeight - 10)) {
        if (currentSectionIndex < sections.length - 1) {
          turnPageTo(currentSectionIndex + 1);
        }
      }
    } else {
      // Swiped Down -> Scroll Up
      if (!isScrollable || activeSec.scrollTop <= 10) {
        if (currentSectionIndex > 0) {
          turnPageTo(currentSectionIndex - 1);
        }
      }
    }
  }, { passive: true });

  // --- 5. PORTFOLIO FILTERABLE GALLERY ---
  const filterButtons = document.querySelectorAll(".filter-btn");
  const galleryItems = document.querySelectorAll(".gallery-item");

  filterButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      filterButtons.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const filterVal = btn.getAttribute("data-filter");

      galleryItems.forEach(item => {
        const itemCategory = item.getAttribute("data-category");
        if (filterVal === "all" || itemCategory === filterVal) {
          item.style.display = "block";
        } else {
          item.style.display = "none";
        }
      });
    });
  });

  // --- 6. SUB-GALLERY WORKFLOW & DATA ---
  const subGalleryOverlay = document.getElementById("sub-gallery-overlay");
  const subGalleryClose = document.getElementById("sub-gallery-close");
  const subTitle = document.getElementById("sub-title");
  const subTag = document.getElementById("sub-tag");
  const subCoverImg = document.getElementById("sub-cover-img");
  const subGalleryGrid = document.getElementById("sub-gallery-grid");

  // Editorial Portfolio Mock Data with beautiful Unsplash pictures
  const sessionImages = {
    "aarav-aditi": {
      title: "Aarav & Aditi",
      category: "Wedding / Destination",
      cover: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800",
      images: [
        "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=800"
      ]
    },
    "aura-autumn": {
      title: "Aura Autumn Issue",
      category: "Fashion / Editorial",
      cover: "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=800",
      images: [
        "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&q=80&w=800"
      ]
    },
    "monochrome-shadows": {
      title: "Monochrome Shadows",
      category: "Portrait / Studio",
      cover: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800",
      images: [
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800"
      ]
    },
    "vikas-riya": {
      title: "Vikas & Riya",
      category: "Wedding / Ceremony",
      cover: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=800",
      images: [
        "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&q=80&w=800"
      ]
    },
    "neon-noir": {
      title: "Neon Noir Campaign",
      category: "Fashion / Vogue",
      cover: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=800",
      images: [
        "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&q=80&w=800"
      ]
    },
    "christening-jessica": {
      title: "Jessica Christening",
      category: "Baptism / Ceremony",
      cover: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800",
      images: [
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&q=80&w=800"
      ]
    },
    "haldi-ritual": {
      title: "Traditional Haldi",
      category: "Ceremony / Haldi",
      cover: "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=800",
      images: [
        "https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800"
      ]
    },
    "vogue-headshot": {
      title: "Bespoke Headshot",
      category: "Portrait / Vogue Editorial",
      cover: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800",
      images: [
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=800"
      ]
    }
  };

  let activeSessionImages = [];
  let currentSessionImgIndex = 0;

  document.querySelectorAll(".gallery-item").forEach(card => {
    card.addEventListener("click", () => {
      const sessionId = card.getAttribute("data-id");
      const session = sessionImages[sessionId];
      if (!session) return;

      subTitle.textContent = session.title;
      subTag.textContent = session.category;
      subCoverImg.src = session.cover;

      subGalleryGrid.innerHTML = "";
      activeSessionImages = session.images;

      session.images.forEach((imgUrl, index) => {
        const item = document.createElement("div");
        item.className = "sub-image-card";
        item.innerHTML = `<img src="${imgUrl}" alt="Session Image ${index + 1}" loading="lazy">`;
        item.addEventListener("click", (e) => {
          e.stopPropagation(); // prevent closing overlay
          currentSessionImgIndex = index;
          openLightbox(imgUrl);
        });
        subGalleryGrid.appendChild(item);
      });

      subGalleryOverlay.classList.add("open");
    });
  });

  if (subGalleryClose) {
    subGalleryClose.addEventListener("click", () => {
      subGalleryOverlay.classList.remove("open");
    });
  }

  // --- 7. FULLSCREEN LIGHTBOX MODAL ---
  const lightbox = document.getElementById("image-lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const lightboxClose = document.getElementById("lightbox-close");
  const lightboxPrev = document.getElementById("lightbox-prev");
  const lightboxNext = document.getElementById("lightbox-next");

  function openLightbox(src) {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = src;
    lightbox.classList.add("open");
  }

  function closeLightbox() {
    if (lightbox) {
      lightbox.classList.remove("open");
    }
  }

  function navigateLightbox(direction) {
    if (activeSessionImages.length === 0) return;
    currentSessionImgIndex = (currentSessionImgIndex + direction + activeSessionImages.length) % activeSessionImages.length;
    if (lightboxImg) {
      lightboxImg.src = activeSessionImages[currentSessionImgIndex];
    }
  }

  if (lightboxClose) {
    lightboxClose.addEventListener("click", closeLightbox);
  }

  if (lightboxPrev) {
    lightboxPrev.addEventListener("click", () => navigateLightbox(-1));
  }

  if (lightboxNext) {
    lightboxNext.addEventListener("click", () => navigateLightbox(1));
  }

  // Bind keyboard navigation for lightbox
  window.addEventListener("keydown", e => {
    if (lightbox && lightbox.classList.contains("open")) {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") navigateLightbox(-1);
      if (e.key === "ArrowRight") navigateLightbox(1);
    }
  });

  // Close lightbox on clicking backdrop
  if (lightbox) {
    lightbox.addEventListener("click", e => {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });
  }

  // --- 8. DYNAMIC CALCULATOR & BESPOKE CUSTOMIZER ---
  const customizerModal = document.getElementById("customizer-modal");
  const openCustomizerBtn = document.getElementById("open-customizer-btn");
  const closeCustomizerBtn = document.getElementById("customizer-close");
  const saveCustomizerBtn = document.getElementById("customizer-save-btn");

  const customizerState = {
    candidPhotographers: 2,
    traditionalPhotographers: 1,
    cinematographers: 1,
    traditionalVideographers: 0,
    albumsCount: 1,
    framesCount: 1,
    drone: false,
    ai: false,
    livestream: false,
    prewed: false,
    teaserReel: true,
    fullFilm: false,
    usbKeepsake: true,
    galleryAccess: true,
    editedPhotos: "100"
  };

  const defaultTemplates = {
    silver: {
      candidPhotographers: 1,
      traditionalPhotographers: 1,
      cinematographers: 0,
      traditionalVideographers: 0,
      albumsCount: 0,
      framesCount: 0,
      drone: false,
      ai: false,
      livestream: false,
      prewed: false,
      teaserReel: true,
      fullFilm: false,
      usbKeepsake: false,
      galleryAccess: true,
      editedPhotos: "30"
    },
    gold: {
      candidPhotographers: 2,
      traditionalPhotographers: 1,
      cinematographers: 1,
      traditionalVideographers: 0,
      albumsCount: 1,
      framesCount: 1,
      drone: false,
      ai: false,
      livestream: false,
      prewed: false,
      teaserReel: true,
      fullFilm: false,
      usbKeepsake: true,
      galleryAccess: true,
      editedPhotos: "100"
    },
    platinum: {
      candidPhotographers: 3,
      traditionalPhotographers: 1,
      cinematographers: 1,
      traditionalVideographers: 1,
      albumsCount: 2,
      framesCount: 1,
      drone: true,
      ai: true,
      livestream: false,
      prewed: false,
      teaserReel: true,
      fullFilm: true,
      usbKeepsake: true,
      galleryAccess: true,
      editedPhotos: "unlimited"
    }
  };

  function updateCustomizerUI() {
    // Sync counters
    const roles = ['candidPhotographers', 'traditionalPhotographers', 'cinematographers', 'traditionalVideographers'];
    roles.forEach(role => {
      const valEl = document.getElementById(`c-${role}`);
      if (valEl) valEl.textContent = customizerState[role];
    });

    const deliverables = ['albumsCount', 'framesCount'];
    deliverables.forEach(item => {
      const valEl = document.getElementById(`c-${item}`);
      if (valEl) valEl.textContent = customizerState[item];
    });

    // Sync checkboxes
    const addons = ['drone', 'ai', 'livestream', 'prewed', 'teaserReel', 'fullFilm', 'usbKeepsake', 'galleryAccess'];
    addons.forEach(addon => {
      const inputEl = document.getElementById(`add-${addon}`);
      const cardEl = document.getElementById(`card-add-${addon}`);
      if (inputEl) {
        inputEl.checked = customizerState[addon];
        if (cardEl) {
          if (customizerState[addon]) {
            cardEl.classList.add("active");
          } else {
            cardEl.classList.remove("active");
          }
        }
      }
    });

    // Sync select dropdown
    const photosDropdown = document.getElementById("c-photosLimit");
    if (photosDropdown) {
      photosDropdown.value = customizerState.editedPhotos;
    }

    // Render summary counts
    const crewTotal = customizerState.candidPhotographers + customizerState.traditionalPhotographers + customizerState.cinematographers + customizerState.traditionalVideographers;
    const crewTotalEl = document.getElementById("c-sum-crew");
    if (crewTotalEl) crewTotalEl.textContent = `${crewTotal} Crew Member${crewTotal !== 1 ? 's' : ''}`;

    const crewBreakdownEl = document.getElementById("c-sum-crew-breakdown");
    if (crewBreakdownEl) {
      crewBreakdownEl.innerHTML = "";
      const labels = {
        candidPhotographers: "Candid Photographer(s)",
        traditionalPhotographers: "Traditional Photographer(s)",
        cinematographers: "Cinematographer(s)",
        traditionalVideographers: "Traditional Videographer(s)"
      };
      for (const role in labels) {
        if (customizerState[role] > 0) {
          const li = document.createElement("li");
          li.textContent = `${customizerState[role]} x ${labels[role]}`;
          crewBreakdownEl.appendChild(li);
        }
      }
    }

    const delivListEl = document.getElementById("c-sum-deliv-list");
    if (delivListEl) {
      delivListEl.innerHTML = "";
      const liPhotos = document.createElement("li");
      liPhotos.textContent = `${customizerState.editedPhotos === "unlimited" ? "Unlimited" : customizerState.editedPhotos} Retouched Digital Negatives`;
      delivListEl.appendChild(liPhotos);

      if (customizerState.albumsCount > 0) {
        const li = document.createElement("li");
        li.textContent = `${customizerState.albumsCount} x Flush-Mount Heirloom Album(s)`;
        delivListEl.appendChild(li);
      }
      if (customizerState.framesCount > 0) {
        const li = document.createElement("li");
        li.textContent = `${customizerState.framesCount} x Archival Wood Photo Frame(s)`;
        delivListEl.appendChild(li);
      }

      const items = {
        teaserReel: "3-Min Cinematic Teaser Reel",
        fullFilm: "Full documentary cut (2 hours)",
        usbKeepsake: "Engraved wooden USB keepsake box",
        galleryAccess: "3-Year Cloud Gallery Access"
      };
      for (const item in items) {
        if (customizerState[item]) {
          const li = document.createElement("li");
          li.textContent = items[item];
          delivListEl.appendChild(li);
        }
      }
    }

    const addonsListEl = document.getElementById("c-sum-addons-list");
    if (addonsListEl) {
      addonsListEl.innerHTML = "";
      const addLabels = {
        drone: "Aerial Drone Cinematography",
        ai: "AI Instant QR Sharing System",
        livestream: "Private Live Stream Broadcast Feed",
        prewed: "Pre-Wedding Creative Concept Session"
      };
      let hasAddons = false;
      for (const addon in addLabels) {
        if (customizerState[addon]) {
          const li = document.createElement("li");
          li.textContent = addLabels[addon];
          addonsListEl.appendChild(li);
          hasAddons = true;
        }
      }
      if (!hasAddons) {
        addonsListEl.innerHTML = "<li>No premium add-ons enabled</li>";
      }
    }
  }

  window.adjustCustomizerCrew = function(role, amount) {
    customizerState[role] = Math.max(0, Math.min(10, customizerState[role] + amount));
    updateCustomizerUI();
  };

  window.adjustCustomizerDeliverable = function(item, amount) {
    customizerState[item] = Math.max(0, Math.min(5, customizerState[item] + amount));
    updateCustomizerUI();
  };

  window.toggleCustomizerAddon = function(addon) {
    const inputEl = document.getElementById(`add-${addon}`);
    if (inputEl) {
      customizerState[addon] = inputEl.checked;
    }
    updateCustomizerUI();
  };

  window.updateCustomizerPhotosLimit = function() {
    const photosDropdown = document.getElementById("c-photosLimit");
    if (photosDropdown) {
      customizerState.editedPhotos = photosDropdown.value;
    }
    updateCustomizerUI();
  };

  // Sync state back to main booking form display panel
  function applyCustomizerToBooking() {
    const bookingService = document.getElementById("booking-service");
    if (bookingService) {
      // Determine if the customizer state matches a standard template
      let matchedTier = "custom";
      for (const tier in defaultTemplates) {
        const template = defaultTemplates[tier];
        let isMatch = true;
        for (const key in template) {
          if (customizerState[key] !== template[key]) {
            isMatch = false;
            break;
          }
        }
        if (isMatch) {
          matchedTier = tier;
          break;
        }
      }
      bookingService.value = matchedTier;
    }
    syncSummaryDisplayCard();
    if (customizerModal) {
      customizerModal.classList.remove("open");
    }

    // Scroll smoothly to booking container
    const targetIdx = sections.findIndex(sec => sec.getAttribute("id") === "booking");
    if (targetIdx !== -1) {
      turnPageTo(targetIdx);
      window.location.hash = "#booking";
    }
  }

  function syncSummaryDisplayCard() {
    const placeholder = document.getElementById("summary-container-placeholder");
    const details = document.getElementById("summary-container-details");
    const tierName = document.getElementById("sum-tier-name");
    const crewList = document.getElementById("sum-crew-list");
    const delivList = document.getElementById("sum-deliv-list");
    const addonsList = document.getElementById("sum-addons-list");
    const addonsRow = document.getElementById("sum-addons-row");
    const serviceVal = document.getElementById("booking-service").value;

    if (serviceVal === "") {
      placeholder.style.display = "block";
      details.style.display = "none";
      return;
    }

    placeholder.style.display = "none";
    details.style.display = "block";

    // Set Curation Tier Label
    const tierLabels = {
      silver: "Silver Package (Essential)",
      gold: "Gold Package (Recommended)",
      platinum: "Platinum Package (Luxury)",
      custom: "Custom Bespoke Configuration"
    };
    tierName.textContent = tierLabels[serviceVal] || "Custom Package";

    // Render Crew
    crewList.innerHTML = "";
    const crewLabels = {
      candidPhotographers: "Candid Photographer(s)",
      traditionalPhotographers: "Traditional Photographer(s)",
      cinematographers: "Cinematographer(s)",
      traditionalVideographers: "Traditional Videographer(s)"
    };
    let crewCount = 0;
    for (const key in crewLabels) {
      const count = customizerState[key];
      if (count > 0) {
        const li = document.createElement("li");
        li.textContent = `${count} x ${crewLabels[key]}`;
        crewList.appendChild(li);
        crewCount++;
      }
    }
    if (crewCount === 0) {
      crewList.innerHTML = "<li>Default crew assignments</li>";
    }

    // Render Deliverables
    delivList.innerHTML = "";
    const liPhotos = document.createElement("li");
    liPhotos.textContent = `${customizerState.editedPhotos === "unlimited" ? "Unlimited" : customizerState.editedPhotos} Retouched Photos`;
    delivList.appendChild(liPhotos);

    if (customizerState.albumsCount > 0) {
      const li = document.createElement("li");
      li.textContent = `${customizerState.albumsCount} Printed Heirloom Album(s)`;
      delivList.appendChild(li);
    }
    if (customizerState.framesCount > 0) {
      const li = document.createElement("li");
      li.textContent = `${customizerState.framesCount} Printed Photo Frame(s)`;
      delivList.appendChild(li);
    }

    const delivItems = {
      teaserReel: "3-Min Cinematic Teaser Reel",
      fullFilm: "Full documentary film edit",
      usbKeepsake: "Engraved wooden USB keepsake box",
      galleryAccess: "3-Year Online Cloud Portal"
    };
    for (const key in delivItems) {
      if (customizerState[key]) {
        const li = document.createElement("li");
        li.textContent = delivItems[key];
        delivList.appendChild(li);
      }
    }

    // Render Add-ons
    addonsList.innerHTML = "";
    const addLabels = {
      drone: "Aerial Drone Cinematography",
      ai: "AI Instant QR Sharing Portal",
      livestream: "Private Event Live Stream Broadcast",
      prewed: "Pre-Wedding Concept Film Shoot"
    };
    let addonsCount = 0;
    for (const key in addLabels) {
      if (customizerState[key]) {
        const li = document.createElement("li");
        li.textContent = addLabels[key];
        addonsList.appendChild(li);
        addonsCount++;
      }
    }
    if (addonsCount > 0) {
      addonsRow.style.display = "block";
    } else {
      addonsRow.style.display = "none";
    }
  }

  // Selection trigger from tailored package grid
  window.selectPackageAndGo = function(tier) {
    const template = defaultTemplates[tier];
    if (!template) return;

    for (const key in template) {
      customizerState[key] = template[key];
    }

    const serviceDropdown = document.getElementById("booking-service");
    if (serviceDropdown) {
      serviceDropdown.value = tier;
    }

    updateCustomizerUI();
    syncSummaryDisplayCard();

    // Open the customizer modal to give client option to customize pre-loaded settings
    if (customizerModal) {
      customizerModal.classList.add("open");
    }
  };

  // Sync Dropdown change on booking service dropdown to template configs
  const serviceDropdown = document.getElementById("booking-service");
  if (serviceDropdown) {
    serviceDropdown.addEventListener("change", () => {
      const selected = serviceDropdown.value;
      if (selected !== "custom") {
        const template = defaultTemplates[selected];
        if (template) {
          for (const key in template) {
            customizerState[key] = template[key];
          }
        }
      }
      updateCustomizerUI();
      syncSummaryDisplayCard();
    });
  }

  // Sync Dropdown change on booking event category to price tabs selector
  const bookingEventSelect = document.getElementById("booking-event");
  if (bookingEventSelect) {
    bookingEventSelect.addEventListener("change", () => {
      const eventKey = bookingEventSelect.value;
      const tabToActivate = document.querySelector(`.pack-tab-btn[data-event="${eventKey}"]`);
      if (tabToActivate) {
        document.querySelectorAll(".pack-tab-btn").forEach(btn => btn.classList.remove("active"));
        tabToActivate.classList.add("active");
        togglePricingLayout(eventKey);
      }
    });
  }

  // Sync Pricing Layout for Non-Wedding items
  const priceTabBtns = document.querySelectorAll(".pack-tab-btn");
  priceTabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const eventKey = btn.getAttribute("data-event");

      if (eventKey === "other") {
        // Redirect immediately to WhatsApp with specific message
        const waUrl = "https://wa.me/919446802570?text=" + encodeURIComponent("Hi DoubleLayer Photography, I would like to know the other customizable events and packages available for me. Please share the details.");
        window.open(waUrl, "_blank");
        return;
      }

      priceTabBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      const bookingEvent = document.getElementById("booking-event");
      if (bookingEvent) {
        bookingEvent.value = eventKey;
      }

      togglePricingLayout(eventKey);
    });
  });

  // Toggle layout details for other event types (e.g. Wedding packages vs Baptism templates)
  function togglePricingLayout(eventKey) {
    const packagesCardsGrid = document.getElementById("packages-cards-grid");
    const calculatorBanner = document.getElementById("wedding-calculator-banner");
    const unifiedCard = document.getElementById("unified-package-card");

    if (eventKey === "wedding") {
      if (packagesCardsGrid) packagesCardsGrid.style.display = "grid";
      if (calculatorBanner) calculatorBanner.style.display = "flex";
      if (unifiedCard) unifiedCard.style.display = "none";
    } else {
      if (packagesCardsGrid) packagesCardsGrid.style.display = "none";
      if (calculatorBanner) calculatorBanner.style.display = "none";
      if (unifiedCard) {
        unifiedCard.style.display = "block";
        
        // Reset unified checkboxes to unchecked state initially
        const checkboxes = unifiedCard.querySelectorAll("input[type='checkbox']");
        checkboxes.forEach(cb => {
          cb.checked = false;
          const label = cb.closest(".unified-addon-item");
          if (label) label.classList.remove("active");
        });
        
        // Load default state as baseline (like the gold package default)
        const goldTemplate = defaultTemplates.gold;
        for (const key in goldTemplate) {
          customizerState[key] = goldTemplate[key];
        }
        customizerState.drone = false;
        customizerState.ai = false;
        customizerState.livestream = false;
        customizerState.prewed = false;
        customizerState.albumsCount = 1;
        customizerState.framesCount = 1;

        // Set the unified package name based on the event key
        const packageNameEl = document.getElementById("unified-package-name");
        if (packageNameEl) {
          const names = {
            baptism: "Standard Baptism Package",
            fixation: "Standard Fixation Ceremony Package",
            bridetobe: "Standard Bride-to-be Package",
            coupletobe: "Standard Couple-to-be Package",
            groomtobe: "Standard Groom-to-be Package"
          };
          packageNameEl.textContent = names[eventKey] || "Standard Event Package";
        }
        
        // Sync customizer UI and booking summary
        updateCustomizerUI();
        syncSummaryDisplayCard();
      }
    }
  }

  // Customizer modal buttons
  if (openCustomizerBtn) {
    openCustomizerBtn.addEventListener("click", () => {
      if (customizerModal) {
        customizerModal.classList.add("open");
        updateCustomizerUI();
      }
    });
  }

  if (closeCustomizerBtn) {
    closeCustomizerBtn.addEventListener("click", () => {
      customizerModal.classList.remove("open");
    });
  }

  if (saveCustomizerBtn) {
    saveCustomizerBtn.addEventListener("click", applyCustomizerToBooking);
  }

  if (customizerModal) {
    customizerModal.addEventListener("click", e => {
      if (e.target === customizerModal) {
        customizerModal.classList.remove("open");
      }
    });
  }

  // --- 9. INTERACTIVE DATE RESERVATION CALENDAR ---
  let calDate = new Date();
  calDate.setDate(1); // Set to first day of month
  let selectedDateStr = "";

  const calDaysGrid = document.getElementById("cal-days-grid");
  const calMonthYearLabel = document.getElementById("cal-month-year");
  const calPrevBtn = document.getElementById("cal-prev");
  const calNextBtn = document.getElementById("cal-next");
  const selectedDateInput = document.getElementById("selected-booking-date");
  const calWrapper = document.getElementById("calendar-wrapper");

  function renderCalendar() {
    if (!calDaysGrid || !calMonthYearLabel) return;

    calDaysGrid.innerHTML = "";

    const year = calDate.getFullYear();
    const month = calDate.getMonth();

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    calMonthYearLabel.textContent = `${monthNames[month]} ${year}`;

    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    // Disable prev button if looking at current month or earlier
    const today = new Date();
    if (year < today.getFullYear() || (year === today.getFullYear() && month <= today.getMonth())) {
      if (calPrevBtn) calPrevBtn.disabled = true;
    } else {
      if (calPrevBtn) calPrevBtn.disabled = false;
    }

    // Empty cells
    for (let i = 0; i < firstDayIndex; i++) {
      const cell = document.createElement("div");
      cell.className = "cal-day empty";
      calDaysGrid.appendChild(cell);
    }

    // Days cells
    for (let d = 1; d <= totalDays; d++) {
      const cell = document.createElement("div");
      cell.className = "cal-day";
      cell.textContent = d;

      const dateCompare = new Date(year, month, d);
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

      const todayCompare = new Date();
      todayCompare.setHours(0, 0, 0, 0);

      if (dateCompare < todayCompare) {
        cell.classList.add("past");
      } else {
        cell.classList.add("available");

        if (selectedDateStr === dateString) {
          cell.classList.add("selected");
        }

        if (year === today.getFullYear() && month === today.getMonth() && d === today.getDate()) {
          cell.classList.add("today");
        }

        cell.addEventListener("click", () => {
          const prevSelected = calDaysGrid.querySelector(".cal-day.selected");
          if (prevSelected) prevSelected.classList.remove("selected");

          cell.classList.add("selected");
          selectedDateStr = dateString;
          if (selectedDateInput) {
            selectedDateInput.value = dateString;
          }
          if (calWrapper) {
            calWrapper.classList.remove("invalid-glow");
          }
        });
      }
      calDaysGrid.appendChild(cell);
    }
  }

  if (calPrevBtn) {
    calPrevBtn.addEventListener("click", () => {
      calDate.setMonth(calDate.getMonth() - 1);
      renderCalendar();
    });
  }

  if (calNextBtn) {
    calNextBtn.addEventListener("click", () => {
      calDate.setMonth(calDate.getMonth() + 1);
      renderCalendar();
    });
  }

  renderCalendar();

  // --- 10. FORM SUBMISSION WITH WHATSAPP COMPILER ---
  const bookingForm = document.getElementById("booking-form");
  const bookingCardPanel = document.querySelector(".booking-card-panel");

  if (bookingForm && bookingCardPanel) {
    bookingForm.addEventListener("submit", e => {
      e.preventDefault();

      const name = document.getElementById("booking-name").value.trim();
      const phone = document.getElementById("booking-phone").value.trim();
      const email = document.getElementById("booking-email").value.trim();
      const location = document.getElementById("booking-location").value.trim() || "Not specified";
      const eventSelector = document.getElementById("booking-event");
      const eventText = eventSelector.options[eventSelector.selectedIndex].text;
      const serviceSelector = document.getElementById("booking-service");
      const serviceText = serviceSelector.options[serviceSelector.selectedIndex].text;
      const dateVal = selectedDateInput ? selectedDateInput.value : "";
      const brief = document.getElementById("booking-brief").value || "No description provided";

      // Validate required fields: name, phone, email, and date
      if (!name || !phone || !email || !dateVal) {
        if (!dateVal && calWrapper) {
          calWrapper.classList.add("invalid-glow");
          calWrapper.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      // Format date
      const dateParts = dateVal.split("-");
      const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
      const formattedDate = `${months[parseInt(dateParts[1]) - 1]} ${parseInt(dateParts[2])}, ${dateParts[0]}`;

      // Assemble Package Customizer config values into message
      let packageConfig = `Service Tier: ${serviceText}\n`;
      packageConfig += `Crew Details:\n`;
      const labels = {
        candidPhotographers: "Candid Photographer(s)",
        traditionalPhotographers: "Traditional Photographer(s)",
        cinematographers: "Cinematographer(s)",
        traditionalVideographers: "Traditional Videographer(s)"
      };
      let crewCount = 0;
      for (const key in labels) {
        const count = customizerState[key];
        if (count > 0) {
          packageConfig += `- ${count} ${labels[key]}\n`;
          crewCount++;
        }
      }
      if (crewCount === 0) packageConfig += "- Default crew selection\n";

      packageConfig += `\nDeliverables:\n`;
      packageConfig += `- Photos: ${customizerState.editedPhotos === 'unlimited' ? 'Unlimited' : customizerState.editedPhotos} Retouched Images\n`;
      if (customizerState.albumsCount > 0) {
        packageConfig += `- Print Albums: ${customizerState.albumsCount} book(s)\n`;
      }
      if (customizerState.framesCount > 0) {
        packageConfig += `- Photo Frames: ${customizerState.framesCount} frame(s)\n`;
      }
      
      const items = {
        teaserReel: "3-Min Teaser Reel",
        fullFilm: "Full Documentary cut edit",
        usbKeepsake: "Engraved wooden USB keepsake box",
        galleryAccess: "3-Year Cloud Gallery Access"
      };
      for (const key in items) {
        if (customizerState[key]) {
          packageConfig += `- ${items[key]}\n`;
        }
      }

      packageConfig += `\nPremium Add-ons:\n`;
      const addons = {
        drone: "Aerial Drone Cinematography",
        ai: "AI Instant QR Sharing System",
        livestream: "Private Live Stream Broadcast",
        prewed: "Pre-Wedding Session Shoot"
      };
      let addonCount = 0;
      for (const key in addons) {
        if (customizerState[key]) {
          packageConfig += `- ${addons[key]}\n`;
          addonCount++;
        }
      }
      if (addonCount === 0) packageConfig += "- None\n";

      // Parse and format dates for Google Calendar template URL (YYYYMMDD/YYYYMMDD)
      let datesParam = "";
      try {
        const startStr = dateVal.replace(/-/g, ""); // e.g. "20260625"
        const startDateObj = new Date(dateVal);
        const endDateObj = new Date(startDateObj);
        endDateObj.setDate(startDateObj.getDate() + 1);
        
        const endYear = endDateObj.getFullYear();
        const endMonth = String(endDateObj.getMonth() + 1).padStart(2, '0');
        const endDay = String(endDateObj.getDate()).padStart(2, '0');
        const endStr = `${endYear}${endMonth}${endDay}`;
        datesParam = `${startStr}/${endStr}`;
      } catch (err) {
        datesParam = "";
      }
      
      let gCalUrl = "";
      if (datesParam) {
        const gCalTitle = `DoubleLayer: ${eventText} - ${name}`;
        const gCalDetails = `Client Name: ${name}\nPhone: ${phone}\nEmail: ${email}\nCuration: ${serviceText}\nBrief: ${brief}\n\nGenerated by DoubleLayer Booking Engine.`;
        const gCalLocation = location;
        gCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(gCalTitle)}&dates=${datesParam}&details=${encodeURIComponent(gCalDetails)}&location=${encodeURIComponent(gCalLocation)}`;
      }

      // Build WhatsApp message
      let waText = `Doublelayer Photography Booking Request!\n`;
      waText += `========================================\n`;
      waText += `Client Name: ${name}\n`;
      waText += `Mobile Number: ${phone}\n`;
      waText += `Email: ${email}\n`;
      waText += `Event Venue: ${location}\n`;
      waText += `Event Type: ${eventText}\n`;
      waText += `Selected Date: ${formattedDate}\n`;
      waText += `========================================\n\n`;
      waText += `[PACKAGE CONFIGURATION]\n${packageConfig}\n`;
      waText += `========================================\n\n`;
      waText += `Creative Brief / Vision:\n${brief}`;
      if (gCalUrl) {
        waText += `\n\n========================================\n`;
        waText += `📅 [ADMIN ONLY - ADD TO CALENDAR]\n${gCalUrl}`;
      }

      const waUrl = "https://wa.me/919446802570?text=" + encodeURIComponent(waText);

      // Render success message inside the form panel
      bookingCardPanel.innerHTML = `
        <div class="success-screen">
          <div class="success-icon"><i data-lucide="check"></i></div>
          <h3 class="text-gradient">Request Compiled</h3>
          <p style="margin-bottom: 25px;">
            Thank you, <span style="color:#fff; font-weight:600;">${name}</span>. We've compiled your customized visual request for the <strong style="color:var(--gold-accent);">${eventText}</strong> on <strong>${formattedDate}</strong>.
          </p>
          <a href="${waUrl}" target="_blank" class="btn btn-primary" style="display:inline-flex; align-items:center; gap:8px; text-decoration:none;">
            <i data-lucide="message-square"></i>
            Open WhatsApp & Send
          </a>
          <p style="font-size: 11px; color: var(--text-muted); margin-top: 15px;">
            If the chat didn't open automatically, click the button above to send.
          </p>
        </div>
      `;
      if (window.lucide) window.lucide.createIcons();

      // Auto redirect after 1.5 seconds
      setTimeout(() => {
        window.open(waUrl, "_blank");
      }, 1500);
    });
  }

  // --- 10b. CONTACT FORM SUBMISSION WITH WHATSAPP COMPILER ---
  const simpleContactForm = document.getElementById("simple-contact-form");
  const contactFormPanel = document.getElementById("contact-form-panel");

  if (simpleContactForm && contactFormPanel) {
    simpleContactForm.addEventListener("submit", e => {
      e.preventDefault();

      const name = document.getElementById("contact-name").value.trim();
      const email = document.getElementById("contact-email").value.trim();
      const msg = document.getElementById("contact-msg").value.trim();

      // Compile message for WhatsApp
      let waText = `✨ DOUBLELAYER INQUIRY ✨\n\n`;
      waText += `Name: ${name}\n`;
      waText += `Email: ${email}\n\n`;
      waText += `Message:\n${msg}`;

      const waUrl = "https://wa.me/919446802570?text=" + encodeURIComponent(waText);

      // Render success message inside the contact form panel
      contactFormPanel.innerHTML = `
        <div class="success-screen" style="text-align: center; padding: 20px 10px;">
          <div class="success-icon" style="background: rgba(207, 168, 83, 0.1); color: var(--gold-accent); width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; font-size: 24px;">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check" style="width:28px; height:28px;"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h3 class="text-gradient" style="font-size: 22px; margin-bottom: 10px; font-family: 'ADAM.CG PRO', sans-serif;">Message Compiled</h3>
          <p style="color: var(--text-muted); font-size: 13.5px; margin-bottom: 20px; line-height: 1.6;">
            Thank you, <span style="color:#fff; font-weight:600;">${name}</span>. We've compiled your inquiry and are redirecting you to WhatsApp to connect with us.
          </p>
          <a href="${waUrl}" target="_blank" class="btn btn-primary" style="display:inline-flex; align-items:center; gap:8px; text-decoration:none; padding: 10px 20px;">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-square" style="width:16px; height:16px;"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            Open WhatsApp & Send
          </a>
        </div>
      `;

      // Auto redirect after 1.5 seconds
      setTimeout(() => {
        window.open(waUrl, "_blank");
      }, 1500);
    });
  }

  // --- 11. LEGAL POLICIES POPUPS ---
  const policyModal = document.getElementById("policy-modal");
  const policyTitle = document.getElementById("policy-title");
  const policyBody = document.getElementById("policy-body");
  const policyClose = document.getElementById("policy-modal-close");

  const policyContent = {
    terms: {
      title: "Terms & Conditions",
      body: `
        <h4>1. Client Consultation & Adjustments</h4>
        <p>Regarding your dreams, concepts, doubts, queries and any adjustments in the package, let's talk it over.</p>
        <h4>2. Selection Timeline & Delivery Schedule</h4>
        <p>We will not be able to keep to the timeline of the output if the photo selection takes more than 30 days. We expect to receive the sorting within one month of the function to be able to stick to this delivery period.</p>
        <h4>3. Album Layout & Image Charges</h4>
        <p>Extra sheets in the album, if required, would be charged at ₹800 per sheet. Extra edited images will be charged at ₹150 per image.</p>
      `
    }
  };

  function openPolicy(type) {
    const data = policyContent[type];
    if (!data || !policyModal) return;

    policyTitle.textContent = data.title;
    policyBody.innerHTML = data.body;
    policyModal.classList.add("open");
  }

  if (policyClose) {
    policyClose.addEventListener("click", () => {
      policyModal.classList.remove("open");
    });
  }

  if (policyModal) {
    policyModal.addEventListener("click", e => {
      if (e.target === policyModal) {
        policyModal.classList.remove("open");
      }
    });
  }

  const triggerTerms = document.getElementById("trigger-terms");

  if (triggerTerms) {
    triggerTerms.addEventListener("click", () => openPolicy("terms"));
  }

  // --- 12. UNIFIED CARD OPTIONS FOR NON-WEDDING EVENTS ---
  window.toggleUnifiedAddon = function(addonKey) {
    const cb = document.getElementById(`unified-addon-${addonKey === 'extraAlbum' ? 'extra-album' : addonKey === 'extraFrame' ? 'extra-frame' : addonKey}`);
    const label = document.getElementById(`unified-addon-card-${addonKey === 'extraAlbum' ? 'extra-album' : addonKey === 'extraFrame' ? 'extra-frame' : addonKey}`);
    
    if (cb) {
      const isChecked = cb.checked;
      
      // Update customizerState based on selected add-on
      if (addonKey === "extraAlbum") {
        customizerState.albumsCount = isChecked ? 2 : 1;
      } else if (addonKey === "extraFrame") {
        customizerState.framesCount = isChecked ? 2 : 1;
      } else {
        customizerState[addonKey] = isChecked;
      }
      
      // Toggle visual border highlight class
      if (label) {
        if (isChecked) {
          label.classList.add("active");
        } else {
          label.classList.remove("active");
        }
      }
      
      // Update customizer UI and sync with summary
      updateCustomizerUI();
      syncSummaryDisplayCard();
    }
  };

  window.finalizeUnifiedBooking = function() {
    // Set drop down choice to selected template service option
    const select = document.getElementById("booking-service");
    if (select) {
      select.value = "custom"; // set to custom package
    }

    // Update the event type dropdown
    const eventSelect = document.getElementById("booking-event");
    if (eventSelect) {
      // Find currently active event tab
      const activeTab = document.querySelector(".pack-tab-btn.active");
      if (activeTab) {
        eventSelect.value = activeTab.getAttribute("data-event");
      }
    }

    // Update the visual summary card on the left
    syncSummaryDisplayCard();

    // Scroll smoothly to booking container
    const targetIdx = sections.findIndex(sec => sec.getAttribute("id") === "booking");
    if (targetIdx !== -1) {
      turnPageTo(targetIdx);
      window.location.hash = "#booking";
    }
  };

  // --- 13. INTRO SPLASH VIDEO OVERLAY SYSTEM ---
  const introOverlay = document.getElementById("intro-video-overlay");
  const introVideo = document.getElementById("intro-video");
  const introSkipBtn = document.getElementById("intro-skip-btn");
  const introMuteBtn = document.getElementById("intro-mute-btn");
  const logoTrigger = document.getElementById("logo-trigger");

  if (introOverlay && introVideo) {
    let introTimer;
    let introDismissed = false;

    function playIntro() {
      introDismissed = false;
      introOverlay.style.display = "flex";
      introOverlay.classList.remove("fade-out");
      
      // Play muted initially to ensure browser autoplay policies allow it
      introVideo.muted = true;
      if (introMuteBtn) {
        introMuteBtn.innerHTML = `<i data-lucide="volume-x"></i>`;
      }
      if (window.lucide) {
        window.lucide.createIcons();
      }

      introVideo.currentTime = 0;
      document.body.style.overflow = "hidden";

      const playPromise = introVideo.play();
      if (playPromise !== undefined) {
        playPromise.catch(error => {
          // Play muted on interaction if autoplay fails
          const startOnInteraction = () => {
            introVideo.muted = true;
            introVideo.play().catch(() => {});
            document.removeEventListener("click", startOnInteraction);
            document.removeEventListener("touchstart", startOnInteraction);
          };
          document.addEventListener("click", startOnInteraction);
          document.addEventListener("touchstart", startOnInteraction);
        });
      }

      // Automatically dismiss the overlay after exactly 10 seconds
      clearTimeout(introTimer);
      introTimer = setTimeout(dismissIntro, 10000);
    }

    function dismissIntro() {
      if (introDismissed) return;
      introDismissed = true;

      try {
        introVideo.pause();
      } catch (err) {
        // Safe catch
      }

      introOverlay.classList.add("fade-out");

      setTimeout(() => {
        introOverlay.style.display = "none";
        
        // Restore page scrolling if no other modal is open
        if (!isModalOverlayActive()) {
          document.body.style.overflow = "";
        }
      }, 800); // sync with CSS fade transition time
    }

    // Dismiss earlier if the video naturally reaches its end
    introVideo.addEventListener("ended", () => {
      clearTimeout(introTimer);
      dismissIntro();
    });

    // Dismiss immediately if the user clicks the skip button
    if (introSkipBtn) {
      introSkipBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        clearTimeout(introTimer);
        dismissIntro();
      });
    }

    // Toggle mute/unmute audio state
    if (introMuteBtn) {
      introMuteBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        introVideo.muted = !introVideo.muted;
        if (introVideo.muted) {
          introMuteBtn.innerHTML = `<i data-lucide="volume-x"></i>`;
        } else {
          introMuteBtn.innerHTML = `<i data-lucide="volume-2"></i>`;
        }
        if (window.lucide) {
          window.lucide.createIcons();
        }
      });
    }

    // Dismiss immediately if the user clicks/taps anywhere on the screen overlay/video
    introOverlay.addEventListener("click", (e) => {
      if (e.target.closest("#intro-mute-btn") || e.target.closest("#intro-skip-btn")) return;
      clearTimeout(introTimer);
      dismissIntro();
    });

    // Bind logo clicks to navigate to home and replay the intro video
    if (logoTrigger) {
      logoTrigger.addEventListener("click", (e) => {
        e.preventDefault();
        
        // Transition to home section (index 0)
        turnPageTo(0);
        history.pushState(null, null, "#home");
        
        // Re-play the intro
        playIntro();
      });
    }

    // Launch the video intro splash on initial website load
    playIntro();
  }

  // --- 14. CLIENT REACTIONS (TESTIMONIALS) USER ENGINE ---
  const reactionModal = document.getElementById("reaction-modal");
  const openReactionBtn = document.getElementById("open-reaction-btn");
  const closeReactionBtn = document.getElementById("reaction-modal-close");
  const reactionForm = document.getElementById("reaction-form");
  const testimonialsGrid = document.getElementById("testimonials-grid");
  const ratingStarsSelection = document.getElementById("rating-stars-selection");
  const selectedRatingInput = document.getElementById("selected-rating-value");

  // Inline reaction form elements
  const inlineReactionForm = document.getElementById("inline-reaction-form");
  const inlineRatingStars = document.getElementById("inline-rating-stars");
  const inlineSelectedRating = document.getElementById("inline-selected-rating");
  const inlineReactionCard = document.getElementById("inline-reaction-card");

  // Handle opening reaction modal OR scrolling to inline reaction card
  if (openReactionBtn) {
    openReactionBtn.addEventListener("click", () => {
      if (inlineReactionCard) {
        // Scroll to the inline reaction form
        inlineReactionCard.scrollIntoView({ behavior: "smooth", block: "center" });
        // Add a gold border flash effect
        inlineReactionCard.classList.add("highlight-flash");
        setTimeout(() => {
          inlineReactionCard.classList.remove("highlight-flash");
        }, 2000);
        
        // Focus the name input
        const nameInput = document.getElementById("inline-reaction-name");
        if (nameInput) nameInput.focus();
      } else if (reactionModal) {
        // Fallback to modal if card not found
        reactionModal.classList.add("open");
        document.body.style.overflow = "hidden";
        
        // Reset stars to 5-star active state on open
        if (ratingStarsSelection && selectedRatingInput) {
          selectedRatingInput.value = "5";
          const stars = ratingStarsSelection.querySelectorAll(".rating-star");
          stars.forEach(star => {
            star.classList.add("active");
            star.style.color = "var(--gold-accent)";
            star.style.fill = "var(--gold-accent)";
          });
        }
      }
    });
  }

  // Handle closing reaction modal
  function closeReactionFormModal() {
    if (reactionModal) {
      reactionModal.classList.remove("open");
      if (!isModalOverlayActive()) {
        document.body.style.overflow = "";
      }
    }
  }

  if (closeReactionBtn) {
    closeReactionBtn.addEventListener("click", closeReactionFormModal);
  }

  if (reactionModal) {
    reactionModal.addEventListener("click", e => {
      if (e.target === reactionModal) {
        closeReactionFormModal();
      }
    });
  }

  // Star rating input hover/click handling (Modal)
  if (ratingStarsSelection && selectedRatingInput) {
    const stars = Array.from(ratingStarsSelection.querySelectorAll(".rating-star"));
    
    stars.forEach((star, idx) => {
      star.addEventListener("click", () => {
        const ratingValue = idx + 1;
        selectedRatingInput.value = ratingValue;
        
        // Highlight active stars
        stars.forEach((s, sIdx) => {
          if (sIdx < ratingValue) {
            s.classList.add("active");
            s.style.color = "var(--gold-accent)";
            s.style.fill = "var(--gold-accent)";
          } else {
            s.classList.remove("active");
            s.style.color = "";
            s.style.fill = "";
          }
        });
      });
    });
  }

  // Star rating input handling (Inline Form)
  if (inlineRatingStars && inlineSelectedRating) {
    const stars = Array.from(inlineRatingStars.querySelectorAll(".inline-rating-star"));
    
    stars.forEach((star, idx) => {
      star.addEventListener("click", () => {
        const ratingValue = idx + 1;
        inlineSelectedRating.value = ratingValue;
        
        // Highlight active stars
        stars.forEach((s, sIdx) => {
          if (sIdx < ratingValue) {
            s.classList.add("active");
            s.style.color = "var(--gold-accent)";
            s.style.fill = "var(--gold-accent)";
          } else {
            s.classList.remove("active");
            s.style.color = "";
            s.style.fill = "";
          }
        });
      });
    });
  }

  // Helper to prepend new review to testimonials grid
  function appendReviewToGrid(name, role, text, rating, persist = true) {
    if (!testimonialsGrid) return;
    
    // Compile Star Rating HTML dynamically with golden fill
    let starsHTML = "";
    for (let i = 1; i <= 5; i++) {
      const goldStyle = i <= rating
        ? ` style="color: #d4af37; fill: #d4af37;"`
        : ` style="color: rgba(255,255,255,0.15); fill: none;"`;
      starsHTML += `<i data-lucide="star" class="${i <= rating ? 'star-fill' : ''}"${goldStyle}></i>`;
    }

    // Create new testimonial card node
    const card = document.createElement("div");
    card.className = "glass-card testimonial-card new-testimonial-glow";
    card.innerHTML = `
      <button class="delete-reaction-btn" title="Delete comment">
        <i data-lucide="trash-2"></i>
      </button>
      <div class="testi-stars">
        ${starsHTML}
      </div>
      <p class="testi-quote">"${text}"</p>
      <div class="testi-author">
        <div class="testi-avatar"><i data-lucide="user"></i></div>
        <div class="testi-info">
          <h4>${name}</h4>
          <span>${role}</span>
        </div>
      </div>
    `;

    // Add delete listener
    const deleteBtn = card.querySelector(".delete-reaction-btn");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => {
        // Remove card from UI
        card.remove();
        // Remove review from storage
        deleteReviewFromStorage(name, role, text, rating);
      });
    }

    // Prepend the new card (before the inline form card or first review)
    const inlineFormCard = document.getElementById("inline-reaction-card");
    if (inlineFormCard) {
      testimonialsGrid.insertBefore(card, inlineFormCard.nextSibling);
    } else {
      testimonialsGrid.insertBefore(card, testimonialsGrid.firstChild);
    }

    // Trigger Lucide to render the newly injected card icons
    if (window.lucide) {
      window.lucide.createIcons();
    }

    // Persist to localStorage so reviews survive page reloads
    if (persist) {
      saveReview({ name, role, text, rating });
    }
  }

  // Restore reviews saved in localStorage on page load
  loadSavedReviews().forEach(r => {
    appendReviewToGrid(r.name, r.role, r.text, r.rating, false);
  });


  // Handle Modal review form submission
  if (reactionForm) {
    reactionForm.addEventListener("submit", e => {
      e.preventDefault();
      
      const name = document.getElementById("reaction-name").value.trim();
      const role = document.getElementById("reaction-role").value.trim();
      const text = document.getElementById("reaction-text").value.trim();
      const rating = parseInt(selectedRatingInput.value) || 5;

      if (!name || !role || !text) return;

      appendReviewToGrid(name, role, text, rating);

      // Close the modal and reset form
      closeReactionFormModal();
      reactionForm.reset();
    });
  }

  // Handle Inline review form submission
  if (inlineReactionForm) {
    inlineReactionForm.addEventListener("submit", e => {
      e.preventDefault();
      
      const name = document.getElementById("inline-reaction-name").value.trim();
      const role = document.getElementById("inline-reaction-role").value.trim();
      const text = document.getElementById("inline-reaction-text").value.trim();
      const rating = parseInt(inlineSelectedRating.value) || 5;

      if (!name || !role || !text) return;

      appendReviewToGrid(name, role, text, rating);

      // Reset inline form and stars
      inlineReactionForm.reset();
      inlineSelectedRating.value = "5";
      const stars = inlineRatingStars.querySelectorAll(".inline-rating-star");
      stars.forEach(s => {
        s.classList.add("active");
        s.style.color = "var(--gold-accent)";
        s.style.fill = "var(--gold-accent)";
      });
    });
  }

  // --- 15. DEDICATED LEGAL TABS SWITCHER (Disabled as Privacy Policy is removed) ---
  function switchLegalTab(tabKey) {
    // Tab switching disabled. Only Terms & Conditions is active.
  }
  window.switchLegalTab = switchLegalTab;

  // --- MOBILE FLOATING SOCIAL CYCLE ENGINE ---
  const mobileSocialBtn = document.getElementById("mobile-social-btn");
  if (mobileSocialBtn) {
    const socialPlatforms = [
      {
        class: "wa-icon",
        url: "https://wa.me/919446802570",
        title: "WhatsApp Chat",
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-circle"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>`
      },
      {
        class: "ig-icon",
        url: "https://www.instagram.com",
        title: "Instagram",
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>`
      },
      {
        class: "fb-icon",
        url: "https://www.facebook.com",
        title: "Facebook",
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-facebook"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>`
      },
      {
        class: "li-icon",
        url: "https://www.linkedin.com",
        title: "LinkedIn",
        svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-linkedin"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>`
      }
    ];

    let currentPlatformIdx = 0;

    setInterval(() => {
      // Fade out transition (subtle micro-animation)
      mobileSocialBtn.style.transform = "scale(0.3) rotate(180deg)";
      mobileSocialBtn.style.opacity = "0";

      setTimeout(() => {
        currentPlatformIdx = (currentPlatformIdx + 1) % socialPlatforms.length;
        const platform = socialPlatforms[currentPlatformIdx];

        // Reset classes
        mobileSocialBtn.className = platform.class;
        mobileSocialBtn.href = platform.url;
        mobileSocialBtn.title = platform.title;
        mobileSocialBtn.innerHTML = platform.svg;

        // Fade back in
        mobileSocialBtn.style.transform = "scale(1) rotate(360deg)";
        mobileSocialBtn.style.opacity = "1";
      }, 300); // sync with rotate/scale delay
    }, 5000);
  }

});
