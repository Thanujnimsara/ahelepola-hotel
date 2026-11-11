/**
 * ============================================================================
 * Heritage Ehelepola Hotel - Admin Dashboard Controller (Firebase v10+)
 * Features:
 * - Email & Password Authentication (Login / Logout / Session Management)
 * - Real-time Hotel Information Management (Firestore: settings/hotelInfo)
 * - Real-time Room CRUD Management (Firestore: rooms collection)
 * - Live Toast Notifications & Image Preview
 * ============================================================================
 */

import {
  auth,
  db,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  isFirebaseConfigured
} from "./firebase-config.js";

// ============================================================================
// 1. STATE & CONSTANTS
// ============================================================================
let currentUser = null;
let editingRoomId = null;
let unsubscribeHotelInfo = null;
let unsubscribeRooms = null;

// Default hotel information seed
const DEFAULT_HOTEL_INFO = {
  hotelName: "HERITAGE EHELEPOLA HOTEL",
  tagline: "The Royal Sanctuary of Kandy",
  phoneHotline: "0817008000",
  phoneMobile: "+94 77 070 0281",
  email: "info@ehelepolahotel.lk",
  address: "No. 103, Pichchamalwaththa Handiya, Ehelepolawaththa, Gurudeniya, Kandy",
  aboutHeading: "Ayubowan To Heritage Ehelepola",
  aboutPara1: "Step into a sanctuary where timeless aristocratic elegance meets the enchanting serenity of Sri Lanka's historic hill capital. Nestled amidst the verdant misty hills and the storied heritage of Ehelepolawaththa in Gurudeniya, Heritage Ehelepola Hotel is an intimate luxury retreat that seamlessly blends noble Kandyan history with gracious contemporary comfort.",
  aboutPara2: "Our boutique sanctuary is thoughtfully designed to embrace the tranquil harmony of its hillside surroundings, offering panoramic mountain vistas, exquisite antique architecture, and an ambiance of effortless peace. Every detail—from our handcrafted royal suites and private garden pavilions to our attentive personalized butler service—is crafted to indulge the discerning traveler seeking both pure luxury and authentic cultural wonder.",
  aboutPara3: "At Heritage Ehelepola, our dedicated team ensures your every comfort is attended to with genuine warmth, allowing you to unwind and immerse yourself in a world of calm and rejuvenation. Whether you join us for a restful weekend escape or an extended cultural retreat, you will be welcomed with authentic Kandyan hospitality and the warmest \"Ayubowan\" that makes you feel truly at home.",
  updatedAt: new Date().toISOString()
};

