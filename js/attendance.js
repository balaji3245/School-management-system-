// Keys
const ATT_KEY = "schoolcms-attendance";

function getAttendance() {
  const raw = localStorage.getItem(ATT_KEY);
  return raw ? JSON.parse(raw) : [];
}

function saveAttendance(list) {
  localStorage.setItem(ATT_KEY, JSON.stringify(list));
}

function getStudents() {
  const raw = localStorage.getItem("schoolcms-students");
  return raw ? JSON.parse(raw) : [];
}

function getClasses() {
  const raw = localStorage.getItem("schoolcms-classes");
  return raw ? JSON.parse(raw) : [];
}

// UI Elements
const classSelect = document.getElementById("attClassSelect");
const sectionSelect = document.getElementById("attSectionSelect");
const dateInput = document.getElementById("attDate");
const loadBtn = document.getElementById("loadAttendanceBtn");
const wrapper = document.getElementById("attendanceTableWrapper");

// Load classes
if (classSelect) {
  const classes = getClasses();
  classSelect.innerHTML = classes
    .map(c => `<option value="${c.id}">${c.name}</option>`)
    .join("");

  if (classes.length) {
    loadSections(classes[0].id);
  }

  classSelect.onchange = () => loadSections(classSelect.value);
}

function loadSections(classId) {
  const cls = getClasses().find(c => c.id === classId);
  if (!cls) return;
  sectionSelect.innerHTML = cls.sections
    .map(sec => `<option value="${sec}">${sec}</option>`)
    .join("");
}

// Load attendance for selected class + section + date
loadBtn.onclick = () => {
  const clsId = classSelect.value;
  const sec = sectionSelect.value;
  const date = dateInput.value;

  if (!date) {
    alert("Please select a date.");
    return;
  }

  loadAttendanceTable(clsId, sec, date);
};

// Load & render table
function loadAttendanceTable(classId, section, date) {
  const students = getStudents().filter(
    s => s.className === getClassNumber(classId) && s.section === section
  );

  const allAtt = getAttendance();
  const dayRecords = allAtt.filter(
    r => r.classId === classId && r.section === section && r.date === date
  );

  wrapper.innerHTML = `
    <div class="attendance-table-wrapper">
      <table class="attendance-table">
        <thead>
          <tr>
            <th>Roll</th>
            <th>Name</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          ${students.map(s => {
            const rec = dayRecords.find(r => r.studentId === s.id);
            const st = rec ? rec.status : "";

            return `
              <tr>
                <td>${s.rollNo}</td>
                <td>${s.name}</td>
                <td>
                  <div class="status-group" data-id="${s.id}">
                    <button class="status-btn present ${st==="Present"?"active":""}">Present</button>
                    <button class="status-btn absent ${st==="Absent"?"active":""}">Absent</button>
                    <button class="status-btn late ${st==="Late"?"active":""}">Late</button>
                  </div>
                </td>
              </tr>
            `;
          }).join("")}
        </tbody>
      </table>
    </div>
  `;

  attachStatusEvents(classId, section, date);
}

// Convert class ID → class number
function getClassNumber(id) {
  const cls = getClasses().find(c => c.id === id);
  if (!cls) return null;
  return cls.name.replace("Class ", "");
}

function attachStatusEvents(classId, section, date) {
  document.querySelectorAll(".status-group").forEach(group => {
    const studentId = group.dataset.id;

    group.querySelectorAll(".status-btn").forEach(btn => {
      btn.onclick = () => {
        const status = btn.classList.contains("present")
          ? "Present"
          : btn.classList.contains("absent")
          ? "Absent"
          : "Late";

        let att = getAttendance();

        const existing = att.find(
          r => r.classId === classId && r.section === section && r.date === date && r.studentId === studentId
        );

        if (existing) {
          existing.status = status;
        } else {
          att.push({
            id: crypto.randomUUID(),
            classId,
            section,
            date,
            studentId,
            status,
          });
        }

        saveAttendance(att);
        loadAttendanceTable(classId, section, date);
      };
    });
  });
}
