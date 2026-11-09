/**
 * HERITAGE EHELEPOLA HOTEL & RESORT
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
    guests: "2 - 4 Guests",
    bed: "Dual Antique Carved Teak Beds",
    view: "Tranquil Courtyard & Hillside Breeze",
    description: "The crown jewel of our heritage mansion. Featuring handcrafted antique carved teak beds, polished timber ceilings, fine Ceylon linens, and dedicated 24-hour royal butler service.",
    image: "assets/images/royal_suite_real.jpg",
    amenities: ["Private Butler", "Handcrafted Teak Furniture", "Timber Paneled Ceiling", "Complimentary High Tea", "Bang & Olufsen Sound", "Pillow Menu"]
  },
  "terrace-lounge": {
    name: "Courtyard Terrace Dining Lounge",
    basePrice: 320,
    size: "65 m² Verandah Space",
    guests: "2 - 8 Guests",
    bed: "Modern Dining & Terrace Lounge",
    view: "Green Lawn & Internal Courtyard",
    description: "An elegant, airy terrace lounge featuring vibrant emerald green lawn turf, contemporary quilted dining chairs, and sleek marble-top tables. Ideal for enjoying freshly brewed Ceylon breakfast tea, private family dinners, and relaxed evening conversations in complete tranquility.",
    image: "assets/images/terrace_dining_lounge.jpg",
    amenities: ["Green Lawn Turf Floor", "Modern Quilted Designer Chairs", "Private Dining Setup", "Breakfast & High Tea Service", "Quiet Courtyard Setting", "Dedicated Waitstaff"]
  },
  "grand-verandah": {
    name: "Courtyard Terrace Dining Lounge",
    basePrice: 320,
    size: "65 m² Verandah Space",
    guests: "2 - 8 Guests",
    bed: "Modern Dining & Terrace Lounge",
    view: "Green Lawn & Internal Courtyard",
    description: "An elegant, airy terrace lounge featuring vibrant emerald green lawn turf, contemporary quilted dining chairs, and sleek marble-top tables. Ideal for enjoying freshly brewed Ceylon breakfast tea, private family dinners, and relaxed evening conversations in complete tranquility.",
    image: "assets/images/terrace_dining_lounge.jpg",
    amenities: ["Green Lawn Turf Floor", "Modern Quilted Designer Chairs", "Private Dining Setup", "Breakfast & High Tea Service", "Quiet Courtyard Setting", "Dedicated Waitstaff"]
  },
  "garden-pavilion": {
    name: "Heritage Garden Pavilion & Cabana",
    basePrice: 380,
    size: "80 m² Garden Sanctuary",
    guests: "2 - 6 Guests",
    bed: "Open-Air Lounge & Garden Retreat",
    view: "Tropical Mango Garden & Green Courtyard",
    description: "An authentic Sri Lankan garden sanctuary featuring a hand-thatched circular cabana, polished round timber dining table, ambient evening lighting, and white pebble stone pathways amidst swaying mango trees. Perfect for private high-tea, candlelit dining, and tranquil afternoon relaxation.",
    image: "assets/images/garden_gazebo_pavilion.jpg",
    amenities: ["Private Thatched Cabana", "Round Timber Dining Table", "Pebble Garden Pathways", "High Tea Service", "Evening Garden Lanterns", "Direct Courtyard Access"]
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
  initGuestFeedbackSystem();
  initDiscoverGallerySlider();
  initHeroBackgroundSlider();
  initDiningCarouselSlider();
});

/* -------------------------------------------------------------
 * 1. Navbar Scroll & Mobile Menu
 * ------------------------------------------------------------- */
