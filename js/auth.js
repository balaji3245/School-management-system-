// ===== Helper: toggle password visibility =====
document.querySelectorAll(".auth-toggle-password").forEach((toggle) => {
  toggle.addEventListener("click", () => {
    const targetId = toggle.getAttribute("data-target");
    const input = document.getElementById(targetId);
    if (!input) return;

    const isPassword = input.type === "password";
    input.type = isPassword ? "text" : "password";
    toggle.textContent = isPassword ? "🙈" : "👁️";
  });
});

// ===== Simple "fake backend" using localStorage =====
const STORAGE_KEY = "schoolcms-admin";

/**
 * Returns { email, password, schoolName } or null
 */
function getStoredAdmin() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to parse stored admin", e);
    return null;
  }
}

function saveAdmin({ email, password, schoolName }) {
  const payload = { email, password, schoolName };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

// ===== REGISTER =====
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const school = document.getElementById("regSchool").value.trim();
    const email = document.getElementById("regEmail").value.trim();
    const password = document.getElementById("regPassword").value;
    const confirm = document.getElementById("regConfirm").value;
    const terms = document.getElementById("regTerms").checked;
    const errorBox = document.getElementById("registerError");

    let error = "";
    if (!school || !email || !password || !confirm) {
      error = "Please fill in all fields.";
    } else if (password.length < 6) {
      error = "Password should be at least 6 characters.";
    } else if (password !== confirm) {
      error = "Passwords do not match.";
    } else if (!terms) {
      error = "You must agree to the terms and privacy policy.";
    }

    if (error) {
      errorBox.textContent = error;
      errorBox.style.display = "block";
      return;
    }

    errorBox.style.display = "none";
    saveAdmin({ email, password, schoolName: school });

    alert("Admin account created! Now you can log in.");
    window.location.href = "login.html";
  });
}

// ===== LOGIN =====
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;
    const remember = document.getElementById("rememberMe").checked;
    const errorBox = document.getElementById("loginError");

    const admin = getStoredAdmin();

    if (!admin) {
      errorBox.textContent =
        "No admin account found. Please create an account first.";
      errorBox.style.display = "block";
      return;
    }

    if (email !== admin.email || password !== admin.password) {
      errorBox.textContent = "Invalid email or password.";
      errorBox.style.display = "block";
      return;
    }

    errorBox.style.display = "none";

    // Save a simple "session" flag
    const session = {
      email: admin.email,
      schoolName: admin.schoolName,
      loggedInAt: new Date().toISOString(),
    };
    if (remember) {
      localStorage.setItem("schoolcms-session", JSON.stringify(session));
    } else {
      sessionStorage.setItem("schoolcms-session", JSON.stringify(session));
    }

    // Redirect to dashboard (you'll create dashboard.html later)
    window.location.href = "dashboard.html";
  });
}

// ===== FORGOT PASSWORD (mock) =====
const forgotForm = document.getElementById("forgotForm");
if (forgotForm) {
  forgotForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("forgotEmail").value.trim();
    const errorBox = document.getElementById("forgotError");
    const admin = getStoredAdmin();

    if (!email) {
      errorBox.textContent = "Please enter your email.";
      errorBox.style.display = "block";
      return;
    }

    if (!admin || email !== admin.email) {
      errorBox.textContent =
        "We couldn't find an account with that email (mock check).";
      errorBox.style.display = "block";
      return;
    }

    errorBox.style.display = "none";

    alert(
      "In a real system, a password reset link would be emailed to you. (Mock demo.)"
    );
    window.location.href = "login.html";
  });
}