// ============================================================================
// 2. DOM ELEMENTS
// ============================================================================
const elements = {
  // Login Screen
  loginOverlay: document.getElementById("adminLoginOverlay"),
  loginForm: document.getElementById("adminLoginForm"),
  loginEmail: document.getElementById("adminLoginEmail"),
  loginPassword: document.getElementById("adminLoginPassword"),
  loginBtn: document.getElementById("adminLoginBtn"),
  loginAlert: document.getElementById("loginAlert"),
  passwordToggle: document.getElementById("passwordToggleBtn"),

  // Main Dashboard
  adminApp: document.getElementById("adminApp"),
  userEmailDisplay: document.getElementById("adminUserEmail"),
  logoutBtn: document.getElementById("adminLogoutBtn"),
  connectionStatus: document.getElementById("connectionStatusPill"),

  // Tabs
  tabButtons: document.querySelectorAll(".tab-btn"),
  tabPanels: document.querySelectorAll(".tab-panel"),

  // Hotel Info Form
  hotelInfoForm: document.getElementById("hotelInfoForm"),
  hotelNameInput: document.getElementById("hotelNameInput"),
  hotelTaglineInput: document.getElementById("hotelTaglineInput"),
  hotelHotlineInput: document.getElementById("hotelHotlineInput"),
  hotelMobileInput: document.getElementById("hotelMobileInput"),
  hotelEmailInput: document.getElementById("hotelEmailInput"),
  hotelAddressInput: document.getElementById("hotelAddressInput"),
  aboutHeadingInput: document.getElementById("aboutHeadingInput"),
  aboutPara1Input: document.getElementById("aboutPara1Input"),
  aboutPara2Input: document.getElementById("aboutPara2Input"),
  aboutPara3Input: document.getElementById("aboutPara3Input"),
  saveHotelInfoBtn: document.getElementById("saveHotelInfoBtn"),
  seedHotelInfoBtn: document.getElementById("seedHotelInfoBtn"),

  // Rooms Form & Grid
  roomForm: document.getElementById("roomForm"),
  roomFormTitle: document.getElementById("roomFormTitle"),
  roomTitleInput: document.getElementById("roomTitleInput"),
  roomPriceLKRInput: document.getElementById("roomPriceLKRInput"),
  roomFloorTagInput: document.getElementById("roomFloorTagInput"),
  roomBedTypeInput: document.getElementById("roomBedTypeInput"),
  roomGuestsInput: document.getElementById("roomGuestsInput"),
  roomAmenitiesInput: document.getElementById("roomAmenitiesInput"),
  roomImageUrlInput: document.getElementById("roomImageUrlInput"),
  roomImagePresetSelect: document.getElementById("roomImagePresetSelect"),
  roomImagePreview: document.getElementById("roomImagePreview"),
  roomDescriptionInput: document.getElementById("roomDescriptionInput"),
  saveRoomBtn: document.getElementById("saveRoomBtn"),
  cancelEditBtn: document.getElementById("cancelEditBtn"),
  roomsGrid: document.getElementById("roomsAdminGrid"),
  seedRoomsBtn: document.getElementById("seedRoomsBtn"),

  // Toasts
  toastWrap: document.getElementById("adminToastWrap")
};

// ============================================================================
// 3. INITIALIZATION & AUTHENTICATION STATE
// ============================================================================
document.addEventListener("DOMContentLoaded", () => {
  initPasswordToggle();
  initTabNavigation();
  initImagePreviewSync();
  initFormListeners();

  // Check Firebase configuration
  if (!isFirebaseConfigured()) {
    showLoginAlert("Notice: Firebase keys in 'firebase-config.js' are currently placeholder values. Please add your Firebase Project credentials to connect Firestore.", "info");
    updateStatusPill(false, "Config Required");
  }

  // Monitor Authentication State
  if (auth) {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        currentUser = user;
        onUserLoggedIn(user);
      } else {
        currentUser = null;
        onUserLoggedOut();
      }
    });
  }
});

// ============================================================================
// 4. AUTHENTICATION HANDLERS
// ============================================================================
function onUserLoggedIn(user) {
  if (elements.loginOverlay) elements.loginOverlay.style.display = "none";
  if (elements.adminApp) elements.adminApp.style.display = "flex";
  if (elements.userEmailDisplay) elements.userEmailDisplay.textContent = user.email || "Admin User";
  
  updateStatusPill(true, "Online & Connected");
  showToast(`Welcome back, ${user.email}`, "success");

  // Subscribe to real-time Firestore listeners
  subscribeToHotelInfo();
  subscribeToRooms();
}

function onUserLoggedOut() {
  if (elements.loginOverlay) elements.loginOverlay.style.display = "flex";
  if (elements.adminApp) elements.adminApp.style.display = "none";
  
  updateStatusPill(false, "Signed Out");

  // Unsubscribe from active Firestore listeners
  if (unsubscribeHotelInfo) { unsubscribeHotelInfo(); unsubscribeHotelInfo = null; }
  if (unsubscribeRooms) { unsubscribeRooms(); unsubscribeRooms = null; }
}

// Password toggle helper
function initPasswordToggle() {
  if (!elements.passwordToggle || !elements.loginPassword) return;
  elements.passwordToggle.addEventListener("click", () => {
    const isPassword = elements.loginPassword.getAttribute("type") === "password";
    elements.loginPassword.setAttribute("type", isPassword ? "text" : "password");
    elements.passwordToggle.innerHTML = isPassword ? '<i class="fas fa-eye-slash"></i>' : '<i class="fas fa-eye"></i>';
  });
}

