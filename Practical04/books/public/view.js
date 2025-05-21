const apiBaseUrl = "http://localhost:3000";
const bookDetailsDiv = document.getElementById("bookDetails");
const messageDiv = document.getElementById("message");

// Helper to extract book ID from URL
function getBookIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// Fetch and display book details
async function fetchBookDetails() {
  const bookId = getBookIdFromUrl();
  if (!bookId) {
    bookDetailsDiv.textContent = "No book ID found in URL.";
    return;
  }

  try {
    const response = await fetch(`${apiBaseUrl}/books/${bookId}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch book.");
    }

    const book = await response.json();
    bookDetailsDiv.innerHTML = `
      <h2>${book.title}</h2>
      <p><strong>Author:</strong> ${book.author}</p>
      <p><strong>ID:</strong> ${book.id}</p>
    `;
  } catch (error) {
    console.error("Error loading book:", error);
    messageDiv.textContent = `Error: ${error.message}`;
  }
}

// Load on page
fetchBookDetails();
