const editStudentForm = document.getElementById("editStudentForm");
const loadingMessageDiv = document.getElementById("loadingMessage");
const messageDiv = document.getElementById("message");
const studentIdInput = document.getElementById("studentId");
const editNameInput = document.getElementById("editName");
const editAddressInput = document.getElementById("editAddress");

const apiBaseUrl = "http://localhost:3000";

function getStudentIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

async function fetchStudentData(studentId) {
  try {
    const response = await fetch(`${apiBaseUrl}/students/${studentId}`);
    if (!response.ok) {
      const errorBody = response.headers.get("content-type")?.includes("application/json")
        ? await response.json()
        : { message: response.statusText };
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorBody.message}`);
    }
    const student = await response.json();
    return student;
  } catch (error) {
    console.error("Error fetching student data:", error);
    messageDiv.textContent = `Failed to load student data: ${error.message}`;
    messageDiv.style.color = "red";
    loadingMessageDiv.textContent = "";
    return null;
  }
}

function populateForm(student) {
  studentIdInput.value = student.id;
  editNameInput.value = student.name;
  editAddressInput.value = student.address;
  loadingMessageDiv.style.display = "none";
  editStudentForm.style.display = "block";
}

const studentIdToEdit = getStudentIdFromUrl();

if (studentIdToEdit) {
  fetchStudentData(studentIdToEdit).then((student) => {
    if (student) {
      populateForm(student);
    } else {
      loadingMessageDiv.textContent = "Student not found or failed to load.";
      messageDiv.textContent = "Could not find the student to edit.";
      messageDiv.style.color = "red";
    }
  });
} else {
  loadingMessageDiv.textContent = "No student ID specified for editing.";
  messageDiv.textContent = "Please provide a student ID in the URL (e.g., edit-student.html?id=1).";
  messageDiv.style.color = "orange";
}

editStudentForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const updatedName = editNameInput.value.trim();
  const updatedAddress = editAddressInput.value.trim();
  const studentId = studentIdInput.value;

  const updatedStudent = {
    name: updatedName,
    address: updatedAddress,
  };

  try {
    const response = await fetch(`${apiBaseUrl}/students/${studentId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedStudent),
    });

    if (response.status === 200) {
      messageDiv.textContent = "Student updated successfully!";
      messageDiv.style.color = "green";
      setTimeout(() => {
        window.location.href = "students.html";
      }, 1500);
    } else if (response.status === 400) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Validation error");
    } else if (response.status === 404) {
      throw new Error("Student not found");
    } else {
      throw new Error("Unexpected server error");
    }
  } catch (error) {
    console.error("Update failed:", error);
    messageDiv.textContent = `Update failed: ${error.message}`;
    messageDiv.style.color = "red";
  }
});