function initNavbarScroll() {
  const header = document.querySelector(".haven-header, .site-header");
  if (!header) return;
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
 * 6. Interactive 6-Room Booking Engine & Double-Booking Prevention Calendar
 * ------------------------------------------------------------- */
const hotelRooms = [
  { id: "Room 01", name: "Room 01", suiteKey: "royal-heritage", suiteName: "The Royal Ehelepola Suite (Deluxe)", floor: "1st Floor" },
  { id: "Room 02", name: "Room 02", suiteKey: "royal-heritage", suiteName: "The Royal Ehelepola Suite (Master)", floor: "1st Floor" },
  { id: "Room 03", name: "Room 03", suiteKey: "terrace-lounge", suiteName: "Courtyard Terrace Suite", floor: "Ground Floor" },
  { id: "Room 04", name: "Room 04", suiteKey: "terrace-lounge", suiteName: "Courtyard Terrace Suite", floor: "Ground Floor" },
  { id: "Room 05", name: "Room 05", suiteKey: "garden-pavilion", suiteName: "Heritage Garden Pavilion", floor: "Ground Floor" },
  { id: "Room 06", name: "Room 06", suiteKey: "garden-pavilion", suiteName: "Heritage Garden Pavilion", floor: "Ground Floor" }
];

const BOOKINGS_STORAGE_KEY = "ehelepola_hotel_bookings_v2";

let calendarMonth = new Date();
let calendarActiveRoom = "all";

function getStoredBookings() {
  try {
    const raw = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error("Failed to parse bookings", e);
  }
  return generateDefaultSeedBookings();
}

function saveBookings(bookings) {
  try {
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
  } catch (e) {
    console.error("Failed to save bookings", e);
  }
}

function generateDefaultSeedBookings() {
  const today = new Date();
  const formatD = (d) => d.toISOString().split("T")[0];

  const addDays = (num) => {
    const d = new Date(today);
    d.setDate(d.getDate() + num);
    return formatD(d);
  };

  const seed = [
    {
      id: "EH-941820",
      refCode: "EH-941820",
      roomNumber: "Room 01",
      suiteKey: "royal-heritage",
      suiteName: "The Royal Ehelepola Suite",
      checkin: addDays(2),
      checkout: addDays(5),
      guestName: "Lord Henry Campbell",
      guestEmail: "henry@campbell-holdings.co.uk",
      guestPhone: "+44 7911 123456"
    },
    {
      id: "EH-732915",
      refCode: "EH-732915",
      roomNumber: "Room 03",
      suiteKey: "terrace-lounge",
      suiteName: "Courtyard Terrace Dining Lounge",
      checkin: addDays(6),
      checkout: addDays(9),
      guestName: "Lady Victoria Mills",
      guestEmail: "victoria@mills-design.com",
      guestPhone: "+61 412 345 678"
    },
    {
      id: "EH-619482",
      refCode: "EH-619482",
      roomNumber: "Room 06",
      suiteKey: "garden-pavilion",
      suiteName: "Heritage Garden Pavilion & Cabana",
      checkin: addDays(3),
      checkout: addDays(6),
      guestName: "Dr. Rohan Fernando",
      guestEmail: "rohan.fernando@ceylonheritage.lk",
      guestPhone: "+94 77 987 6543"
    }
  ];
  saveBookings(seed);
  return seed;
}

// Conflict checking: two intervals overlap if start1 < end2 && end1 > start2
function checkRoomConflict(roomNumber, checkinStr, checkoutStr) {
  if (!roomNumber || !checkinStr || !checkoutStr) return null;
  const newStart = new Date(checkinStr);
  const newEnd = new Date(checkoutStr);
  if (isNaN(newStart.getTime()) || isNaN(newEnd.getTime()) || newStart >= newEnd) return null;

  const bookings = getStoredBookings();
  const conflict = bookings.find(b => {
    if (b.roomNumber !== roomNumber) return false;
    const bStart = new Date(b.checkin);
    const bEnd = new Date(b.checkout);
    return newStart < bEnd && newEnd > bStart;
  });
  return conflict || null;
}

function getAvailableRoomsForDates(checkinStr, checkoutStr) {
  if (!checkinStr || !checkoutStr) return hotelRooms.map(r => r.id);
  return hotelRooms.map(r => r.id).filter(roomNum => {
    return !checkRoomConflict(roomNum, checkinStr, checkoutStr);
  });
}

// Window helper for conflict resolution click
window.selectRoomFromConflict = function(roomNumber) {
  const roomSelect = document.getElementById("bookingRoomNumber");
  if (roomSelect) {
    roomSelect.value = roomNumber;
    syncSuiteFromRoom(roomNumber);
    calendarActiveRoom = roomNumber;
    updateCalendarTabs();
    calculateBookingSummary();
  }
};

function syncSuiteFromRoom(roomNumber) {
  const roomObj = hotelRooms.find(r => r.id === roomNumber);
  if (roomObj) {
    const suiteSelect = document.getElementById("bookingSuiteSelect");
    if (suiteSelect && suiteSelect.value !== roomObj.suiteKey) {
      suiteSelect.value = roomObj.suiteKey;
    }
  }
}

function syncRoomFromSuite(suiteKey) {
  const roomSelect = document.getElementById("bookingRoomNumber");
  if (!roomSelect) return;
  const currentRoom = roomSelect.value;
  const currentObj = hotelRooms.find(r => r.id === currentRoom);
  if (currentObj && currentObj.suiteKey === suiteKey) return; // already matching

  // Pick first room for this suite
  const match = hotelRooms.find(r => r.suiteKey === suiteKey);
  if (match) {
    roomSelect.value = match.id;
    calendarActiveRoom = match.id;
    updateCalendarTabs();
  }
}

function updateCalendarTabs() {
  const tabs = document.querySelectorAll(".cal-room-tab");
  tabs.forEach(tab => {
    if (tab.getAttribute("data-room") === calendarActiveRoom) {
      tab.classList.add("active");
    } else {
      tab.classList.remove("active");
    }
  });
  const badge = document.getElementById("calendarRoomBadge");
  if (badge) {
    badge.textContent = calendarActiveRoom === "all" ? "All 6 Rooms" : calendarActiveRoom;
  }
}

function initBookingEngine() {
  const bookingModal = document.getElementById("bookingEngineModal");
  const openModalBtns = document.querySelectorAll(".open-booking-modal");
  const closeModalBtn = document.getElementById("closeBookingModal");
  const checkAvailabilityBtn = document.getElementById("barCheckAvailabilityBtn");

  const openBooking = (preselectedSuite = null) => {
    if (preselectedSuite) {
      const suiteSelect = document.getElementById("bookingSuiteSelect");
      if (suiteSelect) {
        suiteSelect.value = preselectedSuite;
        syncRoomFromSuite(preselectedSuite);
      }
    }
    initBookingFormDates();
    calculateBookingSummary();
    renderRoomCalendar();
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
      const barIn = document.getElementById("barCheckin")?.value;
      const barOut = document.getElementById("barCheckout")?.value;
      const barGuests = document.getElementById("barGuests")?.value;

      if (barIn) document.getElementById("bookCheckin").value = barIn;
      if (barOut) document.getElementById("bookCheckout").value = barOut;
      if (barGuests) document.getElementById("bookGuests").value = barGuests;

      openBooking(suite);
    });
  }

  if (closeModalBtn) closeModalBtn.addEventListener("click", closeBooking);
  if (bookingModal) {
    bookingModal.addEventListener("click", (e) => {
      if (e.target === bookingModal) closeBooking();
    });
  }

  // Room & Suite Sync Listeners
  const roomSelect = document.getElementById("bookingRoomNumber");
  if (roomSelect) {
    roomSelect.addEventListener("change", (e) => {
      const chosenRoom = e.target.value;
      syncSuiteFromRoom(chosenRoom);
      calendarActiveRoom = chosenRoom;
      updateCalendarTabs();
      calculateBookingSummary();
      renderRoomCalendar();
    });
  }

  const suiteSelect = document.getElementById("bookingSuiteSelect");
  if (suiteSelect) {
    suiteSelect.addEventListener("change", (e) => {
      const chosenSuite = e.target.value;
      syncRoomFromSuite(chosenSuite);
      calculateBookingSummary();
      renderRoomCalendar();
    });
  }

  // Live recalculate on input changes
  const inputsToWatch = ["bookCheckin", "bookCheckout", "bookGuests"];
  inputsToWatch.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("change", () => {
      calculateBookingSummary();
      renderRoomCalendar();
    });
  });

  const addonCheckboxes = document.querySelectorAll(".addon-checkbox");
  addonCheckboxes.forEach(cb => {
    cb.addEventListener("change", calculateBookingSummary);
  });

  // Calendar Controls
  const calPrevBtn = document.getElementById("calPrevBtn");
  const calNextBtn = document.getElementById("calNextBtn");
  if (calPrevBtn) {
    calPrevBtn.addEventListener("click", () => {
      calendarMonth.setMonth(calendarMonth.getMonth() - 1);
      renderRoomCalendar();
    });
  }
  if (calNextBtn) {
    calNextBtn.addEventListener("click", () => {
      calendarMonth.setMonth(calendarMonth.getMonth() + 1);
      renderRoomCalendar();
    });
  }

  const roomTabs = document.querySelectorAll(".cal-room-tab");
  roomTabs.forEach(tab => {
    tab.addEventListener("click", (e) => {
      const r = e.currentTarget.getAttribute("data-room");
      calendarActiveRoom = r;
      if (r !== "all" && roomSelect) {
        roomSelect.value = r;
        syncSuiteFromRoom(r);
        calculateBookingSummary();
      }
      updateCalendarTabs();
      renderRoomCalendar();
    });
  });

  const resetBtn = document.getElementById("resetDemoBookingsBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      if (confirm("Reset bookings to factory demo state?")) {
        localStorage.removeItem(BOOKINGS_STORAGE_KEY);
        generateDefaultSeedBookings();
        calculateBookingSummary();
        renderRoomCalendar();
        alert("Demo reservations have been refreshed.");
      }
    });
  }

  // Handle Complete Reservation
  const bookingForm = document.getElementById("finalBookingForm");
  if (bookingForm) {
    bookingForm.addEventListener("submit", (e) => {
      e.preventDefault();
      showBookingConfirmation();
    });
  }

  // Initial Calendar Render
  renderRoomCalendar();
}