// Login Form Submit
if (elements.loginForm) {
  elements.loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    hideLoginAlert();

    const email = elements.loginEmail.value.trim();
    const password = elements.loginPassword.value;

    if (!email || !password) {
      showLoginAlert("Please enter both your email address and password.", "error");
      return;
    }

    if (!isFirebaseConfigured()) {
      showLoginAlert("Firebase configuration is missing! Open 'firebase-config.js' and insert your Firebase Project API keys.", "error");
      return;
    }

    setBtnLoading(elements.loginBtn, true, "Verifying Credentials...");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle UI transition
    } catch (err) {
      console.error("[Login Error]:", err);
      let message = "Failed to sign in. Please verify your email and password.";
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        message = "Invalid email or password. Please try again.";
      } else if (err.code === "auth/user-not-found") {
        message = "No admin user found with this email. Please register this user in Firebase Authentication.";
      } else if (err.code === "auth/too-many-requests") {
        message = "Too many failed attempts. Please wait a few moments and try again.";
      }
      showLoginAlert(message, "error");
    } finally {
      setBtnLoading(elements.loginBtn, false, '<i class="fas fa-sign-in-alt"></i> Sign In to Dashboard');
    }
  });
}

// Logout Button Click
if (elements.logoutBtn) {
  elements.logoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
      showToast("Signed out successfully.", "info");
    } catch (err) {
      console.error("[Logout Error]:", err);
      showToast("Error signing out: " + err.message, "error");
    }
  });
}

// ============================================================================
// 5. NAVIGATION TABS
// ============================================================================
function initTabNavigation() {
  elements.tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const targetTab = btn.getAttribute("data-tab");
      
      elements.tabButtons.forEach(b => b.classList.remove("active"));
      elements.tabPanels.forEach(p => p.classList.remove("active"));

      btn.classList.add("active");
      const targetPanel = document.getElementById(targetTab);
      if (targetPanel) targetPanel.classList.add("active");
    });
  });
}

// ============================================================================
// 6. HOTEL INFORMATION MANAGER (FIRESTORE: settings/hotelInfo)
// ============================================================================
function subscribeToHotelInfo() {
  if (!db) return;
  const hotelDocRef = doc(db, "settings", "hotelInfo");

  unsubscribeHotelInfo = onSnapshot(hotelDocRef, (snap) => {
    if (snap.exists()) {
      const data = snap.data();
      populateHotelInfoForm(data);
    } else {
      console.log("[Firestore]: No settings/hotelInfo document found yet. Click 'Seed Defaults' to initialize.");
    }
  }, (err) => {
    console.warn("[Firestore HotelInfo Listener Warning]:", err.message);
  });
}

function populateHotelInfoForm(data) {
  if (!data) return;
  if (elements.hotelNameInput) elements.hotelNameInput.value = data.hotelName || "";
  if (elements.hotelTaglineInput) elements.hotelTaglineInput.value = data.tagline || "";
  if (elements.hotelHotlineInput) elements.hotelHotlineInput.value = data.phoneHotline || "";
  if (elements.hotelMobileInput) elements.hotelMobileInput.value = data.phoneMobile || "";
  if (elements.hotelEmailInput) elements.hotelEmailInput.value = data.email || "";
  if (elements.hotelAddressInput) elements.hotelAddressInput.value = data.address || "";
  if (elements.aboutHeadingInput) elements.aboutHeadingInput.value = data.aboutHeading || "";
  if (elements.aboutPara1Input) elements.aboutPara1Input.value = data.aboutPara1 || "";
  if (elements.aboutPara2Input) elements.aboutPara2Input.value = data.aboutPara2 || "";
  if (elements.aboutPara3Input) elements.aboutPara3Input.value = data.aboutPara3 || "";
}

