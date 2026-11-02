/*
 * CLASS ATTENDANCE MANAGEMENT SYSTEM
 * Main JavaScript file.
 *
 * This is a front-end academic prototype. Data is stored in the browser
 * with LocalStorage. For real multi-user deployment, connect a backend
 * and database and replace the demo login with secure authentication.
 */

// ------------------------------------------------------------
// 1. Demo data and application state
// ------------------------------------------------------------

const DEFAULT_DATA = {
    teacher: "Saleh Mohammod Maruf",
    department: "Computer Science & Engineering",
    semester: "6th Semester",
    students: [
        { id: "NU-2301", name: "Ayesha Rahman", department: "Computer Science & Engineering" },
        { id: "NU-2302", name: "Sabbir Hossain", department: "Computer Science & Engineering" },
        { id: "NU-2303", name: "Nusrat Jahan", department: "Computer Science & Engineering" },
        { id: "NU-2304", name: "Tanvir Ahmed", department: "Computer Science & Engineering" },
        { id: "NU-2305", name: "Farhan Islam", department: "Computer Science & Engineering" },
        { id: "NU-2306", name: "Mim Akter", department: "Computer Science & Engineering" },
        { id: "NU-2307", name: "Rakib Hasan", department: "Computer Science & Engineering" },
        { id: "NU-2308", name: "Sadia Sultana", department: "Computer Science & Engineering" }
    ],
    courses: [
        {
            id: "CSE-601",
            name: "Software Engineering",
            department: "Computer Science & Engineering",
            time: "Sun · 10:00–11:30 AM"
        },
        {
            id: "CSE-602",
            name: "Operating Systems",
            department: "Computer Science & Engineering",
            time: "Mon · 11:30 AM–1:00 PM"
        },
        {
            id: "CSE-603",
            name: "Computer Networks",
            department: "Computer Science & Engineering",
            time: "Wed · 10:00–11:30 AM"
        }
    ],
    // Attendance is stored by "COURSE-ID|YYYY-MM-DD".
    records: {}
};

const STORAGE_KEY = "attendEaseData";
let appData = loadData();
let attendanceDraft = {};

// ------------------------------------------------------------
// 2. Small helper functions
// ------------------------------------------------------------

function getElement(id) {
    return document.getElementById(id);
}

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[character]);
}

function getInitials(name) {
    return name.trim().split(/\s+/).slice(0, 2)
        .map(part => part[0]).join("").toUpperCase();
}

function getToday() {
    const now = new Date();
    const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
    return localDate.toISOString().slice(0, 10);
}

function showToast(message) {
    getElement("toastContainer").innerHTML = `<div class="toast">${escapeHTML(message)}</div>`;
    window.setTimeout(() => {
        getElement("toastContainer").innerHTML = "";
    }, 2500);
}

function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
}

function loadData() {
    try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
            return { ...DEFAULT_DATA, ...JSON.parse(savedData) };
        }
    } catch (error) {
        console.error("Could not load saved application data:", error);
    }

    return structuredClone(DEFAULT_DATA);
}

function getCourseName(courseId) {
    const course = appData.courses.find(item => item.id === courseId);
    return course ? course.name : courseId;
}

function getCourseSessions(courseId) {
    return Object.entries(appData.records)
        .filter(([key]) => key.startsWith(`${courseId}|`));
}

function getAttendanceRate(values) {
    if (values.length === 0) return 0;

    const attended = values.filter(status =>
        status === "Present" || status === "Late"
    ).length;

    return Math.round((attended / values.length) * 100);
}

function getOverallAttendanceRate() {
    const allStatuses = Object.values(appData.records)
        .flatMap(session => Object.values(session));

    return getAttendanceRate(allStatuses);
}

// ------------------------------------------------------------
// 3. Login and navigation
// ------------------------------------------------------------

