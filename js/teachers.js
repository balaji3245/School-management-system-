// ===== LocalStorage Helpers =====
const TEACHERS_KEY = "schoolcms-teachers";

function getTeachers() {
  try {
    const raw = localStorage.getItem(TEACHERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("Parse error", e);
    return [];
  }
}

function saveTeachers(list) {
  localStorage.setItem(TEACHERS_KEY, JSON.stringify(list));
}

// Seed sample data if empty
(function seedTeachers() {
  if (getTeachers().length > 0) return;
  const demo = [
    {
      id: crypto.randomUUID(),
      name: "Anita Rao",
      code: "T101",
      subject: "Maths",
      classAssigned: "8",
      phone: "9876500001",
      email: "anita@school.com",
      education: "M.Sc Mathematics",
      joinDate: "2018-04-20",
      notes: "Maths Olympiad mentor"
    },
    {
      id: crypto.randomUUID(),
      name: "Ravi Sharma",
      code: "T102",
      subject: "Science",
      classAssigned: "9",
      phone: "9876500002",
      email: "ravi@school.com",
      education: "M.Sc Physics",
      joinDate: "2019-06-14",
      notes: ""
    }
  ];
  saveTeachers(demo);
})();

// Query param
function qp(name) {
  return new URLSearchParams(location.search).get(name);
}

const tableBody = document.getElementById("teachersTableBody");
if (tableBody) {
  const filterSubject = document.getElementById("filterSubject");
  const filterTClass = document.getElementById("filterTClass");
  const searchInput = document.getElementById("searchTeachers");

  const modalBackdrop = document.getElementById("teacherModalBackdrop");
  const openBtn = document.getElementById("openTeacherModal");
  const closeBtn = document.getElementById("closeTeacherModal");
  const cancelBtn = document.getElementById("cancelTeacherModal");
  const form = document.getElementById("teacherForm");

  const titleEl = document.getElementById("teacherModalTitle");

  const fieldId = document.getElementById("teacherId");
  const fieldName = document.getElementById("teacherName");
  const fieldCode = document.getElementById("teacherCode");
  const fieldSubject = document.getElementById("teacherSubject");
  const fieldClass = document.getElementById("teacherClass");
  const fieldPhone = document.getElementById("teacherPhone");
  const fieldEmail = document.getElementById("teacherEmail");
  const fieldEducation = document.getElementById("teacherEducation");
  const fieldJoinDate = document.getElementById("teacherJoinDate");
  const fieldNotes = document.getElementById("teacherNotes");

  function openModal(teacher = null) {
    modalBackdrop.classList.add("open");
    if (teacher) {
      titleEl.textContent = "Edit Teacher";
      fieldId.value = teacher.id;
      fieldName.value = teacher.name;
      fieldCode.value = teacher.code;
      fieldSubject.value = teacher.subject;
      fieldClass.value = teacher.classAssigned;
      fieldPhone.value = teacher.phone || "";
      fieldEmail.value = teacher.email || "";
      fieldEducation.value = teacher.education || "";
      fieldJoinDate.value = teacher.joinDate || "";
      fieldNotes.value = teacher.notes || "";
    } else {
      titleEl.textContent = "Add Teacher";
      form.reset();
      fieldId.value = "";
    }
  }

  function closeModal() {
    modalBackdrop.classList.remove("open");
  }

  [openBtn, closeBtn, cancelBtn].forEach((btn) => {
    btn.addEventListener("click", closeModal);
  });

  modalBackdrop.addEventListener("click", (e) => {
    if (e.target === modalBackdrop) closeModal();
  });

  function renderTable() {
    const list = getTeachers();
    const q = (searchInput.value || "").toLowerCase();
    const subject = filterSubject.value;
    const cls = filterTClass.value;

    const filtered = list.filter((t) => {
      if (subject && t.subject !== subject) return false;
      if (cls && t.classAssigned !== cls) return false;
      if (q) {
        const hay = `${t.name} ${t.code}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    tableBody.innerHTML = "";

    if (!filtered.length) {
      tableBody.innerHTML =
        `<tr><td colspan="6" style="color:#94a3b8;">No teachers found.</td></tr>`;
      return;
    }

    filtered.forEach((t) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${t.code}</td>
        <td>${t.name}</td>
        <td>${t.subject}</td>
        <td>${t.classAssigned || "-"}</td>
        <td>${t.phone || "-"}</td>
        <td>
          <button class="btn-link" data-action="view" data-id="${t.id}">View</button>
          |
          <button class="btn-link" data-action="edit" data-id="${t.id}">Edit</button>
          |
          <button class="btn-link" data-action="delete" data-id="${t.id}">Delete</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  }

  tableBody.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const id = btn.dataset.id;
    const action = btn.dataset.action;
    const list = getTeachers();
    const teacher = list.find((t) => t.id === id);

    if (action === "view") {
      location.href = `teacher-profile.html?id=${id}`;
    } else if (action === "edit") {
      openModal(teacher);
    } else if (action === "delete") {
      if (confirm(`Delete teacher "${teacher.name}"?`)) {
        saveTeachers(list.filter((t) => t.id !== id));
        renderTable();
      }
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = fieldId.value || crypto.randomUUID();

    const teacher = {
      id,
      name: fieldName.value.trim(),
      code: fieldCode.value.trim(),
      subject: fieldSubject.value,
      classAssigned: fieldClass.value,
      phone: fieldPhone.value.trim(),
      email: fieldEmail.value.trim(),
      education: fieldEducation.value.trim(),
      joinDate: fieldJoinDate.value,
      notes: fieldNotes.value.trim(),
    };

    let list = getTeachers();
    const index = list.findIndex((t) => t.id === id);
    if (index >= 0) list[index] = teacher;
    else list.push(teacher);

    saveTeachers(list);
    closeModal();
    renderTable();
  });

  [searchInput, filterSubject, filterTClass].forEach((el) => {
    el.addEventListener("input", renderTable);
    el.addEventListener("change", renderTable);
  });

  renderTable();
}

// === PROFILE PAGE ===
const profileRoot = document.getElementById("teacherProfileRoot");
if (profileRoot) {
  const id = qp("id");
  const list = getTeachers();
  const t = list.find((x) => x.id === id);

  if (!t) {
    profileRoot.innerHTML = `<p class="text-muted">Teacher not found.</p>`;
  } else {
    const initials = t.name.split(" ").map(s => s[0]).join("").toUpperCase().slice(0,2);

    profileRoot.innerHTML = `
      <div class="profile-header">
        <div class="profile-avatar">${initials}</div>
        <div class="profile-header-main">
          <h2>${t.name}</h2>
          <p>${t.code} · ${t.subject}</p>
          <div class="profile-tags">
            <span class="profile-tag">Subject: ${t.subject}</span>
            <span class="profile-tag">Class: ${t.classAssigned || "-"}</span>
            <span class="profile-tag">Joined: ${t.joinDate || "-"}</span>
          </div>
        </div>
      </div>

      <div class="profile-grid">

        <div class="profile-card">
          <h3>Teacher Details</h3>

          <div class="profile-field">
            <span>Name</span><span>${t.name}</span>
          </div>
          <div class="profile-field">
            <span>ID</span><span>${t.code}</span>
          </div>
          <div class="profile-field">
            <span>Subject</span><span>${t.subject}</span>
          </div>
          <div class="profile-field">
            <span>Class assigned</span><span>${t.classAssigned || "-"}</span>
          </div>
          <div class="profile-field">
            <span>Education</span><span>${t.education || "-"}</span>
          </div>
          <div class="profile-field">
            <span>Joining Date</span><span>${t.joinDate || "-"}</span>
          </div>
          <div class="profile-field">
            <span>Notes</span><span>${t.notes || "-"}</span>
          </div>
        </div>

        <div class="profile-card">
          <h3>Contact</h3>
          <div class="profile-field">
            <span>Phone</span><span>${t.phone || "-"}</span>
          </div>
          <div class="profile-field">
            <span>Email</span><span>${t.email || "-"}</span>
          </div>
        </div>

      </div>

      <div style="margin-top:14px;">
        <button class="btn-secondary" onclick="history.back()">← Back</button>
        <button class="btn-primary" id="editTeacherBtn">Edit</button>
      </div>
    `;

    document.getElementById("editTeacherBtn").onclick = () => {
      location.href = `teachers.html?editId=${id}`;
    };
  }
}