// Save Hotel Info
if (elements.hotelInfoForm) {
  elements.hotelInfoForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!db) {
      showToast("Firebase Firestore is not initialized.", "error");
      return;
    }

    setBtnLoading(elements.saveHotelInfoBtn, true, "Saving to Firestore...");

    const hotelData = {
      hotelName: elements.hotelNameInput.value.trim(),
      tagline: elements.hotelTaglineInput.value.trim(),
      phoneHotline: elements.hotelHotlineInput.value.trim(),
      phoneMobile: elements.hotelMobileInput.value.trim(),
      email: elements.hotelEmailInput.value.trim(),
      address: elements.hotelAddressInput.value.trim(),
      aboutHeading: elements.aboutHeadingInput.value.trim(),
      aboutPara1: elements.aboutPara1Input.value.trim(),
      aboutPara2: elements.aboutPara2Input.value.trim(),
      aboutPara3: elements.aboutPara3Input.value.trim(),
      updatedAt: serverTimestamp ? serverTimestamp() : new Date().toISOString()
    };

    try {
      await setDoc(doc(db, "settings", "hotelInfo"), hotelData, { merge: true });
      showToast("Hotel Information saved successfully! Website updated in real-time.", "success");
    } catch (err) {
      console.error("[Save Hotel Info Error]:", err);
      showToast("Failed to save: " + err.message, "error");
    } finally {
      setBtnLoading(elements.saveHotelInfoBtn, false, '<i class="fas fa-save"></i> Save Changes to Live Website');
    }
  });
}

// Seed Default Hotel Info button
if (elements.seedHotelInfoBtn) {
  elements.seedHotelInfoBtn.addEventListener("click", async () => {
    if (!confirm("This will prefill the form with official Heritage Ehelepola Hotel details. Proceed?")) return;
    populateHotelInfoForm(DEFAULT_HOTEL_INFO);
    showToast("Default info loaded into form. Click 'Save Changes' to push to Firestore.", "info");
  });
}

// ============================================================================
// 7. ROOMS & PRICING MANAGER (FIRESTORE: rooms collection)
// ============================================================================
function subscribeToRooms() {
  if (!db) return;
  const roomsColRef = collection(db, "rooms");

  unsubscribeRooms = onSnapshot(roomsColRef, (snapshot) => {
    const rooms = [];
    snapshot.forEach((docSnap) => {
      rooms.push({ id: docSnap.id, ...docSnap.data() });
    });

    renderRoomsGrid(rooms);
  }, (err) => {
    console.warn("[Firestore Rooms Listener Warning]:", err.message);
  });
}