function handleLogin(event) {
    event.preventDefault();

    const username = getElement("username").value.trim().toLowerCase();
    const password = getElement("password").value;

    // Demo credentials only. Do not use this as production authentication.
    if (username === "teacher" && password === "1234") {
        getElement("loginScreen").classList.add("hidden");
        getElement("app").classList.remove("hidden");
        renderApplication();
    } else {
        showToast("Invalid login. Use teacher / 1234.");
    }
}

function handleLogout() {
    getElement("app").classList.add("hidden");
    getElement("loginScreen").classList.remove("hidden");
    getElement("password").value = "";
}

function showPage(pageName) {
    document.querySelectorAll(".page").forEach(page => {
        page.classList.add("hidden");
    });

    getElement(`${pageName}Page`).classList.remove("hidden");

    document.querySelectorAll(".nav-link").forEach(button => {
        button.classList.toggle("active", button.dataset.page === pageName);
    });

    const pageTitles = {
        dashboard: "Dashboard",
        attendance: "Take Attendance",
        students: "Students",
        courses: "Courses",
        reports: "Semester Report"
    };

    getElement("currentPageName").textContent = pageTitles[pageName];

    if (pageName === "attendance") loadAttendance();
    if (pageName === "reports") renderReport();
}

function setupNavigation() {
    document.querySelectorAll(".nav-link").forEach(button => {
        button.addEventListener("click", () => showPage(button.dataset.page));
    });

    document.querySelectorAll("[data-go]").forEach(button => {
        button.addEventListener("click", () => showPage(button.dataset.go));
    });
}

// ------------------------------------------------------------
// 4. Dashboard
// ------------------------------------------------------------

function renderDashboard() {
    getElement("teacherName").textContent = appData.teacher;
    getElement("teacherAvatar").textContent = getInitials(appData.teacher);

    getElement("totalStudents").textContent = appData.students.length;
    getElement("totalCourses").textContent = appData.courses.length;
    getElement("totalSessions").textContent = Object.keys(appData.records).length;
    getElement("averageAttendance").textContent = `${getOverallAttendanceRate()}%`;

    renderDashboardCourses();
    renderRecentAttendance();
    renderClassInformation();
}

function renderDashboardCourses() {
    const container = getElement("dashboardCourses");

    if (appData.courses.length === 0) {
        container.innerHTML = '<p class="empty-state">No courses added yet.</p>';
        return;
    }

    container.innerHTML = appData.courses.map(course => {
        const sessions = getCourseSessions(course.id);
        const statuses = sessions.flatMap(([, record]) => Object.values(record));
        const rate = getAttendanceRate(statuses);

        return `
            <div class="course-card">
                <div class="course-card-top">
                    <div>
                        <h3>${escapeHTML(course.name)}</h3>
                        <p>${escapeHTML(course.id)} · ${escapeHTML(course.time)}</p>
                    </div>
                    <span class="badge">${rate}%</span>
                </div>
                <div class="progress-track"><span style="width: ${rate}%"></span></div>
                <p>${sessions.length} sessions recorded</p>
            </div>
        `;
    }).join("");
}

function renderRecentAttendance() {
    const recentSessions = Object.entries(appData.records)
        .sort(([keyA], [keyB]) => keyB.localeCompare(keyA))
        .slice(0, 5);

    const container = getElement("recentAttendance");

    if (recentSessions.length === 0) {
        container.innerHTML = '<p class="empty-state">No attendance sessions recorded yet.</p>';
        return;
    }

    container.innerHTML = recentSessions.map(([key, record]) => {
        const [courseId, date] = key.split("|");
        const statuses = Object.values(record);
        const attended = statuses.filter(status =>
            status === "Present" || status === "Late"
        ).length;

        return `
            <div class="recent-row">
                <div>
                    <strong>${escapeHTML(getCourseName(courseId))}</strong>
                    <small>${escapeHTML(date)}</small>
                </div>
                <span class="badge">${attended}/${statuses.length} present</span>
            </div>
        `;
    }).join("");
}