function initBookingFormDates() {
  const checkinInput = document.getElementById("bookCheckin");
  const checkoutInput = document.getElementById("bookCheckout");
  if (checkinInput && !checkinInput.value) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    checkinInput.value = tomorrow.toISOString().split("T")[0];
  }
  if (checkoutInput && !checkoutInput.value) {
    const today = new Date();
    const future = new Date(today);
    future.setDate(future.getDate() + 4);
    checkoutInput.value = future.toISOString().split("T")[0];
  }
}

function renderRoomCalendar() {
  const grid = document.getElementById("calendarDaysGrid");
  const monthLabel = document.getElementById("calCurrentMonthLabel");
  if (!grid || !monthLabel) return;

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();

  monthLabel.textContent = `${monthNames[month]} ${year}`;

  grid.innerHTML = "";

  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const checkinVal = document.getElementById("bookCheckin")?.value;
  const checkoutVal = document.getElementById("bookCheckout")?.value;
  const userStart = checkinVal ? new Date(checkinVal) : null;
  const userEnd = checkoutVal ? new Date(checkoutVal) : null;

  const bookings = getStoredBookings();

  // Empty leading days
  for (let i = 0; i < firstDayIndex; i++) {
    const emptyCell = document.createElement("div");
    emptyCell.className = "cal-day-cell empty-day";
    grid.appendChild(emptyCell);
  }

  // Populate days of month
  for (let day = 1; day <= totalDays; day++) {
    const cellDate = new Date(year, month, day);
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const cell = document.createElement("div");
    cell.className = "cal-day-cell";

    const numSpan = document.createElement("span");
    numSpan.className = "cal-day-num";
    numSpan.textContent = day;
    cell.appendChild(numSpan);

    const isPast = cellDate < today;
    if (isPast) {
      cell.classList.add("past-day");
      const statusSpan = document.createElement("span");
      statusSpan.className = "cal-day-status";
      statusSpan.textContent = "—";
      cell.appendChild(statusSpan);
      grid.appendChild(cell);
      continue;
    }

    // Check bookings for this day
    // Day is considered booked if b.checkin <= dateStr < b.checkout
    const activeBookingsOnDay = bookings.filter(b => {
      return dateStr >= b.checkin && dateStr < b.checkout;
    });

    let isCellBooked = false;
    let statusText = "Free";
    let statusClass = "status-free";

    if (calendarActiveRoom === "all") {
      const bookedCount = activeBookingsOnDay.length;
      if (bookedCount === 0) {
        statusText = "🟢 6 Free";
        statusClass = "status-free";
      } else if (bookedCount < 6) {
        statusText = `🟠 ${6 - bookedCount} Free`;
        statusClass = "status-free";
      } else {
        statusText = "🔴 Full";
        statusClass = "status-booked";
        isCellBooked = true;
      }
    } else {
      const isRoomBooked = activeBookingsOnDay.some(b => b.roomNumber === calendarActiveRoom);
      if (isRoomBooked) {
        isCellBooked = true;
        statusText = "🔒 Booked";
        statusClass = "status-booked";
      } else {
        statusText = "Free";
        statusClass = "status-free";
      }
    }

    if (isCellBooked) {
      cell.classList.add("booked-day");
    } else {
      cell.classList.add("available-day");
    }

    // Highlight user selection
    if (userStart && userEnd && !isNaN(userStart) && !isNaN(userEnd)) {
      if (dateStr >= checkinVal && dateStr <= checkoutVal) {
        cell.classList.add("selected-range");
        if (dateStr === checkinVal || dateStr === checkoutVal) {
          cell.classList.add("selected-endpoint");
        }
      }
    }

    const statusSpan = document.createElement("span");
    statusSpan.className = `cal-day-status ${statusClass}`;
    statusSpan.textContent = statusText;
    cell.appendChild(statusSpan);

    // Interactive date click to set checkin / checkout
    if (!isPast && !isCellBooked) {
      cell.addEventListener("click", () => {
        const inInput = document.getElementById("bookCheckin");
        const outInput = document.getElementById("bookCheckout");
        if (!inInput.value || (inInput.value && outInput.value)) {
          inInput.value = dateStr;
          outInput.value = "";
        } else if (inInput.value && !outInput.value) {
          if (dateStr > inInput.value) {
            outInput.value = dateStr;
          } else {
            inInput.value = dateStr;
          }
        }
        calculateBookingSummary();
        renderRoomCalendar();
      });
    }

    grid.appendChild(cell);
  }
}