function renderRoomsGrid(rooms) {
  if (!elements.roomsGrid) return;
  elements.roomsGrid.innerHTML = "";

  if (!rooms || rooms.length === 0) {
    elements.roomsGrid.innerHTML = `
      <div class="rooms-empty-state">
        <i class="fas fa-bed"></i>
        <h4>No Custom Rooms in Firestore Yet</h4>
        <p>Use the form above to add your first room, or click 'Seed Default 3 Suites' below to instantly populate your live website with the authentic suites.</p>
        <button type="button" class="btn-secondary-admin" id="seedRoomsEmptyBtn">
          <i class="fas fa-magic"></i> Seed Default 3 Royal Suites
        </button>
      </div>
    `;
    const emptySeedBtn = document.getElementById("seedRoomsEmptyBtn");
    if (emptySeedBtn) emptySeedBtn.addEventListener("click", seedDefaultRooms);
    return;
  }

  rooms.forEach((room) => {
    const card = document.createElement("div");
    card.className = "room-admin-card";
    card.setAttribute("data-room-id", room.id);

    // Format price in LKR
    const formattedPrice = formatLKR(room.priceLKR);
    const imageUrl = room.imageUrl || "assets/images/royal_suite_real.jpg";

    card.innerHTML = `
      <div class="room-card-thumb-wrap">
        <img src="${escapeHtml(imageUrl)}" alt="${escapeHtml(room.title)}" class="room-card-thumb" onerror="this.src='assets/images/royal_suite_real.jpg';">
        <span class="room-card-floor-badge"><i class="fas fa-crown"></i> ${escapeHtml(room.floorTag || "Royal Suite")}</span>
        <span class="room-card-price-badge">${formattedPrice} <small>/ night</small></span>
      </div>
      <div class="room-card-body">
        <h4 class="room-card-title">${escapeHtml(room.title)}</h4>
        <div class="room-card-meta">
          <span><i class="fas fa-bed"></i> ${escapeHtml(room.bedType || "King Bed")}</span>
          <span><i class="fas fa-user-friends"></i> ${escapeHtml(room.guests || "2 Guests")}</span>
          ${room.amenities ? `<span><i class="fas fa-sparkles"></i> ${escapeHtml(room.amenities)}</span>` : ""}
        </div>
        <p class="room-card-desc">${escapeHtml(room.description || "")}</p>
        <div class="room-card-actions">
          <button type="button" class="btn-card-edit" data-edit-id="${room.id}">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button type="button" class="btn-card-delete" data-delete-id="${room.id}" data-title="${escapeHtml(room.title)}">
            <i class="fas fa-trash-alt"></i> Delete
          </button>
        </div>
      </div>
    `;

    // Attach edit listener
    const editBtn = card.querySelector(".btn-card-edit");
    if (editBtn) {
      editBtn.addEventListener("click", () => editRoom(room));
    }

    // Attach delete listener
    const deleteBtn = card.querySelector(".btn-card-delete");
    if (deleteBtn) {
      deleteBtn.addEventListener("click", () => confirmDeleteRoom(room.id, room.title));
    }

    elements.roomsGrid.appendChild(card);
  });
}

// Room Form Submit (Add or Update)
if (elements.roomForm) {
  elements.roomForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!db) {
      showToast("Firebase Firestore is not initialized.", "error");
      return;
    }

    const title = elements.roomTitleInput.value.trim();
    const priceLKR = parseFloat(elements.roomPriceLKRInput.value) || 0;
    const imageUrl = elements.roomImageUrlInput.value.trim();
    const floorTag = elements.roomFloorTagInput.value.trim();
    const bedType = elements.roomBedTypeInput.value.trim();
    const guests = elements.roomGuestsInput.value.trim();
    const amenities = elements.roomAmenitiesInput.value.trim();
    const description = elements.roomDescriptionInput.value.trim();

    if (!title) {
      showToast("Please provide a room title.", "error");
      return;
    }

    setBtnLoading(elements.saveRoomBtn, true, editingRoomId ? "Updating Room..." : "Saving New Room...");

    const roomPayload = {
      title,
      priceLKR,
      imageUrl: imageUrl || "assets/images/royal_suite_real.jpg",
      floorTag: floorTag || "Luxury Wing",
      bedType: bedType || "Royal Teak Bed",
      guests: guests || "2 Guests",
      amenities,
      description,
      updatedAt: serverTimestamp ? serverTimestamp() : new Date().toISOString()
    };

    try {
      if (editingRoomId) {
        // Update existing
        await updateDoc(doc(db, "rooms", editingRoomId), roomPayload);
        showToast(`Room "${title}" updated successfully!`, "success");
      } else {
        // Create new
        roomPayload.createdAt = serverTimestamp ? serverTimestamp() : new Date().toISOString();
        await addDoc(collection(db, "rooms"), roomPayload);
        showToast(`New room "${title}" added to live website!`, "success");
      }

      resetRoomForm();
    } catch (err) {
      console.error("[Save Room Error]:", err);
      showToast("Failed to save room: " + err.message, "error");
    } finally {
      setBtnLoading(elements.saveRoomBtn, false, editingRoomId ? '<i class="fas fa-check"></i> Update Room' : '<i class="fas fa-plus-circle"></i> Add Room to Website');
    }
  });
}

