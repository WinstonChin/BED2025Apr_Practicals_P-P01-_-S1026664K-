const apiBaseUrl = "http://localhost:3000";
const studentDetailsDiv = document.getElementById("studentDetails");
const messageDiv = document.getElementById("message");

// Extract student ID from URL
function getStudentIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// Fetch and display student details
async function fetchStudentDetails() {
  const studentId = getStudentIdFromUrl();
  if (!studentId) {
    studentDetailsDiv.textContent = "No student ID found in URL.";
    return;
  }

  try {
    const response = await fetch(`${apiBaseUrl}/students/${studentId}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch student.");
    }

    const student = await response.json();
    studentDetailsDiv.innerHTML = `
      <h2>${student.name}</h2>
      <p><strong>Address:</strong> ${student.address}</p>
      <p><strong>ID:</strong> ${student.id}</p>
    `;
  } catch (error) {
    console.error("Error loading student:", error);
    messageDiv.textContent = `Error: ${error.message}`;
  }
}

// Load when page is ready
fetchStudentDetails();