function validateRoomAvailabilityAndAlerts(selectedRoom, checkinVal, checkoutVal, nights) {
  const statusContainer = document.getElementById("bookingAvailabilityStatus");
  const confirmBtn = document.getElementById("confirmBookingBtn");
  if (!statusContainer) return true;

  if (!checkinVal || !checkoutVal) {
    statusContainer.innerHTML = `
      <div class="booking-status-box" style="background: #f8fafc; border: 1px dashed var(--border-light); color: var(--text-muted); font-size: 0.85rem;">
        <i class="fas fa-info-circle text-gold"></i> Please select your Check-in and Check-out dates to verify live room availability.
      </div>
    `;
    if (confirmBtn) {
      confirmBtn.disabled = false;
      confirmBtn.classList.remove("btn-disabled");
    }
    return true;
  }

  const conflict = checkRoomConflict(selectedRoom, checkinVal, checkoutVal);

  if (conflict) {
    // Conflict detected: double-booking prevented!
    const availableRooms = getAvailableRoomsForDates(checkinVal, checkoutVal);

    statusContainer.innerHTML = `
      <div class="booking-status-box conflict">
        <div style="font-weight: 700; display: flex; align-items: center; gap: 8px; font-size: 0.95rem;">
          <i class="fas fa-exclamation-triangle" style="color: #dc2626; font-size: 1.15rem;"></i>
          <span>Double-Booking Conflict: ${selectedRoom} is ALREADY BOOKED!</span>
        </div>
        <div style="font-size: 0.86rem; color: #7f1d1d;">
          This room is already reserved from <strong>${conflict.checkin}</strong> to <strong>${conflict.checkout}</strong>. Another reservation cannot be placed on overlapping dates.
        </div>
        ${availableRooms.length > 0 ? `
          <div style="margin-top: 6px; padding-top: 8px; border-top: 1px dashed rgba(220, 38, 38, 0.3);">
            <span style="font-size: 0.8rem; font-weight: 700; color: #166534;">
              <i class="fas fa-check-circle" style="color: #16a34a;"></i> Switch to an Available Room for these dates:
            </span>
            <div class="alt-rooms-row" style="margin-top: 6px;">
              ${availableRooms.map(rm => `
                <button type="button" class="alt-room-btn" onclick="window.selectRoomFromConflict('${rm}')">
                  <i class="fas fa-door-open"></i> Select ${rm}
                </button>
              `).join("")}
            </div>
          </div>
        ` : `
          <div style="font-size: 0.82rem; color: #b91c1c; font-weight: 600; margin-top: 4px;">
            ⚠️ All 6 rooms of Heritage Ehelepola Hotel are reserved for these dates. Please choose different stay dates.
          </div>
        `}
      </div>
    `;

    if (confirmBtn) {
      confirmBtn.disabled = true;
      confirmBtn.classList.add("btn-disabled");
      confirmBtn.innerHTML = `<i class="fas fa-ban"></i> <span>${selectedRoom} Unavailable — Choose Another Room or Dates</span>`;
    }
    return false;
  } else {
    // Available!
    statusContainer.innerHTML = `
      <div class="booking-status-box available">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <i class="fas fa-check-circle" style="color: #16a34a; font-size: 1.1rem;"></i>
            <span><strong>${selectedRoom}</strong> is <strong>Available</strong> for your ${nights} Night${nights > 1 ? 's' : ''} stay!</span>
          </div>
          <span style="font-size: 0.76rem; font-weight: 700; color: #15803d; background: #dcfce7; padding: 3px 10px; border-radius: 12px; border: 1px solid #86efac;">
            <i class="fas fa-shield-alt"></i> Guaranteed Open
          </span>
        </div>
      </div>
    `;

    if (confirmBtn) {
      confirmBtn.disabled = false;
      confirmBtn.classList.remove("btn-disabled");
      confirmBtn.innerHTML = `<i class="fas fa-lock"></i> <span>Confirm & Generate Royal Reservation Voucher</span>`;
    }
    return true;
  }
}

