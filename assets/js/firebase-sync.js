/**
 * ============================================================================
 * Heritage Ehelepola Hotel - Real-Time Firebase Frontend Sync (v10+)
 * Bridges Firebase Firestore live updates to index.html elements:
 * - Hotel Information (Title, Tagline, Hotline, Mobile, Email, About Story)
 * - Dynamic Rooms & Pricing (Rendered directly in LKR with live modal popups)
 * - Safe fallback: Preserves static HTML if Firebase is unconfigured or offline
 * ============================================================================
 */

import {
  db,
  doc,
  collection,
  onSnapshot,
  isFirebaseConfigured
} from "./firebase-config.js";

// Helper: Escape HTML to prevent XSS injection
function escapeHtml(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Helper: Format LKR currency numbers nicely
function formatLKR(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return "LKR 0";
  return "LKR " + Number(amount).toLocaleString("en-US");
}

// ============================================================================
// 1. HOTEL INFORMATION REAL-TIME LISTENER
// ============================================================================
function initHotelInfoSync() {
  if (!db) return;
  const hotelDocRef = doc(db, "settings", "hotelInfo");

  onSnapshot(hotelDocRef, (snap) => {
    if (!snap.exists()) return;
    const data = snap.data();
    if (!data) return;

    // A. Hotel Name & Brand
    if (data.hotelName) {
      // Hero Typewriter text
      const heroTypewriter = document.getElementById("heroTypewriterText");
      if (heroTypewriter) {
        heroTypewriter.textContent = data.hotelName;
      }

      // Ayubowan Frame Brand
      const frameBrand = document.querySelector(".ayubowan-frame-brand");
      if (frameBrand) {
        frameBrand.textContent = data.hotelName;
      }

      // Generic brand class elements
      document.querySelectorAll(".haven-brand-name").forEach((el) => {
        el.textContent = data.hotelName;
      });
    }

    // B. Tagline
    if (data.tagline) {
      const frameTagline = document.querySelector(".ayubowan-frame-tagline");
      if (frameTagline) {
        frameTagline.textContent = data.tagline;
      }
    }

    // C. Phone Hotline (0817008000)
    if (data.phoneHotline) {
      const hotlineEl = document.getElementById("footerHotline");
      if (hotlineEl) {
        hotlineEl.textContent = data.phoneHotline;
        hotlineEl.setAttribute("href", `tel:${data.phoneHotline.replace(/\s+/g, "")}`);
      }

      // Floating call button href
      const callBtn = document.querySelector(".concierge-btn.call-btn");
      if (callBtn) {
        callBtn.setAttribute("href", `tel:${data.phoneHotline.replace(/\s+/g, "")}`);
        callBtn.setAttribute("title", `Call: ${data.phoneHotline}`);
      }
    }

    // D. Phone Mobile / WhatsApp (+94 77 070 0281)
    if (data.phoneMobile) {
      const mobileEl = document.getElementById("footerMobile");
      if (mobileEl) {
        mobileEl.textContent = data.phoneMobile;
        mobileEl.setAttribute("href", `tel:${data.phoneMobile.replace(/\s+/g, "")}`);
      }
    }

    // E. Email Address
    if (data.email) {
      const emailEl = document.getElementById("footerEmail");
      if (emailEl) {
        emailEl.textContent = data.email;
        if (emailEl.tagName.toLowerCase() === "a") {
          emailEl.setAttribute("href", `mailto:${data.email}`);
        }
      }
    }

    // F. Physical Address
    if (data.address) {
      const addressEl = document.getElementById("footerAddress");
      if (addressEl) {
        addressEl.textContent = data.address;
      }
    }

    // G. Ayubowan About Section
    if (data.aboutHeading) {
      const headingEl = document.querySelector(".ayubowan-heading");
      if (headingEl) {
        headingEl.textContent = data.aboutHeading;
      }
    }

    const narrativeParas = document.querySelectorAll(".ayubowan-narrative p");
    if (data.aboutPara1 && narrativeParas[0]) narrativeParas[0].textContent = data.aboutPara1;
    if (data.aboutPara2 && narrativeParas[1]) narrativeParas[1].textContent = data.aboutPara2;
    if (data.aboutPara3 && narrativeParas[2]) narrativeParas[2].textContent = data.aboutPara3;

    console.log("%c[Firebase Sync]%c Hotel Information updated from Firestore.", "color: #d5b287; font-weight: bold;", "color: inherit;");
  }, (err) => {
    console.warn("[Firebase Sync HotelInfo Error]:", err.message);
  });
}

// ============================================================================
// 2. ROOMS & PRICING REAL-TIME LISTENER
// ============================================================================
function initRoomsSync() {
  if (!db) return;
  const roomsColRef = collection(db, "rooms");
  const roomsGrid = document.getElementById("havenRoomsGrid");
  if (!roomsGrid) return;

  onSnapshot(roomsColRef, (snapshot) => {
    // If no rooms have been added in Firestore yet, retain the elegant static markup
    if (!snapshot || snapshot.empty || snapshot.docs.length === 0) {
      return;
    }

    const rooms = [];
    snapshot.forEach((docSnap) => {
      rooms.push({ id: docSnap.id, ...docSnap.data() });
    });

    // Clear and rebuild the grid with live rooms from Firestore
    roomsGrid.innerHTML = "";

    rooms.forEach((room) => {
      const card = document.createElement("div");
      card.className = "haven-room-card view-suite-details";
      card.setAttribute("data-suite-firestore", room.id);
      card.style.cursor = "pointer";
      card.title = `Click to view ${room.title || "Suite"} details`;

      const formattedPrice = room.priceLKR ? formatLKR(room.priceLKR) : "Price on Request";
      const imageUrl = room.imageUrl || "assets/images/royal_suite_real.jpg";
      const floorTag = room.floorTag || "Ground Floor • Royal Sanctuary";
      const bedType = room.bedType || "King Bed";
      const guests = room.guests || "2 Guests";

      card.innerHTML = `
        <div class="haven-room-img-wrap">
          <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(room.title)}" onerror="this.src='assets/images/royal_suite_real.jpg';">
          <span class="haven-room-floor-tag"><i class="fas fa-crown"></i> ${escapeHtml(floorTag)}</span>
          <div class="haven-room-price-badge"><span>From</span> ${escapeHtml(formattedPrice)} <em>/ night</em></div>
        </div>
        <div class="haven-room-body">
          <h3 class="haven-room-title">${escapeHtml(room.title)}</h3>
          <div class="haven-room-meta">
            <span><i class="fas fa-bed"></i> ${escapeHtml(bedType)}</span>
            <span class="meta-dot">•</span>
            <span><i class="fas fa-user-friends"></i> ${escapeHtml(guests)}</span>
            ${room.amenities ? `<span class="meta-dot">•</span><span><i class="fas fa-sparkles"></i> ${escapeHtml(room.amenities)}</span>` : ""}
          </div>
        </div>
      `;

      // Modal open interaction
      card.addEventListener("click", () => {
        openSuiteModalFromData(room);
      });

      roomsGrid.appendChild(card);
    });

    console.log(`%c[Firebase Sync]%c Rendered ${rooms.length} room(s) from Firestore.`, "color: #d5b287; font-weight: bold;", "color: inherit;");
  }, (err) => {
    console.warn("[Firebase Sync Rooms Error]:", err.message);
  });
}

// Helper: Open the Suite Detail Modal with dynamic Firestore Room Data
function openSuiteModalFromData(room) {
  const modal = document.getElementById("suiteDetailModal");
  if (!modal) return;

  const titleEl = document.getElementById("modalSuiteTitle");
  const imgEl = document.getElementById("modalSuiteImg");
  const descEl = document.getElementById("modalSuiteDesc");
  const sizeEl = document.getElementById("modalSuiteSize");
  const guestsEl = document.getElementById("modalSuiteGuests");
  const bedEl = document.getElementById("modalSuiteBed");
  const viewEl = document.getElementById("modalSuiteView");
  const amenitiesList = document.getElementById("modalSuiteAmenities");

  if (titleEl) titleEl.textContent = room.title || "Heritage Suite";
  if (imgEl) {
    imgEl.src = room.imageUrl || "assets/images/royal_suite_real.jpg";
    imgEl.alt = room.title || "Suite Photo";
  }
  if (descEl) descEl.textContent = room.description || "An authentic heritage luxury sanctuary designed for complete relaxation.";
  if (sizeEl) sizeEl.textContent = room.size || "120 m² / Luxury Living";
  if (guestsEl) guestsEl.textContent = room.guests || "2 Guests";
  if (bedEl) bedEl.textContent = room.bedType || "King Bed";
  if (viewEl) viewEl.textContent = room.floorTag || "Garden & Mountain View";

  if (amenitiesList) {
    amenitiesList.innerHTML = "";
    const rawAmenities = room.amenities || "Private Butler, Handcrafted Furniture, High Tea, High-Speed WiFi";
    const items = rawAmenities.split(",").map(s => s.trim()).filter(Boolean);
    items.forEach((item) => {
      const chip = document.createElement("div");
      chip.className = "amenity-chip";
      chip.innerHTML = `<i class="fas fa-check text-gold"></i> ${escapeHtml(item)}`;
      amenitiesList.appendChild(chip);
    });
  }

  // Open booking engine modal when "Reserve Suite" is clicked
  const reserveBtn = document.getElementById("modalReserveSuiteBtn");
  if (reserveBtn) {
    reserveBtn.onclick = () => {
      modal.classList.remove("active");
      const bookingModal = document.getElementById("bookingEngineModal");
      if (bookingModal) {
        bookingModal.classList.add("active");
      }
    };
  }

  modal.classList.add("active");
}

// ============================================================================
// 3. BOOTSTRAPPER
// ============================================================================
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initSync);
} else {
  initSync();
}

function initSync() {
  if (!isFirebaseConfigured()) {
    console.log("%c[Firebase Sync]%c Running with static default content. Configure 'firebase-config.js' to enable live Firestore updates.", "color: #94a3b8;", "color: inherit;");
    return;
  }

  initHotelInfoSync();
  initRoomsSync();
}
