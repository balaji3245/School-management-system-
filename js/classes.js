// ===== Helper Getters =====
const CLASS_KEY = "schoolcms-classes";

function getClasses() {
  const raw = localStorage.getItem(CLASS_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveClasses(list) {
  localStorage.setItem(CLASS_KEY, JSON.stringify(list));
}

function getTeachersList() {
  const raw = localStorage.getItem("schoolcms-teachers");
  return raw ? JSON.parse(raw) : [];
}

function getStudentsList() {
  const raw = localStorage.getItem("schoolcms-students");
  return raw ? JSON.parse(raw) : [];
}

// Seed basic classes
(function seed() {
  if (getClasses().length) return;
  const basic = [
    {
      id: crypto.randomUUID(),
      name: "Class 6",
      sections: ["A", "B"],
      teacherId: "",
    },
    {
      id: crypto.randomUUID(),
      name: "Class 7",
      sections: ["A", "B", "C"],
      teacherId: "",
    }
  ];
  saveClasses(basic);
})();

// Query param helper
function qp(name) {
  return new URLSearchParams(location.search).get(name);
}

/* ==========================================
   CLASSES LIST PAGE
========================================== */
const classesTableBody = document.getElementById("classesTableBody");

if (classesTableBody) {

  const modalBackdrop = document.getElementById("classModalBackdrop");
  const openModalBtn = document.getElementById("openClassModal");
  const closeModalBtn = document.getElementById("closeClassModal");
  const cancelModalBtn = document.getElementById("cancelClassModal");

  const form = document.getElementById("classForm");
  const titleEl = document.getElementById("classModalTitle");

  const fieldId = document.getElementById("classId");
  const fieldName = document.getElementById("className");
  const fieldSections = document.getElementById("classSections");
  const fieldTeacher = document.getElementById("classTeacher");

  function loadTeacherOptions() {
    const teachers = getTeachersList();
    fieldTeacher.innerHTML = `<option value="">None</option>`;
    teachers.forEach(t => {
      fieldTeacher.innerHTML += `<option value="${t.id}">${t.name} (${t.subject})</option>`;
    });
  }

  loadTeacherOptions();

  function openModal(cls = null) {
    modalBackdrop.classList.add("open");
    if (cls) {
      titleEl.textContent = "Edit Class";
      fieldId.value = cls.id;
      fieldName.value = cls.name;
      fieldSections.value = cls.sections.join(", ");
      fieldTeacher.value = cls.teacherId || "";
    } else {
      titleEl.textContent = "Add Class";
      form.reset();
      fieldId.value = "";
    }
  }

  function closeModal() {
    modalBackdrop.classList.remove("open");
  }

  [openModalBtn, closeModalBtn, cancelModalBtn].forEach(btn => {
    if (btn) btn.addEventListener("click", closeModal);
  });

  modalBackdrop.addEventListener("click", e => {
    if (e.target === modalBackdrop) closeModal();
  });

  function renderClasses() {
    const list = getClasses();
    const students = getStudentsList();
    const teachers = getTeachersList();

    classesTableBody.innerHTML = "";

    list.forEach(cls => {
      const sectionBadges = cls.sections
        .map(s => `<span class="section-badge">${s}</span>`)
        .join("");

      const teacher = teachers.find(t => t.id === cls.teacherId);

      const studentCount = students.filter(
        s => s.className === cls.name.replace("Class ", "")
      ).length;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${cls.name}</td>
        <td>${sectionBadges}</td>
        <td>${teacher ? teacher.name : "-"}</td>
        <td>${studentCount}</td>
        <td>
          <button class="btn-link" data-action="view" data-id="${cls.id}">View</button>
          |
          <button class="btn-link" data-action="edit" data-id="${cls.id}">Edit</button>
          |
          <button class="btn-link" data-action="delete" data-id="${cls.id}">Delete</button>
        </td>
      `;
      classesTableBody.appendChild(tr);
    });
  }

  classesTableBody.addEventListener("click", e => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;

    const id = btn.dataset.id;
    const action = btn.dataset.action;
    const list = getClasses();
    const cls = list.find(c => c.id === id);

    if (!cls) return;

    if (action === "view") {
      location.href = `class-view.html?id=${id}`;
    } else if (action === "edit") {
      openModal(cls);
    } else if (action === "delete") {
      if (confirm(`Delete ${cls.name}?`)) {
        saveClasses(list.filter(c => c.id !== id));
        renderClasses();
      }
    }
  });

  form.addEventListener("submit", e => {
    e.preventDefault();
    const id = fieldId.value || crypto.randomUUID();
    const name = fieldName.value.trim();
    const sections = fieldSections.value
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    const teacherId = fieldTeacher.value;

    const newCls = {
      id,
      name,
      sections,
      teacherId,
    };

    let list = getClasses();
    const index = list.findIndex(c => c.id === id);
    if (index >= 0) list[index] = newCls;
    else list.push(newCls);

    saveClasses(list);
    closeModal();
    renderClasses();
    loadTeacherOptions();
  });

  renderClasses();
}

/* ==========================================
   CLASS VIEW PAGE
========================================== */
const classViewRoot = document.getElementById("classViewRoot");

if (classViewRoot) {
  const id = qp("id");
  const list = getClasses();
  const cls = list.find(c => c.id === id);

  if (!cls) {
    classViewRoot.innerHTML = `<p class="text-muted">Class not found.</p>`;
  } else {
    const teachers = getTeachersList();
    const teacher = teachers.find(t => t.id === cls.teacherId);

    const students = getStudentsList().filter(
      s => s.className === cls.name.replace("Class ", "")
    );

    classViewRoot.innerHTML = `
      <div class="class-info-box">
        <h2>${cls.name}</h2>
        <p class="text-muted">Manage sections, teacher & students.</p>

        <div class="class-info-grid">

          <div class="class-subcard">
            <h3>Sections</h3>
            <p>${cls.sections.map(s => `<span class="section-badge">${s}</span>`).join("")}</p>
          </div>

          <div class="class-subcard">
            <h3>Class Teacher</h3>
            <p>${teacher ? teacher.name : "-"}</p>
          </div>

        </div>
      </div>

      <div class="students-in-class">
        <h2>Students (${students.length})</h2>

        <div class="students-list">
          <table>
            <thead>
            <tr>
              <th>Roll</th>
              <th>Name</th>
              <th>Section</th>
              <th>Fee</th>
            </tr>
            </thead>

            <tbody>
            ${students
      .map(
        s => `
                <tr>
                  <td>${s.rollNo}</td>
                  <td><a class="btn-link" href="student-profile.html?id=${s.id}">${s.name}</a></td>
                  <td>${s.section}</td>
                  <td>${s.feeStatus}</td>
                </tr>`
      )
      .join("")}
            </tbody>
          </table>
        </div>

        <div style="margin-top:14px;">
          <button class="btn-secondary" onclick="history.back()">← Back</button>
        </div>

      </div>
    `;
  }
}
