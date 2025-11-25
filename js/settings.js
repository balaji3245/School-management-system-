// KEYS
const SETTINGS_KEY = "schoolcms-settings";

// Default settings
const defaultSettings = {
  schoolName: "My School",
  schoolLogo: "",
  adminEmail: "admin@example.com",
  adminPassword: "",
  themeColor: "#3b82f6",
  fontSize: "14",
  notifications: {
    announcements: true,
    fees: true,
    attendance: false,
  }
};

function getSettings() {
  const raw = localStorage.getItem(SETTINGS_KEY);
  return raw ? JSON.parse(raw) : defaultSettings;
}

function saveSettings(s) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s));
}

const s = getSettings();

// ELEMENTS
const schoolNameInput = document.getElementById("schoolNameInput");
const schoolLogoInput = document.getElementById("schoolLogoInput");

const adminEmailInput = document.getElementById("adminEmailInput");
const adminPasswordInput = document.getElementById("adminPasswordInput");

const themeColorPicker = document.getElementById("themeColorPicker");
const fontSizeSelect = document.getElementById("fontSizeSelect");

const notifAnnouncements = document.getElementById("notifAnnouncements");
const notifFees = document.getElementById("notifFees");
const notifAttendance = document.getElementById("notifAttendance");

// Fill inputs
schoolNameInput.value = s.schoolName;
adminEmailInput.value = s.adminEmail;
themeColorPicker.value = s.themeColor;
fontSizeSelect.value = s.fontSize;

notifAnnouncements.checked = s.notifications.announcements;
notifFees.checked = s.notifications.fees;
notifAttendance.checked = s.notifications.attendance;

// SAVE SCHOOL SETTINGS
document.getElementById("saveSchoolSettings").onclick = () => {
  const updated = getSettings();
  updated.schoolName = schoolNameInput.value;

  const imgFile = schoolLogoInput.files[0];
  if (imgFile) {
    const reader = new FileReader();
    reader.onload = () => {
      updated.schoolLogo = reader.result;
      saveSettings(updated);
      applyVisualSettings();
      alert("School settings saved!");
    };
    reader.readAsDataURL(imgFile);
  } else {
    saveSettings(updated);
    applyVisualSettings();
    alert("School settings saved!");
  }
};

// SAVE ADMIN PROFILE
document.getElementById("saveProfileSettings").onclick = () => {
  const updated = getSettings();
  updated.adminEmail = adminEmailInput.value;

  if (adminPasswordInput.value.trim()) {
    updated.adminPassword = adminPasswordInput.value.trim();
  }

  saveSettings(updated);
  alert("Profile updated!");
};

// SAVE THEME
document.getElementById("applyThemeBtn").onclick = () => {
  const updated = getSettings();

  updated.themeColor = themeColorPicker.value;
  updated.fontSize = fontSizeSelect.value;

  saveSettings(updated);
  applyVisualSettings();

  alert("Theme updated!");
};

// NOTIFICATION SETTINGS
document.getElementById("saveNotifSettings").onclick = () => {
  const updated = getSettings();
  updated.notifications = {
    announcements: notifAnnouncements.checked,
    fees: notifFees.checked,
    attendance: notifAttendance.checked,
  };

  saveSettings(updated);
  alert("Notification preferences saved!");
};

// Apply visual look (color, font, logo, school name)
function applyVisualSettings() {
  const s = getSettings();
  document.documentElement.style.setProperty("--theme-color", s.themeColor);
  document.documentElement.style.fontSize = s.fontSize + "px";

  const nameEls = document.querySelectorAll("#sidebarSchoolName");
  nameEls.forEach((el) => (el.textContent = s.schoolName));

  const logoEls = document.querySelectorAll("#schoolLogo");
  if (s.schoolLogo) {
    logoEls.forEach((el) => {
      el.style.backgroundImage = `url('${s.schoolLogo}')`;
      el.style.backgroundSize = "cover";
      el.style.backgroundPosition = "center";
    });
  }
}

applyVisualSettings();

// RESET SYSTEM
document.getElementById("resetSystemBtn").onclick = () => {
  if (!confirm("Are you sure? ALL DATA WILL BE DELETED.")) return;

  localStorage.clear();
  alert("System reset. Reloading...");
  location.reload();
};
