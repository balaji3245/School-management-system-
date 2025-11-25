// Keys
const TIMETABLE_KEY = "schoolcms-timetable";

function getTimetable() {
  const raw = localStorage.getItem(TIMETABLE_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveTimetable(tt) {
  localStorage.setItem(TIMETABLE_KEY, JSON.stringify(tt));
}

function getClasses() {
  const raw = localStorage.getItem("schoolcms-classes");
  return raw ? JSON.parse(raw) : [];
}

function getTeachers() {
  const raw = localStorage.getItem("schoolcms-teachers");
  return raw ? JSON.parse(raw) : [];
}

// Populate class dropdown
const classSelect = document.getElementById("timetableClassSelect");
const gridWrapper = document.getElementById("timetableGridWrapper");

if (classSelect) {
  const classes = getClasses();
  classSelect.innerHTML = classes
    .map(c => `<option value="${c.id}">${c.name}</option>`)
    .join("");

  if (classes.length) {
    classSelect.value = classes[0].id;
    renderTimetable(classes[0].id);
  }

  classSelect.onchange = () => {
    renderTimetable(classSelect.value);
  };
}

function renderTimetable(classId) {
  const tt = getTimetable().filter(p => p.classId === classId);

  const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const periods = [1,2,3,4,5,6,7];

  let html = `<div class="timetable-grid">
  <table class="timetable-table">
    <thead>
      <tr>
        <th>Day</th>
        ${periods.map(p => `<th>Period ${p}</th>`).join("")}
      </tr>
    </thead>
    <tbody>`;

  for (let day of days) {
    html += `<tr><td>${day}</td>`;

    for (let p of periods) {
      const period = tt.find(x => x.day === day && x.period == p);

      html += `<td>
        <div class="timetable-cell">
          ${
      period
        ? `<div class="timetable-period">
               <strong>${period.subject}</strong><br>
               <small>${period.teacherName}</small>
               <span class="btn-period" data-edit="${period.id}">Edit</span>
               <span class="btn-period" data-delete="${period.id}">Delete</span>
           </div>`
        : ""
    }

          <span class="add-period-btn" data-add="${day}-${p}">+ Add</span>
        </div>
      </td>`;
    }

    html += `</tr>`;
  }

  html += `</tbody></table></div>`;

  gridWrapper.innerHTML = html;
  attachCellEvents(classId);
}

// EVENTS FOR ADD / EDIT / DELETE
function attachCellEvents(classId) {
  document.querySelectorAll("[data-add]").forEach(btn => {
    btn.onclick = () => {
      const [day, period] = btn.dataset.add.split("-");
      openPeriodModal({ classId, day, period });
    };
  });

  document.querySelectorAll("[data-edit]").forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.edit;
      const p = getTimetable().find(x => x.id === id);
      openPeriodModal(p);
    };
  });

  document.querySelectorAll("[data-delete]").forEach(btn => {
    btn.onclick = () => {
      const id = btn.dataset.delete;
      if (confirm("Delete this period?")) {
        saveTimetable(getTimetable().filter(x => x.id !== id));
        renderTimetable(classSelect.value);
      }
    };
  });
}

// MODAL
const modalBackdrop = document.getElementById("periodModalBackdrop");
const closeModalBtn = document.getElementById("closePeriodModal");
const cancelBtn = document.getElementById("cancelPeriodModal");

const form = document.getElementById("periodForm");
const fieldId = document.getElementById("periodId");
const fieldDay = document.getElementById("periodDay");
const fieldNumber = document.getElementById("periodNumber");
const fieldSubject = document.getElementById("periodSubject");
const fieldTeacher = document.getElementById("periodTeacher");

function loadTeachers() {
  const teachers = getTeachers();
  fieldTeacher.innerHTML = teachers
    .map(t => `<option value="${t.id}">${t.name} (${t.subject})</option>`)
    .join("");
}
loadTeachers();

function openPeriodModal(data) {
  modalBackdrop.classList.add("open");

  if (data.id) {
    // Editing
    document.getElementById("periodModalTitle").textContent = "Edit Period";
    fieldId.value = data.id;
    fieldDay.value = data.day;
    fieldNumber.value = data.period;
    fieldSubject.value = data.subject;
    fieldTeacher.value = data.teacherId;
  } else {
    // New
    document.getElementById("periodModalTitle").textContent = "Add Period";
    form.reset();
    fieldId.value = "";
    fieldDay.value = data.day;
    fieldNumber.value = data.period;
  }

  form.dataset.classId = data.classId;
}

function closePeriodModal() {
  modalBackdrop.classList.remove("open");
}

closeModalBtn.onclick = closePeriodModal;
cancelBtn.onclick = closePeriodModal;

modalBackdrop.onclick = (e) => {
  if (e.target === modalBackdrop) closePeriodModal();
};

// SAVE PERIOD
form.onsubmit = (e) => {
  e.preventDefault();

  const id = fieldId.value || crypto.randomUUID();
  const classId = form.dataset.classId;

  const teachers = getTeachers();
  const teacher = teachers.find(t => t.id === fieldTeacher.value);

  const periodObj = {
    id,
    classId,
    day: fieldDay.value,
    period: fieldNumber.value,
    subject: fieldSubject.value,
    teacherId: teacher.id,
    teacherName: teacher.name
  };

  let tt = getTimetable();
  const idx = tt.findIndex(x => x.id === id);

  if (idx >= 0) tt[idx] = periodObj;
  else tt.push(periodObj);

  saveTimetable(tt);
  closePeriodModal();
  renderTimetable(classSelect.value);
};
