const themeToggle = document.getElementById("themeToggle");

function setTheme(mode) {
    if (mode === "dark") {
        document.body.setAttribute("data-theme", "dark");
        localStorage.setItem("sms-theme", "dark");
        themeToggle.textContent = "☀️";
    } else {
        document.body.removeAttribute("data-theme");
        localStorage.setItem("sms-theme", "light");
        themeToggle.textContent = "🌙";
    }
}

const saved = localStorage.getItem("sms-theme");
setTheme(saved || "dark");

themeToggle.onclick = () => {
    const isDark = document.body.getAttribute("data-theme") === "dark";
    setTheme(isDark ? "light" : "dark");
};
