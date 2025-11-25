// KEYS
const FEE_STRUCT_KEY = "schoolcms-fee-structure";
const PAYMENTS_KEY = "schoolcms-payments";

// Helpers
function getStudents() {
  return JSON.parse(localStorage.getItem("schoolcms-students")) || [];
}
function getClasses() {
  return JSON.parse(localStorage.getItem("schoolcms-classes")) || [];
}

function getStructure() {
  return JSON.parse(localStorage.getItem(FEE_STRUCT_KEY)) || {};
}
function saveStructure(obj) {
  localStorage.setItem(FEE_STRUCT_KEY, JSON.stringify(obj));
}

function getPayments() {
  return JSON.parse(localStorage.getItem(PAYMENTS_KEY)) || [];
}
function savePayments(list) {
  localStorage.setItem(PAYMENTS_KEY, JSON.stringify(list));
}

// === LOAD FEE STRUCTURE TABLE ===
const structBody = document.getElementById("feeStructureBody");
const saveStructBtn = document.getElementById("saveFeeStructureBtn");

if (structBody) {
  const classes = getClasses();
  const struct = getStructure();

  structBody.innerHTML = classes
    .map(cls => {
      const cnum = cls.name.replace("Class ", "");
      const row = struct[cnum] || { tuition:0, transport:0, exam:0 };

      return `
        <tr data-class="${cnum}">
          <td>${cls.name}</td>
          <td><input type="number" value="${row.tuition}" class="fs-tuition"></td>
          <td><input type="number" value="${row.transport}" class="fs-transport"></td>
          <td><input type="number" value="${row.exam}" class="fs-exam"></td>
        </tr>
      `;
    })
    .join("");

  saveStructBtn.onclick = () => {
    const rows = document.querySelectorAll("#feeStructureBody tr");
    let newStruct = {};

    rows.forEach(r => {
      const c = r.dataset.class;
      newStruct[c] = {
        tuition: Number(r.querySelector(".fs-tuition").value),
        transport: Number(r.querySelector(".fs-transport").value),
        exam: Number(r.querySelector(".fs-exam").value),
      };
    });

    saveStructure(newStruct);
    alert("Fee structure saved!");
    loadStudentFees();
  };
}

// === STUDENT FEES TABLE ===
const body = document.getElementById("feesStudentsBody");

function loadStudentFees() {
  if (!body) return;

  const std = getStudents();
  const struct = getStructure();
  const payments = getPayments();

  let totalCollected = 0;
  let totalDue = 0;

  body.innerHTML = std
    .map(s => {
      const classFee = struct[s.className] || { tuition:0, transport:0, exam:0 };
      const total = classFee.tuition + classFee.transport + classFee.exam;

      const paid = payments
        .filter(p => p.studentId === s.id)
        .reduce((sum, p) => sum + p.amount, 0);

      const due = total - paid;

      totalCollected += paid;
      totalDue += due;

      const status =
        due <= 0
          ? `<span class="badge-paid">Paid</span>`
          : `<span class="badge-due">Due</span>`;

      return `
        <tr>
          <td>${s.rollNo}</td>
          <td>${s.name}</td>
          <td>${s.className}${s.section}</td>
          <td>₹${total}</td>
          <td>₹${paid}</td>
          <td>₹${due}</td>
          <td>${status}</td>
          <td>
            <button class="btn-link" data-pay="${s.id}">Pay</button>
            |
            <button class="btn-link" data-history="${s.id}">History</button>
          </td>
        </tr>`;
    })
    .join("");

  // Update Stats
  document.getElementById("feeCollected").textContent = "₹" + totalCollected;
  document.getElementById("feeDue").textContent = "₹" + totalDue;

  const percent = totalCollected + totalDue === 0
    ? 0
    : Math.round((totalCollected / (totalCollected + totalDue)) * 100);

  document.getElementById("feePercent").textContent = percent + "%";

  attachFeeEvents();
}

loadStudentFees();

// === PAYMENT MODAL ===
const modalBackdrop = document.getElementById("paymentModalBackdrop");
const closeModal = document.getElementById("closePaymentModal");
const cancelModal = document.getElementById("cancelPaymentModal");
const payInfo = document.getElementById("paymentInfo");
const payForm = document.getElementById("paymentForm");

let currentStudent = null;

function openPayModal(student) {
  currentStudent = student;

  const struct = getStructure()[student.className] || { tuition:0, transport:0, exam:0 };
  const total = struct.tuition + struct.transport + struct.exam;

  const paid = getPayments()
    .filter(p => p.studentId === student.id)
    .reduce((a,b) => a + b.amount, 0);

  const due = total - paid;

  payInfo.innerHTML = `
    <p><strong>${student.name}</strong> (${student.className}${student.section})</p>
    <p>Total Fee: <strong>₹${total}</strong></p>
    <p>Paid: <strong>₹${paid}</strong></p>
    <p>Remaining: <strong>₹${due}</strong></p>
    <hr>
  `;

  modalBackdrop.classList.add("open");
}

function closePayModal() {
  modalBackdrop.classList.remove("open");
}

closeModal.onclick = closePayModal;
cancelModal.onclick = closePayModal;

// Attach table events
function attachFeeEvents() {
  document.querySelectorAll("[data-pay]").forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.pay;
      const s = getStudents().find(x => x.id === id);
      openPayModal(s);
    };
  });

  document.querySelectorAll("[data-history]").forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.history;
      showPaymentHistory(id);
    };
  });
}

// Save payment
payForm.onsubmit = e => {
  e.preventDefault();

  const amount = Number(document.getElementById("paymentAmount").value);
  const note = document.getElementById("paymentNote").value;

  const payments = getPayments();
  payments.push({
    id: crypto.randomUUID(),
    studentId: currentStudent.id,
    amount,
    note,
    date: new Date().toISOString().split("T")[0],
  });

  savePayments(payments);
  closePayModal();
  loadStudentFees();

  // Generate receipt
  localStorage.setItem("receipt-temp", JSON.stringify({
    schoolName: document.getElementById("sidebarSchoolName").textContent,
    name: currentStudent.name,
    roll: currentStudent.rollNo,
    class: currentStudent.className + currentStudent.section,
    amount,
    date: new Date().toLocaleDateString(),
    note
  }));

  window.open("receipt.html", "_blank");
};

// Payment history
function showPaymentHistory(studentId) {
  const s = getStudents().find(x => x.id === studentId);
  const list = getPayments().filter(p => p.studentId === studentId);

  let message = `Payment History for ${s.name}:\n\n`;

  list.forEach(p => {
    message += `${p.date} — ₹${p.amount} (${p.note || "No note"})\n`;
  });

  if (!list.length) message += "No payments made.";

  alert(message);
}
