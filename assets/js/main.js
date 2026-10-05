/**
 * THE EHELEPOLA HOTEL & LUXURY HERITAGE RETREAT
 * Interactive Client Scripts & Application Controller
 */

// Currency Exchange Rates (Base: USD)
const exchangeRates = {
  USD: { rate: 1, symbol: "$", format: (val) => `$${val.toLocaleString()}` },
  LKR: { rate: 305, symbol: "Rs.", format: (val) => `Rs. ${(val * 305).toLocaleString()}` },
  EUR: { rate: 0.92, symbol: "€", format: (val) => `€${Math.round(val * 0.92).toLocaleString()}` },
  GBP: { rate: 0.78, symbol: "£", format: (val) => `£${Math.round(val * 0.78).toLocaleString()}` },
  AUD: { rate: 1.52, symbol: "A$", format: (val) => `A$${Math.round(val * 1.52).toLocaleString()}` }
};

let currentCurrency = "USD";

// Room Database
const suitesData = {
  "royal-heritage": {
    name: "The Royal Ehelepola Suite",
    basePrice: 520,
    size: "140 m² / 1,500 sq.ft",
    guests: "2 Adults + 1 Child",
    bed: "King Four-Poster Canopy",
    view: "Misty Mountain & Tea Estate",
    description: "The crown jewel of our heritage mansion. Featuring handcrafted teak furniture, antique Ceylon tapestry, private colonial balcony, freestanding marble soaking tub, and dedicated 24-hour royal butler service.",
    image: "assets/images/royal_suite.jpg",
    amenities: ["Private Butler", "Deep Soaking Marble Tub", "Sunset Balcony", "Complimentary High Tea", "Bang & Olufsen Sound", "Pillow Menu"]
  },
  "grand-verandah": {
    name: "Governor's Heritage Verandah Suite",
    basePrice: 420,
    size: "95 m² / 1,020 sq.ft",
    guests: "2 Adults",
    bed: "Colonial King Bed",
    view: "Courtyard Lotus Fountain",
    description: "Immerse yourself in authentic Kandyan noble architecture. Features soaring exposed timber ceilings, handcrafted brass fixtures, private garden patio, and direct access to our herbal tranquility gardens.",
    image: "assets/images/grand_lobby.jpg",
    amenities: ["Private Garden Patio", "Walk-in Rain Shower", "Herbal Bath Salts", "Organic Ceylon Teas", "Twice-daily Maid Service"]
  }
};

// Video Tour Chapters
const videoChapters = {
  1: { title: "Resort Grounds & Sunset Pool", time: 0 },
  2: { title: "The Royal Suites & Villas", time: 45 },
  3: { title: "Ayurvedic Sanctuary & Spa", time: 90 },
  4: { title: "Kandyan Royal Gastronomy", time: 140 }
};

document.addEventListener("DOMContentLoaded", () => {
  initNavbarScroll();
  initMobileMenu();
  initCurrencySelector();
  initBookingEngine();
  initVideoPlayer();
  initAmbienceAudio();
  initFaqAccordion();
  initDiningTabs();
  initSuiteModals();
  initGalleryLightbox();
  initDatesDefaults();
});

/* -------------------------------------------------------------
 * 1. Navbar Scroll & Mobile Menu
 * ------------------------------------------------------------- */
function initNavbarScroll() {
  const header = document.querySelector(".site-header");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 40) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  });
}

function initMobileMenu() {
  const btn = document.getElementById("mobileMenuBtn");
  const navLinks = document.getElementById("navLinks");
  if (!btn || !navLinks) return;

  btn.addEventListener("click", () => {
    navLinks.classList.toggle("open");
    const isOpen = navLinks.classList.contains("open");
    btn.innerHTML = isOpen ? '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
  });

  navLinks.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      btn.innerHTML = '<i class="fas fa-bars"></i>';
    });
  });
}

/* -------------------------------------------------------------
 * 2. Currency Selector & Dynamic Price Updates
 * ------------------------------------------------------------- */
function initCurrencySelector() {
  const select = document.getElementById("currencySelector");
  if (!select) return;

  select.addEventListener("change", (e) => {
    currentCurrency = e.target.value;
    updateAllPrices();
  });
}

function updateAllPrices() {
  const priceElements = document.querySelectorAll("[data-base-price]");
  priceElements.forEach(el => {
    const base = parseFloat(el.getAttribute("data-base-price"));
    const config = exchangeRates[currentCurrency] || exchangeRates.USD;
    el.textContent = config.format(base);
  });
}

/* -------------------------------------------------------------
 * 3. Default Dates (Today + 1, Today + 3)
 * ------------------------------------------------------------- */
