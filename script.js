let students = JSON.parse(localStorage.getItem("students")) || [];

const subjects = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Computer Science",
  "English",
  "Nepali",
  "Social Studies"
];

const subjectInputIDs = {
  "Mathematics": "mathematics",
  "Physics": "physics",
  "Chemistry": "chemistry",
  "Computer Science": "computer",
  "English": "english",
  "Nepali": "nepali",
  "Social Studies": "social"
};

function saveStudents() {
  localStorage.setItem("students", JSON.stringify(students));
}

function generateID() {
  if (students.length === 0) return "STU001";

  let highest = 0;

  students.forEach(student => {
    const number = parseInt(student.id.replace("STU", ""));
    if (number > highest) highest = number;
  });

  return "STU" + String(highest + 1).padStart(3, "0");
}

function getGrade(mark) {
  if (mark >= 80) return "A";
  if (mark >= 70) return "B";
  if (mark >= 60) return "C";
  if (mark >= 50) return "D";
  return "F";
}

function calculateResult(marks) {
  let total = 0;

  subjects.forEach(subject => {
    total += Number(marks[subject]);
  });

  const percentage =
    (total / (subjects.length * 100)) * 100;

  const passed = subjects.every(
    subject => Number(marks[subject]) >= 40
  );

  return {
    total,
    percentage,
    result: passed ? "PASS" : "FAIL",
    overallGrade: getGrade(percentage)
  };
}

function showSection(sectionID) {
  document.querySelectorAll(".section").forEach(section => {
    section.classList.add("hidden");
  });

  const section = document.getElementById(sectionID);

  if (section) {
    section.classList.remove("hidden");
  }

  if (sectionID === "dashboard") {
    updateDashboard();
  }

  if (sectionID === "students") {
    displayStudents();
  }
}

function handleStudentSubmit(event) {
  event.preventDefault();

  const name = document.getElementById("studentName").value.trim();
  const studentClass = document.getElementById("studentClass").value.trim();
  const address = document.getElementById("studentAddress").value.trim();

  const marks = {};

  for (const subject of subjects) {
    const input = document.getElementById(subjectInputIDs[subject]);

    if (!input) {
      alert("Input missing for " + subject);
      return;
    }

    const value = Number(input.value);

    if (input.value === "" || value < 0 || value > 100) {
      alert(subject + " marks must be between 0 and 100.");
      return;
    }

    marks[subject] = value;
  }

  const result = calculateResult(marks);
  const editID = document.getElementById("editId").value;

  if (editID) {
    const index = students.findIndex(
      student => student.id === editID
    );

    if (index !== -1) {
      students[index] = {
        ...students[index],
        name,
        class: studentClass,
        address,
        marks,
        total: result.total,
        percentage: result.percentage,
        result: result.result,
        grade: result.overallGrade
      };
    }

    alert("✅ Student updated successfully.");
  } else {
    const student = {
      id: generateID(),
      name,
      class: studentClass,
      address,
      marks,
      total: result.total,
      percentage: result.percentage,
      result: result.result,
      grade: result.overallGrade
    };

    students.push(student);

    alert(
      "✅ Student added successfully!\n\nStudent ID: " +
      student.id
    );
  }

  saveStudents();
  resetForm();
  updateDashboard();
  showSection("students");
}

function resetForm() {
  const form = document.getElementById("studentForm");

  if (form) {
    form.reset();
  }

  document.getElementById("editId").value = "";
  document.getElementById("formTitle").textContent =
    "➕ Add Student";
}

function displayStudents() {
  const container = document.getElementById("studentList");

  if (!container) return;

  const searchBox = document.getElementById("searchBox");

  const search = searchBox
    ? searchBox.value.toLowerCase().trim()
    : "";

  const filtered = students.filter(student =>
    student.name.toLowerCase().includes(search) ||
    student.id.toLowerCase().includes(search) ||
    student.class.toLowerCase().includes(search)
  );

  document.getElementById("studentCount").textContent =
    students.length +
    (students.length === 1 ? " student" : " students");

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="student-card">
        <p>❌ No students found.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(student => {
    const resultClass =
      student.result === "PASS" ? "pass" : "fail";

    return `
      <div class="student-card">
        <div class="student-info">

          <div>
            <h3>${student.name}</h3>

            <p>🆔 ${student.id}</p>

            <p>🏫 Class: ${student.class}</p>

            <p>
              📊 ${student.percentage.toFixed(2)}%
              | Grade: ${student.grade}
            </p>

            <p class="${resultClass}">
              ${student.result}
            </p>
          </div>

          <div class="student-actions">

            <button
              class="action-button"
              onclick="viewReport('${student.id}')">
              📄 Report
            </button>

            <button
              class="action-button"
              onclick="editStudent('${student.id}')">
              ✏️ Edit
            </button>

            <button
              class="action-button delete-button"
              onclick="deleteStudent('${student.id}')">
              🗑️ Delete
            </button>

          </div>

        </div>
      </div>
    `;
  }).join("");
}