function renderClassInformation() {
    const information = [
        ["Teacher", appData.teacher],
        ["Department", appData.department],
        ["Semester", appData.semester]
    ];

    getElement("classInformation").innerHTML = information.map(([label, value]) => `
        <div class="summary-card">
            <span>${escapeHTML(label)}</span>
            <strong>${escapeHTML(value)}</strong>
        </div>
    `).join("");
}

// ------------------------------------------------------------
// 5. Student management
// ------------------------------------------------------------

function renderStudents() {
    const searchTerm = getElement("studentSearch").value.trim().toLowerCase();

    const filteredStudents = appData.students.filter(student => {
        const searchableText = `${student.name} ${student.id}`.toLowerCase();
        return searchableText.includes(searchTerm);
    });

    getElement("studentCountBadge").textContent = `${appData.students.length} students`;

    if (filteredStudents.length === 0) {
        getElement("studentsTableBody").innerHTML =
            '<tr><td colspan="4" class="empty-state">No matching students found.</td></tr>';
        return;
    }

    getElement("studentsTableBody").innerHTML = filteredStudents.map(student => `
        <tr>
            <td>
                <div class="student-cell">
                    <div class="mini-avatar">${getInitials(student.name)}</div>
                    <strong>${escapeHTML(student.name)}</strong>
                </div>
            </td>
            <td>${escapeHTML(student.id)}</td>
            <td>${escapeHTML(student.department)}</td>
            <td>
                <button class="button button-danger" data-remove-student="${escapeHTML(student.id)}">
                    Remove
                </button>
            </td>
        </tr>
    `).join("");
}

function addStudent() {
    showModal("Add student", [
        { name: "name", label: "Student name", placeholder: "Enter student name" },
        { name: "id", label: "Student ID", placeholder: "e.g. NU-2309" },
        {
            name: "department",
            label: "Department",
            value: appData.department
        }
    ], formValues => {
        const studentId = formValues.id.trim();

        if (appData.students.some(student => student.id === studentId)) {
            showToast("This student ID already exists.");
            return false;
        }

        appData.students.push({
            id: studentId,
            name: formValues.name.trim(),
            department: formValues.department.trim()
        });

        return true;
    });
}

function removeStudent(studentId) {
    const confirmed = confirm("Remove this student and their attendance entries?");
    if (!confirmed) return;

    appData.students = appData.students.filter(student => student.id !== studentId);

    Object.values(appData.records).forEach(session => {
        delete session[studentId];
    });

    saveData();
    renderApplication();
    showToast("Student removed.");
}

// ------------------------------------------------------------
// 6. Course management
// ------------------------------------------------------------

function renderCourses() {
    getElement("courseCountBadge").textContent = `${appData.courses.length} courses`;

    if (appData.courses.length === 0) {
        getElement("coursesTableBody").innerHTML =
            '<tr><td colspan="6" class="empty-state">No courses added yet.</td></tr>';
        return;
    }

    getElement("coursesTableBody").innerHTML = appData.courses.map(course => `
        <tr>
            <td><strong>${escapeHTML(course.name)}</strong></td>
            <td>${escapeHTML(course.id)}</td>
            <td>${escapeHTML(course.department)}</td>
            <td>${escapeHTML(course.time)}</td>
            <td>${appData.students.length}</td>
            <td>
                <button class="button button-danger" data-remove-course="${escapeHTML(course.id)}">
                    Remove
                </button>
            </td>
        </tr>
    `).join("");
}

function addCourse() {
    showModal("Add course", [
        { name: "name", label: "Course name", placeholder: "e.g. Database Management" },
        { name: "id", label: "Course code", placeholder: "e.g. CSE-604" },
        { name: "department", label: "Department", value: appData.department },
        { name: "time", label: "Class time", placeholder: "e.g. Tue · 10:00–11:30 AM" }
    ], formValues => {
        const courseId = formValues.id.trim();

        if (appData.courses.some(course => course.id === courseId)) {
            showToast("This course code already exists.");
            return false;
        }

        appData.courses.push({
            id: courseId,
            name: formValues.name.trim(),
            department: formValues.department.trim(),
            time: formValues.time.trim()
        });

        return true;
    });
}