function initDatesDefaults() {
  const checkinInput = document.getElementById("barCheckin");
  const checkoutInput = document.getElementById("barCheckout");
  if (!checkinInput || !checkoutInput) return;

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 4);

  checkinInput.value = tomorrow.toISOString().split("T")[0];
  checkoutInput.value = nextWeek.toISOString().split("T")[0];
}

/* -------------------------------------------------------------
 * 4. Ambient Resort Soundscape (Web Audio API Synthesizer)
 * ------------------------------------------------------------- */
let audioCtx = null;
let isAudioPlaying = false;
let ambientNodes = [];

function initAmbienceAudio() {
  const toggleBtn = document.getElementById("soundToggleBtn");
  if (!toggleBtn) return;

  toggleBtn.addEventListener("click", () => {
    if (!isAudioPlaying) {
      startAmbientAudio();
      toggleBtn.classList.add("playing");
      toggleBtn.innerHTML = '<i class="fas fa-volume-up"></i>';
      toggleBtn.title = "Pause Resort Ambience";
    } else {
      stopAmbientAudio();
      toggleBtn.classList.remove("playing");
      toggleBtn.innerHTML = '<i class="fas fa-volume-mute"></i>';
      toggleBtn.title = "Play Soothing Nature Ambience";
    }
  });
}

function startAmbientAudio() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    audioCtx = new AudioContext();

    // Warm, soothing low-pass nature drone (representing breeze through tea plantations)
    const bufferSize = audioCtx.sampleRate * 2;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = audioCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = audioCtx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(320, audioCtx.currentTime);
    filter.Q.setValueAtTime(1.5, audioCtx.currentTime);

    const gainNode = audioCtx.createGain();
    gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    whiteNoise.start(0);

    // Subtle gentle chime harmonic oscillator
    const osc = audioCtx.createOscillator();
    const oscGain = audioCtx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(528, audioCtx.currentTime); // 528Hz Solfeggio frequency
    oscGain.gain.setValueAtTime(0.015, audioCtx.currentTime);

    osc.connect(oscGain);
    oscGain.connect(audioCtx.destination);
    osc.start();

    ambientNodes = [whiteNoise, osc, gainNode, oscGain];
    isAudioPlaying = true;
  } catch (err) {
    console.warn("Web Audio not supported or blocked", err);
  }
}

function stopAmbientAudio() {
  if (audioCtx) {
    audioCtx.close();
    audioCtx = null;
  }
  isAudioPlaying = false;
}

/* -------------------------------------------------------------
 * 5. Video Player & Video Tour Modal
 * ------------------------------------------------------------- */
function initVideoPlayer() {
  const watchFilmBtn = document.getElementById("watchFilmBtn");
  const showcasePlayBtn = document.getElementById("showcasePlayBtn");
  const videoModal = document.getElementById("videoTourModal");
  const closeVideoBtn = document.getElementById("closeVideoModal");
  const modalIframe = document.getElementById("videoModalIframe");

  const openVideo = () => {
    if (videoModal && modalIframe) {
      // High-definition luxury Sri Lanka hotel showcase tour video
      modalIframe.src = "https://www.youtube-nocookie.com/embed/U2qL3F04u6M?autoplay=1&rel=0&modestbranding=1";
      videoModal.classList.add("active");
    }
  };

  const closeVideo = () => {
    if (videoModal && modalIframe) {
      modalIframe.src = "";
      videoModal.classList.remove("active");
    }
  };

  if (watchFilmBtn) watchFilmBtn.addEventListener("click", openVideo);
  if (showcasePlayBtn) showcasePlayBtn.addEventListener("click", openVideo);
  if (closeVideoBtn) closeVideoBtn.addEventListener("click", closeVideo);

  if (videoModal) {
    videoModal.addEventListener("click", (e) => {
      if (e.target === videoModal) closeVideo();
    });
  }

  // Chapter buttons in the showcase frame
  const chapterBtns = document.querySelectorAll(".chapter-btn");
  chapterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      chapterBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      openVideo();
    });
  });
}

/* -------------------------------------------------------------
 * 6. Interactive Booking Engine & Instant Voucher Generator
 * ------------------------------------------------------------- */
