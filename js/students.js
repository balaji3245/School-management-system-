// ===== LocalStorage helpers =====
const STUDENTS_KEY = "schoolcms-students";

function getStudents() {
  try {
    const raw = localStorage.getItem(STUDENTS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error("Failed to parse students", e);
    return [];
  }
}

function saveStudents(students) {
  localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
}

// Seed demo data on first use
(function seedDemo() {
  if (getStudents().length) return;
  const demo = [
    {
      id: crypto.randomUUID(),
      rollNo: "101",
      name: "Rahul Sharma",
      className: "8",
      section: "A",
      phone: "9876543210",
      feeStatus: "Paid",
      attendance: 92,
      parentName: "Rajesh Sharma",
      parentPhone: "9876500001",
      address: "Sector 12, City",
      dob: "2011-05-12",
      admissionDate: "2020-04-01",
      notes: "House: Blue | Prefect"
    },
    {
      id: crypto.randomUUID(),
      rollNo: "102",
      name: "Priya Verma",
      className: "8",
      section: "B",
      phone: "9876543211",
      feeStatus: "Pending",
      attendance: 88,
      parentName: "Nitin Verma",
      parentPhone: "9876500002",
      address: "MG Road, City",
      dob: "2011-07-22",
      admissionDate: "2020-04-01",
      notes: "Outstanding in science."
    },
    {
      id: crypto.randomUUID(),
      rollNo: "103",
      name: "Arjun Patel",
      className: "7",
      section: "A",
      phone: "9876543212",
      feeStatus: "Partial",
      attendance: 80,
      parentName: "Rohit Patel",
      parentPhone: "9876500003",
      address: "Old Town, City",
      dob: "2012-02-10",
      admissionDate: "2021-04-01",
      notes: "Needs support in maths."
    }
  ];
  saveStudents(demo);
})();

// Utility for query params
function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

// ===== LIST PAGE LOGIC =====
const tableBody = document.getElementById("studentsTableBody");
if (tableBody) {
  const searchInput = document.getElementById("searchStudents");
  const filterClass = document.getElementById("filterClass");
  const filterSection = document.getElementById("filterSection");
  const filterFee = document.getElementById("filterFee");

  const modalBackdrop = document.getElementById("studentModalBackdrop");
  const openModalBtn = document.getElementById("openAddStudentModal");
  const closeModalBtn = document.getElementById("closeStudentModal");
  const cancelModalBtn = document.getElementById("cancelStudentModal");
  const modalTitle = document.getElementById("studentModalTitle");
  const form = document.getElementById("studentForm");

  const fieldId = document.getElementById("studentId");
  const fieldName = document.getElementById("studentName");
  const fieldRoll = document.getElementById("studentRoll");
  const fieldClass = document.getElementById("studentClass");
  const fieldSection = document.getElementById("studentSection");
  const fieldPhone = document.getElementById("studentPhone");
  const fieldFee = document.getElementById("studentFeeStatus");
  const fieldAttendance = document.getElementById("studentAttendance");
  const fieldParentName = document.getElementById("studentParentName");
  const fieldParentPhone = document.getElementById("studentParentPhone");
  const fieldAddress = document.getElementById("studentAddress");
  const fieldDob = document.getElementById("studentDob");
  const fieldAdmission = document.getElementById("studentAdmissionDate");
  const fieldNotes = document.getElementById("studentNotes");

  function openModal(editStudent = null) {
    modalBackdrop.classList.add("open");
    if (editStudent) {
      modalTitle.textContent = "Edit Student";
      fieldId.value = editStudent.id;
      fieldName.value = editStudent.name || "";
      fieldRoll.value = editStudent.rollNo || "";
      fieldClass.value = editStudent.className || "";
      fieldSection.value = editStudent.section || "";
      fieldPhone.value = editStudent.phone || "";
      fieldFee.value = editStudent.feeStatus || "Paid";
      fieldAttendance.value = editStudent.attendance ?? "";
      fieldParentName.value = editStudent.parentName || "";
      fieldParentPhone.value = editStudent.parentPhone || "";
      fieldAddress.value = editStudent.address || "";
      fieldDob.value = editStudent.dob || "";
      fieldAdmission.value = editStudent.admissionDate || "";
      fieldNotes.value = editStudent.notes || "";
    } else {
      modalTitle.textContent = "Add Student";
      form.reset();
      fieldId.value = "";
    }
  }

  function closeModal() {
    modalBackdrop.classList.remove("open");
  }

  [openModalBtn, closeModalBtn, cancelModalBtn].forEach((btn) => {
    if (!btn) return;
    btn.addEventListener("click", () => closeModal());
  });

  modalBackdrop.addEventListener("click", (e) => {
    if (e.target === modalBackdrop) closeModal();
  });

  function badgeForFee(status) {
    const s = (status || "").toLowerCase();
    if (s === "paid") return `<span class="badge badge-paid">Paid</span>`;
    if (s === "pending") return `<span class="badge badge-pending">Pending</span>`;
    if (s === "partial") return `<span class="badge badge-partial">Partial</span>`;
    return `<span class="badge">${status}</span>`;
  }

  function renderTable() {
    const students = getStudents();
    const q = (searchInput.value || "").toLowerCase();
    const cls = filterClass.value;
    const sec = filterSection.value;
    const fee = filterFee.value;

    const filtered = students.filter((s) => {
      if (cls && s.className !== cls) return false;
      if (sec && s.section !== sec) return false;
      if (fee && s.feeStatus !== fee) return false;

      if (q) {
        const hay =
          `${s.rollNo} ${s.name} ${s.className}${s.section}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    tableBody.innerHTML = "";

    if (!filtered.length) {
      const tr = document.createElement("tr");
      const td = document.createElement("td");
      td.colSpan = 8;
      td.textContent = "No students match your filters.";
      td.style.fontSize = "13px";
      td.style.color = "#94a3b8";
      tr.appendChild(td);
      tableBody.appendChild(tr);
      return;
    }

    filtered.forEach((s) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${s.rollNo || ""}</td>
        <td>${s.name || ""}</td>
        <td>${s.className || ""}</td>
        <td>${s.section || ""}</td>
        <td>${s.phone || ""}</td>
        <td>${badgeForFee(s.feeStatus)}</td>
        <td>${s.attendance ?? "-"}%</td>
        <td>
          <button class="btn-link" data-action="view" data-id="${s.id}">View</button>
          |
          <button class="btn-link" data-action="edit" data-id="${s.id}">Edit</button>
          |
          <button class="btn-link" data-action="delete" data-id="${s.id}">Delete</button>
        </td>
      `;

      tableBody.appendChild(tr);
    });
  }

  // Handle actions on table
  tableBody.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const id = btn.getAttribute("data-id");
    const action = btn.getAttribute("data-action");
    const students = getStudents();
    const student = students.find((s) => s.id === id);
    if (!student) return;

    if (action === "view") {
      window.location.href = `student-profile.html?id=${encodeURIComponent(
        id
      )}`;
    } else if (action === "edit") {
      openModal(student);
    } else if (action === "delete") {
      if (confirm(`Delete student "${student.name}"?`)) {
        const remaining = students.filter((s) => s.id !== id);
        saveStudents(remaining);
        renderTable();
      }
    }
  });

  // Form submit
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = fieldId.value || crypto.randomUUID();

    const student = {
      id,
      rollNo: fieldRoll.value.trim(),
      name: fieldName.value.trim(),
      className: fieldClass.value,
      section: fieldSection.value,
      phone: fieldPhone.value.trim(),
      feeStatus: fieldFee.value,
      attendance: fieldAttendance.value
        ? Number(fieldAttendance.value)
        : null,
      parentName: fieldParentName.value.trim(),
      parentPhone: fieldParentPhone.value.trim(),
      address: fieldAddress.value.trim(),
      dob: fieldDob.value || "",
      admissionDate: fieldAdmission.value || "",
      notes: fieldNotes.value.trim()
    };

    const students = getStudents();
    const index = students.findIndex((s) => s.id === id);
    if (index >= 0) {
      students[index] = student;
    } else {
      students.push(student);
    }

    saveStudents(students);
    closeModal();
    renderTable();
  });

  // Filters + search
  [searchInput, filterClass, filterSection, filterFee].forEach((el) => {
    if (!el) return;
    el.addEventListener("input", renderTable);
    el.addEventListener("change", renderTable);
  });

  // initial render
  renderTable();
}