function removeCourse(courseId) {
    const confirmed = confirm("Remove this course and all its attendance records?");
    if (!confirmed) return;

    appData.courses = appData.courses.filter(course => course.id !== courseId);

    Object.keys(appData.records).forEach(key => {
        if (key.startsWith(`${courseId}|`)) {
            delete appData.records[key];
        }
    });

    saveData();
    renderApplication();
    showToast("Course removed.");
}

function populateCourseDropdowns() {
    ["attendanceCourse", "reportCourse"].forEach(elementId => {
        const select = getElement(elementId);
        const previousValue = select.value;

        select.innerHTML = appData.courses.map(course => `
            <option value="${escapeHTML(course.id)}">
                ${escapeHTML(course.name)} (${escapeHTML(course.id)})
            </option>
        `).join("");

        if (appData.courses.some(course => course.id === previousValue)) {
            select.value = previousValue;
        }
    });
}

// ------------------------------------------------------------
// 7. Attendance taking and saving
// ------------------------------------------------------------

function getAttendanceKey() {
    const courseId = getElement("attendanceCourse").value;
    const date = getElement("attendanceDate").value;
    return `${courseId}|${date}`;
}

function loadAttendance() {
    const courseId = getElement("attendanceCourse").value;
    const date = getElement("attendanceDate").value || getToday();

    getElement("attendanceDate").value = date;

    if (!courseId) {
        attendanceDraft = {};
        getElement("attendanceTableBody").innerHTML =
            '<tr><td colspan="4" class="empty-state">Add a course before taking attendance.</td></tr>';
        return;
    }

    const savedSession = appData.records[`${courseId}|${date}`] || {};
    attendanceDraft = { ...savedSession };

    getElement("attendanceHeading").textContent = `${getCourseName(courseId)} · ${date}`;
    getElement("attendanceStudentCount").textContent = `${appData.students.length} students`;

    renderAttendanceTable();
}

function renderAttendanceTable() {
    const tableBody = getElement("attendanceTableBody");

    if (appData.students.length === 0) {
        tableBody.innerHTML =
            '<tr><td colspan="4" class="empty-state">Add students before taking attendance.</td></tr>';
        return;
    }

    tableBody.innerHTML = appData.students.map(student => {
        const status = attendanceDraft[student.id] || "Not marked";
        const statusClass = getStatusClass(status);

        return `
            <tr>
                <td>
                    <div class="student-cell">
                        <div class="mini-avatar">${getInitials(student.name)}</div>
                        <strong>${escapeHTML(student.name)}</strong>
                    </div>
                </td>
                <td>${escapeHTML(student.id)}</td>
                <td><span class="status ${statusClass}">${status}</span></td>
                <td>
                    <div class="action-group">
                        <button class="action-button action-present"
                            data-attendance="${student.id}" data-status="Present">Present</button>
                        <button class="action-button action-absent"
                            data-attendance="${student.id}" data-status="Absent">Absent</button>
                        <button class="action-button action-late"
                            data-attendance="${student.id}" data-status="Late">Late</button>
                    </div>
                </td>
            </tr>
        `;
    }).join("");
}

function getStatusClass(status) {
    const classNames = {
        Present: "status-present",
        Absent: "status-absent",
        Late: "status-late"
    };

    return classNames[status] || "status-pending";
}

function setStudentAttendance(studentId, status) {
    attendanceDraft[studentId] = status;
    renderAttendanceTable();
}

function markAllStudentsPresent() {
    appData.students.forEach(student => {
        attendanceDraft[student.id] = "Present";
    });

    renderAttendanceTable();
}

