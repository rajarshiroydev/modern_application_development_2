export default {
  template: `
    <div>
    <h1 class="display-1">Library</h1>
    <div v-if="issuedBooks.length > 0" class="row">
      <div v-for="item in issuedBooks" :key="item.id" class="col-md-4 mb-4">
        <div class="card">
          <div class="card-body">
            <h5 class="card-title">{{ item.book_name }}</h5>
            <p class="card-text">
              <strong>Author:</strong> {{ item.author }}<br>
              <strong>Issue Date:</strong> {{ formatDate(item.date_issued) }}<br>
              <strong>Return Date:</strong> {{ formatDate(item.return_date) }}
            </p>
            <div class="d-flex justify-content-between">
              <button class="btn btn-success" @click="readBook(item.book_id)">
                <i class="fas fa-book-reader"></i> Read
              </button>
              <button class="btn btn-warning" @click="giveFeedback(item.book_id)">
                <i class="fas fa-star"></i> Feedback
              </button>
              <button class="btn btn-danger" @click="returnBook(item.book_id)">
                <i class="fas fa-ban"></i> Return
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <h1 class="display-1">No Books in Library Currently</h1>
      <hr>
    </div>
  </div>
  `,
  data() {
    return {
      issuedBooks: [],
    };
  },
  mounted() {
    this.fetchIssuedBooks();
  },
  methods: {
    async fetchIssuedBooks() {
      try {
        const response = await fetch("/issued_books_user", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("access_token")}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          this.issuedBooks = data.issuedBooks;
        } else {
          console.error(
            "Error fetching issued books:",
            data.message || "Unknown error"
          );
        }
      } catch (error) {
        console.error("Error fetching issued books:", error);
      }
    },
    formatDate(dateString) {
      const options = { year: "numeric", month: "long", day: "numeric" };
      return new Date(dateString).toLocaleDateString(undefined, options);
    },
    readBook(bookId) {
      this.$router.push(`/book/${bookId}/show`);
    },
    giveFeedback(bookId) {
      this.$router.push(`/give_feedbacks_data/${bookId}`);
    },
    async returnBook(bookId) {
      try {
        const response = await fetch(`/return_book/${bookId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${sessionStorage.getItem("access_token")}`,
          },
        });
        if (response.ok) {
          alert("Book returned successfully");
          this.fetchIssuedBooks(); // Refresh the list
        } else {
          const data = await response.json();
          console.error(
            "Error returning book:",
            data.message || "Unknown error"
          );
          alert("Failed to return book.");
        }
      } catch (error) {
        console.error("Error returning book:", error);
        alert("An error occurred while returning the book.");
      }
    },
  },
};