function initBookingEngine() {
  const bookingModal = document.getElementById("bookingEngineModal");
  const openModalBtns = document.querySelectorAll(".open-booking-modal");
  const closeModalBtn = document.getElementById("closeBookingModal");

  const checkAvailabilityBtn = document.getElementById("barCheckAvailabilityBtn");

  const openBooking = (preselectedSuite = null) => {
    if (preselectedSuite) {
      const suiteSelect = document.getElementById("bookingSuiteSelect");
      if (suiteSelect) suiteSelect.value = preselectedSuite;
    }
    calculateBookingSummary();
    if (bookingModal) bookingModal.classList.add("active");
  };

  const closeBooking = () => {
    if (bookingModal) bookingModal.classList.remove("active");
  };

  openModalBtns.forEach(btn => {
    btn.addEventListener("click", (e) => {
      const suite = e.currentTarget.getAttribute("data-suite");
      openBooking(suite);
    });
  });

  if (checkAvailabilityBtn) {
    checkAvailabilityBtn.addEventListener("click", (e) => {
      e.preventDefault();
      const suite = document.getElementById("barSuiteSelect")?.value;
      openBooking(suite);
    });
  }

  if (closeModalBtn) closeModalBtn.addEventListener("click", closeBooking);
  if (bookingModal) {
    bookingModal.addEventListener("click", (e) => {
      if (e.target === bookingModal) closeBooking();
    });
  }

  // Live recalculate on input changes
  const inputsToWatch = ["bookCheckin", "bookCheckout", "bookingSuiteSelect", "bookGuests"];
  inputsToWatch.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("change", calculateBookingSummary);
  });

  const addonCheckboxes = document.querySelectorAll(".addon-checkbox");
  addonCheckboxes.forEach(cb => {
    cb.addEventListener("change", calculateBookingSummary);
  });

  // Handle Complete Reservation
  const bookingForm = document.getElementById("finalBookingForm");
  if (bookingForm) {
    bookingForm.addEventListener("submit", (e) => {
      e.preventDefault();
      showBookingConfirmation();
    });
  }
}

function calculateBookingSummary() {
  const checkinVal = document.getElementById("bookCheckin")?.value;
  const checkoutVal = document.getElementById("bookCheckout")?.value;
  const suiteVal = document.getElementById("bookingSuiteSelect")?.value || "royal-heritage";

  const suite = suitesData[suiteVal] || suitesData["royal-heritage"];
  
  let nights = 1;
  if (checkinVal && checkoutVal) {
    const d1 = new Date(checkinVal);
    const d2 = new Date(checkoutVal);
    const diff = (d2 - d1) / (1000 * 60 * 60 * 24);
    if (diff > 0) nights = Math.ceil(diff);
  }

  // Calculate Addons
  let addonTotal = 0;
  document.querySelectorAll(".addon-checkbox:checked").forEach(cb => {
    addonTotal += parseFloat(cb.value);
  });

  const roomTotal = suite.basePrice * nights;
  const taxes = (roomTotal + addonTotal) * 0.12; // 12% luxury & service charge
  const grandTotal = roomTotal + addonTotal + taxes;

  const config = exchangeRates[currentCurrency] || exchangeRates.USD;

  // Update Summary UI
  const nightsCountEl = document.getElementById("summaryNightsCount");
  const suiteNameEl = document.getElementById("summarySuiteName");
  const roomPriceEl = document.getElementById("summaryRoomPrice");
  const addonsPriceEl = document.getElementById("summaryAddonsPrice");
  const taxesPriceEl = document.getElementById("summaryTaxesPrice");
  const grandTotalEl = document.getElementById("summaryGrandTotal");

  if (nightsCountEl) nightsCountEl.textContent = `${nights} Night${nights > 1 ? 's' : ''}`;
  if (suiteNameEl) suiteNameEl.textContent = suite.name;
  if (roomPriceEl) roomPriceEl.textContent = config.format(roomTotal);
  if (addonsPriceEl) addonsPriceEl.textContent = config.format(addonTotal);
  if (taxesPriceEl) taxesPriceEl.textContent = config.format(taxes);
  if (grandTotalEl) grandTotalEl.textContent = config.format(grandTotal);
}

function showBookingConfirmation() {
  const guestName = document.getElementById("bookGuestName")?.value || "Distinguished Guest";
  const guestEmail = document.getElementById("bookGuestEmail")?.value || "guest@ehelepola.com";
  const suiteVal = document.getElementById("bookingSuiteSelect")?.value || "royal-heritage";
  const suite = suitesData[suiteVal] || suitesData["royal-heritage"];
  const refCode = "EH-" + Math.floor(100000 + Math.random() * 900000);

  const voucherModal = document.getElementById("voucherSuccessModal");
  if (voucherModal) {
    document.getElementById("voucherRefCode").textContent = refCode;
    document.getElementById("voucherGuestName").textContent = guestName;
    document.getElementById("voucherGuestEmail").textContent = guestEmail;
    document.getElementById("voucherSuiteName").textContent = suite.name;
    document.getElementById("voucherDates").textContent = `${document.getElementById("bookCheckin").value} to ${document.getElementById("bookCheckout").value}`;

    // Hide booking modal, show voucher
    document.getElementById("bookingEngineModal")?.classList.remove("active");
    voucherModal.classList.add("active");
  }
}

