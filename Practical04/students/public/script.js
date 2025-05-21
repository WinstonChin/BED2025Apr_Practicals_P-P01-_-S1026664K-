const studentsListDiv = document.getElementById("studentsList");
const fetchStudentsBtn = document.getElementById("fetchStudentsBtn");
const messageDiv = document.getElementById("message");
const apiBaseUrl = "http://localhost:3000";

// Function to fetch students from the API and display them
async function fetchStudents() {
  try {
    studentsListDiv.innerHTML = "Loading students...";
    messageDiv.textContent = "";

    const response = await fetch(`${apiBaseUrl}/students`);

    if (!response.ok) {
      const errorBody = response.headers
        .get("content-type")
        ?.includes("application/json")
        ? await response.json()
        : { message: response.statusText };
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorBody.message}`
      );
    }

    const students = await response.json();
    studentsListDiv.innerHTML = "";

    if (students.length === 0) {
      studentsListDiv.innerHTML = "<p>No students found.</p>";
    } else {
      students.forEach((student) => {
        const studentElement = document.createElement("div");
        studentElement.classList.add("student-item");
        studentElement.setAttribute("data-student-id", student.id);
        studentElement.innerHTML = `
          <h3>${student.name}</h3>
          <p>Address: ${student.address}</p>
          <p>ID: ${student.id}</p>
          <button onclick="viewStudentDetails(${student.id})">View Details</button>
          <button onclick="editStudent(${student.id})">Edit</button>
          <button class="delete-btn" data-id="${student.id}">Delete</button>
        `;
        studentsListDiv.appendChild(studentElement);
      });

      document.querySelectorAll(".delete-btn").forEach((button) => {
        button.addEventListener("click", handleDeleteClick);
      });
    }
  } catch (error) {
    console.error("Error fetching students:", error);
    studentsListDiv.innerHTML = `<p style="color: red;">Failed to load students: ${error.message}</p>`;
  }
}

// Redirect to view page
function viewStudentDetails(studentId) {
  window.location.href = `view-student.html?id=${studentId}`;
}

// Redirect to edit page
function editStudent(studentId) {
  window.location.href = `edit-student.html?id=${studentId}`;
}

// Handle delete
async function handleDeleteClick(event) {
  const studentId = event.target.getAttribute("data-id");

  if (!confirm(`Are you sure you want to delete student ID: ${studentId}?`)) {
    return;
  }

  try {
    const response = await fetch(`${apiBaseUrl}/students/${studentId}`, {
      method: "DELETE",
    });

    if (response.status === 204) {
      const studentElement = event.target.closest(".student-item");
      if (studentElement) {
        studentElement.remove();
      }
      messageDiv.textContent = `Student ID ${studentId} deleted successfully.`;
      messageDiv.style.color = "green";
    } else {
      const errorBody = response.headers
        .get("content-type")
        ?.includes("application/json")
        ? await response.json()
        : { message: response.statusText };
      throw new Error(errorBody.message || "Unknown error during delete");
    }
  } catch (error) {
    console.error("Error deleting student:", error);
    messageDiv.textContent = `Failed to delete student ID ${studentId}: ${error.message}`;
    messageDiv.style.color = "red";
  }
}

// Load students initially
fetchStudentsBtn.addEventListener("click", fetchStudents);
// Or call fetchStudents(); on load if preferred