function saveAttendance() {
    const courseId = getElement("attendanceCourse").value;
    const date = getElement("attendanceDate").value;

    if (!courseId || !date) {
        showToast("Select a course and date first.");
        return;
    }

    const allStudentsMarked = appData.students.every(student =>
        ["Present", "Absent", "Late"].includes(attendanceDraft[student.id])
    );

    if (!allStudentsMarked) {
        showToast("Please mark every student before saving.");
        return;
    }

    appData.records[getAttendanceKey()] = { ...attendanceDraft };

    saveData();
    renderApplication();
    loadAttendance();
    showToast("Attendance saved successfully.");
}

// ------------------------------------------------------------
// 8. Semester attendance reports
// ------------------------------------------------------------

function getStudentReport(student, sessions) {
    const statuses = sessions
        .map(([, session]) => session[student.id])
        .filter(Boolean);

    const present = statuses.filter(status => status === "Present").length;
    const absent = statuses.filter(status => status === "Absent").length;
    const late = statuses.filter(status => status === "Late").length;

    return {
        student,
        present,
        absent,
        late,
        total: statuses.length,
        rate: getAttendanceRate(statuses)
    };
}

function renderReport() {
    const courseId = getElement("reportCourse").value || appData.courses[0]?.id;

    if (!courseId) {
        getElement("reportSummary").innerHTML =
            '<p class="empty-state">Add a course to see attendance reports.</p>';
        getElement("reportTableBody").innerHTML = "";
        getElement("attendanceBars").innerHTML = "";
        getElement("reportSessionCount").textContent = "0 sessions";
        return;
    }

    const sessions = getCourseSessions(courseId);
    const studentReports = appData.students.map(student =>
        getStudentReport(student, sessions)
    );

    const totals = studentReports.reduce((summary, report) => ({
        present: summary.present + report.present,
        absent: summary.absent + report.absent,
        late: summary.late + report.late
    }), { present: 0, absent: 0, late: 0 });

    const totalEntries = totals.present + totals.absent + totals.late;
    const overallRate = totalEntries
        ? Math.round(((totals.present + totals.late) / totalEntries) * 100)
        : 0;

    getElement("reportSummary").innerHTML = [
        ["Sessions recorded", sessions.length],
        ["Overall attendance", `${overallRate}%`],
        ["Attendance entries", totalEntries]
    ].map(([label, value]) => `
        <div class="summary-card">
            <span>${label}</span>
            <strong>${value}</strong>
        </div>
    `).join("");

    getElement("reportSessionCount").textContent = `${sessions.length} sessions`;

    const filter = getElement("reportFilter").value;
    const visibleReports = studentReports.filter(report =>
        filter !== "low" || (report.total > 0 && report.rate < 75)
    );

    if (visibleReports.length === 0) {
        getElement("reportTableBody").innerHTML =
            '<tr><td colspan="5" class="empty-state">No students match this filter.</td></tr>';
    } else {
        getElement("reportTableBody").innerHTML = visibleReports.map(report => `
            <tr>
                <td>
                    <div class="student-cell">
                        <div class="mini-avatar">${getInitials(report.student.name)}</div>
                        <strong>${escapeHTML(report.student.name)}</strong>
                    </div>
                </td>
                <td>${report.present}</td>
                <td>${report.absent}</td>
                <td>${report.late}</td>
                <td>
                    <span class="status ${report.rate >= 75 ? "status-present" : "status-absent"}">
                        ${report.total ? `${report.rate}%` : "No data"}
                    </span>
                </td>
            </tr>
        `).join("");
    }

    renderAttendanceBars(totals, totalEntries);
}

