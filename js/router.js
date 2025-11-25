// Redirect if not logged in
const session =
    JSON.parse(localStorage.getItem("schoolcms-session")) ||
    JSON.parse(sessionStorage.getItem("schoolcms-session"));

if (!session) {
    window.location.href = "login.html";
}

// Fill UI data
document.getElementById("userEmail").textContent = session.email;
document.getElementById("sidebarSchoolName").textContent = session.schoolName;

document.getElementById("logoutBtn").onclick = () => {
    localStorage.removeItem("schoolcms-session");
    sessionStorage.removeItem("schoolcms-session");
    window.location.href = "login.html";
};

// MOBILE SIDEBAR
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");

menuToggle.onclick = () => {
    sidebar.classList.toggle("open");
};