// Edit room handler
function editRoom(room) {
  editingRoomId = room.id;
  
  if (elements.roomFormTitle) elements.roomFormTitle.textContent = `Edit Room: ${room.title}`;
  if (elements.roomTitleInput) elements.roomTitleInput.value = room.title || "";
  if (elements.roomPriceLKRInput) elements.roomPriceLKRInput.value = room.priceLKR || "";
  if (elements.roomImageUrlInput) elements.roomImageUrlInput.value = room.imageUrl || "";
  if (elements.roomFloorTagInput) elements.roomFloorTagInput.value = room.floorTag || "";
  if (elements.roomBedTypeInput) elements.roomBedTypeInput.value = room.bedType || "";
  if (elements.roomGuestsInput) elements.roomGuestsInput.value = room.guests || "";
  if (elements.roomAmenitiesInput) elements.roomAmenitiesInput.value = room.amenities || "";
  if (elements.roomDescriptionInput) elements.roomDescriptionInput.value = room.description || "";

  updateImagePreview(room.imageUrl);

  if (elements.saveRoomBtn) elements.saveRoomBtn.innerHTML = '<i class="fas fa-check"></i> Update Room';
  if (elements.cancelEditBtn) elements.cancelEditBtn.style.display = "inline-flex";

  // Scroll smoothly to form
  elements.roomForm.scrollIntoView({ behavior: "smooth", block: "start" });
}

// Cancel Edit Button
if (elements.cancelEditBtn) {
  elements.cancelEditBtn.addEventListener("click", () => {
    resetRoomForm();
    showToast("Editing cancelled.", "info");
  });
}

function resetRoomForm() {
  editingRoomId = null;
  if (elements.roomForm) elements.roomForm.reset();
  if (elements.roomFormTitle) elements.roomFormTitle.textContent = "Add New Room / Suite";
  if (elements.saveRoomBtn) elements.saveRoomBtn.innerHTML = '<i class="fas fa-plus-circle"></i> Add Room to Website';
  if (elements.cancelEditBtn) elements.cancelEditBtn.style.display = "none";
  updateImagePreview("");
}

// Delete room handler
async function confirmDeleteRoom(roomId, title) {
  const confirmed = confirm(`Are you sure you want to permanently delete "${title}"? This cannot be undone.`);
  if (!confirmed) return;

  try {
    await deleteDoc(doc(db, "rooms", roomId));
    showToast(`Room "${title}" deleted from live website.`, "success");
    if (editingRoomId === roomId) resetRoomForm();
  } catch (err) {
    console.error("[Delete Room Error]:", err);
    showToast("Failed to delete room: " + err.message, "error");
  }
}

// ============================================================================
// 8. IMAGE PRESET SELECTOR & PREVIEW
// ============================================================================
function initImagePreviewSync() {
  if (elements.roomImagePresetSelect) {
    elements.roomImagePresetSelect.addEventListener("change", (e) => {
      const selected = e.target.value;
      if (selected) {
        elements.roomImageUrlInput.value = selected;
        updateImagePreview(selected);
      }
    });
  }

  if (elements.roomImageUrlInput) {
    elements.roomImageUrlInput.addEventListener("input", (e) => {
      updateImagePreview(e.target.value.trim());
    });
  }
}

function updateImagePreview(url) {
  if (!elements.roomImagePreview) return;
  if (url) {
    elements.roomImagePreview.innerHTML = `<img src="${escapeHtml(url)}" alt="Preview" class="image-preview-img" onerror="this.onerror=null; this.src='assets/images/royal_suite_real.jpg';">`;
  } else {
    elements.roomImagePreview.innerHTML = `
      <div class="image-preview-placeholder">
        <i class="fas fa-image"></i>
        <span>Image preview will appear here</span>
      </div>
    `;
  }
}