function calculateBookingSummary() {
  const checkinVal = document.getElementById("bookCheckin")?.value;
  const checkoutVal = document.getElementById("bookCheckout")?.value;
  const suiteVal = document.getElementById("bookingSuiteSelect")?.value || "royal-heritage";
  const selectedRoom = document.getElementById("bookingRoomNumber")?.value || "Room 01";

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
  const assignedRoomEl = document.getElementById("summaryAssignedRoom");
  const roomPriceEl = document.getElementById("summaryRoomPrice");
  const addonsPriceEl = document.getElementById("summaryAddonsPrice");
  const taxesPriceEl = document.getElementById("summaryTaxesPrice");
  const grandTotalEl = document.getElementById("summaryGrandTotal");

  if (nightsCountEl) nightsCountEl.textContent = `${nights} Night${nights > 1 ? 's' : ''}`;
  if (suiteNameEl) suiteNameEl.textContent = suite.name;
  if (assignedRoomEl) assignedRoomEl.textContent = `${selectedRoom} (${suite.name})`;
  if (roomPriceEl) roomPriceEl.textContent = config.format(roomTotal);
  if (addonsPriceEl) addonsPriceEl.textContent = config.format(addonTotal);
  if (taxesPriceEl) taxesPriceEl.textContent = config.format(taxes);
  if (grandTotalEl) grandTotalEl.textContent = config.format(grandTotal);

  // Validate conflict
  validateRoomAvailabilityAndAlerts(selectedRoom, checkinVal, checkoutVal, nights);
}