function renderAttendanceBars(totals, totalEntries) {
    const categories = [
        ["Present", totals.present],
        ["Absent", totals.absent],
        ["Late", totals.late]
    ];

    getElement("attendanceBars").innerHTML = categories.map(([label, value]) => {
        const percentage = totalEntries ? (value / totalEntries) * 100 : 0;

        return `
            <div class="bar-row">
                <span>${label}</span>
                <div class="bar-track"><span style="width: ${percentage}%"></span></div>
                <strong>${value}</strong>
            </div>
        `;
    }).join("");
}

// ------------------------------------------------------------
// 9. Reusable modal form
// ------------------------------------------------------------

function showModal(title, fields, onSave) {
    const fieldMarkup = fields.map(field => `
        <label class="field">
            <span>${escapeHTML(field.label)}</span>
            <input
                name="${escapeHTML(field.name)}"
                value="${escapeHTML(field.value || "")}"
                placeholder="${escapeHTML(field.placeholder || "")}"
                required
            >
        </label>
    `).join("");

    getElement("modalContainer").innerHTML = `
        <div class="modal-backdrop" id="modalBackdrop">
            <form class="modal" id="modalForm">
                <h2>${escapeHTML(title)}</h2>
                ${fieldMarkup}
                <div class="modal-actions">
                    <button type="button" id="cancelModal" class="button button-outline">Cancel</button>
                    <button type="submit" class="button button-primary">Save</button>
                </div>
            </form>
        </div>
    `;

    getElement("cancelModal").addEventListener("click", closeModal);

    getElement("modalBackdrop").addEventListener("click", event => {
        if (event.target.id === "modalBackdrop") closeModal();
    });

    getElement("modalForm").addEventListener("submit", event => {
        event.preventDefault();

        const formData = new FormData(event.currentTarget);
        const values = Object.fromEntries(formData.entries());
        const wasSaved = onSave(values);

        if (wasSaved !== false) {
            closeModal();
            saveData();
            renderApplication();
            showToast("Saved successfully.");
        }
    });
}

function closeModal() {
    getElement("modalContainer").innerHTML = "";
}

// ------------------------------------------------------------
// 10. Event listeners and application startup
// ------------------------------------------------------------

function setupEventListeners() {
    getElement("loginForm").addEventListener("submit", handleLogin);
    getElement("logoutButton").addEventListener("click", handleLogout);

    getElement("studentSearch").addEventListener("input", renderStudents);
    getElement("addStudentButton").addEventListener("click", addStudent);
    getElement("addCourseButton").addEventListener("click", addCourse);

    getElement("attendanceCourse").addEventListener("change", loadAttendance);
    getElement("attendanceDate").addEventListener("change", loadAttendance);
    getElement("loadAttendanceButton").addEventListener("click", loadAttendance);
    getElement("markAllPresentButton").addEventListener("click", markAllStudentsPresent);
    getElement("saveAttendanceButton").addEventListener("click", saveAttendance);

    getElement("reportCourse").addEventListener("change", renderReport);
    getElement("reportFilter").addEventListener("change", renderReport);
    getElement("printReportButton").addEventListener("click", () => window.print());

    // Event delegation keeps table buttons working after the tables re-render.
    document.addEventListener("click", event => {
        const attendanceButton = event.target.closest("[data-attendance]");
        const removeStudentButton = event.target.closest("[data-remove-student]");
        const removeCourseButton = event.target.closest("[data-remove-course]");

        if (attendanceButton) {
            setStudentAttendance(
                attendanceButton.dataset.attendance,
                attendanceButton.dataset.status
            );
        }

        if (removeStudentButton) {
            removeStudent(removeStudentButton.dataset.removeStudent);
        }

        if (removeCourseButton) {
            removeCourse(removeCourseButton.dataset.removeCourse);
        }
    });
}

function renderApplication() {
    populateCourseDropdowns();
    renderDashboard();
    renderStudents();
    renderCourses();
    renderReport();
}

function initializeApplication() {
    getElement("attendanceDate").value = getToday();
    setupNavigation();
    setupEventListeners();
}

document.addEventListener("DOMContentLoaded", initializeApplication);