function viewReport(id) {
  const student = students.find(
    student => student.id === id
  );

  if (!student) return;

  let rows = "";

  subjects.forEach(subject => {
    const mark = student.marks[subject];

    rows += `
      <tr>
        <td>${subject}</td>
        <td>${mark}</td>
        <td>${getGrade(mark)}</td>
      </tr>
    `;
  });

  document.getElementById("reportContent").innerHTML = `
    <div class="report-header">
      <h1>🎓 Student Report Card</h1>
      <p>Student Result Management System</p>
    </div>

    <div class="report-details">
      <div>
        <strong>Student ID:</strong>
        ${student.id}
      </div>

      <div>
        <strong>Name:</strong>
        ${student.name}
      </div>

      <div>
        <strong>Class:</strong>
        ${student.class}
      </div>

      <div>
        <strong>Address:</strong>
        ${student.address}
      </div>
    </div>

    <table class="report-table">
      <thead>
        <tr>
          <th>Subject</th>
          <th>Marks</th>
          <th>Grade</th>
        </tr>
      </thead>

      <tbody>
        ${rows}
      </tbody>
    </table>

    <div class="report-summary">

      <p>
        <strong>Total:</strong>
        ${student.total} / ${subjects.length * 100}
      </p>

      <p>
        <strong>Percentage:</strong>
        ${student.percentage.toFixed(2)}%
      </p>

      <p>
        <strong>Overall Grade:</strong>
        ${student.grade}
      </p>

      <p>
        <strong>Result:</strong>
        ${student.result}
      </p>

    </div>
  `;

  document
    .getElementById("reportModal")
    .classList.remove("hidden");
}

function closeReport() {
  document
    .getElementById("reportModal")
    .classList.add("hidden");
}

function editStudent(id) {
  const student = students.find(
    student => student.id === id
  );

  if (!student) return;

  document.getElementById("editId").value = student.id;
  document.getElementById("studentName").value = student.name;
  document.getElementById("studentClass").value = student.class;
  document.getElementById("studentAddress").value = student.address;

  subjects.forEach(subject => {
    const input = document.getElementById(
      subjectInputIDs[subject]
    );

    if (input) {
      input.value = student.marks[subject];
    }
  });

  document.getElementById("formTitle").textContent =
    "✏️ Edit Student";

  showSection("add");
}

function deleteStudent(id) {
  const student = students.find(
    student => student.id === id
  );

  if (!student) return;

  const answer = confirm(
    "Are you sure you want to delete " +
    student.name +
    "?"
  );

  if (!answer) return;

  students = students.filter(
    student => student.id !== id
  );

  saveStudents();
  displayStudents();
  updateDashboard();

  alert("🗑️ Student deleted successfully.");
}

function updateDashboard() {
  const total = students.length;

  const passed = students.filter(
    student => student.result === "PASS"
  ).length;

  const failed = students.filter(
    student => student.result === "FAIL"
  ).length;

  let average = 0;

  if (total > 0) {
    average =
      students.reduce(
        (sum, student) => sum + student.percentage,
        0
      ) / total;
  }

  document.getElementById("totalStudents").textContent = total;
  document.getElementById("passedStudents").textContent = passed;
  document.getElementById("failedStudents").textContent = failed;

  document.getElementById("averagePercentage").textContent =
    average.toFixed(2) + "%";

  const topStudent =
    document.getElementById("topStudent");

  if (students.length === 0) {
    topStudent.innerHTML =
      "No student records yet.";
    return;
  }

  const top = [...students].sort(
    (a, b) => b.percentage - a.percentage
  )[0];

  topStudent.innerHTML = `
    <h3>${top.name}</h3>
    <p>🆔 ${top.id}</p>
    <p>📊 ${top.percentage.toFixed(2)}%</p>
    <p>🏆 Grade ${top.grade}</p>
  `;
}


/* FORM SUBMISSION */

document.addEventListener("DOMContentLoaded", function () {

  const form = document.getElementById("studentForm");

  if (form) {
    form.addEventListener(
      "submit",
      handleStudentSubmit
    );
  }

  updateDashboard();
  showSection("dashboard");

});