function showBookingConfirmation() {
  const checkinVal = document.getElementById("bookCheckin")?.value;
  const checkoutVal = document.getElementById("bookCheckout")?.value;
  const selectedRoom = document.getElementById("bookingRoomNumber")?.value || "Room 01";
  const suiteVal = document.getElementById("bookingSuiteSelect")?.value || "royal-heritage";
  const suite = suitesData[suiteVal] || suitesData["royal-heritage"];

  // Double-check conflict before committing
  const conflict = checkRoomConflict(selectedRoom, checkinVal, checkoutVal);
  if (conflict) {
    alert(`Conflict Error: ${selectedRoom} is already booked from ${conflict.checkin} to ${conflict.checkout}. Please select an available room or change your dates.`);
    return;
  }

  const guestName = document.getElementById("bookGuestName")?.value || "Distinguished Guest";
  const guestEmail = document.getElementById("bookGuestEmail")?.value || "guest@ehelepola.com";
  const guestPhone = document.getElementById("bookGuestPhone")?.value || "+94 77 123 4567";
  const guestsVal = document.getElementById("bookGuests")?.value || "2";
  const refCode = "EH-" + Math.floor(100000 + Math.random() * 900000);

  // Save new booking to persistent storage
  const newBooking = {
    id: refCode,
    refCode: refCode,
    roomNumber: selectedRoom,
    suiteKey: suiteVal,
    suiteName: suite.name,
    checkin: checkinVal,
    checkout: checkoutVal,
    guestName: guestName,
    guestEmail: guestEmail,
    guestPhone: guestPhone,
    guests: guestsVal,
    createdAt: new Date().toISOString()
  };

  const currentBookings = getStoredBookings();
  currentBookings.push(newBooking);
  saveBookings(currentBookings);

  // Update Voucher Modal
  const voucherModal = document.getElementById("voucherSuccessModal");
  if (voucherModal) {
    document.getElementById("voucherRefCode").textContent = refCode;
    document.getElementById("voucherGuestName").textContent = guestName;
    document.getElementById("voucherGuestEmail").textContent = guestEmail;
    document.getElementById("voucherSuiteName").textContent = suite.name;
    const vRoom = document.getElementById("voucherRoomNumber");
    if (vRoom) vRoom.textContent = `${selectedRoom} — ${suite.name}`;
    document.getElementById("voucherDates").textContent = `${checkinVal} to ${checkoutVal}`;

    // Hide booking modal, show voucher
    document.getElementById("bookingEngineModal")?.classList.remove("active");
    voucherModal.classList.add("active");

    // Re-render calendar so the new booking is immediately marked as booked
    renderRoomCalendar();
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
          if (suiteSelect) {
            suiteSelect.value = suiteKey;
            syncRoomFromSuite(suiteKey);
          }
          initBookingFormDates();
          calculateBookingSummary();
          renderRoomCalendar();
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
      const caption = item.getAttribute("data-caption") || "Heritage Ehelepola Hotel Estate";
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


/* -------------------------------------------------------------
 * 12. Interactive Guest Feedback & Reviews System
 * ------------------------------------------------------------- */
function initGuestFeedbackSystem() {
  const toggleBtn = document.getElementById("toggleFeedbackFormBtn");
  const formCard = document.getElementById("feedbackFormCard");
  const closeBtn = document.getElementById("closeFeedbackFormBtn");
  const cancelBtn = document.getElementById("cancelFeedbackBtn");
  const form = document.getElementById("guestFeedbackForm");
  const grid = document.getElementById("havenReviewsGrid");

  if (!grid) return;

  // Toggle Form Visibility
  const openForm = () => {
    if (formCard) {
      formCard.style.display = "block";
      formCard.scrollIntoView({ behavior: "smooth", block: "center" });
      document.getElementById("reviewGuestName")?.focus();
    }
  };

  const closeForm = () => {
    if (formCard) formCard.style.display = "none";
  };

  if (toggleBtn) toggleBtn.addEventListener("click", openForm);
  if (closeBtn) closeBtn.addEventListener("click", closeForm);
  if (cancelBtn) cancelBtn.addEventListener("click", closeForm);

  // Star Rating Click Logic
  const starBtns = document.querySelectorAll("#starRatingSelect .star-btn");
  const ratingInput = document.getElementById("reviewRatingVal");
  const ratingText = document.getElementById("starRatingText");
  const ratingLabels = {
    1: "1.0 - Needs Improvement",
    2: "2.0 - Fair",
    3: "3.0 - Good Experience",
    4: "4.0 - Wonderful Stay",
    5: "5.0 - Exceptional Stay"
  };

  starBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const selectedRating = parseInt(btn.getAttribute("data-rating"), 10);
      if (ratingInput) ratingInput.value = selectedRating;
      if (ratingText) ratingText.textContent = ratingLabels[selectedRating] || `${selectedRating}.0 Stars`;

      starBtns.forEach(s => {
        const r = parseInt(s.getAttribute("data-rating"), 10);
        if (r <= selectedRating) {
          s.classList.add("active");
        } else {
          s.classList.remove("active");
        }
      });
    });
  });

  // Default seed reviews (Warm authentic reviews from Sri Lankan and international guests)
  const defaultReviews = [
    {
      name: "Naveen & Malithi Fernando",
      city: "Colombo, Sri Lanka",
      rating: 5,
      date: "Recent Stay",
      text: "We had a truly peaceful weekend at Heritage Ehelepola Hotel. The thatched garden pavilion is magnificent for afternoon Ceylon tea, the food was delicious, and the staff treated us with genuine Kandyan warmth. Highly recommended!"
    },
    {
      name: "Marcus & Elena Vance",
      city: "Sydney, Australia",
      rating: 5,
      date: "Recent Stay",
      text: "A boutique heritage gem tucked away in the serene hills of Kandy. The antique teak beds, calm courtyard atmosphere, and personal attention to detail made our stay unforgettable."
    },
    {
      name: "Chaminda Jayasuriya",
      city: "Kurunegala, Sri Lanka",
      rating: 5,
      date: "Recent Stay",
      text: "Very calm, quiet, and spotless environment. The night illumination of the villa and the garden lawn terrace are breathtaking. A great place to relax with family."
    }
  ];

  const getSavedReviews = () => {
    try {
      const saved = localStorage.getItem("ehelepola_hotel_reviews");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Could not read localStorage reviews", e);
    }
    return defaultReviews;
  };

  const saveReviews = (reviews) => {
    try {
      localStorage.setItem("ehelepola_hotel_reviews", JSON.stringify(reviews));
    } catch (e) {
      console.warn("Could not save to localStorage", e);
    }
  };

  const getInitials = (name) => {
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const escapeHtml = (str) => {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  };

  const renderReviews = () => {
    const reviews = getSavedReviews();
    grid.innerHTML = "";

    reviews.forEach((rev) => {
      const card = document.createElement("div");
      card.className = "haven-review-card";

      const stars = "★".repeat(rev.rating) + "☆".repeat(5 - rev.rating);
      const initials = getInitials(rev.name);

      card.innerHTML = `
        <div class="haven-quote-icon">“</div>
        <p class="haven-review-text">"${escapeHtml(rev.text)}"</p>
        <div class="haven-review-author">
          <div class="haven-author-info">
            <div class="haven-avatar-initials">${initials}</div>
            <div>
              <div class="haven-author-name">
                ${escapeHtml(rev.name)}
                <span class="haven-review-badge"><i class="fas fa-check-circle"></i> Verified Guest</span>
              </div>
              <div class="haven-author-city">${escapeHtml(rev.city)} • ${rev.date || 'Recent'}</div>
            </div>
          </div>
          <div class="haven-stars">${stars}</div>
        </div>
      `;
      grid.appendChild(card);
    });
  };

  // Form Submit Handler
  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("reviewGuestName")?.value.trim();
      const city = document.getElementById("reviewGuestCity")?.value.trim();
      const rating = parseInt(document.getElementById("reviewRatingVal")?.value || "5", 10);
      const message = document.getElementById("reviewGuestMessage")?.value.trim();

      if (!name || !city || !message) {
        alert("Please complete all required fields.");
        return;
      }

      const newReview = {
        name,
        city,
        rating,
        date: "Just Now",
        text: message
      };

      const currentList = getSavedReviews();
      currentList.unshift(newReview);
      saveReviews(currentList);

      renderReviews();
      form.reset();
      closeForm();

      grid.scrollIntoView({ behavior: "smooth", block: "start" });
      alert("Thank you! Your feedback has been published successfully.");
    });
  }

  // Initial render
  renderReviews();
}