// ============================================================================
// 9. SEED DEFAULT ROOMS HELPER
// ============================================================================
async function seedDefaultRooms() {
  if (!confirm("This will add the 3 authentic Heritage Ehelepola suites (Royal Heritage Suite, Courtyard Terrace Lounge, Heritage Garden Pavilion) into Firestore. Continue?")) return;

  const defaultRooms = [
    {
      title: "Royal Heritage Suite",
      priceLKR: 165000,
      imageUrl: "assets/images/royal_suite_real.jpg",
      floorTag: "1st Floor • Royal Wing",
      bedType: "Dual Teak Beds",
      guests: "4 Guests",
      amenities: "Butler • Balcony • Luxury Bath",
      description: "Noble dual-bedroom suite honoring Kandyan royal craftsmanship with panoramic garden terraces, hand-carved mahogany headboards and 24/7 personal butler service.",
      order: 1
    },
    {
      title: "Courtyard Terrace Lounge",
      priceLKR: 98000,
      imageUrl: "assets/images/terrace_dining_lounge.jpg",
      floorTag: "Ground Floor • Courtyard",
      bedType: "King Bed",
      guests: "2 Guests",
      amenities: "Private Dining • Lawn Terrace • High Tea",
      description: "Open-air heritage dining salon opening to lush manicured tea lawns, perfect for high tea and tranquil evening relaxation.",
      order: 2
    },
    {
      title: "Heritage Garden Pavilion",
      priceLKR: 120000,
      imageUrl: "assets/images/garden_gazebo_pavilion.jpg",
      floorTag: "Ground Floor • Garden Sanctuary",
      bedType: "Canopy King Bed",
      guests: "2 Guests",
      amenities: "Thatched Cabana • Mango Grove • Open-Air",
      description: "Thatched outdoor garden cabana nestled amidst mango groves and misty hillside breezes for a truly authentic Ceylon stay.",
      order: 3
    }
  ];

  try {
    for (const r of defaultRooms) {
      r.createdAt = serverTimestamp ? serverTimestamp() : new Date().toISOString();
      await addDoc(collection(db, "rooms"), r);
    }
    showToast("Default suites added to Firestore! Check your live website.", "success");
  } catch (err) {
    console.error("[Seed Rooms Error]:", err);
    showToast("Failed to seed rooms: " + err.message, "error");
  }
}

if (elements.seedRoomsBtn) {
  elements.seedRoomsBtn.addEventListener("click", seedDefaultRooms);
}

// ============================================================================
// 10. UI HELPERS & UTILITIES
// ============================================================================
function showLoginAlert(msg, type = "error") {
  if (!elements.loginAlert) return;
  elements.loginAlert.className = `login-alert alert-${type}`;
  elements.loginAlert.innerHTML = `<i class="fas fa-exclamation-circle"></i> <span>${escapeHtml(msg)}</span>`;
  elements.loginAlert.style.display = "flex";
}

function hideLoginAlert() {
  if (elements.loginAlert) elements.loginAlert.style.display = "none";
}

function updateStatusPill(isOnline, text) {
  if (!elements.connectionStatus) return;
  elements.connectionStatus.className = `status-pill ${isOnline ? "online" : "offline"}`;
  elements.connectionStatus.innerHTML = `<span class="status-dot"></span> <span>${escapeHtml(text)}</span>`;
}

function setBtnLoading(btn, isLoading, text) {
  if (!btn) return;
  btn.disabled = isLoading;
  btn.innerHTML = isLoading ? `<i class="fas fa-spinner fa-spin"></i> ${text}` : text;
}

export function showToast(message, type = "info") {
  if (!elements.toastWrap) return;

  const toast = document.createElement("div");
  toast.className = `admin-toast toast-${type}`;
  
  let icon = "fa-info-circle";
  if (type === "success") icon = "fa-check-circle";
  if (type === "error") icon = "fa-exclamation-triangle";

  toast.innerHTML = `<i class="fas ${icon}"></i> <span>${escapeHtml(message)}</span>`;
  elements.toastWrap.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 350);
  }, 4200);
}

function formatLKR(amount) {
  if (!amount && amount !== 0) return "LKR -";
  const num = typeof amount === "number" ? amount : parseFloat(amount);
  if (isNaN(num)) return `LKR ${escapeHtml(amount)}`;
  return `LKR ${num.toLocaleString("en-LK")}`;
}

function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function initFormListeners() {
  // Any extra real-time form validation
}