// ===== PROFILE PAGE LOGIC =====
const profileRoot = document.getElementById("studentProfileRoot");
if (profileRoot) {
  const id = getQueryParam("id");
  const students = getStudents();
  const student = students.find((s) => s.id === id);

  if (!student) {
    profileRoot.innerHTML = `<p class="text-muted">Student not found.</p>`;
  } else {
    const initials = student.name
      .split(" ")
      .map((part) => part[0] || "")
      .join("")
      .toUpperCase()
      .slice(0, 2);

    profileRoot.innerHTML = `
      <div class="profile-header">
        <div class="profile-avatar">${initials}</div>
        <div class="profile-header-main">
          <h2>${student.name}</h2>
          <p>Roll no. ${student.rollNo} · Class ${student.className}${
      student.section
    }</p>
          <div class="profile-tags">
            <span class="profile-tag">Fee: ${student.feeStatus}</span>
            <span class="profile-tag">Attendance: ${
              student.attendance ?? "-"
            }%</span>
            <span class="profile-tag">Joined: ${
              student.admissionDate || "—"
            }</span>
          </div>
        </div>
      </div>

      <div class="profile-grid">
        <div class="profile-card">
          <h3>Student details</h3>
          <div class="profile-field">
            <span>Full name</span><span>${student.name || "—"}</span>
          </div>
          <div class="profile-field">
            <span>Roll no.</span><span>${student.rollNo || "—"}</span>
          </div>
          <div class="profile-field">
            <span>Class / Section</span><span>${student.className || "—"}${
      student.section || ""
    }</span>
          </div>
          <div class="profile-field">
            <span>Date of birth</span><span>${student.dob || "—"}</span>
          </div>
          <div class="profile-field">
            <span>Phone</span><span>${student.phone || "—"}</span>
          </div>
          <div class="profile-field">
            <span>Address</span><span>${student.address || "—"}</span>
          </div>
          <div class="profile-field">
            <span>Notes</span><span>${student.notes || "—"}</span>
          </div>
        </div>

        <div class="profile-card">
          <h3>Parent & fee</h3>
          <div class="profile-field">
            <span>Parent name</span><span>${student.parentName || "—"}</span>
          </div>
          <div class="profile-field">
            <span>Parent phone</span><span>${student.parentPhone || "—"}</span>
          </div>
          <div class="profile-field">
            <span>Fee status</span><span>${student.feeStatus || "—"}</span>
          </div>
          <div class="profile-field">
            <span>Attendance</span><span>${student.attendance ?? "—"}%</span>
          </div>
        </div>
      </div>

      <div style="margin-top: 14px;">
        <button class="btn-secondary" onclick="window.history.back()">← Back</button>
        <button class="btn-primary" id="editStudentFromProfile">Edit</button>
      </div>
    `;

    // allow jump to list page edit
    const editBtn = document.getElementById("editStudentFromProfile");
    if (editBtn) {
      editBtn.addEventListener("click", () => {
        window.location.href = `students.html?editId=${encodeURIComponent(id)}`;
      });
    }
  }
}

// If coming from profile with ?editId=..., open edit modal automatically
if (tableBody) {
  const editId = getQueryParam("editId");
  if (editId) {
    const students = getStudents();
    const st = students.find((s) => s.id === editId);
    if (st) {
      // delay until listeners are ready
      setTimeout(() => {
        const modalBackdrop = document.getElementById("studentModalBackdrop");
        const openBtn = document.getElementById("openAddStudentModal");
        if (openBtn && modalBackdrop) {
          // simulate clicking "edit" -> directly open via helper
          // (reuse logic by dispatching a custom event or simply re-run open)
          const btn = document.createElement("button");
          btn.dataset.action = "edit";
          btn.dataset.id = editId;
          const evt = new Event("click", { bubbles: true });
          btn.dispatchEvent(evt);
        }
      }, 50);
    }
  }
}