/* -------------------------------------------------------------
 * Discover Section Interactive Gallery Slider
 * ------------------------------------------------------------- */
function initDiscoverGallerySlider() {
  const container = document.getElementById("discoverVisualsGallery");
  if (!container) return;

  const slides = container.querySelectorAll(".discover-slide");
  const thumbs = container.querySelectorAll(".discover-thumb-btn");
  const prevBtn = document.getElementById("discoverPrevBtn");
  const nextBtn = document.getElementById("discoverNextBtn");

  if (!slides.length) return;

  let currentSlide = 0;
  let autoTimer = null;

  const showSlide = (index) => {
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    currentSlide = index;

    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === currentSlide);
    });

    thumbs.forEach((thumb, i) => {
      thumb.classList.toggle("active", i === currentSlide);
    });
  };

  const nextSlide = () => showSlide(currentSlide + 1);
  const prevSlide = () => showSlide(currentSlide - 1);

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      prevSlide();
      restartTimer();
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      nextSlide();
      restartTimer();
    });
  }

  thumbs.forEach(thumb => {
    thumb.addEventListener("click", () => {
      const target = parseInt(thumb.getAttribute("data-target-slide"), 10);
      if (!isNaN(target)) {
        showSlide(target);
        restartTimer();
      }
    });
  });

  const startTimer = () => {
    autoTimer = setInterval(nextSlide, 6000);
  };

  const restartTimer = () => {
    if (autoTimer) clearInterval(autoTimer);
    startTimer();
  };

  container.addEventListener("mouseenter", () => {
    if (autoTimer) clearInterval(autoTimer);
  });

  container.addEventListener("mouseleave", () => {
    restartTimer();
  });

  startTimer();
}

/* -------------------------------------------------------------
 * 14. Hero Background Rotating Slideshow
 * ------------------------------------------------------------- */