/* -------------------------------------------------------------
 * 7. Suite Details Modal
 * ------------------------------------------------------------- */
function initSuiteModals() {
  const detailModal = document.getElementById("suiteDetailModal");
  const closeBtn = document.getElementById("closeSuiteModal");
  const detailButtons = document.querySelectorAll(".view-suite-details");

  detailButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const suiteKey = btn.getAttribute("data-suite");
      const suite = suitesData[suiteKey];
      if (!suite) return;

      document.getElementById("modalSuiteTitle").textContent = suite.name;
      document.getElementById("modalSuiteImg").src = suite.image;
      document.getElementById("modalSuiteDesc").textContent = suite.description;
      document.getElementById("modalSuiteSize").textContent = suite.size;
      document.getElementById("modalSuiteGuests").textContent = suite.guests;
      document.getElementById("modalSuiteBed").textContent = suite.bed;
      document.getElementById("modalSuiteView").textContent = suite.view;

      const amenitiesList = document.getElementById("modalSuiteAmenities");
      amenitiesList.innerHTML = suite.amenities
        .map(a => `<div class="amenity-chip"><i class="fas fa-check text-gold"></i> ${a}</div>`)
        .join("");

      const reserveBtn = document.getElementById("modalReserveSuiteBtn");
      if (reserveBtn) {
        reserveBtn.onclick = () => {
          detailModal.classList.remove("active");
          const suiteSelect = document.getElementById("bookingSuiteSelect");
          if (suiteSelect) suiteSelect.value = suiteKey;
          calculateBookingSummary();
          document.getElementById("bookingEngineModal")?.classList.add("active");
        };
      }

      detailModal.classList.add("active");
    });
  });

  if (closeBtn) {
    closeBtn.addEventListener("click", () => detailModal.classList.remove("active"));
  }
  if (detailModal) {
    detailModal.addEventListener("click", (e) => {
      if (e.target === detailModal) detailModal.classList.remove("active");
    });
  }
}

/* -------------------------------------------------------------
 * 8. Dining Tabs & Menu Switcher
 * ------------------------------------------------------------- */
function initDiningTabs() {
  const tabBtns = document.querySelectorAll(".dining-tab-btn");
  const menuContainers = document.querySelectorAll(".dining-menu-content");

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      tabBtns.forEach(b => b.classList.remove("active"));
      menuContainers.forEach(c => c.style.display = "none");

      btn.classList.add("active");
      const targetId = btn.getAttribute("data-target");
      const targetContent = document.getElementById(targetId);
      if (targetContent) {
        targetContent.style.display = "block";
      }
    });
  });
}

/* -------------------------------------------------------------
 * 9. Gallery Lightbox
 * ------------------------------------------------------------- */
function initGalleryLightbox() {
  const galleryItems = document.querySelectorAll(".gallery-item");
  const lightboxModal = document.getElementById("galleryLightboxModal");
  const lightboxImg = document.getElementById("lightboxImage");
  const lightboxCaption = document.getElementById("lightboxCaption");
  const closeLightbox = document.getElementById("closeLightboxBtn");

  galleryItems.forEach(item => {
    item.addEventListener("click", () => {
      const img = item.querySelector("img");
      const caption = item.getAttribute("data-caption") || "The Ehelepola Hotel Estate";
      if (lightboxImg && img) {
        lightboxImg.src = img.src;
        if (lightboxCaption) lightboxCaption.textContent = caption;
        lightboxModal.classList.add("active");
      }
    });
  });

  if (closeLightbox) {
    closeLightbox.addEventListener("click", () => lightboxModal.classList.remove("active"));
  }
  if (lightboxModal) {
    lightboxModal.addEventListener("click", (e) => {
      if (e.target === lightboxModal) lightboxModal.classList.remove("active");
    });
  }
}

/* -------------------------------------------------------------
 * 10. FAQ Accordion
 * ------------------------------------------------------------- */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll(".faq-item");
  faqItems.forEach(item => {
    const header = item.querySelector(".faq-header");
    header.addEventListener("click", () => {
      const isActive = item.classList.contains("active");
      faqItems.forEach(i => i.classList.remove("active"));
      if (!isActive) {
        item.classList.add("active");
      }
    });
  });
}
