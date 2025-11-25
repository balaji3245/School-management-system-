// Simple chart example (no external libs needed)
const canvas = document.getElementById("attendanceChart");
const ctx = canvas.getContext("2d");

function drawBar(x, height, label) {
    ctx.fillStyle = "#2563eb";
    ctx.fillRect(x, 150 - height, 40, height);

    ctx.fillStyle = "#94a3b8";
    ctx.fillText(label, x + 10, 170);
}

ctx.font = "12px sans-serif";
drawBar(20, 120, "Mon");
drawBar(80, 130, "Tue");
drawBar(140, 110, "Wed");
drawBar(200, 125, "Thu");
drawBar(260, 140, "Fri");