function initHeroBackgroundSlider() {
  const container = document.getElementById("heroBgSlideshow");
  if (!container) return;

  const slides = container.querySelectorAll(".haven-hero-slide");
  const dots = document.querySelectorAll("#heroDots .hero-dot");
  const prevBtn = document.getElementById("heroPrevBtn");
  const nextBtn = document.getElementById("heroNextBtn");
  const counter = document.getElementById("heroSlideCounter");

  if (!slides || slides.length < 2) return;

  let currentIndex = 0;
  let autoTimer = null;
  const slideDuration = 6000; // 6 seconds per slide

  const updateSlide = (index) => {
    if (index < 0) index = slides.length - 1;
    if (index >= slides.length) index = 0;
    currentIndex = index;

    slides.forEach((slide, i) => {
      slide.classList.toggle("active", i === currentIndex);
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === currentIndex);
    });

    if (counter) {
      counter.textContent = `0${currentIndex + 1} / 0${slides.length}`;
    }
  };

  const nextSlide = () => updateSlide(currentIndex + 1);
  const prevSlide = () => updateSlide(currentIndex - 1);

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      nextSlide();
      restartTimer();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      prevSlide();
      restartTimer();
    });
  }

  dots.forEach(dot => {
    dot.addEventListener("click", () => {
      const targetIndex = parseInt(dot.getAttribute("data-slide"), 10);
      if (!isNaN(targetIndex)) {
        updateSlide(targetIndex);
        restartTimer();
      }
    });
  });

  const startTimer = () => {
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = setInterval(nextSlide, slideDuration);
  };

  const restartTimer = () => {
    startTimer();
  };

  // Start continuous automatic sliding
  startTimer();
}

/* -------------------------------------------------------------
 * 15. Naturaliza-Style Luxury Dining Carousel
 * ------------------------------------------------------------- */
function initDiningCarouselSlider() {
  const track = document.getElementById("diningCarouselTrack");
  const prevBtn = document.getElementById("diningCarouselPrev");
  const nextBtn = document.getElementById("diningCarouselNext");
  const dotsContainer = document.getElementById("diningCarouselDots");

  if (!track) return;

  const cards = track.querySelectorAll(".dining-luxury-card");
  if (!cards || cards.length === 0) return;

  let currentIndex = 0;
  let autoTimer = null;
  const slideInterval = 5500;

  const getVisibleCount = () => {
    if (window.innerWidth <= 640) return 1;
    if (window.innerWidth <= 991) return 2;
    return 3;
  };

  const getMaxIndex = () => {
    return Math.max(0, cards.length - getVisibleCount());
  };

  const buildDots = () => {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = "";
    const totalDots = getMaxIndex() + 1;
    for (let i = 0; i < totalDots; i++) {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "dining-carousel-dot" + (i === currentIndex ? " active" : "");
      dot.setAttribute("aria-label", "Go to slide " + (i + 1));
      dot.addEventListener("click", () => {
        goToSlide(i);
        restartTimer();
      });
      dotsContainer.appendChild(dot);
    }
  };

  const updateDots = () => {
    if (!dotsContainer) return;
    const dots = dotsContainer.querySelectorAll(".dining-carousel-dot");
    dots.forEach((dot, i) => {
      dot.classList.toggle("active", i === currentIndex);
    });
  };

  const goToSlide = (index) => {
    const maxIdx = getMaxIndex();
    if (index < 0) index = maxIdx;
    if (index > maxIdx) index = 0;
    currentIndex = index;

    const cardWidth = cards[0].offsetWidth;
    const gap = 28;
    const offset = currentIndex * (cardWidth + gap);
    track.style.transform = `translateX(-${offset}px)`;

    updateDots();
  };

  const nextSlide = () => {
    const maxIdx = getMaxIndex();
    if (currentIndex >= maxIdx) {
      goToSlide(0);
    } else {
      goToSlide(currentIndex + 1);
    }
  };

  const prevSlide = () => {
    const maxIdx = getMaxIndex();
    if (currentIndex <= 0) {
      goToSlide(maxIdx);
    } else {
      goToSlide(currentIndex - 1);
    }
  };

  if (nextBtn) {
    nextBtn.addEventListener("click", () => {
      nextSlide();
      restartTimer();
    });
  }

  if (prevBtn) {
    prevBtn.addEventListener("click", () => {
      prevSlide();
      restartTimer();
    });
  }

  const startTimer = () => {
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = setInterval(nextSlide, slideInterval);
  };

  const restartTimer = () => {
    startTimer();
  };

  const wrapper = track.parentElement;
  if (wrapper) {
    wrapper.addEventListener("mouseenter", () => {
      if (autoTimer) clearInterval(autoTimer);
    });
    wrapper.addEventListener("mouseleave", () => {
      restartTimer();
    });

    // Touch swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    wrapper.addEventListener("touchstart", (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    wrapper.addEventListener("touchend", (e) => {
      touchEndX = e.changedTouches[0].screenX;
      if (touchStartX - touchEndX > 50) {
        nextSlide();
        restartTimer();
      } else if (touchEndX - touchStartX > 50) {
        prevSlide();
        restartTimer();
      }
    }, { passive: true });
  }

  window.addEventListener("resize", () => {
    buildDots();
    goToSlide(Math.min(currentIndex, getMaxIndex()));
  });

  buildDots();
  goToSlide(0);
  startTimer();
}
